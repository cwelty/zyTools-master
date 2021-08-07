'use strict';

/**
    Controller for a part of the inspector.
    @class AbstractInspectorController
    @constructor
    @param {Object} $inspector Reference to the inspector's DOM.
    @param {Element} element The element with a style that the spinner controls.
    @param {Object} options The options for the spinner.
    @param {String} options.label The label associated with the spinner.
    @param {String} options.style The style that the spinner controls.
    @param {Function} templates The handlebars template used to render the explanations.
    @param {Object} progressionChangingFunctions Functions to inform the progression builder of changes.
    @param {Object} parentResource Reference to the parent of this module containing a dictionary of useful functions.
    @param {Progression} progression The progression being inspected.
*/
function AbstractInspectorController($inspector, element, options, templates, progressionChangingFunctions, parentResource, progression) { // eslint-disable-line max-params
    if (arguments.length > 0) {
        this._$inspector = $inspector;
        this._element = element;
        this._options = options;
        this._templates = templates;
        this._progressionChangingFunctions = progressionChangingFunctions;
        this._parentResource = parentResource;
        this._progression = progression;
        this.render();
    }
}

/**
    Render the controller. Inheriting classes will override this.
    @method render
    @return {void}
*/
AbstractInspectorController.prototype.render = function() {}; // eslint-disable-line no-empty-function

/**
    Update the spinner's value if the spinner's style was updated.
    @method stylesUpdate
    @param {Array} styleNames List of styles that were updated.
    @return {void}
*/
AbstractInspectorController.prototype.stylesUpdate = function(styleNames) {}; // eslint-disable-line no-empty-function, no-unused-vars
