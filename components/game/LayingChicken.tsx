'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const featherPositions = [[-.36, .16, .45], [-.22, .34, .5], [-.04, .39, .5], [.15, .3, .48], [.28, .12, .44]] as const

function FarmBackdrop() {
  return <>
    <color attach="background" args={['#78c9ee']} />
    <mesh position={[0, -1.55, -1.7]} receiveShadow><planeGeometry args={[20, 7]} /><meshStandardMaterial color="#86c96f" roughness={1} /></mesh>
    <mesh position={[2.25, .2, -2.25]} castShadow><boxGeometry args={[2.35, 2.5, .45]} /><meshStandardMaterial color="#9c633c" roughness={.9} /></mesh>
    <mesh position={[2.25, 1.72, -2.25]} rotation={[0, 0, Math.PI / 4]} castShadow><coneGeometry args={[1.8, 2.1, 4]} /><meshStandardMaterial color="#70452f" roughness={.95} /></mesh>
    <mesh position={[2.25, .1, -1.99]}><boxGeometry args={[.55, 1.25, .03]} /><meshStandardMaterial color="#463126" roughness={1} /></mesh>
    {[-2.7, -1.55, -.4].map(x => <group key={x} position={[x, -.7, -1.95]}><mesh castShadow><cylinderGeometry args={[.07, .07, 1.8, 10]} /><meshStandardMaterial color="#91603f" roughness={.95} /></mesh><mesh rotation={[0, 0, Math.PI / 2]} position={[.55, .22, 0]}><cylinderGeometry args={[.045, .045, 2.3, 8]} /><meshStandardMaterial color="#b2774b" roughness={.95} /></mesh><mesh rotation={[0, 0, Math.PI / 2]} position={[.55, -.2, 0]}><cylinderGeometry args={[.045, .045, 2.3, 8]} /><meshStandardMaterial color="#b2774b" roughness={.95} /></mesh></group>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, .15]} receiveShadow><circleGeometry args={[2.6, 48]} /><meshStandardMaterial color="#99ca70" roughness={1} /></mesh>
  </>
}

function Nest() {
  return <group position={[0, -1.18, .25]}><mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow><torusGeometry args={[.82, .16, 14, 40]} /><meshStandardMaterial color="#87512f" roughness={.95} /></mesh><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 0]}><circleGeometry args={[.72, 32]} /><meshStandardMaterial color="#c58a4d" roughness={1} /></mesh>{[-.53, -.3, -.05, .22, .48].map((x, i) => <mesh key={i} position={[x, .18 + (i % 2) * .06, .11]} rotation={[0, 0, -.35 + i * .12]}><cylinderGeometry args={[.025, .025, .65, 6]} /><meshStandardMaterial color="#d6a15e" roughness={1} /></mesh>)}{[-.45, 0, .44].map((x, i) => <mesh key={i} position={[x, .25 + (i === 1 ? .08 : 0), .1]} scale={[.3, .4, .3]}><sphereGeometry args={[.45, 22, 16]} /><meshStandardMaterial color={i === 1 ? '#ffe9b7' : '#fff5dd'} roughness={.42} /></mesh>)}</group>
}

