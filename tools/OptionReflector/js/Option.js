'use strict';

/* exported Option */

/**
    Store the name, value, and data type of an option.
    @class Option
*/
class Option {

    /**
        @constructor
        @param {String} name The name of the option.
        @param {String} value The value of the option.
    */
    constructor(name, value) {
        this.name = name;
        this.value = value;
        this.dataType = typeof value;
    }
}
