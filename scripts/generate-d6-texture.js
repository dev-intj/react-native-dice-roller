const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const TILE_SIZE = 256;
const COLS = 3;
const ROWS = 2;
const WIDTH = TILE_SIZE * COLS;
const HEIGHT = TILE_SIZE * ROWS;

const labels = {
  0: "1", // Right
  1: "2", // Left
  2: "3", // Top
  3: "4", // Bottom
  4: "5", // Front
  5: "6", // Back
};

const tilePositions = {
  0: [0, 0], // Right
  1: [1, 0], // Left
  2: [2, 0], // Top
  3: [0, 1], // Bottom
  4: [1, 1], // Front
  5: [2, 1], // Back
};

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background color
ctx.fillStyle = "#f4f4f4";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Font settings
ctx.font = `${TILE_SIZE * 0.6}px sans-serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "#000";

for (let i = 0; i < 6; i++) {
  const [col, row] = tilePositions[i];
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  // Draw tile background (optional grid)
  ctx.strokeStyle = "#ccc";
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

  // Draw number
  ctx.fillText(labels[i], x + TILE_SIZE / 2, y + TILE_SIZE / 2);
}

// Output file
const outPath = path.join(__dirname, 'd6-texture.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Saved D6 texture: ${outPath}`);