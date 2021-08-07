'use strict';

/* exported BinaryOperatorSymbol */
/* global OperatorSymbol */

/**
    Model a binary operator symbol, which has two children.
    @class BinaryOperatorSymbol
    @extends OperatorSymbol
*/
class BinaryOperatorSymbol extends OperatorSymbol {

    /**
        @constructor
        @param {String} operator The operator for this symbol.
    */
    constructor(operator) {
        super(operator);

        /**
            List of operators that are left-associative.
            @property leftAssociativities
            @type {Array} of {String}
        */
        this.leftAssociativities = [ '*', '/', '%', '+', '-', '<', '>', '>=', '<=', '==', '!=', 'and', 'or' ];

        /**
            Lookup dictionary for the precedence of each operator.
            @property precedences
            @type {Dictionary}
        */
        this.precedences = {
            '*': 3,
            '/': 3,
            '%': 3,
            '+': 4,
            '-': 4,
            '<': 5,
            '>': 5,
            '>=': 5,
            '<=': 5,
            '==': 6,
            '!=': 6,
            and: 7,
            or: 8,
        };
    }

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'BinaryOperatorSymbol';
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {BinaryOperatorSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const clone = new BinaryOperatorSymbol(this.operator);

        clone.children[0] = this.children[0].clone(arrayOfVariables);
        clone.children[1] = this.children[1].clone(arrayOfVariables);

        return clone;
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        const clone = new BinaryOperatorSymbol(this.operator);

        clone.children[0] = this.children[0].shallowCopy();
        clone.children[1] = this.children[1].shallowCopy();

        return clone;
    }

    /**
        Return whether the operator is left-associative.
        @method isLeftAssociative
        @return {Boolean} Whether the operator is left-associative.
    */
    isLeftAssociative() {
        return this.leftAssociativities.includes(this.operator);
    }

    /**
        Return the precedence of the operator.
        @method getPrecedence
        @return {Integer} The precedence of the operator.
    */
    getPrecedence() {
        return this.precedences[this.operator];
    }
}
