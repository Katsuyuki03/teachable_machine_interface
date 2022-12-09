
// contentにメッセージを送る


document.getElementById("btn").addEventListener("click", (event) => {
  chrome.tabs.query( {active:true, currentWindow:true}, (tabs) => {
    console.log(tabs);
    chrome.tabs.sendMessage(tabs[0].id, {message: 'getname'}, (content) => {
        if(!content){
            alert('Cannot Get! Try Reload First!');
            return;
        }
        document.getElementById('title').value = "受け取ったメッセージは　"+content
    });
});
  
});

