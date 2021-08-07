'use strict';

/* exported IntegerArray */
/* global ArrayVariable */

/**
    Model an array of integer.
    @class IntegerArray
    @extends ArrayVariable
*/
class IntegerArray extends ArrayVariable {

    /**
        @constructor
        @param {String} name The name of the array.
        @param {Integer} numberOfElements The number of elements in the array.
    */
    constructor(name, numberOfElements) {
        super(name, numberOfElements, 'integer');
    }

    /**
        Return the name of this variable class.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        return 'IntegerArray';
    }

    /**
        Return a clone of this variable. Inheriting objects must override.
        @method clone
        @return {IntegerArray} A clone of this variable.
    */
    clone() {
        const clone = new IntegerArray(this.name, this.sizeCell.getValue());

        this.copyMemoryCellValuesTo(clone);

        return clone;
    }

    /**
        Return the Coral variable data type ported in the given language.
        @method getPortedDataType
        @return {String} The data type in the ported language.
    */
    getPortedDataType() {
        return 'vector<int>';
    }
}
