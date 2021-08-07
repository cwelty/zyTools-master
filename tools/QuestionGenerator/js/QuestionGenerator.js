'use strict';

/**
    Question generator for authoring.
    @module QuestionGenerator
*/
class QuestionGenerator {

    /**
        Initialize the tool.
        @method init
        @param {String} id The DOM id for this module.
        @return {void}
    */
    init(id) {

        <%= grunt.file.read(hbs_output) %>

        const html = this.QuestionGenerator.QuestionGenerator(); // eslint-disable-line new-cap
        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        $(`#${id}`).html(css + html);
    }
}

module.exports = {
    create: function() {
        return new QuestionGenerator();
    },
};
