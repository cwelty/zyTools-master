'use strict';

/* global File */
/* global toType */

$(document).ready(() => {
    const file = new File({
        expectedContent: '<section>\n<h1>Bill of Rights</h1>\n<p>The following are the bill of rights of the USA</p></section>',
        filename: 'index.html',
        language: 'html',
        initialContent: '<section>\nBill of Rights\n<p>The following are the bill of rights of the USA</p></section>',
    });

    const fileProperties = [ 'expectedContent', 'filename', 'language', 'initialContent', 'userContent' ];

    QUnit.test('File creation tests', assert => {
        fileProperties.forEach(property => {
            assert.ok((property in file), `File has property ${property}`);
            assert.equal(toType(file[property]), 'string', `File property ${property} is a string.`);
        });

        assert.ok(('isHidden' in file), 'File has property isHidden');
        assert.equal(toType(file.isHidden), 'boolean', 'File property isHidden is a boolean.');
    });
});
