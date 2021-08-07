'use strict';

/* exported buildProgressionBuilderElementControllerPrototype */
/* global findSelectedQuestionAndLevel, parseCssProperty */

/**
    Control a progression builder element.

    @class ProgressionBuilderElementController
    @extends ElementController

    @param {Element} elementRendered Defined in {ElementController}.
    @param {jQuery} $questionArea Defined in {ElementController}.
    @param {Object} templates Defined in {ElementController}.
    @param {Progression} progression The progression being built.
    @param {Element} element Reference to the element.
    @param {Level} level The currently selected level.
    @param {Question} question The currently selected question.
    @param {Object} progressionChangingFunctions Functions to inform the progression builder of changes.
    @param {Object} parentResource The parent resource of the module.
*/
function ProgressionBuilderElementController(elementRendered, $questionArea, templates, progression, // eslint-disable-line max-params
    element, level, question, progressionChangingFunctions, parentResource) {

    // During inheriting, do not set properties.
    if (arguments.length !== 0) { // eslint-disable-line prefer-rest-params
        require('ProgressionUtilities').create().inheritElementController().constructor.apply(this, arguments); // eslint-disable-line prefer-rest-params
        this._progression = progression;
        this._element = element;
        this._level = level;
        this._question = question;
        this._progressionChangingFunctions = progressionChangingFunctions;
        this._parentResource = parentResource;
        this.render();
    }
}

