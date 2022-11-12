// //   p5.js


 // Global variable to store the classifier
 let classifier;

 // Label
 let label = 'listening...';
 let choice = '指パッチンorノック';
 
 // Teachable Machine model URL:
 let soundModel = 'https://teachablemachine.withgoogle.com/models/OGf8wZbtz/';
 
 
 function preload() {
   // Load the model
   classifier = ml5.soundClassifier(soundModel + 'model.json');
 }
 
 function setup() {
   createCanvas(1280, 720);
   // Start classifying
   // The sound model will continuously listen to the microphone
   classifier.classify(gotResult);
 }
 
 function draw() {
   background(0);
   // Draw the label in the canvas
   fill(255);
   textSize(70);
   textAlign(CENTER, CENTER);
   text(label, width / 2, height / 4);
   text(choice,width / 2, height / 1.5);
     
 }
 
 
 // The model recognizing a sound will trigger this event
 function gotResult(error, results) {
   if (error) {
     console.error(error);
     return;
   }
   // The results are in an array ordered by confidence.
   // console.log(results[0]);
   label = results[0].label;
 }