'use strict';

/* exported QuestionCache */

/**
    Make a question that hasn't been made before by storing |_alreadyMadeQuestions|.
    @class QuestionCache
*/
class QuestionCache {

    /**
        Store passed in values.
        @constructor
        @param {Object} questionFactory The question factory to make new questions.
        @param {Function} questionFactory.make The method to create a new question.
        @param {Number} maxQuestionsCached The max number of questions to cache.
    */
    constructor(questionFactory, maxQuestionsCached) {
        this._questionFactory = questionFactory;
        this._maxQuestionsCached = maxQuestionsCached;
        this._alreadyMadeQuestions = [];
    }

    /**
        Return a new question for the given level.
        @method makeQuestion
        @param {Number} currentLevelIndex The current level.
        @return {Object} The new question.
    */
    makeQuestion(currentLevelIndex) {
        const maxNumberOfTries = 20;
        let numberOfTries = 0;
        let newQuestion = null;
        let newQuestionAsString = null;

        if (this._alreadyMadeQuestions.length && (this._alreadyMadeQuestions[0].levelIndex !== currentLevelIndex)) {
            this._alreadyMadeQuestions.length = 0;
        }

        do {
            newQuestion = this._questionFactory.make(currentLevelIndex);
            newQuestionAsString = JSON.stringify(newQuestion);
            numberOfTries++;
        } while (this._cacheHit(newQuestionAsString) && (numberOfTries < maxNumberOfTries));

        // If max tries reached, then use the oldest cached question.
        if (numberOfTries === maxNumberOfTries) {
            const question = this._alreadyMadeQuestions.shift();

            newQuestion = question.raw;
            newQuestionAsString = question.asString;
        }

        // Push the question to the back of the cache.
        this._alreadyMadeQuestions.push({
            asString: newQuestionAsString,
            levelIndex: currentLevelIndex,
            raw: newQuestion,
        });

        if (this._alreadyMadeQuestions.length > this._maxQuestionsCached) {

            // Remove oldest question.
            this._alreadyMadeQuestions.shift();
        }

        return newQuestion;
    }

    /**
        Return whether there was a cache hit.
        @method _cacheHit
        @private
        @param {String} newQuestionAsString The new question to add.
        @return {Boolean} Whether a cache hit occurred.
    */
    _cacheHit(newQuestionAsString) {
        const cacheLookup = this._alreadyMadeQuestions.find(question => question.asString === newQuestionAsString);

        return Boolean(cacheLookup);
    }
}
