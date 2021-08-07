'use strict';

/* exported TokensOfLine */

/**
    Model of the list of tokens in a line of code.
    @class TokensOfLine
*/
class TokensOfLine {

    /**
        @constructor
        @param {String} [line=''] The line of code.
        @param {Number} [lineNumber=-1] The line number of this line of code.
        @param {Integer} [startIndexOfSegment=null] The first index of the segment of the line to highlight during execution.
        @param {Integer} [endIndexOfSegment=null] The last index of the segment of the line to highlight during execution.
    */
    constructor(line = '', lineNumber = -1, startIndexOfSegment = null, endIndexOfSegment = null) {

        /**
            The line of code.
            @property line
            @type {String}
        */
        this.line = line;

        /**
            The line number of this line of code.
            @property lineNumber
            @type {Number}
        */
        this.lineNumber = lineNumber;

        /**
            The tokens on this line. This is modified during parsing.
            @property tokens
            @type {Array} of {Token}
            @default []
        */
        this.tokens = [];

        /**
            The original tokens on this line. This is not modified during parsing.
            @property allTokens
            @type {Array} of {Token}
            @default []
        */
        this.allTokens = [];

        /**
            List of the blank lines that immediately preceed this line.
            @property blankLinesAbove
            @type {Array} of {TokensOfLine}
            @default []
        */
        this.blankLinesAbove = [];

        /**
            The first index of |line| that is related to the particular segment. Ex:
            @property startIndexOfSegment
            @type {Integer}
        */
        this.startIndexOfSegment = startIndexOfSegment || 0;

        /**
            The first index of |line| that is related to the particular segment. Ex:
            @property endIndexOfSegment
            @type {Integer}
        */
        this.endIndexOfSegment = endIndexOfSegment || Math.max((line.length - 1), 0);

        /**
            Whether this token is from a for loop. Ex: The "i < 3" from "for i = 0; i < 3; i = i + 1".
            @property isFromForLoop
            @type {Boolean}
            @default false
        */
        this.isFromForLoop = false;
    }

    /**
        Push given token to list of tokens.
        @method push
        @param {Token} token The token to push.
        @return {void}
    */
    push(...token) {
        this.tokens.push(...token);
        this.allTokens.push(...token);
    }

    /**
        Store the given blank lines.
        @method pushBlankLines
        @param {Arrray} blankLines Array of {TokensOfLine}. The blank lines to store.
        @return {void}
    */
    pushBlankLines(blankLines) {
        this.blankLinesAbove.push(...blankLines);
    }

    /**
        Remove the space tokens.
        @method removeSpaces
        @return {void}
    */
    removeSpaces() {
        this.tokens = this.tokens.filter(token => token.name !== 'spaces');
    }
}
