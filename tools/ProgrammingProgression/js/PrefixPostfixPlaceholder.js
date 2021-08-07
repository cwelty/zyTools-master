/* exported PrefixPostfixPlaceholder */
'use strict';

/**
    A simple class to store the Prefix, Postfix and Placeholder of the code
    @class PrefixPostfixPlaceholder
*/
class PrefixPostfixPlaceholder {

    /**
        Initializes the object.
        @constructor
        @param {String} prefix The prefix of the code.
        @param {String} postfix The postfix of the code.
        @param {String} placeholder The placeholder of the code.
    */
    constructor(prefix, postfix, placeholder) {
        this.prefix = prefix;
        this.postfix = postfix;
        this.placeholder = placeholder;
    }
}
