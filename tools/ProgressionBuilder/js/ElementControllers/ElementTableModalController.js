'use strict';

/* exported ElementTableModalController */
/* global ElementTableModal, makeIndexArray */

/**
    Control the modal for the edition of a table element.
    @class ElementTableModalController
*/
class ElementTableModalController {

    /**
        Initializes an ElementTableModalController
        @constructor
        @param {Object} parentResource The parent resource of the module.
        @param {Object} templates Dictionary of templates for rendering elements.
        @param {Array} oldTable The current values in the table being edited.
    */
    constructor(parentResource, templates, oldTable) {

        /**
            The parent resource of the module.
            @property _parentResource
            @private
            @type {Object}
        */
        this._parentResource = parentResource;

        /**
            Dictionary of templates for rendering elements.
            @property _templates
            @private
            @type {Object}
        */
        this._templates = templates;

        /**
            The original cells of the table being edited.
            A two dimensional array if content is manually entered. An object if data is a Python list.
            @property oldTable
            @type {Array} of {Array} of {ElementTableCell}
        */
        this.oldTable = oldTable;

        /**
            A reference to the table modal controlled by this controller.
            @property tableModal
            @type {ElementTableModal}
            @default null
        */
        this.tableModal = null;

        /**
            A reference to the {ProgressionUtilities} module.
            @property _progressionUtilities
            @private
            @type {Object}
        */
        this._progressionUtilities = require('ProgressionUtilities').create();

        /**
            The table contents as a 2D array.
            @property tableContents
            @type {Array}
            @default null
        */
        this.tableContents = null;

        /**
            The table widths as a 2D array.
            @property tableWidths
            @type {Array}
            @default null
        */
        this.tableWidths = null;

        /**
            The table fill colors as a 2D array.
            @property tableFillColors
            @type {Array}
            @default null
        */
        this.tableFillColors = null;

        /**
            The table HTML style.
            @property style
            @type {Object}
            @default null
        */
        this.style = null;

        /**
            The segmented control that allows selecting which table to fill.
            @property segmentedControl
            @type {segmentedControl}
        */
        this.segmentedControl = require('segmentedControl').create();

        // Invert the fill color modal name to XML name.
        const fillColorModalNameToXMLName = require('ProgressionUtilities').create().fillColorModalNameToXMLName;

        /**
            A table that allows changing between color XML name and modal name.
            @property fillColorXMLNameToModalName
            @type {Object}
        */
        this.fillColorXMLNameToModalName = Object.entries(fillColorModalNameToXMLName).reduce((result, entry) => {
            const [ key, value ] = entry;

            result[value] = key;
            return result;
        }, {});
    }

    /**
        Make a table based on the new table values. If a value not found, fallback to the old table, else fallback to the default value.
        @method _makeTableOfValues
        @private
        @param {Integer} rows Number of rows in the table.
        @param {Integer} cols Number of columns in the table.
        @param {String} which What table to make: 'content', 'width', or 'fill-color'
        @param {String} defaultValue The default value to use if no new or old table value exists.
        @return {Array} of {Array} of {String} The new table values.
    */
    _makeTableOfValues(rows, cols, which, defaultValue) {
        const newTableValues = this.tableModal.getTableValues(which);
        let oldTableValues = this.oldTable.map(row => row.map(cell => cell.content));

        if (which === 'width') {
            oldTableValues = [ this.oldTable[0].map(cell => cell.style && cell.style.width) ];
        }
        else if (which === 'fill-color') {
            oldTableValues = this.oldTable.map(row => row.map(cell =>
                this._convertFillColorXMLNameToModalName(cell.style && cell.style['background-color'])
            ));
        }

        const tableOfValues = makeIndexArray(rows).map(rowIndex => {
            const newRow = newTableValues && newTableValues[rowIndex];
            const oldRow = oldTableValues && oldTableValues[rowIndex];

            return makeIndexArray(cols).map(colIndex => {
                const newValue = newRow && newRow[colIndex];
                const oldValue = oldRow && oldRow[colIndex];

                return newValue || oldValue || defaultValue;
            });
        });

        /// Widths table only contains one row, since the widths is set for the whole column.
        if (which === 'width') {
            return [ tableOfValues[0] ];
        }

        return tableOfValues;
    }

