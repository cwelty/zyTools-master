/* global HandlebarsComplete, ProgramTemplate */
/* exported LevelTemplate */
'use strict';

/**
    LevelTemplate stores a template for a level. Template code, solution, prompt, explanation, input...
    @class LevelTemplate
*/
class LevelTemplate {

    /**
        Initialize the LevelTemplate
        @constructor
        @param {String} language The programming language of code.
        @param {String} prompt The template prompt of the level.
        @param {String} explanation The template explanation.
        @param {String} solution The template solution code.
        @param {Object} parameters Parameters that randomize the level.
        @param {Object} program An object that can contain prefix, student, and postfix elements, or an array of such objects.
        @param {Array} input The input for the program. Can be a string if it's only one.
        @param {Array} [outputFilenames=[]] An array of output file names.
    */
    constructor({ language, prompt, explanation, solution, parameters, program, input, outputFilenames = [] }) {
        this.language = language;
        this.prompt = HandlebarsComplete.compile(prompt);
        this.explanation = explanation && HandlebarsComplete.compile(explanation);
        this.solution = HandlebarsComplete.compile(solution);
        this.parameters = parameters;
        this.program = new ProgramTemplate(program, language);
        this.outputFilenames = outputFilenames.map(filename => HandlebarsComplete.compile(filename));

        const inputsList = typeof input === 'string' ? [ input ] : input;

        this.inputs = inputsList.map(inputElement => HandlebarsComplete.compile(inputElement));
    }
}
