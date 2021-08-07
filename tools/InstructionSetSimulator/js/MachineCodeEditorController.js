'use strict';

/* exported MachineCodeEditorController */
/* global CodeEditorController */

/**
    Control the machine code editor, including handling text and bit representations.
    @class MachineCodeEditorController
    @extends CodeEditorController
*/
class MachineCodeEditorController extends CodeEditorController {

    /**
        @constructor
        @param {String} containerID The id of the container where the editor should be loaded.
        @param {String} instructionSetName The language's name for syntax highlighting.
        @param {Function} gutterTextFunction Defines what string to put in the gutter of each line.
    */
    constructor(containerID, instructionSetName, gutterTextFunction) {
        super(containerID, instructionSetName, gutterTextFunction);

        /**
            The text representation of the machine instructions.
            @property text
            @type {String}
            @default ''
        */
        this.text = '';

        /**
            The bit representation of the machine instructions.
            @property bits
            @type {String}
            @default ''
        */
        this.bits = '';

        /**
            Whether to show text or bit representation.
            @property representationToShow
            @type {String}
            @default ''
        */
        this.representationToShow = '';

        this.showText();
    }

    /**
        Set the |text| variable with the given text.
        @method setText
        @chainable
        @param {String} text The text to store.
        @return {MachineCodeEditorController} Reference to self.
    */
    setText(text) {
        this.text = text;
        this.updateEditor();
        return this;
    }

    /**
        Set the |bits| variable with the given bits.
        @method setBits
        @chainable
        @param {String} bits The bits to store.
        @return {MachineCodeEditorController} Reference to self.
    */
    setBits(bits) {
        this.bits = bits;
        this.updateEditor();
        return this;
    }

    /**
        Set the editor to show text.
        @method showText
        @return {void}
    */
    showText() {
        this.representationToShow = 'text';
        this.updateEditor();
    }

    /**
        Set the editor to show bits.
        @method showBits
        @return {void}
    */
    showBits() {
        this.representationToShow = 'bits';
        this.updateEditor();
    }

    /**
        Update the code in the editor based on the set representation to show.
        @method updateEditor
        @return {void}
    */
    updateEditor() {
        const code = (this.representationToShow === 'text') ? this.text : this.bits;

        this.setCode(code);
    }
}
