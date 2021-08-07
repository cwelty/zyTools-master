/* global fromXMLToZyTool, fromZyToolToXML, zyAltDescriptionXML */
'use strict';

$(document).ready(() => {
    QUnit.test('ProgressionBuilder: utilities: fromXMLToZyTool', assert => {
        const zyTool = fromXMLToZyTool(zyAltDescriptionXML);
        const newXmlPromise = fromZyToolToXML(zyTool);
        const assertDone = assert.async();

        newXmlPromise.then(newXml => {

            // The beginning of the XML contains a "edited-last" property that will always differ, so we ignore the first 300 chars.
            assert.ok(newXml.endsWith(zyAltDescriptionXML.slice(300))); // eslint-disable-line no-magic-numbers
            assertDone();
        });
    });
});
