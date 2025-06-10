const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

/**
 * Generates a texture atlas for dice with numbered faces.
 *
 * @param {Object} options
 * @param {number} options.count - Number of faces (e.g., 6 for D6).
 * @param {number} options.columns - Number of columns in the grid.
 * @param {number} options.tileSize - Size of each face square (in px).
 * @param {string} options.name - Output file name (e.g., "d6-texture.png").
 */
function generateDiceAtlas({ count, columns, tileSize, name }) {
  const rows = Math.ceil(count / columns);
  const width = columns * tileSize;
  const height = rows * tileSize;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  // Style
  ctx.fillStyle = "#000000";
  ctx.font = `${tileSize * 0.5}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < count; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * tileSize;
    const y = row * tileSize;

    // Outline
    ctx.strokeStyle = "#aaa";
    ctx.strokeRect(x, y, tileSize, tileSize);

    // Number
    ctx.fillText(`${i + 1}`, x + tileSize / 2, y + tileSize / 2);
  }

  const outPath = path.join(__dirname, name);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(
    `Saved: ${name} (${count} faces, ${columns} cols, ${tileSize}px)`
  );
}

function generateDiceAtlas2({
  cols = 4,
  rows = 5,
  tileSize = 256,
  output = "d10-atlas.png",
  fontSize = 128,
  fontFamily = "Arial",
  bgColor = "#ffffff",
  textColor = "#000000",
}) {
  const width = cols * tileSize;
  const height = rows * tileSize;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;

  for (let i = 0; i < rows * cols; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * tileSize + tileSize / 2;
    const y = row * tileSize + tileSize / 2;

    ctx.fillText((i + 1).toString(), x, y);
  }

  const out = fs.createWriteStream(path.join(__dirname, output));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => {
    console.log(`Saved atlas to ${output}`);
  });
}

generateDiceAtlas({
  count: 4,
  columns: 2,
  tileSize: 256,
  name: "d4-texture.png",
});
generateDiceAtlas({
  count: 6,
  columns: 3,
  tileSize: 256,
  name: "d6-texture.png",
});
generateDiceAtlas({
  count: 8,
  columns: 4,
  tileSize: 256,
  name: "d8-texture.png",
});
generateDiceAtlas2({
  cols: 5,
  rows: 4,
  tileSize: 256,
  output: "d10-texture.png",
});
generateDiceAtlas({
  count: 12,
  columns: 4,
  tileSize: 256,
  name: "d12-texture.png",
});
generateDiceAtlas({
  count: 20,
  columns: 5,
  tileSize: 256,
  name: "d20-texture.png",
});
