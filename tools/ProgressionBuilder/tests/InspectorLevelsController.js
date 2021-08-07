/* eslint-disable no-underscore-dangle */
/* global insertTestInstance, removeTestInstance, InspectorController, inspectorControllerTestXML */
'use strict';

$(document).ready(() => {
    const builder = insertTestInstance(inspectorControllerTestXML);

    QUnit.test('ProgressionBuilder: Inspector mutiple level select', assert => {
        const inspector = builder._controllers.find(controller => controller instanceof InspectorController);
        const $inspector = inspector._$dom;

        assert.equal($inspector.find('.inspector div:first').text(), 'Multiple objects selected.');

        const $level1Checkbox = $inspector.find('input[name="Level 1"]');
        const $level2Checkbox = $inspector.find('input[name="Level 2"]');
        let $level3Checkbox = $inspector.find('input[name="Level 3"]');

        // Both objects appear in level 1, only 1 in level 2, and neither in level 3.
        assert.ok($level1Checkbox.prop('checked'), 'Level 1 is checked');
        assert.ok($level2Checkbox.prop('indeterminate'), 'Level 2 is indeterminate');
        assert.notOk($level3Checkbox.prop('checked'), 'Level 3 is not checked');

        // Uncheck level 1 checkbox.
        $level1Checkbox.click();
        assert.ok($('.ProgressionBuilder-modal'), 'Modal appears with question variants');
        $('button.leftButton').click();
        assert.notOk($level1Checkbox.prop('checked'), 'Level 1 is not checked');

        const progression = builder._zyTool.progression;

        assert.equal(progression.levels[0].usedElements.length, 0, 'Unchecking "Level 1" removes all objects from level 1');

        // Completely check level 2 checkbox. Then, uncheck.
        assert.deepEqual(progression.levels[1].usedElements, [ '1' ], 'Initially, level 2 only has 1 object.');
        $level2Checkbox.click();
        assert.deepEqual(progression.levels[1].usedElements, [ '1', '0' ], 'Checking "Level 2" adds the second object to level 2');
        $level2Checkbox.click();
        $('button.leftButton').click();
        assert.equal(progression.levels[1].usedElements.length, 0, 'Unchecking "Level 2" removes all objects');

        // Check level 3 checkbox, then uncheck.
        assert.equal(progression.levels[2].usedElements.length, 0, 'Level 3 does not have any element');
        $level3Checkbox.click();
        assert.deepEqual(progression.levels[2].usedElements, [ '1', '0' ], 'Checking "Level 3" adds both objects to level 3');
        $level3Checkbox.click();
        assert.deepEqual(progression.levels[2].usedElements.length, 0, 'Unchecking "Level 3" removes objects from level 3');

        // Select only object 2, check on level 3. Select both objects, see if "Level 3" is indeterminate.
        builder._selectElement(progression.elements[0]);
        assert.notEqual($inspector.find('.inspector div:first').text(), 'Multiple objects selected.', 'Only one element selected now');
        $level3Checkbox = $inspector.find('input[name="Level 3"]');
        $level3Checkbox.click();
        assert.deepEqual(progression.levels[2].usedElements, [ '1' ]);
        builder._selectElements(progression.elements);
        assert.equal($inspector.find('.inspector div:first').text(), 'Multiple objects selected.', 'Multiple objects selected now');
        $level3Checkbox = $inspector.find('input[name="Level 3"]');
        assert.ok($level3Checkbox.prop('indeterminate'), 'Level 3 is indeterminate');
    });

    removeTestInstance();
});
