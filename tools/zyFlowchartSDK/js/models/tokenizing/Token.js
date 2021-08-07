'use strict';

/* exported Token */

/**
    Model for a token, storing the token's name and value.
    @class Token
*/
class Token {

    /**
        @constructor
        @param {String} name The name of the token.
        @param {String} value The value of the token.
        @param {Number} startIndexInTheLine The index of the first letter of the token in the line.
    */
    constructor(name, value, startIndexInTheLine) {

        /**
            The name of the token.
            @property name
            @type {String}
        */
        this.name = name;

        /**
            The value of the token.
            @property value
            @type {String}
        */
        this.value = value;

        /**
            The index of the first letter of the token in the line.
            @property startIndexInTheLine
            @type {Number}
        */
        this.startIndexInTheLine = startIndexInTheLine;

        /**
            The index of the last letter of the token in the line.
            @property endIndexInTheLine
            @type {Number}
        */
        this.endIndexInTheLine = startIndexInTheLine + value.length - 1;
    }
}
