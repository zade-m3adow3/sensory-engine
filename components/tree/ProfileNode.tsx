import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Circle, Torus, Sparkles } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useTreeStore } from '@/stores/treeStore';

interface ProfileNodeProps {
  position: [number, number, number];
  userId: string;
  avatarUrl: string | null;
  nickname: string;
  relationshipType: string;
  nodeIndex: number;
  zone: string;
  isBirthday?: boolean;
}

export function ProfileNode({
  position,
  userId,
  avatarUrl,
  nickname,
  relationshipType,
  nodeIndex,
  zone,
  isBirthday = false
}: ProfileNodeProps) {
  const [hovered, setHovered] = useState(false);
  const setHoveredUser = useTreeStore(state => state.setHoveredUser);
  const setSelectedUser = useTreeStore(state => state.setSelectedUser);
  const groupRef = useRef<THREE.Group>(null);
  
  // Safe texture loading without suspense throwing
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    try {
      return loader.load(avatarUrl || '/placeholder.png'); // assuming a placeholder
    } catch {
      return new THREE.Texture();
    }
  }, [avatarUrl]);

  // Generate circular crop mask dynamically using canvas
  const alphaMap = useMemo(() => {
    if (typeof document === 'undefined') return null; // SSR safety
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 128, 128, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const prefersReducedMotion = useReducedMotion();

  // Use react-spring/three for fluid scale/emission transitions
  const { scale, ringEmission } = useSpring({
    scale: hovered ? 1.25 : 1.0,
    ringEmission: hovered ? 2.0 : 0.8,
    config: { mass: 1, tension: 200, friction: 15 },
    immediate: prefersReducedMotion
  });

  const baseColor = useMemo(() => {
    if (zone.includes('root') || relationshipType === 'parent') return '#f59e0b'; 
    if (zone.includes('fruit') || relationshipType === 'romantic_partner') return '#f43f5e';
    return '#3b82f6';
  }, [zone, relationshipType]);

  const [rainbowHue, setRainbowHue] = useState(0);

  useFrame((state, delta) => {
    if (groupRef.current && !prefersReducedMotion) {
      // Gentle floating animation per node (disabled if reduced motion preferred)
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + nodeIndex * 0.7) * 0.05;
    }
    if (isBirthday && !prefersReducedMotion) {
      setRainbowHue(h => (h + delta * 0.5) % 1);
    }
  });

  const ringColor = isBirthday ? new THREE.Color().setHSL(rainbowHue, 1, 0.5) : new THREE.Color(baseColor);

  return (
    <a.group 
      ref={groupRef}
      position={position} 
      scale={scale as any}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredUser(userId, relationshipType);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        setHoveredUser(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedUser(userId);
      }}
    >
      <Circle args={[0.7, 32]}>
        <meshBasicMaterial 
          map={texture} 
          alphaMap={alphaMap || undefined} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </Circle>

      <a.mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.75, 0.05, 16, 64]} />
        <a.meshStandardMaterial 
          color={ringColor} 
          emissive={ringColor} 
          emissiveIntensity={ringEmission as any} 
          toneMapped={false}
        />
      </a.mesh>

      {isBirthday && (
        <Sparkles count={50} scale={2} size={4} speed={0.4} color={ringColor} />
      )}

      {/* Screen Reader Only Access Button inside HTML */}
      <Html position={[0,0,0]}>
        <button 
          className="sr-only" 
          aria-label={`Profile node for ${nickname}, ${relationshipType.replace('_', ' ')}`}
          onClick={(e) => { e.stopPropagation(); setSelectedUser(userId); }}
        >
          View Profile
        </button>
      </Html>

      {hovered && (
        <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none', zIndex: 10 }}>
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-[#000000]/60 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_4px_32px_rgba(0,0,0,0.5)] whitespace-nowrap animate-in fade-in zoom-in duration-200" aria-hidden="true">
            <span className="text-white font-space-grotesk font-bold text-sm drop-shadow-md">
              {nickname}
            </span>
            <span className="text-blue-300 font-inter text-xs capitalize mt-0.5 opacity-80">
              {relationshipType.replace('_', ' ')}
            </span>
          </div>
        </Html>
      )}
    </a.group>
  );
}
