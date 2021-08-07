'use strict';

/* exported IntegerOutputComponent */

/**
    An integer output component that runs in parallel to the simulator.
    The component has one connection to the simulator's memory: Value (32-bit signed integer).
    @class IntegerOutputComponent
*/
class IntegerOutputComponent {

    /**
        @constructor
    */
    constructor() {

        /**
            The output to be printed.
            @property output
            @type {String}
            @default ''
        */
        this.output = '';
    }

    /**
        Execute the output component.
        @method execute
        @param {BaseWord} value The memory address connected to Value.
        @param {Memory} memory The memory storing Value.
        @param {Number} integerOutputValueMemoryAddress The address of Value in memory.
        @return {void}
    */
    execute(value, memory, integerOutputValueMemoryAddress) {
        this.output += `${value.toString()} `;
        memory.addClassToAddress('output-value', integerOutputValueMemoryAddress);
    }
}
