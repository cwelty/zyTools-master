'use strict';

/**
    Store properties for a term selection example.
    @class TermSelection
    @param {String} termHTML The HTML for the term.
    @param {String} lawSideHTML The HTML for the law side button.
    @param {String} expressionHTML The HTML for the expression.
*/
function TermSelection(termHTML, lawSideHTML, expressionHTML) {
    this.termHTML = termHTML;
    this.lawSideHTML = lawSideHTML;
    this.expressionHTML = expressionHTML;
    this.numbering = 0;
}

/**
    Add a numbering to this instance.
    @method addNumbering
    @param {Number} numbering The ordering of this term selection.
    @return {TermSelection} Reference to this {TermSelection}.
    @chainable
*/
TermSelection.prototype.addNumbering = function(numbering) {
    this.numbering = numbering;
    return this;
};
