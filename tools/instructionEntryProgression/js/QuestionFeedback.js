'use strict';

/* exported QuestionFeedback */

/**
    QuestionFeedback is an object to storing the correctness and explanation to a user's answer.
    @class QuestionFeedback
*/
class QuestionFeedback {

    /**
        @constructor
        @param {Boolean} isCorrect Whether the user's answer is correct.
        @param {String} explanation An explanation based on the user's particular answer.
    */
    constructor(isCorrect, explanation) {
        this.isCorrect = isCorrect;
        this.explanation = explanation;
    }
}
