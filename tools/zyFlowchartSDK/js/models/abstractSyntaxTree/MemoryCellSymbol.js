'use strict';

/* exported MemoryCellSymbol */
/* global TreeSymbol, lookupMemoryCellFromVariableLists */

/**
    Model a memory cell symbol, which has no children.
    @class MemoryCellSymbol
    @extends TreeSymbol
*/
class MemoryCellSymbol extends TreeSymbol {

    /**
        @constructor
        @param {MemoryCell} memoryCell The memory cell for this symbol.
        @param {Token} firstToken The first token associated with the memory cell, i.e., an array name.
        @param {Token} lastToken The last token associated with the memory cell call, i.e., the size of the array.
    */
    constructor(memoryCell, firstToken, lastToken) {
        super();

        /**
            The memory cell for this symbol.
            @property memoryCell
            @type {MemoryCell}
        */
        this.memoryCell = memoryCell;

        /**
            The first token associated with the memory cell, i.e., an array name.
            @property firstToken
            @type {Token}
            @default null
        */
        this.firstToken = firstToken;

        /**
            The last token associated with the memory cell call, i.e., the size of the array.
            @property lastToken
            @type {Token}
            @default null
        */
        this.lastToken = lastToken;
    }

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'MemoryCellSymbol';
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {MemoryCellSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const newMemoryCell = lookupMemoryCellFromVariableLists(this.memoryCell.name, arrayOfVariables);

        return new MemoryCellSymbol(newMemoryCell, this.firstToken, this.lastToken);
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        return new MemoryCellSymbol(this.memoryCell, this.firstToken, this.lastToken);
    }

    /**
        Return whether a memory cell contains the given token.
        @method memoryCellHasToken
        @param {Token} token The token to find.
        @param {Array} allTokens Array of {Tokens}. All the tokens from the expression that may contain a memory cell.
        @return {Boolean} Whether a memory cell contains the given token.
    */
    memoryCellHasToken(token, allTokens) {
        const firstIndexToCheck = allTokens.indexOf(this.firstToken);
        const lastIndexToCheck = allTokens.indexOf(this.lastToken);
        const tokensToCheck = allTokens.slice(firstIndexToCheck, lastIndexToCheck + 1);

        return tokensToCheck.includes(token) || this.children.some(child => child.memoryCellHasToken(token, allTokens));
    }
}
