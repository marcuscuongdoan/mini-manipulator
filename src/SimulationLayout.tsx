import { useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva'
import { Scene } from './pages/Simulation/Scene'
import MobileBaseOverlay from './pages/MobileBase'
import ManipulatorOverlay from './pages/Manipulator'
import { ENV_PRESETS } from './pages/Simulation/types'
import { driveConfig, armConfig, sceneConfig } from './simConfig'

const FRANKA_LIMITS = [
  { min: -2.897, max:  2.897 },
  { min: -1.763, max:  1.763 },
  { min: -2.897, max:  2.897 },
  { min: -3.072, max: -0.070 },
  { min: -2.897, max:  2.897 },
  { min: -0.017, max:  3.753 },
  { min: -2.897, max:  2.897 },
]

// --- Page-specific Leva panels (conditionally mounted) ---

function DrivePanel() {
  useControls('Drive Config', {
    maxSpeed:   { value: driveConfig.maxSpeed,   min: 0.5, max: 10,  step: 0.5,  label: 'Max Speed (m/s)',    onChange: (v: number) => { driveConfig.maxSpeed   = v } },
    maxOmega:   { value: driveConfig.maxOmega,   min: 0.3, max: 5,   step: 0.1,  label: 'Max ω (rad/s)',      onChange: (v: number) => { driveConfig.maxOmega   = v } },
    linAccel:   { value: driveConfig.linAccel,   min: 1,   max: 20,  step: 0.5,  label: 'Lin Accel (m/s²)',   onChange: (v: number) => { driveConfig.linAccel   = v } },
    angAccel:   { value: driveConfig.angAccel,   min: 1,   max: 20,  step: 0.5,  label: 'Ang Accel (rad/s²)', onChange: (v: number) => { driveConfig.angAccel   = v } },
    trailColor: { value: driveConfig.trailColor,                                  label: 'Trail Color',         onChange: (v: string) => { driveConfig.trailColor = v } },
  })
  return null
}

function ArmPanel() {
  const neutrals = [0, 0, 0, -1.5708, 0, 1.5708, 0]
  useControls('Joints', Object.fromEntries(
    FRANKA_LIMITS.map(({ min, max }, i) => [
      `Joint ${i + 1}`,
      { value: neutrals[i], min, max, step: 0.001,
        onChange: (v: number) => { (armConfig as Record<string, number>)[`j${i + 1}`] = v } },
    ])
  ))

  useControls('Scene', {
    envPreset:     { value: sceneConfig.envPreset,     options: [...ENV_PRESETS],  label: 'Environment',           onChange: (v: string)  => { sceneConfig.envPreset     = v    } },
    envBackground: { value: false,                                                  label: 'Use env as background', onChange: (v: boolean) => { sceneConfig.envBackground = v    } },
    bgColor:       { value: sceneConfig.bgColor,                                   label: 'Background color',      onChange: (v: string)  => { sceneConfig.bgColor       = v    },
                     render: get => !get('Scene.envBackground') },
  })
  return null
}

// --- Layout ---

export function SimulationLayout() {
  const [foundNodes, setFoundNodes] = useState<string[]>([])
  const onNodesFound = useCallback((names: string[]) => setFoundNodes(names), [])
  const location = useLocation()
  const isManipulator = location.pathname === '/manipulator'

  return (
    <>
      {/* Page-specific Leva panels — mount/unmount with the active page */}
      {isManipulator ? <ArmPanel /> : <DrivePanel />}

      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0 }}>
        {/* Canvas lives outside Routes — never unmounts on navigation */}
        <Canvas camera={{ position: [5, 8, 12], fov: 50 }} gl={{ antialias: true }} shadows>
          <Scene onNodesFound={onNodesFound} isManipulator={isManipulator} />
        </Canvas>

        {/* Page overlays only */}
        <Routes>
          <Route path="/"            element={<MobileBaseOverlay />} />
          <Route path="/manipulator" element={<ManipulatorOverlay nodes={foundNodes} />} />
        </Routes>
      </div>
    </>
  )
}
