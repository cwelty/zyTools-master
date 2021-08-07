/**
    Tokenize an instruction set.
    @class Tokenizer
    @constructor
    @param {Array} of {TokenType} tokenTypes The ordered list of token types to use for tokenizing.
*/
function Tokenizer(tokenTypes) {
    this._tokenTypes = tokenTypes;
}

/**
    Tokenize the given code.
    @method tokenize
    @param {String} code The code to tokenize.
    @return {Array} of {TokensOfLine} An array of line's tokens.
*/
Tokenizer.prototype.tokenize = function(code) {
    const lines = code.split(/\r\n|\r|\n/);
    var self = this;
    return lines.map(function(line, index) {
        var lineNumber = (index + 1);
        return self._tokenizeLine(line, lineNumber);
    });
};

/**
    Tokenize a |line| of code.
    @method _tokenizeLine
    @private
    @param {String} line The line to tokenize.
    @param {Number} lineNumber The line number of this line in the code.
    @return {TokensOfLine} The tokens for the given |line|.
*/
Tokenizer.prototype._tokenizeLine = function(line, lineNumber) {
    var tokensOfLine = new TokensOfLine(line, lineNumber);

    while (line.length > 0) {
        for (var i = 0; i < this._tokenTypes.length; ++i) {
            var tokenType = this._tokenTypes[i];
            var match = line.match(tokenType.regularExpression);

            // Token type matches the next characters in |line|.
            if (match) {
                var value = match[0];
                var newToken = new Token(tokenType.name, value);
                tokensOfLine.addToken(newToken);

                // Remove matched characters from |line|.
                line = line.slice(match.index + value.length);
                break;
            }
            // No more token types to try.
            else if ((i + 1) === this._tokenTypes.length) {
                throw new CompilerError('Unrecognized syntax near: ' + line, lineNumber);
            }
        }
    }

    return tokensOfLine;
}
