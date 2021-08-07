'use strict';

/* exported MemoryCellRender */

/**
    Abstract model for rendering a memory cell.
    @class MemoryCellRender
*/
class MemoryCellRender {

    /**
        @constructor
        @param {MemoryCell} memoryCell The memory cell to render.
        @param {Boolean} isArray Whether this memory cell is part of an array.
    */
    constructor(memoryCell, isArray) {

        /**
            The name of the memory cell.
            @property name
            @type {String}
        */
        this.name = memoryCell.name;

        /**
            The value of the memory cell.
            @property value
            @type {String}
        */
        this.value = memoryCell.toString();

        /**
            Whether this memory cell is part of an array.
            @property isArray
            @type {Boolean}
        */
        this.isArray = isArray;

        /**
            Whether the memory cell was written to.
            @property wasWrittenTo
            @type {Boolean}
        */
        this.wasWrittenTo = memoryCell.wasWrittenTo;
    }
}
