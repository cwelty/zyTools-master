/* exported WebpageError */
/* global AbstractError */
'use strict';

/**
    An error on the webpage.
    @class WebpageError
    @extends AbstractError
*/
class WebpageError extends AbstractError {

    /**
        @constructor
        @param {String} message The error message.
    */
    constructor(message) {
        super(message, 'webpage');
    }
}
