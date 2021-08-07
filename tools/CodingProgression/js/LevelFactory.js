/* global Level */
/* exported LevelFactory */
'use strict';

/**
    LevelFactory builds levels. Also stores shown levels to count them.
    @class LevelFactory
*/
class LevelFactory {

    /**
        Initializes the {LevelFactory} object.
        @constructor
        @param {Array} levelTemplates Contains a {LevelTemplate} object for each level.
        @param {Boolean} useTextarea Whether the area to write code is a textarea or ace editor.
    */
    constructor(levelTemplates, useTextarea) {
        this.levelTemplates = levelTemplates;
        this.shownLevels = levelTemplates.map(() => new Set());
        this.useTextarea = useTextarea;
    }

    /**
        Makes the level selecting random values from the parameters list.
        @method make
        @param {Number} levelIndex The number of the level to build.
        @return {Level} The newly made level
    */
    make(levelIndex) {
        const levelTemplate = this.levelTemplates[levelIndex];
        const levelParameters = levelTemplate.parameters;
        let parameters = {};
        let pythonModule = null;
        const utilities = require('utilities');

        if (typeof levelParameters === 'string') {
            pythonModule = utilities.makePythonModuleWithErrorCheck(levelParameters);
            if (!pythonModule) {
                return null;
            }
        }
        else {
            parameters = utilities.getParameterCombination(levelParameters);
        }

        let prompt = levelTemplate.prompt(parameters);
        let explanation = levelTemplate.explanation && levelTemplate.explanation(parameters);
        let solutionCode = levelTemplate.solution(parameters);
        let inputs = levelTemplate.inputs.map(input => input(parameters));
        const files = levelTemplate.program.getRandomizedProgramFiles(parameters, pythonModule);
        let outputFilenames = levelTemplate.outputFilenames.map(filename => filename(parameters));

        if (pythonModule) {
            prompt = utilities.replaceStringVariables(prompt, pythonModule);
            explanation = explanation && utilities.replaceStringVariables(explanation, pythonModule);
            solutionCode = utilities.replaceStringVariables(solutionCode, pythonModule);
            inputs = inputs.map(input => utilities.replaceStringVariables(input, pythonModule));
            outputFilenames = outputFilenames.map(filename => utilities.replaceStringVariables(filename, pythonModule));
        }
        const level = new Level({
            language: levelTemplate.language,
            prompt,
            explanation,
            solutionCode,
            inputs,
            files,
            useTextarea: this.useTextarea,
            outputFilenames,
        });

        this.shownLevels[levelIndex].add(JSON.stringify(level));

        return level;
    }
}
