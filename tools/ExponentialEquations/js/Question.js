/* exported buildQuestionPrototype */
'use strict';

/**
    An exponential equation question.
    @method Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {String} promptLeftSide The prompt's left side of equation. Ex: '2^x ='.
    @param {String} promptRightSide The prompt's right side of equation. Ex: '32'.
    @param {String} expectedAnswer The expected answer from the user for this question.
    @param {String} explanation The explanation to this question.
    @param {String} placeholder The input's placeholder text.
    @param {String} inputPrefix A prefix text for the input box. Ex: 'x ='.
*/
function Question(promptLeftSide, promptRightSide, expectedAnswer, explanation, placeholder, inputPrefix) { // eslint-disable-line max-params
    this.promptLeftSide = promptLeftSide;
    this.promptRightSide = promptRightSide;
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.placeholder = placeholder;
    this.inputPrefix = inputPrefix;
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
        @return {Boolean} Whether the user's answer is a number.
    */
    Question.prototype.isInputFormatValid = function(userAnswer) {
        return (!isNaN(userAnswer) && (userAnswer !== ''));
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        const difference = Math.abs(parseFloat(userAnswer) - parseFloat(this.expectedAnswer));

        return (difference < 0.0001);   // eslint-disable-line no-magic-numbers
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
