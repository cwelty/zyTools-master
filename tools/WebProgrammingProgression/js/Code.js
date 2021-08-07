/* global HandlebarsComplete */
/* exported Code */
'use strict';

/**
    Code inside a file that stores a template of the prefix, placeholder, and postfix.
    @class Code
*/
class Code {

    /**
        Initializes the object.
        @constructor
        @param {Object} codeJSON JSON representation of the code.
    */
    constructor(codeJSON) {
        const unescapeHTML = require('utilities').unescapeHTML;
        const prefix = unescapeHTML(codeJSON.prefix || '');
        const placeholder = unescapeHTML(codeJSON.placeholder || '');
        const postfix = unescapeHTML(codeJSON.postfix || '');

        /**
            A template for the code before the placeholder.
            @property prefix
            @type {Function}
        */
        this.prefix = HandlebarsComplete.compile(prefix);

        /**
            A template for the code editable by the student.
            @property placeholder
            @type {Function}
        */
        this.placeholder = HandlebarsComplete.compile(placeholder);

        /**
            A template for the code after the placeholder.
            @property postfix
            @type {Function}
        */
        this.postfix = HandlebarsComplete.compile(postfix);
    }
}
