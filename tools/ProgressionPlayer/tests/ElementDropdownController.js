$(document).ready(function ElementDropdownControllerCreationTests() {
    var object = new ElementDropdownController();

    var progressionUtilities = require('ProgressionUtilities').create();
    var propertiesAndTypes = [
        progressionUtilities.createPropertyAndType('enable', 'function'),
        progressionUtilities.createPropertyAndType('render', 'function'),
        progressionUtilities.createPropertyAndType('disable', 'function'),
        progressionUtilities.createPropertyAndType('isCorrect', 'function'),
        progressionUtilities.createPropertyAndType('userAnswer', 'function'),
        progressionUtilities.createPropertyAndType('expectedAnswer', 'function'),
        progressionUtilities.createPropertyAndType('isInvalidAnswer', 'function'),
        progressionUtilities.createPropertyAndType('_getSelectedOption', 'function')
    ];

    progressionUtilities.testProperties(object, propertiesAndTypes, 'ElementDropdownController');
});
