'use strict';

/* exported FloatArray */
/* global ArrayVariable */

/**
    Model an array of floats.
    @class FloatArray
    @extends ArrayVariable
*/
class FloatArray extends ArrayVariable {

    /**
        @constructor
        @param {String} name The name of the array.
        @param {Integer} numberOfElements The number of elements in the array.
    */
    constructor(name, numberOfElements) {
        super(name, numberOfElements, 'float');
    }

    /**
        Return the name of this variable class.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        return 'FloatArray';
    }

    /**
        Return a clone of this variable. Inheriting objects must override.
        @method clone
        @return {FloatArray} A clone of this variable.
    */
    clone() {
        const clone = new FloatArray(this.name, this.sizeCell.getValue());

        this.copyMemoryCellValuesTo(clone);

        return clone;
    }

    /**
        Return the Coral variable data type ported in the given language.
        @method getPortedDataType
        @return {String} The data type in the ported language.
    */
    getPortedDataType() {
        return 'vector<double>';
    }
}
