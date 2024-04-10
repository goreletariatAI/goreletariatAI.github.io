let canvasWidth;
let canvasHeight;
let pd = 1; 
let mainCanvas, seed, table, palette, colVary1, angMult, rez1;
let primCol = ["red", "yellow", "blue", "green", "purple", "white", "black"];

function preload() {
  table = loadTable("palette_AI2_Yamamoto.csv", "csv", "header");
}

function setup() {
  seed = int(fxrand() * 9999999);
  restart();
}

function restart() {
  pixelDensity(pd);
  randomSeed(seed);
  noiseSeed(seed);
  maxCanv = min(windowWidth, windowHeight);
  mainCanvas = createCanvas(windowWidth * 0.6, windowHeight * 0.6);
  mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  canv2Wid = width;
  canv2Hgt = height;
  if (windowWidth <= 900) {
    canvasWidth = windowWidth;
    canvasHeight = windowWidth * 3 / 4;
    resizeCanvas(canvasWidth, canvasHeight);
    mainCanvas.position((windowWidth - canvasWidth) / 2, (windowHeight - canvasHeight) / 2);
  }
  grainBuffer = createGraphics(width, height, WEBGL);
  grainShader = grainBuffer.createShader(vert, frag);
  palette = floor(random(31));
  colorMode(HSB, 360, 120, 100, 255);
  colVary1 = random(7, 20);
  if (random(2) < 1) {
    getColor(floor(random(7)));
    background(h, s, b);
  } else {
    col2 = primCol[floor(random(7))];
    background(col2);
  }

  alph = floor(random(150, 250));
  if (random(3) < 2) {
    angMult = round(random(0.5, 2.5), 2);
  }
  else {
    angMult = round(random(2.5, 5), 2);
  }
  if (random(3) < 2) {
    rez1 = round(random(0.001, 0.009), 4);
  }
  else {
    rez1 = round(random(0.01, 0.04), 4);
  }
 
  rez2 = round(random(0.002, 0.02), 4);
  gap = width * 0.008;
  segLen = round(width * random(0.003, 0.01), 4); 
  lineSeg = round(width * random(0.011, 0.016), 4);
  capType = floor(random(3));
  gapType = floor(random(3));
  if (gapType < 1) {
    swFactor = random(5,8);
  } else if (gapType < 2) {
    swFactor = 1;
  }
  if (capType < 2) {
    strokeCap(SQUARE);
  } else {
    strokeCap(ROUND);
  }
  let x, y, j, k;
  x1 = width/2;
  y1 = height/2;
  for (j = -width * 0.1; j < width * 1.1; j += gap) {
    for (k = -height * 0.1; k < height * 1.1; k += gap) {
      x = j;
      y = k;
      n2 =
        (noise(((j * rez2) / width) * 900, ((k * rez2) / height) * 1200) -
          0.2) *
        1.7;
      col1 = min(7, max(0, floor(n2 * 7)));
      getColor(col1);
      for (i = lineSeg; i > 1; i--) {
        if (gapType >= 2) {
          swFactor = round(random(0.6, 16), 3);
        }
        
        strokeWeight(((i / width) * 1000) / swFactor);
        prevX = x;
        prevY = y;
        a1 = y1 - y;
        b1 = x1 - x;
        ang1 = atan(a1/b1)+PI*0.5;
        n1 =
          (noise(
            ((prevX * rez1) / width) * 900,
            ((prevY * rez1) / height) * 1200
          ) -
            0.2) *
          1.7;
        ang0 = n1 * PI * angMult;
        if (ang0>PI){ang0=PI}
        if (ang0<-PI){ang0=-PI}
        ang = ang1+ang0*0.0;
        x = segLen * cos(ang) + prevX;
        y = segLen * sin(ang) + prevY;
        stroke(h + random(-2, 2), s + random(-3, 3), b + random(-3, 3), alph);
        line(prevX, prevY, x, y);
      }
    }
  }
  if (random(3) < 0.7) {
    paperTexture();
  }
  applyGrain();
  fxpreview();
  print(
    "palette:" + palette,
    "Alpha:" + alph,
    "angMult:" + angMult,
    "Rez1:" + rez1,
    "Rez2:" + rez2,
    "gapType:" + gapType,
    "capType:" + capType,
    "swFactor:" + swFactor,
    "segLen:" + segLen,
    "lineSeg:" + lineSeg
  );
  mainCanvas.mousePressed(canvasClickedEvent);
}

function paperTexture() {
  noFill();
  colVary2 = 15; 
  let textureNum, alph2;
  textureType = 2.5;
  if (textureType < 1) { 
    textureNum = 12000;
    strokeWeight(width * 0.007); 
    alph2 = 50;
  } else if (textureType < 2) { 
    textureNum = 15000;
    strokeWeight(1); 
    alph2 = 255;
  } else { 
    textureNum = 15000;
    strokeWeight(1);
    alph2 = 120;
  }
  colorMode(RGB);
  for (i = 0; i < textureNum; i++) {
    x = random(width);
    y = random(height);
    col = get(x, y);
    stroke(
      col[0] + random(-colVary2, colVary2),
      col[1] + random(-colVary2, colVary2),
      col[2] + random(-colVary2, colVary2),
      alph2
    ); 
    push();
    translate(x, y);
    rotate(random(PI * 2));
    curve(
      height * random(0.035, 0.14),
      0,
      0,
      height * random(-0.03, 0.03),
      height * random(-0.03, 0.03),
      height * random(0.035, 0.07),
      height * random(0.035, 0.07),
      height * random(0.035, 0.14)
    );
    pop();
  }
  colorMode(HSB, 360, 120, 100, 255);
}

function getColor(col1) {
  h = int(table.get(palette, col1 * 3)) + random(-8, 8);
  s = int(table.get(palette, col1 * 3 + 1)) + random(-colVary1, colVary1);
  b = int(table.get(palette, col1 * 3 + 2)) + random(-colVary1, colVary1);
}

function canvasClickedEvent() {
    saveCanvasWithFilename();
}

function saveCanvasWithFilename() {
    save('I_created_with_goreletariat.jpg');
}
