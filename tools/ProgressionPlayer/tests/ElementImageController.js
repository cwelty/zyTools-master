$(document).ready(function ElementImageControllerCreationTests() {
    var object = new ElementImageController();

    var progressionUtilities = require('ProgressionUtilities').create();
    var propertiesAndTypes = [
        progressionUtilities.createPropertyAndType('render', 'function')
    ];

    progressionUtilities.testProperties(object, propertiesAndTypes, 'ElementImageController');
});
