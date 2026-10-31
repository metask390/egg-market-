'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, Text, useGLTF } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type ChickenProps = { position: [number, number, number]; reward: 70 | 150; phase: number }

function ChickenAsset({ position, reward, phase }: ChickenProps) {
  const { scene } = useGLTF('/chicken.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  const group = useRef<THREE.Group>(null)
  const label = useRef<THREE.Group>(null)
  useEffect(() => { model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true } }) }, [model])
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() + phase
    if (group.current) { group.current.position.y = position[1] + Math.sin(time * 1.35) * .035; group.current.rotation.y = Math.sin(time * .3) * .045; group.current.rotation.z = Math.sin(time * .8) * .018 }
    if (label.current) { const cycle = (time * .24) % 1; label.current.position.y = .42 + cycle * .32; const opacity = cycle < .7 ? 1 : 1 - (cycle - .7) / .3; label.current.traverse(object => { if (object instanceof THREE.Mesh) { const material = object.material as THREE.Material & { opacity?: number; transparent?: boolean }; material.transparent = true; material.opacity = opacity } }) }
  })
  return <group ref={group} position={position}><primitive object={model} scale={.95} rotation={[0, Math.PI, 0]} /><mesh position={[0, .22, .28]} scale={[.2, .28, .2]} castShadow><sphereGeometry args={[.45, 24, 18]} /><meshStandardMaterial color="#fffaf0" roughness={.34} /></mesh><group ref={label} position={[0, .42, .33]}><Text fontSize={.16} color={reward === 150 ? '#a87916' : '#398b54'} anchorX="center" anchorY="middle" outlineWidth={.01} outlineColor="#fff9e2">+{reward} Rs</Text><pointLight color="#ffd740" intensity={.8} distance={.75} /></group></group>
}

function FarmhouseAsset() {
  const { scene } = useGLTF('/farmhouse.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  useEffect(() => { model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true } }) }, [model])
  return <primitive object={model} position={[2.35, .02, -2.1]} scale={1.45} />
}

function FarmhouseFallback() {
  return <group position={[2.35, .3, -2.1]}><mesh castShadow><boxGeometry args={[2.2, 2.4, .55]} /><meshStandardMaterial color="#875433" roughness={.9} /></mesh><mesh position={[0, 1.65, 0]} rotation={[0, 0, Math.PI / 4]} castShadow><coneGeometry args={[1.7, 2, 4]} /><meshStandardMaterial color="#5d3829" roughness={.95} /></mesh><mesh position={[0, -.25, .3]}><boxGeometry args={[.5, 1.2, .05]} /><meshStandardMaterial color="#30221d" /></mesh></group>
}

class FarmhouseBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  static getDerivedStateFromError() { return { failed: true } }
  state = { failed: false }
  render() { return this.state.failed ? <FarmhouseFallback /> : this.props.children }
}

function FarmEnvironment() {
  return <>
    <color attach="background" args={['#86cfee']} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.03, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#795335" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .005, .35]}><circleGeometry args={[3.1, 48]} /><meshStandardMaterial color="#96643d" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .008, .35]}><ringGeometry args={[2.8, 3.1, 48]} /><meshStandardMaterial color="#b27a48" roughness={1} /></mesh>
    <group position={[0, .75, -1.5]}>{[-2.8, -1.3, 1.3, 2.8].map(x => <mesh castShadow key={x} position={[x, 0, 0]}><cylinderGeometry args={[.06, .08, 1.6, 10]} /><meshStandardMaterial color="#68442d" roughness={.95} /></mesh>)}<mesh rotation={[0, 0, Math.PI / 2]} position={[0, .25, 0]}><cylinderGeometry args={[.04, .04, 5.6, 8]} /><meshStandardMaterial color="#a66e43" roughness={.95} /></mesh><mesh rotation={[0, 0, Math.PI / 2]} position={[0, -.2, 0]}><cylinderGeometry args={[.04, .04, 5.6, 8]} /><meshStandardMaterial color="#a66e43" roughness={.95} /></mesh></group>
    <Suspense fallback={<FarmhouseFallback />}><FarmhouseBoundary><FarmhouseAsset /></FarmhouseBoundary></Suspense>
    <mesh position={[-2.2, .14, .65]} castShadow><cylinderGeometry args={[.25, .28, .2, 24]} /><meshStandardMaterial color="#5aa4ac" roughness={.3} /></mesh><mesh position={[2.05, .16, .5]} castShadow><boxGeometry args={[.5, .26, .35]} /><meshStandardMaterial color="#c47a2f" roughness={.85} /></mesh>
  </>
}

export default function LayingChicken() {
  return <Canvas shadows dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, 2.15, 8.8]} fov={42} /><ambientLight intensity={.6} /><directionalLight castShadow position={[5, 10, 5]} intensity={2.5} color="#ffe9c4" shadow-mapSize={[1024, 1024]} /><Environment preset="sunset" /><FarmEnvironment /><Suspense fallback={null}><ChickenAsset position={[-2, .18, .25]} reward={70} phase={0} /><ChickenAsset position={[0, .18, .9]} reward={150} phase={2.7} /><ChickenAsset position={[2, .18, .25]} reward={70} phase={5.2} /></Suspense><ContactShadows position={[0, .02, .3]} opacity={.35} scale={8} blur={2.6} far={4.5} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.1} maxPolarAngle={1.5} target={[0, .2, 0]} /></Canvas>
}
