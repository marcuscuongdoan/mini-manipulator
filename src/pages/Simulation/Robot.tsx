import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { armConfig } from '../../simConfig'

const JOINT_PATTERNS = [
  ['panda_joint1','panda_joint2','panda_joint3','panda_joint4','panda_joint5','panda_joint6','panda_joint7'],
  ['panda_link1','panda_link2','panda_link3','panda_link4','panda_link5','panda_link6','panda_link7'],
  ['Link1','Link2','Link3','Link4','Link5','Link6','Link7'],
  ['joint1','joint2','joint3','joint4','joint5','joint6','joint7'],
  ['link1','link2','link3','link4','link5','link6','link7'],
]

function findJointNodes(root: THREE.Object3D): THREE.Object3D[] | null {
  const map = new Map<string, THREE.Object3D>()
  root.traverse(n => { if (n.name) map.set(n.name, n) })
  for (const pattern of JOINT_PATTERNS) {
    if (pattern.every(name => map.has(name))) return pattern.map(n => map.get(n)!)
  }
  const ordered: THREE.Object3D[] = []
  root.traverse(n => { if (n !== root && n.type === 'Object3D') ordered.push(n) })
  return ordered.length >= 7 ? ordered.slice(0, 7) : null
}

interface RobotProps {
  groupRef: React.RefObject<THREE.Group | null>
  onNodesFound?: (names: string[]) => void
  onBoundsFound?: (center: THREE.Vector3, radius: number) => void
}

export function Robot({ groupRef, onNodesFound, onBoundsFound }: RobotProps) {
  const { scene } = useGLTF('/robot.glb')
  const clone = useMemo(() => scene.clone(true), [scene])
  const jointNodes = useRef<THREE.Object3D[] | null>(null)

  useEffect(() => {
    jointNodes.current = findJointNodes(clone)
    onNodesFound?.(jointNodes.current?.map(n => n.name) ?? [])

    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    onBoundsFound?.(center, sphere.radius)
  }, [clone, onNodesFound, onBoundsFound])

  useFrame(() => {
    const nodes = jointNodes.current
    if (!nodes) return
    nodes[0].rotation.z = armConfig.j1
    nodes[1].rotation.z = armConfig.j2
    nodes[2].rotation.z = armConfig.j3
    nodes[3].rotation.z = armConfig.j4
    nodes[4].rotation.z = armConfig.j5
    nodes[5].rotation.z = armConfig.j6
    nodes[6].rotation.z = armConfig.j7
  })

  return (
    <group ref={groupRef}>
      <primitive object={clone} />
    </group>
  )
}

useGLTF.preload('/robot.glb')
