const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
//console.log(canvas);

const gridSize = 50;
const gridCols = 8;
const gridRows = 8;

let candySprites = []; // Array to hold candy sprite objects
let selectedCandy = null; // Track the selected candy
let secondSelectedCandy = null;
let clickedCandy = null;
let isDragging = false;


function CandySprite(x, y, image) {
  this.x = x;
  this.y = y;
  this.image = image;
  this.isDragging = false;
}

CandySprite.prototype.draw = function() {
  ctx.drawImage(this.image, this.x, this.y, gridSize, gridSize);
};

// Initialize candy sprites (replace with your candy images)
for (let i = 0; i < gridCols; i++) {
  candySprites.push([]);
  for (let j = 0; j < gridRows; j++) {
    const candyImage = new Image();
    candyImage.src = `_match01/part${Math.floor(Math.random() * 6)}.png`; // Example candy images
    candySprites[i].push(new CandySprite(i * gridSize, j * gridSize, candyImage));
  }
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid lines (optional)
  for (let i = 0; i <= gridCols; i++) {
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, gridRows * gridSize);
  }
  for (let i = 0; i <= gridRows; i++) {
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(gridCols * gridSize, i * gridSize);
  }
  ctx.stroke();
}

function drawCandies() {
  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      candySprites[i][j].draw();
    }
  }
}

function drawCandy() {
   // ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCandies();
}

function findCandyAt(x, y) {
  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
    return candySprites[col][row];
  }
  return null;
}

function canSwapCandies(candy1, candy2) {
    // Check if candies are adjacent (horizontally or vertically)
    const dx = Math.abs(candy1.x - candy2.x);
    const dy = Math.abs(candy1.y - candy2.y);
    console.log(dx+" "+dy);
    return (dx === gridSize && dy === 0) || (dx === 0 && dy === gridSize);
  }

  function checkForMatches() {
    // Implement logic to check for horizontal and vertical matches
    // ...
  }


canvas.addEventListener('mousedown', (event) => {
  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;

  selectedCandy = findCandyAt(mouseX, mouseY);
  if (selectedCandy) {
    isDragging = true;
  }
  console.log(selectedCandy+" "+mouseX+" "+mouseY);
});


  
canvas.addEventListener('mouseup', (event) => {
  isDragging = false;
  selectedCandy = null;
  if (clickedCandy && selectedCandy && canSwapCandies(selectedCandy, clickedCandy)) {
    secondSelectedCandy = clickedCandy;
    swapCandies(selectedCandy, secondSelectedCandy);
    console.log(canSwapCandies(selectedCandy, secondSelectedCandy));
    // Check for matches and perform necessary actions
    checkForMatches();

    selectedCandy = null;
    secondSelectedCandy = null;
  }
  drawCandy();
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging && selectedCandy) {
    let newX = event.clientX - canvas.offsetLeft - gridSize / 2;
    let newY = event.clientY - canvas.offsetTop - gridSize / 2;

    // Constrain the sprite within the grid
    newX = Math.max(0, Math.min(newX, (gridCols - 1) * gridSize));
    newY = Math.max(0, Math.min(newY, (gridRows - 1) * gridSize));

    selectedCandy.x = newX;
    selectedCandy.y = newY;
    drawCandy();
  }
});

function swapCandies(candy1, candy2) {
  const tempX = candy1.x;
  const tempY = candy1.y;
  candy1.x = candy2.x;
  candy1.y = candy2.y;
  candy2.x = tempX;
  candy2.y = tempY;
}