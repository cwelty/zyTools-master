'use strict';

/* exported IntegerVariable */
/* global SingleVariable */

/**
    Model an integer cell in memory.
    @class IntegerVariable
    @extends SingleVariable
*/
class IntegerVariable extends SingleVariable {

    /**
        @constructor
        @param {String} name The name of the memory cell.
    */
    constructor(name) {
        super(name, 'integer');
    }

    /**
        Return the name of this variable class.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        return 'IntegerVariable';
    }

    /**
        Return a clone of this variable. Inheriting objects must override.
        @method clone
        @return {IntegerVariable} A clone of this variable.
    */
    clone() {
        const clone = new IntegerVariable(this.name);

        clone.setValue(this.getValue());

        return clone;
    }

    /**
        Return the Coral variable data type ported in the given language.
        @method getPortedDataType
        @return {String} The data type in the ported language.
    */
    getPortedDataType() {
        return 'int';
    }
}
