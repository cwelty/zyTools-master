'use strict';

/* exported ExecutionContext */

/**
    Model the contextually-relevant values needed for a node to perform an execution.
    @class ExecutionContext
*/
class ExecutionContext {

    /**
        @constructor
        @param {NumericalInputComponent} input The input to the program.
        @param {NumericalOutputComponent} output The output of the program.
        @param {Array} arrayOfVariables Array of {Variables}. The function's variables.
        @param {Randomizer} randomizer The random number generator.
    */
    constructor(input, output, arrayOfVariables, randomizer) {

        /**
            The input to the program.
            @property input
            @type {NumericalInputComponent}
        */
        this.input = input;

        /**
            The output of the program.
            @property output
            @type {NumericalOutputComponent}
        */
        this.output = output;

        /**
            The function's variables.
            @property arrayOfVariables
            @type {Array} of {Variables}
        */
        this.arrayOfVariables = arrayOfVariables;

        /**
            The program's random number generator.
            @property randomizer
            @type {Randomizer}
        */
        this.randomizer = randomizer;
    }
}
