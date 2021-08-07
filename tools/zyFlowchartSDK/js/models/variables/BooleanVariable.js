'use strict';

/* exported BooleanVariable */
/* global SingleVariable */

/**
    Model an boolean cell in memory.
    @class BooleanVariable
    @extends SingleVariable
*/
class BooleanVariable extends SingleVariable {

    /**
        @constructor
        @param {String} name The name of the memory cell.
    */
    constructor(name) {
        super(name, 'boolean');
    }

    /**
        Return the name of this variable class.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        return 'BooleanVariable';
    }

    /**
        Return a clone of this variable.
        @method clone
        @return {BooleanVariable} A clone of this variable.
    */
    clone() {
        const clone = new BooleanVariable(this.name);

        clone.setValue(this.getValue());

        return clone;
    }
}
