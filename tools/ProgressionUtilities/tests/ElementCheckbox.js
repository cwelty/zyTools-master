'use strict';

/* global ElementCheckbox, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementCheckbox({
        type: 'checkbox',
        id: '0',
        name: 'Object 1: Checkbox',
        isInEditMode: false,
        isSelected: false,
        style: {
            'font-size': '16px',
            left: '115px',
            top: '0px',
        },
        correctAnswerIsCheckedString: 'true',
        correctAnswerIsChecked: true,
        label: 'Check this you must',
    });

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('correctAnswerIsCheckedString', 'string'),
        new PropertyAndType('correctAnswerIsChecked', 'boolean'),
        new PropertyAndType('label', 'string'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementCheckbox');
});
