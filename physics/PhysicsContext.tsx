import React, { createContext, useContext, useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Object3D } from 'three';
import { Vector3, Quaternion } from 'three';
import * as CANNON from 'cannon-es';

const _tempPos = new Vector3();
const _tempQuat = new Quaternion();
const _parentWorldQuat = new Quaternion();

export type PhysicsBoxOptions = {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number, number];
  type?: 'Static' | 'Dynamic';
  mass?: number;
};

export type PhysicsSphereOptions = {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number];
  type?: 'Static' | 'Dynamic';
  mass?: number;
};

export type PhysicsCylinderOptions = {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number, number, number?];
  type?: 'Static' | 'Dynamic';
  mass?: number;
};

type BodyRefPair = { body: CANNON.Body; ref: React.RefObject<Object3D | null>; isStatic: boolean };

const PhysicsContext = createContext<{
  world: CANNON.World;
  register: (body: CANNON.Body, ref: React.RefObject<Object3D | null>, isStatic: boolean) => void;
  unregister: (body: CANNON.Body) => void;
} | null>(null);

export function usePhysics() {
  const ctx = useContext(PhysicsContext);
  if (!ctx) throw new Error('usePhysics must be used within PhysicsProvider');
  return ctx;
}

export function PhysicsProvider({ children }: { children: React.ReactNode }) {
  const world = useRef<CANNON.World | null>(null);
  const pairsRef = useRef<BodyRefPair[]>([]);

  if (!world.current) {
    world.current = new CANNON.World();
    world.current.gravity.set(0, -9.82, 0);
    world.current.broadphase = new CANNON.NaiveBroadphase();
    // Add default contact material with higher stiffness to reduce penetration
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 0.98,
      restitution: 0,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 4,
    });
    world.current.addContactMaterial(defaultContactMaterial);
    world.current.defaultMaterial = defaultMaterial;
    world.current.defaultContactMaterial = defaultContactMaterial;
  }

  const register = useCallback((body: CANNON.Body, ref: React.RefObject<Object3D | null>, isStatic: boolean) => {
    pairsRef.current.push({ body, ref, isStatic });
  }, []);

  const unregister = useCallback((body: CANNON.Body) => {
    pairsRef.current = pairsRef.current.filter((p) => p.body !== body);
  }, []);

  useFrame(() => {
    const w = world.current;
    if (!w) return;
    // Fixed small step (1/60) to avoid tunneling through thin shapes like the base; substeps catch up to real time
    w.fixedStep(1 / 60, 10);
    // Only sync dynamic bodies - static bodies don't move and their meshes are already positioned correctly
    for (const { body, ref, isStatic } of pairsRef.current) {
      if (isStatic) continue; // Skip static bodies
      const obj = ref?.current;
      if (!obj || !('position' in obj) || !('quaternion' in obj)) continue;
      const mesh = obj as Object3D;
      _tempPos.set(body.position.x, body.position.y, body.position.z);
      _tempQuat.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      if (mesh.parent) {
        mesh.parent.worldToLocal(_tempPos);
        mesh.position.copy(_tempPos);
        mesh.parent.getWorldQuaternion(_parentWorldQuat);
        mesh.quaternion.copy(_parentWorldQuat.invert()).premultiply(_tempQuat);
      } else {
        mesh.position.copy(_tempPos);
        mesh.quaternion.copy(_tempQuat);
      }
    }
  });

  const api = useMemo(
    () => ({ world: world.current!, register, unregister }),
    [register, unregister]
  );

  return (
    <PhysicsContext.Provider value={api}>
      {children}
    </PhysicsContext.Provider>
  );
}

export function usePhysicsBox(options: PhysicsBoxOptions) {
  const { world, register, unregister } = usePhysics();
  const ref = useRef<Object3D | null>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);

  const [hx, hy, hz] = options.args;
  const isStatic = options.type === 'Static' || (options.mass !== undefined && options.mass <= 0);

  if (!bodyRef.current) {
    const shape = new CANNON.Box(new CANNON.Vec3(hx, hy, hz));
    const [x, y, z] = options.position;
    const body = new CANNON.Body({
      mass: isStatic ? 0 : (options.mass ?? 1),
      type: isStatic ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
      position: new CANNON.Vec3(x, y, z),
      shape,
    });
    if (options.rotation) {
      body.quaternion.setFromEuler(options.rotation[0], options.rotation[1], options.rotation[2]);
    }
    bodyRef.current = body;
  }

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !world) return;
    world.addBody(body);
    register(body, ref, isStatic);
    return () => {
      world.removeBody(body);
      unregister(body);
    };
  }, [world, register, unregister, isStatic]);

  const applyImpulse = useCallback(
    (impulse: [number, number, number], worldPoint?: [number, number, number]) => {
      const body = bodyRef.current;
      if (!body || body.type !== CANNON.Body.DYNAMIC) return;
      const iv = new CANNON.Vec3(impulse[0], impulse[1], impulse[2]);
      if (worldPoint) {
        const wp = new CANNON.Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
        body.applyImpulse(iv, wp);
      } else {
        body.applyImpulse(iv, body.position);
      }
    },
    []
  );

  return { ref, applyImpulse, bodyRef };
}

