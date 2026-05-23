import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { driveConfig } from '../../simConfig'

const DUMMY: [number, number, number][] = [[0, 0, 0], [0, 0, 0.001]]

interface TrailProps {
  pointsRef: React.MutableRefObject<THREE.Vector3[]>
}

export function Trail({ pointsRef }: TrailProps) {
  const [points, setPoints] = useState<[number, number, number][]>(DUMMY)
  const [color, setColor] = useState(driveConfig.trailColor)
  const tick = useRef(0)
  const lastColor = useRef(driveConfig.trailColor)

  useFrame(() => {
    if (++tick.current % 3 !== 0) return

    // Sync color from store
    if (driveConfig.trailColor !== lastColor.current) {
      lastColor.current = driveConfig.trailColor
      setColor(driveConfig.trailColor)
    }

    const pts = pointsRef.current
    if (pts.length < 2) return
    setPoints(pts.map(v => [v.x, v.y, v.z]))
  })

  return <Line points={points} color={color} lineWidth={3} />
}
