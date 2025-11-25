# Proyecto de Cubo de Rubik Interactivo (Three.js)

Este proyecto implementa un simulador interactivo de los cubos de Rubik **$2 \times 2$** y **$3 \times 3$** utilizando la librería **Three.js** para la representación 3D en el navegador. Las rotaciones de las capas están animadas mediante **Tween.js**.

---

## Características

* **Renderizado 3D:** Uso de Three.js para crear y visualizar los mini-cubos y aplicar colores.
* **Doble Vista:** Permite alternar entre las vistas del Cubo **$2 \times 2$** y **$3 \times 3$**.
* **Rotaciones Animadas:** Las rotaciones de las capas se ejecutan con animaciones suaves gracias a **Tween.js**.
* **Controles Completos:** Interfaz de usuario con botones para realizar todos los movimientos de capa.

---

## Configuración y Ejecución

El proyecto utiliza **Node.js** y **npm** para la gestión de dependencias y **Vite** como servidor de desarrollo.

### 1. Requisitos

Necesitas tener **Node.js** (que incluye npm) instalado en tu sistema.

### 2. Instalación

Clona el repositorio e instala las dependencias:

```bash
# Clona el repositorio
git clone [https://github.com/Estebantrusant/Semana11_IG.git](https://github.com/Estebantrusant/Semana11_IG.git)
cd Semana11_IG

# Instala las dependencias (three, @tweenjs/tween.js, vite)
npm install
```

### 3. Estructura del Proyecto

| Archivo | Descripción |
| :--- | :--- |
| `index.html` | Punto de entrada. Carga `main.js` como un módulo. |
| `main.js` | Contiene toda la lógica de Three.js, la creación de los cubos y las funciones de rotación. |
| `package.json` | Define dependencias y el script de inicio. |
| `.gitignore` | Ignora dependencias (`node_modules`) y archivos de *build*. |

### 4. Ejecución

Para iniciar el servidor de desarrollo local, usa el script `start`:

```bash
npm run start
```

Esto iniciará el servidor **Vite** y te proporcionará una URL local (ej: `http://localhost:5173/`). Abre esta URL en tu navegador.

## Enlace a CodeSandbox

Puedes ver y experimentar con este proyecto directamente en un entorno de desarrollo en línea:

[¡Prueba el Cubo de Rubik aquí!](https://codesandbox.io/p/sandbox/ig2526-s10-esteban-j2sz49)
