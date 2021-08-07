/* exported SummaryController */
/* global AbstractController */
'use strict';

/**
    Control the summary under the plot.
    @module SummaryController
    @extends AbstractController
*/
class SummaryController extends AbstractController {

    /**
        @constructor
        @param {String} id The id of the DOM element in which to create the controller.
        @param {Object} templates Dictionary of templates for this module.
        @param {String} example The example study.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
    */
    constructor(id, templates, example, parentResource) {
        super(id, templates);

        /**
            The example study.
            @property example
            @type {String}
        */
        this.example = example;

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
        */
        this.parentResource = parentResource;

        /**
            The timeout id for when to re-render the LaTex.
            @property timeout
            @type {Integer}
            @default null
        */
        this.timeout = null;
    }

    /**
        Render the inputs.
        @method render
        @param {String} header The header of the summary.
        @param {String} content The content of the summary.
        @param {Boolean} [hasLatex=false] Whether summary has LaTex.
        @return {void}
    */
    render({ header, content, hasLatex = false }) {
        const $summary = this.getElement();

        $summary.html(this.templates.summary());
        $summary.find('h3').text(header);
        $summary.find('div').html(content);

        if (hasLatex) {

            // Reduce frequency of re-rendering the LaTex to at most 500ms.
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            const msToWait = 500;

            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.parentResource.latexChanged();
            }, msToWait);
        }
    }
}
