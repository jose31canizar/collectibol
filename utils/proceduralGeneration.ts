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

export function generateProceduralInstance(): Omit<Object3DInstance, 'id' | 'createdAt'> {
  const shapeType = randomChoice(SHAPE_TYPES);
  const color = randomChoice(COLORS);
  const size = randomFloat(0.3, 1.2);
  const scale = randomFloat(0.8, 1.5);
  
  // Position within a controlled area
  const position: [number, number, number] = [
    randomFloat(-3, 3),
    randomFloat(-2, 2),
    randomFloat(-3, 3),
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
