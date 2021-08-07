/* global ace */
/* exported FileEditorController */
'use strict';

/**
    Control the file editor.
    @class FileEditorController
*/
class FileEditorController {

    /**
        Initilize the controller for a file editor in the programming progression.
        @constructor
        @param {String} containerID The id of the container where the editor should be loaded.
        @param {QuestionFile} questionFile The initial question file.
    */
    constructor(containerID, questionFile) {

        /**
            The unique ID for the file editor's container.
            @property containerID
            @type {String}
        */
        this.containerID = containerID;

        // Build the editor.
        const editor = ace.edit(containerID);
        const contents = questionFile.toContents();

        require('utilities').aceBaseSettings(editor, questionFile.language);
        editor.setValue(contents, 1);

        let restrictedEditor = null;

        if (questionFile.placeholder) {
            restrictedEditor = require('restrictedEditor').create();
            restrictedEditor.init(editor, () => {
                this.displayNonEditableAreaErrorMessage();
            });
            restrictedEditor.initializeNonEditableAreas(questionFile.prefix, questionFile.postfix, questionFile.placeholder);
        }

        let placeholderIndex = 0;

        if (questionFile.placeholder) {
            const yourCodeIndex = contents.indexOf(questionFile.yourCodeGoesHereMessage);
            const isCursorDefined = yourCodeIndex !== -1;

            // If cursor is defined, move cursor to start of the "Your solution goes here" text. Otherwise, add to location inside placeholder
            placeholderIndex = isCursorDefined ? yourCodeIndex : questionFile.prefix.length;
        }

        const positionForCursor = editor.session.doc.indexToPosition(placeholderIndex);

        editor.moveCursorToPosition(positionForCursor);

        /**
            Reference to the ACE editor instance.
            @property editor;
            @type {ACEEditor}
        */
        this.editor = editor;

        /**
            Reference to the restricted editor instance.
            @property restrictedEditor
            @type {RestrictedEditor}
        */
        this.restrictedEditor = restrictedEditor;

        /**
            jQuery reference to the ACE editor's DOM element.
            @property $editor
            @type {Object}
        */
        this.$editor = $(`#${containerID}`);

        /**
            Whether the editor is currently shown.
            @property isShown
            @type {Boolean}
        */
        this.isShown = false;

        this.disable();
    }

    /**
        Returns the code written in the file editor.
        @method getCode
        @return {String} The code that's in the code editor.
    */
    getCode() {
        return this.editor.getValue();
    }

    /**
        Returns the code written by the student.
        @method getStudentCode
        @return {String} The code entered by the student
    */
    getStudentCode() {
        return this.restrictedEditor.getWriteEnabledCode();
    }

    /**
        Enables the student to write code in the editor. Removes transparency.
        @method enable
        @return {this} Reference to the controller.
    */
    enable() {
        if (this.restrictedEditor) {
            this.$editor.removeClass('disabled');
            this.editor.setReadOnly(false);

            if (this.isShown) {
                this.focus();
            }
        }
        return this;
    }

    /**
        Disables the student from being able to write code in the editor. Sets transparency.
        @method disable
        @return {this} Reference to the controller.
    */
    disable() {
        this.$editor.addClass('disabled');
        this.editor.setReadOnly(true);
        return this;
    }

    /**
        Move the cursor to the ACE editor.
        @method focus
        @return {this} Reference to the controller.
    */
    focus() {
        if (!this.editor.getReadOnly()) {
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
        Force the editor to re-render.
        @method forceRerender
        @return {this} Reference to the controller.
    */
    forceRerender() {
        this.editor.resize(true);
        return this;
    }

    /**
        Flash the highlighted gutter region until a valid command is used.
        @method displayNonEditableAreaErrorMessage
        @return {void}
    */
    displayNonEditableAreaErrorMessage() {

        // Animate in the gutter highlight.
        const $highlightedGutterRange = $(`#${this.containerID} .gutter-highlight`);

        $highlightedGutterRange.removeClass('gutter-highlight-flash');

        const timeout = 50;

        /* Wait 50 milliseconds before adding the |gutter-highlight-flash| class back
           so that the respective animation occurs. */
        setTimeout(() => {
            $highlightedGutterRange.addClass('gutter-highlight-flash');
        }, timeout);
    }

}
