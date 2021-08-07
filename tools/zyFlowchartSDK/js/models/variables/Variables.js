'use strict';

/* exported Variables */

/**
    Model of a list of {Variable}s.
    @class Variables
    @extends Array
*/
class Variables extends Array {

    /**
        @constructor
        @param {String} name The name of the variables.
    */
    constructor(name) {
        super();

        /**
            The name of the variables.
            @property name
            @type {String}
        */
        this.name = name;

        /**
            TODO: Investigate babel update to fix prototypical inheritance https://stackoverflow.com/questions/40325212/how-can-i-extend-the-array-class-in-babel
            Return the {MemoryCell} associated with the given name.
            @method getMemoryCell
            @param {String} _name The name of the memory cell to get.
            @return {MemoryCell} Memory cell associated with the given name.
        */
        this.getMemoryCell = _name => {
            let memoryCellToFind = null;

            this.forEach(variable => {

                // Not an array, so check the variable directly.
                if ([ 'IntegerArray', 'FloatArray' ].indexOf(variable.getClassName()) === -1) {
                    if (variable.name === _name) {
                        memoryCellToFind = variable.cell;
                    }
                }
                else {
                    memoryCellToFind = variable.getMemoryCellByName(_name) || memoryCellToFind;
                }
            });

            return memoryCellToFind;
        };

        /**
            Return the variable with the given name.
            @method getVariable
            @param {String} _name The name of the variable to get.
            @return {Variable} The variable with the given name.
        */
        this.getVariable = _name => this.find(variable => variable.name === _name);

        /**
            Return the list of variable names.
            @method getVariableNames
            @return {Array} of {String} List of variable names.
        */
        this.getVariableNames = () => this.map(variable => variable.name);

        /**
            Return a clone of these variables.
            @method clone
            @return {Variables} A clone of these variables.
        */
        this.clone = () => {
            const cloned = new Variables(this.name);

            this.forEach(variable => cloned.push(variable.clone()));

            return cloned;
        };

        /**
            Clear whether the variables were written to.
            @method clearWrittenTo
            @return {void}
        */
        this.clearWrittenTo = () => {
            this.forEach(variable => variable.clearWrittenTo());
        };

        /**
            Return whether some variable is an array.
            @method hasArray
            @return {Boolean} Whether some variable is an array.
        */
        this.hasArray = () => this.some(variable => variable.isArray());
    }
}
