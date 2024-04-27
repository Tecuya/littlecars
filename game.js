// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Car properties
const car = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 50,
  height: 30,
  color: 'blue',
  speed: 0,
  acceleration: 0.2,
  deceleration: -0.1,
  maxSpeed: 5,
  friction: 0.05,
  angle: 0,
  turnSpeed: 0.03
};

// Draw the car
function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.fillStyle = car.color;
  ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
  ctx.restore();
}

// Update game state
function update() {
  // Predict the next position of the car
  const nextX = car.x + car.speed * Math.cos(car.angle);
  const nextY = car.y + car.speed * Math.sin(car.angle);

  // Check for collisions with the track
  if (!checkCollisions({ ...car, x: nextX, y: nextY }, track)) {
    // Update car position if no collision
    car.x = nextX;
    car.y = nextY;
  }

  // Update car speed based on friction
  if (car.speed > car.friction) {
    car.speed -= car.friction;
  } else if (car.speed < -car.friction) {
    car.speed += car.friction;
  } else {
    car.speed = 0;
  }

  // Update car speed and angle based on input
  if (keys.w) {
    car.speed += car.acceleration;
  }
  if (keys.s) {
    car.speed -= car.acceleration;
  }
  if (keys.a) {
    car.angle -= car.turnSpeed;
  }
  if (keys.d) {
    car.angle += car.turnSpeed;
  }

  // Limit car speed to maxSpeed
  car.speed = Math.min(Math.max(car.speed, -car.maxSpeed), car.maxSpeed);

  // Clear canvas and draw car and track
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack(track);
  drawCar();

  // Request next frame
  requestAnimationFrame(update);
}

// Handle keyboard input
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

function keyHandler(event) {
  const state = event.type === 'keydown';
  if (event.key === 'w') keys.w = state;
  if (event.key === 'a') keys.a = state;
  if (event.key === 's') keys.s = state;
  if (event.key === 'd') keys.d = state;
}

document.addEventListener('keydown', keyHandler);
document.addEventListener('keyup', keyHandler);

// Start the game loop
function checkCollisions(car, track) {
  // Get the corners of the car
  const corners = [
    { x: car.x - car.width / 2, y: car.y - car.height / 2 },
    { x: car.x + car.width / 2, y: car.y - car.height / 2 },
    { x: car.x + car.width / 2, y: car.y + car.height / 2 },
    { x: car.x - car.width / 2, y: car.y + car.height / 2 }
  ];

  // Check each track segment for collisions with car corners
  for (let i = 0; i < track.length; i++) {
    const segment = track[i];
    for (let j = 0; j < corners.length; j++) {
      const corner = corners[j];
      // Check for intersection with the path from the car's current position to the corner
      if (lineIntersects({ x1: car.x, y1: car.y, x2: corner.x, y2: corner.y }, segment)) {
        return true; // Collision detected
      }
    }
  }

  return false; // No collision detected
}

// Function to check if two line segments intersect
function lineIntersects(path, segment) {
  // Calculate the direction of the vectors
  const d1 = direction(segment.x1, segment.y1, segment.x2, segment.y2, path.x1, path.y1);
  const d2 = direction(segment.x1, segment.y1, segment.x2, segment.y2, path.x2, path.y2);
  const d3 = direction(path.x1, path.y1, path.x2, path.y2, segment.x1, segment.y1);
  const d4 = direction(path.x1, path.y1, path.x2, path.y2, segment.x2, segment.y2);

  // Check if the paths intersect
  return d1 !== d2 && d3 !== d4;
}

// Helper function to calculate the direction
function direction(x1, y1, x2, y2, x3, y3) {
  const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);
  if (val === 0) return 0;  // Collinear
  return (val > 0) ? 1 : 2; // Clock or counterclock wise
}
  if (!checkCollisions({ ...car, x: nextX, y: nextY }, track)) {
    // Update car position if no collision
    car.x = nextX;
    car.y = nextY;
  }

  // Continue with the rest of the update function
  originalUpdate();
};
  // Define a simple rectangular track for now
  return [
    // Top edge
    { x1: 50, y1: 50, x2: canvas.width - 50, y2: 50 },
    // Right edge
    { x1: canvas.width - 50, y1: 50, x2: canvas.width - 50, y2: canvas.height - 50 },
    // Bottom edge
    { x1: 50, y1: canvas.height - 50, x2: canvas.width - 50, y2: canvas.height - 50 },
    // Left edge
    { x1: 50, y1: 50, x2: 50, y2: canvas.height - 50 }
  ];
}

function drawTrack(track) {
  ctx.beginPath();
  track.forEach(segment => {
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
  });
  ctx.stroke();
}

// Define the track
const track = defineTrack();

// Update the drawCar function to draw the track as well
const originalDrawCar = drawCar;
drawCar = function() {
  drawTrack(track);
  originalDrawCar();
};
