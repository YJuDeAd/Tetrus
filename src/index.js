// **Grid Initialization**

// Create the grid cells dynamically and append to `.playField`
const gameGrid = document.querySelector('.playField');
for (let i = 0; i < 200; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.id = `grid-cell-${i}`;
    gameGrid.appendChild(cell);
}

// Select all grid cells for DOM manipulation
const DOMgrid = document.querySelectorAll(".grid-cell");

// Create the game grid (20 rows x 10 columns) with all cells initialized to 0
const grid = Array(20).fill().map(() => Array(10).fill(0));

// **Utility Functions**

// Generates a random hex color
function generateRandomColor() {
    const list = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += list[Math.floor(Math.random() * 16)];
    }
    return color;
}

let color = generateRandomColor(); // Generate a random color for the Tetromino

// Rotates a 2D matrix 90 degrees clockwise
function rotateMatrix(matrix) {
    const n = matrix.length; // number of rows
    const m = matrix[0].length; // number of columns

    // Create a new matrix with swapped dimensions
    const rotated = Array(m).fill().map(() => Array(n).fill(0));

    // Fill the rotated matrix
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            rotated[j][n - 1 - i] = matrix[i][j];
        }
    }

    return rotated;
}

// **Tetromino Placement and Manipulation**
let currentPos = [0, 4]; // Starting position [row, column]
let currentRow = currentPos[0];
let currentColumn = currentPos[1];

const TETROMINOS = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

let currentTetromino = TETROMINOS.L; // Test with the "L" Tetromino

// Clears the current Tetromino from the grid
function clearTetromino(tetromino) {
    const len = tetromino.length;
    const width = tetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            const row = currentRow + i;
            const col = currentColumn + j;

            if (row < grid.length && col < grid[0].length && tetromino[i][j] === 1) {
                grid[row][col] = 0; // Clear only Tetromino cells
            }
        }
    }
}

// Checks if a Tetromino can be placed at a specific position
function canPlaceTetromino(tetromino, row, col) {
    const len = tetromino.length;
    const width = tetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (tetromino[i][j] === 1) {
                const gridRow = row + i;
                const gridCol = col + j;

                // Check bounds and ensure no overlap with filled cells
                if (
                    gridRow >= grid.length || // Outside bottom boundary
                    gridCol >= grid[0].length || // Outside right boundary
                    gridRow < 0 || // Outside top boundary
                    gridCol < 0 || // Outside left boundary
                    grid[gridRow][gridCol] === 2 // Overlaps with filled cell
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Places the Tetromino on the grid
function placeTetromino(tetromino, row, col) {
    const len = tetromino.length;
    const width = tetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (row + i < grid.length && col + j < grid[0].length && tetromino[i][j] === 1) {
                grid[row + i][col + j] = 1; 
            }
        }
    }
}

// checks if the current tetromino can move down
function canMoveDown() {
    const len = currentTetromino.length;
    const width = currentTetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (currentTetromino[i][j] === 1) {
                const newRow = currentRow + i + 1; // Check the row below
                const col = currentColumn + j;

                // Check bounds and collisions
                if (
                    newRow >= grid.length || // Hits the bottom of the grid
                    (grid[newRow][col] === 2) // Hits another filled cell
                ) {
                    return false;
                }
            }
        }
    }
    return true; // No collisions, can move down
}

// Checks if the current Tetromino can move left
function canMoveLeft() {
    const len = currentTetromino.length;
    const width = currentTetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (currentTetromino[i][j] === 1) {
                const newCol = currentColumn + j - 1; // Check the column to the left

                // Check bounds and collisions
                if (
                    newCol < 0 || // Hits the left edge of the grid
                    grid[currentRow + i][newCol] === 2 // Hits another filled cell
                ) {
                    return false; // Cannot move left
                }
            }
        }
    }
    return true; // Can move left
}

