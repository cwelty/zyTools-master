'use strict';

/* global ProgressionController,
          fontSizeSpinnerOptions,
          borderRadiusSpinnerOptions,
          opacitySpinnerOptions,
          paddingSpinnerOptions,
          rotationSpinnerOptions,
          fontColorPickerOptions,
          borderColorPickerOptions,
          leftSpinnerOptions,
          topSpinnerOptions,
          heightSpinnerOptions,
          imageSizeOptions,
          widthSpinnerOptions,
          assessmentMethodOptions,
          duplicateButton,
          duplicateSelectedButton,
          deleteButton,
          deleteSelectedButton,
          optionOrderingMethodOptions,
          questionAreaHeightSpinnerOptions,
          questionAreaWidthSpinnerOptions */

/**
    Control the inspector.
    @class InspectorController
    @extends ProgressionController
    @constructor
*/
function InspectorController(...args) {
    this._element = null;
    this._controllers = [];
    ProgressionController.prototype.constructor.apply(this, args);
}

InspectorController.prototype = new ProgressionController();
InspectorController.prototype.contructor = InspectorController;

/**
    Render the inspector, then add listeners.
    @method render
    @return {void}
*/
InspectorController.prototype.render = function() {

    // Get the selected object(s).
    this._element = this._progression.getSelectedElements()[0];
    this._hasMultipleSelected = this._progression.getSelectedElements().length > 1;

    const inspectorHTML = this._templates.Inspector({ // eslint-disable-line new-cap
        hasMultipleSelected: this._hasMultipleSelected,
    });

    this._$dom.empty().html(inspectorHTML);

    // Build the inspector's controllers based on the selected element's type.
    const $inspector = this._$dom.find('.inspector');

    this._controllers = this._makeControllersToBuild().map(controllerOptions => {
        const className = `${controllerOptions.type}Controller`;

        // Convert |className| to the class constructor of the same name.
        const ControllerClass = eval(className); // eslint-disable-line no-eval

        return new ControllerClass(
            $inspector, this._element, controllerOptions, this._templates,
            this._progressionChangingFunctions, this._parentResource, this._progression
        );
    });
};

/**
    Return the controllers to build to manipulate |_element|.
    @method _makeControllersToBuild
    @private
    @return {Array} Controllers to build to manipulate |_element|.
*/
InspectorController.prototype._makeControllersToBuild = function() { // eslint-disable-line no-underscore-dangle
    const controllersToBuild = [];
    const inspectorLevels = {
        type: 'InspectorLevels',
        levels: this._progression.levels,
        allSelectedElements: this._progression.getSelectedElements(),
    };

    if (this._hasMultipleSelected) {
        controllersToBuild.push(
            duplicateSelectedButton,
            deleteSelectedButton,
            inspectorLevels
        );
    }
    else if (this._element) {
        controllersToBuild.push(
            leftSpinnerOptions,
            topSpinnerOptions,
            inspectorLevels
        );

        switch (this._element.type) {
            case 'text':
                controllersToBuild.push(
                    fontSizeSpinnerOptions,
                    borderRadiusSpinnerOptions,
                    opacitySpinnerOptions,
                    paddingSpinnerOptions,
                    rotationSpinnerOptions,
                    fontColorPickerOptions,
                    borderColorPickerOptions
                );
                break;
            case 'image':
                controllersToBuild.push(
                    imageSizeOptions,
                    opacitySpinnerOptions
                );
                break;
            case 'dropdown':
                controllersToBuild.push(optionOrderingMethodOptions);
                break;
            case 'shortanswer':
                controllersToBuild.push(
                    fontSizeSpinnerOptions,
                    widthSpinnerOptions,
                    assessmentMethodOptions
                );
                break;
            case 'table':
                controllersToBuild.push(
                    heightSpinnerOptions,
                    widthSpinnerOptions,
                    fontSizeSpinnerOptions,
                    opacitySpinnerOptions
                );
                break;
            case 'checkbox':
                controllersToBuild.push(
                    fontSizeSpinnerOptions,
                    opacitySpinnerOptions,
                    paddingSpinnerOptions,
                    rotationSpinnerOptions,
                    fontColorPickerOptions
                );
                break;
            default:
                throw new Error('Unhandled element type by inspector.');
        }
        controllersToBuild.push(duplicateButton, deleteButton);
    }

    // No elements selected, so question area is selected.
    else {
        controllersToBuild.push(questionAreaHeightSpinnerOptions, questionAreaWidthSpinnerOptions);
    }

    return controllersToBuild;
};

/**
    An element was selected, so re-render the inspector.
    @method updateElementSelected
    @return {void}
*/
InspectorController.prototype.updateElementSelected = function() {
    this.render();
};

/**
    {Elements} changed, so a different element may be selected.
    @method updatedElements
    @return {void}
*/
InspectorController.prototype.updatedElements = function() {
    this.render();
};

/**
    Notification that an {Element} was updated.
    @method updatedElement
    @param {Element} element The updated element.
    @return {void}
*/
InspectorController.prototype.updatedElement = function(element) {
    if (this._element === element) {
        this.render();
    }
};

/**
    Update the controller due to a question being selected.
    @method updateQuestionSelected
    @return {void}
*/
InspectorController.prototype.updateQuestionSelected = function() {
    this.render();
};

/**
    Notification that an {Element}'s style was updated.
    @method elementStyleUpdate
    @param {Element} element Defined in ProgressionController.
    @param {Array} stylesUpdated Defined in ProgressionController.
    @return {void}
*/
InspectorController.prototype.elementStyleUpdate = function(element, stylesUpdated) {
    if (this._element === element) {
        this._controllers.forEach(controller => {
            controller.stylesUpdate(stylesUpdated);
        });
    }
};
