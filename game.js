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
  // Update car speed and position
  if (car.speed > car.friction) {
    car.speed -= car.friction;
  } else if (car.speed < -car.friction) {
    car.speed += car.friction;
  } else {
    car.speed = 0;
  }

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

  car.speed = Math.min(Math.max(car.speed, -car.maxSpeed), car.maxSpeed);
  car.x += car.speed * Math.cos(car.angle);
  car.y += car.speed * Math.sin(car.angle);

  // Clear canvas and draw car
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
update();
