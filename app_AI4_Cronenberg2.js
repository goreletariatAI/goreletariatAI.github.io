let canvasWidth;
let canvasHeight;
let mainCanvas;
let alph2, seed;
let pd = 1;

let img = [];
let imageUrls = [
  "https://64.media.tumblr.com/519f9984d72777f82c4b20fb8495caa8/64889d23100285b5-15/s400x600/d554669e7cde4e83c64ce62a5630023cd305d4a8.pnj",
  "https://64.media.tumblr.com/5c77be8cda2a9e785a2bb7ec61a4eb3e/5d89c1746f6d7103-f7/s400x600/1949b362cc0649da94f953ef83b5cbcb89a90cc1.jpg",
  "https://64.media.tumblr.com/ea5e661774f4b725051e79e4e369552c/6662076a8c4a53fc-8f/s400x600/fbbe91e6feb0676a267d04abaef544d8f88d30c7.pnj",
  "https://64.media.tumblr.com/c355ba5aec65a8ca103668ae7955bf59/795dfd2864f1a576-27/s400x600/80faf285a31603991e6cf1e121c2d94eb098a604.jpg"
];

function preload() {
  for (let i = 0; i < imageUrls.length; i++) {
    img[i] = loadImage(imageUrls[i]);
  }
}

function setup() {
  seed = random(999999);
  restart();
}

function restart() {
  pixelDensity(pd);
  randomSeed(seed);
  noiseSeed(seed);
  n = floor(random(img.length));
  let windowRatio = windowWidth / windowHeight;
  let imageRatio = img[n].width / img[n].height;
  if (windowRatio > imageRatio) {
    img[n].resize(0, windowHeight - 20);
  } else {
    img[n].resize(windowWidth - 20, 0);
  } 
  mainCanvas = createCanvas(windowWidth * 0.6, windowHeight * 0.6);
  mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  canv2Wid = width;
  canv2Hgt = height;
  if (windowWidth <= 600) {
    canvasWidth = windowWidth;
    canvasHeight = windowWidth * 3 / 4;
    resizeCanvas(canvasWidth, canvasHeight);
    mainCanvas.position((windowWidth - canvasWidth) / 2, (windowHeight - canvasHeight) / 2);
  }
  cnv = createGraphics(width, height);
  avgSize = (width + height) * 0.5;
  hueShift = random(360);
  cnv.drawingContext.filter = `hue-rotate(${hueShift}deg)`;
  cnv.image(img[n], 0, 0);
  tint(255, 150);
  image(cnv, 0, 0);
  rez1 = random(0.001, 0.04); 
  gap = avgSize * 0.005;
  len = avgSize * random(0.005, 0.012);
  startVary = avgSize * random(0.035);
  swMult = (random(0.3, 1.0) * avgSize) / 584;
  colVar = random(15, 40);
  kEnd = random(0.6, 2);
  kStart = kEnd + random(2, 5.5);
  strokeCap(SQUARE);
  background(0, random(-20, 50));
  makeFlow();
  mainCanvas.mousePressed(canvasClickedEvent); 
}

let currentTime = 0; 

function draw() {
  makeFlow(); 
}

function makeFlow() {
  currentTime += 10;
  let colVary2 = 0.1;
  let alph2 = random(10, 20); 
  for (let i = 0; i < width - 1; i += gap) {
    for (let j = 0; j < height - 1; j += gap) {
      col = cnv.get(i, j);
      stroke(
        col[0] + random((-3)*colVary2, colVary2*3),
        col[1] + random((-3)*colVary2, colVary2*3),
        col[2] + random((-3)*colVary2, colVary2*3),
        alph2
      );
      let x = i + random(-startVary, startVary*2);
      let y = j + random(-startVary, startVary*2);
      for (let k = kStart; k > kEnd; k--) {
        strokeWeight(random(10, 15)); 
        let n1 = (noise((x + currentTime) * rez1, (y + currentTime) * rez1) - 0.2) * 1.7; 
        let ang = n1 * PI * 2;
        let newX = cos(ang) * len + x;
        let newY = sin(ang) * len + y;
        line(x, y, newX, newY);
        x = newX;
        y = newY;
      }
    }
  }
}

function canvasClickedEvent() {
    saveCanvasWithFilename();
}

function saveCanvasWithFilename() {
    save('I_created_with_goreletariat.jpg');
}
