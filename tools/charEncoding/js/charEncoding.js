'use strict';

/* global charToAscii */

/**
    Enables user to encode a character and displays it's ascii.
    @module CharEncoding
*/
class CharEncoding {

    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        let isPython = false;

        if (options && options.lang && (options.lang === 'python')) {
            isPython = true;
        }

        let showBitCode = false;

        if (options && options.showBitCode) {
            showBitCode = true;
        }

        const html = this.charEncoding.template({ id, isPython, showBitCode });

        $(`#${id}`).html(`<style><%= grunt.file.read(css_filename) %></style>${html}`);

        let beenSubmitted = false;

        $(`#charInput${id}`).keyup(event => {
            charToAscii($(event.currentTarget), id, showBitCode, isPython);

            if (!beenSubmitted) {
                parentResource.postEvent({
                    part: 0,
                    complete: true,
                    answer: 'char encode tool',
                    metadata: {
                        event: 'char encode tool used',
                    },
                });
            }

            beenSubmitted = true;
        });
    }
}

const charEncodingExport = {
    create: function() {
        return new CharEncoding();
    },
};

module.exports = charEncodingExport;
