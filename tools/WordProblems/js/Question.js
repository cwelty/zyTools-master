/**
    A word conversion question.
    @method Question
    @extends Question from singleInputQuestionProgressionTool
    @constructor
    @param {String} prompt The prompt of this question.
    @param {String} expectedAnswer  The expected answer from the user for this question.
    @param {String} explanation The explanation to this question.
    @param {String} placeholder The input's placeholder text.
    @param {Boolean} answerIsNumber Whether the answer is a number.
    @param {String} inputPrefix Optional prefix of user's text input.
    @param {String} inputPostfix Optional postfix of user's text input.
    @param {Boolean} useWideInput Whether to render a wide input. Default is false.
*/
function Question(prompt, expectedAnswer, explanation, placeholder, answerIsNumber, inputPrefix, inputPostfix, useWideInput) {
    this.prompt = prompt;
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.placeholder = placeholder;
    this.answerIsNumber = answerIsNumber;
    this.validAnswerExplanation = this.answerIsNumber ? 'A valid answer is a number.' : 'A valid answer format: 300 miles / 1 gallon';
    this.inputPrefix = inputPrefix;
    this.inputPostfix = inputPostfix;
    this.inputSize = !!useWideInput ? 20 : 5;
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
        if (this.answerIsNumber) {
            return (!isNaN(userAnswer) && (userAnswer !== ''));
        }
        else {
            return new RegExp('^\\d+miles/\\d+gallon$').test(userAnswer);
        }
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        if (this.answerIsNumber) {
            var difference = Math.abs(parseFloat(userAnswer) - parseFloat(this.expectedAnswer));
            return (difference < 0.0001);
        }
        else {
            return (userAnswer === require('utilities').removeWhitespace(this.expectedAnswer));
        }
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
