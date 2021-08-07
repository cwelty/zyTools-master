/* exported findByName */
'use strict';

/**
    Find the item in the list with the property |name| that has a particular value.
    @method findByName
    @param {Array} list The list to search.
    @param {String} name The property name to search.
    @param {String} value The value to find.
    @return {Object} The item in list that has the property name of a particular value.
*/
function findByName(list, name, value) {
    return list.find(item => item[name] === value);
}
