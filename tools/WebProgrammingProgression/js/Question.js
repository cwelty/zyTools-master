/* exported Question */
'use strict';

/**
    A level.
    @class Question
*/
class Question {

    /**
        Initialize the Question.
        @constructor
        @param {Object} parameters Dictionary of the parameters for this question.
        @param {String} parameters.prompt The question's prompt.
        @param {Array} parameters.initialQuestionFiles {Array} of {QuestionFile}. The initial contents in the files in the question.
        @param {Array} parameters.expectedQuestionFiles {Array} of {QuestionFile}. The expected contents in the files in the question.
        @param {String} parameters.solution The solution to this question.
        @param {Array} parameters.unitTests The tests to assess correctness of user's answer.
        @param {Object} parameters.parameters The randomly-generated parameters of this question.
    */
    constructor(parameters) {

        /**
            The question's prompt.
            @property prompt
            @type {String}
        */
        this.prompt = parameters.prompt;

        /**
            The initial contents in the files in the question.
            @property initialQuestionFiles
            @type {Array}
        */
        this.initialQuestionFiles = parameters.initialQuestionFiles;

        /**
            The expected contents in the files in the question.
            @property expectedQuestionFiles
            @type {Array}
        */
        this.expectedQuestionFiles = parameters.expectedQuestionFiles;

        /**
            The solution to this question.
            @property solution
            @type {String}
        */
        this.solution = parameters.solution;

        /**
            The tests to assess correctness of user's answer.
            @property unitTests
            @type {Array}
        */
        this.unitTests = parameters.unitTests;

        /**
            The randomly-generated parameters of this question.
            @property parameters
            @type {Object}
        */
        this.parameters = parameters.parameters;
    }

    /**
        Return the list of {QuestionFile} that are not hidden.
        @method getShownFiles
        @return {Array} of {QuestionFile}. The {QuestionFile} that are not hidden.
    */
    getShownFiles() {
        return this.initialQuestionFiles.filter(file => !file.isHidden);
    }

    /**
        Return the {LevelFile} that student edits.
        @method getFileThatStudentEdits
        @return {LevelFile} The file that the student edits.
    */
    getFileThatStudentEdits() {
        return this.getShownFiles().find(file => file.placeholder);
    }

    /**
        Build the unit tests with the user's code.
        @method getUserUnitTests
        @param {String} userAnswer The user's code.
        @return {String} The unit tests with the user's code.
    */
    getUserUnitTests(userAnswer) {
        return this.makeUnitTests(userAnswer);
    }

    /**
        Build the unit tests with the expected code.
        @method getExpectedUnitTests
        @return {String} The unit tests with the expected code.
    */
    getExpectedUnitTests() {
        return this.makeUnitTests(this.solution);
    }

    /**
        Make the unit tests containing the editable code region and entire editable file.
        @method makeUnitTests
        @param {String} code The editable region of the file that has an editable region.
        @return {String} The unit tests.
    */
    makeUnitTests(code) {
        const codeParameters = { code };
        const unitTestParameters = $.extend({}, codeParameters, this.parameters);

        return this.unitTests.map(unitTest => unitTest(unitTestParameters));
    }
}
