'use strict';

/* exported FloatVariable */
/* global SingleVariable */

/**
    Model a float variable.
    @class FloatVariable
    @extends SingleVariable
*/
class FloatVariable extends SingleVariable {

    /**
        @constructor
        @param {String} name The name of the memory cell.
    */
    constructor(name) {
        super(name, 'float');
    }

    /**
        Return the name of this variable class.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        return 'FloatVariable';
    }

    /**
        Return a clone of this variable. Inheriting objects must override.
        @method clone
        @return {FloatVariable} A clone of this variable.
    */
    clone() {
        const clone = new FloatVariable(this.name);

        clone.setValue(this.getValue());

        return clone;
    }

    /**
        Return the Coral variable data type ported in the given language.
        @method getPortedDataType
        @return {String} The data type in the ported language.
    */
    getPortedDataType() {
        return 'double';
    }
}
