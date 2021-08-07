/* global HandlebarsComplete, LevelFile */
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
        if ('code' in levelJSON.parameters) {
            alert('Error: Parameters list contains reserved name: code'); // eslint-disable-line no-alert
        }

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

        // Compile the unit tests. If there are multiple, then compile each one.
        const unitTests = $.isArray(levelJSON.unitTests) ? levelJSON.unitTests : [ levelJSON.unitTests ];

        /**
            The unit tests as a template, or array of templates.
            @property unitTests
            @type {Array} of {Function}
        */
        this.unitTests = unitTests.map(unitTest => this.compileUnitTest(unitTest));

        /**
            The templates for each file.
            @property files
            @type {Array}
        */
        this.files = levelJSON.files.map(fileJSON => new LevelFile(fileJSON));

        /**
            The solution to the level as a template.
            @property solution
            @type {Function}
        */
        this.solution = HandlebarsComplete.compile(unescapeHTML(levelJSON.solution));
    }

    /**
        Compile the given unit test with Handlebars.
        @method compileUnitTest
        @param {String} unitTest The unit test to compile with Handlebars.
        @return {Function} The compiled unit test.
    */
    compileUnitTest(unitTest) {
        return HandlebarsComplete.compile(require('utilities').unescapeHTML(unitTest));
    }
}
