/* eslint-disable no-underscore-dangle */
/* global insertTestInstance, removeTestInstance, dropdownWithLatexXML, dropdownWithoutLatexXML, fromXMLToZyTool */
'use strict';

$(document).ready(() => {
    const originalAlert = window.alert;

    window.alert = msg => {
        throw new Error(msg);
    };
    insertTestInstance();

    QUnit.test('ProgressionBuilderUtilities: checkLatexInDropdown', assert => {
        assert.throws(
            () => {
                fromXMLToZyTool(dropdownWithLatexXML);
            },
            'LaTeX found in XML, loaded with alert.');
        assert.ok(fromXMLToZyTool(dropdownWithoutLatexXML), 'LaTeX not found, loaded without alerts.');
    });

    removeTestInstance();
    window.alert = originalAlert;
});
