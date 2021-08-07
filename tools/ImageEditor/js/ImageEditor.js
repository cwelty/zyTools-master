'use strict';

/* global ApplyFilters */

/**
    Models and components used for image editor.
    @module ImageEditor
*/
class ImageEditor {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The filters to apply to the image.
            @property filters
            @type {Array} of {Object}
        */
        this.filters = [
            { name: 'Brightness', min: -100, max: 100, value: 0 },
            { name: 'Saturation', min: -100, max: 100, value: 0 },
            { name: 'Sharpen', min: 0, max: 100, value: 0 },
        ];

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            Whether it is ok to submit activity data. Used to rate limit submissions.
            @property okToSubmitActivity
            @type {Boolean}
            @default true
        */
        this.okToSubmitActivity = true;
    }

    /**
        Initialize the ImageEditor program.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.parentResource = parentResource;

        const $tool = $(`#${id}`);
        const toolName = '<%= grunt.option("tool") %>';
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const imageId = `#image-${id}`;

        $tool.html(this[toolName].template({ filters: this.filters, id }) + css);
        $(imageId).attr('src', parentResource.getResourceURL('dog.jpg', toolName));

        // Initialize the filters.
        const applyFilters = new ApplyFilters(imageId);

        this.filters.forEach((filter, index) => {
            const $scrollbar = $tool.find('.scrollbar').eq(index);
            const $value = $tool.find('.value').eq(index);

            $scrollbar.on('input', () => {
                filter.value = $scrollbar.val();
                $value.text(filter.value);
                applyFilters.apply(this.filters);
                this.submitActivity();
            });
        });
    }

    /**
        Submit the current filters as activity data.
        @method submitActivity
        @return {void}
    */
    submitActivity() {
        if (this.okToSubmitActivity) {
            this.okToSubmitActivity = false;

            setTimeout(() => {
                this.okToSubmitActivity = true;
            }, 5000); // eslint-disable-line no-magic-numbers

            this.parentResource.postEvent({
                part: 0,
                complete: true,
                answer: this.filters.map(filter => `${filter.name}:${filter.value}`).join(','),
            });
        }
    }
}

module.exports = {
    create: function() {
        return new ImageEditor();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
