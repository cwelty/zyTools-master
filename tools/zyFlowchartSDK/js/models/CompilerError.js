'use strict';

/* exported CompilerError */

/**
    An error that occurs during compilation.
    @class CompilerError
*/
class CompilerError {

    /**
        @constructor
        @param {String} errorMessage The compilation error message.
        @param {TokensOfLine} line The line with the error.
        @param {String} [suggestion=''] A suggestion on how to address the error.
    */
    constructor(errorMessage, line, suggestion = '') {
        const suggestionMessage = suggestion ? `\n${suggestion}` : '';

        /**
            The compiler error message.
            @property message
            @type {String}
        */
        this.message = `Line ${line.lineNumber}: ${errorMessage}${suggestionMessage}`;

        /**
            The line number with the error.
            @property lineNumber
            @type {Integer}
        */
        this.lineNumber = line.lineNumber;
    }

    /**
        Return the error message as a string.
        @method toString
        @return {String} The error message as a string.
    */
    toString() {
        return this.message;
    }
}
