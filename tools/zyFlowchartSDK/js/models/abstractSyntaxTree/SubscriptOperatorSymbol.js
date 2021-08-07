'use strict';

/* exported SubscriptOperatorSymbol */
/* global OperatorSymbol */

/**
    Model a subscript operator symbol, such as nums[x + 1].
    @class SubscriptOperatorSymbol
    @extends OperatorSymbol
*/
class SubscriptOperatorSymbol extends OperatorSymbol {

    /**
        @constructor
    */
    constructor() {
        super('[]');
    }

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'SubscriptOperatorSymbol';
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {SubscriptOperatorSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const clone = new SubscriptOperatorSymbol();

        // The first child is the array and the second is the index. Ex: myInts[4] yields myInts (first child) and 4 (second child).
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
        const clone = new SubscriptOperatorSymbol();

        // The first child is the array and the second is the index. Ex: myInts[4] yields myInts (first child) and 4 (second child).
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
        return true;
    }

    /**
        Return the precedence of the operator.
        @method getPrecedence
        @return {Integer} The precedence of the operator.
    */
    getPrecedence() {
        return 1;
    }
}
