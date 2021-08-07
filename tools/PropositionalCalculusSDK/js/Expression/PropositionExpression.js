'use strict';

/* global ExpressionPart, Expression, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS */

/**
    Expressions using proposition printing standards.
    @class PropositionExpression
    @extends Expression
    @constructor
    @param {MathSymbol} root The root symbol of the expression.
*/
function PropositionExpression(root) {
    Expression.prototype.constructor.call(this, root);
    this.discreteMathUtilities = require('discreteMathUtilities');
}

PropositionExpression.prototype = new Expression();
PropositionExpression.prototype.constructor = PropositionExpression;

/**
    @inheritdoc
*/
PropositionExpression.prototype.shouldPrintParens = function(symbol) {

    // |root| does not need parens since entire expression doesn't need to be in parens.
    const symbolIsRoot = symbol.is(this.root);

    // NOT does not need parens. Ex: ¬a
    const symbolIsNot = (symbol.name === OPERATOR_SYMBOLS.NOT);

    return !symbolIsRoot && !symbolIsNot;
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printConstantSymbol = function(constant) {
    return ((constant.name === CONSTANT_SYMBOLS.TRUE) ? 'T' : 'F');
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printNotOperator = function(parts, symbol) {
    const notPart = [
        new ExpressionPart(this.discreteMathUtilities.notSymbol, symbol),
    ];

    return notPart.concat(parts);
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printAndOperator = function(parts, andOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.andSymbol, andOperator));
    return parts.concat(this._toPartsHelper(andOperator.children[1], andOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printOrOperator = function(parts, orOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.orSymbol, orOperator));
    return parts.concat(this._toPartsHelper(orOperator.children[1], orOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printConditionalOperator = function(parts, conditionalOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.conditionalSymbol, conditionalOperator));
    return parts.concat(this._toPartsHelper(conditionalOperator.children[1], conditionalOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printBiconditionalOperator = function(parts, biconditionalOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.biconditionalSymbol, biconditionalOperator));
    return parts.concat(this._toPartsHelper(biconditionalOperator.children[1], biconditionalOperator));
};

/**
    Make a clone of this expression.
    @method clone
    @return {PropositionExpression} A clone of this expression.
*/
PropositionExpression.prototype.clone = function() {
    return Expression.prototype.clone.call(this, new PropositionExpression());
};
