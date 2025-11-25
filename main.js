import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer;
let camera;

let cube2x2Group;
let cube3x3Group;
let currentCubeType = "2x2";

let cornerCubes2x2 = [];
let cornerCubes3x3 = [];

let isAnimating = false;
const rotationAngle = Math.PI / 2;

const colors = {
  RED: 0xc41e3a,
  PURPLE: 0x8c42bf,
  BLUE: 0x0051ba,
  GREEN: 0x009e60,
  WHITE: 0xffffff,
  YELLOW: 0xffd500,
  BLACK_CORE: 0x111111,
  BACKGROUND: 0xcccccc,
};

const rubikMaterials = [
  new THREE.MeshLambertMaterial({ color: colors.RED }),
  new THREE.MeshLambertMaterial({ color: colors.PURPLE }),
  new THREE.MeshLambertMaterial({ color: colors.YELLOW }),
  new THREE.MeshLambertMaterial({ color: colors.WHITE }),
  new THREE.MeshLambertMaterial({ color: colors.BLUE }),
  new THREE.MeshLambertMaterial({ color: colors.GREEN }),
];
const blackCoreMaterial = new THREE.MeshLambertMaterial({
  color: colors.BLACK_CORE,
});

function getLayerPieces(cubePieces, axis, sign, is3x3) {
  const pieces = [];
  const threshold = is3x3 ? 1.0 : 1.5;
  const centerThreshold = 0.05;

  for (const cube of cubePieces) {
    let match = false;

    if (axis === "z") {
      if (sign > 0 && cube.position.z > threshold) match = true;
      if (sign < 0 && cube.position.z < -threshold) match = true;
      if (sign === 0 && is3x3 && Math.abs(cube.position.z) < centerThreshold)
        match = true;
    } else if (axis === "y") {
      if (sign > 0 && cube.position.y > threshold) match = true;
      if (sign < 0 && cube.position.y < -threshold) match = true;
      if (sign === 0 && is3x3 && Math.abs(cube.position.y) < centerThreshold)
        match = true;
    } else if (axis === "x") {
      if (sign > 0 && cube.position.x > threshold) match = true;
      if (sign < 0 && cube.position.x < -threshold) match = true;
      if (sign === 0 && is3x3 && Math.abs(cube.position.x) < centerThreshold)
        match = true;
    }

    if (match) {
      pieces.push(cube);
    }
  }
  return pieces;
}

function rotateLayerAndReassign(axis, radians, sign) {
  if (isAnimating) return;
  isAnimating = true;

  const is3x3 = currentCubeType === "3x3";
  const cubeGroup = is3x3 ? cube3x3Group : cube2x2Group;
  const cubePieces = is3x3 ? cornerCubes3x3 : cornerCubes2x2;

  const piecesToRotate = getLayerPieces(cubePieces, axis, sign, is3x3);

  if (piecesToRotate.length === 0) {
    isAnimating = false;
    return;
  }

  const rotationGroup = new THREE.Group();
  cubeGroup.add(rotationGroup);

  for (const piece of piecesToRotate) {
    rotationGroup.attach(piece);
  }

  const rotationData = { angle: 0 };
  const duration = 300;

  new TWEEN.Tween(rotationData)
    .to({ angle: radians }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      rotationGroup.rotation[axis] = rotationData.angle;
    })
    .onComplete(() => {
      for (const piece of piecesToRotate) {
        cubeGroup.attach(piece);
      }

      cubeGroup.remove(rotationGroup);
      isAnimating = false;
    })
    .start();
}

init();
setupControls();
animationLoop();

function Cubo(px, py, pz, sx, sy, sz, parent, materials) {
  let geometry = new THREE.BoxGeometry(sx, sy, sz);
  let mesh = new THREE.Mesh(geometry, materials);
  mesh.position.set(px, py, pz);
  parent.add(mesh);
  return mesh;
}

