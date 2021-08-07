'use strict';

/* exported OperatorSymbol */
/* global TreeSymbol */

/**
    Abstact model of an operator symbol.
    @class OperatorSymbol
    @extends TreeSymbol
*/
class OperatorSymbol extends TreeSymbol {

    /**
        @constructor
        @param {String} operator The operator for this symbol.
    */
    constructor(operator) {
        super();

        /**
            The operator for this symbol.
            @property operator
            @type {String}
        */
        this.operator = operator;
    }

    /**
        Return whether this symbol is an operator.
        @method isAnOperator
        @return {Boolean} Whether this symbol is an operator.
    */
    isAnOperator() {
        return true;
    }

    /**
        Return whether the operator is left-associative.
        @method isLeftAssociative
        @return {Boolean} Whether the operator is left-associative.
    */
    isLeftAssociative() {
        throw new Error('OperatorSymbol\'s isLeftAssociative function should be overridden');
    }

    /**
        Return the precedence of the operator.
        @method getPrecedence
        @return {Integer} The precedence of the operator.
    */
    getPrecedence() {
        throw new Error('OperatorSymbol\'s getPrecedence function should be overridden');
    }
}
