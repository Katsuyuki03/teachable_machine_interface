//「ポン」(卓球ゲーム)もどき
// マウスで両方のパドルを走査する

let leftPaddleSp, rightPaddleSp, ballSp, wallTopSp, wallBottomSp;
const MAX_SPEED = 10;



function clickDisplay() {
document.getElementById("createCanvas").style.visibility ="hidden";
    const  clickDisplay= document.getElementById("clickDisplay");
    p2.style.visibility ="visible";
  }


function setup() {
    createCanvas(800, 400);
    display = none;
    //frameRate(6);
    const w = 10;
    const h = 100;
    const offset = 30;

    // 左のパドルスプライト
    leftPaddleSp = makeSprite(offset, height / 2, w, h, true, color(255, 0, 0));
    // 右のパドルスプライト
    rightPaddleSp = makeSprite(width - offset, height / 2, w, h, true, color(255, 0, 255));
    // 上の壁スプライト
    wallTopSp = makeSprite(width / 2, -10, width, offset, true, color(0, 255, 0));
    // 下の壁スプライト
    wallBottomSp = makeSprite(width / 2, height + 10, width, offset, true, color(0, 255, 0));
    // ボールスプライト
    ballSp = makeSprite(width / 2, height / 2, 10, 10, false, color(255));
    // 速くなりすぎないように制限を設ける
    ballSp.maxSpeed = MAX_SPEED;
    // ボールは最初、キャンバス中央から左へ進む
    ballSp.setSpeed(MAX_SPEED, -180);
}

// スプライトを作成し、与えられた引数でプロパティを設定したスプライトを返す
function makeSprite(xpos, ypos, w, h, isImmovable, col) {
    const sp = createSprite();
    sp.width = w;
    sp.height = h;
    sp.position.x = xpos;
    sp.position.y = ypos;
    sp.immovable = isImmovable;
    sp.shapeColor = col;
    return sp;
}

function draw() {
    background(0);
    update();
    drawSprites();
}

function update() {
    // パドルがキャンバスから出ないように、上下の動きを制限し、
    // 右パドルを左パドルの動きに同期させる。
    leftPaddleSp.position.y = constrain(mouseY, leftPaddleSp.height / 2, height - leftPaddleSp.height / 2);
    rightPaddleSp.position.y = constrain(mouseY, leftPaddleSp.height / 2, height - leftPaddleSp.height / 2);

    // ボールは上の壁に当たったら跳ね返る
    ballSp.bounce(wallTopSp);
    // ボールは下の壁に当たったら跳ね返る
    ballSp.bounce(wallBottomSp);

    // 入射角＝反射角とする => ballSp.getDirection()
    // 「反射の法則」 https://exam.fukuumedia.com/rika1-13/#i-3
    // ただし、ボールの芯とパドルの芯のずれが大きいと、反射角も大きくなる

    // ボールが左パドルに当たったら
    if (ballSp.bounce(leftPaddleSp)) {
        // ボールの芯とパドルの芯のずれ。
        const swing = (ballSp.position.y - leftPaddleSp.position.y) / 3;
        // 左パドルの場合、角度は時計回りに大きくなるので、角度を大きくするにはswingを足す
        ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() + swing);
        print(ballSp.getDirection())
    }

    // ボールが右パドルに当たったら
    if (ballSp.bounce(rightPaddleSp)) {
        const swing = (ballSp.position.y - rightPaddleSp.position.y) / 3;
        // 右パドルの場合、角度は反時計回りに大きくなるので、角度を大きくするにはswingを引く
        ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() - swing);
    }

    // ボールがキャンバス左端から外に出たら、真ん中に再配置し右へ動く
    if (ballSp.position.x < 0) {
        ballSp.position.x = width / 2;
        ballSp.position.y = height / 2;
        ballSp.setSpeed(MAX_SPEED, 0);
    }
    // ボールがキャンバス右端から外に出たら、真ん中に再配置し左へ動く
    if (ballSp.position.x > width) {
        ballSp.position.x = width / 2;
        ballSp.position.y = height / 2;
        ballSp.setSpeed(MAX_SPEED, 180);
    }
}

ballSp.setSpeed(MAX_SPEED, 160);

// ボールが左パドルに当たったら
if (ballSp.bounce(leftPaddleSp)) {
    // ボールの芯とパドルの芯のずれ。
    const swing = (ballSp.position.y - leftPaddleSp.position.y) / 3;
    // 左パドルの場合、角度は時計回りに大きくなるので、角度を大きくするにはswingを足す
    ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() + swing);
    print(ballSp.getDirection())
}

// ボールが右パドルに当たったら
if (ballSp.bounce(rightPaddleSp)) {
    const swing = (ballSp.position.y - rightPaddleSp.position.y) / 3;
    // 右パドルの場合、角度は反時計回りに大きくなるので、角度を大きくするにはswingを引く
    ballSp.setSpeed(MAX_SPEED, ballSp.getDirection() - swing);
}