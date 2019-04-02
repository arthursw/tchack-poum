var audioContext = Tone.context; // new (window.AudioContext || window.webkitAudioContext)();

var gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
gainNode.gain.value = 0.1;
let lastVolume = null
window.blur = 0;

export let synth = { volume: { value: 1} }

function triangle(t) {
	let v = Math.floor( (t / Math.PI) + 0.5 )
	return ( 2 / Math.PI ) * ( t - Math.PI * v ) * Math.pow(-1, v)
}

function square(t) {
	return Math.sign(Math.sin(t))
}

const sqrt2pi = Math.sqrt(2 * Math.PI)

function imageBlurRadiusToSigma(sigma) {
	return sigma / 4
}

function gaussian(t, sigma, mu=0) {
	let tmmos = (t - mu) / sigma
	return ( 1 / (sigma * sqrt2pi) ) * Math.exp( -0.5 * tmmos * tmmos )
}

let gaussianVector = []

function computeGaussianVector(sigma) {
	gaussianVector = []
	for (var i = -3*sigma ; i < 3*sigma ; i++) {
		gaussianVector.push(gaussian(i, sigma));
		console.log(gaussianVector[gaussianVector.length-1]);
	}
}

window.blurScale = 3;


// let GridUtils = function() {
  
//   var log10 = Math.log(10.)
//   function powOf10 (n) { 
//     return Math.floor(Math.log(n)/log10) 
//   }
 
//   return {
//     findNiceRoundStep: function (delta, preferedStep) {
//       var n = delta / preferedStep;
//       var p = powOf10(n);
//       var p10 = Math.pow(10, p);
//       var digit = n/p10;
 
//       if(digit<1.5)
//         digit = 1;
//       else if(digit<3.5)
//         digit = 2;
//       else if(digit < 7.5)
//         digit = 5;
//       else {
//         p += 1;
//         p10 = Math.pow(10, p);
//         digit = 1;
//       }
//       return digit * p10;
//     }
//   }
// }();

// function WaveformAnalyzer (audioNode, sampling) {
// 	this.audioNode = audioNode;
// 	this.analyser = audioContext.createAnalyser();
// 	this.setSampling(sampling);
// 	audioNode.connect(this.analyser);
// }

// WaveformAnalyzer.prototype = {
// 	setSampling: function (sampling) {
// 		this.array = new Uint8Array(sampling||256);
// 	},
// 	update: function () {
// 		this.analyser.getByteTimeDomainData(this.array);
// 	},
// 	render: function (ctx) {
// 		var length = this.array.length;
// 		var W = ctx.canvas.width;
// 		var H = ctx.canvas.height;
// 		var fy = function (y) {
// 			y = y/256; // normalize
// 			return (0.1+0.8*y) * H;
// 		}
		
// 		ctx.clearRect(0,0,W,H);
// 		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
// 		ctx.rect(0,0,W,H);
// 		ctx.fill();
// 		ctx.beginPath();
// 		ctx.strokeStyle = "#acd";
// 		ctx.moveTo(0, fy(this.array[0]));
// 		for (var i=0; i<length; ++i) {
// 			ctx.lineTo(W*i/length, fy(this.array[i]));
// 		}
// 		ctx.stroke();
		
// 		var interval = length/audioContext.sampleRate;
// 		var step = GridUtils.findNiceRoundStep(interval, 4);
// 		ctx.fillStyle = "#357";
// 		for (var i=step; i<interval; i+=step) {
// 			var text = i*1000;
// 			var x = W*i/interval;
// 			ctx.beginPath();
// 			ctx.moveTo(x, 0);
// 			ctx.lineTo(x, 5);
// 			ctx.stroke();
// 			ctx.textAlign = "center";
// 			ctx.textBaseline = "top";
// 			ctx.font = "8px sans-serif";
// 			ctx.fillText(text, x, 6);
// 		}
// 		ctx.textAlign = "right";
// 		ctx.fillStyle = "#79b";
// 		ctx.fillText("time in ms", W, 20);
// 		ctx.font = "8px sans-serif";
		
// 	}
// };

// let waveform = new WaveformAnalyzer(gainNode, 1000);


// create Oscillator node
// var oscillator = audioContext.createOscillator();
// oscillator.connect(audioContext.destination);
// oscillator.connect(gainNode);
// oscillator.type = 'square';
// oscillator.frequency.value = 440; // valeur en hertz

// window.oscillator = oscillator;

