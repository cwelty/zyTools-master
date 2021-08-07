'use strict';

/* global File */

/**
    Code editor and development tool.
    @module ZyDE
    @return {void}
*/
class ZyDE {

    /**
        Render and initialize a {zyde} instance.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        this.utilities = require('utilities');

        if (options) {
            if (options.multifiles.length === 0) {
                options.multifiles.push({
                    program: '',
                    main: null,
                    filename: '',
                });
            }

            this.language = options.language;
            this.inputEnabled = options.input_enabled;
            this.useHomePageStyling = Boolean(options.useHomePageStyling);
        }

        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        if (parentResource.needsAccessible && parentResource.needsAccessible()) {
            const initialFiles = options.multifiles.map(file => new File(file.filename, file.program, file.main));
            const hasMultipleFiles = initialFiles.length > 1;
            const html = this['<%= grunt.option("tool") %>'].zydeAccessible({ initialFiles, hasMultipleFiles });

            $(`#${id}`).html(css + html);
        }
        else {
            const html = this['<%= grunt.option("tool") %>'].zyde({ id });

            $(`#${id}`).html(css + html);

            let eventPosted = false;

            // Initialize a zyDE base tool.
            const zydeBase = require('zydeBase').create();

            zydeBase.init(`zyde-base-container${id}`, options, (fileContents, mainFilename, input, reenableCallback) => {

                // Post an event.
                if (!eventPosted) {
                    const event = {
                        part: 0,
                        complete: true,
                        answer: fileContents[0].program,
                        metadata: {
                            event: 'zyDE run',
                            language: this.language,
                        },
                    };

                    parentResource.postEvent(event);
                    eventPosted = true;
                }

                // Clear the output.
                zydeBase.setOutput('');

                // Notify user of compilation (if the language isn't Python).
                if (!this.inputEnabled) {
                    zydeBase.appendToOutput('\n');
                }
                if ([ 'python', 'python3' ].indexOf(this.language) === -1) {
                    zydeBase.appendToOutput('\nCompiling...');
                }

                // Compile the code.
                let url = 'compile_code';
                let params = {
                    code: fileContents[0].program,
                    language: this.language,
                    input,
                    files: (fileContents.length > 1 ? JSON.stringify(fileContents) : []),
                };

                this.utilities.zyDEServer('POST', url, params,
                    postData => {

                        // Notify user of compilation termination (if the language isn't Python).
                        if ([ 'python', 'python3' ].indexOf(this.language) === -1) {
                            zydeBase.appendToOutput('done.');
                        }
                        zydeBase.appendToOutput('\n');

                        // If there was a compilation error, output it.
                        if (typeof postData.result !== 'undefined') {

                            // Clear output first.
                            zydeBase.setOutput('');

                            if (!this.inputEnabled) {
                                zydeBase.appendToOutput('\n');
                            }

                            const resultMessage = this.utilities.escapeHTML(postData.result.toString());

                            zydeBase.appendToOutput(`\n${resultMessage}`);
                        }

                        if (typeof postData.error !== 'undefined') {
                            const errorMessage = this.utilities.escapeHTML(postData.error.toString());

                            zydeBase.appendToOutput(`<span class='error'>${errorMessage}</span>`);
                        }

                        // If compilation was successful, move on to running the code.
                        if (typeof postData.success === 'undefined') {
                            reenableCallback();
                        }
                        else {

                            // Notify the user that code is running.
                            zydeBase.appendToOutput('Running...');

                            url = 'run_code';
                            params = {
                                session_id: postData.session_id, // eslint-disable-line camelcase
                                language: this.language,
                                filename: (mainFilename ? mainFilename : postData.filename),
                            };

                            this.utilities.zyDEServer('GET', url, params,
                                getData => {

                                    // Notify user that running is done.
                                    zydeBase.appendToOutput('done.\n');

                                    // Check for errors.
                                    if (typeof getData.result !== 'undefined') {
                                        zydeBase.appendToOutput(this.utilities.escapeHTML(getData.result.toString()));
                                    }
                                    if (typeof getData.error !== 'undefined') {
                                        const errorMessage = this.utilities.escapeHTML(getData.error.toString());

                                        zydeBase.appendToOutput(`\n<span class='error'>${errorMessage}</span>`);
                                    }

                                    reenableCallback();
                                },
                                () => {
                                    zydeBase.setOutput('\n\nCannot reach server. \nPlease try again in a few minutes.');
                                    reenableCallback();
                                },
                                null,
                                null,
                                this.useHomePageStyling
                            );
                        }
                    },
                    () => {
                        zydeBase.setOutput('\n\nCannot reach server. \nPlease try again in a few minutes.');
                        reenableCallback();
                    },
                    null,
                    null,
                    this.useHomePageStyling
                );
            });
        }
    }
}

module.exports = {
    create: function() {
        return new ZyDE();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    supportsAccessible: true,
};
