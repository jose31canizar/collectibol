import { ShapeType, Object3DInstance } from '../store/useStore';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C',
  '#9B59B6', '#3498DB', '#1ABC9C', '#E67E22', '#F39C12',
];

const SHAPE_TYPES: ShapeType[] = ['box', 'sphere', 'torus', 'cone', 'cylinder'];

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// Cage dimensions (matching Cage.tsx)
const CAGE_SIZE = 30;
const CAGE_BASE_HEIGHT = 0.3;
const CAGE_BORDER_HEIGHT = 1.5;
const CAGE_GROUP_Y = -2;
const CAGE_BORDER_THICKNESS = 0.3;

// Safe spawn area: inside the cage borders (square)
const SAFE_HALF = (CAGE_SIZE - CAGE_BORDER_THICKNESS * 2) / 2;

// Spawn above the cage floor (base + borders). Top of borders = CAGE_GROUP_Y + CAGE_BASE_HEIGHT + CAGE_BORDER_HEIGHT
const FLOOR_TOP_Y = CAGE_GROUP_Y + CAGE_BASE_HEIGHT + CAGE_BORDER_HEIGHT;
const SPAWN_HEIGHT_MIN = 2;
const SPAWN_HEIGHT_MAX = 6;

export function generateProceduralInstance(): Omit<Object3DInstance, 'id' | 'createdAt'> {
  const shapeType = randomChoice(SHAPE_TYPES);
  const color = randomChoice(COLORS);
  const size = randomFloat(0.3, 1.2);
  const scale = randomFloat(0.8, 1.5);
  
  // Position above the cage only (inside horizontal bounds, above floor)
  const position: [number, number, number] = [
    randomFloat(-SAFE_HALF, SAFE_HALF),
    FLOOR_TOP_Y + randomFloat(SPAWN_HEIGHT_MIN, SPAWN_HEIGHT_MAX),
    randomFloat(-SAFE_HALF, SAFE_HALF),
  ];
  
  // Random rotation
  const rotation: [number, number, number] = [
    randomFloat(0, Math.PI * 2),
    randomFloat(0, Math.PI * 2),
    randomFloat(0, Math.PI * 2),
  ];
  
  // Animation speed variation
  const animationSpeed = randomFloat(0.5, 2.0);
  
  return {
    shapeType,
    color,
    size,
    position,
    rotation,
    scale,
    animationSpeed,
  };
}

export function isPositionWithinBounds(position: [number, number, number]): boolean {
  const [x, y, z] = position;
  return (
    x >= -SAFE_HALF &&
    x <= SAFE_HALF &&
    z >= -SAFE_HALF &&
    z <= SAFE_HALF &&
    y >= FLOOR_TOP_Y
  );
}

export function getShapeDisplayName(shapeType: ShapeType): string {
  const names: Record<ShapeType, string> = {
    box: 'Box',
    sphere: 'Sphere',
    torus: 'Torus',
    cone: 'Cone',
    cylinder: 'Cylinder',
  };
  return names[shapeType];
}
