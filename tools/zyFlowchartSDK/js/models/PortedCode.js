'use strict';

/* exported PortedCode */

/**
    Model a program, which stores a list of functions.
    @class PortedCode
*/
class PortedCode {

    /**
        @constructor
    */
    constructor() {

        /**
            The ported code.
            @property code
            @type {String}
            @default ''
        */
        this.code = '';
    }

    /**
        Add the given code to the ported code.
        @method add
        @param {String} code The code to add.
        @return {void}
    */
    add(code) {
        this.code += code;
    }

    /**
        Append the given code to the given line number.
        @method addToline
        @param {String} code The code to add to the line.
        @param {Integer} lineNumber The line number on which to add the code.
        @return {void}
    */
    addToLine(code, lineNumber) {
        const lines = this.code.split('\n');

        lines[lineNumber - 1] += code;

        this.code = lines.join('\n');
    }

    /**
        Return the number of lines in the code.
        @method numberOfLines
        @return {Integer} The number of lines in the code.
    */
    numberOfLines() {
        return this.code.split('\n').length;
    }

    /**
        Return the number of characters for the given line number.
        @method lengthOfLineNumber
        @param {Integer} lineNumber The line number to grab from.
        @return {Integer} The number of characters in the given line number.
    */
    lengthOfLineNumber(lineNumber) {
        const lines = this.code.split('\n');
        const line = lines[lineNumber - 1];

        return line.length;
    }

    /**
        Return the number of characters in the last line.
        @method lengthOfLastLine
        @return {Integer} The number of characters in the last line.
    */
    lengthOfLastLine() {
        return this.lengthOfLineNumber(this.numberOfLines());
    }
}
