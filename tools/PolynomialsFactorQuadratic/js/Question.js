/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    FACTOR: 'A valid answer format is: (1, 9)',
    FACTORS: 'A valid answer format is: (1, 9), (3, 6)',
    TERM: 'A valid answer format is: 2x^3',
    SIMPLE_POLYNOMIAL: 'A valid answer format is: x + 3',
    BINOMIAL_PRODUCT: 'A valid answer format is: (x + 4)(x + 2)',
};

/**
    A question about polynomials.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {Array} [args.expectedAnswer=''] {Array} of {String} with possible answers to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.inputPostfix=''] A postfix for the input box.
    @param {String} [args.inputPrefix=''] A prefix for the input box.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.BINOMIAL_PRODUCT] The explanation on how a valid answer has to be formatted.
    @param {String} toolID Unique id for this tool.
*/
function Question(args = {}, toolID) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.BINOMIAL_PRODUCT;
    this.isLongAnswer = this.validAnswerExplanation === VALID_ANSWER.BINOMIAL_PRODUCT;
    this.isLongAnswer = this.isLongAnswer || this.validAnswerExplanation === VALID_ANSWER.FACTORS;
    this.needScratchPad = (this.validAnswerExplanation === VALID_ANSWER.BINOMIAL_PRODUCT) ||
                          (this.validAnswerExplanation === VALID_ANSWER.SIMPLE_POLYNOMIAL);
    this.toolID = toolID;
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
        let validRegExp = '';
        let isValid = false;
        const userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.FACTOR: {

                // Ex:  (3,4)  ;   (42,-3)
                validRegExp = new RegExp(/^\(-?[\d]+,-?[\d]+\)$/);
                break;
            }
            case VALID_ANSWER.FACTORS: {

                // Ex:  (2,-4),(-1,9)  ;   (-4,-1),(1,4),(-12,-32)
                validRegExp = new RegExp(/^(\(-?[\d]+,-?[\d]+\)[,]+)*(\(-?[\d]+,-?[\d]+\))$/);
                break;
            }
            case VALID_ANSWER.TERM: {

                // Ex:  2x^3    ;   -3x^(3)
                validRegExp = new RegExp(/^-?[\d]*([x]([\^][(]?[\d]+[)]?)?)?$/);
                break;
            }
            case VALID_ANSWER.SIMPLE_POLYNOMIAL: {

                // Ex:  x+3 ;   -x-5
                validRegExp = new RegExp(/^-?x[+-]+[\d]+$/);
                break;
            }
            case VALID_ANSWER.BINOMIAL_PRODUCT: {

                // Ex:  (x+4)(-x-2) ;   (x-3)(x+3)
                validRegExp = new RegExp(/^(\(-?x[+-]+[\d]+\)){2}$/);
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        isValid = validRegExp.test(userNoWhitespace);

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
            case VALID_ANSWER.FACTOR:
            case VALID_ANSWER.FACTORS: {
                correctAnswer = this.expectedAnswer.every(factor =>
                    (userNoWhitespace.includes(`${factor[0]},${factor[1]}`) || userNoWhitespace.includes(`${factor[1]},${factor[0]}`))
                );
                break;
            }
            case VALID_ANSWER.BINOMIAL_PRODUCT: {
                correctAnswer = this.expectedAnswer.some(possibleAnswer =>
                    userNoWhitespace === require('utilities').removeWhitespace(possibleAnswer)
                );
                break;
            }
            case VALID_ANSWER.SIMPLE_POLYNOMIAL: {
                this.expectedAnswer = require('utilities').removeWhitespace(this.expectedAnswer);
                correctAnswer = userNoWhitespace === this.expectedAnswer;
                break;
            }
            case VALID_ANSWER.TERM: {
                const noParensAnswer = this.expectedAnswer.replace(/[()]/g, '');

                this.expectedAnswer = require('utilities').removeWhitespace(this.expectedAnswer);
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

    /**
        Record the contents of the scratchpad.
        @method getMetadata
        @return {Object} The value of each recorded element. In this case only the scratchpad
    */
    Question.prototype.getMetadata = function() {
        const metadata = {};
        const $scratchpad = $(`#${this.toolID}-scratchpad`);

        if ($scratchpad.length > 0) {
            $.extend(metadata, {
                scratchpad: $scratchpad.val(),
            });
        }

        return metadata;
    };
}
