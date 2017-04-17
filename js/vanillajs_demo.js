const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 10;

function getAvgColor(arr) {
	let r = 0, g = 0, b = 0, i;
	const num = arr.length;
	for(i=0; i<num; i+=4) {
		r += arr[i  ] / 255;
		g += arr[i+1] / 255;
		b += arr[i+2] / 255;
	}
	const count = Math.ceil(i/4);
	r = Math.ceil(r * 255/count);
	g = Math.ceil(g * 255/count);
	b = Math.ceil(b * 256/count);
	return `rgb(${r}, ${g}, ${b})`;
}

function getAvgColorHSL(arr) {
	let h = 0, s = 0, l = 0, i;
	const num = arr.length;
	for(i=0; i<num; i+=4) {
		const hsl = rgb2hsl(arr[i], arr[i+1], arr[i+2]);
		h += hsl[0] / 360;
		s += hsl[1];
		l += hsl[2];
	}
	const count = Math.ceil(i/4);
	h = Math.ceil(h * 360/count);
	s = Math.ceil(s * 100/count);
	l = Math.ceil(l * 100/count);
	return `hsl(${h}, ${s}%, ${l}%)`;
}

function rgb2hsl(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const cmax = r > g ? (r > b ? r : b) : (g > b ? g : b);
	const cmin = r < g ? (r < b ? r : b) : (g < b ? g : b);
	const delta = cmax - cmin;
	let h, s, l;
	if(delta==0) {
		h = 0
	} else if(cmax==r) {
		h = 60 * (((g-b)/delta) % 6);
	} else if(cmax==g) {
		h = 60 * (((b-r)/delta) + 2);
	} else {
		h = 60 * (((r-g)/delta) + 4);
	}
	if(h<0)
		h += 360;
	if(h>360)
		h-=360;
	l = (cmax + cmin)/2;
	s = delta==0 ? 0 : delta/(1 - Math.abs(2*l-1));
	return [ h, s, l ];
}

function prepareOutput() {
	const container = document.querySelector(".container");
	container.style.width = CANVAS_WIDTH + "px";
	container.style.height = CANVAS_HEIGHT + "px";
	let x, y;
	for(x=0; x<CANVAS_WIDTH; x+=CELL_WIDTH) {
		for(y=0; y<CANVAS_HEIGHT; y+=CELL_HEIGHT) {
			const cell = document.createElement("div");
			cell.className = "cell";
			cell.style.left = x + "px";
			cell.style.top = y + "px";
			cell.style.width = CELL_WIDTH + "px";
			cell.style.height = CELL_HEIGHT + "px";
			cell.id = `cell-${x}-${y}`;
			container.appendChild(cell);
		}
	}
}

function start () {
	const canvas = document.getElementById("video-player");
	const context = canvas.getContext("2d");
	const video = document.getElementById("video");
	const fpsDiv = document.getElementById("framerate");
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	let startTime = (new Date()).getTime();
	let frameCount = 0;

	function paintFrame() {
		context.drawImage(video, 0, 0);
		let x, y;
		for(x=0; x<CANVAS_WIDTH; x+=CELL_WIDTH) {
			for(y=0; y<CANVAS_HEIGHT; y+=CELL_HEIGHT) {
				const imageData = context.getImageData(x, y, CELL_WIDTH, CELL_HEIGHT);
				const pixels = imageData.data;
				const cell = document.getElementById(`cell-${x}-${y}`);
				cell.style.backgroundColor = getAvgColor(pixels);
			}
		}
	}
	function timerCallback() {
		if (video.paused || video.ended) {
			return;
		}
		paintFrame();
		const now = (new Date()).getTime();
		if(now - startTime >= 1000) {
			fpsDiv.innerHTML = frameCount;
			frameCount = 0;
			startTime = now;
		} else {
			++frameCount;
			// console.log(frameCount, now - startTime);
		}
		requestAnimationFrame(timerCallback);
	}
	prepareOutput();
	video.addEventListener("play", function() {

		timerCallback();
	}, false);
	// loadCanvas("media/01.jpg").then(paintCells);
}

window.addEventListener("load", start, false);
