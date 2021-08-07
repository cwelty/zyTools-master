'use strict';

/* global InspectorLevel, AbstractInspectorController */
/**
    Checkboxes that control which levels an element appears in.
    @class InspectorLevelsController
    @extends AbstractInspectorController
    @constructor
    @param {Array} options.levels The progression's levels.
*/
function InspectorLevelsController(...args) {
    this._$levels = null;
    AbstractInspectorController.prototype.constructor.apply(this, args);
}

InspectorLevelsController.prototype = new AbstractInspectorController();
InspectorLevelsController.prototype.construtor = InspectorLevelsController;

/**
    Builds the {InspectorLevel} objects and renders them in the Inspector.
    @method _makeInspectorLevels
    @private
    @return {void}
*/
InspectorLevelsController.prototype._makeInspectorLevels = function() { // eslint-disable-line no-underscore-dangle
    const selectedElements = this._options.allSelectedElements;

    // Build array of level names and whether |_element| is in each level.
    const levels = this._options.levels.map(level => {
        const elementsInLevel = selectedElements.filter(element =>
            level.usedElements.indexOf(element.id) !== -1
        );
        const checked = elementsInLevel.length === selectedElements.length;
        const indeterminate = elementsInLevel.length && !checked;

        return new InspectorLevel(level.name, checked, indeterminate);
    });

    const inspectorLevelsHTML = this._templates.InspectorLevels({ levels }); // eslint-disable-line new-cap

    this._$inspector.append(inspectorLevelsHTML);

    // The indeterminate state can only be set via javascript. We do it here.
    levels.forEach(level => {
        this._$inspector.find(`.inspector-levels input[name="${level.name}"]`).prop('indeterminate', level.indeterminate);
    });
};

/**
    Makes shows the modal indicating if there are element variants.
    @method _makeElementsVariantsModal
    @private
    @param {jQuery} $target A jQuery reference to the checkbox being clicked.
    @param {Level} level The level being changed.
    @param {Array} elementsWithVariants {Array} of {Elements} the elements that have level or question variants.
    @return {void}
*/
InspectorLevelsController.prototype._makeElementsVariantsModal = function($target, level, elementsWithVariants) { // eslint-disable-line no-underscore-dangle
    const variantElementNames = elementsWithVariants.map(variant => variant.name).join(', ');
    const plural = elementsWithVariants.length > 1 ? 's' : '';
    const pluralHave = elementsWithVariants.length > 1 ? 'have' : 'has';

    const message = `The next element${plural} ${pluralHave} different properties (e.g., text and placeholder) per question and/or level:` +
        ` ${variantElementNames}.<br>` +
        `Remove the element${plural} and the different properties on ${level.name}?`;

    this._parentResource.showModal(
        'Remove element and varying properties',
        message,
        {
            label: `Yes, remove the element${plural} and different properties`,
            decoration: 'button-blue',
            callback: () => {
                this.removeFromLevel(level);
            },
        },
        {
            label: `No, do not remove the element${plural}`,
            decoration: 'button-red',
            callback: () => $target.prop('checked', true),
        }
    );
};

/**
    Render the level checkboxes, then add listeners.
    @method render
    @return {void}
*/
InspectorLevelsController.prototype.render = function() {
    const selectedElements = this._options.allSelectedElements;

    this._makeInspectorLevels();
    this._$levels = this._$inspector.find('.inspector-levels input');
    this._$levels.change(event => {
        const $target = $(event.target);
        const levelName = $target.attr('name');
        const levelChanged = this._options.levels.find(level => level.name === levelName);
        const selectedIds = selectedElements.map(element => element.id);

        // Add element's id to level's |usedElements|.
        if ($target.is(':checked')) {
            const idsToAdd = selectedIds.filter(elementId => levelChanged.usedElements.indexOf(elementId) === -1);

            levelChanged.usedElements.push(...idsToAdd);
        }

        // Otherwise, remove element from level
        else {
            const elementsWithVariants = selectedElements.filter(element => {
                const hasQuestionVariant = levelChanged.questions.some(question =>
                    question.elementVariants.some(variant => variant.id === element.id)
                );
                const hasLevelVariant = levelChanged.elementVariants.some(variant => variant.id === element.id);

                return hasQuestionVariant || hasLevelVariant;
            });

            if (elementsWithVariants.length) {
                this._makeElementsVariantsModal($target, levelChanged, elementsWithVariants);
            }
            else {
                this.removeFromLevel(levelChanged);
            }
        }

        this._progressionChangingFunctions.levelUpdated(levelChanged);
    });
};

/**
    Removes the ElementVariants of elements in |elements| from the passed target.
    @method _removeElementVariants
    @private
    @param {Object} target Can be a {Level} or a {Question}, the target that is going to have the variants removed.
    @param {Array} elements {Array} of {Element} The elements whose variants will be removed from |target|.
    @return {void}
*/
InspectorLevelsController.prototype._removeElementVariants = function(target, elements) { // eslint-disable-line no-underscore-dangle
    target.elementVariants = target.elementVariants.filter(elementVariant =>
        !elements.some(element => element.id === elementVariant.id)
    );
};

/**
    Remove the element from the level, removes the variants if there are any.
    @method removeFromLevel
    @param {Level} levelChanged The level that changed.
    @return {void}
*/
InspectorLevelsController.prototype.removeFromLevel = function(levelChanged) {
    const selectedElements = this._options.allSelectedElements;

    levelChanged.usedElements = levelChanged.usedElements.filter(id => !selectedElements.some(element => element.id === id));
    this._removeElementVariants(levelChanged, selectedElements);
    levelChanged.questions.forEach(question => this._removeElementVariants(question, selectedElements));

    this._progressionChangingFunctions.levelUpdated(levelChanged);
};
