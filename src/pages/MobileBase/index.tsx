import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva'
import { robotState, renderStats } from '../../robotState'
import { driveConfig } from '../../simConfig'
import { Scene } from '../Simulation/Scene'

const panel: React.CSSProperties = {
  position: 'absolute',
  background: 'rgba(10,10,30,0.82)',
  border: '1px solid #2a2a4a',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'ui-monospace, Consolas, monospace',
  fontSize: 12,
  lineHeight: '1.7',
  color: '#c0c0e0',
  pointerEvents: 'none',
}

function HUDOverlay() {
  const [snap, setSnap] = useState({ ...robotState })
  useEffect(() => {
    const id = setInterval(() => setSnap({ ...robotState }), 80)
    return () => clearInterval(id)
  }, [])
  const theta = ((snap.thetaDeg % 360) + 360) % 360
  return (
    <div style={{ ...panel, bottom: 16, left: 16 }}>
      <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>ROBOT STATE</div>
      <div>X : <b>{snap.x.toFixed(3)}</b> m</div>
      <div>Z : <b>{snap.z.toFixed(3)}</b> m</div>
      <div>θ : <b>{theta.toFixed(1)}</b>°</div>
      <div style={{ marginTop: 6, color: '#a78bfa', fontWeight: 600 }}>VELOCITY</div>
      <div>v : <b>{snap.vLinear.toFixed(3)}</b> m/s</div>
      <div>ω : <b>{snap.vAngular.toFixed(3)}</b> rad/s</div>
    </div>
  )
}

function StatsOverlay() {
  const [snap, setSnap] = useState({ ...renderStats })
  useEffect(() => {
    const id = setInterval(() => setSnap({ ...renderStats }), 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ ...panel, bottom: 16, right: 16 }}>
      <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>RENDERER</div>
      <div>Draw Calls : <b>{snap.calls}</b></div>
      <div>Geometries : <b>{snap.geometries}</b></div>
      <div>Triangles  : <b>{snap.triangles.toLocaleString()}</b></div>
      <div>Memory     : <b>{snap.memoryMB.toFixed(1)}</b> MB</div>
    </div>
  )
}

function KeyHint() {
  return (
    <div style={{ ...panel, top: 16, left: 16, lineHeight: '2' }}>
      <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 2 }}>CONTROLS</div>
      <div>↑ / ↓  Forward / Backward</div>
      <div>← / →  Rotate</div>
    </div>
  )
}

function DriveConfigPanel() {
  useControls('Drive Config', {
    maxSpeed:   { value: driveConfig.maxSpeed,   min: 0.5, max: 10,  step: 0.5,  label: 'Max Speed (m/s)',    onChange: (v: number) => { driveConfig.maxSpeed   = v } },
    maxOmega:   { value: driveConfig.maxOmega,   min: 0.3, max: 5,   step: 0.1,  label: 'Max ω (rad/s)',      onChange: (v: number) => { driveConfig.maxOmega   = v } },
    linAccel:   { value: driveConfig.linAccel,   min: 1,   max: 20,  step: 0.5,  label: 'Lin Accel (m/s²)',   onChange: (v: number) => { driveConfig.linAccel   = v } },
    angAccel:   { value: driveConfig.angAccel,   min: 1,   max: 20,  step: 0.5,  label: 'Ang Accel (rad/s²)', onChange: (v: number) => { driveConfig.angAccel   = v } },
    trailColor: { value: driveConfig.trailColor,                                  label: 'Trail Color',         onChange: (v: string) => { driveConfig.trailColor = v } },
  })
  return null
}

export default function MobileBasePage() {
  return (
    <>
      <DriveConfigPanel />
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0 }}>
        <Canvas camera={{ position: [5, 8, 12], fov: 50 }} gl={{ antialias: true }} shadows>
          <Scene />
        </Canvas>
        <HUDOverlay />
        <StatsOverlay />
        <KeyHint />
      </div>
    </>
  )
}
