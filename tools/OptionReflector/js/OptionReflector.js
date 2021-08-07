'use strict';

/* global Option */

/**
    Used for enabling authors to start writing options for tools that don't exist yet.
    @module OptionReflector
*/
class OptionReflector {

    /**
        Load module to DOM and add event listeners.
        @method init
        @param {Number} id The DOM id of where to load the module.
        @param {Object} parentResource Collection of functions provided by the parent resource.
        @param {Object} options The options to print.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        const optionsArray = Object.keys(options).map(key => new Option(key, options[key]));

        const html = this.OptionReflector.options({ optionsArray });

        $(`#${id}`).html(`<style><%= grunt.file.read(css_filename) %></style>${html}`);
    }
}

module.exports = {
    create: function() {
        return new OptionReflector();
    },
};
