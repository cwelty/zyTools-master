'use strict';

/* global PropositionExpression */

/**
    MathSymbol stores a name. Ex: x
    @class MathSymbol
    @constructor
    @param {String} [name=''] The name of the symbol.
*/
function MathSymbol(name) {
    this.name = name || '';
    this.marks = [];
}

/**
    Return whether |otherSymbol| points to the same object as |this|.
    @method is
    @param {MathSymbol} otherSymbol The symbol to compare |this| to.
    @return {Boolean} Whether |otherSymbol| points to same object as |this|.
*/
MathSymbol.prototype.is = function(otherSymbol) {
    return (this === otherSymbol);
};

/**
    Return whether the |otherSymbol| represents the same expression as |this|.
    @method deepEquals
    @param {MathSymbol} otherSymbol The symbol to compare |this| to.
    @return {Boolean} Whether the |otherSymbol| represents the same expression as |this|.
*/
MathSymbol.prototype.deepEquals = function(otherSymbol) {
    const thisExpression = new PropositionExpression(this);
    const otherSymbolExpression = new PropositionExpression(otherSymbol);

    return (thisExpression.print() === otherSymbolExpression.print());
};

/**
    Mark the symbol with the given mark.
    @method addMark
    @param {String} mark The id to mark the symbol with.
    @return {void}
*/
MathSymbol.prototype.addMark = function(mark) {
    if (!this.hasMark(mark)) {
        this.marks.push(mark);
    }
};

/**
    Recursively add the given mark.
    @method addMarkRecursive
    @param {String} mark The id to mark the symbol with.
    @return {void}
*/
MathSymbol.prototype.addMarkRecursive = function(mark) {
    this.addMark(mark);
};

/**
    Remove the given mark.
    @method removeMark
    @param {String} mark The mark to remove.
    @return {void}
*/
MathSymbol.prototype.removeMark = function(mark) {
    if (this.hasMark(mark)) {
        const markIndex = this.marks.indexOf(mark);

        this.marks.splice(markIndex, 1);
    }
};

/**
    Recursively remove the given mark.
    @method removeMarkRecursive
    @param {String} mark The mark to remove.
    @return {void}
*/
MathSymbol.prototype.removeMarkRecursive = function(mark) {
    this.removeMark(mark);
};

/**
    Remove all marks.
    @method removeAllMarks
    @return {void}
*/
MathSymbol.prototype.removeAllMarks = function() {
    this.marks.length = 0;
};

/**
    Return whether the symbol is unmarked.
    @method isUnmarked
    @return {Boolean} Whether the symbol is marked.
*/
MathSymbol.prototype.isUnmarked = function() {
    return (this.marks.length === 0);
};

/**
    Return whether the symbol has the given mark.
    @method hasMark
    @param {String} mark Check whether the symbol has this mark.
    @return {Boolean} Whether the symbol has the given mark.
*/
MathSymbol.prototype.hasMark = function(mark) {
    const indexOfNotFound = -1;

    return (this.marks.indexOf(mark) !== indexOfNotFound);
};

/**
    Return whether the symbol has a specific mark or is unmarked.
    @method hasSpecificMarkOrIsUnmarked
    @param {String} mark The specific allowed mark.
    @return {Boolean} Whether the symbol is marked.
*/
MathSymbol.prototype.hasSpecificMarkOrIsUnmarked = function(mark) {
    return (this.hasMark(mark) || this.isUnmarked());
};

/**
    Return whether the symbol's descendant has a specific mark or is unmarked. Symbol has no children, so return true.
    @method descendantHasSpecificMarkOrIsUnmarked
    @return {Boolean} Symbol has no children, so returns true.
*/
MathSymbol.prototype.descendantHasSpecificMarkOrIsUnmarked = function() {
    return true;
};

/**
    Return the root of the already marked symbols.
    @method findRootOfMark
    @param {String} mark The mark to find.
    @return {MathSymbol} The root of the marked symbols.
*/
MathSymbol.prototype.findRootOfMark = function(mark) {
    if (this.hasMark(mark)) {
        return this;
    }
    return null;
};

/**
    Return the common ancestor of s1 and s2.
    @method findCommonAncestor
    @param {MathSymbol} s1 One symbol to find.
    @param {MathSymbol} s2 Other symbol to find.
    @return {MathSymbol} The common ancestor of s1 and s2.
*/
MathSymbol.prototype.findCommonAncestor = function(s1, s2) {
    if (s1.is(s2)) {
        return s1;
    }
    return null;
};

/**
    Find the ancestors of the given symbol.
    @method findAncestors
    @param {MathSymbol} symbol The symbol's ancestors to find.
    @return {Array} Array of {MathSymbol}. List of ancestors of given symbol.
*/
MathSymbol.prototype.findAncestors = function(symbol) {
    const ancestors = [];

    if (this.is(symbol)) {
        ancestors.push(this);
    }
    return ancestors;
};

/**
    Find all operator paths from root to leaves. Non-{Operator} symbols are not part of that path, so return null.
    @method findOperatorPaths
    @return {null}
*/
MathSymbol.prototype.findOperatorPaths = function() {
    return null;
};

/**
    Clone this symbol.
    @method clone
    @param {MathSymbol} newSymbol The clone of this symbol.
    @return {MathSymbol} A clone of this symbol.
*/
MathSymbol.prototype.clone = function(newSymbol) {
    newSymbol.name = this.name;
    newSymbol.marks = this.marks.slice();
    return newSymbol;
};

/**
    Return whether this symbol is an operator.
    @method isOperator
    @return {Boolean} Whether this symbol is an {Operator}.
*/
MathSymbol.prototype.isOperator = function() {
    return false;
};
