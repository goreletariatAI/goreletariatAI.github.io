let canvasWidth;
let canvasHeight;

function preload() {
    table = loadTable("palette_AI1_Klimt.csv", "csv", "header");
  }
  
  function setup() {
    pixelDensity(1);
    seed = floor(random(1000000));
    randomSeed(seed);
    noiseSeed(seed);
    print(seed);
    palette = floor(random(36));
    colVary = floor(random(30, 100));
    alph = floor(random(25, 100));
    alph2 = floor(random(25, 100));
    canv = createCanvas(windowWidth * 0.6, windowHeight * 0.6);
    canv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    canv2Wid = width;
    canv2Hgt = height;
    if (windowWidth <= 600) {
      canvasWidth = windowWidth;
      canvasHeight = windowWidth * 3 / 4;
      resizeCanvas(canvasWidth, canvasHeight);
      canv.position((windowWidth - canvasWidth) / 2, (windowHeight - canvasHeight) / 2);
    }
    canv2 = createGraphics(canv2Wid, canv2Hgt, WEBGL);
    canv2.colorMode(HSB, 360, 100, 100, 100);
    getColors();
    fillCol = col;
    getColors();
    strokeCol = col;
    size = canv2Wid * random(0.005, 0.025); 
    overlap = canv2Wid * random(0.05, 0.2); 
    depth = canv2Wid * random(0.3, 0.7); 
    water = canv2Wid * random(-0.1, 0.1); 
    treeLine = canv2Wid * random(-0.1, -0.2);
    
    sw = floor(random(1, 5));
    canv2.strokeWeight(sw);
    terrRange = random(60, 240); 
    terrHeight = random(-30, 10); 
    rez1 = random(0.001, 0.03); 
    rez2 = random(0.001, 0.015); 
    noLoop();
    canv2.stroke(strokeCol[4][0], strokeCol[4][1], strokeCol[4][2], alph2);
    cam = canv2.createCamera();
    cam.camera(
      random(0, 200),
      random(0, 500),
      random(-800, 800),
      0,
      0,
      1,
      0,
      1,
      0
    );
    canv2.background(col[0][0], col[0][1] - 30, col[0][2] - 20);
    makeLandscape();
    image(canv2, 0, 0);
    makeBlur = random() > 0.5;
    blurAmt = floor(random(1, 5));
    makePoster = random() > 0.5;
    posterAmt = floor(random(3, 10)); 
    if (makeBlur == true) {
      filter(BLUR, blurAmt);
    }
    if (makePoster == true) {
      filter(POSTERIZE, posterAmt);
    }
    grainBuffer = createGraphics(width, height, WEBGL);
    grainShader = grainBuffer.createShader(vert, frag);
    applyGrain();
    canv.mousePressed(canvasClickedEvent);
  }
  
  function makeLandscape() {
    let squareDivision = size / floor(random(1, 5)); 
    for (x = -overlap - width / 2; x < width / 2 + overlap; x += squareDivision) {
      for (
        z = -overlap - depth / 2;
        z < depth / 2 + overlap;
        z += squareDivision
      ) {
        let yn1 = (noise(x * rez1, z * rez1) - 0.5) * terrRange;
        let yn2 = (noise(x * rez2, z * rez2) - 0.5) * terrRange * 2;
        y = yn1 + yn2 + terrHeight;
        if (y > water) {
          canv2.fill(
            fillCol[1][0] + random(-colVary, colVary),
            fillCol[1][1] + random(-colVary, colVary),
            fillCol[1][2] + random(-colVary, colVary),
            alph
          ); 
          canv2.stroke(
            strokeCol[1][0],
            strokeCol[1][1],
            strokeCol[1][2],
            alph2
          );
          y = water;
        } else {
          canv2.fill(
            fillCol[2][0] + random(-colVary, colVary),
            fillCol[2][1] + random(-colVary, colVary),
            fillCol[2][2] + random(-colVary, colVary),
            alph
          ); 
          canv2.stroke(
            strokeCol[2][0],
            strokeCol[2][1],
            strokeCol[2][2],
            alph2
          );
        }
        canv2.push();
        canv2.translate(x, y, z);
        if (y > treeLine) {
          canv2.box(size, size * 3, size);
          canv2.translate(0, size, 0);
        }
        canv2.fill(
          fillCol[3][0] + random(-colVary, colVary),
          fillCol[3][1] + random(-colVary, colVary),
          fillCol[3][2] + random(-colVary, colVary),
          alph
        );
        canv2.stroke(
          strokeCol[3][0],
          strokeCol[3][1],
          strokeCol[3][2],
          alph2
        );
        canv2.box(size, size * 4, size);
        let treeChance =
          random(-2, 2) +
          noise(
            (x + overlap) * rez1 + 20000,
            (z + overlap) * rez1 + 20000
          ) *
          14;
        if (y < water && y > treeLine && treeChance > 9.5) {
          let treeSize = random(0.5, 1.5) * size;
          canv2.translate(0, -treeSize * 4, 0);
          canv2.fill(
            fillCol[4][0] + random(-colVary, colVary),
            fillCol[4][1] + random(-colVary, colVary),
            fillCol[4][2] + random(-colVary, colVary),
            alph
          );
          canv2.noStroke();
          canv2.cylinder(treeSize / 3, treeSize * 2);
          canv2.translate(-treeSize, -treeSize, -treeSize);
  
          canv2.fill(
            fillCol[5][0] + random(-colVary, colVary),
            fillCol[5][1] + random(-colVary, colVary),
            fillCol[5][2] + random(-colVary, colVary),
            alph
          );
          canv2.stroke(
            strokeCol[5][0],
            strokeCol[5][1],
            strokeCol[5][2],
            alph2
          );
          for (i = 0; i < 2; i++) {
            for (j = 0; j < 3; j++) {
              for (k = 0; k < 3; k++) {
                canv2.box(treeSize);
                canv2.translate(0, 0, treeSize);
              }
              canv2.translate(treeSize, 0, -treeSize * 3);
            }
            canv2.translate(-treeSize * 3, -treeSize, 0);
          }
          canv2.translate(treeSize, 0, treeSize);
          canv2.box(treeSize);
        }
        canv2.pop();
      }
    }
  }
  
  function getColors() {
    col1 = [0, 1, 2, 3, 4, 5, 6];
    col = [];
    for (i = 0; i < 7; i++) {
      j = floor(random(col1.length));
      col1.splice(j, 1);
      h = int(table.get(palette, j * 3));
      s = int(table.get(palette, j * 3 + 1));
      b = int(table.get(palette, j * 3 + 2));
      col.push([h, s, b]);
    }
}

function canvasClickedEvent() {
  saveCanvasWithFilename();
}

function saveCanvasWithFilename() {
  save('I_created_with_goreletariat.jpg');
}