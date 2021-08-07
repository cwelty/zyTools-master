'use strict';

/* global ElementCheckboxController */

$(document).ready(() => {
    const object = new ElementCheckboxController();

    const progressionUtilities = require('ProgressionUtilities').create();
    const propertiesAndTypes = [
        progressionUtilities.createPropertyAndType('disable', 'function'),
        progressionUtilities.createPropertyAndType('enable', 'function'),
        progressionUtilities.createPropertyAndType('expectedAnswer', 'function'),
        progressionUtilities.createPropertyAndType('isAssessedForCorrectness', 'boolean'),
        progressionUtilities.createPropertyAndType('isCorrect', 'function'),
        progressionUtilities.createPropertyAndType('userAnswer', 'function'),
    ];

    progressionUtilities.testProperties(object, propertiesAndTypes, 'ElementCheckboxController');
});
