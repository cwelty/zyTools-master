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
    */
    constructor(containerID, language) {
        this.containerID = containerID;
        this.editor = ace.edit(`${containerID}`);
        require('utilities').aceBaseSettings(this.editor, language);
        this.editor.setReadOnly(true);
        this.$editor = $(`#${containerID}`);

        this.restrictedEditor = require('restrictedEditor').create();
        this.disable();

        const codePlaceholder = 'Your solution goes here';
        const cCppJavaPlaceholderComment = `/* ${codePlaceholder} */`;
        const pythonPlaceholderComment = `''' ${codePlaceholder} '''`;

        this.placeholderComment = language.includes('python') ? pythonPlaceholderComment : cCppJavaPlaceholderComment;
    }

    /**
        Save the position of the cursor to get back to it later.
        If the code is the default (contains a comment saying "Your solution goes here"), moves the cursor to the start of the comment.
        @method saveCursorPosition
        @return {void}
    */
    saveCursorPosition() {
        this.positionForCursor = this.editor.getCursorPosition();
    }

    /**
        Moves the cursor to the start of the placeholder.
        @method moveCursorToStudentCode
        @return {void}
    */
    moveCursorToStudentCode() {
        this.editor.moveCursorToPosition(this.positionForCursor);
    }

    /**
        Returns the code written in the code editor.
        @method getCode
        @return {String} The code that's in the code area.
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
        Sets the code passed in the editor.
        @method setCode
        @param {String} code The code to set in the code area.
        @return {void}
    */
    setCode(code) {
        this.editor.setValue(code, 1);
        this.editor.getSession().setUndoManager(new ace.UndoManager());
        this.reRender();
    }

    /**
        Restricts the student to be only able to write in the |placeholder| part.
        @method restrictEditor
        @param {String} prefix The prefix of unrestricted part of the editor.
        @param {String} postfix The postfix of the unrestricted part of the editor.
        @param {String} placeholder The unrestricted part of the editor.
        @return {void}
    */
    restrictEditor(prefix, postfix, placeholder) {
        this.restrictedEditor.init(this.editor, () => {
            this.displayNonEditableAreaErrorMessage();
        });
        this.restrictedEditor.initializeNonEditableAreas(prefix, postfix, placeholder);

        const contents = prefix + placeholder + postfix;
        const yourCodeIndex = contents.indexOf(this.placeholderComment);
        const isCursorDefined = yourCodeIndex !== -1;

        // If cursor is defined, move cursor to start of the "Your solution goes here" text. Otherwise, add to location inside placeholder
        const placeholderIndex = isCursorDefined ? yourCodeIndex : prefix.length;
        const positionForCursor = this.editor.session.doc.indexToPosition(placeholderIndex);

        this.editor.moveCursorToPosition(positionForCursor);
    }

    /**
        Enables the student to write code in the editor. Removes transparency.
        @method enable
        @return {void}
    */
    enable() {
        this.$editor.removeClass('disabled');
        this.editor.setReadOnly(false);
        this.editor.focus();
        this.moveCursorToStudentCode();
    }

    /**
        Disables the student from being able to write code in the editor. Sets transparency.
        @method disable
        @return {void}
    */
    disable() {
        this.$editor.addClass('disabled');
        this.editor.setReadOnly(true);
    }

    /**
        Sometimes editor renders with only 3 lines. In attempt to fix, force browser to re-render the ace editor and activity.
        @method reRender
        @return {void}
    */
    reRender() {
        this.editor.resize(true);
        $(`#${this.id}`).hide().show();
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
