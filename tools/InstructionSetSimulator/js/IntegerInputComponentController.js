'use strict';

/* exported IntegerInputComponentController */
/* global IntegerInputComponent */

/**
    Controller for an {IntegerInputComponent}.
    @class IntegerInputComponentController
*/
class IntegerInputComponentController {

    /**
        @constructor
        @param {Object} $container jQuery reference to the container for this integer input component.
        @param {Function} template Function to generate HTML for the input component.
    */
    constructor($container, template) {

        /**
            jQuery reference to the container for this integer input component.
            @property $container
            @type {Object}
        */
        this.$container = $container;

        /**
            Reference to the integer input component model.
            @property integerInputComponent
            @type {IntegerInputComponent}
            @default null
        */
        this.integerInputComponent = null;

        /**
            Function to generate HTML for the input component.
            @property template
            @type {Function}
        */
        this.template = template;

        /**
            jQuery reference to the input area.
            @property $input
            @type {Object}
            @default null
        */
        this.$input = null;

        /**
            The actual user input, which is temporarily stored while simulation runs.
            @property cachedUserInput
            @type {String}
            @default ''
        */
        this.cachedUserInput = '';

        this.render();
        this.enable();
    }

    /**
        Render an {IntegerInputComponent}.
        @method render
        @return {void}
    */
    render() {
        this.$container.html(this.template());
        this.$input = this.$container.find('.integer-input');
    }

    /**
        Initialize the integer input component
        @method initialize
        @return {void}
    */
    initialize() {
        this.integerInputComponent = new IntegerInputComponent(this.$input.text());
    }

    /**
        Set the input to look pretty.
        @method setPrettyInput
        @return {void}
    */
    setPrettyInput() {
        const numberOfConsumed = this.integerInputComponent.initialInputs.length - this.integerInputComponent.inputs.length;
        const consumedInputs = this.integerInputComponent.initialInputs.slice(0, numberOfConsumed);

        const consumedInputsHTML = consumedInputs.map(input => `<span class='consumed'>${input.toString()}</span>`);
        const unconsumedInputsHTML = this.integerInputComponent.inputs.map(input => input.toString());
        const inputsHTML = consumedInputsHTML.concat(unconsumedInputsHTML).join(' ');

        this.setInputString(inputsHTML);
    }

    /**
        Disable the input component.
        @method disable
        @return {void}
    */
    disable() {
        this.$input.attr('contenteditable', false);

        // Cache user's input then print their input nicely.
        this.cachedUserInput = this.getInputString();
        this.setPrettyInput();
    }

    /**
        Enable the input component.
        @method enable
        @return {void}
    */
    enable() {
        this.setInputString(this.cachedUserInput);
        this.$input.attr('contenteditable', true);
    }

    /**
        Execute the input component.
        @method execute
        @param {BaseWord} value The memory address connected to Value.
        @param {BaseWord} ready The memory address connected to Ready.
        @param {Memory} memory The memory storing Value and Ready.
        @param {Number} integerInputValueMemoryAddress The address of Value in memory.
        @return {void}
    */
    execute(value, ready, memory, integerInputValueMemoryAddress) {
        this.integerInputComponent.execute(value, ready, memory, integerInputValueMemoryAddress);
        this.setPrettyInput();
    }

    /**
        Get the input string.
        @method getInputString
        @return {String} The input.
    */
    getInputString() {
        return this.$input.text();
    }

    /**
        Set the given input set to the input component.
        @method setInputString
        @param {String} inputString The input string to set.
        @return {void}
    */
    setInputString(inputString) {
        this.$input.html(inputString);
    }
}
