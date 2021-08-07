'use strict';

/**
    Learning questions
    @module LearningQuestions
    @return {void}
*/
class LearningQuestions {

    /**
        Initialize the tool.
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The questions this tool will load. Defined in detail in README.md.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        const questions = options.questions;

        // Enumerate questions.
        questions.forEach((question, index) => {
            question.questionNumber = index + 1;
        });

        // Render the tool
        const html = this['<%= grunt.option("tool") %>'].questions({ questions });
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const $thisTool = $(`#${id}`);

        $thisTool.html(html + css);

        // Add event listener to each option in each multiple choice.
        questions.forEach((question, index) => {
            const $question = $thisTool.find('.multiple-choice-question').eq(index);
            const $choices = $question.find('.choices li');

            // If an option is clicked, then highlight that option.
            $choices.click(event => {
                const $choice = $(event.currentTarget);
                const userAnswer = $choice.text().trim();
                const isAnswerCorrect = question.answers.some(answer => answer === userAnswer);
                const userChoice = question.choices.find(choice => choice.name === userAnswer);
                const $explanation = $question.find('.explanation');
                const $message = $explanation.find('.explanation-message');

                $choices.find('md-radio-button').removeClass('md-checked');
                $choice.find('md-radio-button').addClass('md-checked');

                // Render explanation.
                $message.text(isAnswerCorrect ? 'Correct' : 'Incorrect')
                        .detach();
                $explanation.find('div').removeClass('correct incorrect')
                            .addClass(isAnswerCorrect ? 'correct' : 'incorrect')
                            .empty()
                            .append($message, ' - ', userChoice.explanation);
            });
        });
    }
}

module.exports = {
    create: function() {
        return new LearningQuestions();
    },
    dependencies: {},
};
