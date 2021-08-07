/* global Question, HandlebarsComplete */
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
    */
    constructor(levels) {

        /**
            List of {Level} for the progression.
            @property levels
            @type {Array}
        */
        this.levels = levels;
    }

    /**
        Makes a question selecting random values from the parameters list.
        @method make
        @param {Number} levelIndex The number of the level to build.
        @return {Question} The newly made question.
    */
    make(levelIndex) {
        const level = this.levels[levelIndex];
        const parameters = require('utilities').getParameterCombination(level.parameters);
        const placeholderText = '// Your solution goes here';

        // Remove the helper while we build the next solution.
        HandlebarsComplete.registerHelper(
            'executeSolutionWithInput',
            () => '|Error: executeSolutionWithInput only for prompt and explanation|'
        );

        const code = {
            pre: level.code.pre(parameters),
            placeholder: level.code.placeholder(parameters).replace('PLACEHOLDER_TEXT', placeholderText),
            post: level.code.post(parameters),
        };
        const solution = level.solution(parameters);
        const tests = level.tests.map(test => test.applyParameters(parameters));

        // Add helper to execute the solution program with the given input. Used for generating program output automatically.
        HandlebarsComplete.registerHelper('executeSolutionWithInput', input => {
            const inputFunction = HandlebarsComplete.compile(input);
            const inputToUse = inputFunction(parameters);
            const solutionProgram = code.pre + solution + code.post;
            const executor = require('zyFlowchartSDK').create().makeExecutor(solutionProgram, inputToUse, true);

            executor.enterExecution();

            // Execute until program done.
            while (!executor.isExecutionDone()) {
                executor.execute();
            }

            return executor.output.output;
        });

        const prompt = level.prompt(parameters);
        const explanation = level.explanation(parameters);

        return new Question(parameters, prompt, code, solution, tests, explanation);
    }
}
