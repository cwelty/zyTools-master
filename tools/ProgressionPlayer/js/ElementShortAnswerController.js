'use strict';

/* exported ElementShortAnswerController, buildElementShortAnswerControllerPrototype */
/* global ProgressionPlayerElementController */

/**
    Control a short answer element.
    @class ElementShortAnswerController
    @extends ProgressionPlayerElementController
    @constructor
*/
function ElementShortAnswerController(...args) {
    if (args.length !== 0) {
        ProgressionPlayerElementController.prototype.constructor.apply(this, args);

        this._utilities = require('utilities');
        this.render();
    }
}

/**
    Build the ElementShortAnswerController prototype.
    @method buildElementShortAnswerControllerPrototype
    @return {void}
*/
function buildElementShortAnswerControllerPrototype() {
    ElementShortAnswerController.prototype = new ProgressionPlayerElementController();
    ElementShortAnswerController.prototype.constructor = ElementShortAnswerController;

    /**
        Render the element and listen for presses of the enter key.
        @method render
        @return {void}
    */
    ElementShortAnswerController.prototype.render = function() {
        ProgressionPlayerElementController.prototype.render.apply(this);

        this._$element.keypress(event => {
            if (event.which === this._utilities.ENTER_KEY) {
                this._progressionTool.check();
            }
        });
    };

    /**
        Whether the element is assessed for correctness.
        @property isAssessedForCorrectness
        @type {Boolean}
        @default true
    */
    ElementShortAnswerController.prototype.isAssessedForCorrectness = true;

    /**
        Whether the element supports being focused upon.
        @property doesSupportFocus
        @type {Boolean}
        @default true
    */
    ElementShortAnswerController.prototype.doesSupportFocus = true;

    /**
        Move browser focus to the controller's interactive element.
        @method focus
        @return {void}
    */
    ElementShortAnswerController.prototype.focus = function() {
        this._$element.find('input').focus();
    };

    /**
        Return whether the user's answer is correct.
        @method isCorrect
        @return {Boolean} True if the correct option is selected.
    */
    ElementShortAnswerController.prototype.isCorrect = function() {
        let isCorrect = false;

        switch (this._elementRendered.assessmentMethod) {
            case 'stringMatch':
                isCorrect = this._isCorrectStringMatch();
                break;
            case 'numericalMatch':
                isCorrect = this._isCorrectNumericalMatch();
                break;
            default:
                require('zyWebErrorManager').postError('Short answer element has unknown assessment method.');
                break;
        }

        return isCorrect;
    };

    /**
        Return whether the user's answer is correct according to string match rules.
        @method _isCorrectStringMatch
        @private
        @return {Boolean} Whether the user's answer is correct according to string match rules.
    */
    ElementShortAnswerController.prototype._isCorrectStringMatch = function() {
        const isCaseSensitive = this._elementRendered.assessmentProperties.caseSensitive;
        const userAnswer = this._processStringAnswer(this._elementSpecificUserAnswer(), isCaseSensitive);
        const correctAnswers = this._elementRendered.correctAnswers.map(correctAnswer =>
            this._processStringAnswer(correctAnswer, isCaseSensitive)
        );

        return correctAnswers.some(correctAnswer => userAnswer === correctAnswer);
    };

    /**
        Returns the passed string without surrounding whitespaces and in lower case if |isCaseSensitive| is set to false.
        @method _processStringAnswer
        @private
        @param {String} str The string to process.
        @param {Boolean} isCaseSensitive Whether the answer is case sensitive.
        @return {String}
    */
    ElementShortAnswerController.prototype._processStringAnswer = function(str, isCaseSensitive) {
        const noWhitespace = this._utilities.removeWhitespace(str);

        return isCaseSensitive ? noWhitespace : noWhitespace.toLowerCase();
    };

    /**
        Return whether the user's answer is correct according to numerical match rules.
        @method _isCorrectNumericalMatch
        @private
        @return {Boolean} Whether the user's answer is correct according to numerical match rules.
    */
    ElementShortAnswerController.prototype._isCorrectNumericalMatch = function() {
        const userAnswer = parseFloat(this._utilities.removeWhitespace(this._elementSpecificUserAnswer()));
        const percentage = this._elementRendered.assessmentProperties.tolerancePercentage;
        const useTolerancePercentage = percentage || (percentage === 0);
        const toleranceFraction = percentage / 100.0; // eslint-disable-line no-magic-numbers
        const absoluteValue = this._elementRendered.assessmentProperties.toleranceAbsoluteValue;

        return this._elementRendered.correctAnswers.some(correctAnswerString => {
            const correctAnswerNumber = parseFloat(correctAnswerString);
            const distance = Math.abs(correctAnswerNumber - userAnswer);
            const allowedDistance = useTolerancePercentage ? Math.abs(correctAnswerNumber * toleranceFraction) : absoluteValue;

            return distance <= allowedDistance;
        });
    };

    /**
        Return the user's answer for this specific element.
        @method _elementSpecificUserAnswer
        @private
        @return {String} The user's answer.
    */
    ElementShortAnswerController.prototype._elementSpecificUserAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._$element.find('input').val();
    };

    /**
        Return the expected answer for this specific element.
        @method _elementSpecificExpectedAnswer
        @private
        @return {Array} of {String} The user answer for this specific element.
    */
    ElementShortAnswerController.prototype._elementSpecificExpectedAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._elementRendered.correctAnswers;
    };

    /**
        Return whether an invalid answer was entered.
        @method isInvalidAnswer
        @return {Boolean} True if an invalid answer was entered.
    */
    ElementShortAnswerController.prototype.isInvalidAnswer = function() {
        return (this._elementSpecificUserAnswer() === '');
    };

    /**
        Disable the short answer.
        @method disable
        @return {void}
    */
    ElementShortAnswerController.prototype.disable = function() {
        this._$element.find('input').prop('disabled', true);
    };

    /**
        Enable the short answer.
        @method enable
        @return {void}
    */
    ElementShortAnswerController.prototype.enable = function() {
        this._$element.find('input').prop('disabled', false);
    };

    /**
        Set the controller's answer with the given answer.
        @method setUserAnswer
        @param {Object} answer The answer to set.
        @return {void}
    */
    ProgressionPlayerElementController.prototype.setAnswer = function(answer) {
        this._$element.find('input').val(answer);
    };
}
