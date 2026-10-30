'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function ChickenModel() {
  const chickenRef = useRef<THREE.Group>(null)
  const eggRef = useRef<THREE.Mesh>(null)
  const rewardRef = useRef<THREE.Group>(null)
  const layStarted = useRef<number | null>(null)
  const [eggVisible, setEggVisible] = useState(false)
  const [reward, setReward] = useState(50)

  useEffect(() => {
    const timer = window.setInterval(() => {
      layStarted.current = performance.now()
      setReward(50 + Math.floor(Math.random() * 5) * 10)
      setEggVisible(true)
      try { new Audio('/sounds/cluck.mp3').play().catch(() => undefined) } catch { /* optional placeholder sound */ }
      window.setTimeout(() => setEggVisible(false), 2600)
    }, 10000)
    return () => window.clearInterval(timer)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (chickenRef.current) {
      chickenRef.current.position.y = -0.5 + Math.sin(t * 1.7) * 0.035
      chickenRef.current.rotation.z = Math.sin(t * 0.7) * 0.02
      if (layStarted.current) {
        const elapsed = performance.now() - layStarted.current
        const squat = Math.max(0, Math.sin(Math.min(elapsed / 650, 1) * Math.PI)) * 0.08
        chickenRef.current.position.y -= squat
      }
    }
    if (eggRef.current && rewardRef.current && layStarted.current) {
      const elapsed = performance.now() - layStarted.current
      const progress = Math.min(elapsed / 2200, 1)
      eggRef.current.position.x = -0.1 - Math.min(progress, 0.75) * 0.38
      eggRef.current.position.y = -1.02 + Math.sin(progress * Math.PI) * 0.05
      rewardRef.current.position.y = 0.03 + progress * 0.48
      rewardRef.current.scale.setScalar(1 + progress * 0.08)
      rewardRef.current.traverse(object => {
        if (object instanceof THREE.Mesh && Array.isArray(object.material) === false) {
          const material = object.material as THREE.MeshBasicMaterial
          material.transparent = true
          material.opacity = 1 - progress
        }
      })
    }
  })

  return <>
    <group ref={chickenRef} position={[0, -0.5, 0]} scale={0.5}>
      <mesh castShadow position={[0, 0, 0]} scale={[1.2, 0.82, 0.9]}><sphereGeometry args={[0.82, 32, 24]} /><meshStandardMaterial color="#fffaf0" roughness={0.68} /></mesh>
      <mesh castShadow position={[0.18, 0.8, 0]} scale={[0.9, 0.95, 0.9]}><sphereGeometry args={[0.5, 32, 24]} /><meshStandardMaterial color="#fffdf7" roughness={0.6} /></mesh>
      <mesh castShadow position={[0.58, 0.76, 0.02]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.14, 0.38, 16]} /><meshStandardMaterial color="#efa83d" roughness={0.55} /></mesh>
      <mesh castShadow position={[0.2, 1.3, 0]}><sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
      <mesh castShadow position={[0.02, 1.38, 0]}><sphereGeometry args={[0.14, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
      <mesh castShadow position={[-0.16, 1.3, 0]}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
      <mesh position={[0.38, 0.91, 0.37]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#25352d" /></mesh>
      <mesh position={[0.38, 0.91, -0.37]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#25352d" /></mesh>
      <mesh position={[-0.76, 0.2, 0]} rotation={[0, 0, -0.72]}><coneGeometry args={[0.18, 0.48, 12]} /><meshStandardMaterial color="#fffdf7" /></mesh>
      <mesh position={[-0.9, 0.32, 0]} rotation={[0, 0, -0.95]}><coneGeometry args={[0.14, 0.36, 12]} /><meshStandardMaterial color="#fffdf7" /></mesh>
      <mesh position={[-0.16, -0.68, 0.06]} rotation={[0, 0, -0.12]}><coneGeometry args={[0.09, 0.38, 12]} /><meshStandardMaterial color="#efa83d" /></mesh>
      <mesh position={[0.3, -0.68, 0.06]} rotation={[0, 0, -0.12]}><coneGeometry args={[0.09, 0.38, 12]} /><meshStandardMaterial color="#efa83d" /></mesh>
    </group>
    {eggVisible && <>
      <mesh ref={eggRef} castShadow position={[-0.1, -1.02, 0.42]} scale={[0.23, 0.32, 0.23]}><sphereGeometry args={[0.45, 24, 18]} /><meshStandardMaterial color="#fffdf7" roughness={0.3} /></mesh>
      <group ref={rewardRef} position={[0, 0.03, 0.45]}><Text fontSize={0.2} color="#4e815f" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#fffdf7">+{reward} Rs</Text></group>
    </>}
  </>
}

export default function LayingChicken() {
  return <Canvas shadows dpr={[1, 2]}>
    <PerspectiveCamera makeDefault position={[0, 1.15, 7]} fov={45} />
    <ambientLight intensity={1.35} />
    <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
    <Environment preset="sunset" />
    <ChickenModel />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} receiveShadow><circleGeometry args={[2.2, 48]} /><shadowMaterial opacity={0.16} /></mesh>
    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.25} maxPolarAngle={1.8} target={[0, -0.25, 0]} />
  </Canvas>
}
