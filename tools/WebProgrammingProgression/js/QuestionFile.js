/* exported QuestionFile */
'use strict';

/**
    An unparameterized file for a question in a progression webpage.
    @class QuestionFile
*/
class QuestionFile {

    /**
        Initializes the object.
        @constructor
        @param {LevelFile} file The level file used in a progression webpage.
        @param {Object} parameters Dictionary of parameter names and associated values for making strings from templates.
        @param {String} [yourCodeGoesHereMessage=''] The text indicating to the student where to enter their code.
    */
    constructor(file, parameters, yourCodeGoesHereMessage = '') {

        /**
            The programming language name in this file.
            @property language
            @type {String}
        */
        this.language = file.language;

        /**
            The name of this file.
            @property filename
            @type {String}
        */
        this.filename = file.filename;

        /**
            Whether the file should be hidden.
            @property isHidden
            @type {Boolean}
        */
        this.isHidden = file.isHidden;

        /**
            The code before the placeholder.
            @property prefix
            @type {String}
        */
        this.prefix = file.code.prefix(parameters);

        /**
            The text indicating to the student where to enter their code.
            @property yourCodeGoesHereMessage
            @type {String}
            @default ''
        */
        this.yourCodeGoesHereMessage = yourCodeGoesHereMessage;

        /**
            The code editable by the student.
            @property placeholder
            @type {String}
        */
        this.placeholder = file.code.placeholder(parameters);

        /**
            The code after the placeholder.
            @property postfix
            @type {String}
        */
        this.postfix = file.code.postfix(parameters);
    }

    /**
        Return the contents of the file.
        @method toContents
        @return {String} The contents of the file.
    */
    toContents() {
        return this.prefix + this.placeholder + this.postfix;
    }
}
