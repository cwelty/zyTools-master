'use strict';

/* global Level, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new Level({
        explanation: 'Instruction bits map to same-numbered bits on the datapath.',
        usedElements: [ '0', '1' ],
        elementVariants: [],
        height: '',
        name: 'Level 1',
        width: '',
        questions: [
            {
                explanation: '',
                usedElements: [],
                elementVariants: [
                    {
                        id: '1',
                        text: 'add $t0 $s1 $s2',
                    },
                ],
            },
        ],
    });

    const objectPropertiesAndTypes = [
        new PropertyAndType('elementVariants', 'array'),
        new PropertyAndType('explanation', 'string'),
        new PropertyAndType('height', 'string'),
        new PropertyAndType('name', 'string'),
        new PropertyAndType('questions', 'array'),
        new PropertyAndType('usedElements', 'array'),
        new PropertyAndType('width', 'string'),
    ];

    testProperties(object, objectPropertiesAndTypes, 'Level');
});
