'use strict';

/* exported NumericalInputComponent */

/**
    Model a component wherein the user can enter numerical values separated by spaces.
    @class NumericalInputComponent
*/
class NumericalInputComponent {

    /**
        @constructor
        @param {String} userInput The initial input to set.
    */
    constructor(userInput) {

        /**
            The input into the component.
            @property userInput
            @type {String}
            @default null
        */
        this.userInput = userInput;

        /**
            List of numerical inputs.
            @property inputs
            @type {Array}
            @default null
        */
        this.inputs = null;

        /**
            The initial list of numerical inputs.
            @property initialInputs
            @type {Array}
            @default null
        */
        this.initialInputs = null;

        /**
            List of controllers that are registered to listen to this input component.
            @property registeredControllers
            @type {Array} of {NumericalInputComponentController}
            @default []
        */
        this.registeredControllers = [];

        /**
            Whether the input is currently editable.
            @property isEditable
            @type {Boolean}
            @default true
        */
        this.isEditable = true;

        /**
            Whether the input is initially empty.
            @property isInitiallyEmpty
            @type {Boolean}
            @default true
        */
        this.isInitiallyEmpty = true;
    }

    /**
        Register the given controller to listen to changes on the input.
        @method registerController
        @param {NumericalInputComponentController} controller The controller that wants to be registered to listen to this input.
        @return {void}
    */
    registerController(controller) {
        this.registeredControllers.push(controller);
    }

    /**
        Clear the registered controllers.
        @method clearRegisteredControllers
        @return {void}
    */
    clearRegisteredControllers() {
        this.registeredControllers.length = 0;
    }

    /**
        Throw an error if the user input is invalid.
        @method validateUserInput
        @return {void}
    */
    validateUserInput() {
        this.validate(this.userInput);
    }

    /**
        Throw an error if the given string is invalid.
        @method validate
        @param {String} inputToValidate The input to validate.
        @return {void}
    */
    validate(inputToValidate) {

        /*
            Verify that input consists of numerical values separated by whitespace.
            Valid input ex: 42 -13    56.5
            12.4
                -5

            Which should be interpreted as 5 numbers: 42 -13 56.5 12.4 -5
        */
        const isValidFormat = (/^\s*(-?\d+(\.\d+)?\s+)*(-?\d+(\.\d+)?)?\s*$/).test(inputToValidate);

        if (!isValidFormat) {
            throw new Error('Valid input is numbers separated by whitespace. Ex: 42.5 -13');
        }
    }

    /**
        Store the given user input.
        @method setUserInput
        @param {String} userInput The user's input to set.
        @return {void}
    */
    setUserInput(userInput) {
        this.validate(userInput);
        this.initialInputs = userInput.match(/-?\d+(\.\d+)?/g) || [];
        this.inputs = this.initialInputs.slice();
        this.userInput = userInput;
        this.isInitiallyEmpty = !this.inputs.length;
    }

    /**
        Get the next input value.
        @method getNextInput
        @return {String} The next numerical input.
    */
    getNextInput() {
        if (this.isInitiallyEmpty) {
            throw new Error('Program is trying to get next input, but no input values exist in the input box.');
        }

        const nextInput = this.inputs.shift();

        if (isNaN(nextInput)) {
            throw new Error('Program is trying to get next input, but all input values have already been gotten.');
        }

        return Number(nextInput);
    }

    /**
        Initialize the input component.
        @method initialize
        @return {void}
    */
    initialize() {
        this.setUserInput(this.userInput);
        this.isEditable = false;
    }

    /**
        Set the input to be editable.
        @method editable
        @return {void}
    */
    editable() {
        this.isEditable = true;
    }
}