function create2x2Cube(cubeSize, margin, parentGroup) {
  const finalOffset = 1.6;
  const pieces = [];

  const positions = [
    { x: finalOffset, y: finalOffset, z: finalOffset },
    { x: -finalOffset, y: finalOffset, z: finalOffset },
    { x: -finalOffset, y: -finalOffset, z: finalOffset },
    { x: finalOffset, y: -finalOffset, z: finalOffset },
    { x: finalOffset, y: finalOffset, z: -finalOffset },
    { x: -finalOffset, y: finalOffset, z: -finalOffset },
    { x: -finalOffset, y: -finalOffset, z: -finalOffset },
    { x: finalOffset, y: -finalOffset, z: -finalOffset },
  ];

  for (const p of positions) {
    pieces.push(Cubo(p.x, p.y, p.z, 3, 3, 3, parentGroup, rubikMaterials));
  }
  return pieces;
}

function create3x3Cube(cubeSize, margin, parentGroup) {
  const step = 1.1;
  const positionsValues = [-step, 0, step];
  const pieces = [];

  for (const x of positionsValues) {
    for (const y of positionsValues) {
      for (const z of positionsValues) {
        const px = Math.abs(x) < 0.001 ? 0 : x;
        const py = Math.abs(y) < 0.001 ? 0 : y;
        const pz = Math.abs(z) < 0.001 ? 0 : z;

        const coloredFacesCount = (px !== 0) + (py !== 0) + (pz !== 0);

        let materialsToUse = rubikMaterials;
        if (coloredFacesCount === 0) {
          materialsToUse = blackCoreMaterial;
        }
        pieces.push(
          Cubo(
            px,
            py,
            pz,
            cubeSize,
            cubeSize,
            cubeSize,
            parentGroup,
            materialsToUse
          )
        );
      }
    }
  }
  return pieces;
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.BACKGROUND);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(7, 5, 7);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const cubeSize = 1;
  const targetMargin = 0.1;

  cube2x2Group = new THREE.Group();
  scene.add(cube2x2Group);
  cornerCubes2x2 = create2x2Cube(cubeSize, targetMargin, cube2x2Group);

  cube3x3Group = new THREE.Group();
  cube3x3Group.position.set(0, 0, 0);
  scene.add(cube3x3Group);
  cornerCubes3x3 = create3x3Cube(cubeSize, targetMargin, cube3x3Group);

  cube3x3Group.visible = false;
}

function switchCubeView() {
  if (isAnimating) return;

  if (currentCubeType === "2x2") {
    currentCubeType = "3x3";
    cube2x2Group.visible = false;
    cube3x3Group.visible = true;
    camera.position.set(7, 5, 7);
    camera.lookAt(0, 0, 0);
  } else {
    currentCubeType = "2x2";
    cube2x2Group.visible = true;
    cube3x3Group.visible = false;
    camera.position.set(7, 5, 7);
    camera.lookAt(0, 0, 0);
  }
  setupControls();
}

function createButton(text, clickHandler, color = "#202020") {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.padding = "8px 12px";
  button.style.margin = "4px";
  button.style.cursor = "pointer";
  button.style.backgroundColor = color;
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
  button.addEventListener("click", clickHandler);
  return button;
}

function createSectionTitle(text) {
  const title = document.createElement("h4");
  title.textContent = text;
  title.style.margin = "10px 0 5px 0";
  title.style.color = "#333";
  title.style.borderBottom = "1px solid #ddd";
  title.style.paddingBottom = "3px";
  return title;
}

