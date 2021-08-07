/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    SIMPLE_POLYNOMIAL: 'A valid answer format is: 4x^2 + 4',
    POLYNOMIAL: 'A valid answer format is: -2x^2 + x + 3',
    POLYNOMIAL_MULTIVARIABLE: 'A valid answer format is: -3y^3 + 2x^2y - x + 1',
};

/**
    A question about polynomials.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {String} [args.expectedAnswer=''] The expected answer to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.polynomial=''] The given polynomial. Used for the scratchpad default value.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.POLYNOMIAL] The explanation on how a valid answer has to be formatted.
    @param {String} toolID Unique id for this tool.
*/
function Question(args = {}, toolID) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.POLYNOMIAL;
    this.needScratchPad = this.validAnswerExplanation !== VALID_ANSWER.SIMPLE_POLYNOMIAL;
    this.polynomial = 'polynomial' in args ? require('utilities').removeWhitespace(args.polynomial) : '';
    this.toolID = toolID;

    // Add spaces around operators. Ex: 4x^2+3(-2x-3)+2 -> 4x^2 + 3(-2x - 3) + 2
    this.polynomial = this.polynomial.replace(/\+/g, ' + ').replace(/([^\s\(])\-([\S])/g, '$1 - $2');
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
        const userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.SIMPLE_POLYNOMIAL:
            case VALID_ANSWER.POLYNOMIAL: {
                validRegExp = this._makeRegularExpressionWithVariables('x');
                break;
            }
            case VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE: {
                validRegExp = this._makeRegularExpressionWithVariables('xy');
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        return new RegExp(/^\s*$/).test(userAnswer) ? false : validRegExp.test(userNoWhitespace);
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
            case VALID_ANSWER.SIMPLE_POLYNOMIAL:
            case VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE:
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

    /**
        Make a regular expression for polynomials with the given valid variables.
        @method _makeRegularExpressionWithVariables
        @private
        @param {String} validVariables The variables to allow in the regular expression. Ex: 'x' or 'xy'
        @return {RegExp} A regular expression for a polynomial that can use the given valid variables.
    */
    Question.prototype._makeRegularExpressionWithVariables = function(validVariables) {

        // Ex: 3x^2+3y+2    3x^(2)+3y+2     -x^3-7
        return new RegExp(`^(([-]?[\\d]*[${validVariables}]?([\\^][(]?[\\d]+[)]?)?)*[+-]?)+$`);
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
