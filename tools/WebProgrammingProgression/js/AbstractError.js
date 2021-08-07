/* exported AbstractError */
'use strict';

/**
    An abstract error used by the progression.
    @class AbstractError
    @abstract
*/
class AbstractError {

    /**
        @constructor
        @param {String} message The error message.
        @param {String} type The type of error.
    */
    constructor(message, type) {

        /**
            The error message.
            @property message
            @type {String}
        */
        this.message = message;

        /**
            The type of error.
            @property type
            @type {String}
        */
        this.type = type;
    }
}
