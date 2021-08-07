/* exported Resource */
/* global Submission */
'use strict';

/**
    A collection of submissions to a particular content resource by a particular student.
    @class Resource
*/
class Resource {

    /**
        @constructor
        @param {String} questionId The name of this question. Ex: Midterm q1
        @param {String} activityNumber The number of the activity as shown in the zyBook. Ex: 7.2.1
    */
    constructor(questionId, activityNumber) {

        /**
            The name of this question. Ex: Midterm q1
            @property questionId
            @type {String}
        */
        this.questionId = questionId;

        /**
            The question number, like 1 or 12.
            @property questionNumber
            @type {Integer}
        */
        this.questionNumber = questionId.match(/(\d+)/)[0];

        /**
            The number of the activity as shown in the zyBook. Ex: 7.2.1
            @property activityNumber
            @type {String}
        */
        this.activityNumber = activityNumber;

        /**
            Each submission to this resource by the student.
            @property submissions
            @type {Array} of {Submission}
            @default []
        */
        this.submissions = [];
    }

    /**
        Add a submission to this resource.
        @method addSubmission
        @param {Object} submissionData Data associated with the submission.
        @return {void}
    */
    addSubmission(submissionData) {
        this.submissions.push(new Submission(submissionData));
    }
}
