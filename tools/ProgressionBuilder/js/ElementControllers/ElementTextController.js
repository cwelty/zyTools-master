'use strict';

/* exported buildElementTextControllerPrototype */
/* global ProgressionBuilderElementController, PropertyAndValue */

/**
    Control a text element.
    @class ElementTextController
    @extends ProgressionBuilderElementController
*/
function ElementTextController() {
    ProgressionBuilderElementController.prototype.constructor.apply(this, arguments);
}

/**
    Build the ElementTextController prototype.
    @method buildElementTextControllerPrototype
    @return {void}
*/
function buildElementTextControllerPrototype() {
    ElementTextController.prototype = new ProgressionBuilderElementController();
    ElementTextController.prototype.constructor = ElementTextController;

    /**
        Prompt user to enter text.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementTextController.prototype._startEditMode = function() { // eslint-disable-line no-underscore-dangle
        const oldText = this._getMostSpecificValueOfProperty('text') || '';
        const oldHTML = require('ProgressionUtilities').create().replaceBackticks(oldText);
        const saveModalCallback = () => {
            const newText = $('.ProgressionBuilder-modal textarea').val();

            window.setTimeout(() => {
                this._endEditMode([ new PropertyAndValue('text', newText) ]);
            }, 1);
        };

        this._parentResource.showModal(
            'Edit text object',
            this._templates.ElementTextEdit({ html: oldHTML, text: oldText }), // eslint-disable-line new-cap
            this._makeModalSaveButton(saveModalCallback),
            this._makeModalCancelButton()
        );

        // Wait 1ms to ensure the modal has been created.
        window.setTimeout(() => {
            const $textarea = $('.ProgressionBuilder-modal textarea');
            const $preview = $('.ProgressionBuilder-modal div.preview-text-object');
            const halfASecond = 500;
            let previewTimeoutId = null;

            $textarea.on('input', () => {
                if (previewTimeoutId) {
                    clearTimeout(previewTimeoutId);
                }

                previewTimeoutId = window.setTimeout(() => {
                    const html = require('ProgressionUtilities').create().replaceBackticks($textarea.val());

                    $preview.html(html);
                    this._parentResource.latexChanged();
                }, halfASecond);
            });

            $textarea.select();
            this._parentResource.latexChanged();
        }, 1);
    };
}
