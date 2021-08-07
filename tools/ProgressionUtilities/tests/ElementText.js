'use strict';

/* global ElementText, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementText({
        type: 'text',
        id: '12',
        text: '31-26',
        name: 'Object 1: Text',
        isInEditMode: false,
        isSelected: false,
        style: {
            border: '2px solid zyante-gray',
            color: 'zyante-black',
            'font-size': '11px',
            height: '435px',
            left: '166px',
            padding: '2px',
            top: '42px',
            width: '560px',
            'z-index': '1',
        },
    });

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('text', 'string'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementText');
});
