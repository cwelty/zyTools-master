'use strict';

/* exported Question */

/**
    A given initial symbolic expression and the expected symbolic expression that the user is expected to make.
    @class Question
    @constructor
    @param {MathSymbol} initialSymbol The initial symbolic expression the user is given.
    @param {Array} expectedSymbols Array of {MathSymbol}. The expected symbolic expressions for the user's answer.
*/
function Question(initialSymbol, expectedSymbols) {
    this.initialSymbol = initialSymbol;
    this.expectedSymbols = expectedSymbols;
}
