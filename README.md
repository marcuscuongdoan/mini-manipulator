# Mini Manipulator

A React Three Fiber simulation app for a mobile manipulator robot, featuring two interactive pages: a differential-drive mobile base simulator and a 6-DOF forward kinematics visualizer.

## Tech Stack

- **React 18** + **TypeScript** — UI framework
- **Vite** — build tool with HMR
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — R3F helpers (OrbitControls, Grid, Environment, ContactShadows, useGLTF)
- **three** — underlying 3D engine
- **react-router-dom v6** — client-side routing (HashRouter)
- **leva** — floating control panels

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Place the robot GLB model

Download the Franka mobile manipulator GLB and save it as:

```
public/robot.glb
```

Without this file both pages will show a wireframe placeholder instead of the real robot.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Pages

### Mobile Base (`/`)

Simulates a differential-drive mobile base controlled via the keyboard.

| Key | Action |
|-----|--------|
| `↑` | Forward |
| `↓` | Backward |
| `←` | Rotate left |
| `→` | Rotate right |

**Features:**
- Ramp speed profile — velocity accelerates and decelerates smoothly using a configurable acceleration value; the base never exceeds the specified maximum velocity
- Trajectory trail drawn via direct `BufferGeometry` attribute updates (zero GC per frame, up to 1 000 stored points)
- HUD overlay (bottom-left) — live position (X, Z), heading (°), linear velocity (m/s), angular velocity (rad/s)
- Renderer stats panel (bottom-right) — draw calls, geometries, triangles, JS heap memory
- **Drive Config panel** (Leva, top-right) — tune all parameters without reloading:

| Parameter | Default | Range |
|-----------|---------|-------|
| Max Speed | 3 m/s | 0.5 – 10 |
| Max ω | 1.5 rad/s | 0.3 – 5 |
| Lin Accel | 4 m/s² | 1 – 20 |
| Ang Accel | 4 rad/s² | 1 – 20 |
| Trail Color | `#00e5ff` | color picker |

### Manipulator (`/manipulator`)

Forward kinematics visualizer for the 6-DOF Franka Panda arm mounted on the base.

**Features:**
- **Joints panel** (Leva, top-right) — 7 sliders with Franka joint limits:

| Joint | Min (rad) | Max (rad) |
|-------|-----------|-----------|
| 1 | −2.897 | +2.897 |
| 2 | −1.763 | +1.763 |
| 3 | −2.897 | +2.897 |
| 4 | −3.072 | −0.070 |
| 5 | −2.897 | +2.897 |
| 6 | −0.017 | +3.753 |
| 7 | −2.897 | +2.897 |

- Auto-detects joint nodes from the GLB scene graph by trying common naming conventions (`panda_link1`–`7`, `Link1`–`7`, `joint1`–`7`, etc.)
- Detected node names shown in the bottom-left info panel
- All scene node names logged to the browser console on load for debugging

#### If joints don't move

Open DevTools → Console and look for `[ArmRobot] Scene nodes:`. Identify the 7 joint node names, then add a new entry to `JOINT_PATTERNS` in [src/pages/Manipulator/ArmRobot.tsx](src/pages/Manipulator/ArmRobot.tsx):

```ts
const JOINT_PATTERNS = [
  ['yourJoint1', 'yourJoint2', ..., 'yourJoint7'],  // ← add here
  ...
]
```

## Project Structure

```
src/
├── App.tsx                          # HashRouter + NavBar + routes
├── robotState.ts                    # Shared mutable state (HUD + renderer stats)
├── hooks/
│   └── useKeyboard.ts               # Arrow-key state via ref (no re-renders)
├── components/
│   ├── NavBar.tsx                   # Top navigation bar
│   └── ModelErrorBoundary.tsx       # Graceful fallback if GLB fails to load
└── pages/
    ├── MobileBase/
    │   ├── index.tsx                # Canvas + HUD + stats overlays + Leva panel
    │   ├── DriveScene.tsx           # Drive physics (useFrame) + StatsCollector
    │   ├── BaseRobot.tsx            # GLB loader, attaches to drive group ref
    │   └── Trail.tsx                # Trajectory trail (imperative BufferGeometry)
    └── Manipulator/
        ├── index.tsx                # Canvas + Leva joint sliders + NodeInfoPanel
        └── ArmRobot.tsx             # GLB loader, joint node detection, FK application
```

## Build

```bash
npm run build   # production bundle → dist/
npm run preview # serve the production build locally
```
