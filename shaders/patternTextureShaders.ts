/**
 * Isometric grid pattern (from reference) with diffuse shading.
 * Uses world position for grid to avoid UV seams; tinted by uColor.
 */

export const patternTextureVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const patternTextureFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform float u_time;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle), c = cos(angle);
    return mat2(c, -s, s, c) * p;
  }

  float gridPattern(vec2 p) {
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    return min(grid.x, grid.y);
  }

  float isoGrid(vec2 p) {
    p = rotate2D(p, 3.14159 / 4.0);
    vec2 grid1 = p;
    vec2 grid2 = rotate2D(p, 3.14159 / 3.0);
    return min(gridPattern(grid1 * 8.0), gridPattern(grid2 * 8.0));
  }

  void main() {
    float scale = 0.25;
    vec2 p = vWorldPosition.xz * scale + vWorldPosition.xy * 0.1;
    vec2 motion = vec2(u_time * 0.1, u_time * 0.06);
    float grid = isoGrid(p + motion);

    vec3 color1 = uColor * 1.1;
    vec3 color2 = uColor * 0.85;
    vec3 bgColor = uColor * 0.5;

    float gridLines = smoothstep(0.8, 0.2, grid);
    vec3 patternColor = mix(bgColor, mix(color1, color2, sin(u_time) * 0.5 + 0.5), gridLines);

    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.3));
    float diffuse = max(0.0, dot(normalize(vWorldNormal), lightDir));
    vec3 shaded = patternColor * (0.45 + 0.55 * diffuse);

    gl_FragColor = vec4(shaded, 1.0);
  }
`;
