/**
 * Pending object move: set by Scene3D on touch move when in camera mode with a focused object.
 * Consumed by SceneContent in useFrame to apply movement to the physics body.
 */
export type PendingObjectMove = {
  instanceId: string;
  screenDx: number;
  screenDy: number;
} | null;

export const objectMoveRef: { current: PendingObjectMove } = { current: null };

/** True when the current gesture started on the selected object (set in useFrame after raycast). */
export const gestureIsObjectMoveRef: { current: boolean } = { current: false };

/** Touch start position + size for raycast; set on touch start, consumed in useFrame to set gestureIsObjectMoveRef. */
export type PendingTouchStart = {
  locationX: number;
  locationY: number;
  width: number;
  height: number;
} | null;

export const pendingTouchStartRef: { current: PendingTouchStart } = { current: null };
