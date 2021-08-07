'use strict';

/* exported PortedCodeController */
/* global CodeController, makeRandomInteger, globalConstants, ace */

/**
    Render and control a function's ported code.
    @class PortedCodeController
    @extends CodeController
*/
class PortedCodeController extends CodeController {

    /**
        @constructor
        @param {String} programCode The program's code.
        @param {String} portLanguage The language of the code.
    */
    constructor(programCode, portLanguage) {
        super(programCode);

        /**
            The language of the code.
            @property portLanguage
            @type {String}
        */
        this.portLanguage = portLanguage;
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
            if (this.needsAccessibleAndInteractive) {
                this.$containerDOM.html('<textarea></textarea>');
                this.$textarea = this.$containerDOM.find('textarea');
            }
            else {

                // Generate a random integer to use in the code editor.
                const randomId = makeRandomInteger();
                const codeEditorID = `code-editor-${randomId}`;

                this.$containerDOM.html(globalConstants.templates.pseudocode({ codeEditorID }));
                this.editor = ace.edit(codeEditorID);

                const mapLanguage = { 'C++': 'cpp' };

                require('utilities').aceBaseSettings(this.editor, mapLanguage[this.portLanguage]);
            }

            this.hasRendered = true;
        }

        if (this.needsAccessibleAndInteractive) {
            this.$textarea.val(this.programCode);
        }
        else {
            this.editor.setValue(this.programCode, 1);
            this.editor.moveCursorToPosition({ column: 0, row: 0 });
        }

        this.disable();

        if (!this.isInExecuteMode) {
            this.$containerDOM.removeClass('disabled');
        }
    }

    /**
        Ensure the showing of the node that is next to execute.
        @method showNextToExecuteNode
        @param {FlowchartNode} nextNodeToExecute The next node to execute.
        @return {void}
    */
    showNextToExecuteNode(nextNodeToExecute) {
        if (!this.needsAccessibleAndInteractive) {
            this.removeLineNumberHighlighter();

            const line = nextNodeToExecute && nextNodeToExecute.portedLine;

            if (line && $.isNumeric(line.lineNumber)) {
                const lineIndex = line.lineNumber - 1;

                this.editor.session.setBreakpoint(lineIndex);
                this.ensureLineNumberInView(line.lineNumber);

                let startIndexToHighlight = line.startIndexOfSegment;
                let endIndexToHighlight = line.endIndexOfSegment;

                // Highlight the next non-built-in function to be called.
                if (nextNodeToExecute.nonBuiltInFunctionCalls.length) {
                    startIndexToHighlight = nextNodeToExecute.nonBuiltInFunctionCalls[0].portedStartIndexToHighlight;
                    endIndexToHighlight = nextNodeToExecute.nonBuiltInFunctionCalls[0].portedEndIndexToHighlight;
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
}
