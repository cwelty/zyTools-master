'use strict';

/* exported buildElementTableControllerPrototype */
/* global ElementTableModalController, ProgressionBuilderElementController, PropertyAndValue */

/**
    Control a table element.
    @class ElementTableController
    @extends ProgressionBuilderElementController
*/
class ElementTableController {
    constructor(...args) {
        ProgressionBuilderElementController.prototype.constructor.apply(this, args);
    }
}

/**
    Build the ElementTableController prototype.
    @method buildElementTableControllerPrototype
    @return {void}
*/
function buildElementTableControllerPrototype() {
    ElementTableController.prototype = new ProgressionBuilderElementController();
    ElementTableController.prototype.constructor = ElementTableController;

    /**
        Render the table element.
        @method render
        @return {void}
    */
    ElementTableController.prototype.render = function() {
        ProgressionBuilderElementController.prototype.render.apply(this);

        // Make table resizable.
        this._$element.resizable({
            handles: 'se',
            minHeight: this.minHeight,
            minWidth: this.minWidth,
            stop: () => {

                // Get the size of the actual table.
                this._element.style.height = `${this._$element.children('table').height()}px`;
                this._element.style.width = `${this._$element.children('table').width()}px`;
                this._progressionChangingFunctions.elementStyleUpdate(this._element, [ 'height', 'width' ]);
            },
        });
    };

    /**
        Prompt user to enter the table data.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementTableController.prototype._startEditMode = function() { // eslint-disable-line no-underscore-dangle

        // Get the data from the old table or defaults (empty table, one row, two columns, no headers).
        const isFirstRowHeader = this._getMostSpecificValueOfProperty('isFirstRowHeader') || false;
        const isFirstColumnHeader = this._getMostSpecificValueOfProperty('isFirstColumnHeader') || false;
        const listNameValue = this._getMostSpecificValueOfProperty('listName');
        const listName = (listNameValue && require('utilities').getPythonNotation(listNameValue)) || '';
        const tableData = listName ? { data: listName } : this._getMostSpecificValueOfProperty('tableData');
        const isSpreadsheet = this._getMostSpecificValueOfProperty('isSpreadsheet') || false;
        const style = this._getMostSpecificValueOfProperty('style') || {};

        const tableModalController = new ElementTableModalController(this._parentResource, this._templates, tableData);
        const saveCallback = () => {
            window.setTimeout(() => {
                const newConfiguration = tableModalController.getNewConfiguration();

                this.endEditMode([
                    new PropertyAndValue('isFirstColumnHeader', newConfiguration.isFirstColumnHeader),
                    new PropertyAndValue('isFirstRowHeader', newConfiguration.isFirstRowHeader),
                    new PropertyAndValue('isSpreadsheet', newConfiguration.isSpreadsheet),
                    new PropertyAndValue('tableData', newConfiguration.tableData),
                ]);
            }, 1);
        };
        const tableModalOptions = {
            cancelCallback: this._makeModalCancelButton(),
            isFirstColumnHeader,
            isFirstRowHeader,
            isSpreadsheet,
            saveCallback: this._makeModalSaveButton(saveCallback),
            style,
        };

        tableModalController.show(tableModalOptions);
    };

    /**
        End the edit mode saving the data.
        @method endEditMode
        @param {Array} newProperties Array of {PropertyAndValue}. The updated properties and respective values.
        @return {void}
    */
    ElementTableController.prototype.endEditMode = function(newProperties) {
        this._endEditMode(newProperties);

        // Get the size of the actual table.
        const tableHeight = this._$element.children('table').height();
        const tableWidth = this._$element.children('table').width();
        const offset = 4;

        this._element.style.height = `${tableHeight + offset}px`;
        this._element.style.width = `${tableWidth + offset}px`;
        this._progressionChangingFunctions.elementStyleUpdate(this._element, [ 'height', 'width' ]);
    };

    /**
        The element to render should use CSS colors.
        @method _makeElementToRender
        @private
        @return {Element} The element to render.
    */
    ElementTableController.prototype._makeElementToRender = function() { // eslint-disable-line no-underscore-dangle
        const elementToRender = this._elementRendered.clone();

        return require('ProgressionUtilities').create().makeTableElementToRender(elementToRender);
    };
}