    /**
        Returns the default table (two columns, two rows, empty cells) with headers.
        @method _makeDefaultTableValues
        @private
        @return {Object}
    */
    _makeDefaultTableValues() {
        const defaultNumberOfRowsAndColumns = 2;

        return makeIndexArray(defaultNumberOfRowsAndColumns).map(() =>
            makeIndexArray(defaultNumberOfRowsAndColumns).map(() =>
                this._progressionUtilities.createElementTableCell({ content: '' })
            )
        );
    }

    /**
        Returns the original data of the table being edited.
        At some point we changed the data structure of the tables, this function handles both cases.
        @method _getOldTableData
        @private
        @return {Object}
    */
    _getOldTableData() {
        const tableIsObject = this.oldTable.data || false;
        const defaultNumberOfRowsAndColumns = 2;

        return {
            isUsingList: Boolean(tableIsObject),
            listName: tableIsObject ? this.oldTable.data : '',
            rows: tableIsObject ? defaultNumberOfRowsAndColumns : this.oldTable.length,
            cols: tableIsObject ? defaultNumberOfRowsAndColumns : this.oldTable[0].length,
        };
    }

    /**
        Shows the modal.
        @method show
        @param {Object} tableOptions An object with the current table options.
        @return {void}
    */
    show({ isFirstRowHeader, isFirstColumnHeader, isSpreadsheet, saveCallback, cancelCallback, style }) {
        this.style = style;

        const oldTableData = this._getOldTableData();

        // If a table uses a Python list, make a default table (empty 2x2).
        if (oldTableData.isUsingList) {
            this.oldTable = this._makeDefaultTableValues();
        }

        const modalHTML = this._templates.ElementTableEdit({ // eslint-disable-line new-cap
            isFirstRowHeader, isFirstColumnHeader, isSpreadsheet,
            isUsingList: oldTableData.isUsingList,
            listName: oldTableData.listName,
            rows: oldTableData.rows,
            cols: oldTableData.cols,
        });

        this._parentResource.showModal(
            'Edit table object',
            modalHTML,
            saveCallback,
            cancelCallback
        );

        window.setTimeout(() => {
            this.tableModal = new ElementTableModal('div.table-modal');
            this._initializeModalElements(isSpreadsheet, oldTableData.isUsingList);
        }, 1);
    }

    /**
        Initializes the modal elements by showing/hiding the respective parts.
        @method _initializeModalElements
        @private
        @param {Boolean} isSpreadsheet Whether the table should be shown as a spreadsheet.
        @param {Boolean} isUsingList Whether the table data is in a Python list.
        @return {void}
    */
    _initializeModalElements(isSpreadsheet, isUsingList) {
        const segmentedControlID = 'cell-property-segmented-control';
        const segments = [ 'Content', 'Cell widths' ];
        let minRowsAndCols = 1;

        this.tableContents = this.oldTable.map(row => row.map(cell => cell.content));
        this.tableWidths = [ this.oldTable[0].map(cell => {
            const widthValue = cell.style && cell.style.width;
            const widthRegex = /(\d+\.?\d*)%/;
            const regexMatch = widthRegex.exec(widthValue);
            let cellValue = widthValue;

            if (regexMatch) {
                cellValue = regexMatch[1];
            }

            return cellValue;
        }) ];
        this.tableFillColors = this.oldTable.map(row => row.map(cell =>
            this._convertFillColorXMLNameToModalName(cell.style && cell.style['background-color'])
        ));

        this._renderTables();

        if (isSpreadsheet) {
            this.tableModal.$headersContainer.hide();
            segments.push('Fill color');
            minRowsAndCols = 2;
        }

        this.tableModal.$tableWidthContainer.hide();
        this.tableModal.$tableFillColorContainer.hide();
        if (isUsingList) {
            this.tableModal.$modal.find('div#manual-data').hide();
            this.tableModal.$modal.find('div.preview-container').hide();
        }
        else {
            this.tableModal.$modal.find('div#table-list-name-container').hide();
        }

        this.segmentedControl.init(segments, segmentedControlID);
        this.setMinRowsAndCols(minRowsAndCols);
        this._setupModalListeners();
        this.segmentedControl.selectSegmentByIndex(0);
        this.renderPreview();
    }

