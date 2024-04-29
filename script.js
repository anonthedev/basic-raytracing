let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let canvasBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
let canvasPitch = canvasBuffer.width * 4;
let backgroundColor = [0, 0, 0];
let projectionPlaneZ = 1;
let viewportSize = 1;
let cameraPos = [0, 0, 0];

function putPixel(x, y, color) {
  x = canvas.width / 2 + x;
  y = canvas.height / 2 - y - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  let offset = 4 * x + canvasPitch * y;
  canvasBuffer.data[offset++] = color[0];
  canvasBuffer.data[offset++] = color[1];
  canvasBuffer.data[offset++] = color[2];
  canvasBuffer.data[offset++] = 255;
}

let updateCanvas = function () {
  ctx.putImageData(canvasBuffer, 0, 0);
};

let dotProduct = function (v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

let subtract = function (v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

class Sphere {
  constructor(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }
}

let spheres = [
  new Sphere([0, -1, 3], 1, [255, 255, 0]),
  new Sphere([2, 0, 4], 1, [57, 255, 20]),
  new Sphere([-2, 0, 4], 1, [0, 191, 255]),
];

function canvasToViewport(x, y) {
  return [
    (x * viewportSize) / canvas.width,
    (y * viewportSize) / canvas.height,
    projectionPlaneZ,
  ];
}

function intersectRay(origin, dir, sphere) {
  let r = sphere.radius;
  let co = subtract(origin, sphere.center);

  let a = dotProduct(dir, dir);
  let b = 2 * dotProduct(co, dir);
  let c = dotProduct(co, co) - r * r;

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return [Infinity, Infinity];
  }

  const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

  return [root1, root2];
}

function traceRay(origin, dir, rMin, rMax) {
  let closestR = Infinity;
  let closestSphere = null;

  for (let i = 0; i < spheres.length; i++) {
    let ts = intersectRay(origin, dir, spheres[i]);
    if (ts[0] < closestR && rMin < ts[0] && ts[0] < rMax) {
      closestR = ts[0];
      closestSphere = spheres[i];
    }
    if (ts[1] < closestR && rMin < ts[1] && ts[1] < rMax) {
      closestR = ts[1];
      closestSphere = spheres[i];
    }
  }
  if (closestSphere == null) {
    return backgroundColor;
  }

  return closestSphere.color;
}

for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
  for (let y = -canvas.height / 2; y < canvas.height / 2; y++) {
    dir = canvasToViewport(x, y);
    color = traceRay(cameraPos, dir, 1, Infinity);
    putPixel(x, y, color);
  }
}

updateCanvas();
