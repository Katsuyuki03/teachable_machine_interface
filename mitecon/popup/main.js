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

  const barUp = document.querySelectorAll('.up-progress-bar');
  const barDown = document.querySelectorAll('.down-progress-bar');
  const barplay = document.querySelectorAll('.play-progress-bar');
  const barnoisy = document.querySelectorAll('.noisy-progress-bar');
  const barsilent = document.querySelectorAll('.silent-progress-bar');
  const barscreen = document.querySelectorAll('.screen-progress-bar');
  const barStop = document.querySelectorAll('.stop-progress-bar');


  // const bar = document.querySelectorAll('.js-progress-bar');
  const number = [20,50,50,50,50,50,50];

  modeImage.addEventListener('change', () => {
    // backgroundには遅れるがcontentsの方には送れない
    // chrome.runtime.sendMessage({greeting: "hello"}, (response) => {
    //   console.log(response);
    // });

    // contentsの方に送れる！
    chromTabsQueryMode("image", modeImage.checked);
  });
  
  learningUp.addEventListener('click', () => {
    number[1] = number[1] + 30;
    barUp[0].style.width = Math.min( number[1]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("up");
  });
  learningDown.addEventListener('click', () => {
    number[2] = number[2] + 30;
    barDown[0].style.width = Math.min( number[2]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("down");
  });
  learningplay.addEventListener('click', () => {
    number[3] = number[3] + 30;
    barplay[0].style.width = Math.min( number[3]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("play");
  });
  learningnoisy.addEventListener('click', () => {
    number[4] = number[4] + 30;
    barnoisy[0].style.width = Math.min( number[4]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("noisy");
  });
  learningsilent.addEventListener('click', () => {
    number[5] = number[5] + 30;
    barsilent[0].style.width = Math.min( number[5]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("silent");
  });
  learningscreen.addEventListener('click', () => {
    number[6] = number[6] + 30;
    barscreen[0].style.width = Math.min( number[6]*0.5 , 100) + "%" ;
    chromTabsQueryArrow("screen");
  });
  learningStop.addEventListener('click', () => {
    number[0] = number[0] + 10;
    barStop[0].style.width = Math.min( 0 + number[0], 100) + "%" ;
    chromTabsQueryArrow("stop");
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
