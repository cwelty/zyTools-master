/**
    The name and regular expression defining a type of token.
    @class TokenType
    @constructor
    @param {String} name The name of the token type.
    @param {RegExp} regularExpression The regular expression defining this type of token.
*/
function TokenType(name, regularExpression) {
    this.name = name;
    this.regularExpression = regularExpression;
}
