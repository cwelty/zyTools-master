'use strict';

/* exported FunctionCallSymbol */
/* global TreeSymbol */

/**
    Model the function call, which consists of a reference to a {ProgramFunction} and a list of arguments.
    @class FunctionCallSymbol
    @extends TreeSymbol
*/
class FunctionCallSymbol extends TreeSymbol {

    /**
        @constructor
        @param {ProgramFunction} programFunction The function to call.
        @param {Token} firstToken The first token associated with this function call, i.e., that had the function name.
        @param {Token} lastToken The last token associated with this function call, i.e., that had the closing parens.
        @param {Integer} [portedStartIndexToHighlight=null] The index in the ported line in which this function call starts (first letter of function name).
        @param {Integer} [portedEndIndexToHighlight=null] The index in the ported line in which this function call ends (closing parens).
    */
    constructor(
        programFunction, firstToken, lastToken, portedStartIndexToHighlight = null, portedEndIndexToHighlight = null
    ) {
        super();

        /**
            The function to call.
            @property function
            @type {ProgramFunction}
        */
        this.function = programFunction;

        /**
            The first token associated with this function call, i.e., that had the function name.
            @property firstToken
            @type {Token}
            @default null
        */
        this.firstToken = firstToken;

        /**
            The last token associated with this function call, i.e., that had the closing parens.
            @property lastToken
            @type {Token}
            @default null
        */
        this.lastToken = lastToken;

        /**
            The index in the line in which this function call starts (first letter of function name).
            @property startIndexToHighlight
            @type {Integer}
        */
        this.startIndexToHighlight = firstToken.startIndexInTheLine;

        /**
            The index in the line in which this function call ends (closing parens).
            @property endIndexToHighlight
            @type {Integer}
        */
        this.endIndexToHighlight = lastToken.endIndexInTheLine;

        /**
            The start index to highlight for the ported code.
            @property portedEndIndexToHighlight
            @type {Integer}
        */
        this.portedStartIndexToHighlight = portedStartIndexToHighlight === null ? this.startIndexToHighlight : portedStartIndexToHighlight;

        /**
            The end index to highlight for the ported code.
            @property portedEndIndexToHighlight
            @type {Integer}
        */
        this.portedEndIndexToHighlight = portedEndIndexToHighlight === null ? this.endIndexToHighlight : portedEndIndexToHighlight;
    }

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'FunctionCallSymbol';
    }

    /**
        Add the given amount to the port highlight indices.
        @method addToPortIndices
        @param {Integer} amount The amount to increment.
        @return {void}
    */
    addToPortIndices(amount) {
        this.portedStartIndexToHighlight += amount;
        this.portedEndIndexToHighlight += amount;
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {FunctionCallSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const clone = new FunctionCallSymbol(
            this.function, this.firstToken, this.lastToken,
            this.portedStartIndexToHighlight, this.portedEndIndexToHighlight
        );

        clone.children = this.children.map(child => child.clone(arrayOfVariables));

        return clone;
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        const clone = new FunctionCallSymbol(
            this.function, this.firstToken, this.lastToken,
            this.portedStartIndexToHighlight, this.portedEndIndexToHighlight
        );

        clone.children = this.children.map(child => child.shallowCopy());

        return clone;
    }
}
