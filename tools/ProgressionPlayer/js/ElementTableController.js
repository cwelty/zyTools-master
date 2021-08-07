'use strict';

/* exported buildElementTableControllerPrototype */
/* global ProgressionPlayerElementController, ClipboardJS */

/**
    Control a table element.
    @class ElementTableController
    @extends ProgressionPlayerElementController
*/
class ElementTableController {

    /**
        Calls the {ProgressionPlayerElementController} constructor and renders this element.
        @constructor
    */
    constructor(...args) {

        /**
            Instance of Clipboard JS used for copying a spreadsheet to the user's clipboard.
            @property clipboard
            @type {ClipboardJS}
            @default null
        */
        this.clipboard = null;

        // If there are arguments, then initialize the controller. Otherwise, the controller is being inherited, so don't initialize.
        if (args.length !== 0) {
            ProgressionPlayerElementController.prototype.constructor.apply(this, args);
            this.render();
        }
    }
}

/**
    Build the ElementTableController prototype.
    @method buildElementTableControllerPrototype
    @return {void}
*/
function buildElementTableControllerPrototype() {
    ElementTableController.prototype = new ProgressionPlayerElementController();
    ElementTableController.prototype.constructor = ElementTableController;

    /**
        Render the element and listen for presses of the enter key.
        @method render
        @return {void}
    */
    ElementTableController.prototype.render = function() {
        ProgressionPlayerElementController.prototype.render.apply(this);

        if (this._elementRendered.isSpreadsheet) {
            const $button = this._$element.find('button');

            if (ClipboardJS.isSupported()) {
                const table = this._elementRendered.tableData.map(row => row.map(cell => cell.content));

                require('ProgressionUtilities').create().removeSpreadsheetHeaders(table);

                const sheet = table.map(row => row.join('\t'))
                                   .join('\n');

                $button.attr({
                    'data-clipboard-text': sheet,
                    title: 'Copied!',
                }).tooltip({
                    close: () => {
                        $button.tooltip('disable');
                    },
                    disabled: true,
                });

                this.clipboard = new ClipboardJS($button.get(0));

                this.clipboard.on('success', () => {
                    $button.tooltip('enable').tooltip('open');
                    this._parentResource.postEvent({
                        part: this._progressionTool.currentQuestionNumber,
                        complete: false,
                        metadata: {
                            message: 'Copy sheet clicked',
                        },
                    });
                });
            }
            else {
                $button.remove();
            }
        }
    };

    /**
        Destroy the controller by removing associated event listeners and DOM elements.
        @method destroy
        @return {void}
    */
    ElementTableController.prototype.destroy = function() {
        ProgressionPlayerElementController.prototype.destroy.apply(this);

        if (this.clipboard) {
            this.clipboard.destroy();
        }
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