    /**
        Sets up the modal event listeners. Ex: Checkin boxes, adding rows/columns, changing tables, etc.
        @private
        @method _setupModalListeners
        @return {void}
    */
    _setupModalListeners() {
        this.segmentedControl.segmentSelectedCallback = index => {
            this.tableModal.$tableContentContainer.hide();
            this.tableModal.$tableWidthContainer.hide();
            this.tableModal.$tableFillColorContainer.hide();
            let $containerToShow = this.tableModal.$tableContentContainer;

            if (index === 1) {
                $containerToShow = this.tableModal.$tableWidthContainer;
            }
            else if (index === 2) { // eslint-disable-line no-magic-numbers
                $containerToShow = this.tableModal.$tableFillColorContainer;
            }
            $containerToShow.show();
        };

        this.tableModal.$headersContainer.find('input').change(() => {
            this.renderPreview();
        });

        this.tableModal.$asSpreadsheet.change(() => {
            const isUsingList = this.tableModal.isUsingPythonList();

            if (!isUsingList) {
                this.saveCurrentTableValues();
            }

            const isSpreadsheet = this.tableModal.$asSpreadsheet.prop('checked');

            this.tableModal.$headersContainer.toggle();
            const minRowsAndCols = isSpreadsheet ? 2 : 1; // eslint-disable-line no-magic-numbers

            this.setMinRowsAndCols(minRowsAndCols);

            let rows = this.tableModal.getNumRows();
            let cols = this.tableModal.getNumCols();
            const fillColorSegmentIndex = 2;

            if (isSpreadsheet) {
                rows++;
                cols++;
                const selectedSegmentIndex = this.segmentedControl.getSelectedSegmentIndex();

                this.segmentedControl.addSegmentAtIndex('Fill color', fillColorSegmentIndex);
                this.segmentedControl.selectSegmentByIndex(selectedSegmentIndex);

                if (!isUsingList) {
                    this._progressionUtilities.addSpreadsheetHeaders(this.tableContents);

                    // Add default fill colors for headers.
                    this.addSpreadsheetCells(this.tableWidths, '8', 'width');
                    this.addSpreadsheetCells(this.tableFillColors, 'default');
                }
            }
            else {
                rows--;
                cols--;
                this.segmentedControl.removeSegmentByIndex(fillColorSegmentIndex);
                this.segmentedControl.selectSegmentByIndex(0);
                if (!isUsingList) {
                    this._progressionUtilities.removeSpreadsheetHeaders(this.tableContents);
                    this._progressionUtilities.removeSpreadsheetHeaders(this.tableWidths, 'width');
                    this._progressionUtilities.removeSpreadsheetHeaders(this.tableFillColors);
                }
            }

            this.tableModal.$inputRows.val(rows);
            this.tableModal.$inputCols.val(cols);
            this._renderTables();
        });

        this.tableModal.$useList.change(() => {
            this.tableModal.$modal.find('div#manual-data').toggle();
            this.tableModal.$modal.find('div#table-list-name-container').toggle();
            this.tableModal.$modal.find('div.preview-container').toggle();
        });

        this.tableModal.$modal.find('div.row-col-input-container input').change(() => {
            const rows = this.getValidRowOrCol(this.tableModal.$inputRows);
            const cols = this.getValidRowOrCol(this.tableModal.$inputCols);

            this.tableContents = this._makeTableOfValues(rows, cols, 'content', '');
            this.tableWidths = this._makeTableOfValues(rows, cols, 'width', '');
            this.tableFillColors = this._makeTableOfValues(rows, cols, 'fill-color', 'default');

            // Update the headers.
            if (this.tableModal.asSpreadsheet()) {
                this._progressionUtilities.removeSpreadsheetHeaders(this.tableContents);
                this._progressionUtilities.addSpreadsheetHeaders(this.tableContents);
            }
            this._renderTables();
        });
    }

