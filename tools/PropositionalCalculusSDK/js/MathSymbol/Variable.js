'use strict';

/* global MathSymbol */

/**
    Variable stores a variable name. Ex: x
    @class Variable
    @extends MathSymbol
    @constructor
    @param {String} name The name of the variable.
*/
function Variable(name) {
    MathSymbol.prototype.constructor.call(this, name);
}

Variable.prototype = new MathSymbol();
Variable.prototype.constructor = Variable;

/**
    Clone this symbol.
    @method clone
    @return {Variable} A clone of this symbol.
*/
Variable.prototype.clone = function() {
    return MathSymbol.prototype.clone.call(this, new Variable());
};
