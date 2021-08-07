'use strict';

/* exported ElementVariant */
/* global escapeStyleValues, isValueDefined */

/**
    An {ElementVariant} is an incomplete {Element}.
    @class ElementVariant
*/
class ElementVariant {

    /**
        @constructor
        @param {Object} elementVariantJSON Properties to store on the element variant.
    */
    constructor(elementVariantJSON) {
        for (const property in elementVariantJSON) { // eslint-disable-line guard-for-in
            let value = elementVariantJSON[property];

            value = isValueDefined(elementVariantJSON, property) ? value : '';

            // Escape style property values.
            if (property === 'style') {
                value = escapeStyleValues(value);
            }

            // Make a copy if property is an array.
            if (Object.prototype.toString.call(value) === '[object Array]') {
                value = value.slice();
            }

            this[property] = value;
        }

        // If we set listName in the loop above, it may be overriden by a variant of the tableData property.
        if (elementVariantJSON.listName && elementVariantJSON.listName !== '') {
            this.tableData = { data: elementVariantJSON.listName };
        }
    }

    /**
        Return a clone of this element.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        return new ElementVariant(this.toJSON());
    }

    /**
        Convert {ElementVariant} into a JSON representation.
        @method toJSON
        @return {Object} JSON representation of a {ElementVariant}.
    */
    toJSON() {
        const json = $.extend(true, {}, this);

        // The above line doesn't properly handle converting tableData into JSON.
        if (json.tableData && Array.isArray(json.tableData)) {
            json.tableData = json.tableData.map(row => row.map(cell => $.extend(true, {}, cell)));
        }

        return json;
    }
}
