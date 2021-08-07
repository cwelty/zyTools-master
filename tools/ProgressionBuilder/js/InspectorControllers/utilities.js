'use strict';

/* global maxQuestionAreaHeight, maxQuestionAreaWidth, minQuestionAreaHeight, minQuestionAreaWidth */

/* exported borderRadiusSpinnerOptions,
            fontSizeSpinnerOptions,
            heightSpinnerOptions,
            imageSizeOptions,
            leftSpinnerOptions,
            opacitySpinnerOptions,
            paddingSpinnerOptions,
            questionAreaHeightSpinnerOptions,
            questionAreaWidthSpinnerOptions,
            rotationSpinnerOptions,
            topSpinnerOptions,
            widthSpinnerOptions,
            assessmentMethodOptions,
            buildInspectorControllerConstants,
            fontColorPickerOptions,
            borderColorPickerOptions,
            duplicateButton,
            duplicateSelectedButton,
            deleteButton,
            deleteSelectedButton,
            optionOrderingMethodOptions */

let borderRadiusSpinnerOptions = null;
let fontSizeSpinnerOptions = null;
let heightSpinnerOptions = null;
let imageSizeOptions = null;
let leftSpinnerOptions = null;
let opacitySpinnerOptions = null;
let paddingSpinnerOptions = null;
let questionAreaHeightSpinnerOptions = null;
let questionAreaWidthSpinnerOptions = null;
let rotationSpinnerOptions = null;
let topSpinnerOptions = null;
let widthSpinnerOptions = null;

/**
    Build constants used for configuration inspector controllers, e.g., SpinnerController.
    @method buildInspectorControllerConstants
    @return {void}
*/
function buildInspectorControllerConstants() {
    borderRadiusSpinnerOptions = {
        type: 'Spinner',
        label: 'Radius',
        style: 'border-radius',
        max: 999,
        min: 0,
    };

    fontSizeSpinnerOptions = {
        type: 'Spinner',
        label: 'Font size',
        style: 'font-size',
        max: 30,
        min: 8,
    };

    heightSpinnerOptions = {
        type: 'Spinner',
        label: 'Height',
        style: 'height',
        max: maxQuestionAreaHeight,
        min: 0,
    };

    imageSizeOptions = {
        type: 'ImageSize',
    };

    leftSpinnerOptions = {
        type: 'Spinner',
        label: 'x',
        style: 'left',
        max: maxQuestionAreaWidth,
        min: 0,
    };

    opacitySpinnerOptions = {
        type: 'Spinner',
        label: 'Opacity',
        style: 'opacity',
        max: 100,
        min: 0,
    };

    paddingSpinnerOptions = {
        type: 'Spinner',
        label: 'Padding',
        style: 'padding',
        max: 999,
        min: 0,
    };

    questionAreaHeightSpinnerOptions = {
        type: 'Spinner',
        label: 'Height',
        style: 'height',
        max: maxQuestionAreaHeight,
        min: minQuestionAreaHeight,
    };

    questionAreaWidthSpinnerOptions = {
        type: 'Spinner',
        label: 'Width',
        style: 'width',
        max: maxQuestionAreaWidth,
        min: minQuestionAreaWidth,
    };

    rotationSpinnerOptions = {
        type: 'Spinner',
        label: 'Rotation',
        style: 'transform',
        max: 360,
        min: -360,
    };

    topSpinnerOptions = {
        type: 'Spinner',
        label: 'y',
        style: 'top',
        max: maxQuestionAreaHeight,
        min: 0,
    };

    widthSpinnerOptions = {
        type: 'Spinner',
        label: 'Width',
        style: 'width',
        max: maxQuestionAreaWidth,
        min: 0,
    };
}

const fontColorPickerOptions = {
    type: 'ColorPicker',
    label: 'Font color',
    style: 'color',
    colorNames: [ 'zyante-black', 'zyante-gray', 'zyante-dark-blue', 'white', 'rgba(0, 0, 0, 0)' ],
};

const borderColorPickerOptions = {
    type: 'ColorPicker',
    label: 'Border color',
    style: 'border-color',
    colorNames: [ 'zyante-black', 'zyante-gray', 'zyante-dark-blue', 'rgba(0, 0, 0, 0)' ],
};

const duplicateButton = {
    type: 'Button',
    name: 'Duplicate',
    action: buttonController => {
        buttonController._progressionChangingFunctions.duplicateElement(buttonController._element); // eslint-disable-line no-underscore-dangle
    },
};

const duplicateSelectedButton = {
    type: 'Button',
    name: 'Duplicate all',
    action: buttonController => {
        buttonController._progressionChangingFunctions.duplicateSelected(); // eslint-disable-line no-underscore-dangle
    },
};

const deleteButton = {
    type: 'Button',
    name: 'Delete',
    action: buttonController => {
        buttonController._progressionChangingFunctions.deleteElement(buttonController._element); // eslint-disable-line no-underscore-dangle
    },
};

const deleteSelectedButton = {
    type: 'Button',
    name: 'Delete all',
    action: buttonController => {
        buttonController._progressionChangingFunctions.deleteSelected(); // eslint-disable-line no-underscore-dangle
    },
};

const assessmentMethodOptions = {
    type: 'AssessmentMethod',
};

const optionOrderingMethodOptions = {
    type: 'OptionOrderMethod',
};
