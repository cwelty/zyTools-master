'use strict';

/* exported BytesToPrint */

/**
    Store the address name, value, and whether the address had been written to.
    @class BytesToPrint
*/
class BytesToPrint {

    /**
        @constructor
        @param {String} address The name of these bytes.
        @param {String} value The value of these bytes.
        @param {String} label The label of these bytes.
        @param {Boolean} wasWrittenTo Whether these bytes had been written to.
        @param {Boolean} isReadOnly Whether the bytes are ready only.
        @param {String} [className=''] A class name to add to the printed byte.
    */
    constructor(address, value, label, wasWrittenTo, isReadOnly, className = '') {
        this.address = address;
        this.value = value;
        this.label = label;
        this.wasWrittenTo = wasWrittenTo;
        this.isReadOnly = isReadOnly;
        this.className = className;
    }
}
