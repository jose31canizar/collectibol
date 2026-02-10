import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Mesh } from 'three';
import { Object3DInstance } from '../store/useStore';
import { MeshBasicMaterial } from 'three';

interface ProceduralObjectProps {
  instance: Object3DInstance;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProceduralObject({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const [targetScale, setTargetScale] = useState(instance.scale);
  const currentScaleRef = useRef(instance.scale);

  // Update target scale when selection changes
  useEffect(() => {
    setTargetScale(isSelected ? instance.scale * 1.2 : instance.scale);
  }, [isSelected, instance.scale]);

  // Update material opacity based on selection
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = isSelected ? 0.8 : 1.0;
      materialRef.current.transparent = isSelected;
      materialRef.current.needsUpdate = true;
    }
  }, [isSelected]);

  // Animate scale smoothly and continuous rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth scale interpolation
      const scaleDiff = targetScale - currentScaleRef.current;
      if (Math.abs(scaleDiff) > 0.001) {
        currentScaleRef.current += scaleDiff * delta * 5; // Smooth interpolation speed
        meshRef.current.scale.setScalar(currentScaleRef.current);
      } else {
        currentScaleRef.current = targetScale;
        meshRef.current.scale.setScalar(targetScale);
      }

      // Continuous rotation animation
      meshRef.current.rotation.x += instance.animationSpeed * delta * 0.5;
      meshRef.current.rotation.y += instance.animationSpeed * delta * 0.3;
    }
  });

  const renderGeometry = () => {
    switch (instance.shapeType) {
      case 'box':
        return <boxGeometry args={[instance.size, instance.size, instance.size]} />;
      case 'sphere':
        return <sphereGeometry args={[instance.size, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[instance.size, instance.size * 0.3, 16, 100]} />;
      case 'cone':
        return <coneGeometry args={[instance.size, instance.size * 1.5, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[instance.size, instance.size, instance.size * 1.5, 32]} />;
      default:
        return <boxGeometry args={[instance.size, instance.size, instance.size]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={instance.position}
      rotation={instance.rotation}
      scale={instance.scale}
      onClick={onSelect}
    >
      {renderGeometry()}
      <meshBasicMaterial
        ref={materialRef}
        color={instance.color}
        opacity={isSelected ? 0.8 : 1.0}
        transparent={isSelected}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}
