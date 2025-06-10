import * as THREE from "three";

export function createBoxWithUVs(cols = 3, rows = 2): THREE.BoxGeometry {
  const box = new THREE.BoxGeometry(2, 2, 2);

  const tileMap = [
    [0, 0], // Right (+x)
    [1, 0], // Left (−x)
    [2, 0], // Top (+y)
    [0, 1], // Bottom (−y)
    [1, 1], // Front (+z)
    [2, 1], // Back (−z)
  ];

  const uvs = box.attributes.uv.array as Float32Array;

  for (let face = 0; face < 6; face++) {
    const [col, row] = tileMap[face];

    const uMin = col / cols;
    const uMax = (col + 1) / cols;
    const vMin = 1 - (row + 1) / rows;
    const vMax = 1 - row / rows;

    // Each face has 2 triangles, each triangle has 3 vertices (6 total UV values per face)
    const offset = face * 8;

    uvs[offset + 0] = uMin;
    uvs[offset + 1] = vMax; // Vertex 1
    uvs[offset + 2] = uMin;
    uvs[offset + 3] = vMin; // Vertex 2
    uvs[offset + 4] = uMax;
    uvs[offset + 5] = vMax; // Vertex 3
    uvs[offset + 6] = uMax;
    uvs[offset + 7] = vMin; // Vertex 4
  }

  box.attributes.uv.needsUpdate = true;
  return box;
}

export function createTetrahedronWithUVs(): THREE.BufferGeometry {
  // Tetrahedron has 4 triangle faces, each with 3 unique vertices
  const radius = 1;
  const tetra = new THREE.TetrahedronGeometry(radius);
  const nonIndexed = tetra.toNonIndexed(); // Ensure unique vertices per face

  const posAttr = nonIndexed.getAttribute("position");
  const uvArray: number[] = [];

  const atlasCols = 2;
  const uvTileSize = 1 / atlasCols;

  const faceCount = posAttr.count / 3; // Each face has 3 vertices

  for (let face = 0; face < faceCount; face++) {
    const col = face % atlasCols;
    const row = Math.floor(face / atlasCols);

    const u0 = col * uvTileSize;
    const v0 = 1 - row * uvTileSize;
    const u1 = u0 + uvTileSize;
    const v1 = v0 - uvTileSize;

    // Assign triangle UVs covering the full tile
    uvArray.push(u0, v1); // bottom left
    uvArray.push(u1, v1); // bottom right
    uvArray.push((u0 + u1) / 2, v0); // top center
  }

  nonIndexed.setAttribute("uv", new THREE.Float32BufferAttribute(uvArray, 2));
  return nonIndexed;
}

export function createD10GeometryWithUVs(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const top = new THREE.Vector3(0, 1, 0);
  const bottom = new THREE.Vector3(0, -1, 0);
  const radius = 1;
  const ring: THREE.Vector3[] = [];

  const angleStep = (Math.PI * 2) / 10;

  for (let i = 0; i < 10; i++) {
    const angle = i * angleStep;
    const y = i % 2 === 0 ? 0.3 : -0.3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    ring.push(new THREE.Vector3(x, y, z));
  }

  const cols = 5;
  const rows = 2;

  for (let i = 0; i < 10; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % 10];
    const c = i % 2 === 0 ? top : bottom;

    const baseIndex = positions.length / 3;

    // Add triangle vertices
    positions.push(...a.toArray(), ...c.toArray(), ...b.toArray());
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);

    // Tile location in the atlas
    const col = i % cols;
    const row = Math.floor(i / cols);
    const uMin = col / cols;
    const uMax = (col + 1) / cols;
    const vMin = 1 - (row + 1) / rows;
    const vMax = 1 - row / rows;

    // Stretch triangle to fully cover the square tile
    // Better for fitting number textures
    uvs.push(
      uMin,
      vMax, // a - bottom left
      (uMin + uMax) / 2,
      vMin, // c - top center
      uMax,
      vMax // b - bottom right
    );
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
}

