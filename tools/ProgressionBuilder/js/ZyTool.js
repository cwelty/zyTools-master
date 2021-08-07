'use strict';

/* exported ZyTool */
/* global addNewLevelWithOneQuestions, defaultProgression */
/* eslint-disable max-len */

/**
    Store the id and caption for a zyTool.
    @class ZyTool
*/
class ZyTool {

    /**
        @constructor
        @param {String} id The zyTool's id.
        @param {String} caption The zyTool's caption.
        @param {Progression} progression The zyTool's progression.
        @param {String} [instructions=''] The instructions located in a zyInstructions tag, associated with this zyTool.
        @param {String} [alternativeText=''] Alternative text for accessibility mode.
    */
    constructor(id, caption, progression, instructions = '', alternativeText = '') {
        this.id = id;
        this.caption = caption;
        this.progression = progression;
        this.instructions = instructions;
        this.alternativeText = alternativeText;
    }

    /**
        Checks if this ZyTool object and the passed |otherZyTool| represent the same progression.
        @method sameAs
        @param {ZyTool} otherZyTool The other progression to compare this one to.
        @return {Boolean} Whether this ZyTool object and the passed |otherZyTool| represent the same progression.
    */
    sameAs(otherZyTool) {
        const simplePropertiesToCompare = [ 'caption', 'instructions', 'alterantiveText' ];
        const simplePropertiesTheSame = simplePropertiesToCompare.every(property => this[property] === otherZyTool[property]);
        const progressionTheSame = JSON.stringify(this.progression.toJSON()) === JSON.stringify(otherZyTool.progression.toJSON());

        return simplePropertiesTheSame && progressionTheSame;
    }

    /**
        Checks if this ZyTool object is a new empty progression.
        @method isEmpty
        @return {Promise}
    */
    isEmpty() {
        const emptyProgression = require('ProgressionUtilities').create().createProgression(defaultProgression);

        addNewLevelWithOneQuestions(emptyProgression.levels);
        emptyProgression.levels[0].questions[0].isSelected = true;
        const hasNoCaption = this.caption === '';
        const hasNoInstructions = this.instructions === '';
        const hasNoAlternativeText = this.alternativeText === '';
        const hasEmptyProgression = JSON.stringify(this.progression.toJSON()) === JSON.stringify(emptyProgression.toJSON());

        return hasNoCaption && hasNoInstructions && hasNoAlternativeText && hasEmptyProgression;
    }
}
