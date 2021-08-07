'use strict';

/* exported ExpressionParserResult */

/**
    Store the result of an expression parsing.
    @class ExpressionParserResult
*/
class ExpressionParserResult {

    /**
        @constructor
        @param {AbstractSyntaxTree} tree The abstract syntax tree, resulting from expression parsing.
        @param {Variable} rootDataType The type of data type of the tree's root.
    */
    constructor(tree, rootDataType) {

        /**
            The abstract syntax tree, resulting from expression parsing.
            @property tree
            @type {AbstractSyntaxTree}
        */
        this.tree = tree;

        /**
            The type of data type of the tree's root.
            @property rootDataType
            @type {Variable}
        */
        this.rootDataType = rootDataType;
    }
}
