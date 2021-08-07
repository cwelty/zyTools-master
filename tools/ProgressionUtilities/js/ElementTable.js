'use strict';

/* exported ElementTable */
/* global ElementTableCell, getPythonVariableName, isTwoDimensionalList, getTableDataFromList, addSpreadsheetHeaders */

/**
    An {ElementTable} models a table that is displayed to the user.
    @class ElementTable
    @extends Element
*/
class ElementTable extends Element {

    /**
        @constructor
        @param {Object} [tableData=null] The tables' data. Can be an object or a two dimensional array.
        @param {String} [listName=''] The name of the Python list that defines this tables' data.
        @param {Boolean} [isSpreadsheet=false] Whether the table is a spreadsheet table.
        @param {Boolean} [isFirstRowHeader=false] Whether the first row of the table is a header row.
        @param {Boolean} [isFirstColumnHeader=false] Whether the first column of the table is a header column.
        @param {Object} [style={}] The table styles.
    */
    constructor({
        tableData = null,
        listName = '',
        isSpreadsheet = false,
        isFirstRowHeader = false,
        isFirstColumnHeader = false,
        style = {},
    }) {
        super(arguments[0]); // eslint-disable-line prefer-rest-params

        const emptyTableCell = new ElementTableCell({});
        const defaultTableData = [ [ emptyTableCell, emptyTableCell.clone() ], [ emptyTableCell.clone(), emptyTableCell.clone() ] ];
        const currentTableData = tableData || defaultTableData;
        const tableIsObject = currentTableData.hasOwnProperty('data');
        const hasListName = listName && listName !== '';
        const isUsingList = tableIsObject || hasListName || (typeof currentTableData === 'string');

        this.isSpreadsheet = isSpreadsheet;
        this.isFirstRowHeader = isFirstRowHeader || this.isSpreadsheet;
        this.isFirstColumnHeader = isFirstColumnHeader || this.isSpreadsheet;
        this.style = style;

        if (isUsingList) {
            const currentListName = tableIsObject ? tableData.data : (listName || tableData);

            this.tableData = { data: require('utilities').getPythonNotation(currentListName) };
        }
        else {
            this.fixWidth = currentTableData.flat()
                .some(cell => cell.style && cell.style.width && (cell.style.width !== '') && (cell.style.width !== 'auto'));
            this.tableData = this.buildTableCells(currentTableData);
        }
    }

    /**
        Set |property| with |value|.
        @method _setProperty
        @private
        @param {String} property The property to be added.
        @param {Object} value The value of |property|.
        @return {void}
    */
    _setProperty(property, value) {

        // Convert cell contents to {ElementTableCell}.
        if ((property === 'tableData') && Array.isArray(value)) {
            this.tableData = value.map(row => row.map(cell => new ElementTableCell(cell)));
        }
        else if (property === 'listName' && value !== '') {
            this.tableData = { data: require('utilities').getPythonNotation(value) };
        }
        else {
            Element.prototype._setProperty.call(this, property, value); // eslint-disable-line no-underscore-dangle
        }
    }

    /**
        Builds the |tableData| property of this {ElementTable} object with the passed |tableData|.
        @method buildTableCells
        @param {Array} tableData Two dimensional list with table data.
        @return {Array} A two dimensional array with {ElementTableCell} objects.
    */
    buildTableCells(tableData) {
        return tableData.map((row, rowIndex) =>
            row.map((cell, cellIndex) => {
                const tableCell = new ElementTableCell(cell);
                const isFirstRow = rowIndex === 0;
                const isFirstColumn = cellIndex === 0;
                const isHeaderBecauseOrRow = isFirstRow && (this.isFirstRowHeader || this.isSpreadsheet);
                const isHeaderBecauseOrColumn = isFirstColumn && (this.isFirstColumnHeader || this.isSpreadsheet);

                tableCell.setCellHeader(isHeaderBecauseOrRow || isHeaderBecauseOrColumn);

                /*
                    By default, spreadsheet tables have an 8% width in the first column.
                    To mantain backwards compatibility we need to set that 8% here.
                    If we don't, then the width is set to 'auto', which would break old progressions when being imported into the tool.
                */
                if (this.isSpreadsheet && isFirstColumn && !(cell.hasOwnProperty('style') && cell.style.hasOwnProperty('width'))) {
                    tableCell.setWidth('8%');
                }

                return tableCell;
            })
        );
    }

    /**
        Return a clone of this element.
        @method clone
        @return {ElementTable} Copy of this element.
    */
    clone() {
        return new ElementTable(this.toJSON());
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this);

        if (this._isUsingList()) {
            elementJSON.tableData = { data: this.getListName() };
        }
        else {
            elementJSON.tableData = this.tableData.map(row => row.map(cell => cell.toJSON()));
        }

        elementJSON.isFirstRowHeader = this.isFirstRowHeader;
        elementJSON.isFirstColumnHeader = this.isFirstColumnHeader;
        elementJSON.isSpreadsheet = this.isSpreadsheet;

        return elementJSON;
    }

    /**
        Update table with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        if (this._isUsingList()) {
            const varName = getPythonVariableName(this.getListName());

            if (isTwoDimensionalList(varName, module)) {
                const tableDataFromList = getTableDataFromList(varName, module);

                // Add named headers.
                if (this.isSpreadsheet) {
                    addSpreadsheetHeaders(tableDataFromList.variables);
                }

                this.tableData = tableDataFromList.variables.map((row, rowIndex) => row.map((cell, colIndex) => new ElementTableCell({
                    content: String(cell),
                    isHeader: (this.isFirstRowHeader && rowIndex === 0) || (this.isFirstColumnHeader && colIndex === 0),
                })));
            }
            else {
                alert(`Error: ${varName} is not a 2D list variable.`); // eslint-disable-line no-alert
            }
        }
        else {
            this.tableData.forEach(row => row.forEach(cell => cell.updateWithCode(module)));
        }
    }

    /**
        Whether table data is defined in a python list.
        @method _isUsingList
        @private
        @return {Boolean}
    */
    _isUsingList() {
        const tableIsObject = this.tableData.hasOwnProperty('data') || false;
        const isUsingList = tableIsObject || typeof tableData === 'string';

        return isUsingList;
    }

    /**
        Get the python list name, if any.
        @method getListName
        @return {String}
    */
    getListName() {
        if (this._isUsingList()) {
            const varName = this.tableData.hasOwnProperty('data') ? this.tableData.data : this.tableData;

            return require('utilities').getPythonNotation(varName);
        }

        return '';
    }

    /**
        Prepare cells for rendering.
        @method prepareForRendering
        @return {void}
    */
    prepareForRendering() {
        if (!this._isUsingList()) {
            this.tableData.forEach(row => row.forEach(cell => cell.prepareForRendering()));
        }
    }
}
