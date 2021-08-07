/* eslint-disable no-underscore-dangle */
/* global insertTestInstance, removeTestInstance, QuestionAreaController, draggableXML, parseCssProperty */
'use strict';

$(document).ready(() => {
    const id = 3;
    const builder = insertTestInstance(draggableXML);

    QUnit.test('ProgressionBuilderElementController: Move multiple objects', assert => {
        const progression = builder._zyTool.progression;
        const cssProperties = [ 'left', 'top', 'height', 'width' ];
        const $draggableArea = $(`#${id} .draggable-area`);

        assert.ok($('.draggable-area').length, 'A draggable area exists');
        cssProperties.forEach(property => assert.equal($draggableArea.css(property), '0px'));

        // Select all elements, dragging from the elements at the: left, top, right, then bottom.
        const elementControllers = builder._controllers.find(controller =>
            controller instanceof QuestionAreaController
        )._elementControllers;
        const progressionHeight = parseInt(progression.height, 10);
        const progressionWidth = parseInt(progression.width, 10);

        const leftElement = elementControllers[0];
        const topElement = elementControllers[1];
        const rightElement = elementControllers[2];
        const bottomElement = elementControllers[3];
        const $left = leftElement._$element;
        const $top = topElement._$element;
        const $right = rightElement._$element;
        const $bottom = bottomElement._$element;

        const expectedDraggables = elementControllers.map(element => {
            const $element = element._$element;
            const left = parseCssProperty($element, 'left') - parseCssProperty($left, 'left');
            const top = parseCssProperty($element, 'top') - parseCssProperty($top, 'top');
            const height = progressionHeight - top - 1 -
                ((parseCssProperty($bottom, 'top') + parseInt($bottom.height(), 10)) -
                (parseCssProperty($element, 'top') + parseInt($element.height(), 10)));
            const width = progressionWidth - left - 1 -
                ((parseCssProperty($right, 'left') + parseInt($right.width(), 10)) -
                (parseCssProperty($element, 'left') + parseInt($element.width(), 10)));

            return {
                left: `${left}px`,
                top: `${top}px`,
                height: `${height}px`,
                width: `${width}px`,
            };
        });

        builder._selectElements(progression.elements);

        elementControllers.forEach((elementController, index) => {
            elementController._$element.mousedown();

            cssProperties.forEach(property =>
                assert.equal(parseCssProperty($draggableArea, property), parseInt(expectedDraggables[index][property], 10))
            );
        });
    });

    QUnit.test('ProgressionBuilderElementController: Move with arrow keys', assert => {
        const questionAreaController = builder._controllers.find(controller =>
            controller instanceof QuestionAreaController
        );
        let elementController = questionAreaController._elementControllers[0];

        builder._selectElement(elementController._element);
        const originalLeft = parseCssProperty(elementController._$element, 'left');
        const originalTop = parseCssProperty(elementController._$element, 'top');

        const leftArrowEvent = $.Event(`keydown.${id}`, { key: 'ArrowLeft' }); // eslint-disable-line new-cap
        const upArrowEvent = $.Event(`keydown.${id}`, { key: 'ArrowUp' }); // eslint-disable-line new-cap
        const rightArrowEvent = $.Event(`keydown.${id}`, { key: 'ArrowRight' }); // eslint-disable-line new-cap
        const downArrowEvent = $.Event(`keydown.${id}`, { key: 'ArrowDown' }); // eslint-disable-line new-cap

        // Test triggering events moves the element.
        $(window).trigger(leftArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft - 1, 'Pressing left moves 1 pixel left');
        assert.equal(parseCssProperty(elementController._$element, 'top'), originalTop, 'Pressing left does not move vertically');
        $(window).trigger(upArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft - 1, 'Pressing up does not move horizontally');
        assert.equal(parseCssProperty(elementController._$element, 'top'), originalTop - 1, 'Pressing up moves 1 pixel up');
        $(window).trigger(rightArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft, 'Pressing right moves 1 pixel right');
        $(window).trigger(downArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'top'), originalTop, 'Pressing down moves 1 pixel down');

        // Test switching to player deactivates the event handler.
        builder._switchToPlayer();
        $(window).trigger(rightArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft, 'Pressing right on player does nothing');

        // Back to builder enables the event handler.
        builder._switchToBuilder();
        elementController = questionAreaController._elementControllers[0];
        $(window).trigger(rightArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft + 1, 'Pressing right back on builder works');

        // Switching to code editor disables the event handler.
        builder._switchToCodeEditor('Global', builder._zyTool.progression);
        $(window).trigger(rightArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft + 1, 'Pressing right on code editor does nothing');

        // Back to builder enables the event handler.
        builder._switchToBuilder();
        elementController = questionAreaController._elementControllers[0];
        $(window).trigger(rightArrowEvent);
        assert.equal(parseCssProperty(elementController._$element, 'left'), originalLeft + 2, 'Pressing right back on builder works'); // eslint-disable-line no-magic-numbers
    });

    QUnit.test('ProgressionBuilderElementController: Toggle select element', assert => {
        const elementControllers = builder._controllers.find(
            controller => controller instanceof QuestionAreaController
        )._elementControllers;

        assert.ok(elementControllers[0]._element.isSelected, 'First element is selected');
        assert.notOk(elementControllers[1]._element.isSelected, 'Second element is not selected');
        builder._toggleSelectElement(elementControllers[1]._element);
        assert.ok(elementControllers[1]._element.isSelected, 'Toggle second element, second element is now selected.');
        assert.ok(elementControllers[0]._element.isSelected, 'First element is still selected.');
        builder._toggleSelectElement(elementControllers[2]._element);
        builder._toggleSelectElement(elementControllers[3]._element);
        assert.ok(elementControllers.every(elementController => elementController._element.isSelected), 'Toggle remaining, all selected');
        builder._toggleSelectElement(elementControllers[1]._element);
        assert.notOk(elementControllers[1]._element.isSelected, 'Toggle second element, not selected.');
        builder._toggleSelectElement(elementControllers[0]._element);
        assert.notOk(elementControllers[0]._element.isSelected, 'Toggle first element, not selected.');
        assert.ok(elementControllers[2]._element.isSelected, 'Third element still selected');
        assert.ok(elementControllers[3]._element.isSelected, 'Forth element still selected');
    });

    removeTestInstance();
});
