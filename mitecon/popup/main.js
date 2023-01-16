document.addEventListener('DOMContentLoaded', () => {
  let modeImage = document.getElementById('mode-image');
  let modeSound = document.getElementById('mode-sound');
  let learningUp = document.getElementById('learning-up');
  let learningDown = document.getElementById('learning-down');
  let learningplay = document.getElementById('learning-play');
  let learningnoisy = document.getElementById('learning-noisy');
  let learningsilent = document.getElementById('learning-silent');
  let learningscreen = document.getElementById('learning-screen');
  let learningStop = document.getElementById('learning-stop');
  let opacityRange = document.getElementById('opacity-range');

  modeImage.addEventListener('change', () => {
    // backgroundには遅れるがcontentsの方には送れない
    // chrome.runtime.sendMessage({greeting: "hello"}, (response) => {
    //   console.log(response);
    // });

    // contentsの方に送れる！
    chromTabsQueryMode("image", modeImage.checked);
  });
  modeSound.addEventListener('change', () => {
    chromTabsQueryMode("sound", modeSound.checked);
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
