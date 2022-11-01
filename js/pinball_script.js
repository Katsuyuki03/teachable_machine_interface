// const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
// const RESET_BUTTON = document.getElementById('reset');
// const TRAIN_BUTTON = document.getElementById('train');

const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;

const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];

// すべての canvas 要素を取得する
const canvasList = document.querySelectorAll('.js-canvas_Video');
// 解析用の canvas は 0, 2 番目の canvas にする（0と1、2と3は同じ画像なので、2つを解析すればいい）
const predictCanvases = [canvasList[0], canvasList[2]];
const contexts = [];

// video 要素をつくる
const videoContainer = document.querySelector('#js-video-Container');
const video = document.createElement('video');

// videoContainer.appendChild(video)

const dataCollectorButtons = document.querySelectorAll('.dataCollector');
const playerStatus = document.querySelectorAll('.js-status-Player');
const canvasSample = document.querySelectorAll('.js-canvas_Sample');

let mobilenet = undefined;
let gatherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let model = tf.sequential();
let predict = false;



const pose = [];
let accuracy =0;
let direction;

const updateCanvas = () => {
  contexts.forEach((context, index) => {
    const dw = video.videoWidth * 0.5;
    const dx = dw * ([2, 3].includes(index) ? 1 : 0);
    const dh = dw;
    const dy = (video.videoHeight - dw) * 0.5;
    
    context.drawImage(
      video,
      dx,
      dy,
      dw,
      dh,
      0,
      0,
      canvasList.item(index).width,
      canvasList.item(index).height
    );
  });

  requestAnimationFrame(updateCanvas);
};

const dataGatherLoop = (index) => {
  // 何番目の canvas を学習のリソースにするか
  const canvasIndex = index;

  const loop = () => {
    if (!video.paused && gatherDataState !== STOP_DATA_GATHER) {
      const imageFeatures = tf.tidy(() => {
        const videoFrameAsTensor = tf.browser.fromPixels(canvasList[canvasIndex]);
        const resizedTensorFrame = tf.image.resizeBilinear(
          videoFrameAsTensor,
          [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
          true
        );
        const normalizedTensorFrame = resizedTensorFrame.div(255);
        
        return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
      });

      trainingDataInputs.push(imageFeatures);
      trainingDataOutputs.push(gatherDataState);

      // Intialize array index element if currently undefined.
      if (examplesCount[gatherDataState] === undefined) {
        examplesCount[gatherDataState] = 0;
      }

      examplesCount[gatherDataState]++;

      canvasSample[canvasIndex].innerText = examplesCount[canvasIndex];

      window.requestAnimationFrame(loop);
    }
  };

  window.requestAnimationFrame(loop);
};

/**
 * Handle Data Gather for button mouseup/mousedown.
 **/
 const gatherDataForClass = (e) => {
  const classNumber = parseInt(e.target.getAttribute('data-1hot'));
  // 押下されたボタンが何番目かの数値
  const index = [...dataCollectorButtons].findIndex(
    (dataCollectorButton) => dataCollectorButton === e.target
  );
  
  gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
  dataGatherLoop(index);
}
// /**
//  * Handle Data Gather for button mouseup/mousedown.
//  **/
// function gatherDataForClass() {
//   let classNumber = parseInt(this.getAttribute('data-1hot'));
//   gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
//   dataGatherLoop();
// }

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const enableCam = () => {
  if (hasGetUserMedia()) {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    }).then((stream) => {
      video.srcObject = stream;
      video.addEventListener('loadeddata', () => {
        requestAnimationFrame(updateCanvas);
      });
    });
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
}
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
//       video.srcObject = stream;
//       video.addEventListener('loadeddata', function() {
//         videoPlaying = true;
//         ENABLE_CAM_BUTTON.classList.add('removed');
//       });
//     });
//   } else {
//     console.warn('getUserMedia() is not supported by your browser');
//   }
// }

const logProgress = (epoch, logs) => {
  console.log('Data for epoch ' + epoch, logs);
}
// function logProgress(epoch, logs) {
//   console.log('Data for epoch ' + epoch, logs);
// }

