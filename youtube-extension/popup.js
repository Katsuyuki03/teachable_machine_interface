
// ストップ再生できるjs
// document.getElementById("btn").addEventListener("click", (event) => {
//   chrome.tabs.query( {active:true, currentWindow:true}, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, {message: 'getname'}, (content) => {
//         if(!content){
//             alert('Cannot Get! Try Reload First!');
//             return;
//         }
//         document.getElementById('title').value = "受け取ったメッセージは　"+content
//     });
// });
// });

document.addEventListener('DOMContentLoaded', function(){

  tabs = document.querySelectorAll('#js-tab li');
  for(i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', tabSwitch, false);
  }

  function tabSwitch(){
    tabs = document.querySelectorAll('#js-tab li');
    var node = Array.prototype.slice.call(tabs, 0);
    node.forEach(function (element) {
      element.classList.remove('active');
    });
    this.classList.add('active');

    content = document.querySelectorAll('.tab-content');
    var node = Array.prototype.slice.call(content, 0);
    node.forEach(function (element) {
      element.classList.remove('active');
    });

    const arrayTabs = Array.prototype.slice.call(tabs);
    const index = arrayTabs.indexOf(this);
    
    document.querySelectorAll('.tab-content')[index].classList.add('active');
  };

  console.log($);

});

