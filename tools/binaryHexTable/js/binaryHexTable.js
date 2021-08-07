function BinaryHexTable() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.decimalToBinary = [ '0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111' ];
        this.decimalToHexidecimal = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ];

        this.numberOfStepsToWin = 4;

        this.useMultipleParts = (options && options.useMultipleParts);

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['binaryHexTable']({
            id:                    this.id,
            numberOfBinaryNumbers: this.decimalToBinary.length
        });

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.numberOfStepsToWin,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.makeLevel(0);
                self.enableAllInputs();
                self.focusOnFirstInput();
            },
            reset: function() {
                self.resetTable();
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
                self.enableAllInputs();
                self.focusOnFirstInput();
            },
            isCorrect: function(currentQuestion) {
                self.disableAllInputs();

                var isAnswerCorrect = true;

                self.$answers.css('visibility', 'visible');

                var userAnswer = '';
                var expectedAnswer = '';
                if ((currentQuestion === 0) || (currentQuestion == 2)) { // check hexadecimal questions
                    self.$hexadecimals.each(function(index) {
                        var $userInput = $(this).find('input');
                        if ($userInput.length > 0) { // if the user had an input field to answer
                            if ($userInput.val().toLowerCase() !== self.decimalToHexidecimal[index].toLowerCase()) { // if user answer is not same as expected answer
                                isAnswerCorrect = false;
                                self.$answers.eq(index).addClass('highlight-hex');
                            }
                            userAnswer += $userInput.val().toLowerCase() + ',';
                            expectedAnswer += self.decimalToHexidecimal[index].toLowerCase() + ',';
                        }
                    });
                }
                else if ((currentQuestion === 1) || (currentQuestion == 3)) { // check binary questions
                    self.$binaries.each(function(index) {
                        var $userInput = $(this).find('input');
                        if ($userInput.length > 0) { // if the user had an input field to answer
                            if ($userInput.val().toLowerCase() !== self.decimalToBinary[index].toLowerCase()) { // if user answer is not same as expected answer
                                isAnswerCorrect = false;
                                self.$answers.eq(index).addClass('highlight-hex');
                            }
                            userAnswer += $userInput.val().toLowerCase() + ',';
                            expectedAnswer += self.decimalToBinary[index].toLowerCase() + ',';
                        }
                    });
                }

                var explanationMessage = '';
                if (isAnswerCorrect) {
                    explanationMessage = 'Correct.';
                }
                else {
                    explanationMessage = 'The corrected value is highlighted.';
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         userAnswer,
                    expectedAnswer:     expectedAnswer,
                    isCorrect:          isAnswerCorrect
                };
            }
        });

        this.$decimals = $('#' + this.id + ' .decimal');
        this.$binaries = $('#' + this.id + ' .binary');
        this.$hexadecimals = $('#' + this.id + ' .hexadecimal');
        this.$answers = $('#' + this.id + ' .answer');

        this.resetTable();
    };

    this.focusOnFirstInput = function() {
        $('#' + this.id).find('input').eq(0).focus();
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        $('#' + this.id + ' input').val('').attr('disabled', false);
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        $('#' + this.id + ' input').attr('disabled', true);
    };

    this.setAnswersToBinary = function() {
        var self = this;
        this.$answers.each(function(index) {
            $(this).text(self.decimalToBinary[index]);
        });
    };

    this.setAnswersToHexidecimal = function() {
        var self = this;
        this.$answers.each(function(index) {
            $(this).text(self.decimalToHexidecimal[index]);
        });
    };

    this.resetTable = function() {
        this.$decimals.css('visibility', 'visible');
        this.$decimals.each(function(index) {
            $(this).text(index);
        });

        var self = this;
        this.$binaries.each(function(index) {
            $(this).text(self.decimalToBinary[index]);
        });

        this.$hexadecimals.each(function(index) {
            $(this).text(self.decimalToHexidecimal[index]);
        });

        this.$answers.css('visibility', 'hidden');
        this.$answers.removeClass('highlight-hex');
        this.$answers.text('');
    };

    this.displayHexidecimalQuestion = function(userShouldAnswerQuestion) {
        this.$hexadecimals.each(function(index) {
            if (userShouldAnswerQuestion[index]) {
                $(this).html('<input type="text" maxlength="1"></input>');
            }
            else {
                $(this).text('');
            }
        });
    };

    this.displayBinaryQuestion = function(userShouldAnswerQuestion) {
        this.$binaries.each(function(index) {
            if (userShouldAnswerQuestion[index]) {
                $(this).html('<input type="text" maxlength="4"></input>');
            }
            else {
                $(this).text('');
            }
        });
    };

    /*
        If user presses enter in input, then invoke progressionTool's |check| function.
    */
    this.addListenersToInputs = function() {
        var self = this;
        $('#' + this.id).find('input').keypress(function(event) {
            if (event.keyCode === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });
    };

    this.makeLevel = function(currentQuestion) {
        // Randomly pick 4 questions for user to answer
        var userShouldAnswerQuestion = {};
        userShouldAnswerQuestion[this.utilities.pickNumberInRange(0, 3)] = true; // pick one question from questions 0...3
        userShouldAnswerQuestion[this.utilities.pickNumberInRange(4, 7)] = true; // pick one question from questions 4...7
        userShouldAnswerQuestion[this.utilities.pickNumberInRange(8, 11)] = true; // pick one question from questions 8...11
        userShouldAnswerQuestion[this.utilities.pickNumberInRange(12, 15)] = true; // pick one question from questions 12...15

        this.resetTable();

        if (currentQuestion === 0) {
            this.displayHexidecimalQuestion(userShouldAnswerQuestion);
            this.setAnswersToHexidecimal();
        }
        else if (currentQuestion === 1) {
            this.displayBinaryQuestion(userShouldAnswerQuestion);
            this.setAnswersToBinary();
        }
        else if (currentQuestion === 2) {
            this.displayHexidecimalQuestion(userShouldAnswerQuestion);
            this.$decimals.css('visibility', 'hidden');
            this.setAnswersToHexidecimal();
        }
        else if (currentQuestion === 3) {
            this.displayBinaryQuestion(userShouldAnswerQuestion);
            this.$decimals.css('visibility', 'hidden');
            this.setAnswersToBinary();
        }

        this.addListenersToInputs();
    };

    <%= grunt.file.read(hbs_output) %>
}

var binaryHexTableExport = {
    create: function() {
        return new BinaryHexTable();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = binaryHexTableExport;
