'use strict';

/* exported AbstractSyntaxTree */

/**
    Model an abstract syntax tree for use in executing a process or decision node.
    @class AbstractSyntaxTree
*/
class AbstractSyntaxTree {

    /**
        @constructor
        @param {TreeSymbol} root The root of the tree.
    */
    constructor(root) {

        /**
            The root of the tree.
            @property root
            @type {TreeSymbol}
        */
        this.root = root;
    }

    /**
        Make a copy of this AST.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {AbstractSyntaxTree} The cloned AST.
    */
    clone(arrayOfVariables) {
        return new AbstractSyntaxTree(this.root.clone(arrayOfVariables));
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        return new AbstractSyntaxTree(this.root.shallowCopy());
    }

    /**
        Whether the tree has the given symbol.
        @method has
        @param {TreeSymbol} symbol The symbol to search for.
        @return {Boolean} Whether the tree has the symbol.
    */
    has(symbol) {
        return this.root.has(symbol);
    }
}
