'use strict';

/* exported ElementCheckbox */
/* global replaceStringVariables, replaceBackticks */

/**
    An {ElementCheckbox} models a checkbox.
    @class ElementCheckbox
    @extends Element
*/
class ElementCheckbox extends Element {

    /**
        @constructor
        @param {Object} elementCheckboxJSON JSON that models the checkbox.
        @param {Boolean} elementCheckboxJSON.correctAnswerIsCheckedString A string defining wether the correct answer for the checkbox is to be checked.
        @param {Array} [elementCheckboxJSON.label=''] The label associated with the checkbox.
    */
    constructor(elementCheckboxJSON) {
        super(elementCheckboxJSON);

        /**
            A string that defines wether the correct answer of the checkbox is to be checked or not.
            'false', '0' or '' means not checked is correct. Anything else is correct.
            @property correctAnswerIsCheckedString
            @type {String}
            @default ''
        */
        this.correctAnswerIsCheckedString = elementCheckboxJSON.correctAnswerIsCheckedString || '';

        /**
            Wether the correct answer of the checkbox is to be checked or not. This is calculated based on |correctAnswerIsCheckedString|.
            @property correctAnswerIsChecked
            @type {Boolean}
            @default false
        */
        this.correctAnswerIsChecked = false;

        /**
            The label assigned to the checkbox.
            @property label
            @type {String}
            @default ''
        */
        this.label = elementCheckboxJSON.label || '';

        /**
            The label as HTML.
            @property labelHTML
            @type {String}
            @default null
        */
        this.labelHTML = null;

        this.setCorrectAnswerIsChecked(this.correctAnswerIsCheckedString);
    }

    /**
        Set whether the correct answer is a checked checkbox.
        @method setCorrectAnswerIsChecked
        @param {String} correctAnswer The string for whether the correct answer is checked.
        @return {void}
    */
    setCorrectAnswerIsChecked(correctAnswer) {
        const falseValues = [ 'False', 'false', '', '0' ];

        this.correctAnswerIsChecked = !falseValues.includes(correctAnswer);
    }

    /**
        Return a clone of this checkbox.
        @method clone
        @return {ElementCheckbox} Copy of this element.
    */
    clone() {
        return new ElementCheckbox(this.toJSON());
    }

    /**
        Return JSON representing this checkbox.
        @method toJSON
        @return {Object} JSON representing this checkbox.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this);

        elementJSON.correctAnswerIsCheckedString = this.correctAnswerIsCheckedString;
        elementJSON.label = this.label;

        return elementJSON;
    }

    /**
        Update checkbox label with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @param {Boolean} inBuilderMode Whether this ProgressionPlayer instance was loaded by the ProgressionBuilder.
        @return {void}
    */
    updateWithCode(module, inBuilderMode) {
        this.label = replaceStringVariables(this.label, module);


        const result = replaceStringVariables(this.correctAnswerIsCheckedString, module);

        // Help CA implementer by checking whether boolean was passed for correctness.
        if (inBuilderMode) {
            const typedCorrectness = [ 'False', 'True' ].includes(this.correctAnswerIsCheckedString);
            const codeCorrectness = [ '0', '1' ].includes(result);
            const isValid = typedCorrectness || codeCorrectness;

            if (!isValid) {
                const message = `Checkbox\'s correctness must be True or False. Checkbox that does not: ${this.label}`;

                window.alert(message); // eslint-disable-line no-alert

                throw new Error(message);
            }
        }

        this.setCorrectAnswerIsChecked(result);
    }

    /**
        Prepare label for rendering.
        @method prepareForRendering
        @return {void}
    */
    prepareForRendering() {
        this.labelHTML = replaceBackticks(this.label);
    }
}
