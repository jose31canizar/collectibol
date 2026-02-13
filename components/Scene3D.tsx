import { Canvas } from '@react-three/fiber/native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import useControls from 'r3f-native-orbitcontrols';
import { Dimensions, View } from 'react-native';
import { PhysicsProvider } from '../physics/PhysicsContext';
import { ProceduralObject } from './ProceduralObject';
import { Vector3 } from 'three';
import Cage from './Cage';
import { useCameraSmoothNavigation } from '../hooks/useCameraSmoothNavigation';
import { pendingTapRef } from '../tap-to-select';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster } from 'three';
import { Vector2 } from 'three';

const screenHeight = Dimensions.get('window').height;

const TAP_MOVE_THRESHOLD_PX = 10;

// Import dragging state from ProceduralObject
import { draggingStateRef } from './ProceduralObject';

function SceneContent({ 
  OrbitControls, 
  enableOrbitControls,
  isDraggingRef,
  viewSizeRef,
  longPressTargetRef,
  longPressTimerRef,
}: { 
  OrbitControls: React.ComponentType<any>;
  enableOrbitControls: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
  viewSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  longPressTargetRef: React.MutableRefObject<{ instanceId: string; touchX: number; touchY: number } | null>;
  longPressTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
}) {
  const { instances, selectedInstanceId, selectInstance } = useStore();
  const [orbitTarget, setOrbitTarget] = useState(() => new Vector3(0, 0, 0));
  const { startTransitionTo } = useCameraSmoothNavigation(setOrbitTarget);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const orbitControlsRef = useRef<any>(null);
  const { scene, camera } = useThree();

  useFrame((state) => {
    // Handle tap selection
    const tap = pendingTapRef.current;
    if (tap && !isDraggingRef.current) {
      pendingTapRef.current = null;
      const { width, height } = tap;
      if (width > 0 && height > 0) {
        mouse.current.set((tap.locationX / width) * 2 - 1, -((tap.locationY / height) * 2) + 1);
        raycaster.current.setFromCamera(mouse.current, state.camera);
        const hits = raycaster.current.intersectObjects(state.scene.children, true);
        const hit = hits.find((h) => h.object.userData?.instanceId);
        if (hit && hit.object.userData.instanceId) {
          const instanceId = hit.object.userData.instanceId as string;
          selectInstance(instanceId);
          startTransitionTo(hit.point.clone());
        }
      }
    }
    
    // Check if long press target is on an object
    if (longPressTargetRef.current && (!longPressTargetRef.current.instanceId || longPressTargetRef.current.instanceId === '') && !isDraggingRef.current) {
      const { touchX, touchY } = longPressTargetRef.current;
      const { width, height } = viewSizeRef.current;
      if (width > 0 && height > 0) {
        const normalizedX = (touchX / width) * 2 - 1;
        const normalizedY = -((touchY / height) * 2) + 1;
        mouse.current.set(normalizedX, normalizedY);
        raycaster.current.setFromCamera(mouse.current, state.camera);
        const hits = raycaster.current.intersectObjects(state.scene.children, true);
        
        console.log('[Touch Detection] Raycast:', {
          touchX,
          touchY,
          width,
          height,
          normalizedX,
          normalizedY,
          totalHits: hits.length,
          hits: hits.map(h => ({
            object: h.object.userData?.instanceId || 'no-instance-id',
            distance: h.distance,
          })),
        });
        
        const hit = hits.find((h) => h.object.userData?.instanceId);
        if (hit && hit.object.userData.instanceId) {
          const instanceId = hit.object.userData.instanceId as string;
          console.log('[Touch Detection] Found object:', instanceId);
          longPressTargetRef.current.instanceId = instanceId;
          // Get world position for drag start
          const mesh = hit.object;
          if (mesh && 'getWorldPosition' in mesh) {
            const worldPos = new Vector3();
            (mesh as any).getWorldPosition(worldPos);
            draggingStateRef.dragStartWorldPos = worldPos;
            console.log('[Touch Detection] World position:', worldPos);
          }
        } else {
          console.log('[Touch Detection] No object hit');
          // Not on an object, clear long press
          longPressTargetRef.current = null;
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
      }
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
        ref={orbitControlsRef}
        target={orbitTarget}
        enablePan={enableOrbitControls}
        enableZoom={enableOrbitControls}
        enableRotate={enableOrbitControls}
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
  const viewSizeRef = useRef({ width: 0, height: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const didMoveRef = useRef(false);
  
  // Long press detection
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTargetRef = useRef<{ instanceId: string; touchX: number; touchY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const [enableOrbitControls, setEnableOrbitControls] = useState(true);

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

  const handleLongPressStart = useCallback(() => {
    console.log('[Touch Detection] handleLongPressStart called:', {
      hasTarget: !!longPressTargetRef.current,
      instanceId: longPressTargetRef.current?.instanceId,
      isDragging: isDraggingRef.current,
    });
    
    if (longPressTargetRef.current && !isDraggingRef.current) {
      const { instanceId, touchX, touchY } = longPressTargetRef.current;
      const { width, height } = viewSizeRef.current;
      
      if (!instanceId || instanceId === '') {
        console.log('[Touch Detection] No instanceId, cannot start drag');
        return;
      }
      
      console.log('[Touch Detection] Enabling drag mode for:', instanceId);
      isDraggingRef.current = true;
      setEnableOrbitControls(false);
      draggingStateRef.isDragging = true;
      draggingStateRef.instanceId = instanceId;
      // Convert touch coordinates to normalized device coordinates
      const normalizedX = (touchX / width) * 2 - 1;
      const normalizedY = -((touchY / height) * 2) + 1;
      draggingStateRef.currentPointer = new Vector2(normalizedX, normalizedY);
      // Store normalized Y for vertical movement calculation (not screen coords)
      draggingStateRef.dragStartPoint = new Vector3(normalizedX, normalizedY, 0);
      console.log('[Touch Detection] Drag state set:', {
        instanceId,
        currentPointer: draggingStateRef.currentPointer,
        dragStartPoint: draggingStateRef.dragStartPoint,
        dragStartWorldPos: draggingStateRef.dragStartWorldPos,
      });
    }
  }, []);

  const handleResponderGrant = useCallback((evt: any) => {
    if (isDraggingRef.current) return;
    
    const touch = evt.nativeEvent?.touches?.[0];
    if (!touch || typeof touch.locationX !== 'number' || typeof touch.locationY !== 'number') {
      console.log('[Touch Detection] Invalid touch in handleResponderGrant');
      return;
    }
    
    const { width, height } = viewSizeRef.current;
    if (width <= 0 || height <= 0) {
      console.log('[Touch Detection] Invalid view size:', { width, height });
      return;
    }
    
    console.log('[Touch Detection] Touch started:', {
      locationX: touch.locationX,
      locationY: touch.locationY,
      width,
      height,
    });
    
    // Convert to normalized coordinates for raycasting
    const normalizedX = (touch.locationX / width) * 2 - 1;
    const normalizedY = -((touch.locationY / height) * 2) + 1;
    
    // Store for raycasting in useFrame
    pendingTapRef.current = {
      locationX: touch.locationX,
      locationY: touch.locationY,
      width,
      height,
    };
    
    // Start long press timer - will check if object is hit in useFrame
    longPressTargetRef.current = {
      instanceId: '', // Will be set in useFrame if object is hit
      touchX: touch.locationX,
      touchY: touch.locationY,
    };
    
    console.log('[Touch Detection] Started long press timer, will check for object in useFrame');
    
    // Try immediate check (will be set by SceneContent via useEffect)
    // Note: This might not be available immediately, so useFrame will also check
    
    longPressTimerRef.current = setTimeout(() => {
      console.log('[Touch Detection] Long press timer fired:', {
        hasTarget: !!longPressTargetRef.current,
        instanceId: longPressTargetRef.current?.instanceId,
      });
      // Check if we're still on the same object after 1 second
      if (longPressTargetRef.current && longPressTargetRef.current.instanceId) {
        console.log('[Touch Detection] Starting drag for:', longPressTargetRef.current.instanceId);
        handleLongPressStart();
      } else {
        console.log('[Touch Detection] Long press timer fired but no object detected');
      }
    }, 1000);
  }, [handleLongPressStart]);

  const handleResponderMove = useCallback((evt: any) => {
    if (isDraggingRef.current && draggingStateRef.isDragging) {
      const touch = evt.nativeEvent?.touches?.[0];
      if (!touch || typeof touch.locationX !== 'number' || typeof touch.locationY !== 'number') {
        console.log('[Drag] Invalid touch in handleResponderMove');
        return;
      }
      const { width, height } = viewSizeRef.current;
      if (width <= 0 || height <= 0) {
        console.log('[Drag] Invalid view size in handleResponderMove');
        return;
      }
      
      // Update dragging pointer position
      const normalizedX = (touch.locationX / width) * 2 - 1;
      const normalizedY = -((touch.locationY / height) * 2) + 1;
      draggingStateRef.currentPointer = new Vector2(normalizedX, normalizedY);
      
      console.log('[Drag] Updated pointer:', {
        locationX: touch.locationX,
        locationY: touch.locationY,
        normalizedX,
        normalizedY,
        instanceId: draggingStateRef.instanceId,
      });
      
      // Don't pass to orbit controls when dragging
      return;
    }
    
    // Cancel long press if moved too much
    if (longPressTimerRef.current && touchStartRef.current) {
      const touch = evt.nativeEvent?.touches?.[0];
      if (touch && typeof touch.locationX === 'number' && typeof touch.locationY === 'number') {
        const dx = touch.locationX - touchStartRef.current.x;
        const dy = touch.locationY - touchStartRef.current.y;
        if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          longPressTargetRef.current = null;
        }
      }
    }
    
    didMoveRef.current = true;
    
    // Always forward to orbit controls - they need these events to work
    // Even though we have the responder, we forward events so they can process them
    events.onResponderMove?.(evt);
  }, [events]);

  const handleResponderRelease = useCallback((evt: any) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (isDraggingRef.current) {
      // End dragging
      isDraggingRef.current = false;
      draggingStateRef.isDragging = false;
      draggingStateRef.instanceId = null;
      draggingStateRef.dragStartPoint = null;
      draggingStateRef.dragStartWorldPos = null;
      draggingStateRef.currentPointer = null;
      setEnableOrbitControls(true);
      longPressTargetRef.current = null;
      return;
    }
    
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
    longPressTargetRef.current = null;
    events.onResponderRelease?.();
  }, [events]);

  const modifiedEvents = {
    ref: setViewRef,
    ...(events as any),
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
        
        // Always claim responder to detect long press, but we'll forward events to orbit controls
        // Orbit controls will work through our handlers
        events.onStartShouldSetResponder?.(evt);
        return true;
      },
      onMoveShouldSetResponder: (evt: any) => {
        const pageY = evt.nativeEvent?.pageY ?? evt.nativeEvent?.touches?.[0]?.pageY;
        if (typeof pageY === 'number' && pageY > screenHeight - 200) return false;
        
        // If dragging, we definitely need the responder
        if (isDraggingRef.current) {
          didMoveRef.current = true;
          return true;
        }
        
        // If we have a long press timer, we need the responder to detect it
        if (longPressTimerRef.current) {
          didMoveRef.current = true;
          return true;
        }
        
        // Otherwise, let orbit controls handle it
        didMoveRef.current = true;
        const orbitControlsWantsResponder = events.onMoveShouldSetResponder?.(evt);
        return orbitControlsWantsResponder ?? false;
      },
    onResponderGrant: handleResponderGrant,
    onResponderMove: handleResponderMove,
    onResponderRelease: handleResponderRelease,
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
          <SceneContent 
            OrbitControls={OrbitControls}
            enableOrbitControls={enableOrbitControls}
            isDraggingRef={isDraggingRef}
            viewSizeRef={viewSizeRef}
            longPressTargetRef={longPressTargetRef}
            longPressTimerRef={longPressTimerRef}
          />
        </Canvas>
      </View>
    </View>
  );
}