    /**
        Renders the preview section in the table modal.
        @method renderPreview
        @return {void}
    */
    renderPreview() {

        // No preview for python lists.
        if (this.tableModal.isUsingPythonList()) {
            return;
        }

        const element = this.getNewConfiguration();

        element.tableData.forEach(column =>
            column.forEach(cell => {
                cell.changeToPrintableStyles();
                cell.contentHTML = this._progressionUtilities.replaceBackticks(cell.content);
            })
        );
        const style = this._progressionUtilities.templates.ElementStyle({ style: this.style }); // eslint-disable-line new-cap
        const tableHTML = this._progressionUtilities.templates.ElementTable({ element, style }); // eslint-disable-line new-cap

        this.tableModal.$previewContainer.empty().html(tableHTML);
        this._parentResource.latexChanged();
    }

    /**
        If rows or columns are not a number, less than 1 or bigger than 50 (can be changed if needed). Then chage it to 1 or 50.
        @method getValidRowOrCol
        @param {Object} $element The jQuery reference to the input element.
        @return {Number} The resulting number withing our parameters.
    */
    getValidRowOrCol($element) {
        let result = parseInt($element.val(), 10);
        const min = parseInt($element.attr('min'), 10);

        if (isNaN(result) || (result < min)) {
            result = min;
        }

        $element.val(result);

        return result;
    }

    /**
        Sets the minimum number of rows and columns allowed. Usual values are: 1 for a normal table, 2 for a spreadsheet table.
        @method setMinRowsAndCols
        @param {Integer} minRowsAndCols The minimum number of rows and columns to allow.
        @return {void}
    */
    setMinRowsAndCols(minRowsAndCols) {
        this.tableModal.$inputRows.attr('min', minRowsAndCols);
        this.tableModal.$inputCols.attr('min', minRowsAndCols);
    }

    /**
        Prepends a row and column to |table|, setting each cell's value to |cellValue|
        @method addSpreadsheetCells
        @param {Array} table A 2D array with the table values.
        @param {String} cellValue The value to set in each new cell.
        @param {String} [which=''] To which table are we adding spreadsheet cells. Widths table is different.
        @return {void}
    */
    addSpreadsheetCells(table, cellValue, which) {
        const isWidthsTable = which === 'width';

        table.forEach(row => row.unshift(cellValue));

        if (!isWidthsTable) {
            const indexArray = makeIndexArray(this.tableContents[0].length);

            table.unshift(indexArray.map(() => cellValue));
        }
    }

    /**
        Saves the current values in the modal.
        @method saveCurrentTableValues
        @return {void}
    */
    saveCurrentTableValues() {
        this.tableContents = this.tableModal.getTableContents();
        this.tableWidths = this.tableModal.getTableWidths();
        this.tableFillColors = this.tableModal.getTableFillColors();
    }

    /**
        Returns the new table configuration.
        @method getNewConfiguration
        @return {Object} The new configuration.
    */
    getNewConfiguration() {
        const isFirstRowHeader = this.tableModal.getIsFirstRowHeader();
        const isFirstColumnHeader = this.tableModal.getIsFirstColumnHeader();
        const isSpreadsheet = this.tableModal.asSpreadsheet();
        const isUsingList = this.tableModal.isUsingPythonList();
        const listName = isUsingList ? this.tableModal.getListName() : '';
        const newContent = this.tableModal.getTableContents();
        const newWidths = this.tableModal.getTableWidths();
        const fixWidth = newWidths.flat()
                                  .some(cell => cell !== '');
        const newFillColor = this.tableModal.getTableFillColors();
        let tableData = {
            data: listName,
        };

        if (!isUsingList) {
            tableData = newContent.map((row, rowIndex) => row.map((content, columnIndex) => {
                const isFirstRow = rowIndex === 0;
                const isFirstColumn = columnIndex === 0;
                const isHeader = (isFirstRow && isFirstRowHeader) || (isFirstColumn && isFirstColumnHeader);
                const widthInCell = newWidths[0][columnIndex];
                const style = {};

                if (widthInCell && isFirstRow) {
                    style.width = `${widthInCell}%`;
                }

                // Record the background color if using spreadsheet, but not a list variable.
                if (isSpreadsheet) {
                    const fillColor = newFillColor[rowIndex][columnIndex];
                    const xmlName = this._progressionUtilities.convertFillColorModalNameToXMLName(fillColor);

                    if (xmlName !== null) {
                        style['background-color'] = xmlName;
                    }
                }

                return this._progressionUtilities.createElementTableCell({ content, isHeader, style });
            }));
        }

        return {
            fixWidth,
            isFirstColumnHeader,
            isFirstRowHeader,
            isSpreadsheet,
            tableData,
        };
    }

