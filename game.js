// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas to full screen

var tracks = {
  rectangle: {
    segments: [
      {x1: 10, y1: 10, x2: 1800, y2: 10},
      {x1: 1800, y1: 10, x2: 1800, y2: 870},
      {x1: 1800, y1: 870, x2: 10, y2: 870},
      {x1: 10, y1: 870, x2: 10, y2: 10},
    ],
    start: [200, 200]
  },
  circuit: {
    segments: [{"x1":10,"y1":10,"x2":1800,"y2":10},{"x1":1800,"y1":10,"x2":1800,"y2":870},{"x1":1800,"y1":870,"x2":10,"y2":870},{"x1":10,"y1":870,"x2":10,"y2":10},{"x1":5,"y1":250,"x2":35,"y2":154},{"x1":35,"y1":154,"x2":122,"y2":58},{"x1":121,"y1":59,"x2":211,"y2":25},{"x1":211,"y1":24,"x2":270,"y2":16},{"x1":6,"y1":609,"x2":11,"y2":656},{"x1":11,"y1":657,"x2":17,"y2":675},{"x1":17,"y1":676,"x2":41,"y2":753},{"x1":43,"y1":755,"x2":120,"y2":823},{"x1":121,"y1":822,"x2":202,"y2":865},{"x1":203,"y1":866,"x2":227,"y2":869},{"x1":1551,"y1":870,"x2":1691,"y2":834},{"x1":1691,"y1":834,"x2":1784,"y2":750},{"x1":1784,"y1":750,"x2":1795,"y2":722},{"x1":1795,"y1":277,"x2":1779,"y2":124},{"x1":1779,"y1":125,"x2":1711,"y2":64},{"x1":1711,"y1":64,"x2":1574,"y2":21},{"x1":1574,"y1":22,"x2":1493,"y2":8},{"x1":655,"y1":335,"x2":481,"y2":317},{"x1":481,"y1":317,"x2":391,"y2":365},{"x1":392,"y1":365,"x2":358,"y2":436},{"x1":358,"y1":436,"x2":356,"y2":528},{"x1":358,"y1":529,"x2":455,"y2":609},{"x1":455,"y1":609,"x2":680,"y2":648},{"x1":680,"y1":648,"x2":983,"y2":662},{"x1":986,"y1":663,"x2":1254,"y2":648},{"x1":1258,"y1":649,"x2":1527,"y2":614},{"x1":1527,"y1":614,"x2":1570,"y2":532},{"x1":1570,"y1":532,"x2":1590,"y2":349},{"x1":1590,"y1":349,"x2":1529,"y2":265},{"x1":1529,"y1":265,"x2":1284,"y2":253},{"x1":1283,"y1":253,"x2":943,"y2":290},{"x1":942,"y1":291,"x2":610,"y2":333}],
    start: [200, 200]
  }
};


// Choose the track
const track = tracks.circuit.segments;
const car_start = tracks.circuit.start;

var carImage1 = new Image();
carImage1.src = 'car1.png';
var carImage2 = new Image();
carImage2.src = 'car2.png';

// Car properties
var cars = [];
for (let i = cars.length; i < 400; i++) {

  var isHuman = false;
  let carX, carY;
  if(i == 399) {
    isHuman = true;
    carX = car_start[0] + 900;
    carY = car_start[1];
  } else {
    carX = car_start[0] + (Math.random() * 10 - 5);
    carY = car_start[1] + (Math.random() * 10 - 5);
  }

  cars.push({
    x: carX,
    y: carY,
    width: 105,
    height: 57,
    color: 'blue',
    speed: 0,
    acceleration: 0.2,
    deceleration: -0.1,
    maxSpeed: 20,
    friction: 0.00005,
    angle: Math.PI,
    turnSpeed: 0.08,
    isHuman: isHuman,
    image: isHuman ? carImage2 : carImage1
  });
}


