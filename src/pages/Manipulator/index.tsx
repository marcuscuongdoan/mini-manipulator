import { useState, useCallback, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Robot } from '../Simulation/Robot'
import { ModelErrorBoundary } from '../../components/ModelErrorBoundary'
import { armConfig } from '../../simConfig'
import { ENV_PRESETS } from '../Simulation/types'
import type { EnvPreset } from '../Simulation/types'

const FRANKA_LIMITS = [
  { min: -2.897, max:  2.897 },
  { min: -1.763, max:  1.763 },
  { min: -2.897, max:  2.897 },
  { min: -3.072, max: -0.070 },
  { min: -2.897, max:  2.897 },
  { min: -0.017, max:  3.753 },
  { min: -2.897, max:  2.897 },
]
const NEUTRALS = [0, 0, 0, -1.5708, 0, 1.5708, 0]

const panel: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10,10,30,0.82)',
  border: '1px solid #2a2a4a',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'ui-monospace, Consolas, monospace',
  fontSize: 11,
  lineHeight: '1.6',
  color: '#9ca3af',
  pointerEvents: 'none',
  display: 'flex',
  gap: 24,
}

function NodeInfoPanel({ nodes }: { nodes: string[] }) {
  if (nodes.length === 0) return null
  return (
    <div style={panel}>
      {nodes.map((n, i) => (
        <div key={i}>
          <span style={{ color: '#6c63ff' }}>J{i + 1} </span>
          <span style={{ color: '#a78bfa' }}>{n}</span>
        </div>
      ))}
    </div>
  )
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.4, 0.8]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
  )
}

function CameraFocus({ boundsRef }: { boundsRef: React.RefObject<{ center: THREE.Vector3; radius: number } | null> }) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    const bounds  = boundsRef.current
    const controls = controlsRef.current
    if (!bounds || !controls) return
    const { center, radius } = bounds
    camera.position.set(center.x + radius * 1.5, center.y + radius * 0.8, center.z + radius * 2)
    controls.target.copy(center)
    controls.update()
    done.current = true
  })

  return <OrbitControls makeDefault ref={controlsRef} />
}

interface ArmSceneProps {
  envPreset: EnvPreset
  envBackground: boolean
  bgColor: string
  onNodesFound: (names: string[]) => void
}

function ArmScene({ envPreset, envBackground, bgColor, onNodesFound }: ArmSceneProps) {
  const groupRef  = useRef<THREE.Group>(null)
  const boundsRef = useRef<{ center: THREE.Vector3; radius: number } | null>(null)

  const handleBoundsFound = useCallback((center: THREE.Vector3, radius: number) => {
    boundsRef.current = { center, radius }
  }, [])

  return (
    <>
      <CameraFocus boundsRef={boundsRef} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <Environment preset={envPreset} background={envBackground} />
      {!envBackground && <color attach="background" args={[bgColor]} />}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.3} scale={10} blur={2} />
      <ModelErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <Robot
            groupRef={groupRef}
            onNodesFound={onNodesFound}
            onBoundsFound={handleBoundsFound}
          />
        </Suspense>
      </ModelErrorBoundary>
    </>
  )
}

export default function ManipulatorPage() {
  const [foundNodes, setFoundNodes] = useState<string[]>([])
  const onNodesFound = useCallback((names: string[]) => setFoundNodes(names), [])

  useControls('Joints', Object.fromEntries(
    FRANKA_LIMITS.map(({ min, max }, i) => [
      `Joint ${i + 1}`,
      { value: NEUTRALS[i], min, max, step: 0.001,
        onChange: (v: number) => { (armConfig as Record<string, number>)[`j${i + 1}`] = v } },
    ])
  ))

  const { envPreset, envBackground, bgColor } = useControls('Scene', {
    envPreset:     { value: 'city',    options: [...ENV_PRESETS], label: 'Environment' },
    envBackground: { value: false,                                label: 'Use env as background' },
    bgColor:       { value: '#0d0d1a',                            label: 'Background color',
                     render: (get: (key: string) => unknown) => !get('Scene.envBackground') },
  })

  return (
    <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0 }}>
      <Canvas camera={{ position: [2, 1.5, 2.5], fov: 50 }} gl={{ antialias: true }} shadows>
        <ArmScene
          envPreset={envPreset as EnvPreset}
          envBackground={envBackground as boolean}
          bgColor={bgColor as string}
          onNodesFound={onNodesFound}
        />
      </Canvas>
      <NodeInfoPanel nodes={foundNodes} />
    </div>
  )
}
