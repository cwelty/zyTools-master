/* exported ProgressionPlayerExamSubmissionViewer */
/* global Student, Papa, findByName */
'use strict';

/**
    View submissions to exam mode of ProgressionPlayer.
    @module ProgressionPlayerExamSubmissionViewer
    @return {void}
*/
class ProgressionPlayerExamSubmissionViewer {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned to this instance of the module.
            @property id
            @type {Number}
            @default null
        */
        this.id = null;

        /**
            Dictionary of templates for this module.
            @property templates
            @type {Object}
        */
        this.templates = this['<%= grunt.option("tool") %>'];

        /**
            Reference to the parent of this module.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The order of the categories that students will go through.
            @property categoryOrder
            @type {Array} of {String}
        */
        this.categoryOrder = [
            'students-container', 'question-ids-container', 'submissions-container', 'question-container',
        ];
    }

    /**
        Initialize the viewer.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.id = id;
        this.parentResource = parentResource;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this.templates.viewer({ id });

        $(`#${id}`).html(css + html);

        this.hideAllElements();

        this.getElementById('file').change(event => {
            this.hideAllElements();

            const file = event.target.files[0];
            const reader = new FileReader();

            reader.readAsText(file);
            reader.onload = () => {
                try {
                    const students = this.makeStudentsFromFile(reader.result);

                    this.renderStudents(students);
                }
                catch (error) {
                    this.getElementById('error').show()
                                                .find('output')
                                                .text(error);
                }
            };
        });
    }

    /**
        Hide all the elements.
        @method hideAllElements
        @return {void}
    */
    hideAllElements() {
        this.getElementById('error').hide();
        this.categoryOrder.forEach(id => this.getElementById(id).hide());
    }

    /**
        Make the students from file contents.
        @method makeStudentsFromFile
        @param {String} content The content of the file.
        @return {Array} of {Student} List of students.
    */
    makeStudentsFromFile(content) {
        const unparsedData = content.trim();
        const data = Papa.parse(unparsedData).data;

        // Remove headers.
        const headers = data.shift();

        // Verify headers match expected headers.
        const expectedHeaders = [
            'Last Name', 'First Name', 'Email', 'Timestamp', 'Question ID', 'Activity Number', 'Submission', 'Question', 'URL',
        ];

        headers.forEach((header, index) => {
            const expectedHeader = expectedHeaders[index];

            if (header !== expectedHeader) {
                throw Error(`Found header "${header}" but expected "${expectedHeader}"`);
            }
        });

        // Build students.
        const students = [];

        data.forEach(row => {
            const email = row[2];
            let student = findByName(students, 'email', email);
            const lastName = row[0];
            const firstName = row[1];

            if (!student) {
                student = new Student(email, firstName, lastName);
                students.push(student);
            }

            const timestamp = row[3];
            const questionId = row[4];
            const activityNumber = row[5];
            const studentAnswer = row[6];
            const unparsedMetadata = row[7];
            const url = row[8];

            student.addSubmission(questionId, activityNumber, { timestamp, studentAnswer, unparsedMetadata, url });
        });

        // Make sure each student's label is unique.
        const studentsGroupedByLabel = students.reduce((groups, student) => {
            const group = groups[student.label] || [];

            // Make sure group is tracked.
            groups[student.label] = group;

            // Add student to group.
            group.push(student);

            return groups;
        }, {});
        const duplicateStudents = Object.values(studentsGroupedByLabel)
                                        .filter(group => group.length > 1)
                                        .flat();

        duplicateStudents.forEach(student => student.makeLabelUnique());

        return students;
    }

    /**
        Render the students.
        @method renderStudents
        @param {Array} students Array of {Student}. The list of students to render.
        @return {void}
    */
    renderStudents(students) {
        const items = students.map(student => student.label)
                              .sort();

        this.renderItems({
            containerId: 'students-container',
            items,
            clickHandler: label => {
                const student = findByName(students, 'label', label);

                this.renderResources(student.resources);
            },
        });
    }

    /**
        Render the given resources.
        @method renderResources
        @param {Array} resources Array of {Resource}. The resources to render.
        @return {void}
    */
    renderResources(resources) {
        const items = resources.map(resource => resource.questionId)
                               .sort((first, second) => first.questionNumber - second.questionNumber);

        this.renderItems({
            containerId: 'question-ids-container',
            items,
            clickHandler: questionId => {
                const resource = findByName(resources, 'questionId', questionId);

                this.renderSubmissions(resource.submissions);
            },
        });
    }

    /**
        Render the given submissions.
        @method renderSubmissions
        @param {Array} submissions Array of {Submission}. The submissions to render.
        @return {void}
    */
    renderSubmissions(submissions) {
        const items = submissions.map(submission => submission.label)
                                 .sort((first, second) => new Date(second) - new Date(first));

        this.renderItems({
            containerId: 'submissions-container',
            items,
            clickHandler: label => {
                const submission = findByName(submissions, 'label', label);

                this.renderSubmission(submission);
            },
            selectFirstItem: true,
        });
    }

    /**
        Render the given submission.
        @method renderSubmission
        @param {Submission} submission The submission to render.
        @return {void}
    */
    renderSubmission(submission) {
        this.getElementById('question-container').show();
        this.getElementById('response-correctness').text(submission.wasCorrect ? 'correct' : 'wrong');

        const id = `player-${this.id}`;
        const options = {
            showExamResponse: true,
            question: submission.question,
            response: submission.studentAnswer,
        };

        require('ProgressionPlayer').create().init(id, this.parentResource, options);
    }

    /**
        Render the given items.
        @method renderItems
        @param {String} containerId The id for the container of the items.
        @param {Array} items Array of {String}. The items to render.
        @param {Function} clickHandler A function to handle the selection of an item.
        @param {Boolean} selectFirstItem Whether to select the first item.
        @return {void}
    */
    renderItems({ containerId, items, clickHandler, selectFirstItem = false }) {

        // Hide the categories that appear after the current category.
        const categoryIndex = this.categoryOrder.indexOf(containerId);
        const categoriesToHide = this.categoryOrder.slice(categoryIndex + 1);

        categoriesToHide.forEach(id => this.getElementById(id).hide());

        // Show the container id.
        const $container = this.getElementById(containerId);

        $container.show();

        // Add the items to the webpage.
        const $itemsContainer = $container.find('.items');
        const html = this.templates.items({ items });

        $itemsContainer.html(html);

        // Filter out items that don't match the search term.
        const $search = $container.find('input');
        const $items = $itemsContainer.find('.item');
        const $noMatch = $container.find('.no-match');

        this.applySearch($search, $items, $noMatch);

        // Listen for a click on an item.
        $items.click(event => {
            $items.removeClass('highlight-item');

            const $item = $(event.target);

            $item.addClass('highlight-item');

            const item = $item.text();

            clickHandler(item);
        });

        // Handle entry into the search.
        $search.keyup(() => {
            this.applySearch($search, $items, $noMatch);
        });

        // If only 1 item, then auto-click it.
        if (selectFirstItem && items.length) {
            $items.eq(0).trigger('click');
        }
    }

    /**
        Show the items that match the search.
        @method applySearch
        @param {Object} $search The search field.
        @param {Object} $items The items to match to.
        @param {Object} $noMatch Message for when no items match.
        @return {void}
    */
    applySearch($search, $items, $noMatch) {
        $noMatch.hide();

        const search = ($search.val() || '').toLowerCase();

        if (search) {

            // Show only the items that match the search.
            $items.hide();
            $items.filter(
                (index, item) => $(item).text()
                                        .toLowerCase()
                                        .includes(search)
            ).show();

            // Show whichever is highlighted.
            $items.filter('.highlight-item').show();

            // If no items match, then say so.
            if (!$items.is(':visible')) {
                $noMatch.show();
            }
        }
        else {
            $items.show();
        }
    }

    /**
        Return the element by id.
        @method getElementById
        @param {String} name The name of the element to get.
        @return {Object} The element as a jQuery object.
    */
    getElementById(name) {
        return $(`#${name}-${this.id}`);
    }
}

module.exports = {
    create: function() {
        return new ProgressionPlayerExamSubmissionViewer();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
