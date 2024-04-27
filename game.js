// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var trackdefs = {
  rectangle: {
    segments: [
      [0.01, 0.01, 0.99, 0.01],
      [0.99, 0.01, 0.99, 0.99],
      [0.99, 0.99, 0.01, 0.99],
      [0.01, 0.99, 0.01, 0.01],
      [0.33, 0.33, 0.66, 0.33],
      [0.66, 0.33, 0.66, 0.66],
      [0.66, 0.66, 0.33, 0.66],
      [0.33, 0.66, 0.33, 0.33],
    ],
    start: [0.22, 0.22]
  }
}

var tracks = {};

for(const trackName in trackdefs) {
  tracks[trackName] = [];
  trackdefs[trackName].segments.forEach((segment) => {
    tracks[trackName].push(
      {
        x1: segment[0] * canvas.width,
        y1: segment[1] * canvas.height,
        x2: segment[2] * canvas.width,
        y2: segment[3] * canvas.height
      }
    );
  });
}

// Choose the track
const track = tracks.rectangle;
const car_start = [
  trackdefs.rectangle.start[0] * canvas.width,
  trackdefs.rectangle.start[1] * canvas.height
];

// Car properties
const car = {
  x: car_start[0],
  y: car_start[1],
  width: 50,
  height: 30,
  color: 'blue',
  speed: 0,
  acceleration: 0.2,
  deceleration: -0.1,
  maxSpeed: 20,
  friction: 0.05,
  angle: 0,
  turnSpeed: 0.13
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


// Helper function to calculate the direction
function direction(x1, y1, x2, y2, x3, y3) {
  const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);
  if (val === 0) return 0;  // Collinear
  return (val > 0) ? 1 : 2; // Clock or counterclock wise
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

function handleCollisions(car, track) {
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
        // Collision detected, calculate the reflection vector
        const normal = { x: -(segment.y2 - segment.y1), y: segment.x2 - segment.x1 };
        const normalLength = Math.sqrt(normal.x ** 2 + normal.y ** 2);
        normal.x /= normalLength;
        normal.y /= normalLength;
        const wallMidpoint = { x: (segment.x1 + segment.x2) / 2, y: (segment.y1 + segment.y2) / 2 };
        const toWallMid = { x: wallMidpoint.x - car.x, y: wallMidpoint.y - car.y };
        const dotToMid = toWallMid.x * normal.x + toWallMid.y * normal.y;
        const pushDirection = dotToMid > 0 ? -1 : 1; // Determine push direction based on which side of the wall the car is on
        const dotProduct = 2 * (car.speed * Math.cos(car.angle) * normal.x + car.speed * Math.sin(car.angle) * normal.y);
        car.speedX = car.speed * Math.cos(car.angle) - dotProduct * normal.x;
        car.speedY = car.speed * Math.sin(car.angle) - dotProduct * normal.y;
        // Push the car away from the wall slightly
        car.x += pushDirection * normal.x * 5; // Displace car by 5 pixels in the correct direction
        car.y += pushDirection * normal.y * 5; // Displace car by 5 pixels in the correct direction
        // Update car's speed and angle based on the reflection vector
        car.speed = Math.sqrt(car.speedX ** 2 + car.speedY ** 2) * 0.4;
        car.angle = Math.atan2(car.speedY, car.speedX);
        return true;
      }
    }
  }

  return false; // No collision detected
}

// Helper function to calculate the angle of collision
function calculateCollisionAngle(car, segment) {
  // Calculate the normalized direction vector of the car
  const carDirection = {
    x: Math.cos(car.angle),
    y: Math.sin(car.angle)
  };

  // Calculate the normalized direction vector of the wall segment
  const segmentDirection = {
    x: segment.x2 - segment.x1,
    y: segment.y2 - segment.y1
  };
  const segmentLength = Math.sqrt(segmentDirection.x ** 2 + segmentDirection.y ** 2);
  segmentDirection.x /= segmentLength;
  segmentDirection.y /= segmentLength;

  // Calculate the dot product of the direction vectors
  const dot = carDirection.x * segmentDirection.x + carDirection.y * segmentDirection.y;

  // Calculate the angle between the car's direction and the wall segment
  // The dot product gives us cos(theta), so we use Math.acos to get the angle in radians
  const angle = Math.acos(dot);

  // Return the angle in radians
  return angle;
}

function drawTrack(track) {
  ctx.beginPath();
  track.forEach(segment => {
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
  });
  ctx.stroke();
}


function update() {

  handleCollisions(car, track);

  // Predict the next position of the car
  const nextX = car.x + car.speed * Math.cos(car.angle);
  const nextY = car.y + car.speed * Math.sin(car.angle);

  car.x = nextX;
  car.y = nextY;

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

// Start the game loop
update();
