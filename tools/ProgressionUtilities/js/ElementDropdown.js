'use strict';

/* exported ElementDropdown */
/* global ElementDropdownOption, Element, getPythonVariableName, pythonVariableIsList, getValuesFromPythonList */

/**
    An {ElementDropdown} models an interactive dropdown.
    @class ElementDropdown
    @extends Element
*/
class ElementDropdown extends Element {

    /**
        @constructor
        @param {Object} elementDropdownJSON JSON that models a dropdown. See {Elements} for more properties.
        @param {Array} elementDropdownJSON.options Array of JSON that models each option.
        @param {String} [optionOrderingMethod='none'] Method in which to order the options. Valid values: 'none', 'random', and 'sort'
    */
    constructor(elementDropdownJSON) {
        super(elementDropdownJSON);

        const options = elementDropdownJSON.options ? elementDropdownJSON.options.slice() : [];

        this.options = options.map(optionJSON => new ElementDropdownOption(optionJSON));

        this.optionOrderingMethod = elementDropdownJSON.optionOrderingMethod || 'none';
    }

    /**
        Set |property| with |value|.
        @method _setProperty
        @private
        @param {String} property The property to be added.
        @param {Object} value The value of |property|.
        @return {void}
    */
    _setProperty(property, value) {

        // Convert options to {ElementDropdownOption}.
        if (property === 'options') {
            this.options = value.map(optionJSON => new ElementDropdownOption(optionJSON));
        }
        else {
            Element.prototype._setProperty.call(this, property, value); // eslint-disable-line no-underscore-dangle
        }
    }

    /**
        Return a clone of this element.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        return new ElementDropdown(this.toJSON());
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this);

        elementJSON.options = this.options.map(option => option.toJSON());
        elementJSON.optionOrderingMethod = this.optionOrderingMethod;

        return elementJSON;
    }

    /**
        Update each option with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        let newIncorrectOptions = [];

        this.options.forEach(option => {
            const varName = getPythonVariableName(option.text);

            if (option.isPythonList) {
                if (pythonVariableIsList(varName, module)) {
                    const listValues = getValuesFromPythonList(varName, module);

                    // Generate a new incorrect option for each value in the Python list.
                    newIncorrectOptions = listValues.map(value => {
                        const newOption = option.clone();

                        newOption.text = value;
                        newOption.isPythonList = false;
                        return newOption;
                    });
                }
                else {
                    alert(`Error: ${varName} is not a 1D list variable.`); // eslint-disable-line no-alert
                }
            }
            else {
                option.updateWithCode(module);
            }
        });

        // Remove the Python list from the available options, then add the options with the values of the python list.
        this.options = this.options.filter(option => !option.isPythonList);
        this.options = this.options.concat(newIncorrectOptions);
    }
}
