'use strict';

/* global WebpageFile */

/**
    Functions and styles for tools that enable the user to write webpages.
    @module WebpageUtilities
*/
class WebpageUtilities {

    /**
        Store template and styles.
        @constructor
    */
    constructor() {
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';
    }

    /**
        Build a webpage from the given files.
        @method buildWebpageFromFiles
        @param {Array} files {Array} of {WebpageFile}. The files to build into a webpage.
        @return {String} The webpage.
    */
    buildWebpageFromFiles(files) {
        return files.map(file => {
            const filenameComment = `<!-- ${file.filename} -->\n`;

            switch (file.language) {

                // Add script tags for JavaScript.
                case 'javascript':
                case 'js':
                    return `${filenameComment}<script type='text/javascript'>${file.contents}</script>`;

                // Add style tags for CSS.
                case 'css':
                    return `${filenameComment}<style type='text/css'>${file.contents}</style>`;

                // Add no content for HTML.
                case 'html':
                    return `${filenameComment}${file.contents}`;

                default:
                    throw new Error(`Unexpected language: ${file.language}`);
            }
        }).join('\n\n');
    }

    /**
        Create a file with the given parameters.
        @method makeWebpageFile
        @param {String} language The programming language in this file.
        @param {String} filename The name of this file.
        @param {String} contents The contents of this file.
        @return {WebpageFile} The file with the given parameters.
    */
    makeWebpageFile(language, filename, contents) {
        return new WebpageFile(language, filename, contents);
    }

    /**
        Update the given iframe with the given content.
        @method updateIFrame
        @private
        @param {DOMElement} iframe The iFrame DOM element to update.
        @param {String} content The content to update with.
        @return {void}
    */
    updateIFrame(iframe, content) {
        const contentWindow = (iframe.contentWindow || iframe.contentDocument);
        const contentDocument = contentWindow.document ? contentWindow.document : contentWindow;

        contentDocument.open();
        contentDocument.write(content);
        contentDocument.close();
    }
}

module.exports = new WebpageUtilities();
