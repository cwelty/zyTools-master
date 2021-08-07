/* exported Property */

'use strict';

/**
    Store a property name and that property's default value.
    @class Property
    @constructor
    @param {String} name The property's name.
    @param {String} defaultValue The property's default value.
*/
function Property(name, defaultValue) {
    this.name = name;
    this.defaultValue = defaultValue;
}
