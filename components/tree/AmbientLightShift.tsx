import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '@/stores/treeStore';
import * as THREE from 'three';

export function AmbientLightShift() {
  const hoveredRelationshipType = useTreeStore(state => state.hoveredRelationshipType);
  const pointLightRef = useRef<THREE.PointLight>(null);

  const targetColor = new THREE.Color();
  const currentColor = new THREE.Color('#000000');

  useFrame((state) => {
    if (hoveredRelationshipType === 'parent' || hoveredRelationshipType === 'roots') {
      targetColor.set('#f59e0b'); // Gold
    } else if (hoveredRelationshipType === 'friend' || hoveredRelationshipType === 'relative' || hoveredRelationshipType === 'cousin') {
      targetColor.set('#3b82f6'); // Blue
    } else if (hoveredRelationshipType === 'romantic_partner') {
      targetColor.set('#f43f5e'); // Rose
    } else {
      targetColor.set('#000000'); // Default 
    }

    // Lerp colors smooth at 0.02 per frame (~0.8s)
    currentColor.lerp(targetColor, 0.02);

    // Apply to PointLight (Warm Root Glow)
    if (pointLightRef.current) {
      const baseColor = new THREE.Color('#f59e0b');
      const finalPointColor = hoveredRelationshipType ? currentColor : baseColor;
      pointLightRef.current.color.lerp(finalPointColor, 0.02);
    }

    // Apply to Scene Fog
    if (state.scene.fog) {
      (state.scene.fog as THREE.FogExp2).color.copy(currentColor);
      
      let targetDensity = 0.002;
      if (hoveredRelationshipType === 'parent' || hoveredRelationshipType === 'roots') targetDensity = 0.15;
      else if (hoveredRelationshipType === 'friend' || hoveredRelationshipType === 'relative' || hoveredRelationshipType === 'cousin') targetDensity = 0.10;
      else if (hoveredRelationshipType === 'romantic_partner') targetDensity = 0.12;
      
      (state.scene.fog as THREE.FogExp2).density += (targetDensity - (state.scene.fog as THREE.FogExp2).density) * 0.02;
    } else {
      state.scene.fog = new THREE.FogExp2(currentColor.getHex(), 0.002);
    }
  });

  return (
    <pointLight 
      ref={pointLightRef}
      position={[0, 0, 0]} 
      intensity={0.8} 
      color="#f59e0b" 
    />
  );
}
