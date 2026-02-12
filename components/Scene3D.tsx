import { Canvas } from '@react-three/fiber/native';
import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import useControls from 'r3f-native-orbitcontrols';
import { Dimensions, View } from 'react-native';
import { PhysicsProvider } from '../physics/PhysicsContext';
import { ProceduralObject } from './ProceduralObject';
import { Vector3 } from 'three';
import Cage from './Cage';
import { useCameraSmoothNavigation } from '../hooks/useCameraSmoothNavigation';
import { pendingTapRef } from '../tap-to-select';
import { useFrame } from '@react-three/fiber';
import { Raycaster } from 'three';
import { Vector2 } from 'three';

const screenHeight = Dimensions.get('window').height;

const TAP_MOVE_THRESHOLD_PX = 10;

function SceneContent({ OrbitControls }: { OrbitControls: React.ComponentType<any> }) {
  const { instances, selectedInstanceId, selectInstance } = useStore();
  const [orbitTarget, setOrbitTarget] = useState(() => new Vector3(0, 0, 0));
  const { startTransitionTo } = useCameraSmoothNavigation(setOrbitTarget);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  useFrame((state) => {
    const tap = pendingTapRef.current;
    if (!tap) return;
    pendingTapRef.current = null;
    const { width, height } = tap;
    if (width <= 0 || height <= 0) return;
    mouse.current.set((tap.locationX / width) * 2 - 1, -((tap.locationY / height) * 2) + 1);
    raycaster.current.setFromCamera(mouse.current, state.camera);
    const hits = raycaster.current.intersectObjects(state.scene.children, true);
    const hit = hits.find((h) => h.object.userData?.instanceId);
    if (hit && hit.object.userData.instanceId) {
      const instanceId = hit.object.userData.instanceId as string;
      selectInstance(instanceId);
      startTransitionTo(hit.point.clone());
    }
  });

  function handleSelect(instanceId: string, focusPosition: Vector3) {
    selectInstance(instanceId);
    startTransitionTo(focusPosition);
  }

  return (
    <PhysicsProvider>
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
      <mesh position={[5, 10, 5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="orange" />
      </mesh>

      <Cage />

      <OrbitControls
        target={orbitTarget}
        enablePan
        enableZoom
        enableRotate
      />

      {instances.map((instance) => (
        <ProceduralObject
          key={instance.id}
          instance={instance}
          isSelected={selectedInstanceId === instance.id}
          onSelect={(instanceId, worldPosition) => handleSelect(instanceId, worldPosition)}
        />
      ))}
    </PhysicsProvider>
  );
}

export function Scene3D() {
  const [OrbitControls, events] = useControls();
  const cageRotateMode = useStore((state) => state.cageRotateMode);
  const addCageRotationY = useStore((state) => state.addCageRotationY);
  const viewSizeRef = useRef({ width: 0, height: 0 });
  const lastAngleRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const didMoveRef = useRef(false);

  const setViewRef = useCallback((node: View | null) => {
    // ref not needed for measure; we get size from onLayout
  }, []);

  const handleLayout = useCallback(
    (evt: any) => {
      const { width, height } = evt.nativeEvent?.layout ?? {};
      if (typeof width === 'number' && typeof height === 'number') {
        viewSizeRef.current = { width, height };
      }
      events.onLayout?.(evt);
    },
    [events]
  );

  const handleCageRotateMove = useCallback(
    (evt: any) => {
      const touch = evt.nativeEvent?.touches?.[0];
      if (!touch || typeof touch.locationX !== 'number' || typeof touch.locationY !== 'number') return;
      const { width, height } = viewSizeRef.current;
      if (width <= 0 || height <= 0) return;
      const cx = width / 2;
      const cy = height / 2;
      const angle = Math.atan2(touch.locationY - cy, touch.locationX - cx);
      const last = lastAngleRef.current;
      lastAngleRef.current = angle;
      if (last !== null) {
        let delta = angle - last;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        addCageRotationY(delta);
      }
    },
    [addCageRotationY]
  );

  const modifiedEvents = cageRotateMode
    ? {
        ref: setViewRef,
        onLayout: (evt: any) => {
          const layout = evt.nativeEvent?.layout;
          if (layout && typeof layout.width === 'number' && typeof layout.height === 'number') {
            viewSizeRef.current = { width: layout.width, height: layout.height };
          }
        },
        onStartShouldSetResponder: () => true,
        onResponderGrant: (evt: any) => {
          const touch = evt.nativeEvent?.touches?.[0];
          if (touch && typeof touch.locationX === 'number' && typeof touch.locationY === 'number') {
            const { width, height } = viewSizeRef.current;
            const cx = width / 2;
            const cy = height / 2;
            lastAngleRef.current = Math.atan2(touch.locationY - cy, touch.locationX - cx);
          } else {
            lastAngleRef.current = null;
          }
        },
        onResponderMove: handleCageRotateMove,
        onResponderRelease: () => {
          lastAngleRef.current = null;
        },
      }
    : {
        ref: setViewRef,
        ...events,
        onLayout: handleLayout,
        onStartShouldSetResponder: (evt: any) => {
          const pageY = evt.nativeEvent?.pageY ?? evt.nativeEvent?.touches?.[0]?.pageY;
          if (typeof pageY === 'number' && pageY > screenHeight - 200) return false;
          const t = evt.nativeEvent?.touches?.[0];
          touchStartRef.current =
            t && typeof t.locationX === 'number' && typeof t.locationY === 'number'
              ? { x: t.locationX, y: t.locationY }
              : null;
          didMoveRef.current = false;
          events.onStartShouldSetResponder?.(evt);
          return true;
        },
        onMoveShouldSetResponder: (evt: any) => {
          const pageY = evt.nativeEvent?.pageY ?? evt.nativeEvent?.touches?.[0]?.pageY;
          if (typeof pageY === 'number' && pageY > screenHeight - 200) return false;
          didMoveRef.current = true;
          events.onMoveShouldSetResponder?.(evt);
          return true;
        },
        onResponderRelease: (evt: any) => {
          const touch = evt.nativeEvent?.changedTouches?.[0] ?? evt.nativeEvent?.touches?.[0];
          const start = touchStartRef.current;
          if (
            !didMoveRef.current &&
            start &&
            touch &&
            typeof touch.locationX === 'number' &&
            typeof touch.locationY === 'number'
          ) {
            const dx = touch.locationX - start.x;
            const dy = touch.locationY - start.y;
            if (dx * dx + dy * dy <= TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
              const { width, height } = viewSizeRef.current;
              if (width > 0 && height > 0) {
                pendingTapRef.current = {
                  locationX: touch.locationX,
                  locationY: touch.locationY,
                  width,
                  height,
                };
              }
            }
          }
          touchStartRef.current = null;
          events.onResponderRelease?.();
        },
      };

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }} {...modifiedEvents}>
      <View style={{ flex: 1 }} pointerEvents="none" collapsable={false}>
        <Canvas
          frameloop="always"
          shadows
          camera={{ position: [0, 0, 8], fov: 75, near: 0.1, far: 1000 }}
          gl={{ antialias: false, alpha: false }}
          style={{ flex: 1 }}
        >
          <SceneContent OrbitControls={OrbitControls} />
        </Canvas>
      </View>
    </View>
  );
}
