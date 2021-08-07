'use strict';

/* exported ExpressionPart */

/**
    A part of an expression, such as the variable a in: NOT a
    @class ExpressionPart
    @constructor
    @param {String} output The printable part of the expression.
    @param {MathSymbol} symbol Reference to the particular symbol that the output is associated with.
*/
function ExpressionPart(output, symbol) {
    this.output = output;
    this.symbol = symbol;
}
