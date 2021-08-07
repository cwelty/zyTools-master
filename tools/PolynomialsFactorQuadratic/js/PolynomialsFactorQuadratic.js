/* global QuestionFactory, buildQuestionPrototype, buildQuestionFactoryPrototype */
'use strict';

/**
    Progression that generates general questions about factoring quadratic trinomials.
    @module PolynomialsFactorQuadratic
    @return {void}
*/
function PolynomialsFactorQuadratic() {

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
                displayTemplate: this['<%= grunt.option("tool") %>'].PolynomialsFactorQuadratic,
                questionFactory: new QuestionFactory(id),
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

const PolynomialsFactorQuadraticExport = {
    create: function() {
        buildPrototypes();
        return new PolynomialsFactorQuadratic();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        buildPrototypes();
        <%= grunt.file.read(tests) %>
    },
};

module.exports = PolynomialsFactorQuadraticExport;
