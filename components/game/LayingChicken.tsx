'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function FarmBackdrop() {
  return <>
    <color attach="background" args={['#73c5ee']} />
    <mesh position={[0, -1.55, -1.7]} receiveShadow><planeGeometry args={[20, 7]} /><meshStandardMaterial color="#87c96d" /></mesh>
    <mesh position={[2.25, 0.2, -2.25]}><boxGeometry args={[2.35, 2.5, .45]} /><meshStandardMaterial color="#a66a3e" /></mesh>
    <mesh position={[2.25, 1.72, -2.25]} rotation={[0, 0, Math.PI / 4]}><coneGeometry args={[1.8, 2.1, 4]} /><meshStandardMaterial color="#754831" /></mesh>
    <mesh position={[2.25, .1, -1.99]}><boxGeometry args={[.55, 1.25, .03]} /><meshStandardMaterial color="#4e392b" /></mesh>
    {[-2.7, -1.55, -.4].map((x) => <group key={x} position={[x, -.7, -1.95]}><mesh castShadow><cylinderGeometry args={[.07, .07, 1.8, 10]} /><meshStandardMaterial color="#94613f" /></mesh><mesh rotation={[0, 0, Math.PI / 2]} position={[.55, .22, 0]}><cylinderGeometry args={[.045, .045, 2.3, 8]} /><meshStandardMaterial color="#b47a4b" /></mesh><mesh rotation={[0, 0, Math.PI / 2]} position={[.55, -.2, 0]}><cylinderGeometry args={[.045, .045, 2.3, 8]} /><meshStandardMaterial color="#b47a4b" /></mesh></group>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, .15]} receiveShadow><circleGeometry args={[2.6, 48]} /><meshStandardMaterial color="#9acb72" /></mesh>
  </>
}

function Chicken({ laying, reward }: { laying: boolean; reward: number }) {
  const ref = useRef<THREE.Group>(null); const eggRef = useRef<THREE.Mesh>(null); const rewardRef = useRef<THREE.Group>(null); const started = useRef<number | null>(null)
  useEffect(() => { if (laying) started.current = performance.now() }, [laying])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime(); if (ref.current) { ref.current.position.y = -.18 + Math.sin(t * 1.7) * .035; ref.current.rotation.z = Math.sin(t * .7) * .018; if (started.current) ref.current.position.y -= Math.max(0, Math.sin(Math.min((performance.now() - started.current) / 650, 1) * Math.PI)) * .08 }
    if (eggRef.current && rewardRef.current && started.current) { const p = Math.min((performance.now() - started.current) / 2200, 1); eggRef.current.position.x = .05 - p * .28; eggRef.current.position.y = -1.03 + Math.sin(p * Math.PI) * .04; rewardRef.current.position.y = .25 + p * .42; rewardRef.current.scale.setScalar(1 + p * .08) }
  })
  return <>
    <group ref={ref} position={[0, -.18, .35]} scale={.68}>
      <mesh castShadow position={[0, 0, 0]} scale={[1.2, .85, .88]}><sphereGeometry args={[.82, 32, 24]} /><meshStandardMaterial color="#fff9ed" roughness={.7} /></mesh>
      <mesh castShadow position={[.2, .82, 0]} scale={[.9, .96, .9]}><sphereGeometry args={[.5, 32, 24]} /><meshStandardMaterial color="#fffdf8" roughness={.58} /></mesh>
      <mesh castShadow position={[.58, .78, .03]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.14, .4, 16]} /><meshStandardMaterial color="#f2aa35" /></mesh>
      {[[.18, 1.31, .12], [.01, 1.39, .08], [-.16, 1.31, .1]].map((p, i) => <mesh castShadow position={p as [number, number, number]} key={i}><sphereGeometry args={[i === 1 ? .14 : .12, 16, 12]} /><meshStandardMaterial color="#df5a45" /></mesh>)}
      {[.37, -.37].map((z) => <mesh position={[.38, .92, z]} key={z}><sphereGeometry args={[.055, 12, 12]} /><meshStandardMaterial color="#25352d" /></mesh>)}
      <mesh castShadow position={[-.78, .2, 0]} rotation={[0, 0, -.75]}><coneGeometry args={[.19, .52, 12]} /><meshStandardMaterial color="#fffdf8" /></mesh><mesh castShadow position={[-.92, .33, 0]} rotation={[0, 0, -1]}><coneGeometry args={[.14, .4, 12]} /><meshStandardMaterial color="#fffdf8" /></mesh>
      {[-.16, .3].map((x) => <mesh position={[x, -.68, .08]} rotation={[0, 0, -.12]} key={x}><coneGeometry args={[.09, .38, 12]} /><meshStandardMaterial color="#f2aa35" /></mesh>)}
    </group>
    <group position={[0, -1.18, .25]}><mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.78, .16, 12, 32]} /><meshStandardMaterial color="#9a6038" /></mesh><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 0]}><circleGeometry args={[.7, 32]} /><meshStandardMaterial color="#d59a55" /></mesh>{[-.45, 0, .42].map((x, i) => <mesh key={i} position={[x, .25 + (i === 1 ? .08 : 0), .1]} scale={[.32, .43, .32]}><sphereGeometry args={[.45, 20, 16]} /><meshStandardMaterial color={i === 1 ? '#ffe9b7' : '#fff5dd'} /></mesh>)}</group>
    {laying && <><mesh ref={eggRef} castShadow position={[.05, -1.03, .45]} scale={[.24, .34, .24]}><sphereGeometry args={[.45, 24, 18]} /><meshStandardMaterial color="#fffdf7" roughness={.28} /></mesh><group ref={rewardRef} position={[0, .25, .55]}><Text fontSize={.2} color="#74451f" anchorX="center" anchorY="middle" outlineWidth={.015} outlineColor="#fff7d4">+{reward} Rs</Text><mesh position={[-.32, .04, -.02]}><sphereGeometry args={[.035, 10, 10]} /><meshBasicMaterial color="#ffd33f" /></mesh><mesh position={[.32, .04, -.02]}><sphereGeometry args={[.035, 10, 10]} /><meshBasicMaterial color="#ffd33f" /></mesh></group></>}
  </>
}

export default function LayingChicken() {
  const [laying, setLaying] = useState(false); const [reward, setReward] = useState(70)
  useEffect(() => { const timer = window.setInterval(() => { setReward(50 + Math.floor(Math.random() * 5) * 10); setLaying(true); try { new Audio('/sounds/cluck.mp3').play().catch(() => undefined) } catch { /* optional sound */ }; window.setTimeout(() => setLaying(false), 2600) }, 10000); return () => window.clearInterval(timer) }, [])
  return <Canvas shadows dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, .7, 7.5]} fov={45} /><ambientLight intensity={1.55} /><directionalLight position={[3, 6, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} /><Environment preset="sunset" /><FarmBackdrop /><Chicken laying={laying} reward={reward} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.25} maxPolarAngle={1.8} target={[0, -.35, 0]} /></Canvas>
}
