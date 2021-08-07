'use strict';

/**
    Build a string to character sequence converter.
    @module StrToCharSeq
*/
class StrToCharSeq {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned to this instance of the module.
            @property id
            @type {Number}
            @default null
        */
        this.id = null;

        /**
            The max number of characters in the character sequence.
            @property maxCharacters
            @type {Array} of {Integer}
            @default 6
        */
        this.maxCharacters = 6;

        /**
            The memory indexes shown to user.
            @property memoryIndexes
            @type {Array} of {Integer}
            @default [1, 2, 3, 4, 5, 6]
        */
        this.memoryIndexes = require('utilities').createArrayOfSizeN(this.maxCharacters)
                                                 .map((ignored, index) => index + 1);
    }

    /**
        Initialize the viewer.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.id = id;

        const html = this['<%= grunt.option("tool") %>'].template({ id, memoryIndexes: this.memoryIndexes });
        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        $(`#${this.id}`).html(html + css);

        const $input = $(`#stringInput${this.id}`);

        this.stringToCharacterSequence($input);

        const tinkerRecorder = require('utilities').makeTinkerRecorder(parentResource);

        $input.on('input', () => {
            this.stringToCharacterSequence($input);
            tinkerRecorder.record($input.val());
        });
    }

    /**
        Convert the input string to a character sequence.
        @method stringInput
        @param {Object} $input The string to convert to the character sequence.
        @return {void}
    */
    stringToCharacterSequence($input) {
        const characterSequence = $input.val().match(/(\\.|[^\\])/g) || [];

        /*
            If too many characters for the sequence, then reduce the string.
            Ex:
            (1) String is '\\\\' (2 character sequence). Input can have 4 more characters.
            (2) Paste 12345678 into input
            (3) Now input has 12345678
        */
        if (characterSequence.length > this.maxCharacters) {
            characterSequence.length = this.maxCharacters;
            $input.val(characterSequence.join(''));
        }

        this.memoryIndexes.forEach(index => {
            $(`#Str2mem${index}${this.id}`).val(characterSequence[index - 1]);
        });

        // Adjust the input size to account for escaped characters.
        const adjustedSize = this.maxCharacters + ($input.val().length - characterSequence.length);

        $input.attr('maxlength', adjustedSize)
              .attr('size', adjustedSize);
    }
}

module.exports = {
    create: function() {
        return new StrToCharSeq();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
