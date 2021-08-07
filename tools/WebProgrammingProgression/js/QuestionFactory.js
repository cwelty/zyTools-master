/* global Question */
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
        const prompt = level.prompt(parameters);
        const solution = level.solution(parameters);

        // Generate the placeholder code for the initial files.
        const codePlaceholder = 'Your solution goes here';
        const languageCommentMap = {
            html: `<!-- ${codePlaceholder} -->`,
            css: `/* ${codePlaceholder} */`,
            js: `/* ${codePlaceholder} */`,
        };
        const initialQuestionFiles = level.files.map(file => file.getInitialQuestionFile(parameters, languageCommentMap[file.language]));
        const expectedQuestionFiles = level.files.map(file => file.getExpectedQuestionFile(parameters, solution));

        return new Question({ prompt, initialQuestionFiles, expectedQuestionFiles, solution, unitTests: level.unitTests, parameters });
    }
}
