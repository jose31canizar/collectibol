import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import React, { Suspense, useRef } from 'react';
import { useStore } from '../store/useStore';
import useControls from 'r3f-native-orbitcontrols';
import { View, Dimensions } from 'react-native';
import { ProceduralObject } from './ProceduralObject';
import BookShelf from './BookShelf';
import * as THREE from 'three';


const screenHeight = Dimensions.get('window').height;

function SceneContent({ OrbitControls }: { OrbitControls: React.ComponentType<any> }) {
  const { instances, selectedInstanceId, selectInstance } = useStore();
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const lerpSpeed = 2; // higher = faster

  // Animate camera each frame toward target  
  useFrame((state, delta) => {
    if (targetRef.current) {
      const targetPos = targetRef.current.clone().add(new THREE.Vector3(0, 0, 8)); // offset back
      camera.position.lerp(targetPos, delta * lerpSpeed);
      camera.lookAt(targetRef.current);
    }
  });

  const handleSelect = (instancePosition: [number, number, number]) => {
    targetRef.current = new THREE.Vector3(...instancePosition);
    selectInstance(instances.find(inst => inst.position === instancePosition)?.id ?? '');
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="orange" />
      </mesh>

      <BookShelf />
      {/* Camera controls */}
      <OrbitControls enablePan enableZoom enableRotate />
      {/* Render all instances */}


      {instances.map((instance) => (
        <ProceduralObject
          key={instance.id}
          instance={instance}
          isSelected={selectedInstanceId === instance.id}
          onSelect={() => {
            handleSelect(instance.position);
          }}
        />
      ))}

    </>
  );
}

export function Scene3D() {
  const [OrbitControls, events] = useControls();

  // Modify events to not capture touches in button areas
  const modifiedEvents = {
    ...events,
    onStartShouldSetResponder: (evt: any) => {
      const { pageY } = evt.nativeEvent;

      // Don't capture if touch is in bottom button area (bottom 200px to be safe)
      const isInButtonArea = pageY > screenHeight - 200;

      if (isInButtonArea) {
        return false; // Don't let OrbitControls capture this touch
      }

      // Use original handler for other areas
      if (events.onStartShouldSetResponder) {
        return events.onStartShouldSetResponder(evt);
      }
      return true;
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }} {...modifiedEvents}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent OrbitControls={OrbitControls} />
        </Suspense>
      </Canvas>
    </View>
  );
}
