'use strict';

/* global Button */

/* exported ExpressionContainer */

/**
    Model an expression container.
    @class ExpressionContainer
    @constructor
    @param {MathSymbol} symbol The symbolic expression this container stores.
*/
function ExpressionContainer(symbol) {
    this.symbol = symbol;
    this.html = '';
    this.isDisabled = true;
    this.isColored = false;
    this.undoButton = new Button();
    this.applyButton = new Button();
    this.nextButton = new Button();
}