export function usePhysicsSphere(options: PhysicsSphereOptions) {
  const { world, register, unregister } = usePhysics();
  const ref = useRef<Object3D | null>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);

  const [radius] = options.args;
  const isStatic = options.type === 'Static' || (options.mass !== undefined && options.mass <= 0);

  if (!bodyRef.current) {
    const shape = new CANNON.Sphere(radius);
    const [x, y, z] = options.position;
    const body = new CANNON.Body({
      mass: isStatic ? 0 : (options.mass ?? 1),
      type: isStatic ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
      position: new CANNON.Vec3(x, y, z),
      shape,
    });
    if (options.rotation) {
      body.quaternion.setFromEuler(options.rotation[0], options.rotation[1], options.rotation[2]);
    }
    bodyRef.current = body;
  }

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !world) return;
    world.addBody(body);
    register(body, ref, isStatic);
    return () => {
      world.removeBody(body);
      unregister(body);
    };
  }, [world, register, unregister, isStatic]);

  const applyImpulse = useCallback(
    (impulse: [number, number, number], worldPoint?: [number, number, number]) => {
      const body = bodyRef.current;
      if (!body || body.type !== CANNON.Body.DYNAMIC) return;
      const iv = new CANNON.Vec3(impulse[0], impulse[1], impulse[2]);
      if (worldPoint) {
        const wp = new CANNON.Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
        body.applyImpulse(iv, wp);
      } else {
        body.applyImpulse(iv, body.position);
      }
    },
    []
  );

  return { ref, applyImpulse, bodyRef };
}

export function usePhysicsCylinder(options: PhysicsCylinderOptions) {
  const { world, register, unregister } = usePhysics();
  const ref = useRef<Object3D | null>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);

  const [radiusTop, radiusBottom, height, numSegments = 16] = options.args;
  const isStatic = options.type === 'Static' || (options.mass !== undefined && options.mass <= 0);

  if (!bodyRef.current) {
    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
    const [x, y, z] = options.position;
    const body = new CANNON.Body({
      mass: isStatic ? 0 : (options.mass ?? 1),
      type: isStatic ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
      position: new CANNON.Vec3(x, y, z),
      shape,
    });
    if (options.rotation) {
      body.quaternion.setFromEuler(options.rotation[0], options.rotation[1], options.rotation[2]);
    }
    bodyRef.current = body;
  }

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !world) return;
    world.addBody(body);
    register(body, ref, isStatic);
    return () => {
      world.removeBody(body);
      unregister(body);
    };
  }, [world, register, unregister, isStatic]);

  const applyImpulse = useCallback(
    (impulse: [number, number, number], worldPoint?: [number, number, number]) => {
      const body = bodyRef.current;
      if (!body || body.type !== CANNON.Body.DYNAMIC) return;
      const iv = new CANNON.Vec3(impulse[0], impulse[1], impulse[2]);
      if (worldPoint) {
        const wp = new CANNON.Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
        body.applyImpulse(iv, wp);
      } else {
        body.applyImpulse(iv, body.position);
      }
    },
    []
  );

  return { ref, applyImpulse, bodyRef };
}

/** Cage dimensions - must match Cage.tsx */
const CAGE_GROUP_Y = -2;
const CAGE_SIZE = 30;
const CAGE_BASE_HEIGHT = 0.3;
const CAGE_BORDER_HEIGHT = 3.5;
const CAGE_BORDER_THICKNESS = 0.3;
/** Rotation center - same as Cage group position */
const CAGE_BODY_POSITION_Y = CAGE_GROUP_Y;

/**
 * Creates a static compound body for the cage (base + 4 borders).
 */
export function useCageCompoundBody() {
  const { world } = usePhysics();

  useEffect(() => {
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(0, CAGE_BODY_POSITION_Y, 0),
    });

    const half = CAGE_SIZE / 2;
    const baseHalfY = CAGE_BASE_HEIGHT / 2;
    const borderHalfY = CAGE_BORDER_HEIGHT / 2;
    const borderHalfT = CAGE_BORDER_THICKNESS / 2;
    const wallCenterY = CAGE_BASE_HEIGHT / 2 + CAGE_BORDER_HEIGHT / 2;

    // Base
    body.addShape(
      new CANNON.Box(new CANNON.Vec3(half, baseHalfY, half)),
      new CANNON.Vec3(0, baseHalfY, 0),
      new CANNON.Quaternion()
    );
    // Front wall
    body.addShape(
      new CANNON.Box(new CANNON.Vec3(half, borderHalfY, borderHalfT)),
      new CANNON.Vec3(0, wallCenterY, half),
      new CANNON.Quaternion()
    );
    // Back wall
    body.addShape(
      new CANNON.Box(new CANNON.Vec3(half, borderHalfY, borderHalfT)),
      new CANNON.Vec3(0, wallCenterY, -half),
      new CANNON.Quaternion()
    );
    // Left wall
    body.addShape(
      new CANNON.Box(new CANNON.Vec3(borderHalfT, borderHalfY, half)),
      new CANNON.Vec3(-half, wallCenterY, 0),
      new CANNON.Quaternion()
    );
    // Right wall
    body.addShape(
      new CANNON.Box(new CANNON.Vec3(borderHalfT, borderHalfY, half)),
      new CANNON.Vec3(half, wallCenterY, 0),
      new CANNON.Quaternion()
    );

    world.addBody(body);
    return () => {
      world.removeBody(body);
    };
  }, [world]);
}
