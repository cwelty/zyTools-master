'use strict';

/* global makeExpression */

/**
    An error that occurred during manipulation.
    @class ManipulationError
    @param {Array} parts Array of {String} and {MathSymbol}. The parts of the error message.
*/
function ManipulationError(parts) {
    this._parts = parts;
}

/**
    Get the error message.
    @method getMessage
    @param {String} expressionType The type of expression to render with.
    @return {String} The error message.
*/
ManipulationError.prototype.getMessage = function(expressionType) {
    return this._parts.map(part => {
        let partString = part;

        if (typeof part !== 'string') {
            partString = makeExpression(expressionType, part).print();
        }
        return partString;
    }).join('');
};