// Checks if the current Tetromino can move right
function canMoveRight() {
    const len = currentTetromino.length;
    const width = currentTetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (currentTetromino[i][j] === 1) {
                const newCol = currentColumn + j + 1; // Check the column to the right

                // Check bounds and collisions
                if (
                    newCol >= grid[0].length || // Hits the right edge of the grid
                    grid[currentRow + i][newCol] === 2 // Hits another filled cell
                ) {
                    return false; // Cannot move right
                }
            }
        }
    }
    return true; // Can move right
}


function fixTetromino(){
    const len = currentTetromino.length;
    const width = currentTetromino[0].length;

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < width; j++) {
            if (currentTetromino[i][j] === 1) {
                const row  =  currentRow + i ;// Check the row below
                const col = currentColumn + j;

                grid[row][col] = currentTetromino[i][j] ;
                grid[row][col] = 2;  
            }
        }
    }
}

// Row clearing and shifting logic
function clearCompleteRows() {
    for (let i = grid.length - 1; i >= 0; i--) {
        let isRowComplete = true;
        
        // Check if row is complete
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] !== 2) {  // Check for fixed blocks only
                isRowComplete = false;
                break;
            }
        }
        
        // If row is complete, shift all rows above down
        if (isRowComplete) {
            // Shift all rows above down by one
            for (let row = i; row > 0; row--) {
                for (let col = 0; col < grid[0].length; col++) {
                    grid[row][col] = grid[row - 1][col];
                }
            }
            
            // Clear the top row
            for (let col = 0; col < grid[0].length; col++) {
                grid[0][col] = 0;
            }
            
            // Since we shifted rows down, we need to check the same row index again
            i++;
        }
    }
}


// **DOM Updates**

function updateDOM() {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            const index = i * 10 + j;
            DOMgrid[index].style.backgroundColor = grid[i][j] === 1 ? color : grid[i][j] === 2 ? 'gray' : '';; // Apply color or clear
        }
    }
}

// **Event Listener for Tetromino Rotation**
document.body.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && canMoveLeft()) {
        currentColumn--; // Move the Tetromino left
    }
    if (e.key === "ArrowRight" && canMoveRight()) {
        currentColumn++; // Move the Tetromino right
    }
    if (e.key === "ArrowDown" && canMoveDown()) {
        currentRow++; // Move the Tetromino right
    }
    if (e.key === " ") { // Spacebar pressed (rotate)
        clearTetromino(currentTetromino);
        const rotatedTetromino = rotateMatrix(currentTetromino);
        if (canPlaceTetromino(rotatedTetromino, currentRow, currentColumn)) {
            currentTetromino = rotatedTetromino;
        }
        placeTetromino(currentTetromino, currentRow, currentColumn);
    }
});



let rowInterval = setInterval(()=>{
    if(!canMoveDown()){
        fixTetromino();
        currentRow = 0;
        currentColumn = 4;
        const tetrominoKeys = Object.keys(TETROMINOS);
        currentTetromino = TETROMINOS[tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)]];
        // color = generateRandomColor()    // Tried this didnt work
    } else{
        currentRow++
    }
},500)

let intervalUpdate = setInterval(()=>{
    // **Initialization**
    // if(!canPlaceTetromino(currentTetromino, 0, 4)) {
    //     location.reload();
    // } 
    placeTetromino(currentTetromino, currentRow, currentColumn);
    updateDOM();
    clearTetromino(currentTetromino);
    
    clearCompleteRows();  
    // for(let i = 19 ; i >= 0 ; i--){
    //     let rowComplete = 1;

    //     for(let j = 9 ; j >= 0 ; j--){
    //         if(grid[i][j] === 0 || grid[i][j] === 1){
    //             rowComplete = 0;
    //         }
    //     }

    //     if(rowComplete){
    //         for(let k = 19 ; k >= 0 ; k++){
    //             for(let l = 9 ; l >= 0 ; l++){
    //                 grid[i][j] = grid[i-1][j];
    //             }
    //         }
    //         i--;
    //     }
    // }

},1)