// var gui = new dat.GUI({ load: JSON });

// var volumeController = gui.add({volume: 0.01}, 'volume', 0, 1);

// volumeController.onChange(function(value) {
// 	gainNode.gain.value = value * value;
// });

// volumeController.onFinishChange(function(value) {
// 	gainNode.gain.value = value * value;
// });



// let canvas = document.getElementById("paperCanvas")
// canvas.width = $('body').width() / window.devicePixelRatio;
// canvas.height = $('body').height() / window.devicePixelRatio;

// let soundCanvas = document.getElementById("soundCanvas")
// soundCanvas.width = $('body').width() / window.devicePixelRatio;


let lineWidth = 3
var motifs = {
	MirroredTriangle: function(rectangle, group) {
		let fillColor = rectangle.strokeWidth == 0 ? 'black' : null;
		var p1 = new paper.Path({ strokeColor: 'black', strokeWidth: rectangle.strokeWidth, fillColor: fillColor });
		p1.add(rectangle.topCenter);
		p1.add(rectangle.rightCenter);
		p1.add(rectangle.leftCenter);
		group.addChild(p1);

		var p2 = new paper.Path({ strokeColor: 'black', strokeWidth: rectangle.strokeWidth, fillColor: fillColor});
		p2.add(rectangle.bottomCenter);
		p2.add(rectangle.leftCenter);
		p2.add(rectangle.rightCenter);
		group.addChild(p2);
		return {
			type: 'triangle',
			modulationType: 'triangle',
			modulationAmplitude: rectangle.width
		}
	},
	SimpleRectangle: function(rectangle, group) {
		var r =  new paper.Path.Rectangle(rectangle);
		r.strokeColor = 'black';
		if(rectangle.strokeWidth == 0) {
			r.fillColor = 'black';
			r.strokeWidth = 0;
		} else {
			r.strokeWidth = rectangle.strokeWidth;
		}
		group.addChild(r);
		return {
			type: 'square',
			modulationType: 'square',
			modulationAmplitude: rectangle.width
		}
	},
	Circle: function(rectangle, group) {
		let fillColor = rectangle.strokeWidth == 0 ? 'black' : null;
		var d = rectangle.width < rectangle.height ? rectangle.width : rectangle.height;
		var c =  new paper.Path.Circle(rectangle.center, d / 2);
		
		c.strokeColor = 'black';
		// c.strokeWidth = lineWidth;

		if(rectangle.strokeWidth == 0) {
			c.fillColor = 'black';
			c.strokeWidth = 0;
		} else {
			c.strokeWidth = rectangle.strokeWidth;
		}

		group.addChild(c);
		return {
			type: 'sine',
			modulationType: 'sine',
			modulationAmplitude: d / 2
		}
	},
	Line: function(rectangle, group) {
		var d = rectangle.width < rectangle.height ? rectangle.width : rectangle.height;
		var lineWidth = rectangle.strokeWidth == 0 ? d/10 : rectangle.strokeWidth; 
		// let fillColor = rectangle.strokeWidth == 0 ? 'black' : null;
		var p = new paper.Path({ strokeColor: 'black', strokeWidth: lineWidth });
		p.add(rectangle.bottomLeft.add(new paper.Point(lineWidth, -lineWidth)));
		p.add(rectangle.topCenter.add(new paper.Point(0, lineWidth)));
		p.add(rectangle.bottomRight.add(new paper.Point(-lineWidth, -lineWidth)));
		group.addChild(p);
		return {
			type: 'triangle',
			modulationType: 'sine',
			modulationAmplitude: d / 2
		}
	},
	// RectangleLines: function(rectangle, group) {
	// 	// group.addChild(new Path.Rectangle({ rectangle: rectangle, strokeWidth: 2, strokeColor: 'red' }))
	// 	let nLines = 10;
	// 	for(var i=0 ; i < nLines ; i++){
	// 		let p = new Path();
	// 		let y = rectangle.height * i / nLines
	// 		p.add(rectangle.topLeft.add(new Point(0, y)))
	// 		p.add(rectangle.topRight.add(new Point(0, y)))
	// 		p.strokeColor = 'black'
	// 		p.strokeWidth = lineWidth
	// 		group.addChild(p)
	// 	}
	// 	return {
	// 		type: 'rectangle',
	// 		modulationType: 'rectangle',
	// 		modulationAmplitude: rectangle.width
	// 	}
	// },
	// CircleLines: function(rectangle, group) {
	// 	// group.addChild(new Path.Rectangle({ rectangle: rectangle, strokeWidth: 2, strokeColor: 'red' }))
	// 	let nLines = 5
	// 	var d = rectangle.width < rectangle.height ? rectangle.width : rectangle.height;
	// 	for(let i=0 ; i<nLines ; i++) {
	// 		let p = new Path.Circle(rectangle.center, (d / 2) * i / nLines)
	// 		p.strokeColor = 'black'
	// 		p.strokeWidth = lineWidth
	// 		group.addChild(p)
	// 	}
	// 	return {
	// 		type: 'sine',
	// 		modulationType: 'sine',
	// 		modulationAmplitude: d / 2
	// 	}
	// },
	// TriangleLines: function(rectangle, group) {
	// 	// group.addChild(new Path.Rectangle({ rectangle: rectangle, strokeWidth: 2, strokeColor: 'red' }))
	// 	let nLines = 5
	// 	let x = 0
	// 	let y = 0
	// 	for(let i=0 ; i<nLines ; i++) {
	// 		let p = new Path()
	// 		p.strokeColor = 'black'
	// 		p.strokeWidth = lineWidth
	// 		p.add(rectangle.bottomLeft.add(new Point(x, -y)))
	// 		p.add(rectangle.bottomRight.add(new Point(-x, -y)))
	// 		group.addChild(p)
	// 		x += (rectangle.width / 2) / nLines
	// 		y += rectangle.height / nLines
	// 	}
	// 	return {
	// 		type: 'triangle',
	// 		modulationType: 'triangle',
	// 		modulationAmplitude: rectangle.width
	// 	}
	// }
}

