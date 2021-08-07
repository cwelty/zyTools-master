/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    NUMBER: 'A valid answer is a number.',
    POLYNOMIAL: 'A valid answer format is: -2x^3 - x^2 + x + 3',
};

/**
    A question about polynomials.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {String} [args.expectedAnswer=''] The expected answer to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.inputPostfix=''] The input box's postfix.
    @param {String} [args.inputPrefix=''] The input box's prefix.
    @param {Boolean} [args.isLongAnswer=false] True if the answer requires a long input box.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.NUMBER] The explanation on how a valid answer has to be formatted.
*/
function Question(args = {}) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.NUMBER;
    this.isLongAnswer = this.validAnswerExplanation === VALID_ANSWER.POLYNOMIAL;
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
        Return whether the user's answer is in a valid format.
        @method isInputFormatValid
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is in a valid format.
    */
    Question.prototype.isInputFormatValid = function(userAnswer) {
        let isValid = false;

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.NUMBER: {
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;
            }
            case VALID_ANSWER.POLYNOMIAL: {
                const userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');

                // 2x^(3)4y^(2)y-2x+7
                isValid = new RegExp(/^(([-]?[\d]*[a-z]?([\^][(]?[\d]+[)]?)?)*[+-]?)+$/).test(userNoWhitespace);
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        return new RegExp(/^\s*$/).test(userAnswer) ? false : isValid;
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        let correctAnswer = false;
        const userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.NUMBER: {
                correctAnswer = parseInt(userAnswer, 10) === this.expectedAnswer;
                break;
            }
            case VALID_ANSWER.POLYNOMIAL: {
                const noParensAnswer = this.expectedAnswer.replace(/[()]/g, '');

                // Correct answers may be: 3x^(3) + y^(2) or 3x^3 + y^2
                correctAnswer = userNoWhitespace === this.expectedAnswer;
                correctAnswer = correctAnswer || (userNoWhitespace === noParensAnswer);
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }
        return correctAnswer;
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
