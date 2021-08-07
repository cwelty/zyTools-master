'use strict';

/* exported ProgressionQuestionFactory */
/* global ProgressionQuestionElements, ProgressionQuestion */

/**
    Build {ProgressionQuestion} by randomly selecting a question.
    @class ProgressionQuestionFactory
*/
class ProgressionQuestionFactory {

    /**
        @constructor
        @param {Object} progressionJSON JSON representing a progression.
        @param {Boolean} inBuilderMode Whether this ProgressionPlayer instance was loaded by the ProgressionBuilder.
        @return {void}
    */
    constructor(progressionJSON, inBuilderMode) {
        this._progression = require('ProgressionUtilities').create().createProgression(progressionJSON);

        const utilities = require('utilities');

        // Convert each {Questions} into a {Carousel} from Utilities.
        this._progression.levels.forEach(level => {
            level.questions = utilities.getCarousel(level.questions);
        });

        this._inBuilderMode = inBuilderMode;
    }

    /**
        Make a {ProgressionQuestion} based on the current level.
        @method make
        @param {Number} currentLevel The current level that the user is on.
        @return {ProgressionQuestion} A progression question for displaying
    */
    make(currentLevel) {
        const progression = this._progression;
        const level = progression.levels[currentLevel];
        const question = level.questions.getValue();

        // Build elements for this question, merging variants specific to this level and question.
        const elements = new ProgressionQuestionElements(progression.elements, level, question);

        // Get the most specific height and width.
        const progressionUtilities = require('ProgressionUtilities').create();
        const getMostSpecificProperty = progressionUtilities.getMostSpecificProperty;
        const height = getMostSpecificProperty('height', progression, level, question);
        const width = getMostSpecificProperty('width', progression, level, question);

        // Build the explanation by concatenating progression, level, then question.
        const explanations = [ progression.explanation, level.explanation, question.explanation ];
        let explanation = explanations.filter(expl => Boolean(expl)).join('\n');

        // Run question code.
        const originalProgressionCode = progression.code;
        const originalLevelCode = level.code;
        const questionCode = question.code;
        const progressionCode = `${originalProgressionCode}\n`;
        const levelCode = `${originalLevelCode}\n`;
        let module = null;

        try {
            module = progressionUtilities.makePythonModule(progressionCode, levelCode, questionCode);
        }
        catch (error) {
            const errorMessage = progressionUtilities.reviseLineNumberInErrorMessage(error.toString(), progressionCode, levelCode);

            if (this._inBuilderMode) {
                alert(errorMessage); // eslint-disable-line no-alert

                throw error;
            }
            else {
                require('zyWebErrorManager').postError(errorMessage);
            }
        }

        // Update explanation and elements with module.
        explanation = progressionUtilities.replaceStringVariables(explanation, module);
        elements.forEach(element => {
            element.updateWithCode(module, this._inBuilderMode);
        });

        return new ProgressionQuestion(elements, explanation, height, width, currentLevel);
    }

    /**
        Return the number of levels.
        @method numberOfLevels
        @return {Number} The number of levels.
    */
    numberOfLevels() {
        return this._progression.levels.length;
    }
}
