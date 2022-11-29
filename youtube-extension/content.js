    // $(function(){
    //     $("button").click(function(){
    //     const $playButton = document.getElementsByClassName("ytp-play-button ytp-button")[0];
    //     if( $playButton ) $playButton.click();
    //     //For debugging
    //     });
    // });

// popupからのメッセージを受け取る

    chrome.runtime.onMessage.addListener((send_data, sender, callback) => {

        document.addEventListener('DOMContentLoaded', function() {
            const entryElement = document.getElementById("btn");
            entryElement.addEventListener('click', function() {
                         //何かしらの処理
            });
        });
    //何かしらの処理
    const ai = document.querySelector("#movie_player > div.html5-video-container > video");

    // コールバック関数の実行
    callback(button);
  
    // おまじないで必要らしい
    return true;
  });


  
//   console.log();
//   setTimeout(() => {ai.click()}, 3000);
