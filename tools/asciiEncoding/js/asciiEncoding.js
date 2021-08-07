function AsciiEncoding() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.isPython = false;
        if (options && options['lang'] && (options['lang'] === 'python')) {
            this.isPython = true;
        }

        this.isUnicode = false;
        if (options && options['isUnicode']) {
            this.isUnicode = true;
        }

        var html = this[this.name]['template']({ id: this.id, isPython: this.isPython, isUnicode: this.isUnicode });
        $('#' + this.id).html(css + html);

        this.updateCharacterValue();

        var self = this;
        $('#asciiInput' + this.id).keyup(function() {
            self.updateCharacterValue();

            if (!self.beenSubmitted) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'ascii encode tool',
                    metadata: {
                        event: 'ascii encode tool used'
                    }
                };

                eventManager.postEvent(event);
            }

            self.beenSubmitted = true;
        });
    };

    this.updateCharacterValue = function() {
        var userInput = $('#asciiInput' + this.id).val();
        var characterOutput = String.fromCharCode(userInput);
        $('#charOutput' + this.id).val(characterOutput);
    };

    <%= grunt.file.read(hbs_output) %>
}

var asciiEncodingExport = {
    create: function() {
        return new AsciiEncoding();
    }
};
module.exports = asciiEncodingExport;
