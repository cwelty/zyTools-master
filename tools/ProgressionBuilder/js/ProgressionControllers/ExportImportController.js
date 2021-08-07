'use strict';

/* exported ExportImportController */
/* global fromZyToolToXML, fromXMLToZyTool, checkLatexInDropdown, ProgressionController */

/**
    Control the export and import area.
    @class ExportImportController
    @extends ProgressionController
    @constructor
*/
function ExportImportController(...args) {
    ProgressionController.prototype.constructor.apply(this, args);
}

ExportImportController.prototype = new ProgressionController();
ExportImportController.prototype.contructor = ExportImportController;

/**
    Render the export and import area, then add listeners.
    @method render
    @return {void}
*/
ExportImportController.prototype.render = function() {

    // Render export and import area.
    this._$dom.empty();

    const exportImportHTML = this._templates.ExportImport(); // eslint-disable-line new-cap

    this._$dom.html(exportImportHTML);

    // Add export click listener.
    const $textarea = this._$dom.find('textarea');

    this._$dom.find('.export').click(() => {
        if (this._zyTool.caption) {
            checkLatexInDropdown(this._zyTool.progression);
            fromZyToolToXML(this._zyTool, true).then(xml => {
                $textarea.val(xml);
                $textarea.select();
            });
        }
        else {
            this._parentResource.alert(
                'Export canceled',
                'Progression missing a caption.'
            );
        }
    });

    // Add import click listener.
    this._$dom.find('.import').click(() => {
        const importedZyTool = fromXMLToZyTool($textarea.val());

        if (this._zyTool.isEmpty()) {
            if (importedZyTool) {
                this._progressionChangingFunctions.updatedZyTool(importedZyTool);
            }
        }
        else if (this._zyTool.sameAs(importedZyTool)) {
            this._progressionChangingFunctions.updatedZyTool(importedZyTool);
        }
        else {
            this._confirmImportViaModal(importedZyTool);
        }
    });
};

/**
    Shows a modal to confirm importing.
    @method _confirmImportViaModal
    @private
    @param {ZyTool} zyTool The progression to import.
    @return {void}
*/
ExportImportController.prototype._confirmImportViaModal = function(zyTool) {
    const title = 'Override current progression?';
    const message = 'Importing will override current progression.';
    const leftButton = {
        label: 'Yes, override',
        decoration: 'button-blue',
        callback: () => {
            this._progressionChangingFunctions.updatedZyTool(zyTool);
        },
    };
    const rightButton = {
        label: 'No, do not override',
        decoration: 'button-red',
    };

    this._parentResource.showModal(title, message, leftButton, rightButton);
};

/**
    Update the |_progression| object.
    @param {Progression} progression The updated progression object.
    @return {void}
*/
ExportImportController.prototype.updateProgression = function(progression) {
    this._progression = progression;
};
