'use strict';

/* global ace */

/**
    Render a user-defined webpage, which may include multiple files. Also, render an expected webpage.
    @module WebpageViewer
    @return {void}
*/
function WebpageViewer() {

    /**
        The name of the module.
        @property name
        @type String
    */
    this.name = '<%= grunt.option('tool') %>';

    /**
        Dictionary of templates for this module.
        @property templates
        @type Object
    */
    this.templates = this[this.name];

    /**
        Identifier give to this module by the parent module.
        @property id
        @type Number
    */
    this.id = null;

    /**
        Array of {File} that user is editing.
        @property files
        @type Array of {File}
        @default null
    */
    this.files = null;

    /**
        The index of the current shown file in |files|.
        @property shownFileIndex
        @type Number
        @default null
    */
    this.shownFileIndex = null;

    /**
        List of ACE file editors.
        @property fileEditors
        @type Array of {Object}
        @default null
    */
    this.fileEditors = null;

    /**
        Whether the module instance has already submitted a completion.
        @property hasSubmitted
        @type Boolean
        @default false
    */
    this.hasSubmitted = false;

    /**
        Whether to show the expected content.
        @property showExpectedContent
        @type Boolean
        @default true
    */
    this.showExpectedContent = true;

    /**
        Render and initialize a {WebpageViewer} instance.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @param {Array} options.files Each element contains JSON that defines a file.
        @param {Boolean} [options.isStacked=false] Whether the webpages should be stacked vertically.
        @param {Boolean} [options.makeIFramesResizable=false] Whether the iFrames are resizable.
        @param {String} [options.renderButtonLabel='Render web page'] The label given to the render button.
        @param {String} [options.outputLabel] The label at heading of each web page.
        @return {void}
    */
    this.init = function(id, parentResource, options) {
        this.id = id;
        this.showExpectedContent = !options.doNotShowExpectedContent;

        // Convert |options.files| to array of {File}.
        this.files = options.files.map(fileJSON => new File(fileJSON));

        if (parentResource.needsAccessible && parentResource.needsAccessible()) {
            this.renderAccessibleVersion(id);
        }
        else {
            this.renderInteractiveVersion(id, parentResource, options);
        }

        // Set the solution if the platform supports.
        if (parentResource.setSolution) {
            const filesWithSolutions = this.files.filter(file => file.expectedContent);

            if (filesWithSolutions.length > 0) {
                const solutionLanguage = (filesWithSolutions.length === 1) ? filesWithSolutions[0].language : '';
                const solution = filesWithSolutions.map(file =>
                    `--- START FILE: ${file.filename} ---\n\n${file.expectedContent}\n\n--- END FILE: ${file.filename} ---`
                ).join('\n\n');

                parentResource.setSolution(solution, solutionLanguage);
            }
        }
    };

    /**
        Render the accessible version of the module.
        @method renderAccessibleVersion
        @param {String} id The unique identifier given to module.
        @return {void}
    */
    this.renderAccessibleVersion = function(id) {
        const webpage = this.getWebpage('initialContent');
        const expectedWebpage = this.getWebpage('expectedContent');
        const html = this[this.name].webpageViewerAccessible({ webpage, expectedWebpage });

        $(`#${id}`).html(html);
    };

    /**
        Render the interactive version of the module.
        @method renderInteractiveVersion
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @return {void}
    */
    this.renderInteractiveVersion = function(id, parentResource, options) {
        const shownFiles = this.files.filter(file => !file.isHidden);
        const haveExpectedContent = this.files.some(file => file.expectedContent) && this.showExpectedContent;
        const hasMultipleShownFiles = (shownFiles.length > 1);
        const renderButtonLabel = options.renderButtonLabel || 'Render web page';
        const outputLabel = options.outputLabel || 'web page';

        // Write {WebpageViewer}'s HTML and CSS to DOM.
        const html = this[this.name].webpageViewer({
            id,
            hasMultipleShownFiles,
            haveExpectedContent,
            isNotStacked: !options.isStacked,
            numberOfShownFiles: shownFiles.length,
            renderButtonLabel,
            outputLabel,
        });

        const css = `<style><%= grunt.file.read(css_filename) %></style>${require('WebpageUtilities').css}`;

        $(`#${id}`).html(css + html);
        this.renderWebpages();

        if (options.makeIFramesResizable) {
            $(`#${id} div.iframe-container`).resizable({
                minWidth: 50,
                minHeight: 50,
                maxWidth: 900,
                start: function() {

                    // Prevent the iFrame from stealing mouse events.
                    $(this).find('iframe').css('pointer-events', 'none');
                },
                stop: function() {
                    $(this).find('iframe').css('pointer-events', '');
                },
            });
        }

        // Load file editor with {File} at index 0 in |files|.
        const utilities = require('utilities');

        this.fileEditors = shownFiles.map((file, index) => {
            const fileEditor = ace.edit([ 'editor', index, id ].join('-'));

            utilities.aceBaseSettings(fileEditor, file.language);
            this.setEditorValue(fileEditor, file.userContent);
            fileEditor.getSession().setUndoManager(new ace.UndoManager());
            return fileEditor;
        });
        this.updateFileEditor(0);

        // Load segmented control if there are multiple files.
        if (hasMultipleShownFiles) {
            const segmentedControl = require('segmentedControl').create();
            const fileNames = shownFiles.map(file => file.filename);

            segmentedControl.init(fileNames, `segmented-control-${id}`, index => {
                this.updateFileEditor(index);
                this.fileEditors[this.shownFileIndex].focus();
            });
        }

        // Update {File} when editor's code changes.
        this.fileEditors.forEach((fileEditor, index) => {
            fileEditor.on('change', () => {
                shownFiles[index].userContent = fileEditor.getValue();
            });
        });

        // Reset all the files.
        $(`#${id} .reset`).click(() => {

            // Print a filename if there are multiple files.
            const filename = (shownFiles.length > 1) ? `${shownFiles[this.shownFileIndex].filename} ` : '';
            const doReset = window.confirm(`Reset your ${filename}code?`); // eslint-disable-line no-alert

            if (doReset) {
                shownFiles[this.shownFileIndex].reset();
                this.setEditorValue(this.fileEditors[this.shownFileIndex], shownFiles[this.shownFileIndex].userContent);
            }
        });

        $(`#${id} .render-webpage`).click(() => {
            this.renderWebpages();

            // Submit completion if first time clicking Render webpage.
            if (!this.hasSubmitted) {
                this.hasSubmitted = true;
                parentResource.postEvent({
                    part: 0,
                    complete: true,
                    answer: this.getWebpage('userContent'),
                    metadata: {
                        event: 'Render web page clicked',
                    },
                });
            }
        });
    };

    /**
        Render the user webpage and expected webpage (if provided).
        @method renderWebpages
        @private
        @return {void}
    */
    this.renderWebpages = function() {

        // Replace the iframes with new ones b/c JavaScript variables persist otherwise.
        this.getUserIframe().remove();
        $(`#${this.id} .user-iframe-container`).append($('<iframe>'));
        this.getExpectedIframe().remove();
        $(`#${this.id} .expected-iframe-container`).append($('<iframe>'));

        const userIFrame = this.getUserIframe().get(0);
        const userWebpage = this.getWebpage('userContent');

        require('WebpageUtilities').updateIFrame(userIFrame, userWebpage);

        const expectedIFrame = this.getExpectedIframe().get(0);
        const expectedWebpage = this.getWebpage('expectedContent');

        if (expectedIFrame && expectedWebpage) {
            require('WebpageUtilities').updateIFrame(expectedIFrame, expectedWebpage);
        }
    };

    /**
        Return the jQuery object of the user's iframe.
        @method getUserIframe
        @private
        @return {Object} jQuery object of the user's iframe.
    */
    this.getUserIframe = function() {
        return $(`#${this.id} .user-iframe-container iframe`);
    };

    /**
        Return the jQuery object of the expected's iframe.
        @method getExpectedIframe
        @private
        @return {Object} jQuery object of the expected's iframe.
    */
    this.getExpectedIframe = function() {
        return $(`#${this.id} .expected-iframe-container iframe`);
    };

    /**
        Get a webpage by concatenating files.
        @method getWebpage
        @private
        @param {String} type The type of webpage to get. Either 'userContent' or 'expectedContent'.
        @return {String} The webpage.
    */
    this.getWebpage = function(type) {
        const filesWithContent = this.files.filter(file => file[type]);
        const webpageFiles = filesWithContent.map(file =>
            require('WebpageUtilities').makeWebpageFile(file.language, file.filename, file[type])
        );

        // Remove HTML file's script tags that reference a user's JS file.
        const jsFilenames = webpageFiles.filter(webpageFile => [ 'js', 'javascript' ].includes(webpageFile.language))
                                        .map(webpageFile => webpageFile.filename);
        const jsSourceRegExs = jsFilenames.map(
            jsFilename => new RegExp(`<script.*src\\s*=\\s*("${jsFilename}"|'${jsFilename}').*>\\s*<\/script>`, 'g')
        );
        const htmlFiles = webpageFiles.filter(webpageFile => webpageFile.language === 'html');

        htmlFiles.forEach(htmlFile => {
            jsSourceRegExs.forEach(jsSourceRegEx => {
                htmlFile.contents = htmlFile.contents.replace(jsSourceRegEx, '');
            });
        });

        return require('WebpageUtilities').buildWebpageFromFiles(webpageFiles);
    };

    /**
        Update the file editor with a new file index in |files|.
        @method updateFileEditor
        @private
        @param {Number} newFileIndex The new file index for the shown {File} in |files|.
        @return {void}
    */
    this.updateFileEditor = function(newFileIndex) {
        this.shownFileIndex = newFileIndex;

        // Hide all editors.
        this.fileEditors.forEach((fileEditor, index) => {
            $([ '#editor', index, this.id ].join('-')).hide();
        });

        // Show new file index's editor.
        $([ '#editor', this.shownFileIndex, this.id ].join('-')).show();

        // Re-render the shown editor.
        this.fileEditors[this.shownFileIndex].renderer.updateFull();
    };

    /**
        Set given content in given file editor.
        @method setEditorValue
        @private
        @param {Object} fileEditor Reference to the file editor.
        @param {String} content The content to set in the editor.
        @return {void}
    */
    this.setEditorValue = function(fileEditor, content) {
        fileEditor.setValue(content);
        fileEditor.moveCursorToPosition({
            column: 0,
            row: 0,
        });
    };

    <%= grunt.file.read(hbs_output) %>
}

module.exports = {
    create: function() {
        return new WebpageViewer();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {

        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
