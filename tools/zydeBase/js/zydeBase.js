function zyDEBase() {
    this.init = function(containerId, options, runPressedCallback, initializationComplete) {
        this.name = '<%= grunt.option("tool") %>';
        this.containerId = containerId;

        this.runPressedCallback = runPressedCallback;

        // Boolean determining if the user can press run. Run is disabled when they press run,
        // and re-enabled as part of the |runPressedCallback|.
        this.runEnabled = true;

        this.utilities = require('utilities');

        const useHomePageStyling = (options && options.useHomePageStyling);

        if (options) {
            this.language = options['language'];
            this.inputEnabled = options['input_enabled'];
            this.resetEnabled = options['reset_enabled'];
            this.stacked = options['stacked'];
            this.input = options['input'];
            this.program = options['program'];
            this.files = options['multifiles'];
        }

        // Verify that a language was provided.
        if (!this.language) {
            var errorManager = require('zyWebErrorManager');
            errorManager.postError('zyde option missing');
            return;
        }

        // Add an index and |main| boolean into each file.
        this.mainFilename = '';
        var self = this;
        this.files.forEach(function(file, index) {
            file.index = index;
            file.selected = false;
            file.main = (file.main != undefined ? file.main === 'true' : false);
            if (file.main) {
                self.mainFilename = file.filename;
            }
        });

        // Mark the first file as selected if there are multiple.
        if (this.files.length > 1) {
            this.files[0].selected = true;
        }

        // Keep the original files around by making a deep copy.
        this.original_files = jQuery.extend(true, {}, this.files);

        var html = this[this.name]['zydeBase']({
            id: this.containerId,
            inputEnabled: this.inputEnabled,
            resetEnabled: this.resetEnabled,
            stacked: this.stacked,
            input: this.input,
            initial_program: this.files[0].program,
            files: (this.files.length > 1 ? this.files : []),
            useHomePageStyling,
        });

        // Inject the HTML and CSS into the tool's containing div.
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        $('#' + this.containerId).html(css + html);

        // Generate an array of filenames.
        var filenames = this.files.map(function(file) {
            return file.filename;
        });

        // Create a segmented control of filenames.
        this.currently_selected_file_index = 0;
        var fileTabs = require('segmentedControl').create();
        fileTabs.init(filenames, 'segmented-control-container' + this.containerId, function(tabIndex) {
            // Record cursor position.
            self.ace_selection_ranges[self.currently_selected_file_index] = self.editor.getSelectionRange();

            // Record code.
            self.files[self.currently_selected_file_index].program = self.editor.getValue();

            // Update contents of editor.
            self.editor.setValue(self.files[tabIndex].program);

            // Update cursor position.
            self.editor.selection.setSelectionRange(self.ace_selection_ranges[tabIndex], false);

            self.currently_selected_file_index = tabIndex;
        });

        // Initialize the ACE Editor.
        this.editor = ace.edit('editor' + this.containerId);

        // Set our base properties for all ace instances
        this.utilities.aceBaseSettings(this.editor, this.language);

        // Sometimes editor renders with only 3 lines. In attempt to fix, force browser to re-render the ace editor and activity.
        this.editor.resize(true);
        $('#' + this.containerId).hide().show();

        // Initialize a list of empty selection ranges.
        this.ace_selection_ranges = this.files.map(function() {
            return self.editor.getSelectionRange();
        });

        // Set up button press bindings.
        $('#reset-button' + this.containerId).click(function() {
            if (window.confirm('Reset to original code?')) {
                self.editor.setValue(self.original_files[self.currently_selected_file_index].program);
            }
        });

        // This callback is passed to the |runPressedCallback|, and is used to re-enable
        // the run button after a run.
        var reenableZyDECallback = function() {
            self.enableButtons();
        };

        $('#run-button' + this.containerId).click(function() {
            // Check if the run button is disabled.
            if (!self.runEnabled) {
                return;
            }

            // Disable buttons.
            self.disableButtons();

            // Save the code in the currently open tab.
            self.files[self.currently_selected_file_index].program = self.editor.getValue();

            // Call the callback.
            if (self.runPressedCallback) {
                self.runPressedCallback(self.files,
                                        self.mainFilename,
                                        ($('#input' + self.containerId).val() || ''),
                                        reenableZyDECallback);
            } else {
                // No callback, so immediately re-enable buttons.
                reenableZyDECallback();
            }
        });

        // Call the initialzation complete callback.
        if (initializationComplete) {
            initializationComplete();
        }
    };

    /*
      Utility functions for overwriting or appending to the output in the console.
    */
    this.setOutput = function(output) {
        $('#output' + this.containerId).html(output);
    };

    this.appendToOutput = function(output) {
        $('#output' + this.containerId).html($('#output' + this.containerId).html() + output);
    };

    /*
      Utility functions for enabling and disabling buttons, as well as setting the
      |runEnabled| flag appropriately.
    */
    this.enableButtons = function() {
        $('#run-button' + this.containerId).removeClass('disabled');
        $('#reset-button' + this.containerId).removeClass('disabled');
        this.runEnabled = true;
    };

    this.disableButtons = function() {
        $('#run-button' + this.containerId).addClass('disabled');
        $('#reset-button' + this.containerId).addClass('disabled');
        this.runEnabled = false;
    };

    /*
      Returns a reference to the ACE editor used by this zyDE base.
    */
    this.getEditor = function() {
        return this.editor;
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

var zydeBaseExport = {
    create: function() {
        return new zyDEBase();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = zydeBaseExport;
