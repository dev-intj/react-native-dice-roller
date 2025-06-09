import { THREE } from "expo-three";

import { createD10Geometry } from "./created10Geometry";

import { DiceType } from "@/types";

export const createDiceGeometry = (sides: DiceType): THREE.BufferGeometry => {
  switch (sides) {
    case 4:
      return new THREE.TetrahedronGeometry(1);
    case 6:
      return new THREE.BoxGeometry(2, 2, 2);
    case 8:
      return new THREE.OctahedronGeometry(1);
    case 10:
      return createD10Geometry();
    case 12:
      return new THREE.DodecahedronGeometry(1);
    case 20:
    default:
      return new THREE.IcosahedronGeometry(1);
  }
};
