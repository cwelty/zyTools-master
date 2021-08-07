/* exported WebpageFile */
'use strict';

/**
    Store a webpage file's language, filename, and contents.
    @class WebpageFile
*/
class WebpageFile {

    /**
        @constructor
        @param {String} language The programming language in this file.
        @param {String} filename The name of this file.
        @param {String} contents The contents of this file.
    */
    constructor(language, filename, contents) {

        /**
            The programming language in this file.
            @property language
            @type {String}
        */
        this.language = language;

        /**
            The name of this file.
            @property filename
            @type {String}
        */
        this.filename = filename;

        /**
            The contents of this file.
            @property contents
            @type {String}
        */
        this.contents = contents;
    }
}
