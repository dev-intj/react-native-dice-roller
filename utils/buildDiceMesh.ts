import { THREE } from "expo-three";

import { DiceType } from "@/types";

import { createDiceGeometry } from "./createDiceGeometry";
import { loadDiceTexture } from "./loadDiceTextures";

export const buildDiceMesh = async (sides: DiceType): Promise<THREE.Mesh> => {
  const geometry = createDiceGeometry(sides);

  const texture = await loadDiceTexture(sides);

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;

  const material2 = new THREE.MeshNormalMaterial();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color("#FF0000") },
      numberMap: { value: texture },
    },
    vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 baseColor;
    uniform sampler2D numberMap;
    varying vec2 vUv;

    void main() {
      vec4 numberTex = texture2D(numberMap, vUv);
      vec3 color = mix(baseColor, numberTex.rgb, numberTex.a);
      gl_FragColor = vec4(color, 1);
    }
  `,
    transparent: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
};