const predictLoop = () => {
  if (predict) {
    tf.tidy(function () {
      predictCanvases.forEach((canvas, index) => {
        const videoFrameAsTensor = tf.browser.fromPixels(canvas).div(255);
        const resizedTensorFrame = tf.image.resizeBilinear(
          videoFrameAsTensor,
          [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
          true
        );

        const imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
        const prediction = model.predict(imageFeatures).squeeze();
        const highestIndex = prediction.argMax().arraySync();
        const predictionArray = prediction.arraySync();

        playerStatus[index].innerText = `Player${index + 1} Prediction: ${CLASS_NAMES[highestIndex]} with ${Math.floor(predictionArray[highestIndex] * 100)}% confidence`;

        pose[index]=CLASS_NAMES[highestIndex];
        // pose = CLASS_NAMES[highestIndex];

        accuracy = Math.floor(predictionArray[highestIndex] * 100);
      });
    });

    window.requestAnimationFrame(predictLoop);
  }
}
// function predictLoop() {
//   if (predict) {
//     tf.tidy(function() {
//       let videoFrameAsTensor = tf.browser.fromPixels(video).div(255);
//       let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor,[MOBILE_NET_INPUT_HEIGHT,
//       MOBILE_NET_INPUT_WIDTH], true);

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

const trainAndPredict = async () => {
  predict = false;

  tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
  
  const outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
  const oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
  const inputsAsTensor = tf.stack(trainingDataInputs);

  await model.fit(inputsAsTensor, oneHotOutputs, {
    shuffle: true,
    batchSize: 5,
    epochs: 10,
    callbacks: {
      onEpochEnd: logProgress
    },
  });

  outputsAsTensor.dispose();
  oneHotOutputs.dispose();
  inputsAsTensor.dispose();
  predict = true;
  predictLoop();
}
// async function trainAndPredict() {
//   predict = false;
//   tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
//   let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
//   let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
//   let inputsAsTensor = tf.stack(trainingDataInputs);

//   let results = await model.fit(inputsAsTensor, oneHotOutputs, {shuffle: true, batchSize: 5, epochs: 10,
//   callbacks: {onEpochEnd: logProgress} });

//   outputsAsTensor.dispose();
//   oneHotOutputs.dispose();
//   inputsAsTensor.dispose();
//   predict = true;
//   predictLoop();
// }

/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
 const loadMobileNetFeatureModel = async () => {
  const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
  
  mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });

  tf.tidy(() => {
    mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
  });
};
//  async function loadMobileNetFeatureModel() {
//   const URL ='https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
      
//   mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
//   STATUS.innerText = 'MobileNet v3 loaded successfully!';
  
//   // Warm up the model by passing zeros through it once.
//   tf.tidy(function () {
//     let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
//     console.log(answer.shape);
//   });
// }

canvasList.forEach((canvas) => {
  const context = canvas.getContext('2d');

  contexts.push(context);
});

/**
 * Purge data and start over. Note this does not dispose of the loaded
 * MobileNet model and MLP head tensors as you will need to reuse
 * them to train a new model.
 **/
 function reset() {
  predict = false;
  examplesCount.length = 0;
  for (let i = 0; i < trainingDataInputs.length; i++) {
    trainingDataInputs[i].dispose();
  }
  trainingDataInputs.length = 0;
  trainingDataOutputs.length = 0;

  canvasSample.forEach((cs) => {
    cs.innerText = 0;
  });

  console.log('Tensors in memory: ' + tf.memory().numTensors);


}

video.autoplay = true;
video.mutd = true; // 消音にする
video.playsInline = true;

// Call the function immediately to start loading.
loadMobileNetFeatureModel();

for (let i = 0; i < dataCollectorButtons.length; i++) {
  dataCollectorButtons[i].addEventListener('mousedown', gatherDataForClass);
  dataCollectorButtons[i].addEventListener('mouseup', gatherDataForClass);
  // Populate the human readable names for classes.
  CLASS_NAMES.push(dataCollectorButtons[i].getAttribute('data-name'));
}

model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));

model.summary();

// Compile the model with the defined optimizer and specify a loss function to use.
model.compile({
  // Adam changes the learning rate over time which is useful.
  optimizer: 'adam',
  // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
  // Else categoricalCrossentropy is used if more than 2 classes.
  loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy',
  // As this is a classification problem you can record accuracy in the logs too!
  metrics: ['accuracy']
});


// function dataGatherLoop() {
//   if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) {
//     let imageFeatures = tf.tidy(function() {
//       let videoFrameAsTensor = tf.browser.fromPixels(video);
//       let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT,MOBILE_NET_INPUT_WIDTH], true);
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


//「ポン」(卓球ゲーム)もどき
// マウスで両方のパドルを走査する

let leftPaddleSp, rightPaddleSp, ballSp, wallTopSp, wallBottomSp;
const MAX_SPEED = 7;

// ゲームが始まっていないかを表す真偽値
let isGameset = true;
// ゲームの現在の状態（起動・勝敗など）にあわせて表示される画像が入る変数
let currentImg;

let start;
let p1Win;
let p2Win;

let Leftp = 200;
let Rightp = 200;

let startButton = document.getElementById("btn-start");
let againButton = document.getElementById("btn-again");

function preload() {
  start = loadImage("images/start.jpg");
  p1Win = loadImage("images/p1Win.jpg");
  p2Win = loadImage("images/p2Win.jpg");
  currentImg = start;
}

// プログレスバー代案1
// const bar = new ProgressBar.Line(container, {
//   strokeWidth: 1,
//   easing: "easeInOut",
//   duration: 1400,
//   color: "#FFEA82",
//   trailColor: "#eee",
//   trailWidth: 1,
//   svgStyle: {width: "100%", height: "100%"}
// });
// bar.animate(1.0);
// プログレスバー代案2
// var p2_value = 0;
// function proc2()
// {
// 	if (p2_value  < 100 ) {
// 		document.getElementById('p2').style.width = ++p2_value + '%';
// 		setTimeout(proc2, 100);
// 	}
// };

