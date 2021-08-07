'use strict';

/* exported File */

/**
    Code editor and development tool.
    @class File
*/
class File {

    /**
        @constructor
        @param {String} filename The name of the file.
        @param {String} code The code in the file.
        @param {Boolean} main Whether the file is the main file.
    */
    constructor(filename, code, main) {
        this.filename = filename;
        this.code = code;
        this.main = main;
    }
}
