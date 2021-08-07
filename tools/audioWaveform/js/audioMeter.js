// The code is heavily modified from https://github.com/cwilso/volume-meter (MIT license)
function createAudioMeter() {

    // The modern API is AudioContext. Safari still uses webkitAudioContext, though.
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var mediaStreamSource = null;
    var audioMeter = audioContext.createScriptProcessor(512);
    audioMeter.volume = 0;

    // This will have no effect but works around a current Chrome bug.
    audioMeter.connect(audioContext.destination);

    audioMeter.start = function(stream) {
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        mediaStreamSource.connect(audioMeter);

        this.onaudioprocess = function(event) {
            var buffer = event.inputBuffer.getChannelData(0);
            var sumOfSquares = 0;

            // Compute sum of squares. |buffer| is a Float32Array, which doesn't support forEach, yet.
            for (var i = 0; i < buffer.length; ++i) {
                var element = buffer[i];
                sumOfSquares += (element * element);
            }

            // Update volume with square root of average sum of squares.
            this.volume = Math.sqrt(sumOfSquares / buffer.length);
        };
    };

    audioMeter.stop = function() {
        this.onaudioprocess = null;
    };

    return audioMeter;
}
