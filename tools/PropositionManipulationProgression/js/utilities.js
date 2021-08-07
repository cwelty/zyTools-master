/* exported applyPropertiesAndOptions */

'use strict';

/**
    Apply |properties| and |options| to |object|.
    @method applyPropertiesAndOptions
    @param {Object} object The object to apply properties and options to.
    @param {Array} properties Array of {Property}. The properties and each property's default value.
    @param {Object} options Property values that take precedence over the default value.
    @return {void}
*/
function applyPropertiesAndOptions(object, properties, options) {
    if (options) {
        properties.forEach(function(property) {
            object[property.name] = (property.name in options) ? options[property.name] : property.defaultValue;
        });
    }
}
