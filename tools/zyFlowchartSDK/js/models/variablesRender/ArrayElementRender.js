'use strict';

/* exported ArrayElementRender */
/* global MemoryCellRender */

/**
    Model for rendering an array element.
    @class ArrayElementRender
    @extends MemoryCellRender
*/
class ArrayElementRender extends MemoryCellRender {

    /**
        @constructor
        @param {MemoryCell} memoryCell The memory cell to render.
        @param {String} arrayName The name of the array.
        @param {Boolean} [isFirstOfArray=false] Whether this is the first element in the array.
    */
    constructor(memoryCell, arrayName, isFirstOfArray = false) {
        super(memoryCell, true);

        /**
            Whether this is the first element in the array.
            @property isFirstOfArray
            @type {Boolean}
        */
        this.isFirstOfArray = isFirstOfArray;

        // Remove the array variable's name from the cell's name for printing.
        this.name = this.name.substring(arrayName.length);
    }
}
