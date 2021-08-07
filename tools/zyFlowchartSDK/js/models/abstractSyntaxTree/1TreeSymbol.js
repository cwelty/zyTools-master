'use strict';

/* exported TreeSymbol */

/**
    Abstact class modeling a symbol in an abstract syntax tree.
    @class TreeSymbol
*/
class TreeSymbol {

    /**
        @constructor
    */
    constructor() {

        /**
            The children of this symbol.
            @property children
            @type {Array} of {Symbol}
        */
        this.children = [];

        /**
            If TreeSymbol is inside parentheses in expression.
            @property isInsideParens
            @type {Boolean}
        */
        this.isInsideParens = false;
    }

    /**
        Return the name of this symbol class. Inheriting objects must override.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        throw new Error('TreeSymbol\'s getClassName function should be overridden');
    }

    /**
        Make a clone of this symbol. Inheriting objects must override.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {TreeSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) { // eslint-disable-line no-unused-vars
        throw new Error('TreeSymbol\'s clone function should be overridden');
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        throw new Error('TreeSymbol\'s shallowCopy function should be overridden');
    }

    /**
        Return whether this symbol is an operator.
        @method isAnOperator
        @return {Boolean} Whether this symbol is an operator.
    */
    isAnOperator() {
        return false;
    }

    /**
        Return whether this symbol is an operand.
        @method isAnOperand
        @return {Boolean} Whether this symbol is an operand.
    */
    isAnOperand() {

        /*
            An operand is either:
            * Not an operator
            * Has a child
        */
        return !this.isAnOperator() || Boolean(this.children[0]);
    }

    /**
        Whether the tree has the given symbol.
        @method has
        @param {TreeSymbol} symbol The symbol to search for.
        @return {Boolean} Whether the tree has the symbol.
    */
    has(symbol) {
        return (this === symbol) || this.children.some(child => child.has(symbol));
    }

    /**
        Return whether a memory cell contains the given token.
        @method memoryCellHasToken
        @param {Token} token The token to find.
        @param {Array} allTokens Array of {Tokens}. All the tokens from the expression that may contain a memory cell.
        @return {Boolean} Whether a memory cell contains the given token.
    */
    memoryCellHasToken(token, allTokens) {
        return this.children.some(child => child.memoryCellHasToken(token, allTokens));
    }
}
