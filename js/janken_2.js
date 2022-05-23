
  // Classifier Variable
  let classifier;
  // Model URL
  let imageModelURL = 'https://teachablemachine.withgoogle.com/models/v4aX69T_5/';
  
  const isFlipped = true;

  let keypointsHand = [];

  const videoElement = document.getElementsByClassName("input_video")[0];
 

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

  
  // Video
  let video;
  let videoImage;
  let flippedVideo;
  // To store the classification
  let label = "";

  // Load the model first
  function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  }

  function setup() {
    clear();
    const canvas = createCanvas(windowWidth, windowHeight);
    videoImage = createGraphics(320, 180);

    // Create the video
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
  }

  function draw() {


    background(0);
    // Draw the video
    image(flippedVideo, 0, 0,windowWidth, windowHeight);

    // Draw the label
    fill(255,255,0);
    textSize(200);
    textAlign(CENTER);
    text(label, width / 2, height - 2);


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

  // Get a prediction for the current video frame
  function classifyVideo() {
    flippedVideo = ml5.flipImage(video)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();

  }

  // When we get a result
  function gotResult(error, results) {
    // If there is an error
    if (error) {
      console.error(error);
      return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label;
    // Classifiy again!
    classifyVideo();
  }
