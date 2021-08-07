'use strict';

/* global Operator, Variable, Constant, ExpressionPart, OPERATOR_SYMBOLS */

/**
    Expression is an abstract object that represents an expression as a tree structure. Ex: x + y'
    @class Expression
    @constructor
    @param {MathSymbol} root The symbol at the top of the tree.
*/
function Expression(root) {
    this.root = root;
}

/**
    Return the parent of |symbolToFind|. Return null if parent not found.
    @method parentOf
    @param {MathSymbol} symbolToFind The symbol whose parent is to be found.
    @return {MathSymbol} The parent of |symbolToFind|.
*/
Expression.prototype.parentOf = function(symbolToFind) {
    if (!symbolToFind.is(this.root)) {
        return this.parentOfHelper(symbolToFind, this.root);
    }
    return null;
};

/**
    Search for the parent of |symbolToFind| by traversing from |currentSymbol|. Return null if parent not found.
    @method parentOfHelper
    @private
    @param {MathSymbol} symbolToFind The symbol to find.
    @param {MathSymbol} currentSymbol The current symbol in the traversal.
    @return {MathSymbol} The parent of |symbolToFind|.
*/
Expression.prototype.parentOfHelper = function(symbolToFind, currentSymbol) {
    var parent = null;

    // If |currentSymbol| is not an Operator, then we've hit a dead end.
    if (currentSymbol instanceof Operator) {

        // Check if |symbolToFind| is one of |currentSymbol|'s children.
        var childrenSymbolsThatMatchSymbolToFind = currentSymbol.children.filter(function(child) {
            return symbolToFind.is(child);
        });

        if (childrenSymbolsThatMatchSymbolToFind.length === 1) {
            parent = currentSymbol;
        }
        else {
            var self = this;
            var parentSymbol = null;

            currentSymbol.children.forEach(function(child) {
                parentSymbol = parentSymbol || self.parentOfHelper(symbolToFind, child);
            });
            parent = parentSymbol;
        }
    }

    return parent;
};

/**
    Print the expression.
    @method print
    @return {String} The printed current symbol.
*/
Expression.prototype.print = function() {
    return this.toParts().map(function(part) {
        return part.output;
    }).join('');
};

/**
    Return an array of expression parts.
    @method toParts
    @return {Array} Array of {ExpressionPart} wherein each object stores output and symbol.
*/
Expression.prototype.toParts = function() {
    return this._toPartsHelper(this.root, null);
};

/**
    Return an array of expression parts via depth-first traversal from |root|.
    @method _toPartsHelper
    @private
    @param {MathSymbol} symbol The current symbol in the traversal to be printed.
    @param {Operator} parentSymbol The parent of |symbol|.
    @return {Array} Array of {ExpressionPart} wherein each object stores output and symbol.
*/
Expression.prototype._toPartsHelper = function(symbol, parentSymbol) {
    var parts = [];

    if (symbol instanceof Variable) {
        parts.push(new ExpressionPart(symbol.name, symbol));
    }
    else if (symbol instanceof Constant) {
        parts.push(new ExpressionPart(this.printConstantSymbol(symbol), symbol));
    }
    else if (symbol instanceof Operator) {
        var openingEnclosure = this.addOpeningEnclosure(symbol, parentSymbol);

        if (openingEnclosure) {
            parts.push(new ExpressionPart(openingEnclosure, symbol));
        }

        parts = parts.concat(this._toPartsHelper(symbol.children[0], symbol));

        var operatorFunction = this.operatorNameToFunction(symbol.name);

        parts = operatorFunction.call(this, parts, symbol);

        var closingEnclosure = this.addClosingEnclosure(symbol, parentSymbol);

        if (closingEnclosure) {
            parts.push(new ExpressionPart(closingEnclosure, symbol));
        }
    }

    return parts;
};

/**
    Convert the given operator name to that operator's print function.
    @method operatorName
    @param {String} operatorName The name of the operator.
    @return {Function} The print function for the given operator name.
*/
Expression.prototype.operatorNameToFunction = function(operatorName) {
    var operatorFunction = null;

    switch (operatorName) {
        case OPERATOR_SYMBOLS.NOT:
            operatorFunction = this.printNotOperator;
            break;
        case OPERATOR_SYMBOLS.AND:
            operatorFunction = this.printAndOperator;
            break;
        case OPERATOR_SYMBOLS.OR:
            operatorFunction = this.printOrOperator;
            break;
        case OPERATOR_SYMBOLS.CONDITIONAL:
            operatorFunction = this.printConditionalOperator;
            break;
        case OPERATOR_SYMBOLS.BICONDITIONAL:
            operatorFunction = this.printBiconditionalOperator;
            break;
        default:
            throw new Error('Unknown operator named: ' + operatorName);
    }

    return operatorFunction;
};

