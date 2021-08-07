'use strict';

/* global AbstractInspectorController, heightSpinnerOptions, widthSpinnerOptions, SpinnerController */

/**
    Controls for the size of the image, including height, width, keeping ratios, and controlling per question or all questions.
    @class ImageSizeController
    @extends AbstractInspectorController
    @constructor
*/
function ImageSizeController(...args) {

    /**
        jQuery object referencing the image size container controlled by this class.
        @name $imageSizeContainer
        @type {Object}
        @default null
    */
    this.$imageSizeContainer = null;

    /**
        jQuery object referencing the checkbox for whether the image size is controller per question or for all questions.
        @name $controlPerQuestionCheckbox
        @type {Object}
        @default null
    */
    this.$controlPerQuestionCheckbox = null;

    /**
        The height and width controllers.
        @name sizeControllers
        @type {Array}
        @default null
    */
    this.sizeControllers = null;

    AbstractInspectorController.prototype.constructor.apply(this, args);
}

ImageSizeController.prototype = new AbstractInspectorController();
ImageSizeController.prototype.construtor = ImageSizeController;

/**
    Render the image size container, then add sub-controllers and event listeners.
    @method render
    @return {void}
*/
ImageSizeController.prototype.render = function() {

    // Render image size container.
    const imageSizeHTML = this._templates.ImageSize({ // eslint-disable-line new-cap
        isControlPerQuestionChecked: this._element.controlHeightWidthPerQuestion,
    });

    this._$inspector.append(imageSizeHTML);
    this.$imageSizeContainer = this._$inspector.children().last();

    // Create height controller.
    const heightSpinnerImageOptions = this.makeSizeOptions(heightSpinnerOptions);
    const $heightContainer = this._$inspector.find('.image-height-container');
    const heightController = new SpinnerController(
        $heightContainer, this._element, heightSpinnerImageOptions, this._templates,
        this._progressionChangingFunctions, this._parentResource, this._progression
    );

    // Create width controller.
    const widthSpinnerImageOptions = this.makeSizeOptions(widthSpinnerOptions);
    const $widthContainer = this._$inspector.find('.image-width-container');
    const widthController = new SpinnerController(
        $widthContainer, this._element, widthSpinnerImageOptions, this._templates,
        this._progressionChangingFunctions, this._parentResource, this._progression
    );

    // Store the size controllers.
    this.sizeControllers = [ heightController, widthController ];

    // Add event listener for checkbox.
    this.$controlPerQuestionCheckbox = this.$imageSizeContainer.find('input[type="checkbox"]').last();
    this.$controlPerQuestionCheckbox.on('change', event => {
        const isChecked = $(event.target).is(':checked');

        // Build list of variants with a height or width style from the progression's questions.
        const variantsOfElementWithSize = [];

        this._progression.levels.forEach(level => {
            level.questions.forEach(question => {
                const questionVariant = question.elementVariants.find(variant => variant.id === this._element.id);

                if (questionVariant && questionVariant.style && (questionVariant.style.height || questionVariant.style.width)) {
                    variantsOfElementWithSize.push(questionVariant);
                }
            });
        });

        // Change whether the element controls per question if transitioning to using control per question, or if there are no variants to worry about.
        if (isChecked || !variantsOfElementWithSize.length) {
            this._element.controlHeightWidthPerQuestion = isChecked;
            this._progressionChangingFunctions.updateElement(this._element);
        }

        // About to remove control per question, which means we need to delete variants. We need to warn the user before we remove variants.
        else {
            this._parentResource.showModal(
                'Remove custom image sizing from each question?',
                `Currently for this image object, image sizing (height/width/ratio) may be custom for each question in the progression.
Removing the custom sizing will default to the original sizing used by this image object.`,
                {
                    label: 'Yes, remove custom sizing',
                    decoration: 'button-blue',
                    callback: () => {

                        // Delete all size styles from variants.
                        variantsOfElementWithSize.forEach(variant => {
                            delete variant.style.height;
                            delete variant.style.width;

                            // If no styles remain, then remove styles.
                            if (!Object.keys(variant.style).length) {
                                delete variant.style;
                            }
                        });

                        // Remove question variants that only have |id| remaining.
                        this._progression.levels.forEach(level => {
                            level.questions.forEach(question => {
                                question.elementVariants = question.elementVariants.filter(variant => {
                                    const onePropertyLeft = Object.keys(variant).length === 1;
                                    const hasId = 'id' in variant;

                                    return !(onePropertyLeft && hasId);
                                });
                            });
                        });

                        this._element.controlHeightWidthPerQuestion = isChecked;
                        this._progressionChangingFunctions.updateElement(this._element);
                    },
                },
                {
                    label: 'No, do not remove custom sizing',
                    decoration: 'button-red',
                    callback: () => {
                        this.$controlPerQuestionCheckbox.prop('checked', true);
                    },
                }
            );
        }
    });
};

/**
    Make the size options from the default spinner options.
    @method makeSizeOptions
    @param {Object} options The default spinner options.
    @return {Object} Options including keepRatio and controlPerQuestion.
*/
ImageSizeController.prototype.makeSizeOptions = function(options) {
    return $.extend(true, { keepRatio: true }, options);
};

/**
    Update the spinner's value if the spinner's style was updated.
    @method stylesUpdate
    @param {Array} styleNames List of styles that were updated.
    @return {void}
*/
ImageSizeController.prototype.stylesUpdate = function(styleNames) {
    this.sizeControllers.forEach(controller => {
        controller.stylesUpdate(styleNames);
    });
};
