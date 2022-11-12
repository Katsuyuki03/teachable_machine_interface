const isFlipped = true;

let keypointsHand = [];

const videoElement = document.getElementsByClassName("input_video")[0];
videoElement.style.display = "none";

function onHandsResults(results) {
  keypointsHand = results.multiHandLandmarks;
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  selfieMode: isFlipped,
  maxNumHands: 1, // 今回、簡単化のため検出数の最大1つまでに制限
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(onHandsResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

let videoImage;

function setup() {
  const canvas = createCanvas(500, 400);
  videoImage = createGraphics(320, 180);
}

function draw() {
  clear();
  background("rgba(100, 100, 255, 0.2)");

  videoImage.drawingContext.drawImage(
    videoElement,
    0,
    0,
    videoImage.width,
    videoImage.height
  );

  push();
  if (isFlipped) {
    translate(width, 0);
    scale(-1, 1);
  }
  displayWidth = width;
  displayHeight = (width * videoImage.height) / videoImage.width;
  image(videoImage, 0, 0, displayWidth, displayHeight);
  pop();

  if (keypointsHand.length > 0) {
    console.log(keypointsHand); // 結果を得る

    const indexTip = keypointsHand[0][8];
    console.log(indexTip);

    ellipse(indexTip.x * displayWidth, indexTip.y * displayHeight, 10);
  }
}