//var shapeNames = ['SimpleRectangle', 'Circle', 'MirroredTriangle'];

var shapeNames = [];
for(var shapeName in motifs) {
	shapeNames.push(shapeName);
}

/*
// tests

var rectangle = new Rectangle(500, 50, 600, 200);
var rectangleStroke = new Path.Rectangle(rectangle);
rectangleStroke.strokeWidth = 1;
rectangleStroke.strokeColor = 'black';

motifs.Line(rectangle, new Group());

*/

// Totem generation

var rectangle = new paper.Rectangle(10, 10, 200, 250);

// var r =  new Path.Rectangle(rectangle;
// r.strokeColor = 'black';


rectangle.nHeight = 3;
rectangle.nWidth = 3;
rectangle.strokeWidth = 0;

// gui.remember(rectangle);

// gui.add(rectangle, 'width', 10, 1000);
// gui.add(rectangle, 'height', 10, 1000);
// gui.add(rectangle, 'nHeight', 1, 100);
// gui.add(rectangle, 'nWidth', 1, 100);
// gui.add(rectangle, 'strokeWidth', 0, 5).step(0.1);
// let canvasContext = canvas.getContext('2d');


// let soundCanvasContext = soundCanvas.getContext('2d');

window.waveDuration = 2000
// gui.add(window, 'waveDuration', 100, 10000);

// let blurController = gui.add(window, 'blur', 0, 100);
// gui.add(window, 'blurScale', 0, 100);

// blurController.onChange(function(value) {
// 	canvasContext.filter = "blur(" + value + "px)";

// 	let sigma = imageBlurRadiusToSigma(value);
// 	computeGaussianVector(sigma);
// });

// blurController.onFinishChange(function(value) {
// 	canvasContext.filter = "blur(" + value + "px)";

// 	let sigma = imageBlurRadiusToSigma(value);
// 	computeGaussianVector(sigma);
// });

// let showWaveformController = gui.add({showWaveform: true}, 'showWaveform');

// showWaveformController.onChange(function(value){
// 	$('#soundCanvas').toggleClass('hidden')
// })

// gui.add({saveSVG: function() {


// 	let svg = paper.project.exportSVG( { asString: true });

// 	// create an svg image, create a link to download the image, and click it
// 	let blob = new Blob([svg], {type: 'image/svg+xml'});
// 	let url = URL.createObjectURL(blob);
// 	let link = document.createElement("a");
// 	document.body.appendChild(link);
// 	link.download = 'flan.svg';
// 	link.href = url;
// 	link.click();
// 	document.body.removeChild(link);

// }}, 'saveSVG');

var marginSize = 2;
var stepY = rectangle.height / rectangle.nHeight;

var currentHeight = rectangle.top;
var shapeHeights = [];

