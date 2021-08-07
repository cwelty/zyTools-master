/* exported buildQuestionPrototype */
/* eslint linebreak-style:0 */
'use strict';

var ANSWER_TYPE = {
    NUMBER: 'A valid answer is a number.',
    VARIOUS_NUMBERS: 'A valid answer format: 2, 7, 9',
    SEQUENCE: 'A valid answer format: { 2, 7, 9, ...}',
    GENERAL_TERM_NO_PRODUCT: 'A valid answer format: n + 8',
    GENERAL_TERM: 'A valid answer format: 6n - 8',
};

/**
    A sequence problem question.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {String} prompt The prompt of this question.
    @param {String} expectedAnswer The expected answer from the user for this question.
    @param {String} explanation The explanation to this question.
    @param {String} placeholder The input's placeholder text.
*/
function Question(prompt, expectedAnswer, explanation, placeholder) {
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.placeholder = placeholder;
    this.prompt = prompt;
}

/**
    Build {Question}'s prototype after dependencies have loaded.
    @method buildQuestionPrototype
    @return {void}
*/
function buildQuestionPrototype() {
    Question.prototype = require('singleInputQuestionProgressionTool').getNewQuestion();
    Question.prototype.constructor = Question;

    /**
        Return whether the user's answer has the expected format.
        @method isInputFormatValid
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is in a valid format.
    */
    Question.prototype.isInputFormatValid = function(userAnswer) {
        var isValid = false;
        var userNoWhitespace = (this.answerIsNumber === ANSWER_TYPE.NUMBER) ? '' : require('utilities').removeWhitespace(userAnswer);

        switch (this.answerType) {
            case ANSWER_TYPE.NUMBER:
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;

            case ANSWER_TYPE.VARIOUS_NUMBERS:
                isValid = new RegExp('\\d+,\\d+,\\d+').test(userNoWhitespace);
                break;

            case ANSWER_TYPE.SEQUENCE:
                isValid = new RegExp('\\{\\d+,\\d+,\\d+,...\\}').test(userNoWhitespace);
                break;

            case ANSWER_TYPE.GENERAL_TERM_NO_PRODUCT:
                isValid = new RegExp('n\\+\\d+').test(userNoWhitespace);
                break;

            case ANSWER_TYPE.GENERAL_TERM:
                isValid = new RegExp('\\d+n\\-\\d+').test(userNoWhitespace);
                break;

            default:
                isValid = (userNoWhitespace !== '');
                break;
        }

        return isValid;
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        var correct = false;

        if (this.answerType === ANSWER_TYPE.NUMBER) {
            var difference = Math.abs(parseFloat(userAnswer) - parseFloat(this.expectedAnswer));

            correct = (difference === 0);
        }
        else {
            var expectedNoWhitespace = require('utilities').removeWhitespace(this.expectedAnswer);
            var userNoWhitespace = require('utilities').removeWhitespace(userAnswer);

            correct = (expectedNoWhitespace === userNoWhitespace);
        }

        return correct;
    };

    /**
        Return the explanation.
        @method getExplanation
        @return {String} The explanation.
    */
    Question.prototype.getExplanation = function() {
        return this.explanation;
    };

    /**
        Sets an input prefix and postfix.
        @method setInputPrefixAndPostfix
        @param {String} inputPrefix A prefix for the input box.
        @param {String} inputPostfix A postfix for the input box.
        @return {void}
    */
    Question.prototype.setInputPrefixAndPostfix = function(inputPrefix, inputPostfix) {
        this.inputPrefix = inputPrefix;
        this.inputPostfix = inputPostfix;
    };

    /**
        Sets the type of answer to be expected.
        @method setAnswerType
        @param {ANSWER_TYPE} answerType The type of answer to be expected.
        @return {void}
    */
    Question.prototype.setAnswerType = function(answerType) {
        this.answerType = answerType;
        this.validAnswerExplanation = this.answerType;
        this.isShortAnswer = (answerType === ANSWER_TYPE.NUMBER);
    };
}
