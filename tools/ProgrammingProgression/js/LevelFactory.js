/* global Level, ProgramFile */
/* exported LevelFactory */
'use strict';

/**
    LevelFactory stores the templates for the files, explanation, prompt and solution of a level.
    @class LevelFactory
*/
class LevelFactory {

    /**
        Initializes the {LevelFactory} object.
        @constructor
        @param {Array} levelTemplates {Array} of {LevelTemplate}. Contains a {LevelTemplate} object for each level.
    */
    constructor(levelTemplates) {
        this.levelTemplates = levelTemplates;
        this.shownLevels = levelTemplates.map(() => new Set());
        this.utilities = require('utilities');
    }

    /**
        Return a randomly-generated combination of parameters.
        @method getParameterCombination
        @param {Object} parameters A list of possible parameters to randomize the level.
        @return {Object}
    */
    getParameterCombination(parameters) {
        let returnValue = null;

        // Recursive case: |parameter| is an array, so pick one element then recursively pick a parameter from that element.
        if ($.isArray(parameters)) {
            const parameter = require('utilities').pickElementFromArray(parameters);

            returnValue = this.getParameterCombination(parameter);
        }

        // Recursive case: |parameters| is a dictionary. Recursively call each key.
        else if (typeof parameters === 'object') {
            const parameterCombination = {};

            Object.keys(parameters).forEach(key => {
                parameterCombination[key] = this.getParameterCombination(parameters[key]);
            });

            returnValue = parameterCombination;
        }

        // Base case: Found a non-object and non-array parameter.
        else {
            returnValue = parameters;
        }

        return returnValue;
    }

    /**
        Makes the level selecting random values from the parameters list.
        @method make
        @param {Number} levelIndex The number of the level to build.
        @return {Level} The newly made level
    */
    make(levelIndex) {
        const levelTemplate = this.levelTemplates[levelIndex];
        const levelParameters = this.getParameterCombination(levelTemplate.parameters);
        const testParameters = $.extend({}, levelParameters, levelTemplate.test.parameters);
        const testInput = this.getProgramInput(testParameters) || '';
        const parameters = { level: levelParameters, test: testParameters };
        const levelType = levelTemplate.levelType;

        // Set parameter values in the code of the different files
        const files = levelTemplate.files.map(file => new ProgramFile(file.filename, file.programParts, levelParameters, levelType));

        // Use the parameters for the |explanation|, |prompt| and |solutionCode|.
        const explanation = levelTemplate.explanation(levelParameters);
        const prompt = levelTemplate.prompt(levelParameters);
        const solutionCode = levelTemplate.solutionCode(levelParameters);

        this.shownLevels[levelIndex].add(JSON.stringify(levelParameters));

        return new Level(prompt, explanation, solutionCode, levelTemplate.language, levelTemplate.test.main,
                         parameters, levelTemplate.testTemplate, testInput, files, levelType);
    }

    /**
        Get program input, checks all parameters searching for a 'programInput' key and returns its value.
        @method getProgramInput
        @param {Object} parameters The parameters of the level
        @return {String} The input for the program.
    */
    getProgramInput(parameters) {
        let input = null;

        // Base case: When |parameters| is NOT an object, return null.
        if (typeof parameters === 'object') {

            // Base case: |parameters| contains a 'programInput' key, use it.
            if (parameters.hasOwnProperty('programInput')) {
                input = parameters.programInput;
            }

            // Recursive case: |parameters| is a dictionary. Recursively check each key.
            else {
                Object.keys(parameters).forEach(key => {
                    input = this.getProgramInput(parameters[key]) || input;
                });
            }
        }

        return input;
    }
}
