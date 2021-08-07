'use strict';

/**
    Used for testing zyWeb's string diff APIs.
    @module StringDiffTester
*/
class StringDiffTester {

    /**
        Load module to DOM.
        @method init
        @param {Number} id The DOM id of where to load the module.
        @param {Object} parentResource Collection of functions provided by the parent resource.
        @return {void}
    */
    init(id, parentResource) {

        <%= grunt.file.read(hbs_output) %>

        const string1 = 'Fi re';
        const string2 = 'Fierce';
        const diff = parentResource.stringDifference(string1, string2);
        const html = this.StringDiffTester.template({
            stringDiff1HTML: parentResource.makeStringDiffHTML(string1, diff.expectedAnswerIndicies),
            stringDiff2HTML: parentResource.makeStringDiffHTML(string2, diff.userAnswerIndicies),
        });

        $(`#${id}`).html(`<style><%= grunt.file.read(css_filename) %></style>${html}`);
    }
}

module.exports = {
    create: function() {
        return new StringDiffTester();
    },
};
