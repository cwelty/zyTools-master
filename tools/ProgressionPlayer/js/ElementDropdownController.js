'use strict';

/* exported buildElementDropdownControllerPrototype */
/* global ProgressionPlayerElementController */

/**
    Control a dropdown element.
    @class ElementDropdownController
    @extends ProgressionPlayerElementController
*/
class ElementDropdownController {

    /**
        Calls the {ProgressionPlayerElementController} constructor and renders this element.
        @constructor
    */
    constructor(...args) {
        if (args.length !== 0) {
            ProgressionPlayerElementController.prototype.constructor.apply(this, args);

            // Set each option's isSelected to that option's isDefault.
            this._elementRendered.options.forEach(option => {
                option.isSelected = option.isDefault;
            });
            const method = this._elementRendered.optionOrderingMethod;
            const firstOption = this._elementRendered.options.shift();

            // Sort the non-invalid options by the text.
            if (method.includes('sort')) {
                this._elementRendered.options.sort((aOption, bOption) => {
                    let value = 0;

                    if (aOption.text > bOption.text) {
                        value = 1;
                    }
                    else if (aOption.text < bOption.text) {
                        value = -1;
                    }

                    return value;
                });

                // Reverse the order if we wanted reverse sort.
                if (method === 'reverse-sort') {
                    this._elementRendered.options.reverse();
                }
            }

            // Randomly order the non-invalid options.
            else if (method === 'random') {
                require('utilities').shuffleArray(this._elementRendered.options);
            }

            this._elementRendered.options.unshift(firstOption);
            this.render();
        }
    }
}

/**
    Build the ElementDropdownController prototype.
    @method buildElementDropdownControllerPrototype
    @return {void}
*/
function buildElementDropdownControllerPrototype() {
    ElementDropdownController.prototype = new ProgressionPlayerElementController();
    ElementDropdownController.prototype.constructor = ElementDropdownController;

    /**
        Render the element and listen to changes on the dropdown.
        @method render
        @return {void}
    */
    ElementDropdownController.prototype.render = function() {
        ProgressionPlayerElementController.prototype.render.apply(this);

        this._$element.find('select').change(() => {

            // Set all options' |isSelected| to false.
            this._elementRendered.options.forEach(option => {
                option.isSelected = false;
            });

            // Set |isSelected| of selected option to true.
            const indexOfSelectedOptions = this._$element.find('option:selected').index();

            this._elementRendered.options[indexOfSelectedOptions].isSelected = true;
        });
    };

    /**
        Whether the element is assessed for correctness.
        @property isAssessedForCorrectness
        @type {Boolean}
        @default true
    */
    ElementDropdownController.prototype.isAssessedForCorrectness = true;

    /**
        Whether the element supports being focused upon.
        @property doesSupportFocus
        @type {Boolean}
        @default true
    */
    ElementDropdownController.prototype.doesSupportFocus = true;

    /**
        Move browser focus to the controller's interactive element.
        @method focus
        @return {void}
    */
    ElementDropdownController.prototype.focus = function() {
        this._$element.find('select').focus();
    };

    /**
        Return whether the correct option is selected.
        @method isCorrect
        @return {Boolean} True if the correct option is selected.
    */
    ElementDropdownController.prototype.isCorrect = function() {
        return this._elementRendered.options.some(option => (option.isSelected && option.isCorrectOption));
    };

    /**
        Return the selected option in the dropdown.
        @method _getSelectedOption
        @return {ElementDropdownOption} The selected option.
    */
    ElementDropdownController.prototype._getSelectedOption = function() { // eslint-disable-line no-underscore-dangle
        return this._elementRendered.options.filter(option => option.isSelected)[0];
    };

    /**
        Return whether an invalid option is selected.
        @method isValidAnswer
        @return {Boolean} True if an invalid option is selected.
    */
    ElementDropdownController.prototype.isInvalidAnswer = function() {
        return this._getSelectedOption().isInvalidOption;
    };

    /**
        Return the user's answer for this specific element.
        @method _elementSpecificUserAnswer
        @private
        @return {String} The user's answer.
    */
    ElementDropdownController.prototype._elementSpecificUserAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._getSelectedOption().text;
    };

    /**
        Return the expected answer for this specific element.
        @method _elementSpecificExpectedAnswer
        @private
        @return {String} The user answer for this specific element.
    */
    ElementDropdownController.prototype._elementSpecificExpectedAnswer = function() { // eslint-disable-line no-underscore-dangle
        return this._elementRendered.options.find(option => option.isCorrectOption).text;
    };

    /**
        Disable the dropdown.
        @method disable
        @return {void}
    */
    ElementDropdownController.prototype.disable = function() {
        this._$element.find('select').prop('disabled', true);
    };

    /**
        Enable the dropdown.
        @method enable
        @return {void}
    */
    ElementDropdownController.prototype.enable = function() {
        this._$element.find('select').prop('disabled', false);
    };

    /**
        Set the controller's answer with the given answer.
        @method setUserAnswer
        @param {Object} answer The answer to set.
        @return {void}
    */
    ElementDropdownController.prototype.setAnswer = function(answer) {
        this._$element.find('select').val(answer).change();
    };
}
