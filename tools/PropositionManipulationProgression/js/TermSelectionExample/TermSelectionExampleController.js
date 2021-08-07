'use strict';

/* global TermSelection */

/**
    Show the user an example of how to select terms.
    @class TermSelectionExampleController
    @param {Object} parentResource Dictionary of functions to access resources and submit activity.
    @param {Object} templates Collection of functions for generating HTML strings.
    @param {String} expressionType The type of expression to render.
*/
function TermSelectionExampleController(parentResource, templates, expressionType) {
    this._parentResource = parentResource;
    this._templates = templates;
    this._expressionType = expressionType;
    this._html = this._buildHTML();
}

/**
    Build the HTML for the example.
    @method _buildHTML
    @private
    @return {void}
*/
TermSelectionExampleController.prototype._buildHTML = function() {
    var sdk = require('PropositionalCalculusSDK').create();

    // Make the law side (a OR FALSE) with (a) selected.
    var aVariable = sdk.makeSymbol('variable', 'a');
    var fConstant = sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE);
    var aOrF = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ aVariable, fConstant ]);

    aVariable.addMarkRecursive('color-1');

    // Make the expression (s OR False) with (s) selected.
    var sVariable = sdk.makeSymbol('variable', 's');
    var fConstant2 = sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE);
    var sOrF = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ sVariable, fConstant2 ]);

    sVariable.addMark('color-1');
    sVariable.addMark('underline');

    var firstTermSelection = new TermSelection(
        this._toPartsHTML(aVariable),
        this._toPartsHTML(aOrF),
        this._toPartsHTML(sOrF)
    );

    sVariable.removeMark('underline');

    // Mark the FALSE in the term and the law side.
    fConstant.addMark('color-2');
    fConstant2.addMark('color-2');
    fConstant2.addMark('underline');

    var secondTermSelection = new TermSelection(
        this._toPartsHTML(fConstant),
        this._toPartsHTML(aOrF),
        this._toPartsHTML(sOrF)
    );

    firstTermSelection.addNumbering(1);
    secondTermSelection.addNumbering(3); // eslint-disable-line no-magic-numbers

    const wVariable = sdk.makeSymbol('variable', 'w');
    const notWVariable = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ wVariable ]);
    const mVariable = sdk.makeSymbol('variable', 'm');
    const notWOrM = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ notWVariable, mVariable ]);
    const fConstant3 = sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE);
    const notWOrMOrFalse = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ notWOrM, fConstant3 ]);

    notWOrMOrFalse.addMarkRecursive('color-1');
    notWOrMOrFalse.addMarkRecursive('underline');

    return this._templates.termSelectionExample({
        aVariable: this._toPartsHTML(aVariable),
        firstStep: this._templates.termSelectionExampleStep({ step: firstTermSelection }),
        notWOrMOrFalse: this._toPartsHTML(notWOrMOrFalse),
        thirdStep: this._templates.termSelectionExampleStep({ step: secondTermSelection }),
        expressionType: this._expressionType,
    });
};

/**
    Return the HTML expression for the given math symbol.
    @method _toPartsHTML
    @private
    @param {MathSymbol} mathSymbol The symbol to render.
    @return {String} The HTML expression of the given math symbol.
*/
TermSelectionExampleController.prototype._toPartsHTML = function(mathSymbol) {
    return this._templates.expressionParts({
        parts: require('PropositionalCalculusSDK').create().makeExpression(this._expressionType, mathSymbol).toParts(),
    });
};

/**
    Show the example.
    @method show
    @return {void}
*/
TermSelectionExampleController.prototype.show = function() {
    this._parentResource.alert('Example of selecting terms', this._html);
};
