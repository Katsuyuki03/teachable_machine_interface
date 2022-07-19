// const STATUS = document.getElementById('status');
// const VIDEO = document.getElementById('webcam');
// const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
// const RESET_BUTTON = document.getElementById('reset');
// const TRAIN_BUTTON = document.getElementById('train');

// const MOBILE_NET_INPUT_WIDTH = 224;
// const MOBILE_NET_INPUT_HEIGHT = 224;

// const STOP_DATA_GATHER = -1;
// const CLASS_NAMES = [];


// let mobilenet = undefined;
// let gatherDataState = STOP_DATA_GATHER;
// let videoPlaying = false;
// let trainingDataInputs = [];
// let trainingDataOutputs = [];
// let examplesCount = [];
// let predict = false;

// let result = document.getElementById('result');



// let pose = "Class 1";
// let accuracy =0;
// let direction;


// ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
// TRAIN_BUTTON.addEventListener('click', trainAndPredict);
// RESET_BUTTON.addEventListener('click', reset);


// let dataCollectorButtons = document.querySelectorAll('button.dataCollector');
// for (let i = 0; i < dataCollectorButtons.length; i++) {
//   dataCollectorButtons[i].addEventListener('mousedown', gatherDataForClass);
//   dataCollectorButtons[i].addEventListener('mouseup', gatherDataForClass);
//   // Populate the human readable names for classes.
//   CLASS_NAMES.push(dataCollectorButtons[i].getAttribute('data-name'));
// }



// /**
//  * Loads the MobileNet model and warms it up so ready for use.
//  **/
//  async function loadMobileNetFeatureModel() {
//     const URL ='https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
      
//     mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
//     STATUS.innerText = 'MobileNet v3 loaded successfully!';
  
//     // Warm up the model by passing zeros through it once.
//     tf.tidy(function () {
//       let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
//       console.log(answer.shape);
//     });
//   }
  
//   // Call the function immediately to start loading.
//   loadMobileNetFeatureModel();


//   let model = tf.sequential();

// model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
// model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));

// model.summary();

// // Compile the model with the defined optimizer and specify a loss function to use.
// model.compile({
//   // Adam changes the learning rate over time which is useful.
//   optimizer: 'adam',
//   // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
//   // Else categoricalCrossentropy is used if more than 2 classes.
//   loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy',
//   // As this is a classification problem you can record accuracy in the logs too!
//   metrics: ['accuracy']
// });



// function hasGetUserMedia() {
//   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
// }


// function enableCam() {
//   if (hasGetUserMedia()) {
//     // getUsermedia parameters.
//     const constraints = {
//       video: true,
//       width: 640,
//       height: 480
//     };

//     // Activate the webcam stream.
//     navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
//       VIDEO.srcObject = stream;
//       VIDEO.addEventListener('loadeddata', function() {
//         videoPlaying = true;
//         ENABLE_CAM_BUTTON.classList.add('removed');
//       });
//     });
//   } else {
//     console.warn('getUserMedia() is not supported by your browser');
//   }
// }

// /**
//  * Handle Data Gather for button mouseup/mousedown.
//  **/
//  function gatherDataForClass() {
//   let classNumber = parseInt(this.getAttribute('data-1hot'));
//   gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
//   dataGatherLoop();
// }

// function dataGatherLoop() {
//   if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) {
//     let imageFeatures = tf.tidy(function() {
//       let videoFrameAsTensor = tf.browser.fromPixels(VIDEO);
//       let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT,
//           MOBILE_NET_INPUT_WIDTH], true);
//       let normalizedTensorFrame = resizedTensorFrame.div(255);
//       return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
//     });

//     trainingDataInputs.push(imageFeatures);
//     trainingDataOutputs.push(gatherDataState);

//     // Intialize array index element if currently undefined.
//     if (examplesCount[gatherDataState] === undefined) {
//       examplesCount[gatherDataState] = 0;
//     }
//     examplesCount[gatherDataState]++;

//     STATUS.innerText = '';
//     for (let n = 0; n < CLASS_NAMES.length; n++) {
//       STATUS.innerText += CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ';
//     }
//     window.requestAnimationFrame(dataGatherLoop);
//   }
// }


// async function trainAndPredict() {
//   predict = false;
//   tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
//   let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
//   let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
//   let inputsAsTensor = tf.stack(trainingDataInputs);

//   let results = await model.fit(inputsAsTensor, oneHotOutputs, {shuffle: true, batchSize: 5, epochs: 10,
//       callbacks: {onEpochEnd: logProgress} });

//   outputsAsTensor.dispose();
//   oneHotOutputs.dispose();
//   inputsAsTensor.dispose();
//   predict = true;
//   predictLoop();
// }

// function logProgress(epoch, logs) {
//   console.log('Data for epoch ' + epoch, logs);
// }

// function predictLoop() {
//   if (predict) {
//     tf.tidy(function() {
//       let videoFrameAsTensor = tf.browser.fromPixels(VIDEO).div(255);
//       let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor,[MOBILE_NET_INPUT_HEIGHT,
//           MOBILE_NET_INPUT_WIDTH], true);

//       let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
//       let prediction = model.predict(imageFeatures).squeeze();
//       let highestIndex = prediction.argMax().arraySync();
//       let predictionArray = prediction.arraySync();

//       STATUS.innerText = 'Prediction: ' + CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
    
//       pose = CLASS_NAMES[highestIndex];
//       accuracy = Math.floor(predictionArray[highestIndex] * 100);

