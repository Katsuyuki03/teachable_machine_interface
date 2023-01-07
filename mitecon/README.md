# Teachable Controller for Chrome Extension

Teachable ControllerをChrome Extensionに組み込むことで、様々なサイトでオリジナルのUIを構築できる。・・・というものの試作。

## 仕様

##### 動作環境

- chrome browser

### image
- 画像の学習
- 学習方法は簡易な`kNN`を採用

### sound
- 言葉の判別機能
- 学習済みモデルの`SpeechCommands18w`を利用

## Build Setup
- `chrome://extensions/`にアクセス
- `Developer mode`をonにする
- `Load unpacked`ボタンを押して`Proto06SeiyaChromeExtension/`をアップロード
- アップした拡張機能をonにする
