'use strict';

/* global renderSuiteOfVariablesForTesting, renderSuiteOfFlowchartsForTesting, ExecutorController, Executor, globalConstants */

/**
    Models and components used for flowcharts.
    @module zyFlowchartSDK
    @return {void}
*/
class zyFlowchartSDK {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        globalConstants.templates = this['<%= grunt.option("tool") %>'];

        /**
            The CSS styles of the SDK.
            @property style
            @type {String}
        */
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';
    }

    /**
        Render some flowcharts!
        @method init
        @param {String} id The unique identifier given to this module.
        @return {void}
    */
    init(id) {
        $(`#${id}`).html(this.css);

        renderSuiteOfVariablesForTesting(id);
        renderSuiteOfFlowchartsForTesting(id);
    }

    /**
        Make an {Executor} from the given code and input.
        @method makeExecutor
        @param {String} code The code to convert into a program.
        @param {String} [input=null] The initial input for the executor.
        @param {Boolean} [isExecutable=false] Whether the program should be executable.
        @param {Boolean} [compileOnInit=true] Whether the program should be compiled upon initialization.
        @return {Executor} The executor made from the given code and input.
    */
    makeExecutor(code, input = null, isExecutable = false, compileOnInit = true) {
        return new Executor(code, input, isExecutable, compileOnInit);
    }

    /**
        Make an executor controller for the given executor.
        @method makeExecutorController
        @param {Executor} executor The executor for which to make a controller.
        @param {Object} $container Reference to a jQuery object of the container for the controller.
        @return {ExecutorController} The controller made for the given executor.
    */
    makeExecutorController(executor, $container) {
        return new ExecutorController(executor, $container);
    }
}

module.exports = {
    create: function() {
        if (!this.zyFlowchartSDK) {
            this.zyFlowchartSDK = new zyFlowchartSDK(); // eslint-disable-line new-cap
        }
        return this.zyFlowchartSDK;
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {

        <%= grunt.file.read(tests) %>
    },
};
