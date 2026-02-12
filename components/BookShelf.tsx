export default function BookShelf() {

    return (
        <group position={[0, -2, 0]}>
            {/* Base shelf */}
            <mesh position={[0, 0, 0]} castShadow
                receiveShadow>
                <boxGeometry args={[8, 0.3, 2]} />
                <meshStandardMaterial color="#8B4513" roughness={1} metalness={0} />
            </mesh>
            {[-3, 0, 3].map((x) => (
                <mesh key={x} position={[x, 0.15 + 0.75, 0]}
                    castShadow
                    receiveShadow>
                    <boxGeometry args={[0.2, 1.5, 2]} />
                    <meshStandardMaterial color="#A0522D" roughness={1} metalness={0} />
                </mesh>
            ))}

        </group>
    );
}
