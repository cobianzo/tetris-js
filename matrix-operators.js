export function transpose(matrix) {
  const matrixLength = matrix[0].length;
  const matrixHeight = matrix.length;
  let transposed = [];
  for (let i = 0; i < matrixLength; i++) {
    transposed[i] = [];
    for (let j = 0; j < matrixHeight; j++) {
      transposed[i][j] = matrix[j][i];
    }
  }
  transposed.reverse();
  return [...transposed];
}
