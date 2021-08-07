/* global CodeFile */
'use strict';

$(document).ready(() => {
    const codeFile = new CodeFile('main.cpp', false, '<content>');
    const codeFileJSON = {
        filename: 'main.cpp',
        main: false,
        program: '<content>',
    };
    const codeFileFromJSON = new CodeFile('');

    codeFileFromJSON.fromJSON(codeFileJSON);
    const codeFiles = [ codeFile, codeFileFromJSON ];

    QUnit.test('CodeFile: property and fromJSON() tests', assert => {
        codeFiles.forEach(codeFileElement => {
            assert.equal(codeFileElement.filename, 'main.cpp', 'Testing filename');
            assert.notOk(codeFileElement.isMain, 'Testing isMain');
            assert.equal(codeFileElement.content, '<content>', 'Testing content');
        });
    });

    const expectedXML = `        <file type='dict'>
            <filename>main.cpp</filename>
            <main type='boolean'>false</main>
            <program unescape-html='true'>&lt;content&gt;</program>
        </file>`;

    QUnit.test('CodeFile: methods test', assert => {
        assert.equal(codeFile.toXML(), expectedXML, 'Testing toXML()');
        assert.deepEqual(codeFile.toJSON(), codeFileJSON, 'Testing toJSON()');
        assert.equal(codeFile.getContent(), '<content>', 'Testing getContent(false)');
        assert.equal(codeFile.getContent(true), '&lt;content&gt;', 'Testing getContent(true)');
    });
});
