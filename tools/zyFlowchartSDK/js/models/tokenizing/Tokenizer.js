'use strict';

/* exported Tokenizer */
/* global TokensOfLine, tokenTypes, Token, TokenType */

/**
    Tokenizer for converting code into tokens.
    @class Tokenizer
*/
class Tokenizer {

    /**
        Convert the given code into a list of tokens.
        @method tokenize
        @param {String} code The code to tokenize.
        @return {Array} of {Array} of {Token} List of tokens for each line.
    */
    tokenize(code) {
        return code.split(/\r\n|\r|\n/).map((line, index) => this.tokenizeLine(line, index));
    }

    /**
        Tokenize the given line.
        @method tokenizeLine
        @param {String} line The line to tokenize.
        @param {Integer} lineIndex The index of the given line in the code.
        @return {Array} of {Token} List of tokens for this line.
    */
    tokenizeLine(line, lineIndex) {
        const lineNumber = lineIndex + 1;
        const tokensThisLine = new TokensOfLine(line, lineNumber);

        // If there is whitespace at the beginning of the line, then tokenize as "indent".
        const indentTokenType = new TokenType('indent', /^\s+/);
        let { tmpLine, hasAddedToken } = this.attemptToMatchTokenToLine(indentTokenType, line, tokensThisLine, line);

        while (tmpLine.length > 0) {
            for (let index = 0; index < tokenTypes.length; ++index) {
                ({ tmpLine, hasAddedToken } = this.attemptToMatchTokenToLine(tokenTypes[index], tmpLine, tokensThisLine, line));

                // Token type matched the next characters in |tmpLine|.
                if (hasAddedToken) {
                    break;
                }

                // No more token types to try.
                else if ((index + 1) === tokenTypes.length) {
                    throw new Error(`Unrecognized token near: ${tmpLine} (line ${lineNumber})`);
                }
            }
        }

        return tokensThisLine;
    }

    /**
        Try to match the token type to the line. If a match is found, add the token to the tokens this line.
        @method attemptToMatchTokenToLine
        @param {TokenType} tokenType The token type to attempt to match.
        @param {String} line The line of code on which to attempt to match.
        @param {TokensThisLine} tokensThisLine The tokens so far this line.
        @param {String} fullLine The full line of code on which to attempt to match. Unlike |line|, this is always the full line.
        @return {Object} The updated line and whether a token was added.
    */
    attemptToMatchTokenToLine(tokenType, line, tokensThisLine, fullLine) {
        let tmpLine = line;
        const match = tmpLine.match(tokenType.expression);
        const hasAddedToken = Boolean(match);

        // Token type matches the next characters in |tmpLine|.
        if (match) {
            const value = match[0];
            const newToken = new Token(tokenType.name, value, fullLine.length - line.length);

            tokensThisLine.push(newToken);

            // Remove matched characters from |tmpLine|.
            tmpLine = tmpLine.slice(match.index + value.length);
        }

        return { tmpLine, hasAddedToken };
    }
}
