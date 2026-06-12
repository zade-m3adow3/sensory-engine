"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import TreeMesh from "./TreeMesh";
import { Suspense, useState } from "react";
import ProfileModal from "../profile/ProfileModal";

export default function TreeCanvas({ scrollProgress }: { scrollProgress: number }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Dynamic lighting color based on scroll progress
  // Base: #ffffff
  // Root: #facc15 (yellow/gold)
  // Mid: #3b82f6 (blue)
  // Crown: #f43f5e (rose)
  let ambientColor = "#ffffff";
  if (scrollProgress > 0.1 && scrollProgress <= 0.4) ambientColor = "#facc15";
  else if (scrollProgress > 0.4 && scrollProgress <= 0.8) ambientColor = "#3b82f6";
  else if (scrollProgress > 0.8) ambientColor = "#f43f5e";

  return (
    <>
      <Canvas camera={{ position: [0, -2, 10], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} color={ambientColor} />
        <directionalLight position={[10, 10, 5]} intensity={1} color={ambientColor} />
        <directionalLight position={[-10, -10, -5]} intensity={0.2} />
        
        <Suspense fallback={null}>
          <TreeMesh scrollProgress={scrollProgress} onNodeClick={setSelectedUserId} />
          {/* Environment adds nice subtle reflections */}
          <Environment preset="night" />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3} // Look slightly up
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {selectedUserId && (
        <ProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
}
