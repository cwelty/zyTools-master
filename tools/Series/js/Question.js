/* exported buildQuestionPrototype */
'use strict';

/**
    A series problem question.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {String} expectedAnswer The expected answer from the user for this question.
    @param {String} explanation The explanation to this question.
    @param {String} inputPrefix A prefix for the input box.
    @param {String} placeholder The input's placeholder text.
    @param {String} prompt The prompt of this question.
*/
function Question(expectedAnswer, explanation, inputPrefix, placeholder, prompt) {
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.inputPrefix = inputPrefix;
    this.placeholder = placeholder;
    this.prompt = prompt;
    this.validAnswerExplanation = 'The answer should be an integer number.';
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
        return (/^-{0,1}\d+$/).test(userAnswer);
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        return (parseInt(userAnswer, 10) === parseInt(this.expectedAnswer, 10));
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
