/* exported buildQuestionPrototype */
'use strict';

/**
    A composition of functions question.
    @method Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {String} prompt The prompt of this question.
    @param {String} expectedAnswer The expected answer from the user for this question.
    @param {String} explanation The explanation to this question.
    @param {String} placeholder The input's placeholder text.
    @param {String} inputPrefix A prefix text for the input box. Ex: 'x ='.
    @param {Boolean} answerIsNumber Whether the answer is a number.
    @param {Array} [possibleAnswers=[expectedAnswer]] Array of Strings of possible answers. Ex: ['2t+3', '3+2t'].
    @param {String} promptLeftSide The prompt's left side of functions. Ex: 'f(x) ='.
    @param {String} promptRightSide The prompt's right side of functions. Ex: '2x+5'.
*/
function Question(prompt, expectedAnswer, explanation, placeholder, inputPrefix, answerIsNumber,    // eslint-disable-line max-params
                    possibleAnswers, promptLeftSide, promptRightSide) {
    this.prompt = prompt;
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.placeholder = placeholder;
    this.inputPrefix = inputPrefix;
    this.answerIsNumber = answerIsNumber;
    this.validAnswerExplanation = this.answerIsNumber ? 'A valid answer is a number.' : 'A valid answer format: 2t + 3';
    this.possibleAnswers = possibleAnswers || [ expectedAnswer ];
    this.promptLeftSide = promptLeftSide;
    this.promptRightSide = promptRightSide;
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
        Return whether the user's answer is a number.
        @method isInputFormatValid
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is in a valid format.
    */
    Question.prototype.isInputFormatValid = function(userAnswer) {
        if (this.answerIsNumber) {
            return (!isNaN(userAnswer) && (userAnswer !== ''));
        }
        const noWhitespace = require('utilities').removeWhitespace(userAnswer);

        return new RegExp('[\\+\\-]{0,1}[\\d]*[\\+\\-]{0,1}[\\d]*t[\\+\\-]{0,1}[\\d]*').test(noWhitespace);
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        if (this.answerIsNumber) {
            const difference = Math.abs(parseFloat(userAnswer) - parseFloat(this.expectedAnswer));

            return (difference < 0.0001);   // eslint-disable-line no-magic-numbers
        }
        const noWhitespace = require('utilities').removeWhitespace(userAnswer);

        return (this.possibleAnswers.indexOf(noWhitespace) !== -1);
    };

    /**
        Return the explanation.
        @method getExplanation
        @return {String} The explanation.
    */
    Question.prototype.getExplanation = function() {
        return this.explanation;
    };
}
