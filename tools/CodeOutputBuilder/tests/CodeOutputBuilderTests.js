/* eslint-disable no-magic-numbers, no-underscore-dangle */
/* global CodeOutputBuilder, emptyProgressionXML, basicCppProgression, exportedProgression, expectedLevelData */
'use strict';

$(document).ready(() => {
    $('<div id="3" class="CodeOutputBuilder">').insertAfter('.interactive-activity-container:last');
    const parentResource = require('zyWebParentResource').create(3, 'CodeOutputBuilder');
    const builder = new CodeOutputBuilder();
    const lastSave = parentResource.getLocalStore('COBLastSave');

    parentResource.setLocalStore('COBLastSave', emptyProgressionXML);
    builder.init(3, parentResource);

    // Override alert/confirm
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    window.alert = msg => console.log(msg); // eslint-disable-line no-console
    window.confirm = msg => {
        console.log(msg); // eslint-disable-line no-console
        return true;
    };

    let levelsAndFilesController = null;
    let levelsContentController = null;

    QUnit.test('CodeOutputBuilder: Import/export', assert => {
        const $importExportTextarea = builder.getElement('.import-export');
        const $exportButton = builder.getElement('button.export');
        const $importButton = builder.getElement('button.import');
        const $captionInput = builder.getElement('input.caption-container');

        // Start a new progression.
        builder.getElement('button.new').trigger('click');
        builder.progression.guid = 'GUID';
        $exportButton.trigger('click');
        assert.equal($importExportTextarea.val(), '', 'Exporting without caption doesn\'t work');

        $captionInput.val('Caption');
        $captionInput.trigger('blur');
        $exportButton.trigger('click');
        assert.equal($importExportTextarea.val(), emptyProgressionXML, 'Exporting with caption works');

        // Import progression.
        $importExportTextarea.val(basicCppProgression);
        $importButton.trigger('click');

        levelsAndFilesController = builder.levelsAndFilesController;
        levelsContentController = builder.levelsContentController;

        assert.equal(builder.progression.levels.length, 2);
        assert.equal(builder.progression.levels[1].files.length, 3);

        assert.equal(levelsAndFilesController.$levelsAndFiles.find('.level-container').length, 2, 'Importing XML');
        assert.equal(levelsAndFilesController._getLevelContainer(0).find('.file-row').length, 1);
        assert.equal(levelsAndFilesController._getLevelContainer(1).find('.file-row').length, 3);
        assert.equal(levelsContentController.codeEditorsPerLevel.length, 2);
        assert.equal(levelsContentController.codeEditorsPerLevel[0].length, 1);
        assert.equal(levelsContentController.codeEditorsPerLevel[1].length, 3);
        assert.equal(levelsContentController.parameterEditors.length, 2);
        assert.ok(levelsContentController._getLevelContainer(0).is(':visible'));
        assert.ok(levelsContentController._getLevelContainer(1).is(':hidden'));
    });

    QUnit.test('CodeOutputBuilder: Add files and levels.', assert => {
        const $level2Container = levelsAndFilesController._getLevelContainer(1);

        // Add new file.
        $level2Container.find('button.add-file').trigger('click');
        assert.equal(builder.progression.levels[1].files.length, 4, 'Creating a new file');
        assert.equal(levelsAndFilesController._getLevelContainer(1).find('.file-row').length, 4);
        assert.ok(levelsAndFilesController._getFileContainer(1, 3).find('button.file-name').hasClass('selected'));
        assert.equal(levelsAndFilesController._getFileContainer(1, 3).find('span.file').text(), 'file-3.cpp');
        assert.ok(levelsContentController._getLevelContainer(1).is(':visible'));
        assert.ok(levelsContentController._getLevelContainer(0).is(':hidden'));
        assert.ok(levelsContentController._getFileContainer(1, 3).is(':visible'));
        assert.ok(levelsContentController._getFileContainer(1, 0).is(':hidden'));

        assert.equal(levelsContentController.codeEditorsPerLevel[1].length, 4);

        // Add new level.
        levelsAndFilesController.$levelsAndFiles.find('.add-level-container').trigger('click');
        assert.equal(builder.progression.levels.length, 3, 'Creating a new level');
        assert.equal(levelsAndFilesController.$levelsAndFiles.find('.level-container').length, 3);
        assert.ok(levelsAndFilesController._getLevelContainer(2).find('button.level').hasClass('selected'));
        assert.equal(levelsAndFilesController._getLevelContainer(2).find('.level-title').text(), 'Level 3');
        assert.ok(levelsContentController._getLevelContainer(2).is(':visible'));
        assert.ok(levelsContentController._getLevelContainer(1).is(':hidden'));
        assert.ok(levelsContentController._getFileContainer(2, 0).is(':visible'));
        assert.ok(levelsContentController._getFileContainer(1, 3).is(':hidden'));
        assert.equal(levelsContentController.codeEditorsPerLevel.length, 3);
        assert.equal(levelsContentController.codeEditorsPerLevel[2].length, 1);
        assert.equal(levelsContentController.parameterEditors.length, 3);

    });

    QUnit.test('CodeOutputBuilder: Select files and levels.', assert => {

        // Select level 1.
        levelsAndFilesController._getLevelContainer(0).find('button.level').trigger('click');
        assert.ok(levelsAndFilesController._getLevelContainer(0).find('button.level').hasClass('selected'), 'Selecting level 1');
        assert.ok(levelsContentController._getLevelContainer(0).is(':visible'));
        assert.ok(levelsContentController._getLevelContainer(2).is(':hidden'));
        assert.ok(levelsContentController._getFileContainer(0, 0).is(':visible'));
        assert.ok(levelsContentController._getFileContainer(2, 0).is(':hidden'));

        // Select file 3 in level 2.
        levelsAndFilesController._getFileContainer(1, 2).find('button.file-name').trigger('click');
        assert.ok(levelsAndFilesController._getLevelContainer(1).find('button.level').hasClass('selected'), 'Selecting file 3 in level 2');
        assert.ok(levelsContentController._getLevelContainer(1).is(':visible'));
        assert.ok(levelsContentController._getLevelContainer(0).is(':hidden'));
        assert.ok(levelsContentController._getFileContainer(1, 2).is(':visible'));
        assert.ok(levelsContentController._getFileContainer(0, 0).is(':hidden'));

    });

    QUnit.test('CodeOutputBuilder: Rename file.', assert => {

        // Rename file 1 in level 3.
        builder.renameFile(2, 0, 'renamed.cpp');
        assert.equal(levelsAndFilesController._getFileContainer(2, 0).find('span.file').text(), 'renamed.cpp', 'Level 3: rename file');
    });

    QUnit.test('CodeOutputBuilder: Move files and levels.', assert => {

        // Move file 4 in level 2 to second position.
        builder.moveFileFromLevel(1, 3, 1);
        levelsAndFilesController = builder.levelsAndFilesController;
        assert.equal(levelsAndFilesController._getFileContainer(1, 0).find('span.file').text(), 'main.cpp', 'Level 2: Move file 4 to 2');
        assert.equal(levelsAndFilesController._getFileContainer(1, 1).find('span.file').text(), 'file-3.cpp');
        assert.equal(levelsAndFilesController._getFileContainer(1, 2).find('span.file').text(), 'imperial.h');
        assert.equal(levelsAndFilesController._getFileContainer(1, 3).find('span.file').text(), 'metric.h');

        // Move level 3 to 1.
        builder.moveLevel(2, 0);
        assert.equal(levelsAndFilesController._getFileContainer(0, 0).find('span.file').text(), 'renamed.cpp', 'Move level 3 to 1');
        assert.equal(levelsAndFilesController._getLevelContainer(0).find('.file-row').length, 1);
        assert.equal(levelsAndFilesController._getLevelContainer(1).find('.file-row').length, 1);
        assert.equal(levelsAndFilesController._getLevelContainer(2).find('.file-row').length, 4);
        assert.equal(levelsContentController.codeEditorsPerLevel[0].length, 1);
        assert.equal(levelsContentController.codeEditorsPerLevel[1].length, 1);
        assert.equal(levelsContentController.codeEditorsPerLevel[2].length, 4);
        assert.equal(levelsContentController.parameterEditors.length, 3);
    });

    QUnit.test('CodeOutputBuilder: Get level data, export progression.', assert => {
        const levelData = levelsContentController.getLevelData(2);

        assert.deepEqual(levelData, expectedLevelData, 'Get level 3 data');

        builder.getElement('button.export').trigger('click');
        assert.equal(builder.getElement('.import-export').val(), exportedProgression, 'Export progression');
    });

    QUnit.test('CodeOutputBuilder: Remove files and levels.', assert => {

        // Remove file 2 in level 3.
        builder.removeFileFromLevel(2, 1);
        assert.equal(levelsAndFilesController._getFileContainer(2, 0).find('span.file').text(), 'main.cpp', 'Level 2: remove file 2');
        assert.equal(levelsAndFilesController._getFileContainer(2, 1).find('span.file').text(), 'imperial.h');
        assert.equal(levelsAndFilesController._getFileContainer(2, 2).find('span.file').text(), 'metric.h');
        assert.equal(builder.progression.levels[2].files.length, 3);
        assert.equal(levelsAndFilesController._getLevelContainer(2).find('.file-row').length, 3);
        assert.equal(levelsContentController.codeEditorsPerLevel[2].length, 3);

        // Remove level 1.
        builder.removeLevel(0);
        assert.equal(levelsAndFilesController._getFileContainer(0, 0).find('span.file').text(), 'file-1.cpp', 'Remove level 1');
        assert.equal(levelsAndFilesController._getLevelContainer(0).find('.file-row').length, 1);
        assert.equal(levelsAndFilesController._getLevelContainer(1).find('.file-row').length, 3);
        assert.equal(levelsContentController.codeEditorsPerLevel.length, 2);
        assert.equal(levelsContentController.codeEditorsPerLevel[0].length, 1);
        assert.equal(levelsContentController.codeEditorsPerLevel[1].length, 3);
        assert.equal(levelsContentController.parameterEditors.length, 2);
    });

    // Restore last save in local store. Restore window.alert/confirm
    parentResource.setLocalStore('COBLastSave', lastSave);
    window.alert = originalAlert;
    window.confirm = originalConfirm;
    $('#3').remove();
});
