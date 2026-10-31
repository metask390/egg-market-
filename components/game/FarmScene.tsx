'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function FarmChicken({ index, eggReady }: { index: number; eggReady: boolean }) {
  const { scene } = useGLTF('/chicken.glb'); const model = useMemo(() => scene.clone(true), [scene]); const ref = useRef<THREE.Group>(null)
  const positions: [number, number, number][] = [[-2.1, .18, .2], [-.7, .18, .65], [.7, .18, .65], [2.1, .18, .2], [-1.7, .18, -1], [0, .18, -1], [1.7, .18, -1], [-1.1, .18, -1.85], [.4, .18, -1.85], [1.8, .18, -1.7]]
  const [x, y, z] = positions[index % positions.length]
  useFrame(({ clock }) => { if (ref.current) { const t = clock.getElapsedTime() + index * .7; ref.current.position.y = y + Math.sin(t * 1.35) * .035; ref.current.rotation.y = Math.sin(t * .25) * .06; ref.current.rotation.z = Math.sin(t * .8) * .018 } })
  model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true } })
  return <group ref={ref} position={[x, y, z]}><primitive object={model} scale={.72} rotation={[0, Math.PI, 0]} />{eggReady && <mesh position={[0, .12, .38]} scale={[.16, .23, .16]} castShadow><sphereGeometry args={[.45, 24, 18]} /><meshStandardMaterial color="#fff4c9" emissive="#ffd83d" emissiveIntensity={.45} roughness={.28} /></mesh>}</group>
}

export default function FarmScene({ count, eggReady = false }: { count: number; eggReady?: boolean }) {
  const visibleCount = Math.min(Math.max(count, 0), 10)
  return <div className="farm-scene"><Canvas shadows dpr={[1, 2]} camera={{ position: [0, 4.7, 6.8], fov: 42 }}><ambientLight intensity={1.15} /><directionalLight position={[4, 7, 5]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} /><Environment preset="sunset" /><mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.4, 64]} /><meshStandardMaterial color="#8d623d" roughness={1} /></mesh><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .01, 0]}><ringGeometry args={[3, 3.4, 64]} /><meshStandardMaterial color="#b17a45" roughness={1} /></mesh>{Array.from({ length: visibleCount }, (_, i) => <FarmChicken index={i} eggReady={eggReady} key={i} />)}<ContactShadows position={[0, .02, 0]} opacity={.34} scale={7} blur={2.6} far={5} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={.75} maxPolarAngle={1.35} target={[0, .35, 0]} /></Canvas><div className="farm-scene-caption">{visibleCount ? `${visibleCount} chicken${visibleCount === 1 ? '' : 's'} on your farm` : 'Buy your first chicken in Market'}</div></div>
}
