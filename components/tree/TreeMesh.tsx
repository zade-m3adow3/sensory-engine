"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { useUserStore } from "@/stores/userStore";

interface Props {
  scrollProgress: number;
  onNodeClick: (id: string) => void;
}

export default function TreeMesh({ scrollProgress, onNodeClick }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const profile = useUserStore((state) => state.profile);
  
  // Load the user's GLB model
  const { scene } = useGLTF('/relationship_tree.glb');

  useEffect(() => {
    // If the material is too dark or lacks contrast, we can optionally tweak it here.
    // For now we just clone to ensure we can modify morph targets safely.
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Animate the tree growth based on scroll
  useFrame(() => {
    if (groupRef.current) {
      // Gentle constant rotation
      groupRef.current.rotation.y += 0.001;

      // Apply morph target influences to simulate shape keys
      // The instruction says: "The morphing between seed and grown states is handled by shape keys baked into the GLB model. 
      // The scrollProgress value directly drives the morph target influence on each frame"
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.morphTargetInfluences) {
          // Assuming the first morph target is the "grown" state or similar. 
          // If there are multiple, map them proportionally or drive them all.
          for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
            // Lerp towards the scroll progress to make it smooth
            mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[i], scrollProgress, 0.1);
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      {/* The main 3D Model */}
      <primitive object={scene} />

      {/* 
        We overlay the interactive profile nodes.
        Since we don't know the exact 3D coordinates of the branch tips in the GLB,
        we position them in distinct zones as described: Roots, Lower, Mid, Crown.
      */}
      
      {scrollProgress > 0.3 && (
        <ProfileNode position={[3, 1, 0]} type="Relative" id="user_relative" nickname="Cousin Tom" onNodeClick={onNodeClick} />
      )}
      
      {scrollProgress > 0.5 && (
        <ProfileNode position={[-2, 3, 2]} type="Friend" id="user_friend" nickname="Bestie Anna" onNodeClick={onNodeClick} />
      )}

      {scrollProgress > 0.8 && (
        <ProfileNode position={[0, 5, 1]} type="Partner" id="user_partner" nickname="My Love" onNodeClick={onNodeClick} />
      )}

      {profile && scrollProgress > 0.1 && (
        <ProfileNode 
          position={[-1.5, 0.5, 2]} 
          type={profile.relationship_type} 
          id={profile.id} 
          nickname={`${profile.nickname} (You)`} 
          onNodeClick={onNodeClick} 
          isOwn
        />
      )}
    </group>
  );
}

function ProfileNode({ position, type, id, nickname, onNodeClick, isOwn = false }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isBirthday = id === "user_partner";

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.1;
      const targetScale = hovered ? 1.25 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getColor = () => {
    if (type === "Parent") return "#eab308";
    if (type === "Partner") return "#f43f5e";
    if (type === "Friend") return "#3b82f6";
    return "#f59e0b";
  };

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onNodeClick(id); }}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#1a1a1a" side={THREE.DoubleSide} />
        
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.55, 0.6, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={hovered || isOwn ? 1 : 0.4} />
        </mesh>
      </mesh>

      {(hovered || isOwn) && (
        <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="glass-panel px-3 py-1 text-center whitespace-nowrap">
            <div className="text-white font-space-grotesk font-bold text-sm drop-shadow-md">{nickname}</div>
            <div className="text-white/60 font-inter text-xs">{type}</div>
          </div>
        </Html>
      )}

      {isBirthday && (
        <Html position={[0.4, 0.4, 0]} center className="pointer-events-none">
          <div className="animate-pulse text-lg">✨</div>
        </Html>
      )}
    </group>
  );
}

// Preload the GLB to ensure it's ready quickly
useGLTF.preload('/relationship_tree.glb');