/**
    Build the ProgressionBuilderElementController prototype.
    @method buildProgressionBuilderElementControllerPrototype
    @return {void}
*/
function buildProgressionBuilderElementControllerPrototype() {
    const progressionUtilities = require('ProgressionUtilities').create();

    ProgressionBuilderElementController.prototype = progressionUtilities.inheritElementController();
    ProgressionBuilderElementController.prototype.constructor = ProgressionBuilderElementController;

    /**
        Render element on question area, add event listeners, then start edit mode.
        @method render
        @return {void}
    */
    ProgressionBuilderElementController.prototype.render = function() {
        this.destroy();

        this._elementRendered = this._element.clone();

        const levelVariant = this._level.elementVariants.find(variant => variant.id === this._elementRendered.id);
        const questionVariant = this._question.elementVariants.find(variant => variant.id === this._elementRendered.id);

        this._elementRendered.mergeElementVariant(levelVariant);
        this._elementRendered.mergeElementVariant(questionVariant);

        progressionUtilities.inheritElementController().render.apply(this);

        // Double-click to edit.
        this._$element.dblclick(() => {
            if (!this._element.isSelected) {
                this._progressionChangingFunctions.selectedElement(this._element);
            }
            this._element.isInEditMode = true;
            this._progressionChangingFunctions.disableArrowKeyMovement();
            this._startEditMode();
        });

        this._$element.mousedown(({ ctrlKey, metaKey }) => {

            // Only select if it wasn't selected. This prevents dragging to count as a click and deselecting other elements after a drag.
            const toggle = ctrlKey || metaKey;

            if (toggle) {
                this._progressionChangingFunctions.selectedElement(this._element, toggle);
            }
            else if (!this._element.isSelected) {
                this._progressionChangingFunctions.selectedElement(this._element);
            }

            this.setupDraggableArea();
        });

        // Drag element to position.
        this._$element.draggable({
            containment: this._$questionArea.find('.draggable-area'),
            start: ({ ctrlKey, metaKey }, ui) => {
                if (!this._element.isSelected) {
                    const toggle = ctrlKey || metaKey;

                    this._progressionChangingFunctions.selectedElement(this._element, toggle);
                }
                this.lastPosition = ui.originalPosition;
            },
            drag: (event, ui) => {
                const left = ui.position.left - this.lastPosition.left;
                const top = ui.position.top - this.lastPosition.top;

                this.lastPosition = ui.position;
                this._progressionChangingFunctions.moveSelectedElementsBy(left, top);
            },
            stop: () => {
                this._progressionChangingFunctions.takeSnapshot();
            },
        });

        if (this._element.isInEditMode) {
            this._startEditMode();
        }
        this._parentResource.latexChanged();
    };

    /**
        Return the most specific value of the given property name: question > level > element.
        @method _getMostSpecificValueOfProperty
        @private
        @param {String} propertyName The name of the property.
        @return {Object} The value of the most specific property.
    */
    ProgressionBuilderElementController.prototype._getMostSpecificValueOfProperty = function(propertyName) { // eslint-disable-line no-underscore-dangle
        const progression = this._element;
        const level = this._level.elementVariants.find(variant => (variant.id === this._element.id) && (propertyName in variant));
        const question = this._question.elementVariants.find(variant => (variant.id === this._element.id) && (propertyName in variant));

        return require('ProgressionUtilities').create().getMostSpecificProperty(propertyName, progression, level, question);
    };

    /**
        Start a mode to edit the contents of the element. Ex: Options in a dropdown element.
        Defined by inheriting objects.
        @method _startEditMode
        @private
        @return {void}
    */
    ProgressionBuilderElementController.prototype._startEditMode = function() {}; // eslint-disable-line no-underscore-dangle, no-empty-function

    /**
        End the edit mode, then re-render.
        @method _endEditMode
        @private
        @param {Array} updatedPropertyAndValues Array of {PropertyAndValue}. The updated properties and respective values.
        @return {void}
    */
    ProgressionBuilderElementController.prototype._endEditMode = function(updatedPropertyAndValues) { // eslint-disable-line no-underscore-dangle
        let allOrOnlyThisQuestion = null;

        do {
            allOrOnlyThisQuestion = prompt('Update for (a)ll questions or (o)nly this one?'); // eslint-disable-line no-alert
        } while ((allOrOnlyThisQuestion !== 'a') && (allOrOnlyThisQuestion !== 'o'));

        // Update the property to be the same across (a)ll questions by removing variants.
        if (allOrOnlyThisQuestion === 'a') {
            updatedPropertyAndValues.forEach(propertyAndValue => {
                this._element[propertyAndValue.name] = propertyAndValue.value;
            });

            // Remove all elementVariants for this property from every question.
            this._progression.levels.forEach(level => {
                level.questions.forEach(question => {

                    // Find {ElementVariant} with same |id| as |_element|.
                    const variantWithID = this._findVariantInQuestion(question);

                    // Remove the property from variants.
                    variantWithID.forEach(variant => {
                        updatedPropertyAndValues.forEach(propertyAndValue => {
                            delete variant[propertyAndValue.name];
                        });
                    });

                    // Remove {ElementVariant} that only has |id|.
                    question.elementVariants = question.elementVariants.filter(variant => {
                        const onePropertyLeft = (Object.keys(variant).length === 1);
                        const hasID = ('id' in variant);
                        const removeThisOne = (onePropertyLeft && hasID);

                        return !removeThisOne;
                    });
                });
            });
        }

        // Merge updated property (o)nly into |_question.elementVariants|.
        else if (allOrOnlyThisQuestion === 'o') {

            // Find existing {ElementVariant} with |_element.id|.
            const variantWithID = this._findVariantInQuestion(this._question);

            // {ElementVariant} already exist, so merge in updated property.
            if (variantWithID.length > 0) {
                updatedPropertyAndValues.forEach(propertyAndValue => {
                    variantWithID[0][propertyAndValue.name] = propertyAndValue.value;
                });
            }

            // {ElementVariant} does not exist, so create one.
            else {

                // Build the new variant.
                const newVariant = { id: this._element.id };

                updatedPropertyAndValues.forEach(propertyAndValue => {
                    newVariant[propertyAndValue.name] = propertyAndValue.value;
                });

                const newElementVariant = progressionUtilities.createElementVariant(newVariant);

                this._question.elementVariants.push(newElementVariant);
            }
        }

        this._element.isInEditMode = false;
        this._progressionChangingFunctions.updateElement(this._element);
        this._progressionChangingFunctions.enableArrowKeyMovement();
    };

    ProgressionBuilderElementController.prototype._findVariantInQuestion = function(question) { // eslint-disable-line no-underscore-dangle
        return question.elementVariants.filter(variant => variant.id === this._element.id);
    };

    /**
        Creates a virtual rectangle (draggable area), in the question area, through which the element(s) can be dragged.
        Because dragging technically happens only in the element being clicked, we create a virtual space for dragging.
        With only one element selected, the rectangle is all the question area.
        With multiple elements selected, the rectangle only alows dragging in a space where no element can get out of the question area.
        Because you can only drag one element (we manually move the others), when multiple elements are selected, each element creates
        a different draggable area, even when the same elements are selected.
        In short, the draggable area depends on: The element being dragged, all other elements selected, and the progressions' width and height.
        @method setupDraggableArea
        @return {void}
    */
    ProgressionBuilderElementController.prototype.setupDraggableArea = function() { // eslint-disable-line no-underscore-dangle
        const draggedElementLeft = this.getLeft();
        const draggedElementTop = this.getTop();
        const draggedElementWidth = this.getWidth();
        const draggedElementHeight = this.getHeight();

        // Find each selected elements' left and top values.
        const $selectedElements = this._$questionArea.find('.element.selected');
        const elementsLeft = $selectedElements.map((index, element) => parseCssProperty($(element), 'left'));
        const elementsTop = $selectedElements.map((index, element) => parseCssProperty($(element), 'top'));

        // Find the left-most and top-most position, so the draggable rectangle's left and top covers them.
        const draggableLeft = draggedElementLeft - Math.min(...elementsLeft);
        const draggableTop = draggedElementTop - Math.min(...elementsTop);

        // Find each selected elements' right-most and bottom-most values in the question area.
        const rightOfEachElement = $selectedElements.map((index, element) => {
            const $element = $(element);
            const left = parseCssProperty($element, 'left');
            const width = parseCssProperty($element, 'width');

            return left + width;
        });
        const bottomOfEachElement = $selectedElements.map((index, element) => {
            const $element = $(element);
            const top = parseCssProperty($element, 'top');
            const height = parseCssProperty($element, 'height');

            return top + height;
        });

        // Find the right-most and bottom-most position, so the draggable rectangle's right (width) and bottom (height) covers them.
        const distanceFromRight = Math.max(...rightOfEachElement) - (draggedElementLeft + draggedElementWidth) + draggableLeft;
        const distanceFromBottom = Math.max(...bottomOfEachElement) - (draggedElementTop + draggedElementHeight) + draggableTop;
        const draggableHeight = parseInt(this._progression.height, 10) - distanceFromBottom - 1;
        const draggableWidth = parseInt(this._progression.width, 10) - distanceFromRight - 1;

        this._$questionArea.find('.draggable-area')
            .css({
                left: draggableLeft,
                top: draggableTop,
                height: draggableHeight,
                width: draggableWidth,
            });
    };

    /**
        Add highlight if the element is selected. Otherwise, remove highlighting.
        @method updateElementSelected
        @return {void}
    */
    ProgressionBuilderElementController.prototype.updateElementSelected = function() {
        if (this._element.isSelected) {
            this._$element.addClass('selected');
        }
        else {
            this._$element.removeClass('selected');
        }
    };

    /**
        Whether the element has the 'selected' class.
        @method hasSelectedClass
        @return {void}
    */
    ProgressionBuilderElementController.prototype.hasSelectedClass = function() {
        return this._$element.hasClass('selected');
    };

    /**
        Returns the value of the left property of the element.
        @method getLeft
        @return {Integer}
    */
    ProgressionBuilderElementController.prototype.getLeft = function() {
        return parseCssProperty(this._$element, 'left');
    };

    /**
       Returns the value of the top property of the element.
       @method getTop
       @return {Integer}
    */
    ProgressionBuilderElementController.prototype.getTop = function() {
        return parseCssProperty(this._$element, 'top');
    };

    /**
       Returns the height of the element.
       @method getHeight
       @return {Integer}
    */
    ProgressionBuilderElementController.prototype.getHeight = function() {
        return parseCssProperty(this._$element, 'height');
    };

    /**
       Returns the width of the element.
       @method getWidth
       @return {Integer}
    */
    ProgressionBuilderElementController.prototype.getWidth = function() {
        return parseCssProperty(this._$element, 'width');
    };

    /**
        Update the given element's CSS with the given styles.
        @method elementStyleUpdate
        @param {Element} element Element that was updated.
        @param {Array} stylesUpdated Names of styles that were updated.
        @return {void}
    */
    ProgressionBuilderElementController.prototype.elementStyleUpdate = function(element, stylesUpdated) {
        if (this._element === element) {

            // Build dictionary of new style values.
            const newStyleValues = {};
            const { selectedLevel, selectedQuestion } = findSelectedQuestionAndLevel(this._progression.levels);

            stylesUpdated.forEach(styleUpdated => {
                newStyleValues[styleUpdated] = progressionUtilities.getMostSpecificStyleValueOfElement(
                    styleUpdated, this._element, selectedLevel, selectedQuestion
                );
            });

            // Escape and apply new style values.
            const escapedNewStyleValues = progressionUtilities.escapeStyleValues(newStyleValues);

            Object.keys(escapedNewStyleValues).forEach(
                escapedNewStyle => this._$element.css(escapedNewStyle, escapedNewStyleValues[escapedNewStyle])
            );
        }
    };

    /**
        Notification that an {Element} was updated.
        @method updatedElement
        @param {Element} element The updated element.
        @return {void}
    */
    ProgressionBuilderElementController.prototype.updatedElement = function(element) {
        if (this._element === element) {
            this.render();
        }
    };

    /**
        Get the user's text input.
        @method _getUserText
        @private
        @param {String} defaultText The default input text.
        @param {String} promptText The prompt to the user.
        @return {String} The user's text input.
    */
    ProgressionBuilderElementController.prototype._getUserText = function(defaultText, promptText) { // eslint-disable-line no-underscore-dangle
        const newText = prompt(promptText, defaultText); // eslint-disable-line no-alert
        const userClickedCancel = (newText === null);

        return (userClickedCancel ? defaultText : newText);
    };

    /**
        Get the user's text input that is not just whitespace.
        @method _getNonBlankUserText
        @private
        @param {String} defaultText The default input text.
        @param {String} promptText The prompt to the user.
        @return {String} The user's text input that is not just whitespace.
    */
    ProgressionBuilderElementController.prototype._getNonBlankUserText = function(defaultText, promptText) { // eslint-disable-line no-underscore-dangle
        let userText = this._getUserText(defaultText, promptText);

        const removeWhitespace = require('utilities').removeWhitespace;
        const longPrompt = `${promptText} Cannot be blank or just whitespace.`;

        while (removeWhitespace(userText) === '') {
            userText = this._getUserText(defaultText, longPrompt);
        }

        return userText;
    };

    /**
        Return the an object defining the cancel button of a modal.
        @method _makeModalCancelButton
        @private
        @return {Object} The definition of the cancel button for a modal.
    */
    ProgressionBuilderElementController.prototype._makeModalCancelButton = function() { // eslint-disable-line no-underscore-dangle
        return {
            label: 'Cancel',
            decoration: 'button-red',
            callback: () => {
                this._element.isInEditMode = false;
                this._progressionChangingFunctions.enableArrowKeyMovement();
            },
        };
    };

    /**
        Return the an object defining the save button of a modal.
        @method _makeModalSaveButton
        @private
        @param {Function} callback The callback function when the save button is pressed.
        @return {Object} The definition of the save button for a modal.
    */
    ProgressionBuilderElementController.prototype._makeModalSaveButton = function(callback) { // eslint-disable-line no-underscore-dangle
        return {
            label: 'Save',
            decoration: 'button-blue',
            callback,
        };
    };
}
