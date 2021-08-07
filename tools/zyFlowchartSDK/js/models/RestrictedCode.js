'use strict';

/* exported RestrictedCode */

/**
    A program's code that is broken into three parts: pre, placeholder, and post. The placeholder is editable. Pre and post are not editable.
    @class RestrictedCode
*/
class RestrictedCode {

    /**
        @constructor
        @param {String} pre The uneditable code before the placeholder.
        @param {String} placeholder The code the user can edit.
        @param {String} post The uneditable code after the placeholder.
    */
    constructor(pre, placeholder, post) {

        /**
            The uneditable code before the placeholder.
            @property pre
            @type {String}
        */
        this.pre = pre;

        /**
            The code the user can edit.
            @property placeholder
            @type {String}
        */
        this.placeholder = placeholder;

        /**
            The uneditable code after the placeholder.
            @property post
            @type {String}
        */
        this.post = post;
    }
}
