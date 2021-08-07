'use strict';

/* exported Color */

/**
    Structure to store a color's RGB value and name.
    @class Color
    @param {String} colorValue The RGB value of the color.
    @param {String} colorName The name of the color.
    @constructor
*/
function Color(colorValue, colorName) {
    this.colorValue = colorValue;
    this.colorName = colorName;
    this.isTransparent = colorValue === 'rgba(0, 0, 0, 0)';
}
