'use strict';

/* global PropertyAndType, testProperties */

const elementPropertiesAndTypes = [
    new PropertyAndType('id', 'string'),
    new PropertyAndType('isInEditMode', 'boolean'),
    new PropertyAndType('isSelected', 'boolean'),
    new PropertyAndType('name', 'string'),
    new PropertyAndType('style', 'object'),
    new PropertyAndType('type', 'string'),
    new PropertyAndType('toJSON', 'function'),
    new PropertyAndType('clone', 'function'),
    new PropertyAndType('updateWithCode', 'function'),
    new PropertyAndType('mergeElementVariant', 'function'),
    new PropertyAndType('_setProperty', 'function'),
];

$(document).ready(() => {
    const object = new Element({
        type: 'image',
        id: '0',
        name: 'Object 1: Image',
        isInEditMode: false,
        isSelected: false,
        imageID: '0B74PAULDIwwsLXpCQm1US3RDRmM',
        style: {
            height: '435px',
            left: '1px',
            opacity: '0.5',
            top: '65px',
            width: '560px',
            'z-index': '0',
        },
    });

    testProperties(object, elementPropertiesAndTypes, 'Element');
});
