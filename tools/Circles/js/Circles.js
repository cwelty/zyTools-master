/* global QuestionFactory, buildQuestionPrototype, buildQuestionFactoryPrototype */
'use strict';

/**
    Progression that generates questions about features of circles and other related questions.
    @module Circles
    @return {void}
*/
function Circles() {

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
                displayTemplate: this['<%= grunt.option("tool") %>'].Circles,
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

const CirclesExport = {
    create: function() {
        buildPrototypes();
        return new Circles();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        buildPrototypes();
        <%= grunt.file.read(tests) %>
    },
};

module.exports = CirclesExport;
