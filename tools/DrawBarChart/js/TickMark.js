'use strict';

/* exported TickMark */

/**
    Store index and label of a tick mark.
    @class TickMark
*/
class TickMark {

    /**
        @constructor
        @param {Number} index The tick mark's index.
        @param {String} label The label for the tick mark.
    */
    constructor(index, label) {
        this.index = index;
        this.label = label;
    }
}
