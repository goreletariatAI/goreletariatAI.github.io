let canvasWidth;
let canvasHeight;
let mainCanvas;

function setup() {
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
    background(255);
    strokeWeight(0.6);
    frame = 0;
    numAcross = 70;
    size1 = (width - frame * 2) / numAcross;
    rez3 = 0.003;
    len = size1 * 0.5;
    drawLines();
    mainCanvas.mousePressed(canvasClickedEvent);
}

function drawLines() {
    for (x = frame; x < width - frame + 1; x += size1) {
        for (y = frame; y < height - frame + 1; y += size1) {
            x += width * random(-0.001, 0.001);
            y += width * random(-0.001, 0.001);
            oldX = x;
            oldY = y;
            for (i = 0; i < 20; i++) {
                n3 = noise(oldX * rez3, oldY * rez3) + 0.03;
                ang = map(n3, 0.1, 0.9, 0, PI * 2);

                newX = cos(ang) * len + oldX;
                newY = sin(ang) * len + oldY;

                if (random() > 0.3) {
                    stroke(1); 
                    line(oldX, oldY, newX, newY);
                } else if (random() > 0.8) {
                    stroke(230, 220, 120);
                    line(oldX, oldY, newX, newY);
                }

                oldX = newX;
                oldY = newY;
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
