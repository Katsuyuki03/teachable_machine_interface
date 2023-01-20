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
  const number = { count: 0 };

  modeImage.addEventListener('change', () => {
    // backgroundには遅れるがcontentsの方には送れない
    // chrome.runtime.sendMessage({greeting: "hello"}, (response) => {
    //   console.log(response);
    // });

    // contentsの方に送れる！
    chromTabsQueryMode("image", modeImage.checked);
  });
  
  learningUp.addEventListener('click', () => {
    barUp[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("up");
  });
  learningDown.addEventListener('click', () => {
    barDown[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("down");
  });
  learningplay.addEventListener('click', () => {
    barplay[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("play");
  });
  learningnoisy.addEventListener('click', () => {
    barnoisy[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("noisy");
  });
  learningsilent.addEventListener('click', () => {
    barsilent[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("silent");
  });
  learningscreen.addEventListener('click', () => {
    barscreen[0].style.width = Math.min( ++number.count*10 , 100) + "%" ;
    chromTabsQueryArrow("screen");
  });
  learningStop.addEventListener('click', () => {
    barStop[0].style.width = Math.min( ++number.count*5 , 100) + "%" ;
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
