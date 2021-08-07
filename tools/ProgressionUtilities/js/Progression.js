'use strict';

/* exported Progression */
/* global getElementClassByType, Level */

/**
    {Progression} stores configurations used across all levels and questions.
    @class Progression
*/
class Progression {

    /**
        @constructor
        @param {Object} progressionJSON Configurations used across all levels and questions.
        @param {String} [progressionJSON.code=''] Code to execute and use for variables in {Element}s.
        @param {Array} [progressionJSON.elements=[]] Elements used across all levels and questions.
        @param {String} [progressionJSON.explanation=''] Explanation for each question in each level.
        @param {String} progressionJSON.height Height of the progression.
        @param {Array} [progressionJSON.levels=[]] The levels of the progression.
        @param {String} progressionJSON.width Width of the progression.
    */
    constructor(progressionJSON) {
        const elementsJSON = progressionJSON.elements || [];

        this.elements = elementsJSON.map(elementJSON => {
            const NewElementClass = getElementClassByType(elementJSON.type);

            return new NewElementClass(elementJSON);
        });

        const levelsJSON = progressionJSON.levels || [];

        this.levels = levelsJSON.map(levelJSON => new Level(levelJSON));
        this.code = progressionJSON.code || '';
        this.explanation = progressionJSON.explanation || '';
        this.height = progressionJSON.height;
        this.width = progressionJSON.width;
        this.isExam = progressionJSON.isExam || false;
    }

    /**
       Returns a list of selected elements.
       @method getSelectedElements
       @return {Array}
    */
    getSelectedElements() {
        return this.elements.filter(element => element.isSelected);
    }

    /**
        Returns whether there's a selected element.
        @method hasSelectedElements
        @return {Boolean}
    */
    hasSelectedElements() {
        return this.getSelectedElements().length > 0;
    }

    /**
        Convert {Progression} into a JSON representation.
        @method toJSON
        @return {Object} JSON representation of a {Progression}.
    */
    toJSON() {
        return {
            code: this.code,
            elements: this.elements.map(element => element.toJSON()),
            levels: this.levels.map(level => level.toJSON()),
            explanation: this.explanation,
            height: this.height,
            width: this.width,
            isExam: this.isExam,
        };
    }

    /**
        Return a clone of this progression.
        @method clone
        @return {Progression} Copy of this progression.
    */
    clone() {
        return new Progression(this.toJSON());
    }
}
