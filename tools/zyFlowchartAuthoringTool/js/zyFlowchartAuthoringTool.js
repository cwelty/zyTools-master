'use strict';

/* global ace */

/**
    Provide the author a coding window and a button to render their code as a zyFlowchart program.
    @module zyFlowchartAuthoringTool
    @return {void}
*/
class zyFlowchartAuthoringTool {

    /**
        Initialize the zyFlowchart program.
        @method init
        @param {String} id The unique identifier given to this module.
        @return {void}
    */
    init(id) {
        <%= grunt.file.read(hbs_output) %>

        const templates = this['<%= grunt.option("tool") %>'];
        const html = templates.zyFlowchartAuthoringTool({ id });
        const zyFlowchartSDK = require('zyFlowchartSDK').create();
        const css = `<style><%= grunt.file.read(css_filename) %></style>${zyFlowchartSDK.css}`;
        const $tool = $(`#${id}`);

        $tool.addClass('zyFlowchartSDK');
        $tool.html(html + css);

        const editor = ace.edit(`editor-${id}`);

        require('utilities').aceBaseSettings(editor, 'zyFlowchart');

        $tool.find('button').click(() => {
            let executor = null;
            const $executorContainer = $tool.find('.executor-container');

            try {
                executor = zyFlowchartSDK.makeExecutor(editor.getValue());
            }
            catch (error) {
                $executorContainer.text(error);
                return;
            }

            const executorController = zyFlowchartSDK.makeExecutorController(executor, $executorContainer);

            executorController.render();
        });
    }
}

module.exports = {
    create: function() {
        return new zyFlowchartAuthoringTool(); // eslint-disable-line new-cap
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
