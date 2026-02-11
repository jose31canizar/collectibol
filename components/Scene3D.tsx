import { Canvas } from '@react-three/fiber/native';
import { Perf } from 'r3f-perf';
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import useControls from 'r3f-native-orbitcontrols';
import { Dimensions, View } from 'react-native';
import { ProceduralObject } from './ProceduralObject';
import { Vector3 } from 'three';
import BookShelf from './BookShelf';
import { useCameraSmoothNavigation } from '../hooks/useCameraSmoothNavigation';

const screenHeight = Dimensions.get('window').height;

function SceneContent({ OrbitControls }: { OrbitControls: React.ComponentType<any> }) {
  const { instances, selectedInstanceId, selectInstance } = useStore();
  const [orbitTarget, setOrbitTarget] = useState(() => new Vector3(0, 0, 0));
  const { startTransitionTo } = useCameraSmoothNavigation(setOrbitTarget);

  function handleSelect(instancePosition: [number, number, number]) {
    const newTarget = new Vector3(...instancePosition);
    startTransitionTo(newTarget);
    selectInstance(
      instances.find((inst) => inst.position === instancePosition)?.id ?? ''
    );
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <mesh position={[5, 10, 5]} >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="orange" />
      </mesh>


      <BookShelf />
      {/* Camera controls */}
      <OrbitControls target={orbitTarget} enablePan enableZoom enableRotate />
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
        frameloop="always"
        shadows
        camera={{ position: [0, 0, 8], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: false, alpha: false }}
      >
        <Perf position="top-left" />
        <SceneContent OrbitControls={OrbitControls} />
      </Canvas>
    </View>
  );
}
