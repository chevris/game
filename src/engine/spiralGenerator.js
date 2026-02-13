/**
 * Generates a clockwise spiral path from top-left to center
 * @param {number} size - Board size (must be odd)
 * @returns {Array<{x: number, y: number}>} Ordered path array
 */
export function generateSpiral(size) {
  if (size % 2 === 0) throw new Error('Board size must be odd');
  
  const grid = Array(size).fill().map(() => Array(size).fill(false));
  const path = [];
  let x = 0, y = 0;
  let dx = 1, dy = 0; // Start moving right
  
  for (let i = 0; i < size * size; i++) {
    path.push({ x, y });
    grid[y][x] = true;
    
    const nx = x + dx, ny = y + dy;
    
    // Turn clockwise if hit boundary or visited cell
    if (nx < 0 || nx >= size || ny < 0 || ny >= size || grid[ny][nx]) {
      [dx, dy] = [-dy, dx]; // Rotate 90° clockwise
    }
    
    x += dx;
    y += dy;
  }
  
  return path;
}

/**
 * Calculate center cell index for odd-sized board
 * @param {number} size - Board size (must be odd)
 * @returns {number} Index of center cell in spiral path
 */
export function getCenterIndex(size) {
  return Math.floor((size * size) / 2);
}
