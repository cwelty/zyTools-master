/* global HandlebarsComplete, ProgramFile, javaBoilerplate, cBoilerplate, cppBoilerplate, cBoilerplateFunctions, cppBoilerplateFunctions */
/* exported LevelTemplate */
'use strict';

/**
    LevelTemplate stores the testTemplate for the files, explanation, prompt and solution of a level.
    @class LevelTemplate
*/
class LevelTemplate {

    /**
        Initialize the LevelTemplate
        @constructor
        @param {String} language The programming language of this level.
        @param {String} prompt The template prompt of the level.
        @param {String} [explanation=""] The template explanation, defaults to an empty string if not defined.
        @param {String} solutionCode The template solution code.
        @param {Object} parameters Each element contains an {Array} of {String}. Parameters that randomize the level.
        @param {ProgramFile} files {Array} of {ProgramFile} objects containing the different files of the program.
        @param {String} test The testing definition.
        @param {String} levelType The type of level. Ex: default (just some code in main function), function (student defines a function)...
    */
    constructor(language, prompt, explanation = '', solutionCode, parameters, files, test, levelType) { // eslint-disable-line max-params
        this.language = language;
        this.prompt = HandlebarsComplete.compile(prompt);
        this.solutionCode = HandlebarsComplete.compile(solutionCode);
        this.test = test;
        this.parameters = parameters;
        this.levelType = levelType || 'default';

        const boilerplateDictionary = {
            cdefault: cBoilerplate,
            cfunction: cBoilerplateFunctions,
            cppdefault: cppBoilerplate,
            cppfunction: cppBoilerplateFunctions,
            javadefault: javaBoilerplate,
        };

        this.testTemplate = HandlebarsComplete.compile(boilerplateDictionary[`${this.language}${this.levelType}`]);
        this.utilities = require('utilities');
        this.explanation = HandlebarsComplete.compile(explanation.replace(/\n/g, this.utilities.getNewline()));
        this.files = files.map(file => {
            let filename = file.filename;

            // If it's a Java CA and the filename doesn't end in 'java', then it's the wrong filename. Detect the correct one and set it.
            if ((language === 'java') && !(file.filename.endsWith('java'))) {
                const javaClassNameRegex = /public\s+class\s+([A-z0-9_]*)/;
                const regexMatch = file.program.classDefinition.match(javaClassNameRegex);

                if (regexMatch.length > 1) {
                    filename = `${regexMatch[1]}.java`;
                }
                else {
                    alert(`Wrong filename: ${file.filename}`); // eslint-disable-line no-alert
                }
            }

            return new ProgramFile(filename, file.program, {}, this.levelType);
        });
    }
}
