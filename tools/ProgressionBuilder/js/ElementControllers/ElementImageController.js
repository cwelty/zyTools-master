'use strict';

/* exported buildElementImageControllerPrototype */
/* global ProgressionBuilderElementController, PropertyAndValue, findSelectedQuestionAndLevel, getElementVariantForStyle */

/**
    Control an image element.
    @class ElementImageController
    @extends ProgressionBuilderElementController
*/
class ElementImageController {
    constructor(...args) {
        ProgressionBuilderElementController.prototype.constructor.apply(this, args);
    }
}

/**
    Build the ElementImageController prototype.
    @method buildElementImageControllerPrototype
    @return {void}
*/
function buildElementImageControllerPrototype() {
    ElementImageController.prototype = new ProgressionBuilderElementController();
    ElementImageController.prototype.constructor = ElementImageController;

    /**
        Render the image and try loading the image.
        @method render
        @return {void}
    */
    ElementImageController.prototype.render = function() {
        ProgressionBuilderElementController.prototype.render.apply(this);
        const $img = this._$element.find('img');

        $img.on('load', event => this._firstLoad(event));

        // Download the image.
        const progressionUtilities = require('ProgressionUtilities').create();

        progressionUtilities.downloadImage(
            this._parentResource,
            this._getMostSpecificValueOfProperty('imageID'),
            $img,
            'Image not found.'
        );

        const { selectedLevel, selectedQuestion } = findSelectedQuestionAndLevel(this._progression.levels);
        const getMostSpecificStyleValueOfElement = require('ProgressionUtilities').create().getMostSpecificStyleValueOfElement;
        const aspectRatio = [ 'height', 'width' ].some(property =>
            getMostSpecificStyleValueOfElement(property, this._element, selectedLevel, selectedQuestion) === 'auto'
        );

        // Make image resizable.
        this._$element.resizable({
            aspectRatio,
            handles: 'se',
            minHeight: 1,
            minWidth: 1,
            stop: (event, ui) => {
                const stylesToUpdate = [ 'height', 'width' ];

                // Find the most specific height and width value for the element.
                const oldStyles = {
                    height: getMostSpecificStyleValueOfElement('height', this._element, selectedLevel, selectedQuestion),
                    width: getMostSpecificStyleValueOfElement('width', this._element, selectedLevel, selectedQuestion),
                };

                // Update the styles. If the element's size is controlled per question, then add a variant.
                stylesToUpdate.forEach(style => {
                    const newStyleValue = oldStyles[style] === 'auto' ? 'auto' : `${ui.size[style]}px`;
                    let elementToUpdate = this._element;

                    if (this._element.controlHeightWidthPerQuestion) {
                        elementToUpdate = getElementVariantForStyle(selectedQuestion.elementVariants, this._element.id);
                    }

                    elementToUpdate.style[style] = newStyleValue;
                });

                this._progressionChangingFunctions.elementStyleUpdate(this._element, stylesToUpdate);
            },
        });
    };

    /**
        Prompt user to enter image ID.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementImageController.prototype._startEditMode = function() { // eslint-disable-line no-underscore-dangle
        const imageID = this._getMostSpecificValueOfProperty('imageID') || '';

        const saveModalCallback = () => {
            const newId = $('.ProgressionBuilder-modal #image-id').val();

            window.setTimeout(() => {
                this._endEditMode([
                    new PropertyAndValue('imageID', newId),
                ]);
            }, 1);
        };

        // Open modal asking for image data. Select image ID input field content.
        this._parentResource.showModal(
            'Edit image object',
            this._templates.ElementImageEdit({ imageID }), // eslint-disable-line new-cap
            this._makeModalSaveButton(saveModalCallback),
            this._makeModalCancelButton()
        );

        $('.ProgressionBuilder-modal input#image-id').select();
    };

    ElementImageController.prototype._firstLoad = function(event) { // eslint-disable-line no-underscore-dangle
        $(event.target).off('load');
        if (this._element.newAddition) {
            this._element.newAddition = false;
            const { naturalHeight, naturalWidth } = event.target;
            let height = '100px';
            let width = 'auto';
            let keepWidth = true;

            if (naturalWidth > naturalHeight) {
                height = 'auto';
                width = '100px';
                keepWidth = false;
            }
            this._element.style.height = height;
            this._element.style.width = width;
            if (keepWidth) {
                this._element.keepWidthRatio = true;
            }
            else {
                this._element.keepHeightRatio = true;
            }
            this._progressionChangingFunctions.updateElement(this._element);
            this._progressionChangingFunctions.elementStyleUpdate(this._element, [ 'height', 'width' ]);
        }
    };
}
