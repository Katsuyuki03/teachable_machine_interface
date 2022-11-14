
let buttonElement = document.getElementById('button');

buttonElement.addEventListener('click', (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code: `document.body.innerHTML=document.body.innerHTML.replace(/鬼滅の刃/g, 'ボボボーボ・ボーボボ');`}
        );
    }); 
});