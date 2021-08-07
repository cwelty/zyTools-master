'use strict';

/* exported SingleMemoryCellVariableRender */
/* global MemoryCellRender */

/**
    Model for rendering a single memory cell variable.
    @class SingleMemoryCellVariableRender
    @extends MemoryCellRender
*/
class SingleMemoryCellVariableRender extends MemoryCellRender {

    /**
        @constructor
        @param {MemoryCell} memoryCell The memory cell to render.
    */
    constructor(memoryCell) {
        super(memoryCell, false);

        /**
            The data type of the memory cell.
            @property type
            @type {String}
        */
        this.type = memoryCell.type;
    }
}
