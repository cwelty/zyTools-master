'use strict';

/* exported ApplyFilters */
/* global Caman */

/**
    Apply a given set of filters to a given image.
    @module ApplyFilters
*/
class ApplyFilters {

    /**
        @constructor
        @param {String} imageId The id of the image on which to apply filters.
    */
    constructor(imageId) {

        /**
            A reference to the Caman image filter.
            @property caman
            @type {Caman}
        */
        this.caman = Caman(imageId); // eslint-disable-line new-cap

        /**
            The filters to apply.
            @property filtersToApplyNext
            @type {Array} of {Object}
            @default null
        */
        this.filtersToApplyNext = null;

        /**
            Whether rendering is happening.
            @property isRendering
            @type {Boolean}
            @default false
        */
        this.isRendering = false;
    }

    /**
        Apply the given filters.
        @method apply
        @param {Array} filters Array of {Object}. The filters to apply.
        @return {void}
    */
    apply(filters) {

        // Make a copy of each filter's name and value.
        this.filtersToApplyNext = filters.map(filter => { // eslint-disable-line arrow-body-style
            return {
                name: filter.name, value: filter.value,
            };
        });

        // Start rendering if not already rendering.
        if (!this.isRendering) {
            this.isRendering = true;
            this.render();
        }
    }

    render() {

        // Store a local reference of the filters to apply, then clear |this.filtersToApplyNext|.
        const filters = this.filtersToApplyNext;

        this.filtersToApplyNext = null;

        // Revert the canvas' pixels without rendering.
        this.caman.revert(false);

        // Apply each filter.
        filters.forEach(filter => {
            switch (filter.name) {
                case 'Brightness':
                    this.caman.brightness(filter.value);
                    break;
                case 'Saturation':
                    this.caman.saturation(filter.value);
                    break;
                case 'Sharpen':
                    this.caman.sharpen(filter.value);
                    break;
                default:
                    break;
            }
        });

        // Render the new filter values.
        this.caman.render(() => {

            // When rendering done, if newer filters have been set, then render the newer filters.
            if (this.filtersToApplyNext) {
                this.render();
            }

            // Otherwise, rendering is done.
            else {
                this.isRendering = false;
            }
        });
    }
}
