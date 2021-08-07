/* exported Question */
'use strict';

/**
    A question to display to the user.
    @class Question
*/
class Question {

    /**
        Initialize the Question.
        @constructor
        @param {Object} parameters Combination of parameters used to create this specific question.
        @param {String} prompt The question prompt.
        @param {Object} code The initial code to show the user.
        @param {String} solution The solution for the question.
        @param {Array} tests Array of {test}. The tests to run.
        @param {String} explanation The explanation for this question.
    */
    constructor(parameters, prompt, code, solution, tests, explanation) { // eslint-disable-line max-params

        /**
            Combination of parameters used to create this specific question.
            @property parameters
            @type {Object}
        */
        this.parameters = parameters;

        /**
            The question prompt.
            @property prompt
            @type {String}
        */
        this.prompt = prompt;

        /**
            The initial code to show the user.
            @property code
            @type {Object}
        */
        this.code = code;

        /**
            The solution for the question.
            @property solution
            @type {String}
        */
        this.solution = solution;

        /**
            The tests to run.
            @property tests
            @type {Array} of {Test}
        */
        this.tests = tests;

        /**
            The explanation for this question.
            @property explanation
            @type {String}
        */
        this.explanation = explanation;
    }

    /**
        Return the initial code given to the user.
        @method getInitialCode
        @return {String} The initial code given to the user.
    */
    getInitialCode() {
        return this.code.pre + this.code.placeholder + this.code.post;
    }

    /**
        Return the solution as a complete program.
        @method getSolutionProgram
        @return {String} A program including the solution.
    */
    getSolutionProgram() {
        return this.code.pre + this.solution + this.code.post;
    }

    /**
        Return JSON representing this object.
        @method toJSON
        @return {Object} JSON representing this object.
    */
    toJSON() {
        return {
            parameters: this.parameters,
            prompt: this.prompt,
            code: this.code,
            solution: this.solution,
            tests: this.tests,
            explanation: this.explanation,
        };
    }
}