/**
    Return the opening enclosure (such as an opening parens) if one is appropriate.
    @method addOpeningEnclosure
    @private
    @param {MathSymbol} symbol The first symbol in the sub-expression.
    @param {MathSymbol} parentSymbol The parent of |symbol|.
    @return {String} The opening of a sub-expression.
*/
Expression.prototype.addOpeningEnclosure = function(symbol, parentSymbol) {
    return (this.shouldPrintParens(symbol, parentSymbol) ? '(' : '');
};

/**
    Return the closing enclosure (such as a closing parens) if one is appropriate.
    @method addClosingEnclosure
    @private
    @param {MathSymbol} symbol The first symbol in the sub-expression.
    @param {MathSymbol} parentSymbol The parent of |symbol|.
    @return {String} The closing of a sub-expression.
*/
Expression.prototype.addClosingEnclosure = function(symbol, parentSymbol) {
    return (this.shouldPrintParens(symbol, parentSymbol) ? ')' : '');
};

/**
    Return whether to print parens based on the current symbol and that symbol's parent.
    @method shouldPrintParens
    @private
    @param {MathSymbol} symbol The symbol part of deciding whether to print a parens.
    @param {Operator} parentSymbol The parent of |symbol|.
    @return {Boolean} Whether to print a parens.
*/
Expression.prototype.shouldPrintParens = function() {
    throw new Error('Expression\'s shouldPrintParens is undefined.');
};

/**
    Return a string of the |constant|. Ex: If |constant| stores CONSTANT_SYMBOLS.TRUE, then return 'T'.
    @method printConstantSymbol
    @private
    @param {Constant} constant The constant to print.
    @return {String} The string version of the given constant.
*/
Expression.prototype.printConstantSymbol = function() {
    throw new Error('Expression\'s printConstantSymbol is undefined.');
};

/**
    Print the NOT operator and the operator's first child.
    @method printNotOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the NOT operator.
    @param {MathSymbol} symbol The not operator's symbol.
    @return {String} NOT operator and the operator's first child.
*/
Expression.prototype.printNotOperator = function() {
    throw new Error('Expression\'s printNotOperator is undefined.');
};

/**
    Print the AND operator and the operator's first child.
    @method printAndOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the AND operator.
    @param {Operator} andOperator The operator to print.
    @return {String} AND operator and the operator's first child.
*/
Expression.prototype.printAndOperator = function() {
    throw new Error('Expression\'s printAndOperator is undefined.');
};

/**
    Print the OR operator and the operator's first child.
    @method printOrOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the OR operator.
    @param {Operator} orOperator The operator to print.
    @return {String} OR operator and the operator's first child.
*/
Expression.prototype.printOrOperator = function() {
    throw new Error('Expression\'s printOrOperator is undefined.');
};

/**
    Print the CONDITIONAL operator and the operator's first child.
    @method printConditionalOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the CONDITIONAL operator.
    @param {Operator} conditionalOperator The operator to print.
    @return {String} CONDITIONAL operator and the operator's first child.
*/
Expression.prototype.printConditionalOperator = function() {
    throw new Error('Expression\'s printConditionalOperator is undefined.');
};

/**
    Print the BICONDITIONAL operator and the operator's first child.
    @method printBiconditionalOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the BICONDITIONAL operator.
    @param {Operator} biconditionalOperator The operator to print.
    @return {String} BICONDITIONAL operator and the operator's first child.
*/
Expression.prototype.printBiconditionalOperator = function() {
    throw new Error('Expression\'s printBiconditionalOperator is undefined.');
};

/**
    Make a clone of this expression.
    @method clone
    @param {Expression} newExpression A copy of the cloned expression.
    @return {Expression} A clone of this expression.
*/
Expression.prototype.clone = function(newExpression) {
    newExpression.root = this.root.clone();
    return newExpression;
};
