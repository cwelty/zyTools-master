/* exported CodeFile */
'use strict';

class CodeFile {

    /**
        @constructor
        @param {String} filename The name of the file.
        @param {Boolean} [isMain=false] Whether this file is the main file.
        @param {String} [content=''] The contents of the file.
        @param {Boolean} [isSelected=false] Whether the file is currently selected.
    */
    constructor(filename, isMain = false, content = '', isSelected = false) {

        /**
            The file's name.
            @property filename
            @type {String}
        */
        this.filename = filename;

        /**
            Whether this file is the main file for the program.
            @property isMain
            @type {Boolean}
        */
        this.isMain = isMain;

        /**
            The content of the file.
            @property content
            @type {String}
        */
        this.content = content;

        /**
            Whether this file is currently selected for edition.
            @property isSelected
            @type {Boolean}
        */
        this.isSelected = isSelected;
    }

    /**
        A getter for the |content| property.
        @method getContent
        @param {Boolean} [escapeHTML=false] Whether to escape HTML characters.
        @return {String}
    */
    getContent(escapeHTML = false) {
        return escapeHTML ? require('utilities').escapeHTML(this.content) : this.content;
    }

    /**
        Returns a string defining the file in XML.
        @method toXML
        @return {String}
    */
    toXML() {
        const fileIndentationLevel = 2;
        const contentIndentationLevel = 3;
        const fileIndentation = '    '.repeat(fileIndentationLevel);
        const contentIndentation = '    '.repeat(contentIndentationLevel);
        const filename = `${contentIndentation}<filename>${this.filename}</filename>`;
        const main = `${contentIndentation}<main type='boolean'>${this.isMain}</main>`;
        const escapedContent = this.getContent() === this.getContent(true) ? '' : ' unescape-html=\'true\'';
        const content = `${contentIndentation}<program${escapedContent}>${this.getContent(true)}</program>`;

        return `${fileIndentation}<file type='dict'>\n${filename}\n${main}\n${content}\n${fileIndentation}</file>`;
    }

    /**
        Updates the object from the received JSON.
        @method fromJSON
        @param {JSON} json The json object.
        @return {void}
    */
    fromJSON(json) {
        this.filename = json.filename;
        this.isMain = json.main;
        this.content = json.program;
    }

    /**
        Returns this file in JSON format.
        @method toJSON
        @return {JSON} The file in JSON.
    */
    toJSON() {
        return {
            filename: this.filename,
            main: this.isMain,
            program: this.content,
        };
    }
}
