'use strict';

/**
    Store a filename, language, user contents, and expected contents.
    @class File
    @constructor
    @param {Object} fileJSON Define the properties of a file.
    @param {String} fileJSON.expectedContent The expected contents of the file after the user has edited.
    @param {String} fileJSON.filename The name of the file.
    @param {String} fileJSON.language The language of the code in the file.
    @param {String} fileJSON.initialContent The initial contents of the file shown to the user.
    @param {Boolean} fileJSON.isHidden Whether to show the user the content.
*/
function File(fileJSON) {
    this.expectedContent = fileJSON.expectedContent || '';
    this.filename = fileJSON.filename;
    this.language = fileJSON.language.toLowerCase();
    this.initialContent = fileJSON.initialContent || '';
    this.isHidden = fileJSON.isHidden || false;

    const unescapeHTML = require('utilities').unescapeHTML;

    this.expectedContent = unescapeHTML(this.expectedContent);
    this.initialContent = unescapeHTML(this.initialContent);

    this.reset();
}

/**
    Set |userContent| to |initialContent|.
    @method reset
    @return {void}
*/
File.prototype.reset = function() {
    this.userContent = this.initialContent;
};
