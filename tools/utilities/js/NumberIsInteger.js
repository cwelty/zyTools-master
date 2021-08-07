'use strict';

/* exported addPolyfillForNumberIsInteger */

/**
    Add a polyfill for Number.isInteger. From:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
    @method addPolyfillForNumberIsInteger
    @return {void}
*/
function addPolyfillForNumberIsInteger() {
    Number.isInteger = Number.isInteger || function(value) {
        return (typeof value === 'number') && isFinite(value) && (Math.floor(value) === value);
    };
}
