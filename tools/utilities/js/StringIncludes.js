'use strict';

/* eslint-disable */

/* exported addPolyfillForStringIncludes */

/**
    Add a polyfill for String.prototype.incldues. From:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
    @method addPolyfillForStringIncludes
    @return {void}
*/
function addPolyfillForStringIncludes() {
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
}
