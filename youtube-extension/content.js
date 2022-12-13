    // $(function(){
    //     $("button").click(function(){
    //     const $playButton = document.getElementsByClassName("ytp-play-button ytp-button")[0];
    //     if( $playButton ) $playButton.click();
    //     //For debugging
    //     });
    // });

// popupからのメッセージを受け取る


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let title = document.querySelector("#movie_player > div.html5-video-container > video");
    sendResponse("content.js からのメッセージだよー");
    title.click(function() {

    });

});




// setTimeout(() => {title.click()}, 3000);
//   console.log();
//   setTimeout(() => {ai.click()}, 3000);