    /**
        Convert the XML name to the modal name for the given fill color.
        @method _convertFillColorXMLNameToModalName
        @private
        @param {String} xmlName The XML name for the fill color, like: zyAnimatorBlue
        @return {String} The fill color name shown to the user, like: blue
    */
    _convertFillColorXMLNameToModalName(xmlName) { // eslint-disable-line no-underscore-dangle
        const mappedColor = this.fillColorXMLNameToModalName[xmlName];
        let modalName = 'default';

        // The fill color is a standard color, like: zyAnimatorBlue
        if (mappedColor) {
            modalName = mappedColor;
        }

        // The fill color is not a standard color, but is a string, which could be a Python variable, like: ${cell_color}
        else if (typeof xmlName === 'string') {
            modalName = xmlName;
        }

        return modalName;
    }

    /**
        Returns a table of inputs with the passed values.
        @method _makeTableValueHTML
        @private
        @param {Array} tableValues Array of Array of Strings. The table values to make into HTML.
        @param {String} which Which table values to make into HTML.
        @return {String} The HTML for the given table values.
    */
    _makeTableValueHTML(tableValues, which) {
        const isSpreadsheet = $('input#as-spreadsheet').prop('checked');
        const isWidth = which === 'width';
        const tableValuesToPrint = tableValues.map((row, rowIndex) => (
            row.map((value, columnIndex) => {
                const isDisabled = isSpreadsheet && !isWidth && ((rowIndex === 0) || (columnIndex === 0));

                return { value, rowIndex, columnIndex, isDisabled };
            })
        ));

        return this._templates.TableDataContainer({ tableValuesToPrint, isWidth }); // eslint-disable-line new-cap
    }

    /**
        Renders the indicated table.
        @method _renderGivenTable
        @private
        @param {String} which Which table contents to render. Can be: 'content', 'width', or 'fill-color'.
        @return {void}
    */
    _renderGivenTable(which) {
        let tableContent = this.tableContents;
        let $container = this.tableModal.$tableContentContainer;

        if (which === 'width') {
            tableContent = this.tableWidths;
            $container = this.tableModal.$tableWidthContainer;
        }
        else if (which === 'fill-color') {
            tableContent = this.tableFillColors;
            $container = this.tableModal.$tableFillColorContainer;
        }

        const halfASecond = 500;
        let previewTimeoutId = null;

        $container.empty()
                  .html(this._makeTableValueHTML(tableContent, which));
        const $tableCellInput = $container.find('input.table-cell');

        $tableCellInput.on('input', () => {
            if (previewTimeoutId) {
                clearTimeout(previewTimeoutId);
            }

            previewTimeoutId = window.setTimeout(() => {
                this.renderPreview();
                previewTimeoutId = null;
            }, halfASecond);
        });

        // For widths, include '%' in the input. Clicking '%' is as input was clicked.
        if (which === 'width') {
            $tableCellInput.css('border', 'none');
            $tableCellInput.parent().find('span').click(event => {
                $(event.target).parent().find('input').focus();
            });
        }
    }

    /**
        Renders all three tables.
        @method _renderTables
        @private
        @return {void}
    */
    _renderTables() {
        this._renderGivenTable('content');
        this._renderGivenTable('width');
        this._renderGivenTable('fill-color');
        this.renderPreview();
    }
}
