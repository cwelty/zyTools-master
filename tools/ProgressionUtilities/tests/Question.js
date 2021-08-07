'use strict';

/* global Question, PropertyAndType, testProperties */

$(document).ready(() => {
    const object = new Question({
        code: '',
        explanation: '',
        usedElements: [],
        height: '',
        isSelected: false,
        name: 'Question a',
        width: '',
        elementVariants: [
            {
                id: '1',
                text: 'add $t0 $s1 $s2',
            },
        ],
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('elementVariants', 'array'),
        new PropertyAndType('explanation', 'string'),
        new PropertyAndType('height', 'string'),
        new PropertyAndType('isSelected', 'boolean'),
        new PropertyAndType('name', 'string'),
        new PropertyAndType('usedElements', 'array'),
        new PropertyAndType('width', 'string'),
        new PropertyAndType('code', 'string'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'Question');
});
