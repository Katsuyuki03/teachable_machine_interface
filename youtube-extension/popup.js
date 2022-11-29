
// contentにメッセージを送る
chrome.tabs.query({ active: true, currentWindow: true }, aim_message);

let buttonElement = document.getElementById('btn');

buttonElement.addEventListener('click', (event) => {
    const sendMessageId = document.getElementById("sendmessageid");
    if (sendMessageId) {
    sendMessageId.onclick = function() {
    setTimeout(() => {ai.click()}, 3000);
  };
}
});

// function aim_message(tabs) {
//   // 今開いているタブに、データを渡す（send_data, callbackは省略可）
//   chrome.tabs.sendMessage(tabs[0].id, send_data, callback);
// }

// function callback(callback_data) {
//   // コールバック関数の処理（popupからの値をlocalstorageに保存したり）
// }