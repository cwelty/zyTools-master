'use strict';

/* eslint-disable */

/* exported addPolyfillForMathTrunc */

/**
    Add a polyfill for Math.trunc. From:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
    @method addPolyfillForMathTrunc
    @return {void}
*/
function addPolyfillForMathTrunc() {
    Math.trunc = Math.trunc || function(x) {
        if (isNaN(x)) {
            return NaN;
        }
        if (x > 0) {
            return Math.floor(x);
        }
        return Math.ceil(x);
    };
}
