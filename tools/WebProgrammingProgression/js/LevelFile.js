/* global QuestionFile, Code */
/* exported LevelFile */
'use strict';

/**
    A parameterized file for a level in a progression webpage.
    @class LevelFile
*/
class LevelFile {

    /**
        Initialize a level file.
        @constructor
        @param {Object} fileJSON JSON representation of a file.
    */
    constructor(fileJSON) {

        /**
            The programming language in this file.
            @property language
            @type {String}
        */
        this.language = fileJSON.language;

        /**
            The name of this file.
            @property filename
            @type {String}
        */
        this.filename = fileJSON.filename;

        /**
            Whether the file should be hidden.
            @property isHidden
            @type {Boolean}
            @default false
        */
        this.isHidden = fileJSON.isHidden || false;

        /**
            The code inside the file.
            @property code
            @type {Object}
        */
        this.code = new Code(fileJSON.code);
    }

    /**
        Return the initial {QuestionFile} for this file.
        @method getInitialQuestionFile
        @param {Object} parameters The parameters to use to build the code for the program.
        @param {String} yourCodeGoesHereMessage The text indicating to the student where to enter their code.
        @return {QuestionFile} An initial file for the given parameters.
    */
    getInitialQuestionFile(parameters, yourCodeGoesHereMessage) {
        const questionFile = new QuestionFile(this, parameters, yourCodeGoesHereMessage);

        questionFile.placeholder = questionFile.placeholder.replace('<STUDENT_CODE>', yourCodeGoesHereMessage);

        return questionFile;
    }

    /**
        Return the expected {QuestionFile} for this file.
        @method getExpectedQuestionFile
        @param {Object} parameters The parameters to use to build the code for the program.
        @param {String} solution The solution code for this question.
        @return {QuestionFile} An expected file for the given parameters.
    */
    getExpectedQuestionFile(parameters, solution) {
        const questionFile = new QuestionFile(this, parameters);
        const hasPlaceholder = Boolean(questionFile.placeholder);

        questionFile.placeholder = hasPlaceholder ? solution : '';

        return questionFile;
    }
}
