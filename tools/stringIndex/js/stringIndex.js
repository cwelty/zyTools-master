Handlebars.registerHelper('range', function(n, block) {
// Register the 'range' helper for use in HandleBars templates.
// 'range' works like range() in python, generating a sequence
// of integers from 0 to argument n-1.
//   Example Usage:
//   	{{range 10}}
//   		<div id="d{{this}}" />
//   	{{/range}}
//
//	The above outputs 10 divs having ids d0 - d9:
//		<div id="d0" />
//		<div id="d1" />
//		...
//		<div id="d9" />

    var accum = '';
    for (var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

function StringIndex() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.numberOfCharactersInString = 6;

        this.initialText = 'Trish';
        if(options && options['initial_text']) {
            this.initialText = options['initial_text'];
        }

        var html = this[this.name]['stringIndex']({
            name: this.name,
            id: this.id,
            initial_text: this.initialText,
            numberOfCharacters: this.numberOfCharactersInString
        });

        $('#' + this.id).html(css + html);

        var self = this;
        this.initialText.split('').forEach(function(character, index) {
            $(self.ID('outputValue' + index)).text(character);
        });

        $(this.ID('inputString')).on('input', function() {
            self.updateOutput();

            if (!self.beenSubmitted) {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'string index used'
                    }
                };

                self.eventManager.postEvent(event);
            }

            self.beenSubmitted = true;
        });
    };

    this.ID = function(s) {
        return '#' + this.name + '_' + s + this.id;
    };

    this.updateOutput = function() {
        var text = $(this.ID('inputString')).val();

        var self = this;
        text.split('').forEach(function(character, index) {
            $(self.ID('outputValue' + index)).text(character);
        });

        for (var i = text.length; i < this.numberOfCharactersInString; i++) {
            $(this.ID('outputValue' + i)).text(' ');
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var stringIndexExport = {
    create: function() {
        return new StringIndex();
    }
};
module.exports = stringIndexExport;
