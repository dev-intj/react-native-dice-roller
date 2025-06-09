import { THREE } from "expo-three";

export const createD10Geometry = (): THREE.PolyhedronGeometry => {
  const sides = 10;
  const radius = 1;

  const baseVertices = [
    [0, 0, 1],
    [0, 0, -1],
  ];
  for (let i = 0; i < sides; ++i) {
    const b = (i * Math.PI * 2) / sides;
    baseVertices.push([-Math.cos(b), -Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
  }

  const vertices = baseVertices.map((v) => new THREE.Vector3(...v));

  const faces = [
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 5],
    [0, 5, 6],
    [0, 6, 7],
    [0, 7, 8],
    [0, 8, 9],
    [0, 9, 10],
    [0, 10, 11],
    [0, 11, 2],
    [1, 3, 2],
    [1, 4, 3],
    [1, 5, 4],
    [1, 6, 5],
    [1, 7, 6],
    [1, 8, 7],
    [1, 9, 8],
    [1, 10, 9],
    [1, 11, 10],
    [1, 2, 11],
  ];

  const flatVertices = vertices.map((v) => v.toArray()).flat();
  const flatFaces = faces.flat();

  return new THREE.PolyhedronGeometry(flatVertices, flatFaces, radius, 0);
};
