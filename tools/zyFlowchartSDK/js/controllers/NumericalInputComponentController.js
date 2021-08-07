'use strict';

/* exported NumericalInputComponentController */
/* global globalConstants */

/**
    Control a numerical input component.
    @class NumericalInputComponentController
*/
class NumericalInputComponentController {

    /**
        @constructor
        @param {NumericalInputComponent} input The numerical input component to control.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor(input, $containerDOM) {

        /**
            The numerical input component to control.
            @property input
            @type {NumericalInputComponent}
        */
        this.input = input;

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;

        /**
            Whether the input is editable.
            @property isEditable
            @type {Boolean}
            @default false
        */
        this.isEditable = false;

        // Register this controller with the input component so this controller gets updates when the input's value changes.
        this.input.registerController(this);
    }

    /**
        Render the numerical input component.
        @method render
        @return {void}
    */
    render() {
        const isEditable = (this.isEditable && this.input.isEditable) ? 'true' : 'false';

        this.$containerDOM.html(globalConstants.templates.input({ isEditable }));
        this.updatedInputString();

        // Inform the other registered input controllers that the input string may have changed.
        if (this.input.isEditable) {
            const $input = this.$containerDOM.find('.numerical-input');

            $input.blur(() => {
                this.input.userInput = $input.get(0).innerText;
                this.input.registeredControllers.forEach(controller => {
                    controller.updatedInputString();
                });
            });
        }
    }

    /**
        Inform this controller that the input string has changed.
        @method updatedInputString
        @return {void}
    */
    updatedInputString() {
        const $input = this.$containerDOM.find('.numerical-input');

        if (this.input.isEditable) {
            $input.get(0).innerText = this.input.userInput;
        }
        else {
            const numberOfConsumed = this.input.initialInputs.length - this.input.inputs.length;
            const consumedInputs = this.input.initialInputs.slice(0, numberOfConsumed);
            const consumedInputsHTML = consumedInputs.map(input => `<span class='consumed'>${input}</span>`);
            const inputsHTML = consumedInputsHTML.concat(this.input.inputs).join(' ');

            $input.html(inputsHTML);
        }
    }

    /**
        Set whether the input is editable.
        @method setIsEditable
        @param {Boolean} isEditable Whether the input is editable.
        @return {void}
    */
    setIsEditable(isEditable) {
        this.isEditable = isEditable;
    }
}
