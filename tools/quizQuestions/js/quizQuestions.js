'use strict';

function QuizQuestions() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.questions = options.questions;
        this.utilities = require('utilities');

        var self = this;
        this.questions.forEach(function(question, index) {
            // Enumerate questions.
            question.questionNumber = index + 1;

            // Unescape &lt; in answers to <
            question.answers.forEach(function(answer, index) {
                question.answers[index] = answer.replace(/&lt;/g, '<');
            });

            // If the question's |question| is an array, then render the array into an HTML string.
            if (question.question instanceof Array) {
                question.question = question.question.map(function(part) {
                    if (typeof part === 'string') {
                        return self[self.name].string({
                            string: part
                        });
                    }
                    else if (typeof part === 'object') {
                        if (part.type === 'code') {
                            return self[self.name].code({
                                code: part.content
                            });
                        }
                    }
                }).join('');
            }
        });

        this.questions.forEach(question => {
            question.choices = question.choices.map(choice => {
                let newChoice = {
                    isCode: false,
                    content: choice,
                };

                if (typeof choice === 'object') {
                    newChoice = choice;
                }

                return newChoice;
            });
        });

        // Render the tool
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name].quizQuestions({
            id:        this.id,
            questions: this.questions
        });
        $('#' + this.id).html(css + html);

        // Cache regularly looked up elements
        var $thisTool = $('#' + this.id);
        this.$questionRows = $thisTool.find('.question-row');

        // Load previous answers.
        const answers = this.parentResource.getLocalStore(`answers${this.id}`);

        // Add event listener to each option in each multiple choice.
        this.questions.forEach(function(question, index) {
            var $questionRow = self.$questionRows.eq(index);
            var $options = $questionRow.find('.question-choice');

            // If an option is clicked, then highlight that option.
            $options.click(function() {
                $options.removeClass('button-selected').addClass('button-unselected');
                $(this).removeClass('button-unselected').addClass('button-selected');

                self.submit();
            });

            // If had previous answer for this question, then select the previous answer.
            if (answers && answers[index]) {
                const optionToSelect = $options.toArray().find(option => $(option).text().trim() === answers[index]);

                $(optionToSelect).addClass('button-selected');
            }
        });
    };

    /*
        Submit the student's answers.
        @method submit
        @return {void}
    */
    this.submit = function() {
        const answer = $(`#${this.id} .multiple-choice-answer-container`).toArray()
                                                                         .map(
                                                                            question => $(question).find('.button-selected').text().trim()
                                                                         );
        const expectedAnswer = this.questions.map(
            question => question.answers.map(
                qAnswer => qAnswer.trim()
            )
        );
        const numPoints = answer.filter(
            (userAnswer, index) => expectedAnswer[index].includes(userAnswer)
        ).length;

        this.parentResource.postEvent({
            answer: JSON.stringify(answer),
            part: 0,
            complete: false,
            metadata: {
                expectedAnswer,
                numPoints,
            },
        });

        this.parentResource.setLocalStore(`answers${this.id}`, answer);
    };

    <%= grunt.file.read(hbs_output) %>
}

module.exports = {
    create: function() {
        return new QuizQuestions();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
