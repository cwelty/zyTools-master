$(document).ready(function ProgressionPlayerElementControllerCreationTests() {
    var object = new ProgressionPlayerElementController();

    var progressionUtilities = require('ProgressionUtilities').create();
    var propertiesAndTypes = [
        progressionUtilities.createPropertyAndType('enable', 'function'),
        progressionUtilities.createPropertyAndType('disable', 'function'),
        progressionUtilities.createPropertyAndType('isCorrect', 'function'),
        progressionUtilities.createPropertyAndType('userAnswer', 'function'),
        progressionUtilities.createPropertyAndType('expectedAnswer', 'function'),
        progressionUtilities.createPropertyAndType('isInvalidAnswer', 'function'),
        progressionUtilities.createPropertyAndType('markAsWrongAnswer', 'function'),
        progressionUtilities.createPropertyAndType('markAsInvalidAnswer', 'function'),
        progressionUtilities.createPropertyAndType('removeInvalidAnswerStatus', 'function')
    ];

    progressionUtilities.testProperties(object, propertiesAndTypes, 'ProgressionPlayerElementController');
});
