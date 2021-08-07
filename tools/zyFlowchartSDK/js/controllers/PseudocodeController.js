'use strict';

/* exported PseudocodeController */
/* global CodeController, makeRandomInteger, globalConstants, ace */

/**
    Render and control a function's pseudocode.
    @class PseudocodeController
    @extends CodeController
*/
class PseudocodeController extends CodeController {

    /**
        @constructor
        @param {String} programCode The program's code.
    */
    constructor(programCode) {
        super(programCode);

        /**
            Callback when the code changes.
            @property codeChangeCallback
            @type {Function}
            @default null
        */
        this.codeChangeCallback = null;

        /**
            Whether the pseudocode is editable.
            @property isPseudocodeEditable
            @type {Boolean}
            @default false
        */
        this.isPseudocodeEditable = false;

        /**
            Whether pseudocode editing is restricted to only the placeholder, and the pre and post are not editable.
            @property isPseudocodeEditingRestricted
            @type {Boolean}
            @default false
        */
        this.isPseudocodeEditingRestricted = false;

        /**
            The program's code that is restricted to editing the placeholder, not the pre and post.
            @property restrictedCode
            @type {RestrictedCode}
            @default null
        */
        this.restrictedCode = null;

        /**
            The editor used for restricting code editing.
            @property restrictedEditor
            @type {restrictedEditor}
            @default null
        */
        this.restrictedEditor = null;
    }

    /**
        Render the function's code.
        @method render
        @return {void}
    */
    render() {
        if (this.hasRendered) {
            const $editor = this.needsAccessibleAndInteractive ? this.$textarea : $(this.editor.container);

            this.$containerDOM.append($editor);
        }
        else {
            if (this.codeChangeCallback) {
                this.codeChangeCallback(this.programCode);
            }

            if (this.needsAccessibleAndInteractive) {
                this.$containerDOM.html('<textarea></textarea>');
                this.$textarea = this.$containerDOM.find('textarea');
                this.$textarea.val(this.programCode)
                              .change(() => {
                                  if (this.codeChangeCallback) {
                                      this.codeChangeCallback(this.$textarea.val());
                                  }
                              });
            }
            else {

                // Generate a random integer to use in the code editor.
                const randomId = makeRandomInteger();
                const codeEditorID = `code-editor-${randomId}`;

                this.$containerDOM.html(globalConstants.templates.pseudocode({ codeEditorID }));
                this.editor = ace.edit(codeEditorID);

                require('utilities').aceBaseSettings(this.editor, 'zyFlowchart');
                this.editor.setValue(this.programCode, 1);
                this.editor.getSession().setUndoManager(new ace.UndoManager());

                if (this.isPseudocodeEditingRestricted) {
                    this.restrictedEditor = require('restrictedEditor').create();
                    this.restrictedEditor.init(this.editor, () => {
                        this.displayNonEditableAreaErrorMessage();
                    });
                    this.restrictedEditor.initializeNonEditableAreas(
                        this.restrictedCode.pre, this.restrictedCode.post, this.restrictedCode.placeholder
                    );

                    const positionForCursor = this.editor.session.doc.indexToPosition(this.restrictedCode.pre.length);

                    this.editor.moveCursorToPosition(positionForCursor);
                }
                else {
                    this.restrictedEditor = null;
                    this.editor.moveCursorToPosition({ column: 0, row: 0 });
                }

                this.editor.getSession().on('change', () => {
                    if (this.codeChangeCallback) {
                        this.codeChangeCallback(this.editor.getSession().getValue());
                    }
                });
            }

            this.hasRendered = true;
        }

        this.updateEditability();
    }

    /**
        Flash the highlighted gutter region until a valid command is used.
        @method displayNonEditableAreaErrorMessage
        @return {void}
    */
    displayNonEditableAreaErrorMessage() {
        if (!this.needsAccessibleAndInteractive) {

            // Animate in the gutter highlight.
            const $highlightedGutterRange = this.$containerDOM.find('.gutter-highlight');

            $highlightedGutterRange.removeClass('gutter-highlight-flash');

            const timeout = 50;

            /*
                Wait 50 milliseconds before adding the |gutter-highlight-flash| class back
                so that the respective animation occurs.
            */
            setTimeout(() => {
                $highlightedGutterRange.addClass('gutter-highlight-flash');
            }, timeout);
        }
    }

