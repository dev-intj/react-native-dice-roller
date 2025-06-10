import { Asset } from "expo-asset";
import * as THREE from "three";

const textures: Record<number, any> = {
  4: require("@/assets/textures/d4-texture.png"),
  6: require("@/assets/textures/d6-texture.png"),
  8: require("@/assets/textures/d8-texture.png"),
  10: require("@/assets/textures/d10-texture.png"),
  12: require("@/assets/textures/d12-texture.png"),
  20: require("@/assets/textures/d20-texture.png"),
};

export async function loadDiceTexture(sides: number): Promise<THREE.Texture> {
  const moduleAsset = textures[sides];

  if (!moduleAsset) {
    throw new Error(`Texture for D${sides} not found`);
  }

  const asset = await Asset.fromModule(moduleAsset).downloadAsync();

  const texture = await new Promise<THREE.Texture>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const tex = new THREE.Texture(image);
      tex.needsUpdate = true;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      resolve(tex);
    };
    image.onerror = reject;
    image.src = asset.localUri || asset.uri;
  });

  return texture;
}
