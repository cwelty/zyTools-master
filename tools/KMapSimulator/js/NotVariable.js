'use strict';

/* global Variable */
/* exported NotVariable */

/**
    A class that defines a negated variable.
    @class NotVariable
    @extends Variable
*/
class NotVariable extends Variable {

    /**
        @constructor
        @param {Variable} variable The variable to negate.
    */
    constructor(variable) {
        super(`${variable.variable}'`);

        /**
            Cells using this variable set to true.
            @property trueCells
            @type {Array<Number>}
        */
        this.trueCells = variable.falseCells.slice();

        /**
            Cells using this variable set to false.
            @property falseCells
            @type {Array<Number>}
        */
        this.falseCells = variable.trueCells.slice();
    }

    /**
        Overrides Variable's initializeCells to avoid a developer from using it mistakenly.
        @method initializeCells
        @return {void}
    */
    initializeCells() {
        throw new Error('NotVariable instance should not call initializeCells.');
    }
}
