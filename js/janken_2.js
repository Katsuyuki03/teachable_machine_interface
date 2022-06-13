const CAMERA_WIDTH = 1280;
const CAMERA_HEIGHT = 720;

// 人差し指の先端のインデックス
// https://google.github.io/mediapipe/solutions/hands.html
const INDEX_FINGER_TIP = 8;

// Model URL
const imageModelURL = 'https://teachablemachine.withgoogle.com/models/v4aX69T_5/';

const lineLength = 60; // 線の長さ
const points = new Array(lineLength).fill(0);

// Classifier Variable
let classifier;
  
// To store the classification
let label = '';

let handsResults;

let img_guu;

let img_hand;

let img_tyoki;

const videoElement = document.querySelector('#js-Video');


const onHandsResults = (results) => {
  handsResults = results;
}

const classifyVideo = (video) => {
  const flippedVideo = ml5.flipImage(video);
  
  classifier.classify(flippedVideo, (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    label = results[0].label;

    classifyVideo(video);
  });
};

/**
 * fitCanvas
 */
 const fitCanvas = (target) => {
  const domRect = target.getBoundingClientRect();
  
  resizeCanvas(domRect.width, domRect.height);
};

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement, });
  },
  width: CAMERA_WIDTH,
  height: CAMERA_HEIGHT,
});

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');

  img_guu = loadImage("images/janken_guu.png");
  img_hand = loadImage("images/janken_hand.png");
  img_tyoki = loadImage("images/janken_tyoki.png");

}

function setup() {
  // Create the video
  const video = createCapture(VIDEO);

  video.size(320, 240);
  video.hide();


  hands.setOptions({
    selfieMode: true,
    maxNumHands: 1, // 今回、簡単化のため検出数の最大1つまでに制限
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  
  hands.onResults(onHandsResults);
  camera.start();

  createCanvas(1280, 720);

  // canvas を video 要素にあわせてリサイズする
  fitCanvas(videoElement);

  // Start classifying
  classifyVideo(video);

  colorMode(HSB, 250);

  noStroke();
  textSize(200);
  textAlign(CENTER);


}
  

function draw() {
  clear();
  background(0,0);

  fitCanvas(videoElement);

  if (handsResults && handsResults.multiHandLandmarks) {
    handsResults.multiHandLandmarks.forEach((landmarks) => {
      const { x, y } = landmarks[INDEX_FINGER_TIP];

      points.shift();
      points.push({ x, y });
    });
  }

  push();
  frameCount*0.001;
  stroke(color((frameCount/4) % 250, 200, 250));
  strokeWeight(6);
  strokeJoin(ROUND);
  noFill();
  beginShape();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    curveVertex(p.x * width, p.y * height);
  }
  endShape();
  pop();

  // Draw the label
  fill(255,255,255);
  text(label, width * 0.5, height * 0.6);

  image(img_guu,   width* 0.1 , height* 0.6, width* 0.20 , height* 0.20 ,tint(255, 150));
  image(img_hand,   width* 0.4 , height* 0.6, width* 0.20 , height* 0.20 ,tint(255, 150));
  image(img_tyoki,  width* 0.7 , height* 0.6, width* 0.20 , height* 0.20 ,tint(255, 150));

  if (label === "グー"){
     image(img_guu,  width* 0.2 , height* 0.6, width* 0.20 , height* 0.20 );
  } else if(label === "パー"){
     image(img_hand, width* 0.4 , height* 0.6, width* 0.20 , height* 0.20 );
  } else if(label === "チョキ"){
    image(img_tyoki,  width* 0.7 , height* 0.6, width* 0.20 , height* 0.20 );
  } 
 

}
