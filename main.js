import "./style.css";
import { transpose } from "./matrix-operators.js";
import gameConfig from "./game-config.json";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

// const

// props
let MAP = [[]]; // represents the canvas with the fixed consolidated blocks
let CURRENT_PIECE = {
  // represent the current falling piece
  name: "el",
  rotation: 0,
  left: 5,
  top: 1,
};

// statuses of the game
let frameCount = 0;
let pause = false;
let isGameOver = false;

// build the canvas matrix
for (let i = 0; i < gameConfig.ROWS; i++) {
  for (let j = 0; j < gameConfig.COLUMNS; j++) {
    MAP[i] = MAP[i] || [];
    MAP[i][j] = i >= gameConfig.ROWS - 2 ? "1" : "0";
  }
}
MAP[gameConfig.ROWS - 1][5] = "0";
MAP[gameConfig.ROWS - 2][5] = "0";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// for debugging:
window.canvas = canvas;
window.ctx = ctx;
window.MAP = MAP;
// todelete
ctx.canvas.width = gameConfig.COLUMNS * gameConfig.SQUARE_SIZE;
ctx.canvas.height = gameConfig.ROWS * gameConfig.SQUARE_SIZE;
canvas.style.height =
  (canvas.clientWidth / gameConfig.COLUMNS) * gameConfig.ROWS + "px";

// Squares functions
// =================================================================
function paintSquare(row = 0, col = 0) {
  ctx.fillStyle = gameConfig.COLOR_SOLID;
  // posx, posy, width, height
  ctx.fillRect(
    col * gameConfig.SQUARE_SIZE,
    row * gameConfig.SQUARE_SIZE,
    gameConfig.SQUARE_SIZE,
    gameConfig.SQUARE_SIZE
  );
}

// Canvas functions
// =================================================================
// set the px of the height based on the width. Applicable on init and resize
function setCanvasCSSHeight() {
  const height = (canvas.clientWidth * gameConfig.ROWS) / gameConfig.COLUMNS;
  canvas.style.height = `${height}px`;
}

function clean() {
  ctx.fillStyle = gameConfig.COLOR_BG;
  for (let i = 0; i < gameConfig.ROWS; i++) {
    for (let j = 0; j < gameConfig.COLUMNS; j++) {
      ctx.fillRect(
        j * gameConfig.SQUARE_SIZE,
        i * gameConfig.SQUARE_SIZE,
        gameConfig.SQUARE_SIZE,
        gameConfig.SQUARE_SIZE
      );
    }
  }
}

function paint() {
  clean();

  if (CURRENT_PIECE) {
    const { name, left, top, rotation } = CURRENT_PIECE;
    paintPiece(name, left, top, rotation);
  }

  for (let i = 0; i < gameConfig.ROWS; i++) {
    for (let j = 0; j < gameConfig.COLUMNS; j++) {
      if (MAP[i][j] === "1") {
        paintSquare(i, j);
      }
    }
  }
}

/**
 * If there are solid compelted rows, delete them
 */
function deleteFullRows() {
  let isDeletedRows = 0;
  for (let i = 0; i < gameConfig.ROWS; i++) {
    const completedRow = MAP[i].every((pixel) => pixel === "1");
    //move down all rows above it.
    if (completedRow) {
      isDeletedRows++;
      for (let shiftRow = i; shiftRow > 0; shiftRow--) {
        MAP[shiftRow] = MAP[shiftRow - 1];
      }
      paint();
      isDeletedRows += window.requestAnimationFrame(deleteFullRows);
      return;
    }
  }
  return isDeletedRows;
}
// Pieces functions
// =================================================================

function getCurrentPieceShape() {
  // get the shape by default
  const pieceShape = gameConfig.PIECES[CURRENT_PIECE.name];

  // calculate the shape with the rotation
  if (CURRENT_PIECE.rotation === 1) {
    return transpose(pieceShape);
  }
  if (CURRENT_PIECE.rotation === 2) {
    return transpose(transpose(pieceShape));
  }
  if (CURRENT_PIECE.rotation === 3) {
    return transpose(transpose(transpose(pieceShape)));
  }
  return pieceShape;
}

function paintPiece(pieceName, col = 0, row = 0, rotation = 0) {
  const pieceShape = getCurrentPieceShape();
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

function checkOverlappedCollision(shape, position) {
  const shapeLength = shape[0].length;
  const shapeHeight = shape.length;

  for (let i = 0; i < shapeHeight; i++) {
    for (let j = 0; j < shapeLength; j++) {
      const colInMap = position.left + j;
      const rowInMap = position.top + i;
      if (shape[i][j] === "X") {
        if (
          !MAP[rowInMap] ||
          typeof MAP[rowInMap][colInMap] === "undefined" ||
          MAP[rowInMap][colInMap] === "1"
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function movePiece(direction = "down") {
  const pieceShape = getCurrentPieceShape();

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

  // if (newRow === 27) {
  //   debugger;
  // }
  // now we confirm if the new position that we want to assign collides with other solid object
  const collision = checkOverlappedCollision(pieceShape, {
    left: newCol,
    top: newRow,
  });

  if (!collision) {
    CURRENT_PIECE.left = newCol;
    CURRENT_PIECE.top = newRow;
  } else if (direction === "down") {
    solidifyPiece();
  }
}

function solidifyPiece() {
  const pieceShape = getCurrentPieceShape();
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
  const names = Object.keys(gameConfig.PIECES);
  var randomNumber = Math.floor(Math.random() * names.length);
  const newPiece = names[randomNumber];

  CURRENT_PIECE = {
    // represent the current falling piece
    name: newPiece,
    rotation: 0,
    left: 5,
    top: 0,
  };

  // check if the new piece collides already with something in the map.
  if (checkOverlappedCollision(getCurrentPieceShape(), CURRENT_PIECE)) {
    isGameOver = true;
  }
}

console.log(
  `%c Sizes of squares: ${canvas.clientWidth}x${canvas.clientHeight} COLS: ${gameConfig.COLUMNS} x gameConfig.ROWS: ${gameConfig.ROWS} | `,
  "color:orange, font-size:1.5rem"
);

// START THE ACTION
setCanvasCSSHeight();
// paintSquare(0, 0);

function gameLoop() {
  frameCount = frameCount === 100 ? 1 : frameCount + 1;

  if (!pause) {
    if (!deleteFullRows()) {
      if (frameCount % 10 === 0) {
        movePiece("down");
      }
    }

    paint();
  }

  if (isGameOver) {
    alert("Game Over");
    return;
  }

  // call the loop.
  window.requestAnimationFrame(gameLoop);
}

// init
generateNewPiece();
gameLoop();

// events
window.addEventListener("keydown", function (event) {
  const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
  if (key.includes("Arrow")) {
    movePiece(key.replace("Arrow", ""));
  }

  if (key === " ") {
    CURRENT_PIECE.rotation = (CURRENT_PIECE.rotation + 1) % 4;
  }

  if (key === "p") {
    pause = !pause;
    this.document.body.classList.remove("pause");
    if (pause) this.document.body.classList.add("pause");
  }

  console.log(">>> ", key);
});
