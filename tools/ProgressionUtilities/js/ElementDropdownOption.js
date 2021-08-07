'use strict';

/* exported ElementDropdownOption */
/* global replaceStringVariables */

/**
    {ElementDropdownOption} models an option in an {ElementDropdown}.
    @class ElementDropdownOption
*/
class ElementDropdownOption {

    /**
        @constructor
        @param {Object} elementDropdownOptionJSON Model of an option in a dropdown.
        @param {String} [elementDropdownOptionJSON.text=''] The displayed option.
        @param {Boolean} elementDropdownOptionJSON.isCorrectOption Whether this option is the correct answer.
        @param {Boolean} elementDropdownOptionJSON.isDefault Whether this element is the default selection.
        @param {Boolean} elementDropdownOptionJSON.isInvalidOption Whether this option is an invalid option.
        @param {Boolean} elementDropdownOptionJSON.isSelected Whether this option is currently selected.
        @param {Boolean} [elementDropdownOptionJSON.isPythonList=false] Whether the incorrect options are a Python list.
    */
    constructor(elementDropdownOptionJSON) {
        this.isCorrectOption = elementDropdownOptionJSON.isCorrectOption;
        this.isDefault = elementDropdownOptionJSON.isDefault;
        this.isInvalidOption = elementDropdownOptionJSON.isInvalidOption;
        this.isSelected = elementDropdownOptionJSON.isSelected;
        this.isPythonList = elementDropdownOptionJSON.isPythonList || false;

        const defaultText = this.isDefault ? 'Pick' : '';
        const pythonNotationText = require('utilities').getPythonNotation(elementDropdownOptionJSON.text);
        const textToSet = this.isPythonList ? pythonNotationText : elementDropdownOptionJSON.text;

        this.text = textToSet || defaultText;
    }

    /**
        Convert {ElementDropdownOption} into a JSON representation.
        @method toJSON
        @return {Object} JSON representation of an {ElementDropdownOption}.
    */
    toJSON() {
        return {
            text: this.text,
            isCorrectOption: this.isCorrectOption,
            isDefault: this.isDefault,
            isInvalidOption: this.isInvalidOption,
            isSelected: this.isSelected,
            isPythonList: this.isPythonList,
        };
    }

    /**
        Clones this instance of {ElementDropdownOption}.
        @method clone
        @return {ElementDropdownOption}
    */
    clone() {
        return new ElementDropdownOption(this.toJSON());
    }

    /**
        Update each option with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        this.text = replaceStringVariables(this.text, module);
    }
}
