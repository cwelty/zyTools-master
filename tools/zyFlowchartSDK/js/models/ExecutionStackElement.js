'use strict';

/* exported ExecutionStackElement */

/**
    Model an element in the execution stack, which stores a program function and flowchart node.
    @class ExecutionStackElement
*/
class ExecutionStackElement {

    /**
        @constructor
        @param {ProgramFunction} programFunction The program function to store.
        @param {FlowchartNode} node The flowchart node to store.
    */
    constructor(programFunction, node) {

        /**
            The program function to store.
            @property function
            @type {ProgramFunction}
        */
        this.function = programFunction;

        /**
            The flowchart node to store.
            @property input
            @type {FlowchartNode}
        */
        this.node = node;
    }
}
