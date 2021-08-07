/* eslint-disable no-magic-numbers, no-underscore-dangle */
/* global HistoryController */
'use strict';

$(document).ready(() => {
    const $previousButton = $('<button class="previous">Previous</button>');
    const $nextButton = $('<button class="next">Next</button>');
    const historyController = new HistoryController($previousButton, $nextButton);

    QUnit.test('HistoryController: Controller initialization', assert => {
        assert.equal(historyController._history.length, 0);
        assert.equal(historyController._currentIndex, -1);
        assert.equal(historyController.$previousButton, $previousButton);
        assert.equal(historyController.$nextButton, $nextButton);
        assert.ok(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));
    });

    QUnit.test('HistoryController: Pushing and popping actions', assert => {

        // Push new action.
        historyController.push('action 1');
        assert.equal(historyController._history.length, 1);
        assert.equal(historyController._currentIndex, 0);
        assert.ok(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));

        // Push same action has no effect.
        historyController.push('action 1');
        assert.equal(historyController._history.length, 1);
        assert.equal(historyController._currentIndex, 0);

        historyController.push('action 2');
        assert.equal(historyController._history.length, 2);
        assert.equal(historyController._currentIndex, 1);
        assert.notOk(historyController.$previousButton.prop('disabled'));

        historyController.push('action 3');
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 2);

        historyController.push('action 2');
        assert.equal(historyController._history.length, 4);
        assert.equal(historyController._currentIndex, 3);
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));

        assert.equal(historyController.pop(), 'action 2');
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 2);
        assert.equal(historyController.pop(), 'action 3');
        assert.equal(historyController._history.length, 2);
        assert.equal(historyController._currentIndex, 1);
    });

    QUnit.test('HistoryController: previous() and next()', assert => {
        historyController.push('action 3');
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));

        assert.equal(historyController.previous(), 'action 2');
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 1);
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.notOk(historyController.$nextButton.prop('disabled'));

        assert.equal(historyController.previous(), 'action 1');
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 0);
        assert.ok(historyController.$previousButton.prop('disabled'));
        assert.notOk(historyController.$nextButton.prop('disabled'));

        assert.equal(historyController.next(), 'action 2');
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 1);
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.notOk(historyController.$nextButton.prop('disabled'));

        historyController.push('action 4');
        const currentHistory = [ 'action 1', 'action 2', 'action 4' ];

        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));
        assert.equal(historyController._history.length, 3);
        assert.equal(historyController._currentIndex, 2);
        assert.deepEqual(historyController._history, currentHistory);

        for (let index = 0; index < 100; ++index) {
            historyController.push(`action ${index}`);
        }
        assert.equal(historyController._history.length, 103);
        assert.equal(historyController._currentIndex, 102);

        let action = '';

        do {
            action = historyController.previous();
        } while (action !== 'action 9');

        assert.equal(historyController._history.length, 103);
        assert.equal(historyController._currentIndex, 12);
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.notOk(historyController.$nextButton.prop('disabled'));
        assert.equal(historyController.next(), 'action 10');
        historyController.push('action last');
        assert.equal(historyController._history.length, 15);
        assert.equal(historyController._currentIndex, 14);
        assert.notOk(historyController.$previousButton.prop('disabled'));
        assert.ok(historyController.$nextButton.prop('disabled'));
    });
});
