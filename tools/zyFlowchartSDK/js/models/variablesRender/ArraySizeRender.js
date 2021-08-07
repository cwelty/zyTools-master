'use strict';

/* exported ArraySizeRender */
/* global ArrayElementRender */

/**
    Model for rendering the array's size.
    @class ArraySizeRender
    @extends ArrayElementRender
*/
class ArraySizeRender extends ArrayElementRender {

    /**
        @constructor
        @param {ArrayVariable} array The array of which this memory cell is the first property to be printed.
    */
    constructor(array) {
        super(array.sizeCell, array.name, true);

        /**
            The name of the array.
            @property arrayName
            @type {String}
        */
        this.arrayName = array.name;

        /**
            The data type of the array.
            @property type
            @type {String}
        */
        this.type = array.type;

        /**
            The number of elements in the array.
            @property numberOfElements
            @type {Integer}
        */
        this.numberOfElements = Math.max(2, array.arrayCells.length + 1); // eslint-disable-line no-magic-numbers
    }
}
