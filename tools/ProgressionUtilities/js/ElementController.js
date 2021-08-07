'use strict';

/* exported ElementController */
/* global escapeStyleValues */

/**
    Control an element displayed to the user, including rendering, updating, and destroying.
    This controller is an abstract class.
    @class ElementController
*/
class ElementController {

    /**
        @constructor
        @param {Element} elementRendered The element being rendered.
        @param {jQuery} $questionArea Reference to the question area DOM.
        @param {Object} templates Dictionary of templates for rendering elements.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {progressionTool} progressionTool Reference to the {progressionTool} instance used for the progression.
    */
    constructor(elementRendered, $questionArea, templates, parentResource, progressionTool) {

        // During inheriting, do not set properties.
        if (arguments.length !== 0) { // eslint-disable-line prefer-rest-params
            this._elementRendered = elementRendered;
            this._$questionArea = $questionArea;
            this._templates = templates;
            this._parentResource = parentResource;
            this._progressionTool = progressionTool;
            this._$element = null;
        }
    }

    /**
        Render the element.
        @method render
        @return {void}
    */
    render() {
        this._elementRendered.style = escapeStyleValues(this._elementRendered.style);

        // Add support for rotations on IE9 and Safari.
        if ('transform' in this._elementRendered.style) {
            this._elementRendered.style['-ms-transform'] = this._elementRendered.style.transform;
            this._elementRendered.style['-webkit-transform'] = this._elementRendered.style.transform;
        }

        const elementStyleHTML = this._templates.ElementStyle({ // eslint-disable-line new-cap
            style: this._elementRendered.style,
        });
        const className = require('ProgressionUtilities').create().getElementClassNameByType(this._elementRendered.type);
        const elementToRender = this._makeElementToRender();

        elementToRender.prepareForRendering();

        const elementHTML = this._templates[className]({
            element: elementToRender,
            style: elementStyleHTML,
        });

        this._$questionArea.append(elementHTML);
        this._$element = this._$questionArea.children().last();
    }

    /**
        Destroy the controller by removing associated event listeners and DOM elements.
        @method destroy
        @return {void}
    */
    destroy() {
        if (this._$element) {
            this._$element.remove();
        }
    }

    /**
        Return the element to render. This function enables pre-rendering processing.
        @method _makeElementToRender
        @private
        @return {Element} The element to render.
    */
    _makeElementToRender() {
        return this._elementRendered;
    }
}
