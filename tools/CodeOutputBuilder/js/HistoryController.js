/* exported HistoryController */
'use strict';

/**
    Keeps track of the actions taken so the user navigate back and forward.
    @class HistoryController
*/
class HistoryController {

    /**
        @constructor
        @param {jQuery} $previousButton The "Previous" button.
        @param {jQuery} $nextButton The "Next" button.
        @param {String} initialState The initial state in the history.
    */
    constructor($previousButton, $nextButton) {

        /**
            List of history states.
            @private
            @property _history
            @type {Array}
            @default []
        */
        this._history = [];

        /**
            Index of the current position in the |_history|.
            @private
            @property _currentIndex
            @type {Number}
            @default -1
        */
        this._currentIndex = -1;

        /**
            A jQuery reference to the "Previous" button.
            @property $previousButton
            @type {jQuery}
        */
        this.$previousButton = $previousButton;
        $previousButton.prop('disabled', true);

        /**
            A jQuery reference to the "Next" button.
            @property $nextButton
            @type {jQuery}
        */
        this.$nextButton = $nextButton;
        $nextButton.prop('disabled', true);
    }

    /**
        Returns the previous state.
        @method previous
        @return {String}
    */
    previous() {
        this._currentIndex--;

        if (this._currentIndex === 0) {
            this.$previousButton.prop('disabled', true);
        }
        this.$nextButton.prop('disabled', false);

        return this._history[this._currentIndex];
    }

    /**
        Returns the next state.
        @method next
        @return {String}
    */
    next() {
        this._currentIndex++;

        if (this._currentIndex === (this._history.length - 1)) {
            this.$nextButton.prop('disabled', true);
        }
        this.$previousButton.prop('disabled', false);

        return this._history[this._currentIndex];
    }

    /**
        Inserts an action into the history.
        @method push
        @param {String} action The action to insert.
        @return {void}
    */
    push(action) {
        const actionIsDifferentFromCurrent = action !== this._history[this._currentIndex];

        // Save the action if it's different from the current one.
        if (actionIsDifferentFromCurrent) {

            // If we're in the middle of the list, then we need to remove the states going forward. We do that by setting the length.
            this._history.length = this._currentIndex + 1;
            this._history.push(action);
            this._currentIndex = (this._history.length - 1);
            this.$nextButton.prop('disabled', true);
            if (this._currentIndex > 0) {
                this.$previousButton.prop('disabled', false);
            }
        }
    }

    /**
        Removes and returns the last action from the history. Updates |_currentIndex| if needed.
        @method pop
        @return {String} The action removed from the history.
    */
    pop() {
        const popped = this._history.pop();

        this._currentIndex = this._currentIndex >= this._history.length ? this._history.length - 1 : this._currentIndex;

        return popped;
    }
}