export function createD12GeometryWithUVs() {
  const base = new THREE.DodecahedronGeometry(1);
  const geom = base.toNonIndexed();

  const position = geom.attributes.position;
  const vertexCount = position.count; // likely 180

  const cols = 4;
  const rows = 3;
  const faceCount = 12;
  const vertsPerFace = vertexCount / faceCount; // should be 15

  const uvArray = new Float32Array(vertexCount * 2);

  // Temporary vectors
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();

  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  const normal = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const bitangent = new THREE.Vector3();

  for (let face = 0; face < faceCount; face++) {
    const startIdx = face * vertsPerFace;

    // Get first three vertices of face to define plane
    v0.fromBufferAttribute(position, startIdx);
    v1.fromBufferAttribute(position, startIdx + 1);
    v2.fromBufferAttribute(position, startIdx + 2);

    edge1.subVectors(v1, v0);
    edge2.subVectors(v2, v0);

    normal.crossVectors(edge1, edge2).normalize();

    tangent.copy(edge1).normalize();
    bitangent.crossVectors(normal, tangent).normalize();

    // Project vertices to 2D coords
    let uMin = Infinity,
      vMin = Infinity;
    let uMax = -Infinity,
      vMax = -Infinity;

    const uvs = [];

    for (let i = 0; i < vertsPerFace; i++) {
      const idx = startIdx + i;
      const vert = new THREE.Vector3().fromBufferAttribute(position, idx);

      const vec = new THREE.Vector3().subVectors(vert, v0);

      const u = vec.dot(tangent);
      const v = vec.dot(bitangent);

      uvs.push({ u, v });

      if (u < uMin) uMin = u;
      if (v < vMin) vMin = v;
      if (u > uMax) uMax = u;
      if (v > vMax) vMax = v;
    }

    const uRange = uMax - uMin || 1;
    const vRange = vMax - vMin || 1;

    // Atlas tile bounds with padding
    const col = face % cols;
    const row = Math.floor(face / cols);

    const padding = 0.01;
    const tileUmin = col / cols + padding;
    const tileUmax = (col + 1) / cols - padding;
    const tileVmin = 1 - (row + 1) / rows + padding;
    const tileVmax = 1 - row / rows - padding;

    const tileURange = tileUmax - tileUmin;
    const tileVRange = tileVmax - tileVmin;

    // Assign final UVs
    for (let i = 0; i < vertsPerFace; i++) {
      const idx = startIdx + i;

      const uNorm = (uvs[i].u - uMin) / uRange;
      const vNorm = (uvs[i].v - vMin) / vRange;

      uvArray[idx * 2] = tileUmin + uNorm * tileURange;
      uvArray[idx * 2 + 1] = tileVmin + vNorm * tileVRange;
    }
  }

  geom.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));
  return geom;
}

export function createD20GeometryWithUVs() {
  const base = new THREE.IcosahedronGeometry(1);
  const geom = base.toNonIndexed();

  const position = geom.attributes.position;
  const vertexCount = position.count; // 20 faces * 3 verts = 60 verts

  const faceCount = 20;
  const vertsPerFace = 3; // triangles

  const cols = 5;
  const rows = 4;

  const uvArray = new Float32Array(vertexCount * 2);

  // Temporary vectors for projection
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();

  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  const normal = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const bitangent = new THREE.Vector3();

  for (let face = 0; face < faceCount; face++) {
    const startIdx = face * vertsPerFace;

    v0.fromBufferAttribute(position, startIdx);
    v1.fromBufferAttribute(position, startIdx + 1);
    v2.fromBufferAttribute(position, startIdx + 2);

    edge1.subVectors(v1, v0);
    edge2.subVectors(v2, v0);

    normal.crossVectors(edge1, edge2).normalize();

    tangent.copy(edge1).normalize();
    bitangent.crossVectors(normal, tangent).normalize();

    let uMin = Infinity,
      vMin = Infinity;
    let uMax = -Infinity,
      vMax = -Infinity;

    const uvs = [];

    for (let i = 0; i < vertsPerFace; i++) {
      const idx = startIdx + i;
      const vert = new THREE.Vector3().fromBufferAttribute(position, idx);

      const vec = new THREE.Vector3().subVectors(vert, v0);

      const u = vec.dot(tangent);
      const v = vec.dot(bitangent);

      uvs.push({ u, v });

      if (u < uMin) uMin = u;
      if (v < vMin) vMin = v;
      if (u > uMax) uMax = u;
      if (v > vMax) vMax = v;
    }

    const uRange = uMax - uMin || 1;
    const vRange = vMax - vMin || 1;

    // Atlas tile bounds with padding
    const padding = 0.01;
    const col = face % cols;
    const row = Math.floor(face / cols);

    const tileUmin = col / cols + padding;
    const tileUmax = (col + 1) / cols - padding;
    const tileVmin = 1 - (row + 1) / rows + padding;
    const tileVmax = 1 - row / rows - padding;

    const tileURange = tileUmax - tileUmin;
    const tileVRange = tileVmax - tileVmin;

    // Assign UVs
    for (let i = 0; i < vertsPerFace; i++) {
      const idx = startIdx + i;

      const uNorm = (uvs[i].u - uMin) / uRange;
      const vNorm = (uvs[i].v - vMin) / vRange;

      uvArray[idx * 2] = tileUmin + uNorm * tileURange;
      uvArray[idx * 2 + 1] = tileVmin + vNorm * tileVRange;
    }
  }

  geom.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));
  return geom;
}
