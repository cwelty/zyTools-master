'use strict';

/* exported VariableSymbol */
/* global TreeSymbol, parserGeneratedVariableName */

/**
    Model a variable symbol, which has no children.
    @class VariableSymbol
    @extends TreeSymbol
*/
class VariableSymbol extends TreeSymbol {

    /**
        @constructor
        @param {Variable} variable The variable for this symbol.
    */
    constructor(variable) {
        super();

        /**
            The variable for this symbol.
            @property variable
            @type {Variable}
        */
        this.variable = variable;
    }

    /**
        Return the name of this symbol class.
        @method getClassName
        @return {String} The name of this symbol class.
    */
    getClassName() {
        return 'VariableSymbol';
    }

    /**
        Make a clone of this symbol.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up variables.
        @return {VariableSymbol} A clone of this symbol.
    */
    clone(arrayOfVariables) {
        const newVariable = this.variable.name === parserGeneratedVariableName ?
                            this.variable.clone() :
                            arrayOfVariables.map(variables => variables.getVariable(this.variable.name)).find(variable => variable);

        return new VariableSymbol(newVariable);
    }

    /**
        Make a shallow copy of this symbol.
        @method shallowCopy
        @return {TreeSymbol} A shallow copy of this symbol.
    */
    shallowCopy() {
        return new VariableSymbol(this.variable);
    }
}
