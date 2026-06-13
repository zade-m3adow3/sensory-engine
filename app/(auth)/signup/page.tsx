"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "framer-motion";
import SignupForm from "@/components/auth/SignupForm";
import confetti from "canvas-confetti";

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

export default function SignupPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const handleSignupSuccess = () => {
    const end = Date.now() + 3000;
    const colors = ["#6366f1", "#22d3ee", "#a78bfa", "#f43f5e", "#ffffff", "#eab308"];
    (function frame() {
      confetti({ particleCount: 6, angle: 60,  spread: 60, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="bg-black text-white">
      {/* ── SECTION 1: 3D Hero ── */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          className="absolute inset-0 w-full h-full"
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>

        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9 }}
          >
            <p
              className="text-xs mb-3 tracking-[0.4em] uppercase"
              style={{ fontFamily: "Orbitron, monospace", color: "rgba(34,211,238,0.55)" }}
            >
              Welcome to
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                background: "linear-gradient(135deg, #ffffff 25%, #22d3ee 75%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 35px rgba(34,211,238,0.4))",
              }}
            >
              Rounak's World
            </h1>
            <p className="text-white/40 mt-4 text-sm md:text-base max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              A living, breathing digital universe built around one person — and the people who matter most.
            </p>
          </motion.div>
        </div>

        {/* Scroll down CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          onClick={scrollToForm}
          className="absolute bottom-10 flex flex-col items-center gap-3 pointer-events-auto group"
          aria-label="Scroll down to sign up"
        >
          <p
            className="text-xs tracking-[0.38em] uppercase transition-colors group-hover:text-cyan-300"
            style={{ fontFamily: "Orbitron, monospace", color: "rgba(34,211,238,0.5)" }}
          >
            Scroll Down
          </p>
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
            className="w-6 h-9 rounded-full border border-cyan-500/35 flex items-start justify-center pt-1.5 group-hover:border-cyan-400/60 transition-colors"
          >
            <div className="w-1 h-2.5 rounded-full bg-cyan-400/65" />
          </motion.div>
        </motion.button>
      </section>

      {/* ── SECTION 2: Signup Form ── */}
      <section
        ref={formRef}
        className="relative min-h-screen flex items-center justify-center p-6"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(3,15,40,0.97) 0%, #000 65%)" }}
      >
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <p
              className="text-center mb-8"
              style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.38em",
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
              }}
            >
              Create your place in the universe
            </p>
            <SignupForm onSuccess={handleSignupSuccess} />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
