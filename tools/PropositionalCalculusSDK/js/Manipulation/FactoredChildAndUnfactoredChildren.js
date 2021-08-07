'use strict';

/* exported FactoredChildAndNotFactoredChildren */

/**
    Store a factored child and unfactored children.
    @class FactoredChildAndNotFactoredChildren
    @constructor
    @param {MathSymbol} factoredChild The factored child.
    @param {Array} notFactoredChildren Array of {MathSymbol}. The unfactored children.
*/
function FactoredChildAndNotFactoredChildren(factoredChild, notFactoredChildren) {
    this.factoredChild = factoredChild;
    this.notFactoredChildren = notFactoredChildren;
}
