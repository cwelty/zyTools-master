/* exported Submission */
'use strict';

/**
    One submission to a resource.
    @class Submission
*/
class Submission {

    /**
        @constructor
        @param {Object} timestamp The time/date of submission.
        @param {Object} studentAnswer The student's answer in the submission.
        @param {String} unparsedMetadata Stringified JSON containing: Expected answer, correctness of student's answer, and shown question.
        @param {String} url The full URL to the content resource.
    */
    constructor({ timestamp, studentAnswer, unparsedMetadata, url }) {
        const date = new Date(timestamp);

        /**
            The label shown to instructors for this submission.
            @property label
            @type {String}
        */
        this.label = date.toLocaleDateString(
            undefined, // eslint-disable-line no-undefined
            { hour: 'numeric', minute: 'numeric', second: 'numeric' }
        );

        /**
            The student's answer in the submission.
            @property studentAnswer
            @type {Object}
        */
        this.studentAnswer = JSON.parse(studentAnswer);

        /**
            The full URL to the content resource.
            @property url
            @type {String}
        */
        this.url = url;

        const metadata = JSON.parse(unparsedMetadata);
        const expectedAnswer = metadata.expectedAnswer;
        const wasCorrect = metadata.isCorrect;
        const question = metadata.question;

        /**
            The expected answer of the question.
            @property expectedAnswer
            @type {Object}
        */
        this.expectedAnswer = expectedAnswer;

        /**
            Whether the student's answer was correct.
            @property wasCorrect
            @type {Boolean}
        */
        this.wasCorrect = wasCorrect;

        /**
            The particular question given to the student.
            @property question
            @type {Object}
        */
        this.question = question;
    }
}
