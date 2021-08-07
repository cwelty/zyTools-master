function SingleInputQuestionProgressionTool() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        var html = this[this.name]['singleInputQuestionProgressionTool']();
        var css = options.css;
        this.displayTemplate = options.displayTemplate;
        var latexChanged = options.latexChanged || false;
        var questionFactory = options.questionFactory;

        this.questionCache = this.utilities.getQuestionCache(questionFactory, 5);

        /*
            |currentQuestion| is a Question, which contains an expected answer, explanationTemplate, and a display.
            |currentQuestion| is written in |generateProblem| and read in |isCorrect|.
        */
        this.currentQuestion = null;

        // If a user's answer was invalid, then let the user try again.
        this.userAnswerWasInvalid = false;

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         questionFactory.numberOfQuestions,
            useMultipleParts: true,
            start: function() {
                self.enableInput();
            },
            reset: function() {
                self.generateProblem(0);
                self.disableInput();
            },
            next: function(currentQuestion) {
                if (!self.userAnswerWasInvalid) {
                    self.generateProblem(currentQuestion);
                }
                else {
                    self.userAnswerWasInvalid = false;
                }

                self.enableInput();
            },
            isCorrect: function() {
                const userAnswer = self.utilities.removeWhitespace(self.$input.val());
                let isAnswerCorrect = false;
                let explanationMessage = self.currentQuestion.validAnswerExplanation;

                if (self.currentQuestion.isInputFormatValid(userAnswer)) {
                    isAnswerCorrect = self.currentQuestion.isCorrect(userAnswer);
                    explanationMessage = self.currentQuestion.getExplanation(userAnswer);
                }
                else {
                    self.userAnswerWasInvalid = true;
                }

                self.disableInput();

                return {
                    userAnswer: JSON.stringify(userAnswer),
                    expectedAnswer: JSON.stringify(self.currentQuestion.expectedAnswer),
                    isCorrect: isAnswerCorrect,
                    explanationMessage,
                    latexChanged,
                    callbackFunction: function() {
                        self.currentQuestion.explanationPostProcess();
                    },
                    metadata: self.currentQuestion.getMetadata(),
                };
            }
        });

        this.$questionContainer = $('#' + this.id + ' .question-container');
        this.generateProblem(0);
        this.disableInput();
    }

    // Disable the input.
    this.disableInput = function() {
        this.$input.prop('disabled', true);
    }

    // Enable the input, clear the input's value, and focus on the input.
    this.enableInput = function() {
        this.$input.prop('disabled', false).focus();
    };

    /*
        Generate an integer properties question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    this.generateProblem = function(currentQuestionNumber) {
        this.currentQuestion = this.questionCache.makeQuestion(currentQuestionNumber);

        var currentQuestionDisplay = this.displayTemplate({
            question: this.currentQuestion
        });
        this.$questionContainer.html(currentQuestionDisplay);

        // Recache |$input| since |$questionContainer| was just overwritten.
        this.$input = this.$questionContainer.find('input');
        var self = this;
        this.$input.keypress(function(event) {
            if (event.which === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });

        this.parentResource.setSolution(`${this.currentQuestion.expectedAnswer}`, 'text', true);
        this.parentResource.latexChanged();

        this.currentQuestion.generateProblemPostProcess();
    }

    <%= grunt.file.read(hbs_output) %>
}

var singleInputQuestionProgressionToolExport = {
    create: function() {
        return new SingleInputQuestionProgressionTool();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    getNewQuestionFactory: function() {
        return new QuestionFactory();
    },
    getNewQuestion: function() {
        return new Question();
    }
}
module.exports = singleInputQuestionProgressionToolExport;
