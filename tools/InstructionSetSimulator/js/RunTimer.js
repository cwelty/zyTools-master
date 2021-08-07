'use strict';

/* exported RunTimer */

/**
    A timer that calls a given function after a defined interval of time.
    @class RunTimer
*/
class RunTimer {

    /**
        @constructor
        @param {Function} callbackFunction The function to callback after each interval.
        @param {Number} waitTimeInSeconds The interval time to wait.
    */
    constructor(callbackFunction, waitTimeInSeconds) {
        this.updateWaitTimeInSeconds(waitTimeInSeconds);
        this._callbackFunction = callbackFunction;
    }

    /**
        Start the timer.
        @method start
        @return {void}
    */
    start() {
        this._callbackFunction(this._waitTimeInMilliseconds, true).then(isDone => {
            if (!isDone) {
                this.start();
            }
        });
    }

    /**
        Update the timer's wait time interval.
        @method updateWaitTimeInSeconds
        @param {Number} waitTimeInSeconds The interval time to wait.
        @return {void}
    */
    updateWaitTimeInSeconds(waitTimeInSeconds) {
        this._waitTimeInMilliseconds = Math.max(waitTimeInSeconds * 1000, 1); // eslint-disable-line no-magic-numbers
    }
}
