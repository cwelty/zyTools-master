/* exported Student */
/* global Resource, findByName */
'use strict';

/**
    Store a student's submissions across each content resource.
    @class Student
*/
class Student {

    /**
        @constructor
        @param {String} email The student's email.
        @param {String} firstName The student's first name.
        @param {String} lastName The student's last name.
    */
    constructor(email, firstName, lastName) {

        /**
            The student's email.
            @property email
            @type {String}
        */
        this.email = email;

        /**
            The student's first name.
            @property firstName
            @type {String}
        */
        this.firstName = firstName;

        /**
            The student's last name.
            @property lastName
            @type {String}
        */
        this.lastName = lastName;

        /**
            A unique label for the student. Ex: The student's full name.
            @property label
            @type {String}
            @default null
        */
        this.label = `${this.lastName}, ${this.firstName}`;

        /**
            Each resource the student submitted to.
            @property resources
            @type {Array} of {Resource}
            @default []
        */
        this.resources = [];
    }

    /**
        Add a submission by this student to the given content resource.
        @method addSubmission
        @param {String} questionId The name of this question. Ex: Midterm q1
        @param {String} activityNumber The number of the activity as shown in the zyBook. Ex: 7.2.1
        @param {Object} submissionData Data associated with the submission.
        @return {void}
    */
    addSubmission(questionId, activityNumber, submissionData) {
        let resource = findByName(this.resources, 'questionId', questionId);

        if (!resource) {
            resource = new Resource(questionId, activityNumber);
            this.resources.push(resource);
        }

        resource.addSubmission(submissionData);
    }

    /**
        Make the student's label unique.
        @method makeLabelUnique
        @return {void}
    */
    makeLabelUnique() {

        // Email is unique, so we can distinguish same-named students by their email, though instructors prefer last name, then first name only.
        this.label += `, ${this.email}`;
    }
}
