/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    POINT: 'A valid answer format is: 5, 8',
    POINT_ARRAY: 'A valid answer format is: 2, 4',
    FRACTION: 'A valid answer format is: 7/2 or 3.5',
    EQUATION: 'A valid answer format is: ((x - 3)^2) / 36 - ((y + 2)^2) / 9',
};

/**
    A question about hyperbolas.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} args Some arguments that define the Question.
    @param {String} args.expectedAnswer The expected answer to this question.
    @param {String} args.explanation The explanation to this question's answer.
    @param {String} args.placeholder The input's placeholder text.
    @param {String} args.prompt The prompt of this question.
    @param {String} [args.inputPostfix=''] The input box's postfix.
    @param {String} [args.inputPrefix=''] The input box's prefix.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.POINT] The explanation on how a valid answer has to be formatted.
    @param {Boolean} [args.needScratchPad=false] Set to true if the level would benefit from a scratch pad.
*/
function Question(args) {
    this.expectedAnswer = args.expectedAnswer;
    this.explanation = args.explanation;
    this.placeholder = args.placeholder;
    this.prompt = args.prompt;
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.POINT;
    this.needScratchPad = this.validAnswerExplanation === VALID_ANSWER.EQUATION;
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
            case VALID_ANSWER.POINT_ARRAY:
            case VALID_ANSWER.POINT: {
                const userNoWhitespace = require('utilities').removeWhitespace(userAnswer);

                // Answer matches a point. Examples: 3,4 ; -1,2 ; -4,-7
                isValid = new RegExp(/^[-]?[\d]+,[-]?[\d]+$/).test(userNoWhitespace);
                break;
            }
            case VALID_ANSWER.FRACTION: {
                const userNoWhitespace = require('utilities').removeWhitespace(userAnswer);

                // Answer matches a fraction or a floating point number. Examples: -4.23 ; -4/8 ; 1.2 ; 9/7
                isValid = new RegExp(/^[-]?[\d]+[.]?[\d]*$/).test(userNoWhitespace);
                isValid = isValid || new RegExp(/^[-]?[\d]+\/[\d]+$/).test(userNoWhitespace);
                break;
            }
            case VALID_ANSWER.EQUATION: {
                const userNoWhitespace = require('utilities').removeWhitespace(userAnswer);

                // Answer matches standard form format. Examples: ((x - 2)^2) / 12 - ((y + 4)^2) / 8 ; ((x + 4)^2) / 4 - ((y - 2)^2) / 9
                isValid = new RegExp(/^\(\(x[+-][\d]+\)\^2\)\/[\d]+-\(\(y[+-][\d]+\)\^2\)\/[\d]+$/).test(userNoWhitespace);
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
            case VALID_ANSWER.EQUATION:
            case VALID_ANSWER.POINT: {
                correctAnswer = userNoWhitespace === require('utilities').removeWhitespace(this.expectedAnswer);
                break;
            }
            case VALID_ANSWER.FRACTION: {

                // If answer is a floating point number. Ex: 9.5 ; 1.85
                if (new RegExp(/^[-]?[\d]+[.]?[\d]*$/).test(userNoWhitespace)) {
                    correctAnswer = Boolean(this.expectedAnswer.find(answer => answer === parseFloat(userAnswer)));
                }

                // If answer is in fraction format. Ex: 8/4 ; -9/7
                else if (new RegExp(/^[-]?[\d]+\/[\d]+$/).test(userNoWhitespace)) {
                    const numerator = userNoWhitespace.split('/')[0];
                    const denominator = userNoWhitespace.split('/')[1];

                    correctAnswer = Boolean(this.expectedAnswer.find(answer => answer === (numerator / denominator)));
                }
                break;
            }
            case VALID_ANSWER.POINT_ARRAY: {
                correctAnswer = Boolean(this.expectedAnswer.find(answer => answer === userAnswer));
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
