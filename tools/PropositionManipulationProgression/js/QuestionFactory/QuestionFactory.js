'use strict';

/**
    Make progression questions.
    @class QuestionFactory
    @constructor
*/
function QuestionFactory() {

    // Inheriting object should overwrite these defaults.
    this.numberOfLevels = 1;
    this.expressionAreaWidth = '';
    this.lawCategories = [];
}

/**
    Return a randomly generated {Question} for the given level.
    @method make
    @param {Number} levelIndex The index of the level of {Question} to make.
    @return {Question} The randomly generated question.
*/
QuestionFactory.prototype.make = function() {
    throw new Error('QuestionFactory\'s make function should not be called.');
};

/**
    Return a given number of {Variable}s.
    @method _makeNVariables
    @protected
    @param {Number} number The number of variable names to pick.
    @param {Boolean} [digital=false] Wether the variables are for digital design.
    @return {Array} Array of {Variables}. The picked variables.
*/
QuestionFactory.prototype._makeNVariables = function(number, digital = false) {
    const sdk = require('PropositionalCalculusSDK').create();
    const variableNames = digital ? [ 'w', 'x', 'y', 'z' ] : [ 'm', 'n', 'p', 'q', 's', 'w' ];

    return require('utilities').pickNElementsFromArray(variableNames, number).map(variableName => sdk.makeSymbol('variable', variableName));
};
