$(document).ready(function ControllersCreationTests() {
    var object = new Controllers();

    var progressionUtilities = require('ProgressionUtilities').create();
    var objectPropertiesAndTypes = [
        progressionUtilities.createPropertyAndType('empty', 'function'),
        progressionUtilities.createPropertyAndType('disable', 'function'),
        progressionUtilities.createPropertyAndType('enable', 'function'),
        progressionUtilities.createPropertyAndType('isCorrect', 'function'),
        progressionUtilities.createPropertyAndType('isInvalidAnswer', 'function'),
        progressionUtilities.createPropertyAndType('userAnswer', 'function'),
        progressionUtilities.createPropertyAndType('expectedAnswer', 'function'),
        progressionUtilities.createPropertyAndType('removeInvalidAnswerStatus', 'function')
    ];

    progressionUtilities.testProperties(object, objectPropertiesAndTypes, 'Controllers');
});
