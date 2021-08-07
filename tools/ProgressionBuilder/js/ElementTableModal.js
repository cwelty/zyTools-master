'use strict';

/* exported ElementTableModal */
/* global makeIndexArray */

/**
    Model for the modal to edit a table element.
    @class ElementTableModal
*/
class ElementTableModal {

    /**
        @constructor
        @param {String} modalSelector The selector for the modal.
    */
    constructor(modalSelector) {

        /**
            A jQuery reference to the table modal.
            @property $modal
            @type {jQuery}
        */
        this.$modal = $(modalSelector);

        /**
            jQuery reference to the header row/column checkbox container.
            @property $headersContainer
            @type {jQuery}
        */
        this.$headersContainer = this.$modal.find('div#header-cells-container');

        /**
            jQuery reference to the checkbox element that indicates whether the first row should have header styles.
            @property $headerRow
            @type {jQuery}
        */
        this.$headerRow = this.$modal.find('input#header-row');

        /**
            jQuery reference to the checkbox element that indicates whether the first column should have header styles.
            @property $headerCol
            @type {jQuery}
        */
        this.$headerCol = this.$modal.find('input#header-col');

        /**
            A jQuery reference to the checkbox element that indicates whether the table is of spreadsheet type.
            @property $asSpreadsheet
            @type {jQuery}
        */
        this.$asSpreadsheet = this.$modal.find('input#as-spreadsheet');

        /**
            A jQuery reference to the checkbox element that indicates whether to use a Python list variable.
            @property $useList
            @type {jQuery}
        */
        this.$useList = this.$modal.find('input#use-list');

        /**
            A jQuery reference to the python list name input field.
            @property $listName
            @type {jQuery}
        */
        this.$listName = this.$modal.find('input#table-list-name');

        /**
            A jQuery reference to the input element containing the number of rows to use.
            @property $inputRows
            @type {jQuery}
        */
        this.$inputRows = this.$modal.find('input#number-of-rows');

        /**
            A jQuery reference to the input element containing the number of columns to use.
            @property $inputCols
            @type {jQuery}
        */
        this.$inputCols = this.$modal.find('input#number-of-columns');

        /**
            A jQuery reference to the content table container element.
            @property $tableContentContainer
            @type {jQuery}
        */
        this.$tableContentContainer = this.$modal.find('div#table-content-container');

        /**
            A jQuery reference to the widths table container element.
            @property $tableWidthContainer
            @type {jQuery}
        */
        this.$tableWidthContainer = this.$modal.find('div#table-width-container');

        /**
            A jQuery reference to the background color table container element.
            @property $tableFillColorContainer
            @type {jQuery}
        */
        this.$tableFillColorContainer = this.$modal.find('div#table-fill-color-container');

        /**
            A jQuery reference to the table preview container element.
            @property $previewContainer
            @type {jQuery}
        */
        this.$previewContainer = this.$modal.find('div.preview-table-object');
    }

    /**
        Returns whether the use header row checkbox is chechked.
        @method getIsFirstRowHeader
        @return {Boolean}
    */
    getIsFirstRowHeader() {
        return this.$headerRow.prop('checked') || this.asSpreadsheet();
    }

    /**
        Returns whether the use header column checkbox is chechked.
        @method getIsFirstColumnHeader
        @return {Boolean}
    */
    getIsFirstColumnHeader() {
        return this.$headerCol.prop('checked') || this.asSpreadsheet();
    }

    /**
        Returns whether the table as spreadsheet checkbox is chechked.
        @method asSpreadsheet
        @return {Boolean}
    */
    asSpreadsheet() {
        return this.$asSpreadsheet.prop('checked');
    }

    /**
        Returns whether the use python list checkbox is checked.
        @method isUsingPythonList
        @return {Boolean}
    */
    isUsingPythonList() {
        return this.$useList.prop('checked');
    }

    /**
        Returns the python list name entered in the python list input field.
        @method getListName
        @return {String}
    */
    getListName() {
        return require('utilities').getPythonNotation(this.$listName.val());
    }

    /**
        Returns the number of rows entered in the input field.
        @method getNumRows
        @return {Integer}
    */
    getNumRows() {
        return parseInt(this.$inputRows.val(), 10);
    }

    /**
        Returns the number of columns entered in the input field.
        @method getNumCols
        @return {Integer}
    */
    getNumCols() {
        return parseInt(this.$inputCols.val(), 10);
    }

    /**
        Returns the table contents in a 2D array.
        @method getTableContents
        @return {Array}
    */
    getTableContents() {
        return this.getTableValues('content');
    }

    /**
        Returns the table widths in a 2D array.
        @method getTableWidths
        @return {Array}
    */
    getTableWidths() {
        return this.getTableValues('width');
    }

    /**
        Returns the table fill colors in a 2D array.
        @method getTableFillColors
        @return {Array}
    */
    getTableFillColors() {
        return this.getTableValues('fill-color');
    }

    /**
        Reads the table input fields from a container from the modal and returns the values in a 2D array.
        @method getTableValues
        @param {String} which From what container to read data. Can be: 'content' (default), 'width', or 'fill-color'.
        @return {Array}
    */
    getTableValues(which) {
        let $container = this.$tableContentContainer;

        if (which === 'width') {
            $container = this.$tableWidthContainer;
        }
        else if (which === 'fill-color') {
            $container = this.$tableFillColorContainer;
        }

        const numRows = $container.find('tr').length;
        const numCols = $container.find('td').length / numRows;

        return makeIndexArray(numRows).map(
            rowIndex => makeIndexArray(numCols).map(
                colIndex => {
                    const $cell = $container.find(`input#cell-${rowIndex}x${colIndex}`);
                    const valueToReturn = $cell.val();

                    return (which === 'content') ? valueToReturn : valueToReturn.trim();
                }
            )
        );
    }
}
