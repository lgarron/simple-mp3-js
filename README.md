# Simple MP3 encoding demo in Javascript

Simple demo using [libmp3lame.js](https://github.com/akrennmair/libmp3lame-js), based on [speech-to-server](https://github.com/akrennmair/gspeech-to-server) by Andreas Krennmair.

Still too slow to be practical for [dancehack.com](http://www.dancehack.com/) or the [HTML5 Audio Editor](http://plucked.de/), but it's a start.

## Usage

I didn't want to deal with MagicWorker and the large compiled file, so:

- Start a server at the project directory or try the demo at <http://code.garron.us/simple-mp3-js/>
- Input a file (you can drag-drop onto "Choose File" in Chrome).
- Wait for short and long versions to render.

## Caveats

Probably only works in Chrome (maybe Safari), because that's the only audio decoding API I had code ready for.

