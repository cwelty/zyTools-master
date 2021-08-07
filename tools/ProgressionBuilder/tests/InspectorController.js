/* eslint-disable no-underscore-dangle */
/* global insertTestInstance, removeTestInstance, QuestionAreaController, InspectorController, draggableXML */
'use strict';

$(document).ready(() => {
    const builder = insertTestInstance(draggableXML);

    QUnit.test('InspectorController: Question area is selectable', assert => {
        const questionArea = builder._controllers.find(controller => controller instanceof QuestionAreaController);
        const inspector = builder._controllers.find(controller => controller instanceof InspectorController);

        assert.equal(inspector._$dom.find('.inspector div:first').text(), 'Multiple objects selected.');
        assert.notOk(questionArea._$dom.find('.question-area').hasClass('selected'), 'Elements selected, so question area is not.');
        questionArea._progressionChangingFunctions.deselectAllElements();

        assert.ok(questionArea._$dom.find('.question-area').hasClass('selected'), 'Elements not selected, question area is.');

        const $heightInput = inspector._$dom.find('input').eq(0);
        const $widthInput = inspector._$dom.find('input').eq(1);

        assert.equal(`${$heightInput.val()}px`, builder._zyTool.progression.height);
        assert.equal(`${$widthInput.val()}px`, builder._zyTool.progression.width);

        $heightInput.val('200').trigger('input');
        $widthInput.val('600').trigger('input');
        assert.equal(`${$heightInput.val()}px`, builder._zyTool.progression.height);
        assert.equal(`${$widthInput.val()}px`, builder._zyTool.progression.width);

        $heightInput.val('1000').trigger('input');
        $widthInput.val('1000').trigger('input');
        assert.equal('500px', builder._zyTool.progression.height, 'Max height is 500px');
        assert.equal('800px', builder._zyTool.progression.width, 'Max width is 800px');

        $heightInput.val('50').trigger('input');
        $widthInput.val('50').trigger('input');
        assert.equal('100px', builder._zyTool.progression.height, 'Min height is 100px');
        assert.equal('450px', builder._zyTool.progression.width, 'Min width is 450px');
    });

    removeTestInstance();
});
