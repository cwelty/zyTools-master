function AudioWaveform() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.utilities = require('utilities');
        this.$thisTool = $('#' + this.id);
        this.parentResource = parentResource;

        // If web audio is supported, then load the tool.
        if (this.webAudioIsSupported()) {
            var css = '<style><%= grunt.file.read(css_filename) %></style>';
            var html = this[this.name]['audioWaveform']({
                id: this.id
            });
            this.$thisTool.html(css + html);

            this.$songContainer = this.$thisTool.find('.song-container');
            this.$microphoneContainer = this.$thisTool.find('.microphone-container');

            // Microphone is also supported.
            if (this.microphoneIsSupported()) {
                this.loadMicrophoneAudioToWaveform();

                this.$songContainer.hide();

                this.segmentedControl = require('segmentedControl').create();
                var self = this;
                this.segmentedControl.init([ 'Microphone', 'Song' ], 'segmented-control-container-' + this.id, function(index, title) {
                    if (title === 'Microphone') {
                        self.$songContainer.hide();
                        self.$microphoneContainer.show();
                    }
                    else if (title === 'Song') {
                        self.$songContainer.show();
                        self.$microphoneContainer.hide();

                        if (!self.songAudioToWaveformIsLoaded) {
                            self.songAudioToWaveformIsLoaded = true;
                            self.loadSongAudioToWaveform();
                        }
                    }

                    self.reset();
                });
            }
            else {
                this.loadSongAudioToWaveform();
            }
        }
        else {
            this.showBrowserNotSupported();
        }
    };

    this.loadSongAudioToWaveform = function() {
        var html = this[this.name]['songWaveform']({
            id: this.id
        });
        this.$songContainer.html(html);

        // Cache commonly accessed DOM elements.
        this.$songButton = this.$thisTool.find('.song-button');
        this.$songButtonStatus = this.$thisTool.find('.song-button-status');
        this.$songErrorMessage = this.$thisTool.find('.song-error');

        this.utilities.disableButton(this.$songButton);
        this.startSpinner();
        this.$songErrorMessage.hide();

        if (this.segmentedControl) {
            this.segmentedControl.disable();
        }

        this.songWavesurfer = Object.create(WaveSurfer);
        this.songWavesurfer.init({
            container:     '#song-waveform-' + this.id,
            waveColor:     this.utilities.zyanteOrange,
            progressColor: this.utilities.zyanteDarkBlue,
            height:        200,
            interact:      false
        });

        this.songIsPlaying = false;
        var self = this;
        this.songWavesurfer.on('ready', function() {
            self.utilities.enableButton(self.$songButton);
            self.stopSpinner();

            if (self.segmentedControl) {
                self.segmentedControl.enable();
            }
        });

        this.songWavesurfer.on('error', function() {
            self.$songErrorMessage.show();
            self.stopSpinner();

            if (self.segmentedControl) {
                self.segmentedControl.enable();
            }
        });

        /*
            Aya Higuchi - Waltz in A minor, B. 150 is in public domain:
            https://musopen.org/music/1970/frederic-chopin/valse-melancolique-le-regret-op-332/
        */
        // WAV is supported by Chrome, Firefox, Safari, and Opera.
        var songURL = this.parentResource.getResourceURL('Aya Higuchi - Waltz in A minor, B. 150.wav', this.name);
        this.songWavesurfer.load(songURL);

        this.$songButton.click(function() {
            self.songIsPlaying = !self.songIsPlaying;

            if (self.songIsPlaying) {
                self.songWavesurfer.play();
                self.$songButtonStatus.text('Stop');
            }
            else {
                self.songWaveformReset();
            }

            self.submitActivityCompletion();
        });

        this.songWaveformReset();
    };

    this.loadMicrophoneAudioToWaveform = function() {
        var html = this[this.name]['micWaveform']({
            id: this.id
        });
        this.$microphoneContainer.html(html);

        // Cache commonly accessed DOM elements.
        this.$microphoneStatus = this.$thisTool.find('.microphone-status');
        this.$microphoneButton = this.$thisTool.find('.microphone-button');
        this.$microphoneButtonStatus = this.$thisTool.find('.microphone-button-status');
        this.$microphoneSourceNoVolume = this.$thisTool.find('.microphone-source-no-volume');

        // |wavesurfer| generates the waveform drawing.
        this.microphoneWavesurfer = Object.create(WaveSurfer);
        this.microphoneWavesurfer.init({
            container:   '#microphone-waveform-' + this.id,
            cursorWidth: 0,
            height:      200,
            interact:    false,
            waveColor:   this.utilities.zyanteOrange
        });

        // |microphone| feeds the browser's microphone digital signal to |wavesurfer|.
        this.microphone = Object.create(WaveSurfer.Microphone);
        this.microphone.init({
            wavesurfer: this.microphoneWavesurfer
        });

        // |audioMeter| computes the volume of the browser's microphone.
        this.audioMeter = createAudioMeter();

        // Toggle the microphone when the microphone button is clicked.
        this.microphoneIsOn = false;
        var self = this;
        this.$microphoneButton.click(function() {
            self.toggleMicrophone();
        });

        // |timeInterval| is set when the microphone starts.
        this.timeInterval = null;

        // Microphone was enabled.
        this.microphone.on('deviceReady', function(stream) {
            self.microphoneIsReady(stream);
        });

        // Microphone was not enabled.
        this.microphone.on('deviceError', function() {
            self.utilities.enableButton(self.$microphoneButton);
        });

        this.microphoneWaveformReset();
    };

    // Toggle the microphone and submit activity.
    this.toggleMicrophone = function() {
        this.microphoneIsOn = !this.microphoneIsOn;
        if (this.microphoneIsOn) {
            this.utilities.disableButton(this.$microphoneButton);
            this.microphone.start();
        }
        else {
            this.microphoneWaveformReset();
        }

        this.submitActivityCompletion();
    };

    /*
        Start processing the microphone's audio |stream|.
        |stream| is required and the microphone's audio stream.
    */
    this.microphoneIsReady = function(stream) {
        this.utilities.enableButton(this.$microphoneButton);
        this.$microphoneStatus.text('Microphone is on. Speak into your microphone.');
        this.$microphoneButtonStatus.text('Stop');
        this.audioMeter.start(stream);

        // If no audio for 3 seconds, then display message that microphone is not producing audio.
        var intervalMS = 50;
        var silenceThreshold = 3000;
        var totalSilentTime = 0;
        var self = this;
        this.timeInterval = window.setInterval(function() {
            if (self.audioMeter.volume === 0) {
                totalSilentTime += intervalMS;

                if (totalSilentTime >= silenceThreshold) {
                    self.$microphoneSourceNoVolume.show();
                }
            }
            else {
                self.$microphoneSourceNoVolume.hide();
                totalSilentTime = 0;
            }
        }, intervalMS);
    };

    // Show browser not supported message and submit activity.
    this.showBrowserNotSupported = function() {
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['browserNotSupported']({
            id: this.id
        });
        this.$thisTool.html(css + html);

        var self = this;
        $('#video-link-' + this.id).click(function() {
            self.submitActivityCompletion();
        });
    };

    // Submit activity completion once per tool loading.
    this.submitActivityCompletion = function() {
        if (!this.activityCompleted) {
            this.activityCompleted = true;

            var event = {
                answer:   'activity completed',
                complete: true,
                part:     0
            };

            this.parentResource.postEvent(event);
        }
    };

    // Return whether Web Audio is supported by the browser.
    this.webAudioIsSupported = function() {
        return WaveSurfer.WebAudio.supportsWebAudio();
    };

    // Return whether the microphone is supported by the browser.
    this.microphoneIsSupported = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    // Reset the DOM and internal elements of the microphone waveform.
    this.microphoneWaveformReset = function() {
        this.microphoneIsOn = false;
        this.microphone.stop();
        this.audioMeter.stop();
        this.$microphoneStatus.text('Microphone is off.');
        this.$microphoneButtonStatus.text('Start');
        this.$microphoneSourceNoVolume.hide();

        if (this.timeInterval) {
            window.clearInterval(this.timeInterval);
        }
        this.timeInterval = null;
    };

    // Reset the DOM and internal elements of the song waveform.
    this.songWaveformReset = function() {
        this.songIsPlaying = false;
        this.songWavesurfer.stop();
        this.$songButtonStatus.text('Play');
    };

    // Reset the DOM and internal elements.
    this.reset = function() {
        if (this.microphoneIsOn) {
            this.microphoneIsOn = false;
            this.microphoneWaveformReset();
        }

        if (this.songIsPlaying) {
            this.songWaveformReset();
        }
    };

    this.startSpinner = function() {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 5, // The length of each line
            width: 3, // The line thickness
            radius: 7, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#CC6600', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        var target = $('#spinner-' + this.id)[0];
        this.spinner = new Spinner(opts).spin(target);
    };

    this.stopSpinner = function() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var audioWaveformExport = {
    create: function() {
        return new AudioWaveform();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = audioWaveformExport;
