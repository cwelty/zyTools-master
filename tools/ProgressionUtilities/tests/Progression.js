'use strict';

/* global Progression, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new Progression({
        height: '500px',
        width: '560px',
        elements: [],
        levels: [],
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('elements', 'array'),
        new PropertyAndType('height', 'string'),
        new PropertyAndType('levels', 'array'),
        new PropertyAndType('width', 'string'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'Progression');
});
