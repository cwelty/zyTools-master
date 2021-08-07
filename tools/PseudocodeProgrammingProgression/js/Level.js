/* global HandlebarsComplete, Test */
/* exported Level */
'use strict';

/**
    Stores a level with template prompt, solution code, unit tests, and files.
    @class Level
*/
class Level {

    /**
        Initialize the Level.
        @constructor
        @param {Object} levelJSON JSON representation of a level.
    */
    constructor(levelJSON) {

        /**
            Dictionary of parameters used to create specific level instances from a level.
            @property parameters
            @type {Object}
        */
        this.parameters = levelJSON.parameters;

        const unescapeHTML = require('utilities').unescapeHTML;

        /**
            The question prompt as a template.
            @property prompt
            @type {Function}
        */
        this.prompt = HandlebarsComplete.compile(unescapeHTML(levelJSON.prompt));

        // Each part of the code is optional.
        const pre = (levelJSON.code && levelJSON.code.pre) || '';
        const placeholder = (levelJSON.code && levelJSON.code.placeholder) || '\nPLACEHOLDER_TEXT\n';
        const post = (levelJSON.code && levelJSON.code.post) || '';

        /**
            The question code as a template with three properties: pre, placeholder, and post.
            @property code
            @type {Object}
        */
        this.code = {
            pre: HandlebarsComplete.compile(unescapeHTML(pre)),
            placeholder: HandlebarsComplete.compile(unescapeHTML(placeholder)),
            post: HandlebarsComplete.compile(unescapeHTML(post)),
        };

        /**
            The solution to the level as a template.
            @property solution
            @type {Function}
        */
        this.solution = HandlebarsComplete.compile(unescapeHTML(levelJSON.solution));

        const inputs = levelJSON.inputs || [ '' ];

        /**
            The inputs to test the code as a template.
            @property tests
            @type {Array} of {Function}
        */
        this.tests = inputs.map(input => new Test(input));

        /**
            The templatized explanation for this level.
            @property explanation
            @type {Function}
        */
        this.explanation = HandlebarsComplete.compile(unescapeHTML(levelJSON.explanation || ''));
    }
}
