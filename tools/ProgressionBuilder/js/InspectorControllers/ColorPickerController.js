'use strict';

/* global AbstractInspectorController, Color */

/**
    Control a color picker for a particular style.
    @class ColorPickerController
    @extends AbstractInspectorController
    @constructor
*/
function ColorPickerController(...args) {
    AbstractInspectorController.prototype.constructor.apply(this, args);
}

ColorPickerController.prototype = new AbstractInspectorController();
ColorPickerController.prototype.construtor = ColorPickerController;

/**
    Render the explanation, then add listeners.
    @method render
    @return {void}
*/
ColorPickerController.prototype.render = function() {

    // Build array of colors.
    const progressionUtilities = require('ProgressionUtilities').create();
    const colors = this._options.colorNames.map(colorName => {
        const colorValue = progressionUtilities.colorEscapeDictionary[colorName] || colorName;

        return new Color(colorValue, colorName);
    });

    const colorPickerHTML = this._templates.ColorPicker({ // eslint-disable-line new-cap
        colors,
        label: this._options.label,
        transparentImage: this._parentResource.getResourceURL('transparent.png', 'ProgressionBuilder'),
    });

    this._$inspector.append(colorPickerHTML);

    this._$inspector.children().last().find('.color-option').click(event => {
        const newColorValue = $(event.target).attr('color');

        this._element.style[this._options.style] = newColorValue;
        this._progressionChangingFunctions.elementStyleUpdate(this._element, [ this._options.style ]);
    });
};
