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

import { DiceType } from "@/types";

import { createDiceGeometry } from "@/utils/createDiceGeometry";
import * as THREE from "three";

export default function App() {
  const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20];

  const [sides, setSides] = useState<DiceType>(20);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    const geometry = createDiceGeometry(sides);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Store refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const animate = () => {
      requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return;

    const scene = sceneRef.current;
    const oldMesh = meshRef.current;
    scene.remove(oldMesh);
    oldMesh.geometry.dispose();

    const newGeometry = createDiceGeometry(sides);
    const newMaterial = new THREE.MeshNormalMaterial();
    const newMesh = new THREE.Mesh(newGeometry, newMaterial);

    meshRef.current = newMesh;
    scene.add(newMesh);
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
      <Text style={styles.label}>{`Selected: D${sides}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  glView: {
    flex: 1,
  },
  picker: {
    backgroundColor: "#111",
    paddingVertical: 10,
  },
  button: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#333",
    borderRadius: 8,
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
