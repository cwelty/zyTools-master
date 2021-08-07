'use strict';

/* exported TokenType */

/**
    Model for a token type includes the name of the token type and the regular expression to capture that type.
    @class TokenType
*/
class TokenType {

    /**
        @constructor
        @param {String} name The name of the token type.
        @param {RegExp} expression The regular expression describing this token type.
    */
    constructor(name, expression) {

        /**
            The name of the token type.
            @property type
            @type {String}
        */
        this.name = name;

        /**
            The regular expression describing this token type.
            @property expression
            @type {RegExp}
        */
        this.expression = expression;
    }
}
