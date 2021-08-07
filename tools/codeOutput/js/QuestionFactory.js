/* global Question, ProgramFile, isLanguageAZyFlowchart, HandlebarsComplete */
/* exported QuestionFactory */
'use strict';

/**
    Stores parameterized levels. Used to generate a specific question for a given level number.
    @class QuestionFactory
*/
class QuestionFactory {

    /**
        Initializes the {QuestionFactory} object.
        @constructor
        @param {Array} levels {Array} of {Level}. Contains a {Level} object for each level.
        @param {String} globalCode Python randomization code shared between levels.
    */
    constructor(levels, globalCode) {

        /**
            List of {Level} for the progression.
            @property levels
            @type {Array}
        */
        this.levels = levels;

        /**
            A set of already shown questions.
            @property shownLevels
            @type {Set}
        */
        this.shownLevels = levels.map(() => new Set());

        /**
            Python randomization code shared between levels.
            @property globalCode
            @type {String}
        */
        this.globalCode = globalCode;
    }

    /**
        Makes a question selecting random values from the parameters list.
        @method make
        @param {Number} levelIndex The number of the level to build.
        @return {Question} The newly made question.
    */
    make(levelIndex) {
        const level = this.levels[levelIndex];
        const levelParameters = level.parameters;
        const isPythonRandomization = typeof levelParameters !== 'object';
        let parameters = {};
        let pythonModule = null;
        const utilities = require('utilities');
        let explanation = '';
        let input = '';
        let outputFilename = '';

        if (isPythonRandomization) {
            const pythonCode = `${this.globalCode}\n\n${levelParameters}`;

            pythonModule = utilities.makePythonModuleWithErrorCheck(pythonCode);
            if (!pythonModule) {
                return null;
            }
            explanation = utilities.replaceStringVariables(level.explanation(), pythonModule);
            input = utilities.replaceStringVariables(level.input(), pythonModule);
            outputFilename = utilities.replaceStringVariables(level.outputFilename(), pythonModule);
        }
        else {
            parameters = utilities.getParameterCombination(levelParameters);
            input = level.input(parameters);
            outputFilename = level.outputFilename(parameters);
        }

        // Remove the helper while we build the code.
        if (isLanguageAZyFlowchart(level.language)) {
            HandlebarsComplete.registerHelper(
                'executeForFinalValueOf',
                () => '|Error: executeForFinalValueOf only for explanation|'
            );
        }

        // Set parameter values in the code of the different files
        const files = level.files.map(file => {
            let programCode = '';
            let filename = '';

            if (isPythonRandomization) {
                programCode = utilities.replaceStringVariables(file.program(), pythonModule);
                filename = utilities.replaceStringVariables(file.filename(), pythonModule);
            }
            else {
                programCode = file.program(parameters);
                filename = file.filename(parameters);
            }

            // If file is named main.java it's likely the default name, which means it wasn't manually set. So we will try to guess.
            if (filename === 'main.java') {

                // Stole from https://github.com/zyBooks/zyDE/blob/master/app.py#L625
                const classNameRegex = /public\s*class\s*([a-zA-Z0-9_]*)/;
                const classNameMatch = programCode.match(classNameRegex);
                let className = null;

                if (classNameMatch) {
                    className = classNameMatch[1];
                }
                if (!className) {
                    window.alert('Failed to guess the file\'s name. Please name the file like the public class\'s name in the file.'); // eslint-disable-line no-alert
                }
                filename = className ? `${className}.java` : filename;
            }

            return new ProgramFile(filename, file.main, programCode);
        });

        const code = files.find(file => file.main).program;

        // Add helper to execute the program. Used for getting the final value of a variable.
        if (isLanguageAZyFlowchart(level.language)) {
            HandlebarsComplete.registerHelper('executeForFinalValueOf', variableName => {
                const executor = require('zyFlowchartSDK').create().makeExecutor(code, null, true);

                executor.enterExecution();

                const mainFunction = executor.stack[0].function;

                // Execute until program done.
                while (!executor.isExecutionDone()) {
                    executor.execute();
                }

                return mainFunction.getVariableValueByName(variableName);
            });
        }

        // Explanation needs to be processed after the |executeForFinalValueOf| helper is registered
        if (!isPythonRandomization) {
            explanation = level.explanation(parameters);
        }

        const question = new Question(code, explanation, level.language, input, files, outputFilename);

        this.shownLevels[levelIndex].add(JSON.stringify(question));

        return question;
    }
}
