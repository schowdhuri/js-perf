const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 10;

function getAvgColor(arr) {
	let r = 0;
	let g = 0;
	let b = 0;
	const num = arr.length;
	for(let i=0; i<num; i+=4) {
		r += arr[i  ] / 255;
		g += arr[i+1] / 255;
		b += arr[i+2] / 255;
	}
	const count = Math.ceil(num/4);
	r = Math.ceil(r * 255/count);
	g = Math.ceil(g * 255/count);
	b = Math.ceil(b * 256/count);
	return { r, g, b };
}

const Cell = ({ width, height, top, left, r, g, b }) => {
	const backgroundColor = `rgb(${r}, ${g}, ${b})`;
	const style = {
		backgroundColor,
		width,
		height,
		top,
		left
	};
	return (React.createElement("div", {
		className: "cell",
		style: style 
	}));
}

class Grid extends React.PureComponent {
	render() {
		const { cellState } = this.props;
		const cells = [];
		for(let x=0, i=0; x<CANVAS_WIDTH; x+=CELL_WIDTH, i++) {
			for(let y=0, j=0; y<CANVAS_HEIGHT; y+=CELL_HEIGHT, j++) {
				cells.push(React.createElement(Cell, {
					key: `cell-${i}-${j}`,
					left: x,
					top: y,
					width: CELL_WIDTH,
					height: CELL_HEIGHT,
					r: cellState[i][j].r,
					g: cellState[i][j].g,
					b: cellState[i][j].b
				}));
			}
		}
		return React.createElement("div", null, cells);
	}
};

class App extends React.PureComponent {
	constructor(props) {
		super(props);
		
		const cells = [];
		for(let x=0; x<CANVAS_WIDTH; x+=CELL_WIDTH) {
			cells[x/CELL_WIDTH] = [];
			for(let y=0; y<CANVAS_HEIGHT; y+=CELL_HEIGHT) {
				cells[x/CELL_WIDTH][y/CELL_HEIGHT] = {
					r: 255,
					g: 255,
					b:255
				};
			}
		}
		this.state = {
			cells,
			frameCount: 0,
			fps: 0,
			startTime: (new Date()).getTime()
		};

		this.paintFrame = this.paintFrame.bind(this);
		this.timerCallback = this.timerCallback.bind(this);
	}
	componentDidMount() {
		this.context = this.canvas.getContext("2d");
	}
	paintFrame(cells) {
		this.context.drawImage(this.video, 0, 0);
		for(let x=0, i=0; x<CANVAS_WIDTH; x+=CELL_WIDTH, i++) {
			for(let y=0, j=0; y<CANVAS_HEIGHT; y+=CELL_HEIGHT, j++) {
				const imageData = this.context.getImageData(x, y, CELL_WIDTH, CELL_HEIGHT);
				const pixels = imageData.data;
				cells[i][j] = getAvgColor(pixels);
			}
		}
		return cells;
	}
	timerCallback() {
		if(this.video.paused || this.video.ended) {
			return;
		}
		const cells = this.paintFrame([ ...this.state.cells ]);
		const now = (new Date()).getTime();
		if(now - this.state.startTime >= 1000) {
			this.setState({
				fps: this.state.frameCount,
				frameCount: 0,
				startTime: now,
				cells
			});
		} else {
			this.setState({
				frameCount: this.state.frameCount+1,
				cells
			});
		}
		requestAnimationFrame(this.timerCallback);
	}
	render() {
		return (React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				null,
				React.createElement("video", {
					ref: r => {
						this.video = r;
					},
					src: "media/video-01.mp4",
					controls: "true",
					onPlay: this.timerCallback })
			),
			React.createElement(
				"div",
				{ className: "framerate" },
				this.state.fps
			),
			React.createElement(
				"div",
				{ "className": "container", style: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } },
				React.createElement(Grid, {
					cellState: this.state.cells
				})
			),
			React.createElement("canvas", {
				className: "video-player",
				ref: r => {
					this.canvas = r;
				},
				width: CANVAS_WIDTH,
				height: CANVAS_HEIGHT })
		));
	}
};

function start () {
	ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
}

window.addEventListener("load", start, false);
