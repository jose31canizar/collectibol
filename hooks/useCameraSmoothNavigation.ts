import { useFrame, useThree } from "@react-three/fiber/native";
import { useRef } from "react";
import { Vector3 } from "three";

const NAVIGATION_DURATION_MS = 2000;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getSphericalFromPosition(
  cameraPosition: Vector3,
  target: Vector3,
): { distance: number; angleY: number; angleX: number } {
  const distance = cameraPosition.distanceTo(target);
  const angleY = Math.atan2(
    cameraPosition.x - target.x,
    cameraPosition.z - target.z,
  );
  const angleX = Math.asin((cameraPosition.y - target.y) / distance);
  return { distance, angleY, angleX };
}

function getCameraPositionFromSpherical(
  target: Vector3,
  distance: number,
  angleY: number,
  angleX: number,
): Vector3 {
  return new Vector3(
    target.x + Math.sin(angleY) * distance * Math.cos(angleX),
    target.y + Math.sin(angleX) * distance,
    target.z + Math.cos(angleY) * distance * Math.cos(angleX),
  );
}

export function useCameraSmoothNavigation(
  setOrbitTarget: (v: Vector3) => void,
) {
  const { camera } = useThree();
  const targetRef = useRef<Vector3 | null>(null);
  const previousTargetRef = useRef<Vector3 | null>(null);

  const isNavigatingRef = useRef(false);
  const navigationStartTimeRef = useRef(0);
  const navigationStartPositionRef = useRef(new Vector3());
  const navigationTargetPositionRef = useRef(new Vector3());
  const navigationStartLookAtRef = useRef(new Vector3());
  const navigationTargetLookAtRef = useRef(new Vector3());
  const lookAtRef = useRef(new Vector3());

  const focusStateRef = useRef({
    distance: 8,
    angleY: 0,
    angleX: 0,
  });

  useFrame(() => {
    if (!targetRef.current) return;

    if (isNavigatingRef.current) {
      const elapsed = Date.now() - navigationStartTimeRef.current;
      const progress = Math.min(elapsed / NAVIGATION_DURATION_MS, 1);
      const easedProgress = easeInOutCubic(progress);

      camera.position.lerpVectors(
        navigationStartPositionRef.current,
        navigationTargetPositionRef.current,
        easedProgress,
      );
      lookAtRef.current.lerpVectors(
        navigationStartLookAtRef.current,
        navigationTargetLookAtRef.current,
        easedProgress,
      );
      camera.lookAt(lookAtRef.current);

      if (progress >= 1) {
        isNavigatingRef.current = false;
        camera.position.copy(navigationTargetPositionRef.current);
        camera.lookAt(navigationTargetLookAtRef.current);
      }
    }
  });

  function startTransitionTo(newTarget: Vector3) {
    if (targetRef.current && previousTargetRef.current) {
      const { distance, angleY, angleX } = getSphericalFromPosition(
        camera.position,
        targetRef.current,
      );
      focusStateRef.current = { distance, angleY, angleX };

      const targetPosition = getCameraPositionFromSpherical(
        newTarget,
        focusStateRef.current.distance,
        focusStateRef.current.angleY,
        focusStateRef.current.angleX,
      );

      navigationStartPositionRef.current.copy(camera.position);
      navigationTargetPositionRef.current.copy(targetPosition);
      navigationStartLookAtRef.current.copy(targetRef.current);
      navigationTargetLookAtRef.current.copy(newTarget);
      lookAtRef.current.copy(targetRef.current);

      isNavigatingRef.current = true;
      navigationStartTimeRef.current = Date.now();
    } else {
      const { distance, angleY, angleX } = getSphericalFromPosition(
        camera.position,
        newTarget,
      );
      focusStateRef.current = { distance, angleY, angleX };
    }

    previousTargetRef.current = targetRef.current;
    targetRef.current = newTarget;
    setOrbitTarget(newTarget.clone());
  }

  return { startTransitionTo };
}
