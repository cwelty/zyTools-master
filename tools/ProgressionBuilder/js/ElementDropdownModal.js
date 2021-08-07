'use strict';

/* exported ElementDropdownModal */

/**
    Model for the modal to edit a dropdown element.
    @class ElementDropdownModal
*/
class ElementDropdownModal {

    /**
        @constructor
        @param {String} modalSelector The selector for the modal.
    */
    constructor(modalSelector) {
        this.$modal = $(modalSelector);
        this.$defaultOptionInput = this.$modal.find('input.default-option');
        this.$correctOptionInput = this.$modal.find('input.correct-option');
        this.$useListCheckbox = this.$modal.find('input#use-list');
        this.$incorrectListNameInput = this.$modal.find('input#incorrect-list-name');
        this.$incorrectOptionInputs = this.$modal.find('input.incorrect-option');
    }

    /**
        Returns the value entered in the default option input field.
        @method getDefaultOption
        @return {String}
    */
    getDefaultOption() {
        return this.$defaultOptionInput.val();
    }

    /**
        Returns the value entered in the correct option input field.
        @method getCorrectOption
        @return {String}
    */
    getCorrectOption() {
        return this.$correctOptionInput.val();
    }

    /**
        Returns the checkbox value to whether the a Python list is being used.
        @method isUsingPythonList
        @return {Boolean}
    */
    isUsingPythonList() {
        return this.$useListCheckbox.prop('checked');
    }

    /**
        Returns the python list name entered in the input field.
        @method getPythonListName
        @return {String}
    */
    getPythonListName() {
        return this.$incorrectListNameInput.val();
    }

    /**
        Returns an array with the values of the incorrect option input fields.
        @method getIncorrectOptions
        @return {Array<String>}
    */
    getIncorrectOptions() {
        this.$incorrectOptionInputs = this.$modal.find('input.incorrect-option');

        return this.$incorrectOptionInputs.filter((index, inputField) => inputField.value !== '')
                                          .map((index, inputField) => inputField.value)
                                          .toArray();
    }
}
