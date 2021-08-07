/* global CodeEditorController,  ResultsController */
'use strict';

/**
    A database and query viewer for SQL databases.
    @module SQLViewer
*/
class SQLViewer {

    /**
        Initialize the properties.
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned with this module.
            @property id
            @type {String}
            @default ''
        */
        this.id = '';

        /**
            Dictionary of handlebars templates.
            @property templates
            @type {Object}
        */
        this.templates = this['<%= grunt.option("tool") %>'];

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            Whether to render the accessible version.
            @property isAccessible
            @type {Boolean}
            @default false
        */
        this.isAccessible = false;

        /**
            The code editor controller.
            @property codeEditorController
            @type {CodeEditorController}
            @default null
        */
        this.codeEditorController = null;

        /**
            A controller for the results section of the tool.
            @property resultsController
            @type {ResultsController}
            @default null
        */
        this.resultsController = null;

        /**
            jQuery reference to the tool's DOM.
            @property $tool
            @type {jQuery}
            @default null
        */
        this.$tool = null;
    }

    /**
        Initialize the viewer with the given options.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.parentResource = parentResource;
        this.initialCode = options.code || '';
        this.isAccessible = parentResource.needsAccessible && parentResource.needsAccessible();
        this.$tool = $(`#${id}`);
        require('utilities').addIfConditionalHandlebars();

        if (options.solution) {
            parentResource.setSolution(options.solution, 'SQL');
        }
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this.templates.SQLViewer({ id, isAccessible: this.isAccessible }); // eslint-disable-line new-cap
        const code = options && options.code || '';

        this.$tool.html(css + html);
        this.codeEditorController = new CodeEditorController(`editor-container-${this.id}`, this.isAccessible);
        this.codeEditorController.setCode(code);
        this.setupListeners();
        this.resultsController = new ResultsController(id, this.isAccessible, this.templates);
    }

    /**
        Sets up the button listeners.
        @method setupListeners
        @return {void}
    */
    setupListeners() {
        this.$tool.find('.run-button')
            .click(() => this.runClicked());
        this.$tool.find('.reset')
            .click(() => {
                const leftButton = {
                    label: 'Yes, reset code',
                    callback: () => {
                        this.codeEditorController.setCode(this.initialCode);
                        const $resetMessage = this.$tool.find('.reset-message');
                        const twoSeconds = 2000;

                        $resetMessage.show();
                        setTimeout(() => {
                            $resetMessage.fadeOut(twoSeconds);
                        }, twoSeconds);
                    },
                    decoration: 'button-blue',
                };
                const rightButton = {
                    label: 'No, do not reset code',
                    decoration: 'button-red',
                };

                this.parentResource.showModal('Reset code?', '', leftButton, rightButton);
            });

        if (!this.isAccessible) {
            require('utilities').submitOnCtrlReturn(this.codeEditorController.editor, () => this.runClicked());
        }
    }

    /**
        Runs the code in the editor.
        @method runClicked
        @return {void}
    */
    runClicked() {
        const $runButton = this.$tool.find('.run-button');
        const $processingDiv = this.$tool.find('.processing');

        $runButton.attr('disabled', true);
        this.resultsController.clearOutputArea();
        $processingDiv.show()
            .text('0/2 Getting query results...');

        let code = this.codeEditorController.getCode();

        // Add SHOW TABLES at the end, so we can use to get all the tables' information.
        code += ';\nSHOW TABLES;';

        const userSqlFile = this.makeFileFromCode(code);
        const userFormData = require('utilities').getSQLConfigFormDataObject(userSqlFile);
        const serverErrorMsg = 'Error: if the problem persists, please let us know through the feedback button of the activity.';

        this.parentResource.runCode(userFormData)
            .then(results => {
                if (results.error || results.output.error) {
                    this.resultsController.renderError(results.error || results.output.error);
                    this.prepareForNextRequest();
                    return;
                }

                // Use the results of SHOW TABLES to get each of the tables contents.
                const showTablesQuery = results.output.output.queries.pop();
                const tableNames = showTablesQuery.result_set.slice(1);
                const selectAllFromTables = tableNames.map(tableName => `SELECT * FROM ${tableName[0]};`)
                    .join('\n');

                const selectAllFile = this.makeFileFromCode(code + selectAllFromTables);
                const selectAllFormData = require('utilities').getSQLConfigFormDataObject(selectAllFile);

                this.resultsController.renderQueries(results.output, this.codeEditorController);

                this.$tool.find('.processing').text('1/2 Getting database contents...');
                this.parentResource.runCode(selectAllFormData)
                    .then(selectAllResults => {
                        if (selectAllResults.error || selectAllResults.output.error) {
                            this.resultsController.renderError(selectAllResults.error || selectAllResults.output.error);
                            this.prepareForNextRequest();
                            return;
                        }

                        const numberOfTables = tableNames.length;

                        this.resultsController.renderDatabase(selectAllResults.output, numberOfTables);

                        this.parentResource.postEvent({
                            part: 0,
                            complete: true,
                            metadata: { code },
                        });
                        this.prepareForNextRequest();
                        this.resultsController.show();
                    },

                    // Error
                    () => {
                        this.resultsController.renderError(serverErrorMsg);
                        this.prepareForNextRequest();
                    });
            },

            // Error.
            () => {
                this.resultsController.renderError(serverErrorMsg);
                this.prepareForNextRequest();
            });
    }

    /**
        Prepares the tool for the next request: Enables the "Run button" and hides the processing message.
        @method prepareForNextRequest
        @return {void}
    */
    prepareForNextRequest() {
        this.$tool.find('.run-button').attr('disabled', false);
        this.$tool.find('.processing').hide();
    }

    /**
        Makes a SQL file from the code in the editor.
        @method makeFileFromCode
        @param {String} code The code to use to make the file.
        @return {void}
    */
    makeFileFromCode(code) {
        const fileOptions = {
            type: 'application/x-sql',
            lastModifiedDate: new Date(),
        };

        return new File([ code ], 'myfile.sql', fileOptions);
    }
}

module.exports = {
    create: function() {
        return new SQLViewer();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
