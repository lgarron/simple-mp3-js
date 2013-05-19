// Globals for debugging.
var myBlob;
var buffy;
var encodedBlob;
var theURL;
var theData;
var theFilename = "file";

var tags = {
	"short": "playTagShort",
	"full": "playTagFull"
};

function finalize(url, name) {
	console.log("Finalizing!");

	document.getElementById(tags[name]).src = url;
	document.getElementById(tags[name]+"Bar").value = 1;

	var downloadLink = document.createElement("a");
	downloadLink.href = url;
	downloadLink.download = theFilename + "-" + name + ".mp3";
	downloadLink.click();
}

function process(buffer) {

	console.log("Processing!", buffer);
	buffy = buffer;

	var config = {
		samplerate: buffer.sampleRate
	};

	console.log("Initializing encoder with ", config);

	onmsg = function(e) {
		console.log("onmessage: ", e.data);
		if(e.data.cmd == "progress") {
			document.getElementById(tags[e.data.name]+"Bar").value = e.data.fraction;
		}
		if(e.data.cmd == "done") {
			theURL = e.data.url;
			theData = e.data;
			finalize(e.data.url, e.data.name);
		}
	};

	var pm = {
		cmd: 'init',
		config: config
	};

	console.log("Sending.");

	var encoderShort = new Worker('encoder.js');
	encoderShort.onmessage = onmsg;
	encoderShort.postMessage(pm);
	encoderShort.postMessage({
		cmd: 'encode',
		length: buffy.length,
		left: buffy.getChannelData(0),
		right: buffy.getChannelData(1),
		"name": "short",
		"endSeconds": 6
	});

	var encoderLong = new Worker('encoder.js');
	encoderLong.onmessage = onmsg;
	encoderLong.postMessage(pm);
	encoderLong.postMessage({
		cmd: 'encode',
		length: buffy.length,
		left: buffy.getChannelData(0),
		right: buffy.getChannelData(1),
		name: "full"
	});
}

function goBlob(blob) {
	console.log("Blob: ", blob);

	var reader = new FileReader();

	reader.onload = function(fileEvent) {
		console.log("Reader returned: ", fileEvent.target.result);
		var context = new webkitAudioContext();
		context.decodeAudioData(fileEvent.target.result, process);
	};

	reader.readAsArrayBuffer(blob);

}

function xhrSource() {
	console.log("Added " + myAudioTag.src);
	var context = new webkitAudioContext();

	var xhr = new XMLHttpRequest();
	xhr.open('GET', myAudioTag.src, true);
	xhr.responseType = 'blob';

	xhr.onload = function(e) {
		console.log("XHR returned with status " + this.status);
		if(this.status == 200) {
			myBlob = this.response;
			goBlob(myBlob);
		}
	};
	xhr.send();
}

//xhrSource();

function goInput() {
	theFilename = document.getElementById("theInput").files[0].name;
	goBlob(document.getElementById("theInput").files[0]);
}
