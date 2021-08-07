'use strict';

/* exported Level */
/* global ElementVariant, Question */

/**
    A {Level} is a collection of similar difficulty questions.
    The questions may have the same explanation.
    @class Level
*/
class Level {

    /**
        @constructor
        @param {Object} levelJSON JSON that models a questions and explanation object.
        @param {String} [levelJSON.code=''] Code to execute and use for variables in {Element}s.
        @param {String} levelJSON.explanation Explanation for each question this level.
        @param {Array} levelJSON.elementVariants Variations of elements used for this level.
        @param {String} levelJSON.height Height of questions display area.
        @param {Boolean} levelJSON.isCollapsed Whether the level is collapsed.
        @param {String} levelJSON.name The name of this level.
        @param {Array} levelJSON.questions Array of JSON modeling each question this level.
        @param {String} levelJSON.width Width of questions display area.
        @param {Array} levelJSON.usedElements List of element IDs included this level.
    */
    constructor(levelJSON) {
        const elementVariantsJSON = levelJSON.elementVariants || [];

        this.elementVariants = elementVariantsJSON.map(elementVariantJSON => new ElementVariant(elementVariantJSON));

        const questionsJSON = levelJSON.questions || [];

        this.questions = questionsJSON.map(questionJSON => new Question(questionJSON));
        this.code = levelJSON.code || '';
        this.explanation = levelJSON.explanation || '';
        this.height = levelJSON.height;
        this.isCollapsed = typeof levelJSON.isCollapsed === 'undefined' ? true : levelJSON.isCollapsed;
        this.isSelected = levelJSON.isSelected || false;
        this.name = levelJSON.name;
        this.usedElements = levelJSON.usedElements.slice();
        this.width = levelJSON.width;
    }

    /**
        Return a clone of this level.
        @method clone
        @return {Level} A clone of this level.
    */
    clone() {
        return new Level(this.toJSON());
    }

    /**
        Convert {Level} into a JSON representation.
        @method toJSON
        @return {Object} JSON representation of a {Level}.
    */
    toJSON() {
        return {
            code: this.code,
            elementVariants: this.elementVariants.map(elementVariant => elementVariant.toJSON()),
            questions: this.questions.map(question => question.toJSON()),
            explanation: this.explanation,
            height: this.height,
            isCollapsed: this.isCollapsed,
            isSelected: this.isSelected,
            name: this.name,
            usedElements: this.usedElements.slice(),
            width: this.width,
        };
    }
}