function Chicken({ laying, reward }: { laying: boolean; reward: number }) {
  const bodyRef = useRef<THREE.Group>(null); const headRef = useRef<THREE.Group>(null); const leftWingRef = useRef<THREE.Group>(null); const rightWingRef = useRef<THREE.Group>(null); const eggRef = useRef<THREE.Mesh>(null); const rewardRef = useRef<THREE.Group>(null); const started = useRef<number | null>(null)
  useEffect(() => { if (laying) started.current = performance.now() }, [laying])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime(); const elapsed = started.current ? performance.now() - started.current : 0; const progress = Math.min(elapsed / 2400, 1); const squat = laying ? Math.max(0, Math.sin(Math.min(elapsed / 650, 1) * Math.PI)) * .075 : 0
    if (bodyRef.current) { bodyRef.current.position.y = -.18 + Math.sin(t * 1.65) * .028 - squat; bodyRef.current.rotation.z = Math.sin(t * .65) * .018 }
    if (headRef.current) { headRef.current.position.y = .74 + Math.sin(t * 2.1) * .038 - squat * .35; headRef.current.rotation.z = Math.sin(t * .7) * .025 }
    if (leftWingRef.current && rightWingRef.current) { const flap = laying ? Math.sin(Math.min(elapsed / 480, Math.PI * 2)) * .3 : Math.sin(t * .9) * .025; leftWingRef.current.rotation.z = -.22 - flap; rightWingRef.current.rotation.z = .22 + flap }
    if (eggRef.current && rewardRef.current && started.current) { eggRef.current.position.y = -.5 - Math.min(progress, .8) * .55; eggRef.current.position.x = .04 - Math.min(progress, .8) * .27; rewardRef.current.position.y = .2 + progress * .55; rewardRef.current.scale.setScalar(1 + progress * .08); rewardRef.current.traverse(object => { if (object instanceof THREE.Mesh) { const material = object.material as THREE.Material & { opacity?: number; transparent?: boolean }; material.transparent = true; material.opacity = Math.max(0, 1 - Math.max(0, progress - .25) / .75) } }) }
  })
  return <>
    <group ref={bodyRef} position={[0, -.18, .35]} scale={.68}>
      <mesh castShadow position={[0, 0, 0]} scale={[1.18, .86, .9]}><sphereGeometry args={[.82, 40, 28]} /><meshStandardMaterial color="#fff8ea" roughness={.82} metalness={0} /></mesh>
      <mesh castShadow position={[.18, .77, 0]} scale={[.92, .98, .92]}><sphereGeometry args={[.5, 36, 26]} /><meshStandardMaterial color="#fffdf7" roughness={.76} /></mesh>
      <mesh castShadow position={[.56, .74, .03]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.14, .4, 18]} /><meshStandardMaterial color="#ed9d2c" roughness={.6} /></mesh>
      <mesh castShadow position={[.27, .5, .45]} rotation={[Math.PI / 2, 0, 0]} scale={[.95, 1.1, .45]}><sphereGeometry args={[.28, 24, 16]} /><meshStandardMaterial color="#df5547" roughness={.7} /></mesh>
      <mesh position={[-.77, .18, 0]} rotation={[0, 0, -.75]}><coneGeometry args={[.19, .52, 14]} /><meshStandardMaterial color="#fffdf7" roughness={.82} /></mesh><mesh position={[-.91, .32, 0]} rotation={[0, 0, -1]}><coneGeometry args={[.14, .4, 14]} /><meshStandardMaterial color="#fffdf7" roughness={.82} /></mesh>
      {[-.16, .3].map(x => <mesh key={x} position={[x, -.68, .08]} rotation={[0, 0, -.12]}><coneGeometry args={[.09, .38, 14]} /><meshStandardMaterial color="#efa52e" roughness={.7} /></mesh>)}
      <group ref={leftWingRef} position={[.1, .05, .54]} rotation={[0, 0, -.22]}>{featherPositions.map((p, i) => <mesh key={i} castShadow position={p} rotation={[0, .12, -.18]} scale={[.76, 1, .22]}><sphereGeometry args={[.26, 22, 14]} /><meshStandardMaterial color="#fffdf6" roughness={.86} /></mesh>)}</group>
      <group ref={rightWingRef} position={[.1, .05, -.54]} rotation={[0, 0, .22]}>{featherPositions.map((p, i) => <mesh key={i} castShadow position={[p[0], p[1], -p[2]]} rotation={[0, -.12, .18]} scale={[.76, 1, .22]}><sphereGeometry args={[.26, 22, 14]} /><meshStandardMaterial color="#fffdf6" roughness={.86} /></mesh>)}</group>
    </group>
    <group ref={headRef} position={[.18, .74, .35]} scale={.68}>
      <mesh castShadow position={[0, 0, 0]} scale={[.92, .96, .92]}><sphereGeometry args={[.5, 36, 26]} /><meshStandardMaterial color="#fffdf7" roughness={.76} /></mesh>
      {[[-.16, .52, .08], [0, .6, .05], [.16, .52, .08]].map((p, i) => <mesh castShadow position={p as [number, number, number]} key={i} scale={[.9, 1.15, .75]}><sphereGeometry args={[i === 1 ? .14 : .12, 20, 14]} /><meshStandardMaterial color="#d94342" roughness={.7} /></mesh>)}
      {[.36, -.36].map(z => <group key={z} position={[.22, .08, z]}><mesh><sphereGeometry args={[.105, 20, 16]} /><meshStandardMaterial color="#f0b443" roughness={.55} /></mesh><mesh position={[0, 0, .085 * (z > 0 ? 1 : -1)]}><sphereGeometry args={[.065, 16, 12]} /><meshStandardMaterial color="#15251d" roughness={.45} /></mesh><mesh position={[0, 0, .14 * (z > 0 ? 1 : -1)]}><sphereGeometry args={[.025, 10, 8]} /><meshStandardMaterial color="#fffdf7" /></mesh></group>)}
      <mesh castShadow position={[.5, -.22, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.13, .38, 18]} /><meshStandardMaterial color="#eda032" roughness={.58} /></mesh>
    </group>
    <Nest />
    {laying && <><mesh ref={eggRef} castShadow position={[.04, -.5, .48]} scale={[.24, .34, .24]}><sphereGeometry args={[.45, 28, 20]} /><meshStandardMaterial color="#fffdf7" roughness={.38} /></mesh><group ref={rewardRef} position={[0, .2, .64]}><Text fontSize={.2} color="#75451f" anchorX="center" anchorY="middle" outlineWidth={.014} outlineColor="#fff6be">+{reward} Rs</Text><pointLight color="#ffd83d" intensity={1.5} distance={1.2} /><mesh position={[-.34, .02, -.02]}><sphereGeometry args={[.035, 10, 10]} /><meshBasicMaterial color="#ffd33d" /></mesh><mesh position={[.34, .02, -.02]}><sphereGeometry args={[.035, 10, 10]} /><meshBasicMaterial color="#ffd33d" /></mesh></group></>}
  </>
}

export default function LayingChicken() {
  const [laying, setLaying] = useState(false); const [reward, setReward] = useState(70)
  useEffect(() => { const timer = window.setInterval(() => { setReward(50 + Math.floor(Math.random() * 5) * 10); setLaying(true); try { new Audio('/sounds/cluck.mp3').play().catch(() => undefined) } catch { /* optional sound */ }; window.setTimeout(() => setLaying(false), 2600) }, 10000); return () => window.clearInterval(timer) }, [])
  return <Canvas shadows dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, .65, 7.5]} fov={45} /><ambientLight intensity={1.35} /><directionalLight position={[3, 6, 4]} intensity={2.5} color="#fff0cf" castShadow shadow-mapSize={[1024, 1024]} /><Environment preset="sunset" /><FarmBackdrop /><Chicken laying={laying} reward={reward} /><ContactShadows position={[0, -1.4, .2]} opacity={.28} scale={4.5} blur={2.8} far={3.5} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.25} maxPolarAngle={1.8} target={[0, -.35, 0]} /></Canvas>
}
