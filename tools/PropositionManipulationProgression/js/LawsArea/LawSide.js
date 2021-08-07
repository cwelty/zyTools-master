'use strict';

/* exported LawSide */

/**
    Models one side of a law.
    @class LawSide
    @constructor
    @param {MathSymbol} symbol The symbolic expression for this side of the law.
    @param {Boolean} isButton Whether this side of the law is a button.
    @param {Array} [terms=[]] Array of {MathSymbol}. The terms from this expression.
    @param {String} [manipulation=''] The name of the manipulation for this law side.
*/
function LawSide(symbol, isButton, terms, manipulation) {
    this.symbol = symbol;
    this.isButton = isButton;
    this.terms = terms || [];
    this.html = '';
    this.manipulation = manipulation || '';
}
