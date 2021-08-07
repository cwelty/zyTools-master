'use strict';

/* exported buildElementCheckboxControllerPrototype */
/* global ProgressionPlayerElementController */

/**
    Control a checkbox element.
    @class ElementCheckboxController
    @extends ProgressionPlayerElementController
*/
class ElementCheckboxController {

    /**
        Calls the {ProgressionPlayerElementController} constructor and renders this element.
        @constructor
    */
    constructor(...args) {

        // If there are arguments, then initialize the controller. Otherwise, the controller is being inherited, so don't initialize.
        if (args.length !== 0) {
            ProgressionPlayerElementController.prototype.constructor.apply(this, args);
            this.render();
            this._$element.click(() => {
                if (!this._$input.prop('disabled')) {
                    this._$input.prop('checked', !this._$input.prop('checked'));
                }
            });

        }
    }
}

/**
    Build the ElementCheckboxController prototype.
    @method buildElementCheckboxControllerPrototype
    @return {void}
*/
function buildElementCheckboxControllerPrototype() {
    ElementCheckboxController.prototype = new ProgressionPlayerElementController();
    ElementCheckboxController.prototype.constructor = ElementCheckboxController;

    /**
        Whether the element is assessed for correctness.
        @property isAssessedForCorrectness
        @type {Boolean}
        @default true
    */
    ElementCheckboxController.prototype.isAssessedForCorrectness = true;

    /**
        Whether the element supports being focused upon.
        @property doesSupportFocus
        @type {Boolean}
        @default true
    */
    ElementCheckboxController.prototype.doesSupportFocus = true;

    /**
        Move browser focus to the controller's interactive element.
        @method focus
        @return {void}
    */
    ElementCheckboxController.prototype.focus = function() {
        this._$input.focus();
    };

    /**
        Render the element and resize checkbox based on label's font size.
        @method render
        @return {void}
    */
    ElementCheckboxController.prototype.render = function() {
        ProgressionPlayerElementController.prototype.render.apply(this);

        // Get label's font size. Calculate checkbox size with a minimum and maximum size.
        const fontSize = parseInt(this._$element.find('label').first().css('font-size'), 10);

        // Add 0.5px of width and height for each px of font size above 10.
        const minSize = 10;
        let size = minSize;

        if (fontSize > minSize) {
            size = minSize + Math.floor((fontSize - minSize) / 2); // eslint-disable-line no-magic-numbers
        }

        // Change width and height of checkbox.
        this._$input = this._$element.find('input');
        this._$input.first().width(size).height(size);
    };

    /**
        Return whether the checkbox is correctly checked or unchecked.
        @method isCorrect
        @return {Boolean} True if it's correctly checked or unchecked.
    */
    ElementCheckboxController.prototype.isCorrect = function() {
        return this._elementRendered.correctAnswerIsChecked === this._$input.is(':checked');
    };

    /**
        Mark the checkbox as a wrong answer. Include the label.
        @method markAsWrongAnswer
        @return {void}
    */
    ElementCheckboxController.prototype.markAsWrongAnswer = function() {
        this._$element.addClass('wrong-answer');
    };

    /**
        Return the user's answer for this specific element.
        @method _elementSpecificUserAnswer
        @private
        @return {String} The user's answer.
    */
    ElementCheckboxController.prototype._elementSpecificUserAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._$input.is(':checked') ? 'checked' : 'unchecked';
    };

    /**
        Return the expected answer for this specific element.
        @method _elementSpecificExpectedAnswer
        @private
        @return {String} The user answer for this specific element.
    */
    ElementCheckboxController.prototype._elementSpecificExpectedAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._elementRendered.correctAnswerIsChecked ? 'checked' : 'unchecked';
    };

    /**
        Disable the checkbox.
        @method disable
        @return {void}
    */
    ElementCheckboxController.prototype.disable = function() {
        this._$input.prop('disabled', true);
    };

    /**
        Enable the checkbox.
        @method enable
        @return {void}
    */
    ElementCheckboxController.prototype.enable = function() {
        this._$input.prop('disabled', false);
    };

    /**
        Set the controller's answer with the given answer.
        @method setUserAnswer
        @param {Object} answer The answer to set.
        @return {void}
    */
    ElementCheckboxController.prototype.setAnswer = function(answer) {
        this._$input.prop('checked', answer === 'checked');
    };
}
