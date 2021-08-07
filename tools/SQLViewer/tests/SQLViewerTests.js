/* global SQLViewer */
/* eslint-disable max-len */
'use strict';

$(document).ready(() => {
    const sqlViewer = new SQLViewer();
    const sqlViewer2 = new SQLViewer();
    const createTableInsertRow = `CREATE TABLE student (stu_id INTEGER PRIMARY KEY, last_name VARCHAR(50), first_name VARCHAR(50) NOT NULL);
                                  INSERT INTO student VALUES (123, 'Miller', 'Susan');`;
    const createDatabase = 'CREATE DATABASE testName;';
    const id = 12;
    const parentResource = require('zyWebParentResource');

    $('#qunit').parent().append('<div id="test-tool"><div id="12"></div><div id="13"></div></div>');
    sqlViewer.init(id, parentResource, { code: createTableInsertRow });
    sqlViewer2.init(id + 1, parentResource, { code: createDatabase });

    QUnit.test('Properties generated', assert => {
        const properties = [
            'id', 'templates', 'parentResource', 'isAccessible', 'codeEditorController', 'resultsController', '$tool', 'initialCode',
            'init', 'runClicked' ];

        properties.forEach(property => {
            assert.ok(property in sqlViewer, `Checking if tool has property ${property}.`);
        });

        const templateNames = [ 'SQLViewer', 'database', 'queries', 'table' ];

        templateNames.forEach(name => assert.ok(sqlViewer.templates.hasOwnProperty(name), `Checking if tool has template ${name}.`));
    });

    QUnit.test('Code set', assert => {
        assert.deepEqual(sqlViewer.codeEditorController.getCode(), createTableInsertRow);
        assert.deepEqual(sqlViewer2.codeEditorController.getCode(), createDatabase);
        $('#qunit').parent().find('#test-tool').remove();
    });

    QUnit.test('Test ResultsController.makeTableFromData.', assert => {
        const tableContent = [
            [ 'Column 1', 'Column 2' ],
            [ 'Cell 1x1', null ],
            [ 'Cell 1x2', 'Cell 2x2' ],
        ];
        const tableData = {
            statement: 'Test table',
            result_set: tableContent, // eslint-disable-line camelcase
        };
        const isQuery = true;
        const queryIndex = 0;
        const queryTableObject = sqlViewer.resultsController.makeTableFromData({ tableData, isQuery, queryIndex });
        const expectedQueryTableObject = {
            columnNames: tableContent[0],
            id,
            isQuery: true,
            rows: tableContent.slice(1),
            numberOfRows: tableContent.length - 1,
            tableName: tableData.statement,
            number: 0,
        };

        assert.deepEqual(queryTableObject, expectedQueryTableObject);

        const nonQueryTableObject = sqlViewer.resultsController.makeTableFromData({ tableData, givenTableName: 'Test' });
        const expectedNonQueryTableObject = {
            columnNames: tableContent[0],
            id,
            isQuery: false,
            rows: tableContent.slice(1),
            numberOfRows: tableContent.length - 1,
            tableName: 'Test',
        };

        assert.deepEqual(nonQueryTableObject, expectedNonQueryTableObject);
    });

    QUnit.test('Test SQL file generation', assert => {
        const generatedFile = sqlViewer.makeFileFromCode('SHOW TABLES;');
        const expectedFileOptions = {
            type: 'application/x-sql',
            lastModifiedDate: new Date(),
        };
        const expectedFile = new File([ 'SHOW TABLES;' ], 'myfile.sql', expectedFileOptions);

        assert.equal(generatedFile.name, expectedFile.name);
        assert.equal(generatedFile.type, expectedFile.type);
    });
});
