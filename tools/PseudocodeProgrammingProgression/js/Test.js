/* global HandlebarsComplete */
/* exported Test */
'use strict';

/**
    Stores a test, which is an input and a number of points the test is worth.
    @class Test
*/
class Test {

    /**
        Initialize the Level.
        @constructor
        @param {Object} testJSON JSON representation of a test.
    */
    constructor(testJSON) {

        // testJSON may be the string input, so default of 1 point is given.
        let input = testJSON;
        let points = 1;

        if (typeof testJSON === 'object') {
            input = testJSON.input;
            points = testJSON.points;
        }

        /**
            The input to test.
            @property input
            @type {String}
        */
        this.input = HandlebarsComplete.compile(require('utilities').unescapeHTML(input));

        /**
            The number of points this test is worth.
            @property points
            @type {Integer}
        */
        this.points = points;
    }

    /**
        Apply the given parameters to input.
        @method applyParameters
        @param {Object} parameters The parameters the apply.
        @return {void}
    */
    applyParameters(parameters) {
        const clone = new Test('');

        clone.input = this.input(parameters);
        clone.points = this.points;

        return clone;
    }
}
