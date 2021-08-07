'use strict';

/* global ElementTableCell, PropertyAndType, testProperties */

$(document).ready(() => {
    const object = new ElementTableCell({
        content: 'Cell content',
        isHeader: true,
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('content', 'string'),
        new PropertyAndType('isHeader', 'boolean'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'ElementTableCell');
});
