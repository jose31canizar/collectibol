import { useCageCompoundBody } from '../physics/PhysicsContext';

const GROUP_Y = -2;

export default function Cage() {
  useCageCompoundBody();

  const size = 30;
  const baseHeight = 0.3;
  const borderHeight = 3.5;
  const borderThickness = 0.3;

  return (
    <group position={[0, GROUP_Y, 0]}>
      {/* Base - full box */}
      <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, baseHeight, size]} />
        <meshStandardMaterial color="#8B4513" roughness={1} metalness={0} />
      </mesh>

      {/* Borders */}
      <mesh position={[0, baseHeight + borderHeight / 2, size / 2]} castShadow receiveShadow>
        <boxGeometry args={[size, borderHeight, borderThickness]} />
        <meshStandardMaterial color="#A0522D" roughness={1} metalness={0} />
      </mesh>

      <mesh position={[0, baseHeight + borderHeight / 2, -size / 2]} castShadow receiveShadow>
        <boxGeometry args={[size, borderHeight, borderThickness]} />
        <meshStandardMaterial color="#A0522D" roughness={1} metalness={0} />
      </mesh>

      <mesh position={[-size / 2, baseHeight + borderHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[borderThickness, borderHeight, size]} />
        <meshStandardMaterial color="#A0522D" roughness={1} metalness={0} />
      </mesh>

      <mesh position={[size / 2, baseHeight + borderHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[borderThickness, borderHeight, size]} />
        <meshStandardMaterial color="#A0522D" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
