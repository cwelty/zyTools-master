'use strict';

/* exported PropertyAndValue */

/**
    Store a property and that property's value.
    @class PropertyAndValue
*/
class PropertyAndValue {

    /**
        @constructor
        @param {String} name The name of the property.
        @param {Object} value The value of the property.
    */
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
