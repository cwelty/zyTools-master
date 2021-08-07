/* global ace */
/* exported ResultsController */
'use strict';

/**
    A controller for the results.
    @class ResultsController
*/
class ResultsController {

    /**
        Initialize the results controller.
        @constructor
        @param {String} id The id of the module.
        @param {String} isAccessible Whether this is the accessible version.
        @param {Object} templates Dictionary of Handlebars templates.
    */
    constructor(id, isAccessible, templates) {
        this.id = id;
        this.isAccessible = isAccessible;
        this.templates = templates;
        this.$resultsContainer = $(`#${id} #results`);
    }

    /**
        Shows the results container.
        @method show
        @return {void}
    */
    show() {
        this.$resultsContainer.show();
    }

    /**
        Renders the database tables and contents.
        @method renderDatabase
        @param {Object} serverResults An object with the server's results.
        @param {Integer} numTables The number of tables expected in the Database.
        @return {void}
    */
    renderDatabase(serverResults, numTables) {
        if (serverResults.output.error) {
            this.renderError(`An error ocurred while getting the database data: ${serverResults.output.error}`);
            return;
        }
        const numQueries = serverResults.output.queries.length;
        const tables = serverResults.output.queries.slice(numQueries - numTables);
        const numberOfTables = tables.length;
        const databaseTableObjects = tables.map(tableData => {
            const tableNameRegEx = /SELECT \* FROM (.+)/;
            const tableName = tableNameRegEx.exec(tableData.statement)[1];

            return this.makeTableFromData({
                tableData,
                givenTableName: tableName,
            });
        });
        const databaseTablesHTML = databaseTableObjects.map(tableObject => this.templates.table(tableObject));
        const $databaseContainer = this.$resultsContainer.find('.database-container');

        $databaseContainer.html(this.templates.database({ numberOfTables }));
        $databaseContainer.find('div#database-output').html(databaseTablesHTML);

        const $databaseOutput = $databaseContainer.find('div#database-output');

        $databaseOutput.html(databaseTablesHTML);
        this.setupExpandableListeners();
    }

    /**
        Renders the results of the queries.
        @method renderQueries
        @param {Object} serverResults An object with the server's results.
        @param {CodeEditorController} editorController The editor controller.
        @return {void}
    */
    renderQueries(serverResults, editorController) {
        const queries = serverResults.output.queries;
        const numberOfQueries = queries.length;
        const resultTableObjects = queries.map((queryData, queryIndex) => this.makeTableFromData({
            tableData: queryData,
            isQuery: true,
            queryIndex,
        }));
        const resultTablesHTML = resultTableObjects.map(tableObject => this.templates.table(tableObject));
        const $queriesContainer = this.$resultsContainer.find('.queries-container');

        $queriesContainer.html(this.templates.queries({ numberOfQueries }));
        $queriesContainer.find('#query-output').html(resultTablesHTML);

        this.$resultsContainer.removeClass('error-output');

        let lastQueryIndex = 0;

        if (!this.isAccessible) {
            resultTableObjects.forEach((tableObject, index) => {
                const substringAndIndex = editorController.getLiteralSubstringAndIndex(tableObject.tableName, lastQueryIndex);
                const firstLineNumber = editorController.editor.session.doc.indexToPosition(substringAndIndex.firstIndex).row + 1;
                const nameContainerId = `query-${this.id}-${index}`;
                const nameContainerEditor = ace.edit(nameContainerId);

                nameContainerEditor.setValue(substringAndIndex.literalStr, -1);
                require('utilities').aceBaseSettings(nameContainerEditor, 'sql');
                nameContainerEditor.setOptions({
                    firstLineNumber,
                    highlightActiveLine: false,
                    highlightGutterLine: false,
                    readOnly: true,
                    minLines: 1,
                    maxLines: 5,
                });

                // Next search will start at last query's first index + 1. This avoids matching the same query multiple times.
                lastQueryIndex = substringAndIndex.firstIndex + 1;
            });
        }
    }

    /**
        Makes a table object that can be feed to the "table" template.
        @method makeTableFromData
        @param {Object} tableData The data for the table.
        @param {String} [givenTableName=null] The table name, if any.
        @param {Boolean} [isQuery=false] Whether the table has been generated from a query.
        @param {Boolean} [queryIndex=null] The index of the query.
        @return {Object}
    */
    makeTableFromData({ tableData, givenTableName = null, isQuery = false, queryIndex = -1 }) {
        const tableName = givenTableName || tableData.statement;
        const tableContents = tableData.result_set.slice();
        const columnNames = tableContents.shift();
        const result = {
            columnNames,
            id: this.id,
            isQuery,
            rows: tableContents,
            numberOfRows: tableContents.length,
            tableName,
        };

        if (queryIndex >= 0) {
            result.number = queryIndex;
        }
        return result;
    }

    /**
        Renders the error in the results area.
        @method renderError
        @param {String} sqlError The error to render.
        @return {void}
    */
    renderError(sqlError) {
        this.$resultsContainer
            .addClass('error-output')
            .find('.error-message')
            .text(sqlError)
            .show();
        this.show();
    }

    /**
        Clears the output area.
        @method clearOutputArea
        @return {void}
    */
    clearOutputArea() {
        this.$resultsContainer.hide();
        this.$resultsContainer
            .find('.database-container, .queries-container')
            .empty();
        this.$resultsContainer
            .removeClass('error-output')
            .find('.error-message')
            .empty()
            .hide();
    }

    /**
        Sets up the click listeners for the expandable Database header.
        @method setupExpandableListeners
        @return {void}
    */
    setupExpandableListeners() {
        const $databaseOutput = this.$resultsContainer.find('#database-output');

        this.$resultsContainer.find('.clickable, button')
            .click(() => {
                const $icon = this.$resultsContainer.find('i');
                const newText = $icon.text() === 'expand_more' ? 'expand_less' : 'expand_more';

                $icon.text(newText);
                $databaseOutput.toggle();
            });

        // If the Databse has more than one table, hide initially.
        if ($databaseOutput.find('table').length > 1) {
            $databaseOutput.parent().find('h3').click();
        }
    }
}
