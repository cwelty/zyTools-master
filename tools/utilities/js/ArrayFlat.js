'use strict';

/* eslint-disable */

/* exported addPolyfillForArrayFlat */

/**
    Add a polyfill for Array.prototype.flat. From:
    https://github.com/jonathantneal/array-flat-polyfill/blob/master/src/polyfill-flat.js
    @method addPolyfillForArrayFlat
    @return {void}
*/
function addPolyfillForArrayFlat() {
    if (!Array.prototype.flat) {
        Object.defineProperty(Array.prototype, 'flat', {
            configurable: true,
            value: function flat () {
                var depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);

                return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
                    if (Array.isArray(cur)) {
                        acc.push.apply(acc, flat.call(cur, depth - 1));
                    } else {
                        acc.push(cur);
                    }

                    return acc;
                }, []) : Array.prototype.slice.call(this);
            },
            writable: true
        });
    }
}
