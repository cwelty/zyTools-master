'use strict';

/* exported buildElementDropdownControllerPrototype */
/* global ProgressionBuilderElementController, PropertyAndValue, ElementDropdownModalController, latexInText */

/**
    Control a dropdown element.
    @class ElementDropdownController
    @extends ProgressionBuilderElementController
*/
function ElementDropdownController() {
    ProgressionBuilderElementController.prototype.constructor.apply(this, arguments);
}

/**
    Build the ElementDropdownController prototype.
    @method buildElementDropdownControllerPrototype
    @return {void}
*/
function buildElementDropdownControllerPrototype() {
    ElementDropdownController.prototype = new ProgressionBuilderElementController();
    ElementDropdownController.prototype.constructor = ElementDropdownController;

    /**
        Start the edit mode wherein the user can edit each dropdown options.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementDropdownController.prototype._startEditMode = function() {

        // Get current options.
        const currentOptions = this._getMostSpecificValueOfProperty('options');
        const dropdownModalController = new ElementDropdownModalController(this._parentResource, this._templates);

        const saveModalCallback = () => {
            window.setTimeout(() => {
                const newOptions = dropdownModalController.getNewOptions();

                this._endEditMode([ new PropertyAndValue('options', newOptions) ]);

                const latexDetected = newOptions.some(({ text }) => latexInText(text));

                if (latexDetected) {
                    const message = 'LaTeX was found in an option of the dropdown, but LaTeX is not supported in dropdowns.';

                    this._parentResource.showModal('LaTeX not supported in dropdown', message, { label: 'Ok' });
                }
            }, 1);
        };

        dropdownModalController.show(currentOptions, this._makeModalSaveButton(saveModalCallback), this._makeModalCancelButton());
    };
}
