function RestrictedEditor() {
    /*
        |editor| - ace editor object
        |displayNonEditableAreaErrorMessageCallback| - function that takes in a string that is the error message to display
    */
    this.init = function(editor, displayNonEditableAreaErrorMessageCallback) {
        this.editor = editor;
        this.displayNonEditableAreaErrorMessageCallback = displayNonEditableAreaErrorMessageCallback;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        $(editor.container).addClass('restrictedEditor');
        $(editor.container).prepend(css);
        var self = this;
        // Computes row and columns from an index position of the text area.
        self.getCursorPosition = function(index) {
            var contents = self.editor.getValue().substring(0, index);
            var numNewlines = contents.split('\n').length - 1;

            var lastLine = contents.substring(contents.lastIndexOf('\n') + 1);

            return {
                row: numNewlines,
                col: lastLine.length
            };
        };
    };

    this.initAnchors = function() {
        var self = this;
        // Compute placeholder anchors locations for gutter markers.
        var startAnchorPosition = self.getCursorPosition(self.prefix.length);
        var endAnchorPosition = self.getCursorPosition(self.prefix.length + self.placeholder.length);

        // Create dynamic anchors to track start and end of the placeholder region.
        self.startAnchor = self.editor.session.doc.createAnchor(startAnchorPosition.row, startAnchorPosition.col);
        self.endAnchor = self.editor.session.doc.createAnchor(endAnchorPosition.row, endAnchorPosition.col);

        // Add anchor property to track unwanted changes.
        self.endAnchorInvalidPaste = false;

        // Initial gutter marker creation.
        self.updateGutterMarkers(self.editor, self.startAnchor.row, self.endAnchor.row, self.endAnchor.row);

        // Update gutter markers on change of anchors.
        self.startAnchor.on('change', function(changeEventObject) {
            // Start anchor should never change; to be safe we always reset on change.
            // This is so far only known to occur with invalid paste events.
            self.startAnchor.row = changeEventObject.old.row;
            self.startAnchor.column = changeEventObject.old.column;
        });

        self.endAnchor.on('change', function(changeEventObject) {
            // Revert anchor changes for invalid paste events.
            if (self.endAnchorInvalidPaste) {
                self.endAnchor.row = changeEventObject.old.row;
                self.endAnchor.column = changeEventObject.old.column;
            } else {
                // Update gutter markers.
                self.updateGutterMarkers(self.editor, self.startAnchor.row, changeEventObject.old.row, self.endAnchor.row);
            }
        });
    };

    /*
      Set up the ACE editor to ignore editing commands outside of the editable area.
    */
    this.initializeNonEditableAreas = function(prefix, suffix, placeholder) {
        var editor = this.editor;
        var self = this;
        this.prefix = prefix;
        this.suffix = suffix;
        this.placeholder = placeholder;
        this.clearGutterDecorations();
        this.initAnchors();
        // Returns the index of the cursor in the document given the row and column.
        function getCursorIndex(row, column) {
            var lines = editor.getValue().split('\n');

            var totalChars = 0;
            for (var i = 0; i < row; ++i) {
                totalChars += lines[i].length + 1;
            }
            totalChars += column;

            return totalChars;
        }

        // Returns the current index of the start cursor in the document as a whole.
        function getCursorStartPosition(editor) {
            var cursorRow = editor.getSelectionRange().start.row;
            var cursorColumn = editor.getSelectionRange().start.column;

            return getCursorIndex(cursorRow, cursorColumn);
        }

        // Returns the current index of the end cursor in the document as a whole.
        function getCursorEndPosition(editor) {
            var cursorRow = editor.getSelectionRange().end.row;
            var cursorColumn = editor.getSelectionRange().end.column;

            return getCursorIndex(cursorRow, cursorColumn);
        }

        // Returns the highlighted string length between the cursor start and end position.
        function getHighlightedSelectionLength(editor) {
            return getCursorEndPosition(editor) - getCursorStartPosition(editor);
        }

        // Returns the index of where the prefix ends.
        function getPrefixEndPosition(editor) {
            return self.prefix.length;
        }

        // Returns the index of where the suffix begins.
        function getSuffixStartPosition(editor) {
            return editor.getValue().lastIndexOf(self.suffix);
        }

        // Returns a boolean representing whether or not the current selection in the editor
        // is valid for the specified command.
        function commandValid(command, editor, startIndex, endIndex, commandNotAllowedInReadOnlyArea) {

            // Always block command.
            if (command === 'showSettingsMenu') {
                return false;
            }

            // Cursor start is in prefix area or cursor end is in the suffix area.
            if ((startIndex < getPrefixEndPosition(editor) || endIndex > getSuffixStartPosition(editor)) &&
                commandNotAllowedInReadOnlyArea) {
                self.displayNonEditableAreaErrorMessageCallback('Code can only be modified on the highlighted lines around the "Your solution goes here" comment.');
                return false;
            }

            // Start cursor is on right edge of prefix area (allow text insert and forward delete).
            if (startIndex === getPrefixEndPosition(editor) && startIndex == endIndex &&
                (commandNotAllowedInReadOnlyArea && [ 'del', 'indent', 'insertstring', 'inserttext', 'pastestring', 'paste', 'redo', 'undo' ].indexOf(command) === -1)) {
                self.displayNonEditableAreaErrorMessageCallback('Code can only be modified to the right of your current cursor position on the highlighted lines.');
                return false;
            }

            // End cursor is on left edge of suffix area (allow text insert and backspace).
            if (endIndex === getSuffixStartPosition(editor) && startIndex == endIndex &&
                (commandNotAllowedInReadOnlyArea && [ 'backspace', 'insertstring', 'inserttext', 'pastestring', 'paste', 'redo', 'undo' ].indexOf(command) === -1)) {
                self.displayNonEditableAreaErrorMessageCallback('Code can only be modified to the left of your current cursor position on the highlighted lines.');
                return false;
            }

            // Cursor is in editable area, however block the following commands...
            if ([ 'copylinesup', 'movelinesup', 'copylinesdown', 'movelinesdown', 'cut_or_delete',
                 'cut_or_delete', 'removetolinestart', 'removetolineend', 'removewordleft', 'removewordright'
                ].indexOf(command) !== -1) {
                return false;
            }

            // Cursor is in editable area and commands are allowed.
            return true;
        }

        // Override the Ace editors default key handler if a command is executed outside the
        // valid editing range.
        var self = this;
        editor.commands.on('exec', function(event) {
            // Reset invalid paste event.
            self.endAnchorInvalidPaste = false;

            // Certain commands are defined by Ace as not allowed in readOnly mode, we leverage this for our read only sections.
            var commandNotAllowedInReadOnlyArea = (typeof (event.command.readOnly) !== 'undefined') ? !event.command.readOnly : true;

            if (!commandValid(event.command.name,
                              editor,
                              getCursorStartPosition(editor),
                              getCursorEndPosition(editor),
                              commandNotAllowedInReadOnlyArea)) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        // Disable pasting in invalid regions.
        editor.on('paste', function(pasteObject) {
            if (!commandValid('insertstring',
                              editor,
                              getCursorStartPosition(editor),
                              getCursorEndPosition(editor),
                              true)) {
                // Pasting cannot outright be prevented, overwrite paste with original text.
                pasteObject.text = editor.getValue().substr(getCursorStartPosition(editor), getHighlightedSelectionLength(editor));

                // Declare invalid paste event.
                self.endAnchorInvalidPaste = true;
            } else {
                // Reset invalid paste event.
                self.endAnchorInvalidPaste = false;
            }
        });
    };

    /*
      Return the write enabled portion of the entered code.
    */
    this.getWriteEnabledCode = function() {
        var editor = this.editor;
        var contents = editor.getValue();

        var writeEnabledCode = contents.substr(this.prefix.length,
                                          contents.length - this.prefix.length - this.suffix.length);

        return writeEnabledCode;
    };

    this.clearGutterDecorations = function() {
        if (this.startAnchor) {
            this.startAnchor.detach();
        }
        if (this.endAnchor) {
            this.endAnchor.detach();
        }
        for (var i = 0; i < this.editor.session.getLength(); i++) {
            this.editor.session.removeGutterDecoration(i, 'gutter-highlight');
        }
    };

    /*
      Resets and redraws the gutter highlights based on the editable regions.
      We assume the start row (i.e. prefix area) will never change.
    */
    this.updateGutterMarkers = function(editor, startRow, prevEndRow, newEndRow) {
        for (var row = startRow; row <= prevEndRow; row++) {
            editor.session.removeGutterDecoration(row, 'gutter-highlight');
        }
        for (var row = startRow; row <= newEndRow; row++) {
            editor.session.addGutterDecoration(row, 'gutter-highlight');
        }
    };
}

var restrictedEditorExport = {
    create: function() {
        return new RestrictedEditor();
    }
};

module.exports = restrictedEditorExport;
