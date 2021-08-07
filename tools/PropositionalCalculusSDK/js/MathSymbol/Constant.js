'use strict';

/* global MathSymbol */
/* exported buildConstantPrototype */

/**
    Constant stores a constant-value symbol. Ex: True
    @class Constant
    @extends MathSymbol
    @constructor
    @param {String} name A constant-value symbol from CONSTANT_SYMBOLS.
*/
function Constant(name) {
    MathSymbol.prototype.constructor.call(this, name);
}

/**
    Build the prototype for Constant.
    @method buildConstantPrototype
    @return {void}
*/
function buildConstantPrototype() {
    Constant.prototype = new MathSymbol();
    Constant.prototype.constructor = Constant;

    /**
        Clone this symbol.
        @method clone
        @return {Constant} A clone of this symbol.
    */
    Constant.prototype.clone = function() {
        return MathSymbol.prototype.clone.call(this, new Constant());
    };
}
