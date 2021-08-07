'use strict';

/* exported ArrayVariable */
/* global Variable, MemoryCell */

/**
    An abstract model of a variable with an array of memory cells.
    @class ArrayVariable
    @extends Variable
*/
class ArrayVariable extends Variable {

    /**
        @constructor
        @param {String} name The name of the array.
        @param {Integer} numberOfElements Or {String}. The number of elements in the array. Can be: '?'.
        @param {MemoryCell} type The type of memory cell's to store.
    */
    constructor(name, numberOfElements, type) {
        super();

        /**
            The type of memory cell's to store.
            @property memoryCellType
            @type {MemoryCell}
        */
        this.type = type;

        /**
            The memory cell storing the size of the array.
            @property sizeCell
            @type {MemoryCell}
        */
        this.sizeCell = new MemoryCell('', 'integer');

        /**
            The memory cells in the array.
            @property arrayCells
            @type {Array} of {MemoryCell}
            @default []
        */
        this.arrayCells = [];

        this.setName(name);
        this.sizeCell.setValue(numberOfElements);
        this.setNumberOfElements(numberOfElements);

        // The size has a known value, so has been written to.
        if (numberOfElements !== '?') {
            this.sizeCell.hasEverBeenWrittenTo = true;
        }

        // Listen to changes on the size cell, so the array can resize if appropriate.
        this.sizeCell.arrayListenerCallback = newSize => {
            if (this.sizeCell.getValue() !== '?') {
                throw new Error('Cannot change size of array that already has a set size');
            }
            this.setNumberOfElements(newSize);
        };
    }

    /**
        Set the number of elements in the array.
        @method setNumberOfElements
        @param {Integer} numberOfElements Or {String}. The number of elements in the array. Can be: '?'.
        @return {void}
    */
    setNumberOfElements(numberOfElements) {
        const numberOfElementsIsAnInteger = Number.isInteger(parseInt(numberOfElements, 10));
        const numberOfElementsIsUnknown = numberOfElements === '?';

        if (!(numberOfElementsIsAnInteger || numberOfElementsIsUnknown)) {
            throw new Error('Array size must be an integer or question mark');
        }

        // Update array of cells.
        const currentNumberOfCells = this.arrayCells.length;
        const newNumberOfCells = numberOfElementsIsUnknown ? 0 : numberOfElements;
        const numberOfCellsToAdd = newNumberOfCells - currentNumberOfCells;

        if (numberOfCellsToAdd > 0) {
            require('utilities').createArrayOfSizeN(numberOfCellsToAdd).forEach((value, index) => {
                this.arrayCells.push(new MemoryCell(`${this.name}[${currentNumberOfCells + index}]`, this.type));
            });
        }
        else {
            this.arrayCells.length = 0;
        }
    }

    /**
        Set the name of the array.
        @method setName
        @param {String} name The name of the array.
        @return {void}
    */
    setName(name) {
        super.setName(name);

        this.sizeCell.name = `${name}.size`;

        // Set the memory cell names.
        this.arrayCells.forEach((cell, index) => {
            cell.name = `${name}[${index}]`;
        });
    }

    /**
        Return the memory cell with the given name.
        @method getMemoryCellByName
        @param {String} name The name of the memory cell to return.
        @return {MemoryCell} The memory cell with the given name.
    */
    getMemoryCellByName(name) {
        return (this.sizeCell.name === name) ? this.sizeCell : this.arrayCells.find(memoryCell => memoryCell.name === name);
    }

    /**
        Return that this is an array.
        @method isArray
        @return {Boolean} That this is an array.
    */
    isArray() {
        return true;
    }

    /**
        Copy the memory cell values from this array to the other.
        @method copyMemoryCellValuesTo
        @param {ArrayVariable} to The variable to copy to.
        @param {Boolean} [isDuringExecution=false] Whether the copy is done during execution.
        @param {Boolean} [isDuringFunctionCall=false] Whether the copy is done during a function call or an assignment.
        @return {void}
    */
    copyMemoryCellValuesTo(to, isDuringExecution = false, isDuringFunctionCall = false) {

        // During execution, also set the size.
        if (isDuringExecution) {
            const arraySizeToSet = this.sizeCell.getValue();
            const arraySizeGettingSet = to.sizeCell.getValue();

            if (arraySizeToSet === '?') {
                const message = isDuringFunctionCall ?
                                'An array in a function argument cannot have size of ?.' :
                                'Array on right-hand side has size of ?. Cannot assign with an array that has a size of ?.';

                throw new Error(message);
            }

            // If the assigned has size ?, then set size as result's size.
            if (arraySizeGettingSet === '?') {
                to.sizeCell.setValueDuringExecution(arraySizeToSet);
            }
            else if (arraySizeGettingSet !== arraySizeToSet) {
                const messageStart = isDuringFunctionCall ?
                                'Array in argument list and parameter array' :
                                'Array on left and array on right-hand side';

                throw new Error(`${messageStart} have different sizes, but shouldn't.`);
            }
        }

        to.arrayCells.forEach((toCell, index) => {
            const fromCell = this.arrayCells[index];

            if (isDuringExecution) {
                toCell.setValueDuringExecution(fromCell.getValue());
            }
            else {
                toCell.setValue(fromCell.getValue());
            }
        });
    }

    /**
        Clear whether any memory cell in the array was written to.
        @method clearWrittenTo
        @return {void}
    */
    clearWrittenTo() {
        this.sizeCell.clearWrittenTo();
        this.arrayCells.forEach(cell => cell.clearWrittenTo());
    }
}
