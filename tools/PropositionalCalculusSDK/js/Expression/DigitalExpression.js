'use strict';

/* global ExpressionPart, Constant, Expression, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS */

/* exported buildDigitalExpressionPrototype */

/**
    Expressions using digital design printing standards.
    @class DigitalExpression
    @extends Expression
    @constructor
    @param {MathSymbol} root The root symbol of the expression.
*/
function DigitalExpression(root) {
    Expression.prototype.constructor.call(this, root);
    this.utilities = require('utilities');
}

/**
    Build the prototype.
    @method buildDigitalExpressionPrototype
    @return {void}
*/
function buildDigitalExpressionPrototype() {
    DigitalExpression.prototype = new Expression();
    DigitalExpression.prototype.constructor = DigitalExpression;

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.shouldPrintParens = function(symbol, parentSymbol) {

        // |root| does not need parens since entire expression doesn't need to be in parens.
        const symbolIsRoot = symbol.is(this.root);

        // NOT does not need parens. Ex: a'
        const symbolIsNot = (symbol.name === OPERATOR_SYMBOLS.NOT);

        // AND does not have parens. Ex: ab
        const symbolIsAnd = (symbol.name === OPERATOR_SYMBOLS.AND);
        const generalReasonsToNotHaveParens = symbolIsRoot || symbolIsAnd || symbolIsNot;

        /*
            Usually AND does not have parens, but if |parentSymbol| is NOT, then add parens.
            Ex: (ab)'
        */
        const parentSymbolIsNot = parentSymbol && (parentSymbol.name === OPERATOR_SYMBOLS.NOT);
        const symbolIsAndParentSymbolIsNot = symbolIsAnd && parentSymbolIsNot;

        // |symbol| is not |root| but is AND. Also, |symbol| has a child that is a Constant.
        let symbolIsAndAChildIsConstant = false;

        if (symbolIsAnd) {
            symbolIsAndAChildIsConstant = ((symbol.children[0] instanceof Constant) || (symbol.children[1] instanceof Constant));
        }
        const symbolIsNotRootButIsAndAChildIsConstant = !symbolIsRoot && symbolIsAndAChildIsConstant;

        /*
            Usually AND does not have parens, but if one of the childs is an OR operator, then add parens.
            Avoid y AND (x AND (z OR z')) to be printed the same as (y AND z) AND (z OR z')
            Ex: y(x(z+z'))
        */
        let symbolIsAndAChildIsOr = false;

        if (symbolIsAnd) {
            symbolIsAndAChildIsOr = ((symbol.children[0].name === 'OR') || (symbol.children[1].name === 'OR'));
        }

        const symbolIsNotRootButIsAndAChildIsOr = !symbolIsRoot && symbolIsAndAChildIsOr;

        return !generalReasonsToNotHaveParens || symbolIsAndParentSymbolIsNot ||
                symbolIsNotRootButIsAndAChildIsConstant || symbolIsNotRootButIsAndAChildIsOr;
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printConstantSymbol = function(constant) {
        return ((constant.name === CONSTANT_SYMBOLS.TRUE) ? '1' : '0');
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printNotOperator = function(parts, symbol) {
        parts.push(new ExpressionPart('\'', symbol));
        return parts;
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printAndOperator = function(parts, andOperator) {

        // If either child is a Constant, use the multiplication symbol.
        var aChildIsConstant = ((andOperator.children[0] instanceof Constant) || (andOperator.children[1] instanceof Constant));

        if (aChildIsConstant) {
            parts.push(new ExpressionPart(this.utilities.multiplicationSymbol, andOperator));
        }

        return parts.concat(this._toPartsHelper(andOperator.children[1], andOperator));
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printOrOperator = function(parts, orOperator) {
        parts.push(new ExpressionPart('+', orOperator));
        return parts.concat(this._toPartsHelper(orOperator.children[1], orOperator));
    };

    /**
        Make a clone of this expression.
        @method clone
        @return {DigitalExpression} A clone of this expression.
    */
    DigitalExpression.prototype.clone = function() {
        return Expression.prototype.clone.call(this, new DigitalExpression());
    };
}