function generateHeights() {
	shapeHeights = [];
	var totalRandomHeight = 0;
	for(var y=0 ; y < rectangle.nHeight ; y++) {
		var shapeHeight = Math.random();
		shapeHeights.push(shapeHeight);
		totalRandomHeight += shapeHeight;
	}
	var totalHeight = rectangle.height - (rectangle.nHeight - 1) * marginSize;
	for(var y=0 ; y < rectangle.nHeight ; y++) {
		shapeHeights[y] = totalHeight * shapeHeights[y] / totalRandomHeight;
	}
}



/*
for(var y=0 ; y < nHeight ; y++) {
	var shapeHeight = 0.1 * stepY + Math.random() * 2.5 * stepY;
	console.log("y: " + y);
	if((currentHeight + shapeHeight) > (rectangle.height + rectangle.top)) {
		shapeHeight = (rectangle.height + rectangle.top) - currentHeight;
		if(shapeHeight > 0) {
			shapeHeights.push(shapeHeight);
		}
		break;
	}
	shapeHeights.push(shapeHeight);
	currentHeight += shapeHeight + marginSize;
}
*/

function waouw(soundwave, bufferSize, frequency, type, modualtionFrequency, modulationType, modulationAmplitude, volume, duration) {

	let sfunction = type == 'sine' ? Math.sin : type == 'triangle' ? triangle : type == 'square' ? square : Math.sin
	let mfunction = modulationType == 'sine' ? Math.sin : modulationType == 'triangle' ? triangle : modulationType == 'square' ? square : Math.sin
	
	for (var i = 0 ; i < bufferSize ; i++) {
		let modulation = mfunction(2 * Math.PI * modualtionFrequency * i / bufferSize);
		// output[i] = sfunction(2 * Math.PI * frequency * modulation * i / bufferSize);
		soundwave[i] += volume * sfunction(2 * Math.PI * frequency * i / bufferSize + 1000 * modulation);
	}
}

var lowFrequency = 220;
var highFrequency = 220*8;

let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()

let lastTimePlayedNote = Tone.now()

let currentNotes = []

let chordDuration = Tone.Time('4n').toSeconds()

export function flan(noteNumber, velocity, time, duration, show, playSound) {
	
	let now = Tone.now()
    
    if(now - lastTimePlayedNote > chordDuration) {
        currentNotes = []
        lastTimePlayedNote = now
    }
    
    currentNotes.push(noteNumber)

	initializeFlan()

	rectangle.width = 450
	rectangle.height = 450
	
	// noteNumber = Math.max(noteNumber, noteMin)
	// noteNumber = Math.min(noteNumber, noteMax)
	// let nWidth = (noteNumber - noteMin) / (noteMax - noteMin)

	rectangle.nHeight = currentNotes.length //Math.max(1, Math.random() * 10)
	
	if(!velocity) {
		velocity = 0.75
	}

	rectangle.nWidth = duration * 20 * (velocity + 0.2)

	generateTotem(playSound, duration, noteNumber)

	group.position = paper.view.bounds.center

	group.visible = show
}

export function setHeight(value) {
	rectangle.nHeight = Math.max(1, value * 10);
}

