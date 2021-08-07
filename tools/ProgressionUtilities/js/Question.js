'use strict';

/* exported Question */
/* global ElementVariant */

/**
    {Question} displays a prompt for the user and a way for the user to answer the prompt, all of which
    are defined in {Elements}.
    @class Question
*/
class Question {

    /**
        @constructor
        @param {Object} questionJSON The JSON defining the question.
        @param {String} [questionJSON.code=''] Code to execute and use for variables in {Element}s.
        @param {Array} [questionJSON.elementVariants=[]] Array of JSON that models each element variation.
        @param {String} [questionJSON.explanation=''] Explanation for this question.
        @param {String} questionJSON.height Height of the question's display area.
        @param {Boolean} questionJSON.isSelected Whether this question is currently selected.
        @param {String} questionJSON.name The name of this question.
        @param {Array} questionJSON.usedElements List of element ids for elements used in this question.
        @param {String} questionJSON.width Width of the question's display area.
    */
    constructor(questionJSON) {
        const elementVariantsJSON = questionJSON.elementVariants || [];

        this.code = questionJSON.code || '';
        this.elementVariants = elementVariantsJSON.map(elementVariantJSON => new ElementVariant(elementVariantJSON));
        this.explanation = questionJSON.explanation || '';
        this.height = questionJSON.height;
        this.isSelected = questionJSON.isSelected;
        this.name = questionJSON.name;
        this.usedElements = questionJSON.usedElements;
        this.width = questionJSON.width;
    }

    /**
        Return a clone of this question.
        @method clone
        @return {Question} A clone of this question.
    */
    clone() {
        return new Question(this.toJSON());
    }

    /**
        Return JSON for this Question.
        @method toJSON
        @return {Object} The JSON representing this object.
    */
    toJSON() {
        return {
            code: this.code,
            elementVariants: this.elementVariants.map(variant => variant.toJSON()),
            explanation: this.explanation,
            height: this.height,
            isSelected: this.isSelected,
            name: this.name,
            usedElements: this.usedElements.slice(),
            width: this.width,
        };
    }
}
