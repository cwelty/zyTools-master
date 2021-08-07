'use strict';

/* exported ElementShortAnswer */
/* global replaceStringVariables, pythonVariableIsList, getValuesFromPythonList */

/**
    An {ElementShortAnswer} models an interactive short answer.
    @class ElementShortAnswer
    @extends Element
*/
class ElementShortAnswer extends Element {

    /**
        @constructor
        @param {Object} elementShortAnswerJSON JSON that models a short answer. See {Elements} for more properties.
        @param {String} [assessmentMethod='stringMatch'] The method to assess correctness. Valid values: 'stringMatch' and 'numericalMatch'
        @param {Object} [assessmentProperties={}] Properties associated with assessing correctness. Ex: tolerancePercentage and toleranceAbsoluteValue for 'numericalMatch'
        @param {Array} [elementShortAnswerJSON.correctAnswers=[]] Array of {String}. The correct answers for the short answer.
        @param {String} [elementShortAnswerJSON.placeholder=''] The placeholder text for the short answer.
    */
    constructor(elementShortAnswerJSON) {
        super(elementShortAnswerJSON);
        this.assessmentMethod = elementShortAnswerJSON.assessmentMethod || 'stringMatch';
        this.assessmentProperties = elementShortAnswerJSON.assessmentProperties || {};
        this.correctAnswers = elementShortAnswerJSON.correctAnswers ? elementShortAnswerJSON.correctAnswers.slice() : [];
        this.placeholder = elementShortAnswerJSON.placeholder || '';
    }

    /**
        Return a clone of this element.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        return new ElementShortAnswer(this.toJSON());
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this); // eslint-disable-line prefer-reflect

        elementJSON.assessmentMethod = this.assessmentMethod;
        elementJSON.assessmentProperties = $.extend(true, {}, this.assessmentProperties);
        elementJSON.correctAnswers = this.correctAnswers.slice();
        elementJSON.placeholder = this.placeholder;

        return elementJSON;
    }

    /**
        Update placeholder and each correct answer with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        this.placeholder = replaceStringVariables(this.placeholder, module);

        const answersNestedList = this.correctAnswers.map(correctAnswer => {
            const match = (/\$\{(\w+)\}/g).exec(correctAnswer);
            const variableName = match && match.length > 1 ? match[1] : correctAnswer;

            return pythonVariableIsList(variableName, module) ?
                   getValuesFromPythonList(variableName, module) :
                   replaceStringVariables(correctAnswer, module);
        });

        // Flatten |answersNestedList| by 1 nested array, and convert to strings. Ex: [ 1, 2, [ 3, 4] ] becomes [ '1', '2', '3', '4' ]
        const flattenedCorrectAnswers = answersNestedList.reduce((accumulator, current) => accumulator.concat(current), []);

        this.correctAnswers = flattenedCorrectAnswers.map(element => element.toString());
    }
}
