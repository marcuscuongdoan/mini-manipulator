import { useRef, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { useKeyboard } from "../../hooks/useKeyboard";
import { robotState, renderStats } from "../../robotState";
import { driveConfig } from "../../simConfig";
import { Robot } from "./Robot";
import { Trail } from "../MobileBase/Trail";
import { ModelErrorBoundary } from "../../components/ModelErrorBoundary";

function StatsCollector() {
  const { gl } = useThree();
  useFrame(() => {
    renderStats.calls = gl.info.render.calls;
    renderStats.geometries = gl.info.memory.geometries;
    renderStats.triangles = gl.info.render.triangles;
    renderStats.memoryMB = (performance.memory?.usedJSHeapSize ?? 0) / 1048576;
  });
  return null;
}

export function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboard();
  const velRef = useRef({ linear: 0, angular: 0 });
  const poseRef = useRef({ x: 0, z: 0, theta: 0 });
  const trailRef = useRef<THREE.Vector3[]>([]);

  useFrame((_, dt) => {
    const { up, down, left, right } = keys.current;
    const dt_ = Math.min(dt, 0.1);
    const { maxSpeed, maxOmega, linAccel, angAccel } = driveConfig;

    const targetLinear = up ? maxSpeed : down ? -maxSpeed : 0;
    const targetAngular = left ? maxOmega : right ? -maxOmega : 0;

    const linDiff = targetLinear - velRef.current.linear;
    const angDiff = targetAngular - velRef.current.angular;
    velRef.current.linear +=
      Math.sign(linDiff) * Math.min(Math.abs(linDiff), linAccel * dt_);
    velRef.current.angular +=
      Math.sign(angDiff) * Math.min(Math.abs(angDiff), angAccel * dt_);

    poseRef.current.theta += velRef.current.angular * dt_;
    poseRef.current.x +=
      velRef.current.linear * Math.sin(poseRef.current.theta) * dt_;
    poseRef.current.z +=
      velRef.current.linear * Math.cos(poseRef.current.theta) * dt_;

    if (groupRef.current) {
      groupRef.current.position.set(poseRef.current.x, 0, poseRef.current.z);
      groupRef.current.rotation.y = poseRef.current.theta;
    }

    robotState.x = poseRef.current.x;
    robotState.z = poseRef.current.z;
    robotState.thetaDeg = (poseRef.current.theta * 180) / Math.PI;
    robotState.vLinear = velRef.current.linear;
    robotState.vAngular = velRef.current.angular;

    const cur = new THREE.Vector3(poseRef.current.x, 0.02, poseRef.current.z);
    const last = trailRef.current[trailRef.current.length - 1];
    if (!last || last.distanceTo(cur) > 0.03) {
      trailRef.current.push(cur);
      if (trailRef.current.length > 1000) trailRef.current.shift();
    }
  });

  return (
    <>
      <StatsCollector />
      <OrbitControls makeDefault />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <Environment preset="city" />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
      />
      <Grid
        infiniteGrid
        cellSize={0.5}
        cellColor="#2a2a4a"
        sectionSize={2}
        sectionColor="#3a3a6a"
        fadeDistance={40}
        position={[0, -0.01, 0]}
      />
      <Trail pointsRef={trailRef} />
      <ModelErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <Robot groupRef={groupRef} />
        </Suspense>
      </ModelErrorBoundary>
    </>
  );
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.4, 0.8]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
  );
}
