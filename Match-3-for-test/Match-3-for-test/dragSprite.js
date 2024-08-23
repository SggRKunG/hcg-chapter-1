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

CandySprite.prototype.update = function(dt) {
  // Implement sprite-specific update logic here
  let removed;
		do{
			removed = false;
			let i=0;
			for(let sprite of this.sprites){
				if (sprite.kill){
					this.sprites.splice(i, 1);
					this.clearGrid(sprite);
					removed = true;
					break;
				}
				i++;
			}
		}while(removed);
		
		switch(this.state){
			case "spawning":
				if (this.spawnInfo.count == this.spawnInfo.total){
					delete this.spawnInfo;
					this.state = "ready";
				}
				break;
			case "removing":
				if (this.removeInfo.count == this.removeInfo.total){
					delete this.removeInfo;
					this.removeGridGaps();
					this.state = "dropping";
					this.dropSfx.play();
				}
				break;
			case "dropping":
				if (this.dropInfo.count == this.dropInfo.total){
					delete this.dropInfo;
					this.state = "ready";
				}
				break;
		}
		
		for(let sprite of this.sprites){
			if (sprite==null) continue;
			sprite.update(dt);
		}
};

// Initialize candy sprites (replace with your candy images)
for (let i = 0; i < gridCols; i++) {
  candySprites.push([]);
  for (let j = 0; j < gridRows; j++) {
    const candyImage = new Image();
    candyImage.src = `_match01/part${Math.floor(Math.random() * 13)}.png`; // Example candy images
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

function clearGrid(sprite) {
  for (let row of candySprites) {
      let col = row.indexOf(sprite);
      if (col !== -1) {
          // Found it
          row[col] = null;
          return true;
      }
  }
  return false; // Sprite not found
}

function removeGridGaps() {
  const newCandySprites = [];
  let fallingCount = 0;

  for (let col = 0; col < gridCols; col++) {
      newCandySprites[col] = [];
      let row = gridRows - 1;

      // Move existing candies down
      for (let r = gridRows - 1; r >= 0; r--) {
          if (candySprites[col][r] !== null) {
              newCandySprites[col][row] = candySprites[col][r];
              newCandySprites[col][row].y = row * gridSize;
              row--;
          } else {
              fallingCount++;
          }
      }

      // Spawn new candies at the top of the column
      for (let r = row; r >= 0; r--) {
          const candyImage = new Image();
          candyImage.src = `_match01/part${Math.floor(Math.random() * 13)}.png`; // Example candy images
          newCandySprites[col][r] = new CandySprite(col * gridSize, r * gridSize, candyImage);
      }
  }

  candySprites = newCandySprites;

  // Optionally handle any animations or effects related to falling candies
  if (fallingCount > 0) {
      // Example: Play dropping sound effect
      // dropSfx.play();
  }

  // Call function to handle further actions if needed
  // e.g., check for more matches after dropping
}


function checkForMatches() {
  const visited = [];
  const matches = [];

  function getConnectedSprites(index, row, col, connected = []) {
      const sprite = candySprites[col][row];
      const grid = candySprites;
      
      if (sprite.index === index && !sprite.checked) {
          connected.push(sprite);
          sprite.checked = true;
          
          for (let r = row - 1; r <= row + 1; r++) {
              if (r < 0 || r >= gridRows) continue;
              for (let c = col - 1; c <= col + 1; c++) {
                  if (c < 0 || c >= gridCols || (r === row && c === col)) continue;
                  if (candySprites[c][r] && candySprites[c][r].index === index) {
                      getConnectedSprites(index, r, c, connected);
                  }
              }
          }
      }
      
      return connected;
  }

  for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
          const sprite = candySprites[col][row];
          if (!sprite.checked) {
              const connected = getConnectedSprites(sprite.index, row, col);
              if (connected.length >= 3) {
                  matches.push(connected);
              }
          }
      }
  }
  
  // Reset the checked state for the next match check
  candySprites.forEach(col => col.forEach(sprite => sprite.checked = false));
  
  // Handle the matches (e.g., remove them from the grid)
  matches.forEach(group => {
      group.forEach(sprite => {
          // Example: set sprite to a "removed" state
          sprite.index = -1; // Set index to -1 to indicate removal
      });
  });
  
  // Implement removal and dropping logic as needed
  // Example: update grid and trigger animations
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