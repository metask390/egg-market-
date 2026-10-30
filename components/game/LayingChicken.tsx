'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, OrbitControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function ChickenModel({ laying }: { laying: boolean }) {
  const group = useRef<THREE.Group>(null)
  const [eggVisible, setEggVisible] = useState(false)
  const [reward, setReward] = useState(50)
  const started = useRef(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEggVisible(true); setReward(50 + Math.floor(Math.random() * 5) * 10)
      try { new Audio('/sounds/cluck.mp3').play().catch(() => undefined) } catch { /* optional placeholder sound */ }
      window.setTimeout(() => setEggVisible(false), 2600)
    }, 10000)
    return () => window.clearInterval(timer)
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    const squat = eggVisible ? Math.sin(Math.min((Date.now() - started.current) / 650, Math.PI) * Math.PI) * .13 : 0
    group.current.position.y = Math.sin(t * 1.7) * .045 - squat
    group.current.rotation.z = Math.sin(t * .7) * .025
  })

  return <group ref={group} position={[0, -.25, 0]} scale={1.25}>
    <mesh castShadow position={[0, 0, 0]}><sphereGeometry args={[.8, 32, 24]} /><meshStandardMaterial color="#fffaf0" roughness={.7} /></mesh>
    <mesh castShadow position={[0, .82, .02]}><sphereGeometry args={[.5, 32, 24]} /><meshStandardMaterial color="#fffdf7" roughness={.65} /></mesh>
    <mesh position={[.48, .78, .02]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.16, .42, 16]} /><meshStandardMaterial color="#efa83d" /></mesh>
    <mesh position={[.18, 1.32, .02]}><sphereGeometry args={[.12, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
    <mesh position={[.02, 1.39, .02]}><sphereGeometry args={[.13, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
    <mesh position={[-.15, 1.32, .02]}><sphereGeometry args={[.11, 16, 12]} /><meshStandardMaterial color="#de5b46" /></mesh>
    <mesh position={[.26, .9, .43]}><sphereGeometry args={[.055, 12, 12]} /><meshStandardMaterial color="#25352d" /></mesh>
    <mesh position={[.26, .9, -.43]}><sphereGeometry args={[.055, 12, 12]} /><meshStandardMaterial color="#25352d" /></mesh>
    <mesh position={[-.75, -.18, 0]} rotation={[0, 0, -.35]}><coneGeometry args={[.24, .65, 12]} /><meshStandardMaterial color="#efa83d" /></mesh>
    {eggVisible && <><mesh position={[-.1, -.83, .08]} scale={[.44, .6, .44]}><sphereGeometry args={[.45, 24, 18]} /><meshStandardMaterial color="#fffdf7" roughness={.3} /></mesh><Float speed={2} floatIntensity={.5}><Text position={[.55, .55, .1]} fontSize={.22} color="#4e815f" anchorX="center" anchorY="middle">+{reward} Rs</Text></Float></>}
  </group>
}

export default function LayingChicken({ laying = false }: { laying?: boolean }) {
  return <Canvas shadows camera={{ position: [0, .4, 4.2], fov: 35 }}>
    <ambientLight intensity={1.8} /><directionalLight position={[3, 5, 4]} intensity={2.6} castShadow />
    <ChickenModel laying={laying} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.25} maxPolarAngle={1.8} />
  </Canvas>
}
