'use strict';

/* exported buildElementCheckboxControllerPrototype */
/* global ProgressionBuilderElementController, PropertyAndValue */

/**
    Control a checkbox element.
    @class ElementCheckboxController
    @extends ProgressionBuilderElementController
*/
class ElementCheckboxController {
    constructor(...args) {
        ProgressionBuilderElementController.prototype.constructor.apply(this, args);

        // Resize checkbox depending on label size.
        this.resizeCheckbox();
    }
}

/**
    Build the ElementCheckboxController prototype.
    @method buildElementCheckboxControllerPrototype
    @return {void}
*/
function buildElementCheckboxControllerPrototype() {
    ElementCheckboxController.prototype = new ProgressionBuilderElementController();
    ElementCheckboxController.prototype.constructor = ElementCheckboxController;

    /**
        Update the checkbox's width and height based on the label's font size.
        @method elementStyleUpdate
        @return {void}
    */
    ElementCheckboxController.prototype.elementStyleUpdate = function(...args) {
        ProgressionBuilderElementController.prototype.elementStyleUpdate.apply(this, args);
        this.resizeCheckbox();
    };

    /**
        Resize checkbox based on label's font size.
        @method resizeCheckbox
        @return {void}
    */
    ElementCheckboxController.prototype.resizeCheckbox = function() {

        // Get label's font size. Calculate checkbox size with a minimum and maximum size.
        const fontSize = parseInt(this._$element.find('label').first().css('font-size'), 10);

        // Add 0.5px of width and height for each px of font size above 10.
        const minSize = 10;
        let size = minSize;

        if (fontSize > minSize) {
            size = minSize + Math.floor((fontSize - minSize) / 2); // eslint-disable-line no-magic-numbers
        }

        // Change width and height of checkbox.
        this._$element.find('input').first().width(size).height(size);
    };

    /**
        Prompt user to enter the label of the checkbox.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementCheckboxController.prototype._startEditMode = function() { // eslint-disable-line no-underscore-dangle
        const oldCorrectAnswerString = this._getMostSpecificValueOfProperty('correctAnswerIsCheckedString') || '';
        const oldLabel = this._getMostSpecificValueOfProperty('label') || '';

        const saveModalCallback = () => {
            const correctAnswerIsCheckedString = $('input#correct-answer-is-checked').val();
            const label = $('input#new-label').val();

            window.setTimeout(() => {
                this._endEditMode([ new PropertyAndValue('correctAnswerIsCheckedString', correctAnswerIsCheckedString),
                                    new PropertyAndValue('label', label) ]);
                this.resizeCheckbox();
            }, 1);
        };

        // Open modal with a table of inputs representing |newTable| to insert data for the table.
        this._parentResource.showModal(
            'Edit checkbox object',
            this._templates.ElementCheckboxEdit({ correctAnswerIsCheckedString: oldCorrectAnswerString, label: oldLabel }), // eslint-disable-line new-cap
            this._makeModalSaveButton(saveModalCallback),
            this._makeModalCancelButton()
        );
    };
}
