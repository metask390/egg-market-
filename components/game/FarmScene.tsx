'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function MiniChicken({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = .32 + Math.sin(clock.getElapsedTime() * 1.6 + index) * .025 })
  const x = ((index % 4) - 1.5) * .82; const z = (Math.floor(index / 4) - .5) * .75
  return <group ref={ref} position={[x, .32, z]}>
    <mesh castShadow><sphereGeometry args={[.34, 18, 14]} /><meshStandardMaterial color={index % 2 ? '#fff9ec' : '#f8d887'} /></mesh>
    <mesh position={[.28, .22, 0]}><sphereGeometry args={[.22, 18, 14]} /><meshStandardMaterial color="#fffdf7" /></mesh>
    <mesh position={[.5, .2, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.06, .18, 10]} /><meshStandardMaterial color="#e9a43b" /></mesh>
    <mesh position={[.33, .43, 0]}><sphereGeometry args={[.055, 10, 10]} /><meshStandardMaterial color="#d95546" /></mesh>
  </group>
}

export default function FarmScene({ count }: { count: number }) {
  return <div className="farm-scene"><Canvas shadows camera={{ position: [0, 4.4, 5.6], fov: 42 }}>
    <ambientLight intensity={1.7} /><directionalLight position={[3, 6, 3]} intensity={2.4} castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.1, 48]} /><meshStandardMaterial color="#9bc17b" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .01, 0]}><ringGeometry args={[2.75, 3.1, 48]} /><meshStandardMaterial color="#e8c978" /></mesh>
    {Array.from({ length: count }, (_, i) => <MiniChicken index={i} key={i} />)}
    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={.8} maxPolarAngle={1.35} />
  </Canvas><div className="farm-scene-caption">{count ? `${count} happy chicken${count === 1 ? '' : 's'} on your farm` : 'Buy your first chicken in Market'}</div></div>
}
