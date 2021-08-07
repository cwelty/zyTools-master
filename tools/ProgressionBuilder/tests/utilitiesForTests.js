/* exported insertTestInstance, removeTestInstance */
/* global emptyProgressionXML, ProgressionBuilder */
'use strict';

const id = 3;
let testParentResource = null;
let lastSave = null;

/**
    Inserts a ProgressionBuilder instance for testing.
    Returns the parent resource of the test instance, and the XML originally stored in local store.
    @function insertTestInstance
    @param {String} [initialXML=emptyProgressionXML] The initial XML to load into the test instance.
    @return {Object} The PB builder object.
*/
function insertTestInstance(initialXML = emptyProgressionXML) {
    $(`<div id='${id}' class='ProgressionBuilder'>`).insertAfter('.interactive-activity-container:last');
    testParentResource = require('zyWebParentResource').create(id, 'ProgressionBuilder');
    const builder = new ProgressionBuilder();

    if (lastSave === null) {
        lastSave = testParentResource.getLocalStore('lastSave');
    }

    testParentResource.setLocalStore('lastSave', initialXML);
    builder.init(id, testParentResource);

    return builder;
}

/**
    Removes the test instance given the ID, restores the last saved into local store.
    @function removeTestInstance
    @return {void}
*/
function removeTestInstance() {
    if (lastSave !== null) {
        testParentResource.setLocalStore('lastSave', lastSave);
    }
    $(`#${id}`).remove();
}
