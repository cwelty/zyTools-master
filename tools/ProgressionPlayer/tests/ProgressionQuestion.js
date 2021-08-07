$(document).ready(function ProgressionQuestionCreationTests() {
    var object = new ProgressionQuestion(
        [
            {
                type: 'text',
                id:   '1',
                style: {
                    color:       'zyante-black',
                    'font-size': '16px',
                    height:      '435px',
                    left:        '223px',
                    top :        '0',
                    width:       '560px',
                    'z-index':   '1'
                }
            }
        ],
        'Test explanation',
        '500px',
        '560px'
    );

    var progressionUtilities = require('ProgressionUtilities').create();
    var objectPropertiesAndTypes = [
        progressionUtilities.createPropertyAndType('elements', 'array'),
        progressionUtilities.createPropertyAndType('explanation', 'string'),
        progressionUtilities.createPropertyAndType('height', 'string'),
        progressionUtilities.createPropertyAndType('width', 'string')
    ];

    progressionUtilities.testProperties(object, objectPropertiesAndTypes, 'ProgressionQuestion');
});
