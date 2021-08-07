'use strict';

/* exported buildElementImageControllerPrototype */
/* global ProgressionPlayerElementController */

/**
    Control an image element.
    @class ElementImageController
    @extends ProgressionPlayerElementController
*/
function ElementImageController(...args) {
    if (args.length !== 0) {
        ProgressionPlayerElementController.prototype.constructor.apply(this, args);
        this.render();
    }
}

/**
    Build the ElementImageController prototype.
    @method buildElementImageControllerPrototype
    @return {void}
*/
function buildElementImageControllerPrototype() {
    ElementImageController.prototype = new ProgressionPlayerElementController();
    ElementImageController.prototype.constructor = ElementImageController;

    /**
        Render the element and handle loading of image.
        @method render
        @return {void}
    */
    ElementImageController.prototype.render = function() {
        ProgressionPlayerElementController.prototype.render.apply(this);

        require('ProgressionUtilities').create().downloadImage(
            this._parentResource,
            this._elementRendered.imageID,
            this._$element.find('img'),
            'Image did not load. Try refreshing.'
        );
    };
}
