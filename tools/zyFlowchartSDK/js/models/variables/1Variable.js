'use strict';

/* exported Variable */
/* global isValidIdentifier */

/**
    An abstract model of a variable.
    @class Variable
*/
class Variable {

    /**
        @constructor
    */
    constructor() {

        /**
            The name of the variable.
            @property name
            @type {String}
            @default ''
        */
        this.name = '';
    }

    /**
        Set the name of the variable.
        @method setName
        @param {String} name The name of the variable.
        @return {void}
    */
    setName(name) {

        // Variable name must begin with a letter or underscore, then may be followed by letters, underscores, and/or numbers.
        if (!isValidIdentifier(name)) {
            throw new Error('Invalid variable name');
        }

        this.name = name;
    }

    /**
        Return whether this is an array.
        @method isArray
        @return {Boolean} Whether this is an array.
    */
    isArray() {
        return false;
    }

    /**
        Return the name of this variable class. Inheriting objects must override.
        @method getClassName
        @return {String} The name of this variable class.
    */
    getClassName() {
        throw new Error('Variable\'s getClassName function should be overridden');
    }

    /**
        Return a clone of this variable. Inheriting objects must override.
        @method clone
        @return {Variable} A clone of this variable.
    */
    clone() {
        throw new Error('Variable\'s clone function should be overridden');
    }

    /**
        Return the Coral variable data type ported in the given language.
        @method getPortedDataType
        @param {String} language The language to port to.
        @return {String} The data type in the ported language.
    */
    getPortedDataType(language) { // eslint-disable-line no-unused-vars
        throw new Error('Variable\'s getPortedDataType function should be overridden');
    }
}
