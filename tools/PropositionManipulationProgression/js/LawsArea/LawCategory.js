'use strict';

/* exported LawCategory */

/**
    Model the layout of laws in a particular category. Ex: The distributive laws.
    @class LawCategory
    @constructor
    @param {String} name The name of the law category.
    @param {Array} laws Array of {Law}. List of laws in this category.
*/
function LawCategory(name, laws) {
    this.name = name;
    this.laws = laws;
}
