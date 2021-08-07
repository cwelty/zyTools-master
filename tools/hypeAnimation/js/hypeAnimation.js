'use strict';

/**
    Render a hype animation and associated captions.
    @module HypeAnimation
*/
class HypeAnimation {

    /**
        Define class properties.
        @constructor
    */
    constructor() {

        <%= grunt.file.read(hbs_output) %>
        this.toolName = '<%= grunt.option("tool") %>';
        this.templates = this[this.toolName];
        this.areCaptionsShown = false;
    }

    /**
        Render and initialize a hype animation.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.parentResource = parentResource;

        // Extract options.
        const animationName = options.name;
        const height = options.height;
        const width = options.width;
        const captions = (options && options.zyCaptions) ? options.zyCaptions : [];

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const $tool = $(`#${id}`);

        if (parentResource.needsAccessible && parentResource.needsAccessible()) {
            const captionsHTML = this.templates.captions({ captions });

            $tool.html(css + captionsHTML);
        }
        else {

            // Calculate the file path of the generated Hype JS file.
            const animationID = animationName.replace(/\_/g, '').toLowerCase();
            let animationFile = `hype_animations/${animationName}.hyperesources/${animationID}_hype_generated_script.js`;
            const getResource = parentResource.getStaticResource || parentResource.getDependencyURL;

            animationFile = getResource.call(parentResource, animationFile); // eslint-disable-line prefer-reflect

            const captionsAreaHTML = this.templates.captionsArea({ captions });

            // Fill in the HTML and CSS of this animation.
            const html = this.templates.hypeAnimation({ height, width, animationID, animationFile, captionsAreaHTML });

            $tool.html(css + html);

            this._updateViewCaptionsButton();

            let hasShownCaptionsBefore = false;

            $(`#${id} .view-captions, #${id} .view-captions-arrow`).click(() => {
                this.areCaptionsShown = !this.areCaptionsShown;

                // Render captions the first time shown.
                if (this.areCaptionsShown && !hasShownCaptionsBefore) {
                    hasShownCaptionsBefore = true;

                    const captionsHTML = this.templates.captions({ captions });
                    const $captions = $(`#${this.id} .captions-container`);

                    $captions.html(captionsHTML);
                    parentResource.latexChanged();
                }

                this._updateViewCaptionsButton();
            });

            // Record clicks on the animation as events.
            $tool.click(() => {

                // Fixes Chrome's rendering bug with some animations that have code highlighting
                setTimeout(() => {
                    $tool.toggle().toggle();
                }, 1500); // eslint-disable-line no-magic-numbers

                parentResource.postEvent({
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'Animation clicked',
                    },
                });
            });
        }
    }

    /**
        Update the view captions button and associated image.
        @method _updateViewCaptionsButton
        @private
        @return {void}
    */
    _updateViewCaptionsButton() {
        const buttonText = this.areCaptionsShown ? 'Hide animation caption(s)' : 'View animation caption(s)';
        const imageName = this.areCaptionsShown ? 'arrow-up-blue.png' : 'arrow-down-blue.png';
        const imageSource = this.parentResource.getResourceURL(imageName, this.toolName);
        const $captions = $(`#${this.id} .captions-container`);

        if (this.areCaptionsShown) {
            $captions.show();
        }
        else {
            $captions.hide();
        }

        $(`#${this.id} .view-captions`).text(buttonText);
        $(`#${this.id} .view-captions-arrow`).attr('src', imageSource);
    }
}

const hypeAnimationExport = {
    create: function() {
        return new HypeAnimation();
    },
    supportsAccessible: true,
};

module.exports = hypeAnimationExport;
