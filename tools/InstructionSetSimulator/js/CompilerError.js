/**
    Store a message and line number as a compiler error.
    @class CompilerError
    @constructor
    @param {String} message The error message.
    @param {Number} lineNumber The line with the error.
*/
function CompilerError(message, lineNumber) {
    this.message    = message;
    this.lineNumber = lineNumber;
}