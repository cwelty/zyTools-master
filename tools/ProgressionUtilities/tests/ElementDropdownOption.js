'use strict';

/* global ElementDropdownOption, PropertyAndType, testProperties */

$(document).ready(() => {
    const object = new ElementDropdownOption({
        text: '000000',
        isDefault: false,
        isSelected: false,
        isCorrectOption: true,
        isInvalidOption: true,
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('text', 'string'),
        new PropertyAndType('isSelected', 'boolean'),
        new PropertyAndType('isCorrectOption', 'boolean'),
        new PropertyAndType('isInvalidOption', 'boolean'),
        new PropertyAndType('isDefault', 'boolean'),
        new PropertyAndType('isPythonList', 'boolean'),
        new PropertyAndType('toJSON', 'function'),
        new PropertyAndType('updateWithCode', 'function'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'ElementDropdownOption');
});
