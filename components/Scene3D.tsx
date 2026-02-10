import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import useControls from 'r3f-native-orbitcontrols';
import { Dimensions, View } from 'react-native';
import { ProceduralObject } from './ProceduralObject';
import { Vector3, Quaternion } from 'three';
import BookShelf from './BookShelf';


const screenHeight = Dimensions.get('window').height;

// Easing function for smooth camera transitions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function SceneContent({ OrbitControls }: { OrbitControls: React.ComponentType<any> }) {
  const { instances, selectedInstanceId, selectInstance } = useStore();
  const { camera } = useThree();
  const targetRef = useRef<Vector3 | null>(null);
  const previousTargetRef = useRef<Vector3 | null>(null);

  // Navigation state for smooth transitions
  const isNavigatingRef = useRef(false);
  const navigationStartTimeRef = useRef(0);
  const navigationDuration = 2000; // 2 seconds for smooth navigation
  const navigationStartPositionRef = useRef(new Vector3());
  const navigationTargetPositionRef = useRef(new Vector3());
  const navigationStartLookAtRef = useRef(new Vector3());
  const navigationTargetLookAtRef = useRef(new Vector3());
  const navigationStartQuaternionRef = useRef(new Quaternion());
  const navigationTargetQuaternionRef = useRef(new Quaternion());

  // Camera orientation state - preserves relative camera position when transitioning
  const cameraFocusStateRef = useRef({
    distance: 8,
    angleY: 0,
    angleX: 0
  });

  const offset = useRef(new Vector3(0, 0, 8));
  const tempTarget = useRef(new Vector3());

  useFrame((_, delta) => {
    if (!targetRef.current) return;

    if (isNavigatingRef.current) {
      // Smooth navigation with easing
      const elapsed = Date.now() - navigationStartTimeRef.current;
      const progress = Math.min(elapsed / navigationDuration, 1);
      const easedProgress = easeInOutCubic(progress);

      // Interpolate camera position
      camera.position.lerpVectors(
        navigationStartPositionRef.current,
        navigationTargetPositionRef.current,
        easedProgress
      );

      // Interpolate camera rotation (quaternion) for smooth look-at transition
      camera.quaternion.slerpQuaternions(
        navigationStartQuaternionRef.current,
        navigationTargetQuaternionRef.current,
        easedProgress
      );

      if (progress >= 1) {
        isNavigatingRef.current = false;
        // Ensure final position is exact
        camera.position.copy(navigationTargetPositionRef.current);
        camera.quaternion.copy(navigationTargetQuaternionRef.current);
      }
    } else {
      // Normal smooth follow when not navigating
      tempTarget.current.copy(targetRef.current).add(offset.current);
      camera.position.lerp(tempTarget.current, delta * 2);
      camera.lookAt(targetRef.current);
    }
  });

  const handleSelect = (instancePosition: [number, number, number]) => {
    const newTarget = new Vector3(...instancePosition);
    
    // If we have a previous target, calculate current camera orientation and start smooth navigation
    if (targetRef.current && previousTargetRef.current) {
      // Calculate current camera orientation relative to current target
      const currentDistance = camera.position.distanceTo(targetRef.current);
      const currentAngleY = Math.atan2(
        camera.position.x - targetRef.current.x,
        camera.position.z - targetRef.current.z
      );
      const currentAngleX = Math.asin(
        (camera.position.y - targetRef.current.y) / currentDistance
      );

      // Store the orientation for the new target
      cameraFocusStateRef.current.distance = currentDistance;
      cameraFocusStateRef.current.angleY = currentAngleY;
      cameraFocusStateRef.current.angleX = currentAngleX;

      // Calculate target camera position using preserved orientation
      const targetDistance = cameraFocusStateRef.current.distance;
      const targetAngleY = cameraFocusStateRef.current.angleY;
      const targetAngleX = cameraFocusStateRef.current.angleX;

      const targetCameraX = newTarget.x + Math.sin(targetAngleY) * targetDistance * Math.cos(targetAngleX);
      const targetCameraY = newTarget.y + Math.sin(targetAngleX) * targetDistance;
      const targetCameraZ = newTarget.z + Math.cos(targetAngleY) * targetDistance * Math.cos(targetAngleX);

      // Start smooth navigation from current camera position
      navigationStartPositionRef.current.copy(camera.position);
      navigationTargetPositionRef.current.set(targetCameraX, targetCameraY, targetCameraZ);

      // Store current look-at target for smooth transition
      navigationStartLookAtRef.current.copy(targetRef.current);
      navigationTargetLookAtRef.current.copy(newTarget);

      // Calculate quaternions for smooth rotation
      const startDirection = new Vector3()
        .subVectors(navigationStartLookAtRef.current, camera.position)
        .normalize();
      const targetDirection = new Vector3()
        .subVectors(navigationTargetLookAtRef.current, navigationTargetPositionRef.current)
        .normalize();

      navigationStartQuaternionRef.current.setFromUnitVectors(
        new Vector3(0, 0, -1),
        startDirection
      );
      navigationTargetQuaternionRef.current.setFromUnitVectors(
        new Vector3(0, 0, -1),
        targetDirection
      );

      isNavigatingRef.current = true;
      navigationStartTimeRef.current = Date.now();
    } else {
      // First selection - initialize camera focus state based on current camera position
      const initialDistance = camera.position.distanceTo(newTarget);
      const initialAngleY = Math.atan2(
        camera.position.x - newTarget.x,
        camera.position.z - newTarget.z
      );
      const initialAngleX = Math.asin(
        (camera.position.y - newTarget.y) / initialDistance
      );

      cameraFocusStateRef.current.distance = initialDistance;
      cameraFocusStateRef.current.angleY = initialAngleY;
      cameraFocusStateRef.current.angleX = initialAngleX;
    }

    previousTargetRef.current = targetRef.current;
    targetRef.current = newTarget;
    selectInstance(instances.find(inst => inst.position === instancePosition)?.id ?? '');
  };

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
        frameloop="always"
        shadows
        camera={{ position: [0, 0, 8], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: false, alpha: false }}
      >
        <SceneContent OrbitControls={OrbitControls} />
      </Canvas>
    </View>
  );
}
