'use strict';

/* exported MemoryCell */
/* global parserGeneratedVariableName */

/**
    Abstract model of one cell in memory.
    @class MemoryCell
*/
class MemoryCell {

    /**
        @constructor
        @param {String} name The name of the memory cell.
        @param {String} type The data type of the memory cell. Valid values: integer, float, boolean
    */
    constructor(name, type) {

        /**
            The name of the memory cell.
            @property name
            @type {String}
        */
        this.name = name;

        /**
            The data type of the memory cell. Valid values: integer, float, boolean
            @property type
            @type {String}
        */
        this.type = type;

        /**
            The value stored in the memory cell.
            @property value
            @type {Number}
            @default 0
        */
        this.value = 0;

        /**
            If this cell is apart of an array, then the array may want to listen to changes. Such as changes to ".size".
            @property arrayListenerCallback
            @type {Function}
            @default null
        */
        this.arrayListenerCallback = null;

        /**
            Whether this memory cell was recently written to. Used to highlight memory cells that were recently written to.
            @property wasWrittenTo
            @type {Boolean}
            @default false
        */
        this.wasWrittenTo = false;
    }

    /**
        Return the class name.
        @method getClassName
        @return {String} The class name.
    */
    getClassName() {
        return 'MemoryCell';
    }

    /**
        Get the value of the memory cell.
        @method getValue
        @return {Number} The value of the memory cell.
    */
    getValue() {
        return this.value;
    }

    /**
        Set a value to the memory cell.
        @method setValue
        @param {Number} value The value to set to the memory cell.
        @return {void}
    */
    setValue(value) {
        let valueToSet = value;

        if ((this.type === 'integer') && (valueToSet !== '?')) {
            valueToSet = Math.trunc(valueToSet);

            if (this.name !== parserGeneratedVariableName) {
                const maxSigned32BitInteger = 2147483647;
                const minSigned32BitInteger = -2147483648;
                const errorMessage = ` of ${this.name} when assigned ${valueToSet}`;

                // Check for overflow.
                if (valueToSet > maxSigned32BitInteger) {
                    throw new Error(`Overflow${errorMessage}`);
                }

                // Check for underflow.
                if (valueToSet < minSigned32BitInteger) {
                    throw new Error(`Underflow${errorMessage}`);
                }
            }
        }

        // Inform the listening array of the change.
        if (this.arrayListenerCallback) {
            this.arrayListenerCallback(valueToSet);
        }

        this.value = valueToSet;
    }

    /**
        Set a value to the memory cell during execution.
        @method setValueDuringExecution
        @param {Number} value The value to set to the memory cell.
        @return {void}
    */
    setValueDuringExecution(value) {
        if (value === '?') {
            throw new Error('Cannot assign variable with question mark');
        }
        this.wasWrittenTo = true;
        this.setValue(value);
    }

    /**
        Clear whether this memory cell was written to.
        @method clearWrittenTo
        @return {void}
    */
    clearWrittenTo() {
        this.wasWrittenTo = false;
    }

    /**
        Convert the value to a string. If a float value, then ensure a decimal.
        @method toString
        @return {String} The value as a string.
    */
    toString() {
        let asString = this.value.toString();

        // If a float and doesn't have a decimal, then ensure there is one.
        if ((this.type === 'float') && (asString.indexOf('.') === -1)) {
            asString = this.value.toFixed(1);
        }

        return asString;
    }

    /**
        Return a clone of this memory cell.
        @method clone
        @return {MemoryCell} A clone of this memory cell.
    */
    clone() {
        const clone = new MemoryCell(this.name, this.type);

        clone.value = this.value;
        clone.arrayListenerCallback = this.arrayListenerCallback;
        clone.wasWrittenTo = this.wasWrittenTo;

        return clone;
    }
}