function drawCars() {
  cars.forEach(car => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.drawImage(car.image, -car.width / 2, -car.height / 2);
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
  d: false,
  p: false  // Added for pause functionality
};

let isGamePaused = false;  // Variable to track pause state

function keyHandler(event) {
  const state = event.type === 'keydown';
  if (event.key === 'w') keys.w = state;
  if (event.key === 'a') keys.a = state;
  if (event.key === 's') keys.s = state;
  if (event.key === 'd') keys.d = state;
  if (event.key === 'p' && state) {  // Toggle pause state on keydown of 'p'
    isGamePaused = !isGamePaused;
    console.log('pause',isGamePaused);
  }
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

function moveCar(car, track, angleAdditive) {
  // let us know if there was a inter-frame collision (shouldnt be)
  const collidingSegments = carCollidesSegments(car, track);
  if(collidingSegments.length > 0) {
    console.log('precollide');
  }

  const lastX = car.x;
  const lastY = car.y;
  const lastAngle = car.angle;

  const nextAngle = car.angle + angleAdditive;
  const nextX = car.x + car.speed * Math.cos(car.angle);
  const nextY = car.y + car.speed * Math.sin(car.angle);

  // check the next step and apply it if it doesnt collide
  const newCollidingSegments = carCollidesSegments(
    {...car, x: nextX, y: nextY, angle: nextAngle}, track);
  if(newCollidingSegments.length == 0) {
    car.x = nextX;
    car.y = nextY;
    car.angle = nextAngle;
    return;
  }

  // find good reflection angles and calculate speed reduction
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
    const reflectionAngle = Math.atan2(speedY, speedX) + backwardsCompensation;
    const angleDifference = Math.abs(reflectionAngle - lastAngle) % (2 * Math.PI);
    const speedReductionFactor = Math.sin(angleDifference / 2);
    var newSpeed = car.speed * (1 - speedReductionFactor);

    angles.push([reflectionAngle,newSpeed]);
  });

  // go with any proposed angle that produces no collision
  for(var i=0;i<angles.length;i++) {
    let nextAngle,nextSpeed;
    [nextAngle, nextSpeed] = angles[i];

    const nextX = car.x + nextSpeed * Math.cos(nextAngle);
    const nextY = car.y + nextSpeed * Math.sin(nextAngle);
    const segments2 = carCollidesSegments({...car, angle: nextAngle, x: nextX, y: nextY}, track);
    if(segments2.length == 0) {
      car.speed = nextSpeed;
      car.angle = nextAngle;
      car.x = nextX;
      car.y = nextY;
      return;
    }
  }

  console.log('resorting to angle search');
  for(var i=0;i<Math.PI*2;i += 0.01) {
    const nextAngle = car.angle + i;
    const nextX = car.x + car.speed * Math.cos(nextAngle);
    const nextY = car.y + car.speed * Math.sin(nextAngle);
    const segments2 = carCollidesSegments({...car, angle: nextAngle, x: nextX, y: nextY}, track);
    if(segments2.length == 0) {
      car.angle = nextAngle;
      car.x = nextX;
      car.y = nextY;
    }
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
  if (isGamePaused) {
    drawTrack(track);
    requestAnimationFrame(update);
    return; // Skip updating the game if it is paused
  }

  // find player cars
  let playerCars = cars.filter(car => car.isHuman);

  // remove colliding cars
  cars = cars.filter(
    (car) => {
      if (!car.isHuman) {
        for(var i=0;i<playerCars.length;i++) {
          if (checkCollision(playerCars[i], car)) {
            return false;
          }
        }
      }
      return true;
    }
  );

  cars.forEach((car, index) => {

    // Update car speed based on friction
    if (car.speed > car.friction) {
      car.speed -= car.friction;
    } else if (car.speed < -car.friction) {
      car.speed += car.friction;
    } else {
      car.speed = 0;
    }
    var angleAdditive = 0;
    if(car.isHuman) {
      // Update car speed and angle based on input
      if (keys.w) {
        car.speed += car.acceleration;
      }
      if (keys.s) {
        car.speed -= car.acceleration;
      }

      // Limit car speed to maxSpeed
      car.speed = Math.min(Math.max(car.speed, -car.maxSpeed), car.maxSpeed);

      if(keys.a) {
        angleAdditive = car.turnSpeed * -1;
      }
      if(keys.d) {
        angleAdditive = car.turnSpeed;
      }
    } else {
      // AI car behavior
      const decision = Math.random();
      if(decision < 0.33) {
        angleAdditive = car.turnSpeed;
      } else if(decision > 0.66) {
        angleAdditive = car.turnSpeed * -1;
      } else {
        car.speed += car.acceleration;
      }
    }

    moveCar(car, track, angleAdditive);
  });

  // Clear canvas and draw cars and track
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack(track);
  drawCars();

  // Request next frame
  requestAnimationFrame(update);
}

// Function to check collision between two cars
function checkCollision(car1, car2) {
  // Simple bounding box collision detection
  return (
    car1.x < car2.x + car2.width &&
    car1.x + car1.width > car2.x &&
    car1.y < car2.y + car2.height &&
    car1.y + car1.height > car2.y
  );
}

// Mouse event handlers for creating track segments
let isMouseDown = false;
let startPoint = { x: 0, y: 0 };

canvas.addEventListener('mousedown', function(event) {
  isMouseDown = true;
  startPoint = { x: event.offsetX, y: event.offsetY };
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
