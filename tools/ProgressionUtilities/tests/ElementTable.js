'use strict';

/* global ElementTable, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementTable({
        type: 'table',
        id: '0',
        name: 'Object 1: Table',
        isInEditMode: false,
        isSelected: false,
        style: {
            'border-radius': 0.0,
            'font-size': '16px',
            height: '100px',
            left: '115px',
            opacity: 1.0,
            transform: 'rotate(0deg)',
            top: '0px',
            width: '200px',
        },
        tableData: [
            [
                { content: 'City', isHeader: true },
                { content: 'Min', isHeader: true },
                { content: 'Max', isHeader: true },
            ],
            [
                { content: 'Madrid', isHeader: true },
                { content: '7C', isHeader: false },
                { content: '22C', isHeader: false },
            ],
            [
                { content: 'Los Gatos', isHeader: true },
                { content: '12C', isHeader: false },
                { content: '19C', isHeader: false },
            ],
        ],
    });

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('tableData', 'array'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementTable');
});
