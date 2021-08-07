'use strict';

/* exported IntegerInputComponent */

/**
    An integer input component that runs in parallel to the simulator.
    The component has two connections to the simulator's memory: Value (32-bit signed integer) and Ready (1-bit).
    @class IntegerInputComponent
*/
class IntegerInputComponent {

    /**
        @constructor
        @param {String} userInput The user input into the input component.
    */
    constructor(userInput) {

        /**
            List of {Long} in input.
            @property inputs
            @type {Array}
            @default []
        */
        this.inputs = [];

        /**
            The initial list of {Long} in input.
            @property initialInputs
            @type {Array}
            @default [];
        */
        this.initialInputs = [];

        /*
            Verify that input consists of signed integers separated by whitespace.
            Valid input ex: 42 -13    56
            12
                -5

            Which should be interpreted as 5 integers: 42 -13 56 12 -5
        */
        const isValidFormat = (/^\s*(-?\d+\s+)*(-?\d+)?\s*$/).test(userInput);

        if (!isValidFormat) {
            throw new Error('Valid input is integers separated by whitespace. Ex: 42 -13');
        }

        // Create array of integer inputs.
        const integerStrings = userInput.match(/-?\d+/g) || [];

        this.initialInputs = integerStrings.map(integerString => window.dcodeIO.Long.fromValue(integerString));
        this.inputs = this.initialInputs.slice();
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

        // Throw error if user wrote to either the InputValue or InputReady.
        if (value.beenWrittenTo()) {
            throw new Error('Writing to InputValue is forbidden.');
        }
        if (ready.beenWrittenTo()) {
            throw new Error('Writing to InputReady is forbidden.');
        }

        if (value.beenReadFrom() || (ready.getSignedValue() === 0)) {
            const hasMoreInput = this.inputs.length > 0;

            if (hasMoreInput) {
                memory.addClassToAddress('input-value', integerInputValueMemoryAddress);

                // Update InputValue and InputReady.
                value.setValueByLong(this.inputs.shift());
                if (ready.getSignedValue() !== 1) {
                    ready.setValue(1, 0);
                }
            }

            // If no more input remains and InputReady isn't already 0, then change InputReady to 0.
            else if (ready.getSignedValue() !== 0) {
                ready.setValue(0, 0);
            }
        }
    }
}