//     });

//     window.requestAnimationFrame(predictLoop);
//   }
// }

// /**
//  * Purge data and start over. Note this does not dispose of the loaded
//  * MobileNet model and MLP head tensors as you will need to reuse
//  * them to train a new model.
//  **/
// function reset() {
//   predict = false;
//   examplesCount.length = 0;
//   for (let i = 0; i < trainingDataInputs.length; i++) {
//     trainingDataInputs[i].dispose();
//   }
//   trainingDataInputs.length = 0;
//   trainingDataOutputs.length = 0;
//   STATUS.innerText = 'No data collected';

//   console.log('Tensors in memory: ' + tf.memory().numTensors);

//   x = 150 ;
//   y = 150 ;
// }






//「ポン」(卓球ゲーム)もどき
// マウスで両方のパドルを走査する

let leftPaddleSp, rightPaddleSp, ballSp, wallTopSp, wallBottomSp;
const MAX_SPEED = 7;

// function clickDisplay() {
// document.getElementById("createCanvas").style.visibility ="hidden";
//     const  clickDisplay= document.getElementById("clickDisplay");
//     p2.style.visibility ="visible";
//   }

//score
 let p1Score = 0;
 let p2Score = 0;




function setup() {
    createCanvas(800, 400);

	textSize(50);

    // display = none;
    //frameRate(6);
    const w = 10;
    const h = 100;
    const offset = 30;

    noStroke();
    reset=0;


    // 左のパドルスプライト
    leftPaddleSp = makeSprite(offset, height / 2, w, h, true, color(255, 0, 0));
    // 右のパドルスプライト
    rightPaddleSp = makeSprite(width - offset, height / 2, w, h, true, color(255, 0, 255));
    // 上の壁スプライト
    wallTopSp = makeSprite(width / 2, -10, width, offset, true, color(0, 255, 0));
    // 下の壁スプライト
    wallBottomSp = makeSprite(width / 2, height + 10, width, offset, true, color(0, 255, 0));
    // ボールスプライト
    ballSp = makeSprite(width / 2, height / 2, 10, 10, false, color(255));
    // 速くなりすぎないように制限を設ける
    ballSp.maxSpeed = MAX_SPEED;
    // ボールは最初、キャンバス中央から左へ進む
    ballSp.setSpeed(MAX_SPEED, -180);
}

// スプライトを作成し、与えられた引数でプロパティを設定したスプライトを返す
function makeSprite(xpos, ypos, w, h, isImmovable, col) {
    const sp = createSprite();
    sp.width = w;
    sp.height = h;
    sp.position.x = xpos;
    sp.position.y = ypos;
    sp.immovable = isImmovable;
    sp.shapeColor = col;
    return sp;
}

function draw() {
    background(0);     
    update();
    drawSprites();
    fill(255);
    text(p1Score, 200, 100);
	text(p2Score, 550, 100);
}

function update() {
    // パドルがキャンバスから出ないように、上下の動きを制限し、
    // 右パドルを左パドルの動きに同期させる。
    leftPaddleSp.position.y = constrain(mouseY, leftPaddleSp.height / 2, height - leftPaddleSp.height / 2);
    rightPaddleSp.position.y = constrain(mouseY, leftPaddleSp.height / 2, height - leftPaddleSp.height / 2);

    // ボールは上の壁に当たったら跳ね返る
    ballSp.bounce(wallTopSp);
    // ボールは下の壁に当たったら跳ね返る
    ballSp.bounce(wallBottomSp);

    // 入射角＝反射角とする => ballSp.getDirection()
    // 「反射の法則」 https://exam.fukuumedia.com/rika1-13/#i-3
    // ただし、ボールの芯とパドルの芯のずれが大きいと、反射角も大きくなる

    // ボールが左パドルに当たったら
    if (ballSp.bounce(leftPaddleSp)) {
        // ボールの芯とパドルの芯のずれ。
        const swing = (ballSp.position.y - leftPaddleSp.position.y) / 3;
        // 左パドルの場合、角度は時計回りに大きくなるので、角度を大きくするにはswingを足す
        ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() + swing);
        print(ballSp.getDirection())
    }

    // ボールが右パドルに当たったら
    if (ballSp.bounce(rightPaddleSp)) {
        const swing = (ballSp.position.y - rightPaddleSp.position.y) / 3;
        // 右パドルの場合、角度は反時計回りに大きくなるので、角度を大きくするにはswingを引く
        ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() - swing);
    }


    
    // ボールがキャンバス左端から外に出たら、真ん中に再配置し右へ動く
    if (ballSp.position.x < 0) {
        ballSp.position.x = width / 2;
        ballSp.position.y = height / 2;
        ballSp.setSpeed(MAX_SPEED, 0);
        p1Score = p1Score + 1;
    }
    // ボールがキャンバス右端から外に出たら、真ん中に再配置し左へ動く
    if (ballSp.position.x > width) {
        ballSp.position.x = width / 2;
        ballSp.position.y = height / 2;
        ballSp.setSpeed(MAX_SPEED, 180);
        p2Score = p2Score + 1;
    }
	//check for winner
	if (p1Score == 11) {
		background(0);
		xSpeed = 0;
		ySpeed = 0;
		text(p1Win, 115, 300);
	} else if (p2Score == 11) {
		background(0);
		xSpeed = 0;
		ySpeed = 0;
		text(p2Win, 115, 300);
	}

}



