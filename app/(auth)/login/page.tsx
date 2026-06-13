"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";

/* ──────────── 3-D helpers ──────────── */

function HelixRibbon() {
  const ref = useRef<THREE.Group>(null!);

  const makeTube = (phase: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 4 + phase;
      pts.push(new THREE.Vector3(Math.cos(t) * 1.8, (i / 120) * 6 - 3, Math.sin(t) * 1.8));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.025, 8, false);
  };

  const geo1 = makeTube(0);
  const geo2 = makeTube(Math.PI);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.2;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geo1}>
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={2.2} transparent opacity={0.75} />
      </mesh>
      <mesh geometry={geo2}>
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={2.2} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 220;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 13;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 9;
    const g = Math.random() > 0.5;
    col[i * 3]     = g ? 0.08 : 0.28;
    col[i * 3 + 1] = g ? 0.82 : 0.52;
    col[i * 3 + 2] = g ? 0.28 : 1.0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.03; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.82} sizeAttenuation />
    </points>
  );
}

function CentralObject() {
  const torusRef  = useRef<THREE.Mesh>(null!);
  const innerRef  = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (torusRef.current) {
      torusRef.current.rotation.x = clock.elapsedTime * 0.15;
      torusRef.current.rotation.z = clock.elapsedTime * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = clock.elapsedTime * 0.5;
      innerRef.current.rotation.x = clock.elapsedTime * 0.3;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        <mesh ref={torusRef}>
          <torusGeometry args={[1.4, 0.08, 32, 100]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={3} metalness={0.92} roughness={0.08} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.4, 0.04, 16, 100]} />
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={2} metalness={0.9} roughness={0.1} transparent opacity={0.6} />
        </mesh>
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#3b82f6" emissiveIntensity={1.6} metalness={1} roughness={0.05} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={5} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene3D() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 3]}   intensity={3}   color="#22d3ee" />
      <pointLight position={[3, 2, -2]}  intensity={2}   color="#6366f1" />
      <pointLight position={[-3, -2, 2]} intensity={1.5} color="#a78bfa" />
      <Stars radius={60} depth={40} count={3000} factor={3} fade speed={0.5} />
      <FloatingParticles />
      <HelixRibbon />
      <CentralObject />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={2.8} mipmapBlur radius={0.8} />
      </EffectComposer>
    </>
  );
}

/* ──────────── Page ──────────── */

export default function LoginPage() {
  return (
    <main className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ background: "transparent" }}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Main Centered Container */}
      <div className="relative z-10 w-full max-w-[440px] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-8 w-full flex flex-col items-center bg-[#09090b] border border-white/10 rounded-2xl relative z-20"
          style={{
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header Introduction */}
          <div className="text-center mb-8">
            <p
              className="text-xs mb-2 tracking-[0.3em] uppercase"
              style={{ fontFamily: "Orbitron, monospace", color: "rgba(34,211,238,0.7)" }}
            >
              Sign In to
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                background: "linear-gradient(135deg, #ffffff 25%, #22d3ee 75%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(34,211,238,0.3))",
              }}
            >
              Rounak's World
            </h1>
            <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Welcome back to your personalized universe.
            </p>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-8" />

          {/* Form */}
          <div className="w-full">
            <LoginForm />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
