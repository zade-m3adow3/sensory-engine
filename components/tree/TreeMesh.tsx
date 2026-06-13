"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { useUserStore } from "@/stores/userStore";
import { useSpring, animated } from "@react-spring/three";

interface Props {
  scrollProgress: number;
  onNodeClick: (id: string) => void;
}

function ProceduralTree({ scrollProgress }: { scrollProgress: number }) {
  // A beautiful abstract procedural tree fallback if GLB is missing
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  const { scale } = useSpring({
    scale: scrollProgress > 0 ? scrollProgress * 1.5 : 0.1,
    config: { mass: 1, tension: 170, friction: 26 }
  });

  return (
    <animated.group ref={groupRef} scale={scale} position={[0, -2, 0]}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 4, 16]} />
        <meshStandardMaterial color="#312e81" metalness={0.8} roughness={0.2} emissive="#1e1b4b" />
      </mesh>
      {/* Branches */}
      <mesh position={[-1, 4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.2, 3, 16]} />
        <meshStandardMaterial color="#312e81" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1, 4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.2, 3, 16]} />
        <meshStandardMaterial color="#312e81" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Leaves/Energy */}
      <mesh position={[-2, 5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.6} emissive="#0891b2" />
      </mesh>
      <mesh position={[2, 5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.6} emissive="#7c3aed" />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.6} emissive="#4f46e5" />
      </mesh>
    </animated.group>
  );
}

function GLBTree({ scene, scrollProgress }: { scene: THREE.Object3D; scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optional: Enhance material for glowing neon effect
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (material) {
          material.metalness = 0.8;
          material.roughness = 0.2;
        }
      }
    });
  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;

      // Morph target animation using robust lookup
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
          for (const key in mesh.morphTargetDictionary) {
            // Find targets related to growth or seed
            if (key.toLowerCase().includes("seed") || key.toLowerCase().includes("grow")) {
              const idx = mesh.morphTargetDictionary[key];
              if (idx !== undefined) {
                // If it's a seed target, influence goes down as we scroll.
                // If it's a grow target, influence goes up.
                const targetVal = key.toLowerCase().includes("seed") ? 1.0 - scrollProgress : scrollProgress;
                mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
                  mesh.morphTargetInfluences[idx],
                  targetVal,
                  0.1
                );
              }
            }
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export default function TreeMesh({ scrollProgress, onNodeClick }: Props) {
  const profile = useUserStore((state) => state.profile);
  
  // Attempt to load GLB. We use try/catch in case the file is missing/corrupted.
  let glb: any = null;
  try {
    glb = useGLTF('/models/relationship_tree.glb');
  } catch (err) {
    console.warn("Failed to load GLB, using procedural fallback");
  }

  return (
    <group>
      {glb && glb.scene ? (
        <GLBTree scene={glb.scene} scrollProgress={scrollProgress} />
      ) : (
        <ProceduralTree scrollProgress={scrollProgress} />
      )}

      {/* Nodes */}
      {scrollProgress > 0.3 && (
        <ProfileNode position={[3, -1, 0]} type="Relative" id="user_relative" nickname="Cousin Tom" onNodeClick={onNodeClick} />
      )}
      
      {scrollProgress > 0.5 && (
        <ProfileNode position={[-2, 1, 2]} type="Friend" id="user_friend" nickname="Bestie Anna" onNodeClick={onNodeClick} />
      )}

      {scrollProgress > 0.8 && (
        <ProfileNode position={[0, 3, 1]} type="Partner" id="user_partner" nickname="My Love" onNodeClick={onNodeClick} />
      )}

      {profile && scrollProgress > 0.1 && (
        <ProfileNode 
          position={[-1.5, -2, 2]} 
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

  const { scale } = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { mass: 1, tension: 300, friction: 15 }
  });

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.15;
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
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} transparent opacity={0.8} />
        
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.55, 0.62, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={hovered || isOwn ? 1 : 0.6} />
        </mesh>
      </animated.mesh>

      {(hovered || isOwn) && (
        <Html position={[0, 0.9, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="glass-panel px-3 py-1.5 text-center whitespace-nowrap" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="text-white font-space-grotesk font-bold text-[0.85rem] drop-shadow-md">{nickname}</div>
            <div className="text-white/60 font-inter text-[0.6rem] uppercase tracking-widest mt-0.5">{type}</div>
          </div>
        </Html>
      )}

      {isBirthday && (
        <Html position={[0.4, 0.4, 0]} center className="pointer-events-none">
          <div className="animate-glow-pulse text-xl" style={{ filter: "drop-shadow(0 0 10px #f43f5e)" }}>✨</div>
        </Html>
      )}
    </group>
  );
}

// Preload
try {
  useGLTF.preload('/models/relationship_tree.glb');
} catch (e) {}
