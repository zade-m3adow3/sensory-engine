import React, { useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTreeStore } from '@/stores/treeStore';
import { AmbientLightShift } from './AmbientLightShift';
import { ProfileNode } from './ProfileNode';

export function TreeScene({ profileData = [] }: { profileData?: any[] }) {
  const { nodes, materials, scene } = useGLTF('/models/relationship_tree.glb');
  const scrollProgress = useTreeStore(state => state.scrollProgress);

  // Extract the tree mesh that contains the shape keys
  const treeMesh = useMemo(() => {
    let targetMesh: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name.includes("RelationshipTree")) {
        targetMesh = child as THREE.Mesh;
      }
    });
    return targetMesh;
  }, [scene]);

  // Extract dummy profile planes from GLTF to place our React components
  const profilePlanes = useMemo(() => {
    const planes: any[] = [];
    scene.traverse((child) => {
      if (child.name.startsWith('ProfilePlane_')) {
        planes.push(child);
        child.visible = false; // Hide the plain Blender billboard
      }
    });
    return planes;
  }, [scene]);

  // Smooth scroll-driven Morph animation
  useFrame(() => {
    if (treeMesh && treeMesh.morphTargetInfluences && treeMesh.morphTargetDictionary) {
      const seedIndex = treeMesh.morphTargetDictionary['Seed'];
      if (seedIndex !== undefined) {
        // scrollProgress 0 = fully collapsed seed (1.0 influence)
        // scrollProgress 1 = fully grown (0.0 influence)
        treeMesh.morphTargetInfluences[seedIndex] = 1.0 - scrollProgress;
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* Lights as specified */}
      <ambientLight intensity={0.1} color="#0a0f2e" />
      <directionalLight position={[5, 20, 5]} intensity={0.6} color="#b0c4ff" />
      <rectAreaLight position={[0, 25, 0]} width={20} height={20} intensity={0.4} color="#312e81" rotation={[-Math.PI/2, 0, 0]} />
      
      {/* Dynamic mood fog and root light */}
      <AmbientLightShift />

      {/* The 3D GLTF Geometry */}
      <primitive object={scene} />

      {/* Render custom interactive ProfileNodes at the original node coordinates */}
      {profilePlanes.map((plane) => {
        const nodeIndex = plane.userData.node_index || 0;
        const zone = plane.userData.zone || 'unknown';
        const relationshipType = plane.userData.relationship_type || 'friend';
        
        const pos = new THREE.Vector3();
        plane.getWorldPosition(pos);

        // Fallback dummy data if actual profileData isn't loaded from Supabase yet
        const user = profileData.find(u => u.zone === zone && u.nodeIndex === nodeIndex) || {
          userId: `${zone}-${nodeIndex}`,
          nickname: `User ${nodeIndex}`,
          avatarUrl: null,
          relationshipType: relationshipType
        };

        return (
          <ProfileNode
            key={plane.name}
            position={[pos.x, pos.y, pos.z]}
            userId={user.userId}
            avatarUrl={user.avatarUrl}
            nickname={user.nickname}
            relationshipType={user.relationshipType}
            nodeIndex={nodeIndex}
            zone={zone}
          />
        );
      })}

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.3} intensity={0.8} mipmapBlur />
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={1.5} />
        <Vignette offset={0.4} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

// Preload the GLB so it's ready immediately
useGLTF.preload('/models/relationship_tree.glb');
