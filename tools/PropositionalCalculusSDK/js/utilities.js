'use strict';

/* global PropositionExpression, DigitalExpression */
/* exported makeExpression */

/**
    Return an {Expression} of the given type with the given root.
    @method makeExpression
    @param {String} type The type of expression to make. Valid values: 'proposition' and 'digital'.
    @param {MathSymbol} root The root of the expression.
    @return {Expression} The created expression from given type and root.
*/
function makeExpression(type, root) {
    let expressionClass = null;

    switch (type) {
        case 'proposition':
            expressionClass = PropositionExpression;
            break;
        case 'digital':
            expressionClass = DigitalExpression;
            break;
        default:
            throw new Error(`Unrecognized expression type: ${type}`);
    }

    const newExpression = Object.create(expressionClass.prototype);

    expressionClass.call(newExpression, root);
    return newExpression;
}
