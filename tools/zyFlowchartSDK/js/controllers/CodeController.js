'use strict';

/* exported CodeController */
/* global FunctionCodeController */

/**
    Abstract class to render and control a function's code.
    @class CodeController
    @extends FunctionCodeController
*/
class CodeController extends FunctionCodeController {

    /**
        @constructor
        @param {String} programCode The program's code.
    */
    constructor(programCode) {
        super(null);

        /**
            The program's code.
            @property programCode
            @type {String}
        */
        this.programCode = programCode;

        /**
            Reference to the ACE editor instance.
            @property editor
            @type {ACEEditor}
            @default null
        */
        this.editor = null;

        /**
            Whether the controller has rendered before.
            @property hasRendered
            @type {Boolean}
            @default false
        */
        this.hasRendered = false;

        /**
            Whether to provide an accessible and interactive experience.
            @property needsAccessibleAndInteractive
            @type {Boolean}
            @default false
        */
        this.needsAccessibleAndInteractive = false;

        /**
            The textarea used in interactive and accessible mode.
            @property $textarea
            @type {Object}
            @default null
        */
        this.$textarea = null;
    }

    /**
        Set the container DOM for this controller.
        @method setContainerDOM
        @param {Object} $containerDOM jQuery reference to the container for the controller.
        @return {void}
    */
    setContainerDOM($containerDOM) {
        this.$containerDOM = $containerDOM;
    }

    /**
        Set whether to provide an accessible and interactive experience.
        @method setNeedsAccessibleAndInteractive
        @param {Boolean} needsAccessibleAndInteractive Whether to provide an accessible and interactive experience.
        @return {void}
    */
    setNeedsAccessibleAndInteractive(needsAccessibleAndInteractive) {
        this.needsAccessibleAndInteractive = needsAccessibleAndInteractive;
    }

    /**
        Disables the student from being able to write code in the editor. Sets transparency.
        @method disable
        @return {void}
    */
    disable() {
        if (this.editor) {
            const $cursor = $(this.editor.renderer.$cursorLayer.element);

            $cursor.hide();
            this.$containerDOM.addClass('disabled');
            this.editor.setOptions({
                readOnly: true,
                highlightActiveLine: false,
                highlightGutterLine: false,
            });
            this.editor.blur();
        }
        else if (this.$textarea) {
            this.$textarea.prop('disabled', true);
        }
    }

    /**
        Force the editor to re-render itself.
        @method forceEditorReRender
        @return {void}
    */
    forceEditorReRender() {
        if (!this.needsAccessibleAndInteractive) {
            this.editor.resize(true);
        }
    }

    /**
        Remove the line number pointer on all gutter cells.
        @method removeLineNumberHighlighter
        @return {void}
    */
    removeLineNumberHighlighter() {
        if (!this.needsAccessibleAndInteractive) {
            this.editor.session.clearBreakpoints();
        }
    }

    /**
        Ensure the given line number is in view.
        @method ensureLineNumberInView
        @param {Integer} lineNumber The line number to ensure is in view.
        @return {void}
    */
    ensureLineNumberInView(lineNumber) {
        if (!this.needsAccessibleAndInteractive) {
            const lineNumberIndex = lineNumber - 1;

            // Determine whether the line is visible. Note: The last row is off by 2.
            const firstOffset = 1;
            const isBelowFirstVisibleRow = lineNumberIndex >= (this.editor.getFirstVisibleRow() + firstOffset);
            const lastOffset = 2;
            const isAboveLastVisibleRow = lineNumberIndex <= (this.editor.getLastVisibleRow() - lastOffset);
            const isRowVisible = isBelowFirstVisibleRow && isAboveLastVisibleRow;

            // If the line is not visible, then scroll the line onto screen.
            if (!isRowVisible) {
                this.editor.scrollToLine(lineNumber, true);
            }
        }
    }

    /**
        Put the browser's focus on this function.
        @method focus
        @return {void}
    */
    focus() {
        if (this.needsAccessibleAndInteractive) {
            this.$textarea.focus();
        }
        else {
            this.editor.focus();
        }
    }

    /**
        Detach the editor from the DOM for later use.
        @method detach
        @return {void}
    */
    detach() {
        if (this.hasRendered) {
            if (this.needsAccessibleAndInteractive) {
                this.$textarea.detach();
            }
            else {
                const $editor = $(this.editor.container);

                $editor.detach();
            }
        }
    }
}
