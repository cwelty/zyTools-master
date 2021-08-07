'use strict';

/* global ProgressionController, findSelectedQuestionAndLevel, maxQuestionAreaHeight, maxQuestionAreaWidth, parseCssProperty */

/**
    Control the question area.
    @class QuestionAreaController
    @extends ProgressionController
    @constructor
*/
function QuestionAreaController(...args) {
    this._elementControllers = [];
    ProgressionController.prototype.constructor.apply(this, args);
}

QuestionAreaController.prototype = new ProgressionController();
QuestionAreaController.prototype.contructor = QuestionAreaController;

/**
    Render the question area, then add listeners.
    @method render
    @return {void}
*/
QuestionAreaController.prototype.render = function() {
    this._$dom.empty().html(this._templates.QuestionArea()); // eslint-disable-line new-cap

    // Find the selected question and level.
    const result = findSelectedQuestionAndLevel(this._progression.levels);
    const selectedLevel = result.selectedLevel;
    const selectedQuestion = result.selectedQuestion;

    // Get the most specific height and width for the selected question and level.
    const progressionUtilities = require('ProgressionUtilities').create();
    const height = progressionUtilities.getMostSpecificProperty('height', this._progression, selectedLevel, selectedQuestion);
    const width = progressionUtilities.getMostSpecificProperty('width', this._progression, selectedLevel, selectedQuestion);

    // Adjust question area's height and width.
    const $questionArea = this._$dom.find('.question-area');

    $questionArea.height(height).width(width);

    // Resize question area to update progression.height and progression.width.
    $questionArea.resizable({
        handles: 'se',
        minHeight: 100,
        minWidth: 450,
        maxHeight: maxQuestionAreaHeight,
        maxWidth: maxQuestionAreaWidth,
        stop: (event, ui) => {
            this._progression.height = `${ui.size.height}px`;
            this._progression.width = `${ui.size.width}px`;

            this._progressionChangingFunctions.updatedProgression(this._progression);
        },
    });

    $questionArea.selectable({
        classes: {
            'ui-selected': 'selected',
            'ui-selecting': 'selected',
        },
        filter: '.element',
        start: () => {
            this._progressionChangingFunctions.deselectAllElements();
            this.selectQuestionArea(false);
        },
        stop: () => {
            const elementsToSelect = this._elementControllers.filter(elementController => elementController.hasSelectedClass())
                .map(elementController => elementController._element); // eslint-disable-line no-underscore-dangle

            elementsToSelect.forEach(element => {
                element.isSelected = true;
            });

            this._progressionChangingFunctions.selectedElements(elementsToSelect);
        },
    });

    // List of element ids used in this level and question.
    const elementIDsForThisQuestion = selectedLevel ? selectedLevel.usedElements.concat(selectedQuestion.usedElements) : [];

    // Render each {Element} with |id| in |elementIDsForThisQuestion|.
    const elementsToRender = this._progression.elements.filter(element => (elementIDsForThisQuestion.indexOf(element.id) !== -1));

    this._elementControllers = elementsToRender.reverse().map(element => {
        const className = `${progressionUtilities.getElementClassNameByType(element.type)}Controller`;

        // Convert |className| to the class constructor of the same name.
        const ControllerClass = eval(className); // eslint-disable-line no-eval

        return new ControllerClass(
            null,
            $questionArea,
            this._templates,
            this._progression,
            element,
            selectedLevel,
            selectedQuestion,
            this._progressionChangingFunctions,
            this._parentResource
        );
    });

    this.selectQuestionArea(!this._progression.hasSelectedElements());
};

/**
    Whether to select the question area. This adds the outline to the question area.
    @method selectQuestionArea
    @param {Booolean} select Whether to select the question area.
    @return {void}
*/
QuestionAreaController.prototype.selectQuestionArea = function(select) {
    const $questionArea = this._$dom.find('.question-area');

    if (select) {
        this._progressionChangingFunctions.disableArrowKeyMovement();
        $questionArea.addClass('selected');
    }
    else {
        this._progressionChangingFunctions.enableArrowKeyMovement();
        $questionArea.removeClass('selected');
    }
};

/**
    Ensures that moving elements keeps them within bounds.
    @method getPositionWithinBounds
    @param {Integer} left Movement in the x axis.
    @param {Integer} top Movement in the y axis.
    @return {Object} The left and top values within bounds.
*/
QuestionAreaController.prototype.getPositionWithinBounds = function(left, top) {
    const anElement = this._elementControllers.find(controller => controller.hasSelectedClass()); // eslint-disable-line no-underscore-dangle

    // Creates the draggable area of any element, it's used to calculate the bounds within which movement is allowed.
    anElement.setupDraggableArea();
    const $draggable = this._$dom.find('.draggable-area');
    const draggableLeft = parseCssProperty($draggable, 'left');
    const draggableTop = parseCssProperty($draggable, 'top');
    const maxTop = draggableTop + parseCssProperty($draggable, 'height') - anElement.getHeight();
    const maxLeft = draggableLeft + parseCssProperty($draggable, 'width') - anElement.getWidth();

    const elementLeft = anElement.getLeft();
    const elementTop = anElement.getTop();
    let newLeft = left;
    let newTop = top;

    const borderSize = parseCssProperty(anElement._$element, 'border-width') * 2; // eslint-disable-line

    // If getting out of bounds through the left, or the right, don't move horizontally.
    if (((elementLeft + left) < draggableLeft) || ((elementLeft + left + borderSize) > maxLeft)) {
        newLeft = 0;
    }

    // If getting out of bounds through up or down, don't move vertically.
    if (((elementTop + top) < draggableTop) || ((elementTop + top + borderSize) > maxTop)) {
        newTop = 0;
    }
    return { left: newLeft, top: newTop };
};

/**
    Inform each element controller that an element was selected.
    @method updateElementSelected
    @return {void}
*/
QuestionAreaController.prototype.updateElementSelected = function() {
    this._elementControllers.forEach(controller => {
        controller.updateElementSelected();
    });
    this.selectQuestionArea(!this._progression.hasSelectedElements());
};

/**
    A question was selected, so re-render this question area.
    @method updateQuestionSelected
    @return {void}
*/
QuestionAreaController.prototype.updateQuestionSelected = function() {
    this.render();
};

/**
    Re-render since an element was added.
    @method elementAdded
    @return {void}
*/
QuestionAreaController.prototype.elementAdded = function() {
    this.render();
};

/**
    Re-render since elements changed.
    @method updatedElements
    @return {void}
*/
QuestionAreaController.prototype.updatedElements = function() {
    this.render();
};

/**
    Notification that an {Element} was updated.
    @method updatedElement
    @param {Element} element The updated element.
    @return {void}
*/
QuestionAreaController.prototype.updatedElement = function(element) {
    this._elementControllers.forEach(controller => controller.updatedElement(element));
    this.render();
};

/**
    Notification that an {Element}'s style was updated.
    @method elementStyleUpdate
    @param {Element} element Defined in ProgressionController.
    @param {Array} stylesUpdated Defined in ProgressionController.
    @return {void}
*/
QuestionAreaController.prototype.elementStyleUpdate = function(element, stylesUpdated) {
    this._elementControllers.forEach(controller => {
        controller.elementStyleUpdate(element, stylesUpdated);
    });
};

/**
    A {Level} was updated, so re-render.
    @method levelUpdated
    @param {Level} level The level that was updated.
    @return {void}
*/
QuestionAreaController.prototype.levelUpdated = function(level) { // eslint-disable-line no-unused-vars
    this.render();
};
