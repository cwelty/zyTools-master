/**
    Structure to store a line of code, that line's number, and that line as tokens.
    @class TokensOfLine
    @constructor
    @param {String} line A line of code.
    @param {Number} lineNumber
*/
function TokensOfLine(line, lineNumber) {
    this.line = line;
    this.lineNumber = lineNumber;
    this.tokens = [];
}

/**
    Add |token| to |tokens|.
    @method addToken
    @param {Token} token Token to add to |tokens|.
    @return {void}
*/
TokensOfLine.prototype.addToken = function(token) {
    this.tokens.push(token);
};