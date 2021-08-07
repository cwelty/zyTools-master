'use strict';

/* global ElementVariant, testProperties, PropertyAndType */

$(document).ready(() => {
    const elementVariant = new ElementVariant({
        id: '5',
        options: [
            {
                text: 'Choose option',
                isDefault: true,
                isCorrectOption: false,
                isInvalidOption: true,
            },
            {
                text: '01001',
                isDefault: false,
                isCorrectOption: false,
            },
            {
                text: '01000',
                isDefault: false,
                isCorrectOption: true,
            },
        ],
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('id', 'string'),
        new PropertyAndType('options', 'array'),
    ];

    testProperties(elementVariant, objectPropertiesAndTypes, 'ElementVariant');
});
