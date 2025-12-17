import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'

function Model({ url }){
  const { scene } = useGLTF(url)
  return <primitive object={scene} dispose={null} />
}

export default function Hero3D({ product }){
  const [show3D, setShow3D] = useState(false)
  const hasModel = !!product.modelUrl
  return (
    <section className="grid md:grid-cols-2 gap-6 items-center py-10">
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-700 to-yellow-500 text-black text-xs font-semibold">Premium Collection</div>
        <h1 className="mt-6 text-5xl md:text-6xl font-serif leading-tight">BREATHE <span className="text-gradient">ROYALTY</span></h1>
        <p className="mt-4 text-gray-300 max-w-xl">Experience the pinnacle of vaping technology — precision engineering, luxury finishes, and unforgettable flavours.</p>
        <div className="mt-6 flex gap-3">
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 to-yellow-500 text-black font-semibold">Shop now</button>
          <button className="px-6 py-3 rounded-full border border-neutral-800">View collection</button>
        </div>
      </div>

      <div className="h-96 rounded-2xl bg-black/40 p-2 flex items-center justify-center overflow-hidden border border-neutral-800">
        {!hasModel || !show3D ? (
          <div className="relative w-full h-full">
            <img src={product.poster} alt={product.name} className="object-contain w-full h-full" />
            {hasModel && (
              <button onClick={() => setShow3D(true)} className="absolute right-4 bottom-4 bg-purple-700/90 text-white px-3 py-1 rounded-full text-sm shadow-lg">View 3D</button>
            )}
          </div>
        ) : (
          <Canvas camera={{ fov: 35, position: [0,0,3] }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5,10,5]} intensity={1.2} />
            <Suspense fallback={<img src={product.poster} alt="poster" className="w-full h-full object-cover" />}>
              <Model url={product.modelUrl} />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls enablePan={false} />
          </Canvas>
        )}
      </div>
    </section>
  )
}
