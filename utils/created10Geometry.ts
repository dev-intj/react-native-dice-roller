import { THREE } from "expo-three";

export const createD10Geometry = (): THREE.BufferGeometry  => {
  const sides = 10;
  const radius = 1;

  const baseVertices = [
    [0, 0, 1], // top point
    [0, 0, -1], // bottom point
  ];

  for (let i = 0; i < sides; ++i) {
    const b = (i * Math.PI * 2) / sides;
    baseVertices.push([
      -Math.cos(b),
      -Math.sin(b),
      0.105 * (i % 2 === 1 ? 1 : -1),
    ]);
  }

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

  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const cols = 5;
  const rows = 4;

  const vertices = baseVertices.map((v) => new THREE.Vector3(...v));

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const baseIndex = positions.length / 3;

    // Push vertex positions
    for (let j = 0; j < 3; j++) {
      const v = vertices[face[j]];
      positions.push(v.x, v.y, v.z);
    }

    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);

    // UV mapping
    const col = i % cols;
    const row = Math.floor(i / cols);
    const uMin = col / cols;
    const uMax = (col + 1) / cols;
    const vMin = 1 - (row + 1) / rows;
    const vMax = 1 - row / rows;

    // Triangle fills whole tile
    uvs.push(uMin, vMax, (uMin + uMax) / 2, vMin, uMax, vMax);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
};
