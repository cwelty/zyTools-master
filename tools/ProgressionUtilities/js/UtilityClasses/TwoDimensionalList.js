'use strict';

/* exported TwoDimensionalList */

class TwoDimensionalList {

    /**
        Creates a |TwoDimensionalList| instance from a two-dimensional python variable passed by Skulpt.
        @constructor
        @param {Sk.builtin.list} listVariable The Skulpt version of the python two-dimensional list.
    */
    constructor(listVariable) {
        this.numRows = listVariable.v.length;
        this.numCols = listVariable.v[0].v.length;
        this.variables = listVariable.v.map(row => row.v.map(cell => cell.v));
    }
}
