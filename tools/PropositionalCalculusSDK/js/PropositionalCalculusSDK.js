'use strict';

/* global Constant */
/* global Operator */
/* global Variable */
/* global ExpressionManipulation */
/* global makeExpression */
/* global buildConstantPrototype */
/* global buildOperatorPrototype */
/* global buildDigitalExpressionPrototype */
/* global CONSTANT_SYMBOLS */
/* global OPERATOR_SYMBOLS */

/**
    A set of models for performing propositional calculus.
    @module PropositionalCalculusSDK
    @return {void}
*/
function PropositionalCalculusSDK() {} // eslint-disable-line no-empty-function

/**
    Return a {MathSymbol} of the given type with the given name and children.
    @method makeSymbol
    @param {String} type The type of symbol to make. Valid values: 'constant', 'operator', and 'variable'.
    @param {String} name The name of the symbol.
    @param {Array} [children] Array of {MathSymbol}. The children of the symbol.
    @return {MathSymbol} The new symbol from given type, name, and children.
*/
PropositionalCalculusSDK.prototype.makeSymbol = function(type, name, children) {
    let symbolClass = null;

    switch (type) {
        case 'constant':
            symbolClass = Constant;
            break;
        case 'operator':
            symbolClass = Operator;
            break;
        case 'variable':
            symbolClass = Variable;
            break;
        default:
            throw new Error(`Unrecognized symbol type: ${type}`);
    }

    const newSymbol = Object.create(symbolClass.prototype);

    symbolClass.call(newSymbol, name, children);
    return newSymbol;
};

/**
    Run the manipulation function of the given name
    @method runManipulation
    @param {String} name The name of the manipulation to run.
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions in the manipulation.
    @param {Object} [options={}] Additional options for the manipulation.
    @return {Expression} Result of the manipulation.
*/
PropositionalCalculusSDK.prototype.runManipulation = function(name, expression, subExpressions, options = {}) {
    const manipulation = new ExpressionManipulation();

    return manipulation[name](expression, subExpressions, options);
};

/**
    Return an {Expression} of the given type with the given root.
    @method makeExpression
    @param {String} type The type of expression to make. Valid values: 'proposition' and 'digital'.
    @param {MathSymbol} root The root of the expression.
    @return {Expression} The created expression from given type and root.
*/
PropositionalCalculusSDK.prototype.makeExpression = function(type, root) {
    return makeExpression(type, root);
};

/**
    Build prototypes for objects that are alphabetically before the inherited object.
    @method buildPrototypes
    @return {void}
*/
function buildPrototypes() {
    buildConstantPrototype();
    buildOperatorPrototype();
    buildDigitalExpressionPrototype();

    PropositionalCalculusSDK.prototype.CONSTANT_SYMBOLS = CONSTANT_SYMBOLS;
    PropositionalCalculusSDK.prototype.OPERATOR_SYMBOLS = OPERATOR_SYMBOLS;
}

let propositionalCalculusSDKInstance = null;

module.exports = {
    create: function() {
        if (!propositionalCalculusSDKInstance) {
            buildPrototypes();
            propositionalCalculusSDKInstance = new PropositionalCalculusSDK();
        }
        return propositionalCalculusSDKInstance;
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        buildPrototypes();

        <%= grunt.file.read(tests) %>
    },
};
