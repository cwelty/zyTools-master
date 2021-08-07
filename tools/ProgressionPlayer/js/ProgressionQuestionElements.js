'use strict';

/**
    The elements to be displayed for a progression question.

    @class ProgressionQuestionElements
    @extends Array

    @constructor
    @param {Elements} [elements=null] The elements in the progression.
    @param {Level} [level=null] The level of this progression question.
    @param {Question} [question=null] The question of this progression question.
*/
function ProgressionQuestionElements(elements = null, level = null, question = null) {
    if (elements && level && question) {

        // Build list of element ids used in this level and question.
        const elementIDsForThisQuestion = level.usedElements.concat(question.usedElements);

        // Map each element id to respective {Element}.
        const initialElements = elements.filter(element => elementIDsForThisQuestion.includes(element.id));

        initialElements.forEach(element => this.push(element.clone()));

        this._addElementVariants(level.elementVariants);
        this._addElementVariants(question.elementVariants);
    }
}

ProgressionQuestionElements.prototype = [];
ProgressionQuestionElements.prototype.constructor = ProgressionQuestionElements;

/**
    Add {ElementVariants} to |this|.
    @method _addElementVariants
    @param {Elements} elements More elements to add.
    @return {void}
*/
ProgressionQuestionElements.prototype._addElementVariants = function(elements) { // eslint-disable-line no-underscore-dangle

    // Merge {ElementVariant} elements with existing element with same |id|.
    elements.forEach(element => this._getElementWithId(element.id).mergeElementVariant(element));
};

/**
    Get {Element} with |id| in |this|.
    @method _getElementWithId
    @param {String} id Unique id for an {Element}.
    @return {Element} The {Element} with |id|.
*/
ProgressionQuestionElements.prototype._getElementWithId = function(id) { // eslint-disable-line no-underscore-dangle
    return this.find(element => element.id === id);
};

/**
    Return JSON representing this object.
    @method toJSON
    @return {Object} JSON representing this objectobject.
*/
ProgressionQuestionElements.prototype.toJSON = function() {
    return this.map(element => element.toJSON());
};

/**
    Return JSON representing this object.
    @method fromJSON
    @param {Object} json JSON representing this object.
    @return {void}
*/
ProgressionQuestionElements.prototype.fromJSON = function(json) {
    const utilities = require('ProgressionUtilities').create();

    this.push(...json.map(elementJSON => utilities.createElementByProperties(elementJSON)));
};
