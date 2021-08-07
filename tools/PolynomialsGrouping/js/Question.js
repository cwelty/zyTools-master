/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    GROUPING_GCF: 'A valid answer format is: 2x(8y + 6) + 4(6y + 12)',
    BINOMIAL_PRODUCT: 'A valid answer format is: (2x + 4)(3x + 2)',
    FACTOR_HIGH_ORDER: 'A valid answer format is: (8x + 4)(7x^2 + 1)',
};

/**
    A question about polynomials.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {Array} [args.expectedAnswer=''] {Array} of {String} with possible answers to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.BINOMIAL_PRODUCT] The explanation on how a valid answer has to be formatted.
    @param {String} toolID Unique id for this tool.
*/
function Question(args = {}, toolID) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.BINOMIAL_PRODUCT;
    this.polynomial = 'polynomial' in args ? require('utilities').removeWhitespace(args.polynomial) : '';
    this.toolID = toolID;

    // Add spaces around operators. Ex: 4x^2+3(-2x-3)+2 -> 4x^2 + 3(-2x - 3) + 2
    this.polynomial = this.polynomial.replace(/\+/g, ' + ').replace(/([^\s\(])\-([\S])/g, '$1 - $2');
    this.polynomial = this.polynomial.replace(/\^\(([\d]+)\)/g, '^$1');
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
            case VALID_ANSWER.GROUPING_GCF: {

                // Ex:  2x(3y + 1) + 2(3y + 1)
                validRegExp = new RegExp(/^([-+]?[\dxy]+\([\dxy]+\+[\dxy]+\)){2}$/);
                break;
            }
            case VALID_ANSWER.BINOMIAL_PRODUCT: {

                // Ex:  (x+4)(-x-2) ;   (x-3)(x+3)
                validRegExp = new RegExp(/^(\(-?[\dxy]+[+-]+[\dxy]+\)){2}$/);
                break;
            }
            case VALID_ANSWER.FACTOR_HIGH_ORDER: {

                // Ex:  (4x + 3)(5x^2 + 2)  ; (12y + 2)(3y^2 + 5)
                validRegExp = new RegExp(/(\(-?[\dxy]+(\^[\d]+)?[+-]+[\dxy]+(\^[\d]+)?\)){2}$/);
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
        const userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');
        const correctAnswer = this.expectedAnswer.some(possibleAnswer =>
            userNoWhitespace === require('utilities').removeWhitespace(possibleAnswer)
        );

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
        Set the button functionality. On click, copy the polynomial to the scratchpad.
        @method generateProblemPostProcess
        @return {void}
    */
    Question.prototype.generateProblemPostProcess = function() {
        const $button = $(`#${this.toolID}-copy-button`);
        const $scratchpad = $(`#${this.toolID}-scratchpad`);

        $button.click(() => {
            $scratchpad.val($scratchpad.val() + this.polynomial);
        });
        return;
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
