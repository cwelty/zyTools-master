'use strict';

/**
    Control the {Progression} object being built. This is an abstract controller.
    @class ProgressionController
    @constructor
    @param {ZyTool} zyTool The progression being built.
    @param {Object} $dom The jQuery DOM for where to put this controller.
    @param {Function} templates The handlebars template used to render this controller.
    @param {Object} progressionChangingFunctions Functions to inform the progression builder of changes.
    @param {Object} parentResource Reference to the parent of this module.
*/
function ProgressionController(zyTool, $dom, templates, progressionChangingFunctions, parentResource) {
    if (arguments.length) { // eslint-disable-line prefer-rest-params
        this._zyTool = zyTool;
        this._progression = zyTool.progression;
        this._$dom = $dom;
        this._templates = templates;
        this._progressionChangingFunctions = progressionChangingFunctions;
        this._parentResource = parentResource;
        this.render();
    }
}

/**
    Update the |_progression| object.
    @method updateProgression
    @param {Progression} progression The updated progression object.
    @return {void}
*/
ProgressionController.prototype.updateProgression = function(progression) {
    this._progression = progression;
    this.render();
};

/**
    Render |_progression|. Inheriting controllers will overwrite this.
    @method render
    @return {void}
*/
ProgressionController.prototype.render = function() {}; // eslint-disable-line no-empty-function

/**
    Update the controller due to an element being selected. Some controllers will overwrite this.
    @method updateElementSelected
    @return {void}
*/
ProgressionController.prototype.updateElementSelected = function() {}; // eslint-disable-line no-empty-function

/**
    Update the controller due to a question being selected. Some controllers will overwrite this.
    @method updateQuestionSelected
    @return {void}
*/
ProgressionController.prototype.updateQuestionSelected = function() {}; // eslint-disable-line no-empty-function

/**
    Notification that an element was added. Some controllers will overwrite this.
    @method elementAdded
    @return {void}
*/
ProgressionController.prototype.elementAdded = function() {}; // eslint-disable-line no-empty-function

/**
    Notification that {Elements} was updated in |_progression|. Some controllers will overwrite this.
    @method updatedElements
    @return {void}
*/
ProgressionController.prototype.updatedElements = function() {}; // eslint-disable-line no-empty-function

/**
    Notification that an {Element} was updated.
    @method updatedElement
    @return {void}
*/
ProgressionController.prototype.updatedElement = function() {}; // eslint-disable-line no-empty-function

/**
    Notification that an {Element}'s style was updated and which styles were updated.
    Some controllers will overwrite this.
    @method elementStyleUpdate
    @param {Element} element The element that had a style update.
    @param {Array} stylesUpdated List of names of styles that were updated.
    @return {void}
*/
ProgressionController.prototype.elementStyleUpdate = function(element, stylesUpdated) {}; // eslint-disable-line no-empty-function, no-unused-vars

/**
    Notification that a {Level} was updated. Some controllers will overwrite this.
    @method levelUpdated
    @param {Level} level The level that was updated.
    @return {void}
*/
ProgressionController.prototype.levelUpdated = function(level) {}; // eslint-disable-line no-empty-function, no-unused-vars

/**
    Notification that the {ZyTool} was updated.
    @method updateZyTool
    @param {ZyTool} zyTool The updated ZyTool.
    @return {void}
*/
ProgressionController.prototype.updateZyTool = function(zyTool) {
    this._zyTool = zyTool;
    this.updateProgression(this._zyTool.progression);
};
