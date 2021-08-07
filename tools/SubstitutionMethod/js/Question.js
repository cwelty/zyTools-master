/* exported buildQuestionPrototype, setPrefix, setPostfix, setValidAnswerExplanation */
'use strict';

const ANSWER_TYPE = {
    NUMBER: 'A valid answer is a number.',
    ISOLATE: 'A valid answer format is: -3 + 4y',
    PAIR: 'A valid answer format is: 5, 8',
};

/**
    A system of equations to solve via substitution method.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Array} expectedAnswer Array of Strings with possible answers.
    @param {String} explanation The explanation to this question's answer.
    @param {String} placeholder The input's placeholder text.
    @param {String} prompt The prompt of this question.
*/
function Question(expectedAnswer, explanation, placeholder, prompt) {
    this.expectedAnswer = expectedAnswer;
    this.explanation = explanation;
    this.inputPrefix = '';
    this.inputPostfix = '';
    this.needScratchPad = false;
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
        let isValid = false;
        const userNoWhitespace = (this.answerIsNumber === ANSWER_TYPE.NUMBER) ? '' : require('utilities').removeWhitespace(userAnswer);

        switch (this.answerType) {
            case ANSWER_TYPE.NUMBER: {
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;
            }

            case ANSWER_TYPE.ISOLATE: {
                const numberThenY = new RegExp('[-]*[\\d]+[\\+\\-]+[\\d]*y').test(userNoWhitespace);
                const yThenNumber = new RegExp('[-]*[\\d]*y[\\+\\-]+[\\d]+').test(userNoWhitespace);

                isValid = numberThenY || yThenNumber;
                break;
            }

            case ANSWER_TYPE.PAIR: {
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
        const userNoWhitespace = (this.answerIsNumber === ANSWER_TYPE.NUMBER) ? '' : require('utilities').removeWhitespace(userAnswer);

        switch (this.answerType) {
            case ANSWER_TYPE.PAIR: {
                correctAnswer = (userNoWhitespace === this.expectedAnswer);
                break;
            }

            case ANSWER_TYPE.NUMBER: {
                correctAnswer = (parseInt(userAnswer, 10) === parseInt(this.expectedAnswer, 10));
                break;
            }

            case ANSWER_TYPE.ISOLATE: {
                if (this.expectedAnswer.indexOf(userAnswer) !== -1) {
                    correctAnswer = true;
                }
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
        Sets an input prefix and postfix.
        @method setInputPrefixAndPostfix
        @param {String} inputPrefix A prefix for the input box.
        @param {String} inputPostfix A postfix for the input box.
        @return {void}
    */
    Question.prototype.setInputPrefixAndPostfix = function(inputPrefix, inputPostfix) {
        this.inputPrefix = inputPrefix;
        this.inputPostfix = inputPostfix;
    };

    /**
        Sets the type of answer to be expected.
        @method setAnswerType
        @param {ANSWER_TYPE} answerType The type of answer to be expected.
        @return {void}
    */
    Question.prototype.setAnswerType = function(answerType) {
        this.answerType = answerType;
        this.validAnswerExplanation = this.answerType;
        this.needScratchPad = (this.answerType !== ANSWER_TYPE.ISOLATE);
    };
}
