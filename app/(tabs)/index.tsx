import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";

import * as CANNON from "cannon-es";
import * as THREE from "three";

import { DiceType } from "@/types";
import { buildDiceMesh } from "@/utils/buildDiceMesh";

function createConvexPolyhedronFromGeometry(geometry: THREE.BufferGeometry) {
  const positionAttr = geometry.attributes.position;
  const vertices: CANNON.Vec3[] = [];
  for (let i = 0; i < positionAttr.count; i++) {
    vertices.push(
      new CANNON.Vec3(
        positionAttr.getX(i),
        positionAttr.getY(i),
        positionAttr.getZ(i)
      )
    );
  }

  // Every 3 vertices form a triangle face
  const faces: number[][] = [];
  for (let i = 0; i < positionAttr.count; i += 3) {
    faces.push([i, i + 1, i + 2]);
  }

  return new CANNON.ConvexPolyhedron({ vertices, faces });
}

export default function App() {
  const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20];
  const [sides, setSides] = useState<DiceType>(6);

  // THREE refs
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<Renderer>(null);

  // Physics
  const worldRef = useRef<CANNON.World>(null);
  const diceBodiesRef = useRef<{ mesh: THREE.Mesh; body: CANNON.Body }[]>([]);

  const glRef = useRef<ExpoWebGLRenderingContext>(null);

  // Dice size scale
  const diceScale = 1;

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Setup THREE scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Setup physics
    const world: any = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    worldRef.current = world;

    // Add a floor plane to stop dice from falling infinitely
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, -3, 0),
    });
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);

    // Throw dice immediately
    await spawnDice(sides);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Step physics world
      if (world) {
        world.step(1 / 60);

        // Update meshes with physics bodies position and rotation
        diceBodiesRef.current.forEach(({ mesh, body }) => {
          mesh.position.set(body.position.x, body.position.y, body.position.z);
          mesh.quaternion.set(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w
          );
        });
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
        gl.endFrameEXP();
      }
    };

    animate();
  };

  async function spawnDice(sides: DiceType) {
    if (!sceneRef.current || !worldRef.current) return;

    // Remove old dice bodies and meshes
    diceBodiesRef.current.forEach(({ mesh, body }) => {
      sceneRef.current?.remove(mesh);
      body.world?.removeBody(body);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    diceBodiesRef.current = [];

    // Build new dice mesh
    const mesh = await buildDiceMesh(sides);
    mesh.scale.setScalar(diceScale);

    sceneRef.current.add(mesh);

    // Build physics shape from geometry
    const convexShape = createConvexPolyhedronFromGeometry(
      mesh.geometry as THREE.BufferGeometry
    );

    // Create physics body
    const body = new CANNON.Body({
      mass: 1,
      shape: convexShape,
      position: new CANNON.Vec3(
        (Math.random() - 0.5) * 2,
        2 + Math.random() * 2,
        (Math.random() - 0.5) * 2
      ),
      angularVelocity: new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      angularDamping: 0.1,
      linearDamping: 0.01,
    });

    worldRef.current.addBody(body);

    diceBodiesRef.current.push({ mesh, body });
  }

  // When sides changes, throw new dice
  useEffect(() => {
    spawnDice(sides);
  }, [sides]);

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
      <ScrollView horizontal style={styles.picker}>
        {diceTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.button, sides === type && styles.selected]}
            onPress={() => setSides(type)}
          >
            <Text style={styles.buttonText}>{`D${type}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>{`Throwing: D${sides}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glView: { flex: 1 },
  picker: {
    backgroundColor: "#111",
    paddingVertical: 10,
    maxHeight: "10%",
  },
  button: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#333",
    borderRadius: 8,
    height: 45,
  },
  selected: {
    backgroundColor: "#1e90ff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
  },
});
