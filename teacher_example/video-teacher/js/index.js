const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];
const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
const RESET_BUTTON = document.getElementById('reset');
const TRAIN_BUTTON = document.getElementById('train');

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

const hasGetUserMedia = () => {
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

const logProgress = (epoch, logs) => {
  console.log('Data for epoch ' + epoch, logs);
}

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

        pose = CLASS_NAMES[highestIndex];
        accuracy = Math.floor(predictionArray[highestIndex] * 100);
      });
    });

    window.requestAnimationFrame(predictLoop);
  }
}

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

const loadMobileNetFeatureModel = async () => {
  const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
  
  mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });

  tf.tidy(() => {
    mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
  });
};

canvasList.forEach((canvas) => {
  const context = canvas.getContext('2d');

  contexts.push(context);
});

/**
 * Purge data and start over. Note this does not dispose of the loaded
 * MobileNet model and MLP head tensors as you will need to reuse
 * them to train a new model.
 **/
const reset = () => {
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

ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
TRAIN_BUTTON.addEventListener('click', trainAndPredict);
RESET_BUTTON.addEventListener('click', reset);