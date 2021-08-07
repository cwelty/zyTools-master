/* global QuestionFactory, buildQuestionPrototype, buildQuestionFactoryPrototype */
'use strict';

/**
    Progression that generates general questions about polynomials.
    @module PolynomialsAddingSubtracting
    @return {void}
*/
function PolynomialsAddingSubtracting() {

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    this.init = function(id, parentResource) {
        require('singleInputQuestionProgressionTool').create().init(
            id,
            parentResource,
            {
                css: '<style><%= grunt.file.read(css_filename) %></style>',
                displayTemplate: this['<%= grunt.option("tool") %>'].PolynomialsAddingSubtracting,
                questionFactory: new QuestionFactory(),
                latexChanged: true,
            }
        );
    };

    <%= grunt.file.read(hbs_output) %>
}

/**
    Build the prototypes for used objects.
    @method buildPrototypes
    @return {void}
*/
function buildPrototypes() {
    buildQuestionPrototype();
    buildQuestionFactoryPrototype();
}

const PolynomialsAddingSubtractingExport = {
    create: function() {
        buildPrototypes();
        return new PolynomialsAddingSubtracting();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        buildPrototypes();
        <%= grunt.file.read(tests) %>
    },
};

module.exports = PolynomialsAddingSubtractingExport;
