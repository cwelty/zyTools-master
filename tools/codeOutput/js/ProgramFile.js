/* exported ProgramFile */
'use strict';

/**
    A file for the codeOutput program.
    @class ProgramFile
*/
class ProgramFile {

    /**
        Initialize a codeOutput program file.
        @constructor
        @param {String} filename The name of the file.
        @param {Boolean} main Whether this file is the program's main file.
        @param {String} program The code of the file.
    */
    constructor(filename, main, program) {
        this.filename = filename;
        this.main = Boolean(main);
        this.program = program;
        this.programToShow = null;
    }
}
