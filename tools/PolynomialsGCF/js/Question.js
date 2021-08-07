/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    NUMBER: 'A valid answer is a number.',
    VARIABLE_TERM: 'A valid answer format is: x^8',
    TERM: 'A valid answer format is: 4x',
    TERM_MULTIVARIABLE: 'A valid answer format is: 2xy',
    SIMPLE_POLYNOMIAL: 'A valid answer format is: x + 3',
    POLYNOMIAL: 'A valid answer format is: 2x^2 - x + 1',
};

/**
    A question about polynomials.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} [args={}] Some arguments that define the Question.
    @param {String} [args.expectedAnswer=''] The expected answer to this question.
    @param {String} [args.explanation=''] The explanation to this question's answer.
    @param {String} [args.inputPostfix=''] A postfix for the input box.
    @param {String} [args.inputPrefix=''] A prefix for the input box.
    @param {String} [args.placeholder=''] The input's placeholder text.
    @param {String} [args.prompt=''] The prompt of this question.
    @param {String} [args.validAnswerExplanation=VALID_ANSWER.POLYNOMIAL] The explanation on how a valid answer has to be formatted.
*/
function Question(args = {}) {
    this.expectedAnswer = 'expectedAnswer' in args ? args.expectedAnswer : '';
    this.explanation = 'explanation' in args ? args.explanation : '';
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.placeholder = 'placeholder' in args ? args.placeholder : '';
    this.prompt = 'prompt' in args ? args.prompt : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.POLYNOMIAL;
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
            case VALID_ANSWER.NUMBER: {
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;
            }
            case VALID_ANSWER.VARIABLE_TERM:
            case VALID_ANSWER.TERM:
            case VALID_ANSWER.TERM_MULTIVARIABLE: {
                validRegExp = new RegExp(/^[\d]*([xy]?([\^][(]?[\d]+[)]?)?){1,2}?$/);
                break;
            }
            case VALID_ANSWER.SIMPLE_POLYNOMIAL:
            case VALID_ANSWER.POLYNOMIAL: {
                validRegExp = new RegExp(/^(([-]?[\d]*[xy]?([\^][(]?[\d]+[)]?)?)*[+-]?)+$/);
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        if (this.validAnswerExplanation !== VALID_ANSWER.NUMBER) {
            isValid = validRegExp.test(userNoWhitespace);
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
        let userNoWhitespace = require('utilities').removeWhitespace(userAnswer).replace(/\u2212/g, '-');

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.NUMBER: {
                correctAnswer = (parseInt(userAnswer, 10) === parseInt(this.expectedAnswer, 10));
                break;
            }
            case VALID_ANSWER.VARIABLE_TERM:
            case VALID_ANSWER.TERM :
            case VALID_ANSWER.TERM_MULTIVARIABLE:
            case VALID_ANSWER.SIMPLE_POLYNOMIAL:
            case VALID_ANSWER.POLYNOMIAL: {
                const noParensAnswer = this.expectedAnswer.replace(/[()]/g, '');

                userNoWhitespace = this._mathematicallyEquivalentExpressions(userNoWhitespace);
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
        Substitutes mathematical equivalent expressions to the expected format.
        Ex: 5x^1 + x^0 -> 5x + 1
        @method _mathematicallyEquivalentExpressions
        @private
        @param {String} expression The mathematical expression.
        @return {String} A mathematically equivalent expression that can be accepted as the expected answer.
    */
    Question.prototype._mathematicallyEquivalentExpressions = function(expression) {

        // Ex: x^1 -> x     ; y ^ 1 -> y
        let equivalentExpression = expression.replace(/([xy])\s*\^\s*1\b/g, '$1');

        // Ex: 12x^0 -> 12  ; y^0 -> 1
        const xTo0WithIntegers = new RegExp(/(\d+)\s*[xy]\s*\^\s*0/g);

        // Ex: x^0 -> 1     ; y^0 -> 1
        const xTo0NoIntegers = new RegExp(/[xy]\s*\^\s*0/g);

        if (xTo0WithIntegers.test(equivalentExpression)) {
            equivalentExpression = equivalentExpression.replace(xTo0WithIntegers, '$1');
        }
        else {
            equivalentExpression = equivalentExpression.replace(xTo0NoIntegers, '1');
        }
        return equivalentExpression;
    };
}
