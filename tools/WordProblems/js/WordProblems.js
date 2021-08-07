/**
    Progression that generates and display word problems.
    @module WordProblems
*/
function WordProblems() {
    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options Options for a module instance.
        @param {String} options.type The type of word problems to generate.
        @return {void}
    */
    this.init = function(id, parentResource, options) {
        var moduleName = '<%= grunt.option("tool") %>';

        var questionFactory;
        switch (options.type) {
            case 'conversion':
                questionFactory = new ConversionQuestionFactory();
                break;
            case 'motion':
                questionFactory = new MotionQuestionFactory(
                    function(imageName) {
                        return parentResource.getResourceURL(imageName, moduleName);
                    },
                    this[moduleName].image
                );
                break;
            default:
                $('#' + id).text('Invalid type specified. Valid options are: conversion and motion.');
                return;
        }

        require('singleInputQuestionProgressionTool').create().init(
            id,
            parentResource,
            {
                css:             '<style><%= grunt.file.read(css_filename) %></style>',
                displayTemplate: this[moduleName].WordProblems,
                questionFactory: questionFactory,
                latexChanged:    true
            }
        );
    };

    <%= grunt.file.read(hbs_output) %>
}

/**
    Build prototypes for classes defined in this module.
    @method buildPrototypes
*/
function buildPrototypes() {
    buildQuestionPrototype();
    buildConversionQuestionFactoryPrototype();
    buildMotionQuestionFactoryPrototype();
}

var WordProblemsExport = {
    create: function() {
        buildPrototypes();
        return new WordProblems();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests:     function() {
        buildPrototypes();
        <%= grunt.file.read(tests) %>
    }
};
module.exports = WordProblemsExport;
