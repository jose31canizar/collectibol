import { useRef, useMemo, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Color, AdditiveBlending } from 'three';
import { Object3DInstance } from '../store/useStore';
import {
  bloomGlowVertex,
  bloomGlowFragment,
  BLOOM_GLOW_UNIFORMS,
} from '../shaders/bloomGlowShaders';

interface ProceduralObjectProps {
  instance: Object3DInstance;
  isSelected: boolean;
  onSelect: () => void;
}

function createBloomMaterial(color: string): ShaderMaterial {
  const uniforms = {
    uColor: { value: new Color(color) },
    u_time: { value: BLOOM_GLOW_UNIFORMS.u_time.value },
    uWaviness: { value: BLOOM_GLOW_UNIFORMS.uWaviness.value },
    uFalloff: { value: BLOOM_GLOW_UNIFORMS.uFalloff.value },
    uGlowInternalRadius: { value: BLOOM_GLOW_UNIFORMS.uGlowInternalRadius.value },
    uGlowSharpness: { value: BLOOM_GLOW_UNIFORMS.uGlowSharpness.value },
    uOpacity: { value: BLOOM_GLOW_UNIFORMS.uOpacity.value },
  };
  return new ShaderMaterial({
    vertexShader: bloomGlowVertex,
    fragmentShader: bloomGlowFragment,
    uniforms,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: 2, // DoubleSide
  });
}

export function ProceduralObject({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const meshRef = useRef<any>(null);
  const currentScaleRef = useRef(instance.scale);
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);

  const targetScale = isSelected ? instance.scale * 1.2 : instance.scale;

  const bloomMaterial = useMemo(() => {
    if (!isSelected) return null;
    if (bloomMaterialRef.current) {
      bloomMaterialRef.current.dispose();
      bloomMaterialRef.current = null;
    }
    const mat = createBloomMaterial(instance.color);
    bloomMaterialRef.current = mat;
    return mat;
  }, [isSelected, instance.color]);

  useEffect(() => {
    if (!isSelected && bloomMaterialRef.current) {
      bloomMaterialRef.current.dispose();
      bloomMaterialRef.current = null;
    }
  }, [isSelected]);

  useFrame((state) => {
    if (bloomMaterialRef.current?.uniforms?.u_time) {
      bloomMaterialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });

  const defaultMaterial = useMemo(
    () => <meshLambertMaterial color={instance.color} />,
    [instance.color]
  );

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

  function getGeometry(): ReactElement {
    switch (instance.shapeType) {
      case 'box':
        return <boxGeometry args={[instance.size, instance.size, instance.size]} />;
      case 'sphere':
        return <sphereGeometry args={[instance.size, 16, 16]} />;
      case 'torus':
        return <torusGeometry args={[instance.size, instance.size * 0.3, 16, 100]} />;
      case 'cone':
        return <coneGeometry args={[instance.size, instance.size * 1.5, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[instance.size, instance.size, instance.size * 1.5, 16]} />;
      default:
        return <boxGeometry args={[instance.size, instance.size, instance.size]} />;
    }
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
      {getGeometry()}
      {bloomMaterial ? (
        <primitive object={bloomMaterial} attach="material" />
      ) : (
        defaultMaterial
      )}
    </mesh>
  );
}
