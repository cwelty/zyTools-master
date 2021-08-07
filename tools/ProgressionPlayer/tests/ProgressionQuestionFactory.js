$(document).ready(function ProgressionQuestionFactoryCreationTests() {
    var object = new ProgressionQuestionFactory({
        'explanation': '',
        'height':      '500px',
        'width':       '560px',
        'elements':    [],
        'levels':      []
    });

    var progressionUtilities = require('ProgressionUtilities').create();
    var objectPropertiesAndTypes = [
        progressionUtilities.createPropertyAndType('make', 'function')
    ];

    progressionUtilities.testProperties(object, objectPropertiesAndTypes, 'ProgressionQuestionFactory');
});
