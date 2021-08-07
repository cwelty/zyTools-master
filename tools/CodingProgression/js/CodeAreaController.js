/* global ace */
/* exported CodeAreaController */
'use strict';

/**
    Control the code editor.
    @class CodeAreaController
*/
class CodeAreaController {

    /**
        Initilize the controller for the code area in the programming progression.
        @constructor
        @param {String} containerID The id of the container where the editor should be loaded.
        @param {String} language The language's name for syntax highlighting.
        @param {Boolean} useTextarea Whether the area to write code is a textarea or ace editor.
    */
    constructor(containerID, language, useTextarea) {
        this.containerID = containerID;
        this.$editor = $(`#${containerID}`);
        this.useTextarea = useTextarea;

        if (!useTextarea) {
            this.editor = ace.edit(containerID);
            require('utilities').aceBaseSettings(this.editor, language);
            this.editor.setOptions({
                minLines: 15,
                maxLines: 35,
            });

            this.restrictedEditor = require('restrictedEditor').create();
        }

        this.disable();
    }

    /**
        Save the current position of the cursor.
        @method saveCursorPosition
        @return {void}
    */
    saveCursorPosition() {
        if (!this.useTextarea) {
            this.savedCursorPosition = this.editor.getCursorPosition();
        }
    }

    /**
        Moves the cursor to the saved position.
        @method moveCursorToSavedPosition
        @return {void}
    */
    moveCursorToSavedPosition() {
        if (this.savedCursorPosition) {
            this.editor.moveCursorToPosition(this.savedCursorPosition);
        }
    }

    /**
        Returns the code in the code editor.
        @method getCode
        @return {String} The code that's in the code area.
    */
    getCode() {
        return this.useTextarea ? this.$editor.val() : this.editor.getValue();
    }

    /**
        Returns the code written by the user.
        @method getUserCode
        @return {String} The code entered by the user.
    */
    getUserCode() {
        return this.useTextarea ? this.$editor.val() : this.restrictedEditor.getWriteEnabledCode();
    }

    /**
        Sets the code passed in the editor.
        @method setCode
        @param {String} code The code to set in the code area.
        @return {void}
    */
    setCode(code) {
        if (this.useTextarea) {
            this.$editor.val(code);
        }
        else {
            this.editor.setValue(code, 1);
            this.editor.getSession().setUndoManager(new ace.UndoManager());
            this.reRender();
        }
    }

    /**
        Restricts the editor to only by editable in the |placeholder| part.
        @method restrictEditor
        @param {String} prefix Code above the editable part.
        @param {String} postfix Code below the editable part.
        @param {String} placeholder Editable code.
        @return {void}
    */
    restrictEditor(prefix, postfix, placeholder) {
        if (!this.useTextarea) {
            this.restrictedEditor.init(this.editor, () => {
                this.displayNonEditableAreaErrorMessage();
            });
            this.restrictedEditor.initializeNonEditableAreas(prefix, postfix, placeholder);

            // Move cursor to start of placeholder.
            const contents = prefix + placeholder + postfix;
            const yourCodeIndex = contents.indexOf(placeholder.trim());
            const isCursorDefined = yourCodeIndex !== -1;
            const placeholderIndex = isCursorDefined ? yourCodeIndex : prefix.length;

            this.savedCursorPosition = this.editor.session.doc.indexToPosition(placeholderIndex);
            this.moveCursorToSavedPosition();
        }
    }

    /**
        Enables the user to write code in the unrestricted part of the editor.
        @method enable
        @return {void}
    */
    enable() {
        if (this.useTextarea) {
            this.$editor.attr('disabled', false);
        }
        else {
            this.$editor.removeClass('disabled');
            this.editor.setReadOnly(false);
            this.editor.focus();
            this.moveCursorToSavedPosition();
        }
    }

    /**
        Disables the user from being able to write code in the editor.
        @method disable
        @return {void}
    */
    disable() {
        if (this.useTextarea) {
            this.$editor.attr('disabled', true);
        }
        else {
            this.$editor.addClass('disabled');
            this.editor.setReadOnly(true);
        }
    }

    /**
        Move the cursor to the ACE editor.
        @method focus
        @return {this} Reference to the controller.
    */
    focus() {
        if (this.useTextarea) {
            this.$editor.focus();
        }
        else if (!this.editor.getReadOnly()) {
            this.editor.focus();
        }
        return this;
    }

    /**
        Show the file editor.
        @method show
        @return {this} Reference to the controller.
    */
    show() {
        this.isShown = true;
        this.$editor.show();
        return this;
    }

    /**
        Hide the file editor.
        @method hide
        @return {this} Reference to the controller.
    */
    hide() {
        this.isShown = false;
        this.$editor.hide();
        return this;
    }

    /**
        Force browser to re-render the ace editor and activity. Sometimes editor renders with only 3 lines, this fixes that.
        @method reRender
        @return {void}
    */
    reRender() {
        if (!this.useTextarea) {
            this.editor.resize(true);
            $(`#${this.id}`).hide().show();
        }
    }

    /**
        Flash the highlighted gutter region until a valid command is used.
        @method displayNonEditableAreaErrorMessage
        @return {void}
    */
    displayNonEditableAreaErrorMessage() {
        if (!this.useTextarea) {
            const $highlightedGutterRange = $(`#${this.containerID} .gutter-highlight`);
            const timeout = 50;

            $highlightedGutterRange.removeClass('gutter-highlight-flash');

            // After a timeout add the |gutter-highlight-flash| class back so that the respective animation occurs.
            setTimeout(() => {
                $highlightedGutterRange.addClass('gutter-highlight-flash');
            }, timeout);
        }
    }

}
