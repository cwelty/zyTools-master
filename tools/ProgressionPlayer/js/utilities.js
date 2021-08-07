'use strict';

/* exported unescapeHTMLFromJSON */

/**
    Unescape HTML from given JSON.
    @method unescapeHTMLFromJSON
    @param {Object} object The JSON to unescape HTML from.
    @param {Object} [parent=null] The parent of object.
    @param {Object} [parentKeyToObject=null] The key from the parent to the object. Ex: parent[0] === object, so parentKeyToObject is 0.
    @return {Object} The JSON with unescaped HTML.
*/
function unescapeHTMLFromJSON(object, parent = null, parentKeyToObject = null) {
    switch (typeof object) {

        // Unescape HTML from string properties.
        case 'string':
            if (parent && parentKeyToObject) {
                parent[parentKeyToObject] = $('<div/>').html(object).text();
            }
            break;
        case 'object':
            if (object) {
                Object.keys(object).forEach(key => {
                    unescapeHTMLFromJSON(object[key], object, key);
                });
            }
            break;
        default:
            break;
    }

    return object;
}
