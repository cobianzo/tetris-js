import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

const ROWS = 100;
const COLUMNS = 20;
const SQUARE_SIZE = 100;

let MAP = [[]]; // represents the canvas with the fixed consolidated blocks
let CURRENT_PIECE = {
  // represent the current falling piece
  name: "el",
  rotation: 0,
  left: 5,
  top: 1,
};

for (let i = 0; i < ROWS; i++) {
  for (let j = 0; j < COLUMNS; j++) {
    MAP[i] = MAP[i] || [];
    MAP[i][j] = i === ROWS - 1 ? "1" : "0";
  }
}

const PIECES = {
  square: [
    ["X", "X"],
    ["X", "X"],
  ],
  el: [
    ["X", ""],
    ["X", ""],
    ["X", ""],
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
ctx.canvas.width = COLUMNS * SQUARE_SIZE;
ctx.canvas.height = ROWS * SQUARE_SIZE;
canvas.style.height = (canvas.clientWidth / COLUMNS) * ROWS + "px";

// Squares functions
// =================================================================
function paintSquare(row = 0, col = 0) {
  //random rgba colour
  ctx.fillStyle = `rgba(0,0,0,1})`;
  // posx, posy, width, height
  ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
}

// Canvas functions
// =================================================================
// set the px of the height based on the width. Applicable on init and resize
function setCanvasCSSHeight() {
  const height = (canvas.clientWidth * ROWS) / COLUMNS;
  canvas.style.height = `${height}px`;
}
function paint() {
  if (CURRENT_PIECE) {
    paintPiece(
      CURRENT_PIECE.name,
      CURRENT_PIECE.left,
      CURRENT_PIECE.top,
      CURRENT_PIECE.rotation
    );
  }

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLUMNS; j++) {
      if (MAP[i][j] === "1") {
        paintSquare(i, j);
      }
    }
  }
}

// Pieces functions
// =================================================================
function paintPiece(pieceName, col = 0, row = 0, rotation = 0) {
  const pieceShape = PIECES[pieceName];
  const pieceLength = pieceShape[0].length;
  const pieceHeight = pieceShape.length;

  for (let i = 0; i < pieceHeight; i++) {
    for (let j = 0; j < pieceLength; j++) {
      const colInMap = col + j;
      const rowInMap = row + i;
      if (pieceShape[i][j] === "X") {
        MAP[rowInMap][colInMap] = "1";
      }
    }
  }
}

console.log(
  `%c Sizes of squares: ${canvas.clientWidth}x${canvas.clientHeight} COLS: ${COLUMNS} x ROWS: ${ROWS} | `,
  "color:orange, font-size:1.5rem"
);

// START THE ACTION
setCanvasCSSHeight();
// paintSquare(0, 0);
paint();