// let processor = {
//   timerCallback: function() {
//     if (this.video.paused || this.video.ended) {
//       return;
//     }
//     this.computeFrame();
//     let self = this;
//     setTimeout(function () {
//         self.timerCallback();
//       }, 0);
//   },

//   doLoad: function() {
//     this.video = document.getElementById("webcam");
//     this.c1 = document.getElementById("c1");
//     this.ctx1 = this.c1.getContext("2d");
//     // this.c2 = document.getElementById("c2");
//     // this.ctx2 = this.c2.getContext("2d");
//     let self = this;
//     this.video.addEventListener("play", function() {
//         self.width = self.video.videoWidth / 2;
//         self.height = self.video.videoHeight / 2;
//         self.timerCallback();
//       }, false);
//   },

//   computeFrame: function() {
//     this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
//     let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
//         let l = frame.data.length / 4;

//     for (let i = 0; i < l; i++) {
//       let r = frame.data[i * 4 + 0];
//       let g = frame.data[i * 4 + 1];
//       let b = frame.data[i * 4 + 2];
//       if (g > 100 && r > 100 && b < 43)
//         frame.data[i * 4 + 3] = 0;
//     }
//     this.ctx2.putImageData(frame, 0, 0);
//     return;
//   }
// };

// document.addEventListener("DOMContentLoaded", () => {
// processor.doLoad();
// });

startButton.addEventListener(`click`, () => {
  console.log('startButton がクリックされました');

  window.setTimeout(() => {
    isGameset = false;
    // ボールは最初、キャンバス中央から左へ進む
    ballSp.position.x = width / 2;
    ballSp.position.y = height / 2;
    ballSp.setSpeed(MAX_SPEED, 160);
    p1Score = 0;
    p2Score = 0;
  }, 8000);
  
});


againButton.addEventListener(`click`, () => {
  console.log('againButton がクリックされました');
  currentImg = start;
  // ボールは最初、キャンバス中央から左へ進む
  ballSp.position.x = width / 2;
  ballSp.position.y = height / 2;
  ballSp.setSpeed(MAX_SPEED, 160);
  p1Score = 0;
  p2Score = 0;
});

//score
let p1Score = 0;
let p2Score = 0;
let page = 0;

function setup() {
  const canvas = createCanvas( 800, 400 );
  
  // HTMLのdiv game-screen に canvasを挿入
  canvas.parent("game-screen");

  // createCanvas(800, 400);

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

  if (isGameset) {
    background(255);
    // 画像の幅と高さは適当
    image(currentImg, 0, 0, 800, 400);
  } else {
    background(0);     
    update();
    drawSprites();
    fill(255);
    text(p1Score, 200, 100);
    text(p2Score, 550, 100);

  }
   
}

function keyPressed() {
      
  if ((key == "A") || (key == "a")) {
    Leftp= Leftp - 50
  }else if((key == "Z") || (key == "z")){
    Leftp= Leftp + 50
  }

  if ((key == "k") || (key == "K")) {
    Rightp= Rightp- 50
  }else if((key == "m") || (key == "M")){
    Rightp= Rightp + 50
  }

}

function update() {

  if(pose[0] === "Class 1" && accuracy >= 85){ 
    Leftp= Leftp - 10
  }else if(pose[0] === "Class 2" && accuracy >= 85){
    Leftp= Leftp + 10
  }else {
    direction = 0;
    vertical = 0;
  }
  
  if(pose[1] === "Class 3" && accuracy >= 85){ 
    Rightp= Rightp - 10
  }else if(pose[1] === "Class 4" && accuracy >= 85){
    Rightp= Rightp + 10
  }else{
    direction = 0;
    vertical = 0;
  }

  console.log(pose);
  // パドルがキャンバスから出ないように、上下の動きを制限し、
  // 右パドルを左パドルの動きに同期させる。
  leftPaddleSp.position.y = constrain(Leftp, leftPaddleSp.height / 2, height - leftPaddleSp.height / 2);

  rightPaddleSp.position.y = constrain(Rightp, rightPaddleSp.height / 2, height - rightPaddleSp.height / 2);




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
    p2Score = p2Score + 1;
  }
  // ボールがキャンバス右端から外に出たら、真ん中に再配置し左へ動く
  if (ballSp.position.x > width) {
    ballSp.position.x = width / 2;
    ballSp.position.y = height / 2;
    ballSp.setSpeed(MAX_SPEED, 180);
    p1Score = p1Score + 1;
  }
	//check for winner

  if (p1Score === 5) {
    ballSp.setSpeed(0, 0);
    currentImg = p1Win;
    isGameset = true;
    p1Score = 0;
    p2Score = 0;
	}

  if (p2Score === 5) {
    ballSp.setSpeed(0, 0);
    currentImg = p2Win;
    isGameset = true;
    p1Score = 0;
    p2Score = 0;
	}
   
}


enableCam();
startButton.addEventListener('click', trainAndPredict);
againButton.addEventListener('click', reset);