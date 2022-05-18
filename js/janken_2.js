
  // Classifier Variable
  let classifier;
  // Model URL
  let imageModelURL = 'https://teachablemachine.withgoogle.com/models/v4aX69T_5/';
  
  let keypointsHand = [];

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


  // Video
  let video;
  let flippedVideo;
  // To store the classification
  let label = "";

  // Load the model first
  function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  }

  function setup() {
    createCanvas(windowWidth, windowHeight);
    // Create the video
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
  }

  function draw() {
    clear();

    background(0);
    // Draw the video
    image(flippedVideo, 0, 0,windowWidth, windowHeight);
    pop();

    // Draw the label
    fill(255,255,0);
    textSize(200);
    textAlign(CENTER);
    text(label, width / 2, height - 2);

    push();
    if (keypointsHand.length > 0) {
      console.log(keypointsHand); // 結果を得る

      const indexTip = keypointsHand[8];
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