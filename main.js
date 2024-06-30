import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

const ROWS = 80;
const COLUMNS = 20;
const squareSize = 100;

let MAP = [[]];
for (let i = 0; i < ROWS; i++) {
  for (let j = 0; j < COLUMNS; j++) {
    MAP[i] = MAP[i] || [];
    MAP[i][j] = i === ROWS - 1 ? "1" : "0";
  }
}

const PIECES = {
  SQUARE: [
    ["X", "X"],
    ["X", "X"],
  ],
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// for debugging:
window.canvas = canvas;
window.ctx = ctx;
window.MAP = MAP;
// todelete
ctx.canvas.width = COLUMNS * squareSize;
ctx.canvas.height = ROWS * squareSize;
canvas.style.height = (canvas.clientWidth / COLUMNS) * ROWS + "px";

// Canvas functions

// set the px of the height based on the width. Applicable on init and resize
function setCanvasCSSHeight() {
  const height = (canvas.clientWidth * ROWS) / COLUMNS;
  canvas.style.height = `${height}px`;
}
// Squares functions
function squareWidth() {
  return canvas.clientWidth / COLUMNS;
}
function squareHeight() {
  return canvas.clientHeight / ROWS;
}
function paintSquare(row = 0, col = 0) {
  //random rgba colour
  ctx.fillStyle = `rgba(0,0,0,1})`;
  // posx, posy, width, height
  ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
}

console.log(
  `%c Sizes of squares: ${canvas.clientWidth}x${canvas.clientHeight} COLS: ${COLUMNS} x ROWS: ${ROWS} | `,
  "color:orange, font-size:1.5rem",
  squareWidth(),
  squareHeight()
);

// START THE ACTION
setCanvasCSSHeight();
paintSquare(1, 0);
function paint() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLUMNS; j++) {
      if (MAP[i][j] === "1") {
        paintSquare(i, j);
      }
    }
  }
}

paint();
