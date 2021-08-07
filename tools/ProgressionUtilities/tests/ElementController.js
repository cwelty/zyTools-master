'use strict';

/* global ElementController, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementController({}, {}, {});

    const objectPropertiesAndTypes = [
        new PropertyAndType('render', 'function'),
        new PropertyAndType('destroy', 'function'),
        new PropertyAndType('_$element', 'null'),
        new PropertyAndType('_templates', 'object'),
        new PropertyAndType('_$questionArea', 'object'),
        new PropertyAndType('_elementRendered', 'object'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'ElementController');
});
