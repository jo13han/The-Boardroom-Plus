# The Boardroom Plus – Conference Hall MBA Block, GJBC PESU

An interactive WebGL experience built with [Three.js](https://threejs.org/) and Vite.  
The scene recreates a modern meeting space complete with textured furniture, architectural elements, orbit + WASD navigation, lighting controls, and basic interactivity (e.g., reversible ceiling fans).

---

## Table of Contents
- [Demo Preview](#demo-preview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [In-Scene Controls](#in-scene-controls)
- [Key Components](#key-components)
- [Assets & Attribution](#assets--attribution)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)

---

## Demo Preview
Run `npm run dev` and open the provided Vite URL (defaults to `http://localhost:5173`) to explore the scene.

---

## Features
- **Physically Based Environment**
  - Ceramic tile floor uses the full PBR set (albedo, roughness, normal, AO, metallic) with repeat tiling and clearcoat/specularity tweaks for realistic reflections.
  - Four enclosing walls, granite baseboards, metal ceiling panels, and glass columns provide architectural context.
- **Custom Furniture & Props**
  - GLB/GLTF imports for the central table, TV, whiteboard, ceiling fans, and office chairs.
  - Texture overrides (e.g., wooden frames, foam upholstery) applied at runtime via `TextureLoader`.
  - Procedural duplication/placement for chairs arranged around the table.
- **Camera Navigation**
  - OrbitControls for mouse/touch orbiting and zooming.
  - WASD + Spacebar locomotion aligned to the camera heading for first-person exploration.
  - Collision detection keeps the camera inside the room and away from furniture/columns.
- **Dynamic Lighting**
  - Ambient light plus clustered point lights near the ceiling.
  - On-screen UI (HTML sliders) to tune ambient intensity, point-light power, and light falloff distance in real time.
- **Interactive Elements**
  - Raycasting allows users to click ceiling fans; each click toggles spin direction by flipping the stored rotation speed.
- **Responsive Rendering**
  - Canvas resizes with the browser window, preserving aspect ratio and pixel density (up to devicePixelRatio 2).
  - Shadows enabled via `PCFSoftShadowMap`.

---

## Project Structure
```
threejstest/
├── package.json
├── readme.md
├── vite.config.js
├── src/
│   ├── index.html          # Canvas + overlay UI sliders
│   ├── style.css
│   ├── script.js           # All scene setup, interaction, and animation logic
│   ├── table/, frame/, tv/, ceiling_fan/, office_chair/  # Imported GLB/GLTF assets
│   └── textures/           # PBR sets for floor, ceiling, walls, etc.
└── static/                 # Placeholder for additional assets (git-kept)
```

---

## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/en/download/) ≥ 18.0.0 (LTS recommended)
- npm ≥ 9 (bundled with Node 18+)

### Installation
```bash
git clone https://github.com/jo13han/ThreeJS-Project.git
cd ThreeJS-Project
npm install
```

### Development Server
```bash
npm run dev
```
Vite prints the local & network URLs. Open the local URL in a modern browser (Chrome, Edge, Firefox, Safari).

### Production Build
```bash
npm run build
```
The optimized output lands in `dist/`. Deploy that folder to any static host (e.g., Netlify, Vercel, GitHub Pages).

---

## Available Scripts
| Command        | Description |
| -------------- | ----------- |
| `npm run dev`  | Starts Vite in dev mode with hot reloading. |
| `npm run build`| Produces a production-ready bundle in `dist/`. |

---

## In-Scene Controls
| Action                | Input |
| --------------------- | ----- |
| Orbit view            | Mouse / trackpad drag |
| Zoom                  | Scroll / pinch |
| Move forward/back     | `W` / `S` |
| Strafe left/right     | `A` / `D` |
| Raise camera          | `Space` |
| Adjust ambient light  | “Ambient Light” slider |
| Adjust point intensity| “Point Light Intensity” slider |
| Adjust point range    | “Point Light Range” slider |
| Flip fan rotation     | Click a ceiling fan |

Movement and orbiting are clamped to room bounds to prevent going through geometry.

---

## Key Components
- **`createFloor` / `createWalls`** – Build the room shell, apply textures, configure camera bounds.
- **`createTable`, `createWhiteboard`, `createTV`** – Load GLB/GLTF assets, override materials, position against walls.
- **`duplicateChairs`** – Places multiple textured chair clones around the table with even spacing.
- **Lighting Controls** – HTML range inputs update ambient and point lights every frame.
- **WASD Movement System** – Custom camera mover that respects collision volumes and room limits (`moveCamera`, `checkCameraCollisionWithTable`, `checkCameraCollisionWithColumns`).
- **Raycasting Interactions** – Click detection to toggle `userData.rotationSpeed` on fan meshes.

---

## Assets & Attribution
- Furniture/prop GLB files stored in `src/` subfolders were provided by the project author.
- Floor PBR set sourced from Poliigon (`textures/floor/Poliigon_TilesCeramicWhite_6956_*`).
- Acoustic foam, granite, wood, and metal textures located under `src/textures/`.
- Ensure you have the appropriate licenses for any redistributed assets; replace or remove files if unsure.

---

## Troubleshooting
- **Black screen / no models**: Verify asset paths (case-sensitive) and confirm the GLB/texture files exist in `src/`.
- **Lighting sliders unresponsive**: Make sure `index.html`’s control container is still present and script is loaded as `type="module"`.
- **Controls feel “stuck”**: The collision system clamps the camera; move slightly away from furniture or raise the camera (`Space`) to free it.
- **Build errors**: Clear the cache (`rm -rf node_modules .vite`) and reinstall dependencies.

---

## Roadmap Ideas
- Add GUI for toggling different furniture layouts.
- Bake lightmaps or add real-time global illumination (e.g., `LightProbeGenerator`).
- Hook up a physics engine for chair interactions.
- Support mobile touch-stick movement and gyroscope orbiting.

---

Need help or want to contribute? Open an issue or submit a PR in the [GitHub repository](https://github.com/jo13han/ThreeJS-Project). Happy hacking!