    /**
        Ensure the showing of the node that is next to execute.
        @method showNextToExecuteNode
        @param {FlowchartNode} nextNodeToExecute The next node to execute.
        @param {FlowchartNode} previousNodeExecuted The previously executed node.
        @return {void}
    */
    showNextToExecuteNode(nextNodeToExecute, previousNodeExecuted) {
        if (!this.needsAccessibleAndInteractive) {
            this.removeLineNumberHighlighter();

            let nodeToExecute = nextNodeToExecute;

            // For end node's, point to the previous node's line.
            if (nextNodeToExecute && (nextNodeToExecute.getName() === 'EndNode') && previousNodeExecuted) {
                nodeToExecute = previousNodeExecuted;
            }

            const lineNumber = nodeToExecute && nodeToExecute.line && nodeToExecute.line.lineNumber;

            if ($.isNumeric(lineNumber)) {
                const lineIndex = lineNumber - 1;

                this.editor.session.setBreakpoint(lineIndex);
                this.ensureLineNumberInView(lineNumber);

                let startIndexToHighlight = nodeToExecute.line.startIndexOfSegment;
                let endIndexToHighlight = nodeToExecute.line.endIndexOfSegment;

                // Highlight the next non-built-in function to be called.
                if (nodeToExecute.nonBuiltInFunctionCalls.length) {
                    startIndexToHighlight = nodeToExecute.nonBuiltInFunctionCalls[0].startIndexToHighlight;
                    endIndexToHighlight = nodeToExecute.nonBuiltInFunctionCalls[0].endIndexToHighlight;
                }

                // If we're on the end node, then don't highlight the line.
                else if (nextNodeToExecute.getName() === 'EndNode') {
                    startIndexToHighlight = 0;
                    endIndexToHighlight = 0;
                }

                const endIndexToUse = endIndexToHighlight ? endIndexToHighlight + 1 : 0;
                const currentRange = this.editor.selection.getRange();

                currentRange.setStart(lineIndex, startIndexToHighlight);
                currentRange.setEnd(lineIndex, endIndexToUse);
                this.editor.selection.setSelectionRange(currentRange);
            }
            else {
                this.editor.selection.clearSelection();
            }
        }
    }

    /**
        Set whether the pseudocode is editable.
        @method setIsPseudocodeEditable
        @param {Boolean} isPseudocodeEditable Whether the pseudocode is editable.
        @return {void}
    */
    setIsPseudocodeEditable(isPseudocodeEditable) {
        this.isPseudocodeEditable = isPseudocodeEditable;
        this.updateEditability();
    }

    /**
        Set whether the pseudocode editing should be restricted.
        @method setIsPseudocodeEditingRestricted
        @param {Boolean} isPseudocodeEditingRestricted Whether the pseudocode editing should be restricted.
        @param {RestrictedCode} restrictedCode The program's code that is restricted to editing the placeholder, not the pre and post.
        @return {void}
    */
    setIsPseudocodeEditingRestricted(isPseudocodeEditingRestricted, restrictedCode) {
        this.isPseudocodeEditingRestricted = isPseudocodeEditingRestricted;
        this.restrictedCode = restrictedCode;
    }

    /**
        Update whether the code is editable.
        @method updateEditability
        @return {void}
    */
    updateEditability() {
        if (this.isPseudocodeEditable) {
            this.enable();
        }
        else {
            this.disable();
        }
    }

    /**
        Enables the student to write code in the editor. Removes transparency.
        @method enable
        @return {void}
    */
    enable() {
        if (this.editor) {
            const $cursor = $(this.editor.renderer.$cursorLayer.element);

            $cursor.show();
            this.$containerDOM.removeClass('disabled');
            this.editor.setOptions({
                readOnly: false,
                highlightActiveLine: true,
                highlightGutterLine: true,
            });
            this.removeLineNumberHighlighter();
        }
        else if (this.$textarea) {
            this.$textarea.prop('disabled', false);
        }
    }

    /**
        Return the pseudocode stored by this function.
        @method getPseudocode
        @return {String} The code stored by this function.
    */
    getPseudocode() {
        return this.needsAccessibleAndInteractive ? this.$textarea.val() : this.editor.getValue();
    }

    /**
        Set the pseudocode stored by this controller.
        @method setPseudocode
        @param {String} code The code to store in this controller.
        @return {void}
    */
    setPseudocode(code) {
        if (this.needsAccessibleAndInteractive) {
            this.$textarea.val(code);
        }
        else {

            // Set editor value and place cursor at beginning of document.
            this.editor.setValue(code, -1);
        }
    }

    /**
        Set the error message and line number.
        @method setError
        @param {String} message The error message.
        @param {Integer} lineNumber The line number of the error.
        @return {void}
    */
    setError(message, lineNumber) {
        if (!this.needsAccessibleAndInteractive) {

            // Add error markers on line with error.
            const column = 0;
            const row = lineNumber - 1;

            this.editor.getSession().setAnnotations([ { column, row, text: message, type: 'error' } ]);
            this.ensureLineNumberInView(lineNumber);

            // Move cursor to line with error.
            this.editor.moveCursorToPosition({ column, row });
            this.editor.selection.clearSelection();
            this.focus();
        }
    }

    /**
        Clear an error on the controller.
        @method clearError
        @return {void}
    */
    clearError() {
        if (!this.needsAccessibleAndInteractive) {
            this.editor.getSession().clearAnnotations();
        }
    }

    /**
        Set the function to call when the code changes.
        @method setCodeChangeCallback
        @param {Function} codeChangeCallback The function to call when the code changes.
        @return {void}
    */
    setCodeChangeCallback(codeChangeCallback) {
        this.codeChangeCallback = codeChangeCallback;
    }
}
