/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    NUMBER: 'A valid answer is a number.',
    EQUATION: 'A valid answer format is: 2(x - 2)^2 - 5 or 2(y - 2)^2 - 5',
    POINT: 'A valid answer format is: 5, 8',
};

/**
    A question about parabolas.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {String} [args.expectedAnswer=''] The expected answer to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.inputPostfix=''] The input box's postfix.
    @param {String} [args.inputPrefix=''] The input box's prefix.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=''] The explanation on how a valid answer has to be formatted.
*/
function Question(args = {}) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.NUMBER;

    this.needScratchPad = (this.validAnswerExplanation === VALID_ANSWER.EQUATION);
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
        let isValid = false;
        const userNoWhitespace = (this.answerIsNumber === VALID_ANSWER.NUMBER) ? '' : require('utilities').removeWhitespace(userAnswer);

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.NUMBER: {
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;
            }

            case VALID_ANSWER.EQUATION: {
                const equationX = new RegExp('[-]{0,1}[\\d]\\(x[+-]{1}[\\d]+\\)\\^2[+-]{1}[\\d]+').test(userNoWhitespace);
                const equationY = new RegExp('[-]{0,1}[\\d]\\(y[+-]{1}[\\d]+\\)\\^2[+-]{1}[\\d]+').test(userNoWhitespace);

                isValid = equationX || equationY;
                break;
            }

            case VALID_ANSWER.POINT: {
                isValid = new RegExp('[-]{0,1}[\\d]+,[-]{0,1}[\\d]+').test(userNoWhitespace);
                break;
            }

            default: {
                throw new Error('Answer type not supported');
            }
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
        let correctAnswer = false;
        const userNoWhitespace = require('utilities').removeWhitespace(userAnswer);

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.POINT:
            case VALID_ANSWER.EQUATION: {
                correctAnswer = userNoWhitespace === require('utilities').removeWhitespace(this.expectedAnswer);
                break;
            }

            case VALID_ANSWER.NUMBER: {
                correctAnswer = (parseInt(userAnswer, 10) === parseInt(this.expectedAnswer, 10));
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
