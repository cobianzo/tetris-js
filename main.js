import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

// const
const ROWS = 30;
const COLUMNS = 20;
const SQUARE_SIZE = 100;

const COLOR_BG = "rgba(200,200,200,1)";
const COLOR_SOLID = "rgba(0,0,0,1)";

// props
let MAP = [[]]; // represents the canvas with the fixed consolidated blocks
let CURRENT_PIECE = {
  // represent the current falling piece
  name: "el",
  rotation: 0,
  left: 5,
  top: 1,
};

let frameCount = 0;

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
  ctx.fillStyle = COLOR_SOLID;
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

function clean() {
  ctx.fillStyle = COLOR_BG;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLUMNS; j++) {
      ctx.fillRect(j * SQUARE_SIZE, i * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    }
  }
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
        paintSquare(rowInMap, colInMap);
      }
    }
  }
}

function movePiece(direction = "down") {
  const pieceShape = PIECES[CURRENT_PIECE.name];
  const pieceLength = pieceShape[0].length;
  const pieceHeight = pieceShape.length;
  let newCol = CURRENT_PIECE.left;
  let newRow = CURRENT_PIECE.top;
  direction = direction.toLowerCase();
  switch (direction) {
    case "left":
      newCol--;
      break;
    case "right":
      newCol++;
      break;
    case "down":
      newRow++;
      break;
  }

  // now we confirm if it collides
  let collision = false;
  for (let i = 0; i < pieceHeight; i++) {
    if (collision) break;

    for (let j = 0; j < pieceLength; j++) {
      if (collision) break;

      const colInMap = newCol + j;
      const rowInMap = newRow + i;
      if (pieceShape[i][j] === "X") {
        if (
          !MAP[rowInMap] ||
          typeof MAP[rowInMap][colInMap] === "undefined" ||
          MAP[rowInMap][colInMap] === "1"
        ) {
          collision = true;
          break;
        }
      }
    }
  }
  if (!collision) {
    CURRENT_PIECE.left = newCol;
    CURRENT_PIECE.top = newRow;
  } else if (direction === "down") {
    solidifyPiece();
  }
}

function solidifyPiece() {
  const pieceShape = PIECES[CURRENT_PIECE.name];
  const pieceLength = pieceShape[0].length;
  const pieceHeight = pieceShape.length;
  const col = CURRENT_PIECE.left;
  const row = CURRENT_PIECE.top;

  for (let i = 0; i < pieceHeight; i++) {
    for (let j = 0; j < pieceLength; j++) {
      const colInMap = col + j;
      const rowInMap = row + i;
      if (pieceShape[i][j] === "X") {
        MAP[rowInMap][colInMap] = "1";
      }
    }
  }

  // generate a new piece
  generateNewPiece();
}

function generateNewPiece() {
  const names = Object.keys(PIECES);
  var randomNumber = Math.floor(Math.random() * names.length);
  const newPiece = names[randomNumber];

  CURRENT_PIECE = {
    // represent the current falling piece
    name: newPiece,
    rotation: 0,
    left: 5,
    top: 1,
  };
}

console.log(
  `%c Sizes of squares: ${canvas.clientWidth}x${canvas.clientHeight} COLS: ${COLUMNS} x ROWS: ${ROWS} | `,
  "color:orange, font-size:1.5rem"
);

// START THE ACTION
setCanvasCSSHeight();
// paintSquare(0, 0);

function gameLoop() {
  frameCount = frameCount === 100 ? 1 : frameCount + 1;

  if (frameCount % 10 === 0) {
    movePiece("down");
  }

  clean();
  paint();

  window.requestAnimationFrame(gameLoop);
}

gameLoop();
window.addEventListener("keydown", function (event) {
  const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
  if (key.includes("Arrow")) {
    movePiece(key.replace("Arrow", ""));
  }
  console.log(">>> ", key);
});
