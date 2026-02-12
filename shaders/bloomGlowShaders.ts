/**
 * Vertex shader: liquid/wavy displacement over time when focused; pass data for bloom.
 */
export const bloomGlowVertex = /* glsl */ `
  precision mediump float;

  uniform mediump float u_time;
  uniform mediump float uWaviness;

  varying vec2 vAngleDist;

  void main() {
    float t = u_time;
    vec3 p = position;
    vec3 radialDir = normalize(p + 0.0001);

    float wave1 = sin(p.x * 3.0 + t * 1.2) * 0.5 + 0.5;
    float wave2 = sin(p.y * 2.5 + t * 1.5) * 0.5 + 0.5;
    float wave3 = sin(p.z * 3.5 + t * 0.9) * 0.5 + 0.5;
    float wave4 = sin((p.x + p.y) * 2.0 + t) * sin((p.y + p.z) * 1.8 + t * 1.1);
    float displacement = (wave1 * wave2 + wave3 * 0.6 + wave4 * 0.4) * uWaviness;

    vec3 pos = position + radialDir * displacement;
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vec3 nRaw = normalize(normal);
    vec3 nWorld = normalize(normalMatrix * nRaw);

    float NdotV = max(dot(nWorld, normalize(cameraPosition - worldPosition.xyz)), 0.0);
    float rimFactor = 1.0 - NdotV;
    float angle = atan(nWorld.y, nWorld.x);
    vAngleDist = vec2(angle, rimFactor);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/**
 * Fragment shader: wavy ring glow (simplex + FBM) that extends outside the object.
 * Based on 2D reference adapted for 3D rim/angle parameterization.
 */
export const bloomGlowFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform mediump float u_time;

  varying vec2 vAngleDist;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 baseColor = uColor;

    float angle = vAngleDist.x;
    float dist = vAngleDist.y;

    float wave1 = sin(angle * 6.0 + u_time * 2.0) * 0.02;
    float wave2 = sin(angle * 8.0 - u_time * 1.5) * 0.015;
    float noise = fbm(vec2(angle * 2.0, u_time * 0.5)) * 0.03;

    float wavyDist = dist + wave1 + wave2 + noise;

    float glowRadius = 0.35;
    float glowWidth = 0.22;
    float glowFalloff = 2.2;

    float glowDist = abs(wavyDist - glowRadius);
    float glow = pow(1.0 - smoothstep(0.0, glowWidth, glowDist), glowFalloff);

    float rimDist = abs(wavyDist - glowRadius);
    float rim = exp(-rimDist * 15.0) * 1.8;

    float emissive = smoothstep(glowRadius + glowWidth, glowRadius - 0.05, wavyDist) * 0.4;

    float totalGlow = glow + rim + emissive;
    float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
    totalGlow = max(0.0, totalGlow * pulse);

    vec3 glowColor = uColor * 1.3;
    vec3 glowContrib = glowColor * totalGlow * 1.2;
    vec3 finalColor = baseColor + glowContrib;
    finalColor = clamp(finalColor, vec3(0.0), vec3(2.0));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const BLOOM_GLOW_UNIFORMS = {
  u_time: { value: 0 },
  uWaviness: { value: 0.09 },
} as const;
