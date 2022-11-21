
let buttonElement = document.getElementById('button');

buttonElement.addEventListener('click', (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {
            tabId: tabs[0].id,
          },
          
        });
    }); 
});