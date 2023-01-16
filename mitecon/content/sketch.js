let video;
let features;
let knn;
let ready = false;
let label = 'nothing';
let labelP = '';
let modelLoaded = false;

let c;

let classifier, label2, interval;

let isImageClassifier = true;
let isSoundClassifier = true;

let fullscreen = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-fullscreen-button.ytp-button");

function clickEvent() {
  let title = document.querySelector("#movie_player > div.html5-video-container > video");
  title.click();
  console.log('clickしました。');
}

const lateTime = 10;

function debounce(fn, late) {
  let timer;
  return () => {
    // setTimeoutでinterval秒処理を待ち関数を実行
    // debounce関数ががinterval秒内で複数呼び出されても、都度clearTimeoutを実行し、最後の1回だけ実行する
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn();
    }, late);
    console.log(timer);
  }
}

window.addEventListener('click', debounce(clickEvent, lateTime));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const logits = features.infer(video);
  if (request.mode == "image"){
    console.log('image: ' + request.checked);
    isImageClassifier = request.checked;
    // sendResponse("goodbye");
  }
  if (request.mode == "sound"){
    console.log('sound: ' + request.checked);
    isSoundClassifier = request.checked;
    // sendResponse("goodbye");
  }
  if (request.arrow == "up"){
    console.log('up');
    knn.addExample(logits, 'up');
  }
  if (request.arrow == "down"){
    console.log('down');
    knn.addExample(logits, 'down');
  }
  if (request.arrow == "play"){
    clickEvent();
    console.log('play');
    knn.addExample(logits, 'play');
  }
  // if (request.arrow == "noisy"){
  //   console.log('noisy');
  //   knn.addExample(logits, 'noisy');
  // }
  // if (request.arrow == "silent"){
  //   console.log('silent');
  //   knn.addExample(logits, 'silent');
  // }
  if (request.arrow == "screen"){
    fullscreen.click();
    console.log('screen');
    knn.addExample(logits, 'screen');
  }
  if (request.arrow == "stop"){
    console.log('stop');
    knn.addExample(logits, 'stop');
  }
  if (request.opacity){
    console.log(request.opacity)
    c.style("opacity", request.opacity);
  }
});

function setup() {
  c = createCanvas(320, 240);
  c.style('position', 'fixed');
  c.style('top', '0');
  c.style('opacity', '0.1');
  c.style('z-index', '1000');
  video = createCapture(VIDEO);
  video.style("transform", "scale(-1,1)");
  video.hide();
  features = ml5.featureExtractor('MobileNet', knnModelReady);
  knn = ml5.KNNClassifier();
  labelP = createP('need training data');
  labelP.style('position', 'fixed');
  labelP.style('top', '230px');

  // Options for the SpeechCommands18w model, the default probabilityThreshold is 0
  const options = {
    probabilityThreshold: 0.7
  };
  classifier = ml5.soundClassifier('SpeechCommands18w', options, modelReady);
}

function modelReady() {
  // classify sound
  classifier.classify(gotResult);
}

function gotResult(error, result) {
  if (error) {
    console.log(error);
    return;
  } else if(!isSoundClassifier){
    clearInterval(interval);
    return;
  }
  // log the result
  if(result[0].confidence > 0.97)
    label2 = result[0].label;
  
  // console.log(label);
  if (label2 == 'up') {
    clearInterval(interval);
    interval = setInterval(() => {
      scrollBy(0, -40);
    }, 200);
    console.log('scrollUp');
  } else if (label2 == 'down') {
    clearInterval(interval);
    interval = setInterval(() => {
      scrollBy(0, 40);
    }, 200);
    console.log('scrollDown');
  } else if (label2 == 'play') {
    clearInterval(interval);
    interval = setInterval(() => {
      clickEvent();
    }, 200);
    console.log('play');
  // } else if (label2 == 'noisy') {
  //   clearInterval(interval);
  //   interval = setInterval(() => {
      
  //   }, 200);
  //   console.log('noisy');
  // } else if (label2 == 'silent') {
  //   clearInterval(interval);
  //   interval = setInterval(() => {
    
  //   }, 200);
  //   console.log('silent');
  } else if (label2 == 'screen') {
    clearInterval(interval);
    interval = setInterval(() => {
      fullscreen.click();
    }, 200);
    console.log('screen');
  }else if (label2 == 'stop') {
    clearInterval(interval);
    console.log('stop scroll');
  } else if (label2 == 'one') {
    document.body.style.zoom = 1;
    console.log('zoom');
  } else if (label2 == 'two') {
    document.body.style.zoom = 1.5;
    console.log('zoom');
  } else if (label2 == 'three') {
    document.body.style.zoom = 2;
    console.log('zoom');
  }
}

function goClassify() {
  const logits = features.infer(video);
  knn.classify(logits, function(error, result) {
    if (error) {
      console.error(error);
    } else {
      // console.log(result);
      // model loadした後だと、labelが数字に変換される（バグ？）
      if(modelLoaded){
        label = Object.keys(result.confidencesByLabel)[result.label];
      } else {
        if (isImageClassifier) {
          label = result.label;
          if (label == 'up') {
            scrollBy(0, -40);
            console.log('scrollUp');
          } else if (label == 'down') {
            scrollBy(0, 40);
            console.log('scrollDown');
          } else if (label == 'play') {
            clickEvent();
            console.log('scrollplay');
          // } else if (label == 'noisy') {
            
          //   console.log('scrollnoisy');
          // } else if (label == 'silent') {
            
          //   console.log('scrollsilent');
          }else if (label == 'screen') {
            fullscreen.click();
            console.log('scrollscreen');
          }else {
            console.log('stop');
          }
        }
        
      }
      labelP.html(label);
      goClassify();
    }
  });
}

function knnModelReady() {
  console.log('model ready!');
  // Comment back in to load your own model!
  // knn.load('model/model.json', function() {
  //   console.log('knn loaded');
  //   modelLoaded = true;
  // });
}

function keyPressed() {
  const logits = features.infer(video);
  if (key == 'l') {
    knn.addExample(logits, 'play');
    console.log('play');
  // } else if (key == 'n') {
  //   knn.addExample(logits, 'noisy');
  //   console.log('noisy');
  // } else if (key == 'q') {
  //   knn.addExample(logits, 'silent');
  //   console.log('silent');
  }else if (key == 'u') {
    knn.addExample(logits, 'up');
    console.log('up');
  } else if (key == 'd') {
    knn.addExample(logits, 'down');
    console.log('down');
  } else if (key == 'f') {
    knn.addExample(logits, 'screen');
    console.log('screen');
  }else if (key == ' ') {
    knn.addExample(logits, 'stop');
    console.log('stop');
  } else if (key == 's') {
    knn.save('model.json');
    // save(knn, 'model.json');
  }
}

function draw() {
  image(video, 0, 0, 320, 240);
  if (!isImageClassifier) {
    labelP.html("");
    c.style("opacity", 0);
  }
  if (!ready && knn.getNumLabels() > 0) {
    goClassify();
    ready = true;
  }
}
