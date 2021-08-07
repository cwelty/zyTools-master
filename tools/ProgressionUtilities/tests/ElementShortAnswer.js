'use strict';

/* global ElementShortAnswer, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementShortAnswer({
        type: 'short-answer',
        id: '5',
        name: 'Object 1: Short answer',
        isInEditMode: false,
        isSelected: false,
        style: {
            'font-size': '16px',
            left: '100px',
            top: '364px',
            width: '80px',
        },
        correctAnswers: [ 'answer1', 'answer2' ],
        placeholder: 'Ex: answer5',
    });

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('correctAnswers', 'array'),
        new PropertyAndType('placeholder', 'string'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementShortAnswer');
});
