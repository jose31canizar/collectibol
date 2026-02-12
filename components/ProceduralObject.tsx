import React, { useRef, useMemo, useEffect, useCallback, forwardRef } from 'react';
import type { ReactElement } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Mesh, Object3D } from 'three';
import { ShaderMaterial, Color, AdditiveBlending, Vector3 } from 'three';
import { usePhysicsBox, usePhysicsSphere, usePhysicsCylinder } from '../physics/PhysicsContext';
import { Object3DInstance, useStore } from '../store/useStore';
import {
  bloomGlowVertex,
  bloomGlowFragment,
  BLOOM_GLOW_UNIFORMS,
} from '../shaders/bloomGlowShaders';

interface ProceduralObjectProps {
  instance: Object3DInstance;
  isSelected: boolean;
  onSelect: (instanceId: string, worldPosition: Vector3) => void;
}

function createBloomMaterial(color: string, useSchlickFresnel: boolean): ShaderMaterial {
  const uniforms = {
    uColor: { value: new Color(color) },
    u_time: { value: BLOOM_GLOW_UNIFORMS.u_time.value },
    uWaviness: { value: BLOOM_GLOW_UNIFORMS.uWaviness.value },
    uFalloff: { value: BLOOM_GLOW_UNIFORMS.uFalloff.value },
    uGlowInternalRadius: { value: BLOOM_GLOW_UNIFORMS.uGlowInternalRadius.value },
    uGlowSharpness: { value: BLOOM_GLOW_UNIFORMS.uGlowSharpness.value },
    uOpacity: { value: BLOOM_GLOW_UNIFORMS.uOpacity.value },
    uUseSchlickFresnel: { value: useSchlickFresnel ? 1.0 : 0.0 },
    uF0: { value: BLOOM_GLOW_UNIFORMS.uF0.value },
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

export function ProceduralObject(props: ProceduralObjectProps) {
  const { instance } = props;
  switch (instance.shapeType) {
    case 'sphere':
      return <ProceduralObjectSphere {...props} />;
    case 'cylinder':
      return <ProceduralObjectCylinder {...props} />;
    case 'cone':
      return <ProceduralObjectCone {...props} />;
    case 'torus':
      return <ProceduralObjectTorus {...props} />;
    case 'box':
    default:
      return <ProceduralObjectBox {...props} />;
  }
}

function ProceduralObjectBox({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);
  const useSchlickFresnel = useStore((state) => state.useSchlickFresnel);
  const s = instance.size * instance.scale;
  const { ref } = usePhysicsBox({
    mass: 5,
    position: instance.position,
    rotation: instance.rotation,
    args: [s / 2, s / 2, s / 2],
  });
  return (
    <ProceduralObjectMesh
      ref={ref as any}
      instance={instance}
      isSelected={isSelected}
      onSelect={onSelect}
      bloomMaterialRef={bloomMaterialRef}
      useSchlickFresnel={useSchlickFresnel}
      geometry={<boxGeometry args={[instance.size, instance.size, instance.size]} />}
    />
  );
}

function ProceduralObjectSphere({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);
  const useSchlickFresnel = useStore((state) => state.useSchlickFresnel);
  const s = instance.size * instance.scale;
  const { ref } = usePhysicsSphere({
    mass: 5,
    position: instance.position,
    rotation: instance.rotation,
    args: [s / 2],
  });
  return (
    <ProceduralObjectMesh
      ref={ref as any}
      instance={instance}
      isSelected={isSelected}
      onSelect={onSelect}
      bloomMaterialRef={bloomMaterialRef}
      useSchlickFresnel={useSchlickFresnel}
      geometry={<sphereGeometry args={[instance.size, 16, 16]} />}
    />
  );
}

function ProceduralObjectCylinder({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);
  const useSchlickFresnel = useStore((state) => state.useSchlickFresnel);
  const s = instance.size * instance.scale;
  const { ref } = usePhysicsCylinder({
    mass: 5,
    position: instance.position,
    rotation: instance.rotation,
    args: [s / 2, s / 2, instance.size * 1.5, 16],
  });
  return (
    <ProceduralObjectMesh
      ref={ref as any}
      instance={instance}
      isSelected={isSelected}
      onSelect={onSelect}
      bloomMaterialRef={bloomMaterialRef}
      useSchlickFresnel={useSchlickFresnel}
      geometry={<cylinderGeometry args={[instance.size, instance.size, instance.size * 1.5, 16]} />}
    />
  );
}

function ProceduralObjectCone({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);
  const useSchlickFresnel = useStore((state) => state.useSchlickFresnel);
  const s = instance.size * instance.scale;
  const { ref } = usePhysicsCylinder({
    mass: 6,
    position: instance.position,
    rotation: instance.rotation,
    args: [0, s / 2, instance.size * 1.5, 16],
  });
  return (
    <ProceduralObjectMesh
      ref={ref as any}
      instance={instance}
      isSelected={isSelected}
      onSelect={onSelect}
      bloomMaterialRef={bloomMaterialRef}
      useSchlickFresnel={useSchlickFresnel}
      geometry={<coneGeometry args={[instance.size, instance.size * 1.5, 16]} />}
    />
  );
}

function ProceduralObjectTorus({ instance, isSelected, onSelect }: ProceduralObjectProps) {
  const bloomMaterialRef = useRef<ShaderMaterial | null>(null);
  const useSchlickFresnel = useStore((state) => state.useSchlickFresnel);
  const s = instance.size * instance.scale;
  const { ref } = usePhysicsBox({
    mass: 5,
    position: instance.position,
    rotation: instance.rotation,
    args: [(s * 1.5) / 2, (s * 0.6) / 2, (s * 1.5) / 2],
  });
  return (
    <ProceduralObjectMesh
      ref={ref as any}
      instance={instance}
      isSelected={isSelected}
      onSelect={onSelect}
      bloomMaterialRef={bloomMaterialRef}
      useSchlickFresnel={useSchlickFresnel}
      geometry={<torusGeometry args={[instance.size, instance.size * 0.3, 16, 100]} />}
    />
  );
}

interface ProceduralObjectMeshProps extends ProceduralObjectProps {
  bloomMaterialRef: React.MutableRefObject<ShaderMaterial | null>;
  useSchlickFresnel: boolean;
  geometry: React.ReactElement;
}

const _clickWorldPos = new Vector3();

const ProceduralObjectMesh = forwardRef<Mesh, ProceduralObjectMeshProps>(function ProceduralObjectMesh({
  instance,
  isSelected,
  onSelect,
  bloomMaterialRef,
  useSchlickFresnel,
  geometry,
}, ref) {
  const { camera } = useThree((s) => ({ camera: s.camera }));

  const bloomMaterial = useMemo(() => {
    if (!isSelected) return null;
    if (bloomMaterialRef.current) {
      bloomMaterialRef.current.dispose();
      bloomMaterialRef.current = null;
    }
    const mat = createBloomMaterial(instance.color, useSchlickFresnel);
    bloomMaterialRef.current = mat;
    return mat;
  }, [isSelected, instance.color, useSchlickFresnel]);

  useEffect(() => {
    if (!isSelected && bloomMaterialRef.current) {
      bloomMaterialRef.current.dispose();
      bloomMaterialRef.current = null;
    }
  }, [isSelected]);

  useFrame((state) => {
    if (bloomMaterialRef.current?.uniforms) {
      if (bloomMaterialRef.current.uniforms.u_time) {
        bloomMaterialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
      }
      if (bloomMaterialRef.current.uniforms.uUseSchlickFresnel) {
        bloomMaterialRef.current.uniforms.uUseSchlickFresnel.value = useSchlickFresnel ? 1.0 : 0.0;
      }
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

  function handleClick() {
    const mesh = (ref as React.RefObject<Mesh | null>)?.current;
    if (mesh) {
      mesh.getWorldPosition(_clickWorldPos);
      onSelect(instance.id, _clickWorldPos.clone());
    } else {
      onSelect(instance.id, new Vector3(...instance.position));
    }
  }

  const setRef = useCallback(
    (el: Object3D | null) => {
      (ref as React.MutableRefObject<Object3D | null>).current = el;
    },
    [ref]
  );

  return (
    <mesh
      ref={setRef}
      scale={instance.scale}
      onClick={handleClick}
      userData={{ instanceId: instance.id }}
      castShadow
      receiveShadow
    >
      {geometry}
      {bloomMaterial ? (
        <primitive object={bloomMaterial} attach="material" />
      ) : (
        defaultMaterial
      )}
    </mesh>
  );
});
