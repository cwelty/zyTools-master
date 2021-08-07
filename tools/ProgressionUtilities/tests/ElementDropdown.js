'use strict';

/* global ElementDropdown, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementDropdown({
        type: 'dropdown',
        id: '5',
        name: 'Object 1: Dropdown',
        isInEditMode: false,
        isSelected: false,
        style: {
            'font-size': '16px',
            left: '100px',
            top: '364px',
            'z-index': '1',
        },
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

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('options', 'array'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementDropdown');
});
