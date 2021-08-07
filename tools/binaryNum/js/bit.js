'use strict';

/* exported Bit */

/**
    Store bit value and associated exponent, as in 2^exponent.
    @class Bit
*/
class Bit {

    /**
        Build a bit from the given exponent.
        @param {Number} exponent The exponent to the bit value, as in 2^exponent.
        @constructor
    */
    constructor(exponent) {
        this.decimalValue = Math.pow(2, exponent); // eslint-disable-line no-magic-numbers
        this.bitIndex = exponent;
    }
}
