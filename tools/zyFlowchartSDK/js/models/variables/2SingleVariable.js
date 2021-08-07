'use strict';

/* exported SingleVariable */
/* global MemoryCell, Variable */

/**
    An abstract model of a variable with one memory cell.
    @class SingleVariable
    @extends Variable
*/
class SingleVariable extends Variable {

    /**
        @constructor
        @param {String} name The name of the variable.
        @param {MemoryCell} type The type of data to store.
    */
    constructor(name, type) {
        super();

        /**
            The type of memory cell's to store.
            @property memoryCellType
            @type {MemoryCell}
        */
        this.cell = new MemoryCell(name, type);

        this.setName(name);
    }

    /**
        Set the name of the variable.
        @method setName
        @param {String} name The name of the array.
        @return {void}
    */
    setName(name) {
        super.setName(name);
        this.cell.name = name;
    }

    /**
        Set a value in the variable.
        @method setValue
        @param {Number} value The value to set to the variable's cell.
        @return {void}
    */
    setValue(value) {
        this.cell.setValue(value);
    }

    /**
        Get the value in the variable's cell.
        @method getValue
        @return {Number} The value in the variable's cell.
    */
    getValue() {
        return this.cell.getValue();
    }

    /**
        Get the string value of the memory cell during execution, which must have a write before read.
        @method toString
        @return {String} The string value of the memory cell.
    */
    toString() {
        return this.cell.toString();
    }

    /**
        Set a value in the variable during execution.
        @method setValueDuringExecution
        @param {Number} value The value to set to the variable's cell.
        @return {void}
    */
    setValueDuringExecution(value) {
        this.cell.setValueDuringExecution(value);
    }

    /**
        Clear whether the memory cell was written to.
        @method clearWrittenTo
        @return {void}
    */
    clearWrittenTo() {
        this.cell.clearWrittenTo();
    }
}
