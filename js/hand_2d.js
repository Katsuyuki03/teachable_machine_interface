var handposeModel = null; // this will be loaded with the handpose model
                          // WARNING: do NOT call it 'model', because p5 already has something called 'model'

var videoDataLoaded = false; // is webcam capture ready?

var statusText = "Loading handpose model...";

var myHands = []; // hands detected by mediapipe
                  // currently handpose only supports single hand, so this will be either empty or singleton

var capture; // webcam capture, managed by p5.js

// Load the MediaPipe handpose model assets.
handpose.load().then(function(_model){
  console.log("model initialized.")
  statusText = "Model loaded."
  handposeModel = _model;
})


function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  capture = createCapture(VIDEO);
  
  // this is to make sure the capture is loaded before asking handpose to take a look
  // otherwise handpose will be very unhappy
  capture.elt.onloadeddata = function(){
    console.log("video initialized");
    videoDataLoaded = true;
  }
  
  capture.hide();
}

// draw a hand object returned by handpose
function drawHands(hands,noKeypoints){
  
  // Each hand object contains a `landmarks` property,
  // which is an array of 21 3-D landmarks.
  for (var i = 0; i < hands.length; i++){

    var landmarks = hands[i].landmarks;

    var palms = [0,1,2,5,9,13,17] //landmark indices that represent the palm

    for (var j = 0; j < landmarks.length; j++){
      var [x,y,z] = landmarks[j]; // coordinate in 3D space

      // draw the keypoint and number
      if (!noKeypoints){
        rect(x-2,y-2,4,4);
        text(j,x,y);
      }
        
      // draw the skeleton
      var isPalm = palms.indexOf(j); // is it a palm landmark or finger landmark?
      var next; // who to connect with?
      if (isPalm == -1){ // connect with previous finger landmark if it's a finger landmark
        next = landmarks[j-1];
      }else{ // connect with next palm landmark if it's a palm landmark
        next = landmarks[palms[(isPalm+1)%palms.length]];
      }
      line(x,y, next[0], next[1]);
    }

  }
}


function draw() {
    
  if (handposeModel && videoDataLoaded){ // model and video both loaded, 
    
    handposeModel.estimateHands(capture.elt).then(function(_hands){
      // we're handling an async promise
      // best to avoid drawing something here! it might produce weird results due to racing
      
      myHands = _hands; // update the global myHands object with the detected hands
      if (!myHands.length){
        // haven't found any hands
        statusText = "Show some hands!"
      }else{
        // display the confidence, to 3 decimal places
        statusText = "Confidence: "+ (Math.round(myHands[0].handInViewConfidence*1000)/1000);
        
      }
      
    })
  }
  
  background(200);
  
  // first draw the debug video and annotations
  push();
  scale(0.5); // downscale the webcam capture before drawing, so it doesn't take up too much screen sapce
  image(capture, 0, 0, capture.width, capture.height);
  fill(255,0,0);
  stroke(255,0,0);
  drawHands(myHands); // draw my hand skeleton
  pop();
  
  
  // draw the hands nice and large
  push()
  scale(2);
  strokeWeight(5);
  stroke(0);
  drawHands(myHands,true);
  pop();

  
  push();
  fill(255,0,0);
  text(statusText,2,60);
  pop();
}