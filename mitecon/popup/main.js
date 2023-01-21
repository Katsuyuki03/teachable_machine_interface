document.addEventListener('DOMContentLoaded', () => {
  let modeImage = document.getElementById('mode-image');
  let learningUp = document.getElementById('learning-up');
  let learningDown = document.getElementById('learning-down');
  let learningplay = document.getElementById('learning-play');
  let learningnoisy = document.getElementById('learning-noisy');
  let learningsilent = document.getElementById('learning-silent');
  let learningscreen = document.getElementById('learning-screen');
  let learningStop = document.getElementById('learning-stop');
  let opacityRange = document.getElementById('opacity-range');

  // const barUp = document.querySelectorAll('.up-progress-bar');
  // const barDown = document.querySelectorAll('.down-progress-bar');
  // const barplay = document.querySelectorAll('.play-progress-bar');
  // const barnoisy = document.querySelectorAll('.noisy-progress-bar');
  // const barsilent = document.querySelectorAll('.silent-progress-bar');
  // const barscreen = document.querySelectorAll('.screen-progress-bar');
  // const barStop = document.querySelectorAll('.stop-progress-bar');


  const bar = document.querySelectorAll('.progress-bar');

  modeImage.addEventListener('change', () => {
    // backgroundには遅れるがcontentsの方には送れない
    // chrome.runtime.sendMessage({greeting: "hello"}, (response) => {
    //   console.log(response);
    // });

    // contentsの方に送れる！
    chromTabsQueryMode("image", modeImage.checked);
  });
  
    learningUp.addEventListener('click', () => {
      chromTabsQueryArrow("up");
    });
    learningDown.addEventListener('click', () => {
      chromTabsQueryArrow("down");
    });
    learningplay.addEventListener('click', () => {
      chromTabsQueryArrow("play");
    });
    learningnoisy.addEventListener('click', () => {
      chromTabsQueryArrow("noisy");
    });
    learningsilent.addEventListener('click', () => {
      chromTabsQueryArrow("silent");
    });
    learningscreen.addEventListener('click', () => {
      chromTabsQueryArrow("screen");
    });
    learningStop.addEventListener('click', () => {
      chromTabsQueryArrow("stop");
    });

    bar.forEach(function(learningUp, learningDown,learningplay,learningnoisy,learningsilent,
    learningscreen, learningStop,index) {
      learningUp.addEventListener('click', () => {
      
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningDown.addEventListener('click', () => {
      
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningplay.addEventListener('click', () => {
        
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningnoisy.addEventListener('click', () => {
        
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningsilent.addEventListener('click', () => {
        
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningscreen.addEventListener('click', () => {
        
        bar[index].style.width = Math.min( bar[index]+10 , 100) + "%" ;
      });
      learningStop.addEventListener('click', () => {

        bar[index].style.width = Math.min( bar[index]+5 , 100) + "%" ;
      });
    });







  opacityRange.addEventListener('change', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        opacity: opacityRange.value
      });
    });
  
  });



  function chromTabsQueryMode (mode, checked) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        mode: mode,
        checked: checked
      });
    });
  }

  function chromTabsQueryArrow (value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        arrow: value
      });
    });
  }
});
