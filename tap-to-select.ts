/**
 * Pending tap: set by Scene3D on touch end when it was a tap (no significant move).
 * Consumed by TapToSelectHandler in useFrame to raycast and select the object.
 */
export type PendingTap = {
  locationX: number;
  locationY: number;
  width: number;
  height: number;
} | null;

export const pendingTapRef: { current: PendingTap } = { current: null };
