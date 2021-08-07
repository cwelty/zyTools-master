'use strict';

/* global toType */
/* exported PropertyAndType, testProperties */

/**
    Store a property and property's datatype.
    @class PropertyAndType
    @param {String} property The property's name.
    @param {String} type The data type of the property.
*/
function PropertyAndType(property, type) {
    this.property = property;
    this.type = type;
}

/**
    Test that object has the expected properties and each property has the expected type.
    @method testProperties
    @param {Object} object The object being tested.
    @param {Array} objectPropertiesAndTypes The expected properties and property types.
    @param {String} objectName The name of the object.
    @return {void}
*/
function testProperties(object, objectPropertiesAndTypes, objectName) {
    QUnit.test(`${objectName} Creation`, assert => {
        objectPropertiesAndTypes.forEach(objectPropertyAndType => {
            const property = objectPropertyAndType.property;
            const type = objectPropertyAndType.type;

            assert.ok((property in object), `${objectName} has property ${property}`);
            assert.equal(toType(object[property]), type, `${objectName} property ${property} is a ${type}`);
        });
    });
}
