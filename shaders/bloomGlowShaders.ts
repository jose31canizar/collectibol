/**
 * Vertex shader: liquid/wavy displacement over time when focused; pass data for fake glow.
 */
export const bloomGlowVertex = /* glsl */ `
  precision mediump float;

  uniform mediump float u_time;
  uniform mediump float uWaviness;

  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    float t = u_time;
    vec3 p = position;
    vec3 n = normalize(normal);

    // Different frequencies and speeds for out-of-sync waves
    // Using non-harmonic frequencies to avoid synchronization
    float freq1 = 2.3;
    float freq2 = 1.9;
    float freq3 = 2.7;
    
    // Different speeds with irrational ratios to keep waves random
    float speed1 = 0.85;
    float speed2 = 1.15;
    float speed3 = 0.72;
    
    // Phase offsets to desynchronize waves (random phases)
    float phase1 = 0.0;
    float phase2 = 2.094; // ~2π/3
    float phase3 = 4.189; // ~4π/3
    float phase4 = 1.047; // ~π/3
    float phase5 = 5.236; // ~5π/3
    
    // Calculate waves with phase offsets for randomness
    float wave1 = sin(p.x * freq1 + t * speed1 + phase1);
    float wave2 = sin(p.y * freq2 + t * speed2 + phase2);
    float wave3 = sin(p.z * freq3 + t * speed3 + phase3);
    
    // Additional waves with different combinations for oblong distortions
    float wave4 = sin((p.x * 0.9 + p.y * 1.3) * 1.6 + t * 0.95 + phase4);
    float wave5 = sin((p.y * 1.2 + p.z * 0.85) * 1.9 + t * 0.78 + phase5);
    
    // Multiplicative combinations create oblong shapes
    // When waves multiply, they create stretching in different directions
    float mult1 = (wave1 * 0.5 + 0.5) * (wave2 * 0.5 + 0.5);
    float mult2 = (wave2 * 0.5 + 0.5) * (wave3 * 0.5 + 0.5);
    float mult3 = (wave1 * 0.5 + 0.5) * (wave3 * 0.5 + 0.5);
    
    // Combine multiplicative (for oblong) and additive (for smoothness)
    float combined = mult1 * 0.35 + mult2 * 0.25 + mult3 * 0.2 + wave4 * 0.1 + wave5 * 0.1;
    
    // Normalize to 0-1 range
    float normalized = combined * 0.5 + 0.5;
    
    // Smooth easing for gradual motion
    float eased = normalized * normalized * (3.0 - 2.0 * normalized);
    
    // Center displacement around zero (oscillate -1 to 1, then scale)
    // This makes displacement push both inward and outward, preserving size
    float centered = (eased - 0.5) * 2.0; // Convert 0-1 to -1 to 1
    
    // Apply displacement radially - oscillates around zero
    vec3 radialDir = normalize(p + 0.0001);
    float displacement = centered * uWaviness;
    vec3 pos = position + radialDir * displacement;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

/**
 * Fragment shader: fake glow effect using fresnel/falloff approach (single mesh, no post-processing).
 * Based on fake-glow-material-r3f approach combined with wavy surface effects.
 */
export const bloomGlowFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform mediump float u_time;
  uniform float uFalloff;
  uniform float uGlowInternalRadius;
  uniform float uGlowSharpness;
  uniform float uOpacity;

  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing) {
      normal *= -1.0;
    }
    
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, normal);
    fresnel = pow(fresnel, uGlowInternalRadius + 0.1);
    
    float falloff = smoothstep(0.0, uFalloff, fresnel);
    float fakeGlow = fresnel;
    fakeGlow += fresnel * uGlowSharpness;
    fakeGlow *= falloff;
    
    float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
    fakeGlow *= pulse;
    
    vec3 glowColor = uColor * 1.5;
    vec3 finalColor = clamp(glowColor * fresnel, 0.0, 1.0);
    float alpha = clamp(fakeGlow, 0.0, uOpacity);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const BLOOM_GLOW_UNIFORMS = {
  u_time: { value: 0 },
  uWaviness: { value: 0.2 },
  uFalloff: { value: 0.05 },
  uGlowInternalRadius: { value: 1.0 },
  uGlowSharpness: { value: 0.2 },
  uOpacity: { value: 1.0 },
} as const;
