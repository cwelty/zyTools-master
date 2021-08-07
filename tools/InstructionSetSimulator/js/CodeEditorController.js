'use strict';

/* global ace */

/**
    Control the code editor.
    @class CodeEditorController
    @constructor
    @param {String} containerID The id of the container where the editor should be loaded.
    @param {String} instructionSetName The language's name for syntax highlighting.
    @param {Function} gutterTextFunction Defines what string to put in the gutter of each line.
    @param {Function} setUserAnswerCallback Action to take when user answer changes.
*/
function CodeEditorController(containerID, instructionSetName, gutterTextFunction, setUserAnswerCallback = null) {
    this._editor = ace.edit(containerID);
    require('utilities').aceBaseSettings(this._editor, instructionSetName);

    // Set line number to render as: Line 1, Line 2, etc.
    this._editor.session.gutterRenderer = {
        getWidth: function(session, lastLineNumber, config) {
            return lastLineNumber.length * config.characterWidth;
        },
        getText: function(session, row) {
            return gutterTextFunction(session, row);
        },
    };

    // Call userAnswerCallback on editor change.
    this._editor.session.on('change', () => {
        if (setUserAnswerCallback) {
            setUserAnswerCallback(this.getCode());
        }
    });
}

/**
    Disable the editor.
    @method disable
    @return {void}
*/
CodeEditorController.prototype.disable = function() {
    const $container = $(this._editor.container);
    const $cursor = $(this._editor.renderer.$cursorLayer.element);

    $container.addClass('disabled');
    $cursor.hide();
    this._editor.setOptions({
        readOnly: true,
        highlightActiveLine: false,
        highlightGutterLine: false,
    });
    this._editor.blur();

    this.removeErrorMarker();
};

/**
    Enable the editor.
    @method enable
    @return {void}
*/
CodeEditorController.prototype.enable = function() {
    const $container = $(this._editor.container);
    const $cursor = $(this._editor.renderer.$cursorLayer.element);

    $container.removeClass('disabled');
    $cursor.show();
    this._editor.setOptions({
        readOnly: false,
        highlightActiveLine: true,
        highlightGutterLine: true,
    });

    this.clearBreakpoints();
};

/**
    Resets the undo history.
    @method resetUndoHistory
    @return {void}
*/
CodeEditorController.prototype.resetUndoHistory = function() {
    this._editor.getSession().setUndoManager(new ace.UndoManager());
};

/**
    Move focus to the editor.
    @method focus
    @return {void}
*/
CodeEditorController.prototype.focus = function() {
    this._editor.focus();
};

/**
    Return the code stored in the editor.
    @method getCode
    @return {String} The code in the editor.
*/
CodeEditorController.prototype.getCode = function() {
    return this._editor.getValue();
};

/**
    Set the given code to the editor.
    @method setCode
    @param {String} code The code to set in the editor.
    @return {void}
*/
CodeEditorController.prototype.setCode = function(code) {
    this._editor.setValue(code);

    // Move cursor to start of code.
    this._editor.moveCursorToPosition({
        column: 0,
        row: 0,
    });
};

/**
    Point at the given line number.
    @method setBreakpoint
    @param {Number} lineNumber The line number to point at.
    @return {void}
*/
CodeEditorController.prototype.setBreakpoint = function(lineNumber) {
    const lineNumberIndex = lineNumber - 1;

    this.clearBreakpoints();
    this._editor.session.setBreakpoint(lineNumberIndex);

    // Determine whether the line is visible. Note: The last row is off by 2.
    const firstOffset = 1;
    const isAboveFirstVisibleRow = lineNumberIndex >= (this._editor.getFirstVisibleRow() + firstOffset);
    const lastOffset = 2;
    const isBelowLastVisibleRow = lineNumberIndex <= (this._editor.getLastVisibleRow() - lastOffset);
    const isRowVisible = isAboveFirstVisibleRow && isBelowLastVisibleRow;

    // If the line is not visible, then scroll the line onto screen.
    if (!isRowVisible) {
        this._editor.scrollToLine(lineNumber, true);
        this._editor.gotoLine(lineNumber, 0, true);
    }
};

/**
    Remove the line number pointer on all gutter cells.
    @method clearBreakpoints
    @return {void}
*/
CodeEditorController.prototype.clearBreakpoints = function() {
    this._editor.session.clearBreakpoints();
};

/**
    Add an error marker with an error message.
    @method handleError
    @param {Number} lineNumber The line number to point at.
    @param {String} errorMessage The error message.
    @return {void}
*/
CodeEditorController.prototype.handleError = function(lineNumber, errorMessage) {
    // Add error markers on line with error.
    var column = 0;
    var row    = lineNumber - 1;
    this._editor.getSession().setAnnotations([{
        column: column,
        row:    row,
        text:   errorMessage,
        type:   'error'
    }]);

    // Move cursor to line with error.
    this._editor.moveCursorToPosition({
        column: column,
        row:    row
    });

    this._editor.selection.clearSelection();

    this.focus();
};

/**
    Remove error markers.
    @method removeErrorMarker
    @return {void}
*/
CodeEditorController.prototype.removeErrorMarker = function() {
    this._editor.getSession().setAnnotations();
};

/**
    Return a jQuery reference to the gutter cells in the editor.
    @method _getGutterCells
    @return {Object} jQuery reference to the gutter cells.
*/
CodeEditorController.prototype._getGutterCells = function() {
    return $(this._editor.container).find('.ace_gutter-cell');
};
