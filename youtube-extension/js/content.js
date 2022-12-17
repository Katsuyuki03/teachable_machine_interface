    // $(function(){
    //     $("button").click(function(){
    //     const $playButton = document.getElementsByClassName("ytp-play-button ytp-button")[0];
    //     if( $playButton ) $playButton.click();
    //     //For debugging
    //     });
    // });

// popupからのメッセージを受け取る


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let title = document.querySelector("#movie_player > div.html5-video-container > video");
    sendResponse("content.js からのメッセージだよー");
    title.click(function() {

    });

});

// setTimeout(() => {title.click()}, 3000);
//   console.log();
//   setTimeout(() => {ai.click()}, 3000);

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
    if (request.arrow == "left"){
      console.log('left');
      knn.addExample(logits, 'left');
    }
    if (request.arrow == "right"){
      console.log('right');
      knn.addExample(logits, 'right');
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

