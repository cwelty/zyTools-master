'use strict';

/* exported FunctionAndFlowchartScrollAmount */

/**
    An object storing a function and the associated flowchart's scroll amount.
    @class FunctionAndFlowchartScrollAmount
*/
class FunctionAndFlowchartScrollAmount {

    /**
        @constructor
        @param {ProgramFunction} programFunction The function to control.
        @param {Number} horizontalScroll The amount of horizontal scroll.
        @param {Number} verticalScroll The amount of vertical scroll.
    */
    constructor(programFunction, horizontalScroll, verticalScroll) {

        /**
            The function to store.
            @property programFunction
            @type {ProgramFunction}
        */
        this.programFunction = programFunction;

        /**
            The amount of horizontal scroll.
            @property horizontalScroll
            @type {Number}
        */
        this.horizontalScroll = horizontalScroll;

        /**
            The amount of vertical scroll.
            @property verticalScroll
            @type {Number}
        */
        this.verticalScroll = verticalScroll;
    }
}
