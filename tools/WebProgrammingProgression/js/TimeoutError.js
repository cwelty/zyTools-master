/* exported TimeoutError */
/* global AbstractError */
'use strict';

/**
    An error caused by a timeout, such as an infinite loop.
    @class TimeoutError
    @extends AbstractError
*/
class TimeoutError extends AbstractError {

    /**
        @constructor
        @param {String} message The error message.
    */
    constructor(message) {
        super(message, 'timeout');
    }
}
