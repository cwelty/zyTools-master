'use strict';

/* global AbstractInspectorController, findSelectedQuestionAndLevel, getElementVariantForStyle
   maxQuestionAreaHeight, maxQuestionAreaWidth, minQuestionAreaHeight, minQuestionAreaWidth */

/**
    Spinner that controls a style of an element.
    @class SpinnerController
    @extends AbstractInspectorController
    @constructor
    @param {Number} options.max The max value of the spinner.
    @param {Number} options.min The min value of the spinner.
*/
function SpinnerController(...args) {
    this._$spinner = null;
    AbstractInspectorController.prototype.constructor.apply(this, args);
}

SpinnerController.prototype = new AbstractInspectorController();
SpinnerController.prototype.construtor = SpinnerController;

/**
    Render the explanation, then add listeners.
    @method render
    @return {void}
*/
SpinnerController.prototype.render = function() {
    const hasKeepRatioOption = this._options.keepRatio || false;
    const questionAreaSpinners = !this._element;

    // Question area gets height and width from the progression object.
    const styleValue = questionAreaSpinners ? this._progression[this._options.style] : this.getMostSpecificStyleValue();
    const isKeepRatioChecked = styleValue === 'auto';
    const value = isKeepRatioChecked ? '' : styleValue;
    const spinnerHTML = this._templates.Spinner({ // eslint-disable-line new-cap
        label: this._options.label,
        max: this._options.max,
        min: this._options.min,
        value: this._convertStyleValueToNumber(value),
        hasKeepRatioOption,
        isKeepRatioChecked,
    });

    this._$inspector.append(spinnerHTML);

    const $spinnerContainer = this._$inspector.children().last();
    const $checkbox = $spinnerContainer.find('input[type="checkbox"]');

    this._$spinner = $spinnerContainer.find('input[type="number"]');

    this._$spinner.on('input', event => {

        // Convert spinner value to style value.
        const spinnerValue = $(event.target).val();
        let newStyleValue = `${spinnerValue}px`;

        if (this._options.style === 'transform') {
            newStyleValue = `rotate(${spinnerValue}deg)`;
        }
        else if (this._options.style === 'opacity') {
            newStyleValue = spinnerValue / 100.0; // eslint-disable-line no-magic-numbers
        }

        // If keep ratio is checked, then we set value to auto.
        if (hasKeepRatioOption) {
            if ($checkbox.is(':checked')) {
                newStyleValue = 'auto';
            }
        }

        if (questionAreaSpinners) {
            const styleToRange = {
                height: { max: maxQuestionAreaHeight, min: minQuestionAreaHeight },
                width: { max: maxQuestionAreaWidth, min: minQuestionAreaWidth },
            };
            const { max, min } = styleToRange[this._options.style];
            const finalValue = Math.min(Math.max(min, spinnerValue), max);

            this.updateQuestionAreaStyle(`${finalValue}px`);
        }
        else {
            this.updateStyleEvent(newStyleValue);
        }
    });

    if (hasKeepRatioOption) {
        $checkbox.on('change', event => {
            const isChecked = $(event.target).is(':checked');
            const inputFieldValue = this._$spinner.val() || 100; // eslint-disable-line no-magic-numbers

            this._$spinner.val(inputFieldValue);
            this._$spinner.prop('disabled', isChecked);

            if (this._options.style === 'height') {
                this._element.keepHeightRatio = isChecked;
            }
            else if (this._options.style === 'width') {
                this._element.keepWidthRatio = isChecked;
            }

            const newStyleValue = isChecked ? 'auto' : `${inputFieldValue}px`;

            this.updateStyleEvent(newStyleValue);
            this._progressionChangingFunctions.updateElement(this._element);
        });
    }
};

/**
    Update the question area's style (height or width).
    @method updateQuestionAreaStyle
    @param {String} newStyleValue The value to set for the style.
    @return {void}
*/
SpinnerController.prototype.updateQuestionAreaStyle = function(newStyleValue) {
    this._progression[this._options.style] = newStyleValue;
    this._progressionChangingFunctions.updatedQuestionAreaViaInspector(this._progression);
};

/**
    Update the spinner's style based on a recent event caused by the user.
    @method updateStyleEvent
    @param {String} newStyleValue The new value of this spinner's value.
    @return {void}
*/
SpinnerController.prototype.updateStyleEvent = function(newStyleValue) {
    let elementToUpdate = this._element;

    if (this._element.controlHeightWidthPerQuestion && [ 'height', 'width' ].includes(this._options.style)) {
        const { selectedQuestion } = findSelectedQuestionAndLevel(this._progression.levels);

        elementToUpdate = getElementVariantForStyle(selectedQuestion.elementVariants, this._element.id);
    }

    elementToUpdate.style[this._options.style] = newStyleValue;
    this._progressionChangingFunctions.elementStyleUpdate(this._element, [ this._options.style ]);
};

/**
    Get the most specific style value for this spinner's element.
    @method getMostSpecificStyleValue
    @return {String} The most specific style value.
*/
SpinnerController.prototype.getMostSpecificStyleValue = function() {
    const { selectedLevel, selectedQuestion } = findSelectedQuestionAndLevel(this._progression.levels);

    return require('ProgressionUtilities').create().getMostSpecificStyleValueOfElement(
        this._options.style, this._element, selectedLevel, selectedQuestion
    );
};

/**
    Update the spinner's value if the spinner's style was updated.
    @method stylesUpdate
    @param {Array} styleNames List of styles that were updated.
    @return {void}
*/
SpinnerController.prototype.stylesUpdate = function(styleNames) {
    styleNames.forEach(styleName => {
        const isChecked = this._$spinner.filter('input[type="checkbox"]').is(':checked');

        if ((styleName === this._options.style) && !isChecked) {
            const newStyleValue = this._convertStyleValueToNumber(this.getMostSpecificStyleValue());

            this._$spinner.val(newStyleValue);
        }
    });
};

/**
    Convert the style value to a number.
    @method _convertStyleValueToNumber
    @param {String} styleValue The style's value as a string.
    @return {Number} The style value as a number.
*/
SpinnerController.prototype._convertStyleValueToNumber = function(styleValue) { // eslint-disable-line no-underscore-dangle
    let newStyleValue = styleValue ? styleValue : 0;

    // If transform, then remove prefix: rotate(
    if ((this._options.style === 'transform') && newStyleValue.split) {
        newStyleValue = styleValue.split('rotate(')[1];
    }

    // Opacity CSS ranges from 0.0 to 1.0, but the spinner ranges from 0 to 100.
    else if (this._options.style === 'opacity') {
        newStyleValue *= 100; // eslint-disable-line no-magic-numbers
    }
    return parseInt(newStyleValue, 10);
};
