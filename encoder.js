importScripts('libmp3lame.js');

var mp3codec;

function generateMP3(mp3codec, data) {

	var len = data.length;
	var rate = 44100; // TODO: Whee, hardcoding!

	var chunkFrac = 8;
	var CHUNK_SIZE = rate/chunkFrac;
	var encodedParts = [];
	var more;

	var end = len/CHUNK_SIZE;
	if (data.endSeconds) {
		end = data.endSeconds*chunkFrac;
	}

	for (var i = 0; i < end; i++) {
		self.postMessage({cmd: 'progress', name: data.name, fraction: i/end});

		//TODO: Handle partial last chunk.
		var leftChannel = data.left.subarray(i*CHUNK_SIZE, (i+1)*CHUNK_SIZE);
		var rightChannel = data.right.subarray(i*CHUNK_SIZE, (i+1)*CHUNK_SIZE);

		more = Lame.encode_buffer_ieee_float(mp3codec, leftChannel, rightChannel);
		encodedParts.push(more.data);
	}

	more = Lame.encode_flush(mp3codec);
	encodedParts.push(more.data);

	Lame.close(mp3codec);
	mp3codec = null;

	var blob = new Blob(encodedParts);
	var URL = webkitURL.createObjectURL(blob);
	self.postMessage({cmd: 'done', name: data.name, url: URL});
}

self.onmessage = function(e) {
	switch (e.data.cmd) {
	case 'init':
		if (!e.data.config) {
			e.data.config = { };
		}
		mp3codec = Lame.init();
		Lame.set_mode(mp3codec, e.data.config.mode || Lame.JOINT_STEREO);
		Lame.set_num_channels(mp3codec, e.data.config.channels || 2);
		Lame.set_out_samplerate(mp3codec, e.data.config.samplerate || 44100);
		Lame.set_bitrate(mp3codec, e.data.config.bitrate || 128);
		Lame.init_params(mp3codec);
		break;
	case 'encode':

		generateMP3(mp3codec, e.data);

		break;
	}
};