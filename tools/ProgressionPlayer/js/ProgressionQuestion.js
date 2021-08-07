'use strict';

/* exported ProgressionQuestion */

/**
    A progression question to be displayed.
    @class ProgressionQuestion
*/
class ProgressionQuestion {

    /**
        @constructor
        @param {Array} elements The elements to be displayed for this question
        @param {String} explanation The explanation for this question
        @param {String} height The height of the display area
        @param {String} width The width of the display area
        @param {Integer} levelIndex The level's index from which this question was generated. Ex: 0 is Level 1.
    */
    constructor(elements, explanation, height, width, levelIndex) {
        this.elements = elements;
        this.explanation = explanation;
        this.height = height;
        this.width = width;
        this.levelIndex = levelIndex;
    }

    /**
        Return JSON representing this object.
        @method toJSON
        @return {Object} JSON representing this object.
    */
    toJSON() {
        return {
            elements: this.elements.toJSON(),
            explanation: this.explanation,
            height: this.height,
            width: this.width,
            levelIndex: this.levelIndex,
        };
    }
}