function generateTotem(generateSound=false, duration, noteNumber){

	generateHeights();
	group.removeChildren();
	currentHeight = rectangle.top;
	var duration = 2*rectangle.width;

	
	// let note = Tone.Frequency(noteNumber, 'midi').toNote()
	// let notes = Tonal.Chord.notes(note, "maj7")

	var bufferSize = 1 * audioContext.sampleRate * duration / 1000,
		soundBuffer = null,
		output = null;

	if(generateSound) {
		soundBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
		output = soundBuffer.getChannelData(0);
		for (var i = 0 ; i < bufferSize ; i++) {
			output[i] = 0;
		}
	}
	let ny = 0
	for(var y=0 ; y < rectangle.nHeight ; y++) {
		var shapeHeight = shapeHeights[y];
		var nLocalWidth = Math.max(1, Math.ceil(Math.random() * rectangle.nWidth));
		var totalMargin = marginSize * (nLocalWidth-1);
		var shapeWidth = (rectangle.width - totalMargin) / nLocalWidth;
	
		var shapeNameIndex = Math.floor(Math.random() * shapeNames.length);
		var shapeName = shapeNames[shapeNameIndex];
		var motif = motifs[shapeName]
		var soundInfo = null
		for(var x=0 ; x < nLocalWidth ; x++) {
	
			var localRectangle = new paper.Rectangle(rectangle.left + x * (shapeWidth + marginSize), currentHeight, shapeWidth, shapeHeight);
			localRectangle.strokeWidth = rectangle.strokeWidth;
			soundInfo = motif(localRectangle, group);
		}
		currentHeight += shapeHeight + marginSize;
		if(generateSound) {
			
			let h = (currentHeight - rectangle.top) / rectangle.height;
			// let frequency = lowFrequency + h * (highFrequency - lowFrequency)
			let frequency = Tone.Frequency( currentNotes[ny++], 'midi' ).toFrequency()
			
			// frequency, type, modualtionFrequency, modulationType, volume
			waouw(output, bufferSize, frequency, soundInfo.type, nLocalWidth, soundInfo.modulationType, soundInfo.modulationAmplitude, 0.5, duration);
		}
	}


	if(generateSound) {

		if(window.blur > 0) {
			let sigma = imageBlurRadiusToSigma(window.blur)
			let radius = Math.max(3*sigma, 1)

			let blurredOutput = []
			for (var i = 0 ; i < bufferSize ; i++) {
				let total = 0
				for (var n = 0 ; n < gaussianVector.length ; n++) {
					let index = Math.floor(i + (n - radius));
					if(index < 0 || index >= bufferSize) {
						continue;
					}
					total += gaussianVector[n] * output[index]
				}
				blurredOutput.push(total * window.blurScale);
			}

			for (var i = 0 ; i < bufferSize ; i++) {
				output[i] = blurredOutput[i];
			}
		}


		let sound = audioContext.createBufferSource();
		sound.buffer = soundBuffer;
		sound.loop = false; 

		sound.connect(gainNode);
		sound.start();
		// waveform = new WaveformAnalyzer(sound, window.waveDuration);
	}
}
export var group = null
// let background = null
export function initializeFlan() {
	// if(background == null || background.parent != paper.project.activeLayer) {
	// 	background = new paper.Path.Rectangle(paper.view.bounds);
	// 	background.fillColor = 'whitesmoke'
	// }

	if(group == null) {
		group = new paper.Group()
	}
}
export function removeNotes() {
    
	group.removeChildren();
}
export function deactivateFlan() {
	if(group) {
		group.remove()
	}
	group = null
	// if(background) {
	// 	background.remove()
	// }
	// background = null
}

// view.onKeyDown = function(event) {
// 	// console.log(event.key);
// 	if(event.key == 'space') {
// 		pause = !pause;
// 		event.preventDefault();
// 		event.stopPropagation();
// 		return false;
// 	}
// 	if(event.key == 'up') {
// 		rectangle.nHeight += 1;
// 	} else if(event.key == 'down') {
// 		rectangle.nHeight -= 1;
// 	}
// 	if(rectangle.nHeight < 1) {
// 		rectangle.nHeight = 1;
// 	} else if(rectangle.nHeight > 100) {
// 		rectangle.nHeight = 100;
// 	}
// 	if(event.key == 'right') {
// 		rectangle.nWidth += 1;
// 	} else if(event.key == 'left') {
// 		rectangle.nWidth -= 1;
// 	}
// 	if(rectangle.nWidth < 1) {
// 		rectangle.nWidth = 1;
// 	} else if(rectangle.nWidth > 100) {
// 		rectangle.nWidth = 100;
// 	}
// }


var pause = false;
var generated = false;
// view.onFrame = function(event) {

// 	waveform.update();
// 	waveform.render(soundCanvasContext);

// 	if(pause) {
// 		if(generated) {
// 			return;
// 		} else {
// 			generateTotem(true);        
// 			generated = true;
// 		}
// 		return;
// 	}
// 	generated = false;
// 	generateTotem(false);
// }





export function activate() {
	initializeFlan()
}

export function noteOn(noteNumber, velocity, time, duration, show, playSound) {
	flan(noteNumber, velocity, time, duration, show, playSound)
}

export function noteOff(noteNumber, velocity, time, duration, show) {
}

export function deactivate() {
	deactivateFlan()
}

export function render(event) {
	if(synth.volume.value != lastVolume) {
		lastVolume = synth.volume.value
		gainNode.gain.value = Tone.dbToGain(synth.volume.value) * 0.1
	}
}

export async function controlchange(e) {
}

export function mouseMove(event) {
}

export function keyDown(event) {
}