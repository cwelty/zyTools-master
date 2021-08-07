function SimpleLawOfExp() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['simpleLawOfExp']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         7,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.directFocus(0);
            },
            reset: function() {
                self.hideAllExpressions();
                self.$addTerms.show();
                self.$exponentAnswer.show();
                self.disableAllInputs();
                $('#' + self.id + ' input').val('');
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
                self.directFocus(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                if (currentQuestion === 0) {
                    var firstExponent = parseInt(self.$addTerms.find('.first-number-to-randomize').text());
                    var secondExponent = parseInt(self.$addTerms.find('.second-number-to-randomize').text());
                    var correctAnswer = String(firstExponent + secondExponent);
                    isAnswerCorrect = self.$exponentInputAnswer.val() === correctAnswer;
                    self.progressionTool.explanationMessage = 'Add the exponents.<br/>' + String(firstExponent) + ' + ' + String(secondExponent) + ' = ' + correctAnswer;
                    self.progressionTool.userAnswer = self.$exponentInputAnswer.val();
                    self.progressionTool.expectedAnswer = correctAnswer;
                } else if ((currentQuestion === 1) || (currentQuestion === 2)) {
                    var firstExponent = parseInt(self.$subtractTerms.find('.first-number-to-randomize').text());
                    var secondExponent = parseInt(self.$subtractTerms.find('.second-number-to-randomize').text());
                    var correctAnswer = String(firstExponent - secondExponent);
                    isAnswerCorrect = self.$exponentInputAnswer.val() === correctAnswer;
                    self.progressionTool.explanationMessage = 'Subtract the denominator exponent from the numerator exponent.<br/>'
                                                            + String(firstExponent) + ' - ' + (secondExponent < 0 ? '(' : '')
                                                            + String(secondExponent) + (secondExponent < 0 ? ')' : '') + ' = '
                                                            + correctAnswer;
                    self.progressionTool.userAnswer = self.$exponentInputAnswer.val();
                    self.progressionTool.expectedAnswer = correctAnswer;
                } else if (currentQuestion === 3) {
                    var firstExponent = parseInt(self.$multipleTerms.find('.first-number-to-randomize').text());
                    var secondExponent = parseInt(self.$multipleTerms.find('.second-number-to-randomize').text());
                    var correctAnswer = String(firstExponent * secondExponent);
                    isAnswerCorrect = self.$exponentInputAnswer.val() === correctAnswer;
                    self.progressionTool.explanationMessage = 'Multiply the exponents.<br/>' + String(firstExponent) + ' * ' + String(secondExponent) + ' = ' + correctAnswer;
                    self.progressionTool.userAnswer = self.$exponentInputAnswer.val();
                    self.progressionTool.expectedAnswer = correctAnswer;
                } else if (currentQuestion === 4) {
                    var firstExponent = parseInt(self.$termsAddToZero.find('.first-number-to-randomize').text());
                    var secondExponent = parseInt(self.$termsAddToZero.find('.second-number-to-randomize').text());
                    var correctAnswer = '1';
                    isAnswerCorrect = self.$constantInputAnswer.val() === correctAnswer;
                    self.progressionTool.explanationMessage = 'Add the exponents.<br/> x<sup>' + String(firstExponent) + ' + ' + String(secondExponent) + '</sup> = x<sup>0</sup> = 1.';
                    if (self.$constantInputAnswer.val() === '0') {
                        self.progressionTool.explanationMessage += '<br/>Remember, a number raised to the 0 is 1.';
                    }
                    self.progressionTool.userAnswer = self.$constantInputAnswer.val();
                    self.progressionTool.expectedAnswer = correctAnswer;
                } else if (currentQuestion === 5) {
                    var firstConstant = parseInt(self.$combineLikeTermsConstantOnly.find('.first-number-to-randomize').text());
                    var secondConstant = parseInt(self.$combineLikeTermsConstantOnly.find('.second-number-to-randomize').text());
                    var correctConstantAnswer = String(firstConstant + secondConstant);
                    isAnswerCorrect = self.$constantInputWithoutExponent.val() === correctConstantAnswer;
                    self.progressionTool.explanationMessage = 'Like terms (same base and exponents) add.<br/>' + String(firstConstant) + ' + ' + String(secondConstant) + ' = ' + correctConstantAnswer;
                    self.progressionTool.userAnswer = self.$constantInputWithoutExponent.val();
                    self.progressionTool.expectedAnswer = correctConstantAnswer;
                } else if (currentQuestion === 6) {
                    var firstConstant = parseInt(self.$combineLikeTermsConstantAndExponent.find('.first-number-to-randomize').text());
                    var secondConstant = parseInt(self.$combineLikeTermsConstantAndExponent.find('.second-number-to-randomize').text());
                    var correctConstantAnswer = String(firstConstant + secondConstant);
                    var correctExponentAnswer = '3';
                    isAnswerCorrect = (self.$constantInputWithExponent.val() === correctConstantAnswer) && ($('#exponent-input-from-exponent-constant-answer-' + self.id).val() === correctExponentAnswer);
                    self.progressionTool.explanationMessage = 'Like terms (same base and exponents) add.<br/>' + String(firstConstant) + ' + ' + String(secondConstant) + ' = ' + correctConstantAnswer;
                    self.progressionTool.explanationMessage += `<br/>Like exponents stay same.<br/>${correctExponentAnswer}`;
                    self.progressionTool.userAnswer = self.$constantInputWithExponent.val() + ',' + $('#exponent-input-from-exponent-constant-answer-' + self.id).val();
                    self.progressionTool.expectedAnswer = correctConstantAnswer + ',' + correctExponentAnswer;
                }

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        this.$addTerms = $('#' + this.id + ' .add-terms');
        this.$subtractTerms = $('#' + this.id + ' .subtract-terms');
        this.$multipleTerms = $('#' + this.id + ' .multiple-terms');
        this.$termsAddToZero = $('#' + this.id + ' .terms-add-to-zero');
        this.$combineLikeTermsConstantOnly = $('#' + this.id + ' .combine-like-terms-only-constant');
        this.$combineLikeTermsConstantAndExponent = $('#' + this.id + ' .combine-like-terms-constant-and-exponent');

        this.$exponentAnswer = $('#' + this.id + ' .exponent-answer');
        this.$constantAnswer = $('#' + this.id + ' .constant-answer');
        this.$exponentConstantAnswer = $('#' + this.id + ' .exponent-constant-answer');
        this.$constantAnswerWithTerm = $('#' + this.id + ' .constant-answer-with-term');

        this.$exponentInputAnswer = $('#exponent-input-' + this.id);
        this.$constantInputAnswer = $('#constant-input-' + this.id);
        this.$constantInputWithoutExponent = $('#constant-input-from-constant-only-' + this.id);
        this.$constantInputWithExponent = $('#constant-input-from-exponent-constant-answer-' + this.id);

        // Initialize equation
        this.hideAllExpressions();
        this.makeLevel(0);
        this.disableAllInputs();

        $('#' + this.id + ' input').keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });
    };

    // Hide the expressions of each question
    this.hideAllExpressions = function() {
        // Expressions on left-hand side of equation
        this.$addTerms.hide();
        this.$subtractTerms.hide();
        this.$multipleTerms.hide();
        this.$termsAddToZero.hide();
        this.$combineLikeTermsConstantOnly.hide();
        this.$combineLikeTermsConstantAndExponent.hide();

        // Expressions on right-hand side of equation
        this.$exponentAnswer.hide();
        this.$constantAnswer.hide();
        this.$exponentConstantAnswer.hide();
        this.$constantAnswerWithTerm.hide();
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        $('#' + this.id + ' input').val('').attr('disabled', false);
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        $('#' + this.id + ' input').attr('disabled', true);
    };

    // Direct focus for the user depending on the |currentQuestionNumber|
    this.directFocus = function(currentQuestionNumber) {
        switch(currentQuestionNumber) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.$exponentInputAnswer.focus();
                break;
            case 4:
                this.$constantInputAnswer.focus();
                break;
            case 5:
                this.$constantInputWithoutExponent.focus();
                break;
            case 6:
                this.$constantInputWithExponent.focus();
                break;
            default:
                break;
        }
    };

    // Display a randomized equation (1 left-hand side expression and 1 right-hand side expression) given the currentQuestionNumber
    // currentQuestionNumber is an integer
    this.makeLevel = function(currentQuestionNumber) {
        this.hideAllExpressions();
        this.enableAllInputs();

        var randomNumber1 = Math.floor(Math.random() * 8) + 1; // Random number between 1 and 9
        var randomNumber2 = Math.floor(Math.random() * 8) + 1; // Random number between 1 and 9

        if (currentQuestionNumber === 0) {
            this.$addTerms.show();
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(randomNumber2);
            this.$exponentAnswer.show();
        } else if (currentQuestionNumber === 1) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(randomNumber2);
            this.$subtractTerms.show();
            this.$exponentAnswer.show();
        } else if (currentQuestionNumber === 2) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(-1 * randomNumber2);
            this.$subtractTerms.show();
            this.$exponentAnswer.show();
        } else if (currentQuestionNumber === 3) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(randomNumber2);
            this.$multipleTerms.show();
            this.$exponentAnswer.show();
        } else if (currentQuestionNumber === 4) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(-1 * randomNumber1);
            this.$termsAddToZero.show();
            this.$constantAnswer.show();
        } else if (currentQuestionNumber === 5) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(randomNumber2);
            this.$combineLikeTermsConstantOnly.show();
            this.$constantAnswerWithTerm.show();
        } else if (currentQuestionNumber === 6) {
            $('#' + this.id + ' .first-number-to-randomize').text(randomNumber1);
            $('#' + this.id + ' .second-number-to-randomize').text(randomNumber2);
            this.$combineLikeTermsConstantAndExponent.show();
            this.$exponentConstantAnswer.show();
        }
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var simpleLawOfExpExport = {
    create: function() {
        return new SimpleLawOfExp();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = simpleLawOfExpExport;
