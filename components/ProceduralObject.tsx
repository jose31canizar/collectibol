import { useRef, useMemo } from 'react';
import { Object3DInstance } from '../store/useStore';

interface ProceduralObjectProps {
  instance: Object3DInstance;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProceduralObject({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const meshRef = useRef<any>(null);
  const currentScaleRef = useRef(instance.scale);

  const targetScale = isSelected ? instance.scale * 1.2 : instance.scale;

  // Precompute material
  const material = useMemo(() => (
    <meshLambertMaterial color={instance.color} />
  ), [instance.color]);

  // useFrame((_, delta) => {
  //   const mesh = meshRef.current;
  //   if (!mesh) return;

  //   // Smooth scale
  //   const scaleDiff = targetScale - currentScaleRef.current;
  //   if (Math.abs(scaleDiff) > 0.001) {
  //     currentScaleRef.current += scaleDiff * delta * 5;
  //     mesh.scale.setScalar(currentScaleRef.current);
  //   } else {
  //     currentScaleRef.current = targetScale;
  //     mesh.scale.setScalar(targetScale);
  //   }

  //   // Rotation
  //   mesh.rotation.x += instance.animationSpeed * delta * 0.5;
  //   mesh.rotation.y += instance.animationSpeed * delta * 0.3;
  // });

  let geometry: JSX.Element;
  switch (instance.shapeType) {
    case 'box':
      geometry = <boxGeometry args={[instance.size, instance.size, instance.size]} />;
      break;
    case 'sphere':
      geometry = <sphereGeometry args={[instance.size, 16, 16]} />; // lower segments for mobile
      break;
    case 'torus':
      geometry = <torusGeometry args={[instance.size, instance.size * 0.3, 16, 100]} />;
      break;
    case 'cone':
      geometry = <coneGeometry args={[instance.size, instance.size * 1.5, 16]} />;
      break;
    case 'cylinder':
      geometry = <cylinderGeometry args={[instance.size, instance.size, instance.size * 1.5, 16]} />;
      break;
    default:
      geometry = <boxGeometry args={[instance.size, instance.size, instance.size]} />;
      break;
  }

  return (
    <mesh
      ref={meshRef}
      position={instance.position}
      rotation={instance.rotation}
      scale={instance.scale}
      onClick={onSelect}
      castShadow
      receiveShadow
    >
      {geometry}
      {material}
    </mesh>
  );
}
