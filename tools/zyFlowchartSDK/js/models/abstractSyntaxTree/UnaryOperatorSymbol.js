'use strict';

/* exported UnaryOperatorSymbol */
/* global OperatorSymbol */

/**
    Model a unary operator symbol, which has one child.
    @class UnaryOperatorSymbol
    @extends OperatorSymbol
*/
class UnaryOperatorSymbol extends OperatorSymbol {

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'UnaryOperatorSymbol';
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {UnaryOperatorSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const clone = new UnaryOperatorSymbol(this.operator);

        clone.children[0] = this.children[0].clone(arrayOfVariables);

        return clone;
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        const clone = new UnaryOperatorSymbol(this.operator);

        clone.children[0] = this.children[0].shallowCopy();

        return clone;
    }

    /**
        Return whether the operator is left-associative.
        @method isLeftAssociative
        @return {Boolean} Whether the operator is left-associative.
    */
    isLeftAssociative() {
        return false;
    }

    /**
        Return the precedence of the operator.
        @method getPrecedence
        @return {Integer} The precedence of the operator.
    */
    getPrecedence() {
        return 2; // eslint-disable-line no-magic-numbers
    }
}
