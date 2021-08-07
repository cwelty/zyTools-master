'use strict';

/* eslint-disable no-magic-numbers */
/* exported Variable */

/**
    A class that defines a variable.
    @class Variable
*/
class Variable {

    /**
        @constructor
        @param {String} variable The name and representation of the variable. Ex: a.
    */
    constructor(variable) {

        /**
            The name and representation of the variable. Ex: a
            @property variable
            @type {String}
        */
        this.variable = variable;

        /**
            Cells using this variable set to true.
            @property trueCells
            @type {Array<Number>}
            @default null
        */
        this.trueCells = null;

        /**
            Cells using the negated version of this variable.
            @property falseCells
            @type {Array<Number>}
            @default null
        */
        this.falseCells = null;
    }

    /**
        Initializes the |trueCells| and |falseCells| arrays.
        @method initializeCells
        @param {Number} variableIndex The index of the variable (is it the first, second, third, etc), this defines what cells will use it.
        @param {Number} numVariables The total number of variables in this k-map.
        @return {void}
    */
    initializeCells(variableIndex, numVariables) {
        switch (variableIndex) {
            case 0:
                if (numVariables === 3) {
                    this.trueCells = [ 4, 5, 6, 7 ];
                    this.falseCells = [ 0, 1, 2, 3 ];
                }
                else {
                    this.trueCells = [ 8, 9, 10, 11, 12, 13, 14, 15 ];
                    this.falseCells = [ 0, 1, 2, 3, 4, 5, 6, 7 ];
                }
                break;
            case 1:
                if (numVariables === 3) {
                    this.trueCells = [ 2, 3, 6, 7 ];
                    this.falseCells = [ 0, 1, 4, 5 ];
                }
                else {
                    this.trueCells = [ 4, 5, 6, 7, 8, 9, 10, 11 ];
                    this.falseCells = [ 0, 1, 2, 3, 12, 13, 14, 15 ];
                }
                break;
            case 2:
                if (numVariables === 3) {
                    this.trueCells = [ 1, 2, 5, 6 ];
                    this.falseCells = [ 0, 3, 4, 7 ];
                }
                else {
                    this.trueCells = [ 2, 3, 6, 7, 10, 11, 14, 15 ];
                    this.falseCells = [ 0, 1, 4, 5, 8, 9, 12, 13 ];
                }
                break;
            case 3:
                this.trueCells = [ 1, 2, 5, 6, 9, 10, 13, 14 ];
                this.falseCells = [ 0, 3, 4, 7, 8, 11, 12, 15 ];
                break;
            default:
                throw new Error('Unsupported variable index');
        }
    }

    /**
        Returns the intersection of |trueCells| between two or more variables.
        @method trueCellsIntersection
        @param {Array<Variable>} others The other variables.
        @return {Array<Number>} The resulting intersection.
    */
    trueCellsIntersection(others) {
        let intersection = this.trueCells.slice();

        others.forEach(other => {
            intersection = intersection.filter(cell => other.trueCells.includes(cell));
        });

        return intersection;
    }
}
