"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import { useUserStore } from "@/stores/userStore";
import { useSpring, animated } from "@react-spring/three";

interface Props {
  scrollProgress: number;
  onNodeClick: (id: string) => void;
}

function GLBTree({ glb, scrollProgress, onNodeClick }: { glb: any; scrollProgress: number; onNodeClick: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Clone the scene so we don't mutate the cached GLTF
  const scene = useMemo(() => glb.scene.clone(), [glb.scene]);
  const animations = glb.animations;
  
  const { actions } = useAnimations(animations, groupRef);

  // Extract Profile Planes
  const profilePlanes = useMemo(() => {
    const planes: any[] = [];
    scene.traverse((child: any) => {
      if (child.name.startsWith('ProfilePlane_')) {
        planes.push(child);
        child.visible = false; // Hide the actual blender plane
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return planes;
  }, [scene]);

  // Auto-scale to roughly 12 units high so it's not a tiny dot
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (maxDim > 0) {
      const targetScale = 12 / maxDim;
      scene.scale.setScalar(targetScale);
      
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.x = -center.x * targetScale;
      scene.position.z = -center.z * targetScale;
      scene.position.y = -box.min.y * targetScale - 2; // offset down slightly
    }
  }, [scene]);

  // Play and pause all animations so we can scrub them
  useEffect(() => {
    for (const key in actions) {
      const action = actions[key];
      if (action) {
        action.play();
        action.paused = true;
      }
    }
  }, [actions]);

  useFrame(() => {
    // Scrub animations based on scroll progress
    for (const key in actions) {
      const action = actions[key];
      if (action) {
        const duration = action.getClip().duration;
        // Smoothly interpolate to the target time
        action.time = THREE.MathUtils.lerp(action.time, scrollProgress * duration, 0.05);
      }
    }
    
    // Slow rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      
      {/* Attach interactive UI nodes to the invisible profile planes */}
      {profilePlanes.map((plane, idx) => {
        const pos = new THREE.Vector3();
        plane.getWorldPosition(pos);
        
        // Ensure scale is maintained relative to world
        const scaleVec = new THREE.Vector3();
        plane.getWorldScale(scaleVec);

        return (
          <ProfileNode 
            key={idx}
            position={[pos.x, pos.y, pos.z]} 
            type={plane.userData.relationship_type || "friend"} 
            id={`node_${idx}`} 
            nickname={plane.userData.nickname || `Node ${idx + 1}`} 
            onNodeClick={onNodeClick} 
          />
        );
      })}
    </group>
  );
}

function ProfileNode({ position, type, id, nickname, onNodeClick, isOwn = false }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { scale } = useSpring({
    scale: hovered ? 1.4 : 1,
    config: { mass: 1, tension: 300, friction: 15 }
  });

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  const getColor = () => {
    if (type === "parent") return "#eab308";
    if (type === "romantic_partner" || type === "Partner") return "#f43f5e";
    if (type === "friend" || type === "Friend") return "#3b82f6";
    return "#f59e0b"; // relative/cousin
  };

  return (
    <group position={position}>
      <animated.mesh 
        ref={meshRef}
        scale={scale as any}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onNodeClick(id); }}
      >
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} transparent opacity={0.8} />
        
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.45, 0.52, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={hovered || isOwn ? 1 : 0.6} />
        </mesh>
      </animated.mesh>

      {(hovered || isOwn) && (
        <Html position={[0, 0.7, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="px-3 py-1.5 text-center whitespace-nowrap rounded-lg border border-white/10" style={{ background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(8px)" }}>
            <div className="text-white font-space-grotesk font-bold text-[0.85rem] drop-shadow-md">{nickname}</div>
            <div className="text-white/60 font-inter text-[0.6rem] uppercase tracking-widest mt-0.5">{type}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function TreeMesh({ scrollProgress, onNodeClick }: Props) {
  const glb = useGLTF('/models/relationship_tree.glb');
  
  return (
    <group>
      <GLBTree glb={glb} scrollProgress={scrollProgress} onNodeClick={onNodeClick} />
    </group>
  );
}

useGLTF.preload('/models/relationship_tree.glb');
