$(document).ready(function ProgressionQuestionElementsCreationTests() {
    var progressionUtilities = require('ProgressionUtilities').create();
    var element = progressionUtilities.createElementByProperties({
        'type': 'image',
        'id':   '0',
        'style': {
            'height':  '435px',
            'left':    '1px',
            'opacity': '0.5',
            'top' :    '65px',
            'width':   '560px',
            'z-index': '0'
        }
    });

    var level = progressionUtilities.createLevel({
        'explanation':     'Instruction bits map to same-numbered bits on the datapath.',
        'height':          '',
        'width':           '',
        'name':            'Level 1',
        'usedElements':    [ '0', ],
        'elementVariants': [
            {
                'id':      '0',
                'imageID': '0B74PAULDIwwsLXpCQm1US3RDRmM',
            }
        ],
        'questions': [
            {
                'explanation':     '',
                'usedElements':    [],
                'height':          '',
                'width':           '',
                'name':            'Question a',
                'elementVariants': [
                    {
                        'id':   '1',
                        'text': 'add $t0 $s1 $s2'
                    }
                ]
            }
        ]
    });

    var question = progressionUtilities.createQuestion({
        'explanation':     '',
        'usedElements':    [],
        'height':          '',
        'width':           '',
        'name':            'Question a',
        'elementVariants': []
    });

    var object = new ProgressionQuestionElements([ element ], level, question);

    var progressionUtilities = require('ProgressionUtilities').create();
    var objectPropertiesAndTypes = [
        progressionUtilities.createPropertyAndType('_addElementVariants', 'function'),
        progressionUtilities.createPropertyAndType('_getElementWithId', 'function')
    ];

    progressionUtilities.testProperties(object, objectPropertiesAndTypes, 'ProgressionQuestionElements');
});
