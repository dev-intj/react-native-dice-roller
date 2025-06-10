import { THREE } from "expo-three";

import { DiceType } from "@/types";

import {
  createBoxWithUVs,
  createD12GeometryWithUVs,
  createD20GeometryWithUVs,
  createTetrahedronWithUVs,
} from "./generateUVs";

import { createD10Geometry } from "./created10Geometry";

export const createDiceGeometry = (sides: DiceType): THREE.BufferGeometry => {
  switch (sides) {
    case 4:
      return createTetrahedronWithUVs();
    case 6:
      return createBoxWithUVs();
    case 8:
      return new THREE.OctahedronGeometry(1);
    case 10:
      return createD10Geometry();
    case 12:
      return createD12GeometryWithUVs();
    case 20:
    default:
      return createD20GeometryWithUVs();
  }
};