function setupControls() {
  const existingControls = document.getElementById("controls");
  if (existingControls) {
    existingControls.remove();
  }

  const controlsDiv = document.createElement("div");
  controlsDiv.id = "controls";

  controlsDiv.style.position = "absolute";
  controlsDiv.style.top = "10px";
  controlsDiv.style.right = "10px";
  controlsDiv.style.zIndex = "10";
  controlsDiv.style.fontFamily = "sans-serif";
  controlsDiv.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  controlsDiv.style.padding = "15px";
  controlsDiv.style.borderRadius = "8px";
  controlsDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
  controlsDiv.style.width = "200px";

  const mainTitle = document.createElement("h3");
  mainTitle.textContent = `🕹️ Controles ${currentCubeType.toUpperCase()}`;
  mainTitle.style.margin = "0 0 10px 0";
  controlsDiv.appendChild(mainTitle);

  controlsDiv.appendChild(createSectionTitle("Frontal / Trasera (Z)"));
  controlsDiv.appendChild(
    createButton(
      "Frontal ↻",
      () => rotateLayerAndReassign("z", rotationAngle, 1),
      "#28A745"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Frontal ↺",
      () => rotateLayerAndReassign("z", -rotationAngle, 1),
      "#28A745"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Trasera ↻",
      () => rotateLayerAndReassign("z", rotationAngle, -1),
      "#DC3545"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Trasera ↺",
      () => rotateLayerAndReassign("z", -rotationAngle, -1),
      "#DC3545"
    )
  );

  controlsDiv.appendChild(createSectionTitle("Superior / Inferior (Y)"));
  controlsDiv.appendChild(
    createButton(
      "Superior ↻",
      () => rotateLayerAndReassign("y", rotationAngle, 1),
      "#007BFF"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Superior ↺",
      () => rotateLayerAndReassign("y", -rotationAngle, 1),
      "#007BFF"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Inferior ↻",
      () => rotateLayerAndReassign("y", rotationAngle, -1),
      "#FFC107"
    )
  );
  controlsDiv.appendChild(
    createButton(
      "Inferior ↺",
      () => rotateLayerAndReassign("y", -rotationAngle, -1),
      "#FFC107"
    )
  );

  if (currentCubeType === "3x3") {
    controlsDiv.appendChild(createSectionTitle("Derecha / Izquierda (X)"));
    controlsDiv.appendChild(
      createButton(
        "Derecha ↻",
        () => rotateLayerAndReassign("x", rotationAngle, 1),
        "#6C757D"
      )
    );
    controlsDiv.appendChild(
      createButton(
        "Derecha ↺",
        () => rotateLayerAndReassign("x", -rotationAngle, 1),
        "#6C757D"
      )
    );
    controlsDiv.appendChild(
      createButton(
        "Izquierda ↻",
        () => rotateLayerAndReassign("x", rotationAngle, -1),
        "#6C757D"
      )
    );
    controlsDiv.appendChild(
      createButton(
        "Izquierda ↺",
        () => rotateLayerAndReassign("x", -rotationAngle, -1),
        "#6C757D"
      )
    );

    controlsDiv.appendChild(createSectionTitle("Capas Centrales (M/E/S)"));
    controlsDiv.appendChild(
      createButton(
        "Middle (X) ↻",
        () => rotateLayerAndReassign("x", rotationAngle, 0),
        "#17A2B8"
      )
    );
    controlsDiv.appendChild(
      createButton(
        "Equator (Y) ↻",
        () => rotateLayerAndReassign("y", rotationAngle, 0),
        "#17A2B8"
      )
    );
    controlsDiv.appendChild(
      createButton(
        "Standing (Z) ↻",
        () => rotateLayerAndReassign("z", rotationAngle, 0),
        "#17A2B8"
      )
    );
  }

  document.body.appendChild(controlsDiv);

  createSwitchButton();
}

function createSwitchButton() {
  const existingButton = document.getElementById("switch-btn");
  if (existingButton) existingButton.remove();

  const switchBtn = document.createElement("button");
  switchBtn.id = "switch-btn";
  const targetCube = currentCubeType === "2x2" ? "3x3" : "2x2";
  switchBtn.textContent = `Cambiar a Cubo ${targetCube.toUpperCase()}`;

  switchBtn.style.position = "absolute";
  switchBtn.style.top = "10px";
  switchBtn.style.left = "10px";
  switchBtn.style.zIndex = "10";
  switchBtn.style.padding = "10px 15px";
  switchBtn.style.backgroundColor = "#000000";
  switchBtn.style.color = "#FFFFFF";
  switchBtn.style.border = "none";
  switchBtn.style.borderRadius = "5px";
  switchBtn.style.cursor = "pointer";
  switchBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.4)";

  switchBtn.addEventListener("click", switchCubeView);
  document.body.appendChild(switchBtn);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  TWEEN.update();
  renderer.render(scene, camera);
}
