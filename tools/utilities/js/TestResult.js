/* exported TestResult */
/* global Ember */
'use strict';

/**
    The result of a comparison test between user's answer and the expected answer.
    @class TestResult
*/
class TestResult {

    /**
        Initialize the result of the tests.
        @constructor
        @param {String} userAnswer The user's answer.
        @param {String} expectedAnswer The expected answer.
        @param {Boolean} isCorrect Whether the user's answer matches the expected answer.
        @param {Object} [moreData={}] More data to store with the test result.
    */
    constructor(userAnswer, expectedAnswer, isCorrect, moreData = {}) {

        /**
            The user's answer.
            @property userAnswer
            @type {String}
        */
        this.userAnswer = userAnswer;

        /**
            The expected answer.
            @property expectedAnswer
            @type {String}
        */
        this.expectedAnswer = expectedAnswer;

        /**
            Whether the user's answer matches the expected answer.
            @property isCorrect
            @type {Boolean}
        */
        this.isCorrect = isCorrect;

        /**
            More data to store with the test result.
            @property moreData
            @type {Object}
        */
        this.moreData = moreData;

        /**
            The user answer portion of the HTML diff between the user's answer and expected answer.
            @property userAnswerHTML
            @type {String}
            @default ''
        */
        this.userAnswerHTML = '';

        /**
            The expected answer portion of the HTML diff between the user's answer and expected answer.
            @property expectedAnswerHTML
            @type {String}
            @default ''
        */
        this.expectedAnswerHTML = '';

        /**
            A hint message to show.
            @property hintMessage
            @type {String}
            @default ''
        */
        this.hintMessage = '';

        /**
            Whether to show a special character legend.
            @property showSpecialCharacterLegend
            @type {Boolean}
            @default false
        */
        this.showSpecialCharacterLegend = false;
    }

    /**
        Build the output difference data.
        @method buildOutputDifference
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {Promise} A promise to build the output difference data.
    */
    buildOutputDifference(parentResource) {
        return new Ember.RSVP.Promise(resolve => {
            parentResource.buildStringDifferenceObject(this.expectedAnswer, this.userAnswer).then(stringDifferenceObject => {
                this.userAnswerHTML = stringDifferenceObject.userAnswerHTML;
                this.expectedAnswerHTML = stringDifferenceObject.expectedAnswerHTML;
                this.hintMessage = stringDifferenceObject.hintMessage;
                this.showSpecialCharacterLegend = stringDifferenceObject.isReplacementADifference ||
                                                  stringDifferenceObject.isWhitespaceADifference;
                resolve();
            });
        });
    }
}
