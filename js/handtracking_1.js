/*
 * https://editor.p5js.org/LingDong-/sketches/1viPqbRMv
 */

var handposeModel = null;
var videoDataLoaded = false;

var statusText = "Loading handpose model...";

var myHands = [];

var capture;

let ghosts = [];

let segNum = 15,
	segLength = 20;

let palette = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"];

handpose.load().then(function (_model) {
	statusText = "Model loaded."
	handposeModel = _model;
})


function setup() {
	capture = createCapture(VIDEO);

	capture.elt.onloadeddata = function () {
		videoDataLoaded = true;
		createCanvas(capture.width * 0.5, capture.height * 0.5);
	}

	capture.hide();

	for (let i = 0; i < 5; i++) {
		ghosts.push(new Ghost(i));
	}
}

function detectHands(hands) {
	for (var i = 0; i < hands.length; i++) {
		var landmarks = hands[i].landmarks;
		let posA = [],
			posB = [];


		for (var j = 0; j < landmarks.length; j++) {
			var [x, y, z] = landmarks[j];

			if (j == 5) {
				posA = [x, y];
			}
			if (j == 17) {
				posB = [x, y];
			}


			if (j == 4 || j == 8 || j == 12 || j == 16 || j == 20) {
				var index = j / 4 - 1;
				ghosts[index].setPos(x, y);
			}
		}

		// 人差し指の付け根から小指の付け根まで
		let d = dist(posA[0], posA[1], posB[0], posB[1]);
		for (let i = 0; i < ghosts.length; i++) {
			ghosts[i].setSize(d * 0.5);
		}
	}
}

function draw() {
	if (handposeModel && videoDataLoaded) {
		handposeModel.estimateHands(capture.elt).then(function (_hands) {
			myHands = _hands;
			if (!myHands.length) {
				statusText = "Show some hands!"
			} else {
				statusText = "Confidence: " + (Math.round(myHands[0].handInViewConfidence * 1000) / 1000);
			}
		});
	}

	background(200);
	rectMode(CENTER);

	push();
	translate(width, 0);
	scale(-0.5, 0.5);
	image(capture, 0, 0, width * 2, height * 2);

	detectHands(myHands);

	for (let i = 0; i < ghosts.length; i++) {
		ghosts[i].draw();
	}

	pop();

	push();
	fill(255, 0, 0);
	text(statusText, 2, 60);
	pop();
}

class Ghost {
	constructor(index) {
		this.x = [];
		this.y = [];

		this.ox = 0;
		this.oy = 0;

		for (let i = 0; i < segNum; i++) {
			this.x[i] = this.oy;
			this.y[i] = this.oy;
		}

		this.c = palette[index];

		this.max = 80;

		this.sendX = 0;
		this.sendY = 0;
	}

	setPos(tmpX, tmpY) {
		this.sendX = tmpX;
		this.sendY = tmpY;
	}

	setSize(tmpS) {
		this.max = tmpS;
	}

	draw() {
		this.ox = this.sendX;
		this.oy = this.sendY;

		this.calcSegment(0, this.ox, this.oy);
		stroke(this.c);
		for (let i = 0; i < this.x.length - 1; i++) {
			strokeWeight(map(i, 0, this.x.length - 2, this.max, 1));
			this.calcSegment(i + 1, this.x[i], this.y[i]);
		}

		this.nx += 1;
		this.ny += 1;
	}

	calcSegment(i, xin, yin) {
		const dx = xin - this.x[i];
		const dy = yin - this.y[i];
		const angle = atan2(dy, dx);
		this.x[i] = xin - cos(angle) * segLength;
		this.y[i] = yin - sin(angle) * segLength;
		this.segment(this.x[i], this.y[i], angle);
	}

	segment(x, y, a) {
		push();
		translate(x, y);
		rotate(a);
		line(0, 0, segLength, 0);
		pop();
	}
}