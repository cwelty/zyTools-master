/* global CodeEditorController */
/* exported GlobalCodeController */
'use strict';

/**
    Control the global code.
    @class GlobalCodeController
*/
class GlobalCodeController {

    /**
        Initilize the controller for the global code.
        @constructor
        @param {Number} id The ID assigned to this instance of the module.
        @param {Progression} progression The progression being built.
    */
    constructor(id, progression) {
        this.id = id;
        this._progression = progression;
        this.editor = null;
        this.globalCode = '';
    }

    /**
        Sets the current global code in the code editor.
        @method beginEditing
        @return {void}
    */
    beginEditing() {
        this.containerID = `${this.id}-global-code`;
        this.editor = new CodeEditorController(this.containerID, 'python');
        this.editor.setCode(this._progression.globalCode);
    }

    /**
        Saves the code from the code editor into the |globalCode| member variable.
        @method saveCode
        @return {void}
    */
    saveCode() {
        this._progression.globalCode = this.editor.getCode();
    }
}
