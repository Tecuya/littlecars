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
      [0.77, 0.77, 0.88, 0.88],
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
const cars = [];
for (let i = 0; i < 500; i++) {
  cars.push({
    x: car_start[0] + (Math.random() * 10 - 5),
    y: car_start[1] + (Math.random() * 10 - 5),
    width: 50,
    height: 30,
    color: 'blue',
    speed: 0,
    acceleration: 0.2,
    deceleration: -0.1,
    maxSpeed: 20,
    friction: 0.00005,
    angle: 0,
    turnSpeed: 0.13
  });
}

function drawCars() {
  cars.forEach(car => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = car.color;
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
    ctx.restore();
  });
}

const average = arr => arr.reduce((a, b) => a + b) / arr.length;

function getCarCorners(car) {
  // Calculate the rotated corners of the car
  const cosAngle = Math.cos(car.angle);
  const sinAngle = Math.sin(car.angle);
  const halfWidth = car.width / 2;
  const halfHeight = car.height / 2;
  const corners = [
    { x: car.x + cosAngle * -halfWidth + sinAngle * -halfHeight, y: car.y + sinAngle * -halfWidth - cosAngle * -halfHeight },
    { x: car.x + cosAngle * halfWidth + sinAngle * -halfHeight, y: car.y + sinAngle * halfWidth - cosAngle * -halfHeight },
    { x: car.x + cosAngle * halfWidth + sinAngle * halfHeight, y: car.y + sinAngle * halfWidth - cosAngle * halfHeight },
    { x: car.x + cosAngle * -halfWidth + sinAngle * halfHeight, y: car.y + sinAngle * -halfWidth - cosAngle * halfHeight }
  ];
  return corners;
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

function carCollidesSegments(car, track) {
  const collidingSegments = [];
  for (let i = 0; i < track.length; i++) {
    const segment = track[i];
    const corners = getCarCorners(car);
    if(
      lineIntersects({ x1: corners[0].x, y1: corners[0].y, x2: corners[1].x, y2: corners[1].y }, segment) ||
      lineIntersects({ x1: corners[1].x, y1: corners[1].y, x2: corners[2].x, y2: corners[2].y }, segment) ||
      lineIntersects({ x1: corners[2].x, y1: corners[2].y, x2: corners[3].x, y2: corners[3].y }, segment) ||
      lineIntersects({ x1: corners[3].x, y1: corners[3].y, x2: corners[0].x, y2: corners[0].y }, segment)) {
      collidingSegments.push(segment);
    }
  }
  return collidingSegments;
}

function moveCar(car, track) {

  const collidingSegments = carCollidesSegments(car, track);
  if(collidingSegments.length > 0) {
    alert('precollide');
  }

  var angleAdditive = 0;
  if(keys.a) {
    angleAdditive = car.turnSpeed * -1;
  }
  if(keys.d) {
    angleAdditive = car.turnSpeed;
  }

  const lastX = car.x;
  const lastY = car.y;
  const lastAngle = car.angle;

  const nextAngle = car.angle + angleAdditive;
  const nextX = car.x + car.speed * Math.cos(car.angle);
  const nextY = car.y + car.speed * Math.sin(car.angle);
  
  const newCollidingSegments = carCollidesSegments({...car, x: nextX, y: nextY, angle: nextAngle}, track);

  if(newCollidingSegments.length == 0) {
    car.x = nextX;
    car.y = nextY;
    car.angle = nextAngle;
    return;
  }

  const segment4 = carCollidesSegments(car, track);
  if(segment4.length > 0) {
    alert('rejection has failed');
  }

  var angles = [];
  newCollidingSegments.forEach((segment) => {
    const backwardsCompensation = car.speed >= 0 ? 0 : Math.PI * -1;
    const normal = { x: -(segment.y2 - segment.y1), y: segment.x2 - segment.x1 };
    const normalLength = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    normal.x /= normalLength;
    normal.y /= normalLength;
    const dotProduct = 2 * (car.speed * Math.cos(car.angle) * normal.x + car.speed * Math.sin(car.angle) * normal.y);
    const speedX = car.speed * Math.cos(car.angle) - dotProduct * normal.x;
    const speedY = car.speed * Math.sin(car.angle) - dotProduct * normal.y;
    angles.push(Math.atan2(speedY, speedX) + backwardsCompensation);
  });

  // go with any valid proposed angle
  for(var i=0;i<angles.length;i++) {
    const nextX = car.x + car.speed * Math.cos(angles[i]);
    const nextY = car.y + car.speed * Math.sin(angles[i]);
    const segments2 = carCollidesSegments({...car, angle: angles[i], x: nextX, y: nextY}, track);
    if(segments2.length == 0) {
      car.angle = angles[i];
      car.x = nextX;
      car.y = nextY;
      return;
    } 
  }

  const segments2 = carCollidesSegments(car, track);
  if(segments2.length > 0) {
    alert('oops');
    car.angle = lastAngle;
    car.speed = 0;
  }

  const segments5 = carCollidesSegments(car, track);
  if(segments5.length > 0) {
    alert('left collision');
  }

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
  cars.forEach(car => {
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

    // Limit car speed to maxSpeed
    car.speed = Math.min(Math.max(car.speed, -car.maxSpeed), car.maxSpeed);

    moveCar(car, track);
  });

  // Clear canvas and draw cars and track
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack(track);
  drawCars();

  // Request next frame
  requestAnimationFrame(update);
}

// Start the game loop
// Mouse event handlers for creating track segments
let isMouseDown = false;
let startPoint = { x: 0, y: 0 };

canvas.addEventListener('mousedown', function(event) {
  isMouseDown = true;
  startPoint = { x: event.offsetX, y: event.offsetY };
});

canvas.addEventListener('mousemove', function(event) {
  if (isMouseDown) {
    // While the mouse is down, we draw a line from the start point to the current mouse position
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', function(event) {
  if (isMouseDown) {
    // When the mouse is released, we finalize the track segment
    const endPoint = { x: event.offsetX, y: event.offsetY };
    track.push({ x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y });
    isMouseDown = false;
  }
});

// Update the drawTrack function to draw all tracks
function drawTrack(track) {
  ctx.beginPath();
  track.forEach(segment => {
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
  });
  ctx.stroke();
}

update(); // Start the game loop
