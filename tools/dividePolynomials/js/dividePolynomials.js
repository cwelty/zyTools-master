function DividePolynomials() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.invalidInputEnteredGiveAnotherTry = false;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['dividePolynomials']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         6,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.$quotient.focus();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableAllInputs();
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                } else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.enableAllInputs();
                }
                self.$quotient.focus();
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                var divisorXCoefficientValue = self.extractCoefficient(self.$divisorXCoefficient);
                var divisorXExponentValue = self.extractCoefficient(self.$divisorXExponent);
                var divisorConstantValue = self.extractCoefficient(self.$divisorConstant);
                var dividendXCoefficientValue = self.extractCoefficient(self.$dividendXCoefficient);
                var dividendXExponentValue = self.extractCoefficient(self.$dividendXExponent);
                var dividendConstantValue = self.extractCoefficient(self.$dividendConstant);

                self.progressionTool.userAnswer = '';
                self.progressionTool.expectedAnswer = '';

                if ((currentQuestion >= 0) && (currentQuestion <= 3)) {
                    var userEnteredQuotientValue = parseInt(self.$quotient.val());

                    // If the user entered quotient isn't a number, then prompt user to try again
                    if (isNaN(userEnteredQuotientValue)) {
                        self.progressionTool.explanationMessage = 'Please input a number.';
                        self.invalidInputEnteredGiveAnotherTry = true;
                    } else {
                        var expectedQuotientValue = dividendXCoefficientValue / divisorXCoefficientValue;

                        var subtractionXCoefficientValue = divisorXCoefficientValue * userEnteredQuotientValue;
                        var subtractionXExponentValue = divisorXExponentValue;
                        var subtractionConstantValue = divisorConstantValue * userEnteredQuotientValue;
                        self.$subtractionXCoefficient.text(subtractionXCoefficientValue === 1 ? '' : subtractionXCoefficientValue);
                        self.$subtractionXExponent.text(subtractionXExponentValue === 1 ? '' : subtractionXExponentValue);
                        self.$subtractionConstant.text(subtractionConstantValue === 1 ? '' : subtractionConstantValue);

                        var remainderXCoefficientValue = dividendXCoefficientValue - subtractionXCoefficientValue;
                        var remainderXExponentValue = subtractionXExponentValue;
                        var remainderConstantValue = dividendConstantValue - subtractionConstantValue;
                        self.$remainderXCoefficient.text(remainderXCoefficientValue);
                        self.$remainderXExponent.text(remainderXExponentValue);
                        self.$remainderConstant.text(remainderConstantValue);
                        // if the x-term coefficient is 0, then don't show the x-term
                        if (remainderXCoefficientValue === 0) {
                            // x-term
                            self.$remainderPolynomial.children().eq(1).css('visibility', 'hidden');
                            // plus-sign
                            self.$remainderPolynomial.children().eq(2).css('visibility', 'hidden');
                        }

                        self.$subtractonSymbol.show();
                        self.$subtractionPolynomial.show();
                        self.$remainderPolynomial.show();

                        self.progressionTool.explanationMessage = 'Divide first terms: ' + dividendXCoefficientValue + 'x<sup>' + dividendXExponentValue + '</sup> / ' + divisorXCoefficientValue + 'x<sup>' + divisorXExponentValue + '</sup> = ' + expectedQuotientValue;

                        self.progressionTool.userAnswer = userEnteredQuotientValue;
                        self.progressionTool.expectedAnswer = expectedQuotientValue;

                        if (userEnteredQuotientValue === expectedQuotientValue) {
                            isAnswerCorrect = true;
                        }
                    }
                } else if (currentQuestion === 4) {
                    var userEnteredQuotientValue = self.$quotient.val();
                    // user can enter a negative or positve number with 0 or more digits
                    // the number may be multiplied by an x-term
                    var isUserEnteredQuotientValid = (/^-?\d*x?$/).test(userEnteredQuotientValue);

                    if (!isUserEnteredQuotientValid || (userEnteredQuotientValue === '')) {
                        self.progressionTool.explanationMessage = 'Please input a number, or a number followed by x. Ex: -7x.';
                        self.invalidInputEnteredGiveAnotherTry = true;
                    } else {
                        // .match() gets the first number and stores in an array
                        dividendConstantValue = self.$dividendConstant.text().match(/^-?\d*/)[0];

                        // .match() gets the first number and stores in an array
                        var userEnteredQuotientValueCoefficient = userEnteredQuotientValue.match(/^-?\d*/)[0];
                        // if the coefficient is empty, then implicity the coefficient is 1
                        // else if the coefficient is just a negative symbol, then implicitly the coefficient is -1
                        // else use the userEnteredQuotientValueCoefficient
                        if (userEnteredQuotientValueCoefficient === '') {
                            userEnteredQuotientValueCoefficient = 1;
                        } else if (userEnteredQuotientValueCoefficient === '-') {
                            userEnteredQuotientValueCoefficient = -1;
                        } else {
                            userEnteredQuotientValueCoefficient = parseInt(userEnteredQuotientValueCoefficient);
                        }

                        // userEnteredQuotientValue has an x
                        var userEnteredQuotientHasX = /x/.test(userEnteredQuotientValue);

                        var expectedQuotientCoefficientValue = dividendXCoefficientValue / divisorXCoefficientValue;

                        var subtractionXCoefficientValue = divisorXCoefficientValue * userEnteredQuotientValueCoefficient;
                        var subtractionXExponentValue = divisorXExponentValue;
                        var subtractionConstantValue = divisorConstantValue * userEnteredQuotientValueCoefficient;
                        // if the userEnteredQuotient has an x-term, then increase subtraction polynomial x-term exponent by 1
                        if (userEnteredQuotientHasX) {
                            subtractionXExponentValue += 1;
                        }
                        self.$subtractionXCoefficient.text(subtractionXCoefficientValue);
                        self.$subtractionXExponent.text(subtractionXExponentValue);
                        self.$subtractionConstant.text(subtractionConstantValue);
                        // if the userEnteredQuotient has an x-term, then add x-term to subtraction polynomial constant
                        if (userEnteredQuotientHasX) {
                            self.$subtractionConstant.text(self.$subtractionConstant.text() + 'x');
                        }

                        var remainderXCoefficientValue;
                        var remainderXExponentValue;
                        var remainderConstantValue;
                        // If dividend and subtraction exponents do not match, then highlight the mismatching exponents
                        if (dividendXExponentValue !== subtractionXExponentValue) {
                            self.$subtractionXExponent.addClass('wrong');
                            self.$dividendXExponent.addClass('wrong');
                            self.progressionTool.explanationMessage = 'The bold red exponents should match.<br/>';
                        } else {
                            remainderXCoefficientValue = dividendXCoefficientValue - subtractionXCoefficientValue;
                            remainderXExponentValue = subtractionXExponentValue;
                            remainderConstantValue = (dividendConstantValue - subtractionConstantValue) + 'x';
                            self.$remainderXCoefficient.text(remainderXCoefficientValue);
                            self.$remainderXExponent.text(remainderXExponentValue);
                            self.$remainderConstant.text(remainderConstantValue);
                            self.progressionTool.explanationMessage = '';
                            if (remainderXCoefficientValue === 0) {
                                // x-term
                                self.$remainderPolynomial.children().eq(1).css('visibility', 'hidden');
                                // plus-sign
                                self.$remainderPolynomial.children().eq(2).css('visibility', 'hidden');
                            }
                            self.$remainderPolynomial.show();
                        }

                        self.$subtractonSymbol.show();
                        self.$subtractionPolynomial.show();

                        self.progressionTool.explanationMessage += 'Divide first terms: ' + dividendXCoefficientValue + 'x<sup>' + dividendXExponentValue + '</sup> / ' + divisorXCoefficientValue + 'x<sup>' + divisorXExponentValue + '</sup> = ' + expectedQuotientCoefficientValue + 'x';

                        self.progressionTool.userAnswer = userEnteredQuotientValue;
                        self.progressionTool.expectedAnswer = expectedQuotientCoefficientValue + 'x';

                        if (userEnteredQuotientValue === (expectedQuotientCoefficientValue + 'x')) {
                            isAnswerCorrect = true;
                        }
                    }
                } else if (currentQuestion === 5) {
                    var userEnteredQuotientValue = self.$quotient.val();
                    // user can enter a negative or positve number with 0 or more digits
                    // the number may be multiplied by an x-term
                    // the x-term may have an exponent
                    var isUserEnteredQuotientValid = (/^-?\d*(x(\^-?\d+)?)?$/).test(userEnteredQuotientValue);

                    if (!isUserEnteredQuotientValid || (userEnteredQuotientValue === '')) {
                        self.progressionTool.explanationMessage = 'Please input a number, a number followed by x, or an x with an exponent. Ex: -3x^3.';
                        self.invalidInputEnteredGiveAnotherTry = true;
                    } else {
                        // .match() gets the first number and stores in an array
                        dividendConstantValue = self.$dividendConstant.text().match(/^-?\d*/)[0];

                        // Get user-entered coefficient value
                        // .match() gets the first number and stores in an array
                        var userEnteredQuotientValueCoefficient = userEnteredQuotientValue.match(/^-?\d*/)[0];
                        // if no coefficient is given, then implicitly the coefficient is 1
                        // else if the coefficient is just a negative symbol, then implicitly the coefficient is -1
                        // else use the userEnteredQuotientValueCoefficient
                        if (userEnteredQuotientValueCoefficient === '') {
                            userEnteredQuotientValueCoefficient = 1;
                        } else if (userEnteredQuotientValueCoefficient === '-') {
                            userEnteredQuotientValueCoefficient = -1;
                        } else {
                            userEnteredQuotientValueCoefficient = parseInt(userEnteredQuotientValueCoefficient);
                        }

                        // Get user-entered x-term's exponent value
                        var userEnteredQuotientHasX = /x/.test(userEnteredQuotientValue); // userEnteredQuotientValue has an x
                        var userEnteredQutoientValueExponent = 1;
                        if (userEnteredQuotientHasX) {
                            // If user explicitly gave x-term an exopnent
                            if (/\^/.test(userEnteredQuotientValue)) {
                                // Get the x-term's explicity exponent
                                // get array of matching expressions - Note: each parenthese adds an additional matching expression
                                userEnteredQutoientValueExponent = userEnteredQuotientValue.match(/^-?\d*(x(\^(-?\d+))?)?$/);
                                // the x-term's exponent value is the 4th element in the array of matching expressions
                                userEnteredQutoientValueExponent = userEnteredQutoientValueExponent[3];
                                // convert the x-term's exponent to an integer
                                userEnteredQutoientValueExponent = parseInt(userEnteredQutoientValueExponent);
                            }
                        }

                        // Output the subtraction polynomial
                        var expectedQuotientCoefficientValue = dividendXCoefficientValue / divisorXCoefficientValue;

                        var subtractionXCoefficientValue = divisorXCoefficientValue * userEnteredQuotientValueCoefficient;
                        self.$subtractionXCoefficient.text(subtractionXCoefficientValue);

                        var subtractionXExponentValue = divisorXExponentValue;
                        // if the user entered an x-term, then increase subtraction polynomial x-term exponent by the quotient x-term's exponent
                        if (userEnteredQuotientHasX) {
                            subtractionXExponentValue += userEnteredQutoientValueExponent;
                        }
                        self.$subtractionXExponent.text(subtractionXExponentValue);

                        var subtractionConstantValue = divisorConstantValue * userEnteredQuotientValueCoefficient;
                        // if the user entered an x-term, then add x-term to subtraction polynomial constant
                        if (userEnteredQuotientHasX) {
                            subtractionConstantValue += 'x';
                            subtractionConstantValue += '<sup>' + userEnteredQutoientValueExponent + '</sup>';
                        }
                        self.$subtractionConstant.html(subtractionConstantValue);

                        // Output the remainder polynomial
                        var remainderXCoefficientValue;
                        var remainderXExponentValue;
                        var remainderConstantValue;
                        // If dividend and subtraction exponents do not match, then highlight the mismatching exponents
                        if (dividendXExponentValue !== subtractionXExponentValue) {
                            self.$subtractionXExponent.addClass('wrong');
                            self.$dividendXExponent.addClass('wrong');
                            self.progressionTool.explanationMessage = 'The bold red exponents should match.<br/>';
                        } else {
                            remainderXCoefficientValue = dividendXCoefficientValue - subtractionXCoefficientValue;
                            remainderXExponentValue = subtractionXExponentValue;
                            remainderConstantValue = (parseInt(dividendConstantValue) - parseInt(subtractionConstantValue)) + 'x';
                            if (userEnteredQutoientValueExponent !== 0) {
                                remainderConstantValue += '<sup>' + userEnteredQutoientValueExponent + '</sup>';
                            }
                            self.$remainderXCoefficient.text(remainderXCoefficientValue);
                            self.$remainderXExponent.text(remainderXExponentValue);
                            self.$remainderConstant.html(remainderConstantValue);
                            self.progressionTool.explanationMessage = '';
                            if (remainderXCoefficientValue === 0) {
                                // x-term
                                self.$remainderPolynomial.children().eq(1).css('visibility', 'hidden');
                                // plus-sign
                                self.$remainderPolynomial.children().eq(2).css('visibility', 'hidden');
                            }
                            self.$remainderPolynomial.show();
                        }

                        self.$subtractonSymbol.show();
                        self.$subtractionPolynomial.show();

                        self.progressionTool.explanationMessage += 'Divide first terms: ' + dividendXCoefficientValue + 'x<sup>' + dividendXExponentValue + '</sup> / ' + divisorXCoefficientValue + 'x<sup>' + divisorXExponentValue + '</sup> = ';
                        self.progressionTool.explanationMessage += expectedQuotientCoefficientValue + 'x<sup>' + (dividendXExponentValue - divisorXExponentValue) + '</sup> (Type as: ' + expectedQuotientCoefficientValue + 'x^' + (dividendXExponentValue - divisorXExponentValue) + ')';

                        self.progressionTool.userAnswer = userEnteredQuotientValue;
                        self.progressionTool.expectedAnswer = expectedQuotientCoefficientValue + 'x^' + (dividendXExponentValue - divisorXExponentValue);

                        if (userEnteredQuotientValue === (expectedQuotientCoefficientValue + 'x^' + (dividendXExponentValue - divisorXExponentValue))) {
                            isAnswerCorrect = true;
                        }
                    }
                }

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        this.$divisorXCoefficient = $('#' + this.id + ' .divisor-x-coefficient');
        this.$divisorXExponent = $('#' + this.id + ' .divisor-x-exponent');
        this.$divisorConstant = $('#' + this.id + ' .divisor-constant');
        this.$dividendXCoefficient = $('#' + this.id + ' .dividend-x-coefficient');
        this.$dividendXExponent = $('#' + this.id + ' .dividend-x-exponent');
        this.$dividendConstant = $('#' + this.id + ' .dividend-constant');
        this.$subtractionXCoefficient = $('#' + this.id + ' .subtraction-x-coefficient');
        this.$subtractionXExponent = $('#' + this.id + ' .subtraction-x-exponent');
        this.$subtractionConstant = $('#' + this.id + ' .subtraction-constant');
        this.$remainderXCoefficient = $('#' + this.id + ' .remainder-x-coefficient');
        this.$remainderXExponent = $('#' + this.id + ' .remainder-x-exponent');
        this.$remainderConstant = $('#' + this.id + ' .remainder-constant');

        this.$quotient = $('#' + this.id + ' .quotient');
        this.$dividendPolynomial = $('#' + this.id + ' .dividend-polynomial');
        this.$subtractonSymbol = $('#' + this.id + ' .subtraction-symbol');
        this.$subtractionPolynomial = $('#' + this.id + ' .subtraction-polynomial');
        this.$remainderPolynomial = $('#' + this.id + ' .remainder-polynomial');

        // Initialize equation
        this.hideAndResetDivisionWork();
        this.makeLevel(0);
        this.disableAllInputs();

        $('#' + this.id + ' input').keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });
    };

    // Hide and reset the division work
    this.hideAndResetDivisionWork = function() {
        // Hide work
        this.$subtractonSymbol.hide();
        this.$subtractionPolynomial.hide();
        this.$remainderPolynomial.hide();

        // Reset work
        this.$remainderPolynomial.children().eq(1).css('visibility', 'visible'); // x-term
        this.$remainderPolynomial.children().eq(2).css('visibility', 'visible'); // plus-sign
        this.$subtractionXExponent.removeClass('wrong');
        this.$dividendXExponent.removeClass('wrong');
        this.$quotient.attr('size', '3').attr('maxlength', '3');
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        $('#' + this.id + ' input').val('').attr('disabled', false);
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        $('#' + this.id + ' input').attr('disabled', true);
    };

    // Returns the text currently displayed by $coefficient, replacing '' with 1
    // $coefficient is a jQuery DOM object
    this.extractCoefficient = function($coefficient) {
        var $firstElementInCoefficient = $coefficient.eq(0); // eq(0) returns the first element in $coefficient (there are multiple elements with identical .text()).
                                                             // eq(0) b/c text() returns a concatenated string of each $coefficient's text(),
                                                             // instead of just the first element in $coefficient.

        var coefficientAsString = '';
        coefficientAsString = $firstElementInCoefficient.text();

        return coefficientAsString === '' ? 1 : parseInt(coefficientAsString);
    };

    // Return random element value from 'array' passed to this function
    this.pickRandomElementInArray = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    // Generate random constant and exponents numbers
    // currentQuestionNumber is an integer
    this.generateConstantsAndExponents = function(currentQuestionNumber) {
        var divisorXCoefficientValue = 1;
        var divisorXExponentValue = 1;
        var divisorConstantValue = 1;
        var dividendXCoefficientValue = 1;
        var dividendXExponentValue = 1;
        var dividendConstantValue = 1;
        var expectedQuotientValue = 1;

        if (currentQuestionNumber === 0) {
            // small numbers and remainder will be 0
            expectedQuotientValue = this.pickRandomElementInArray([ 2, 3 ]);
            divisorXCoefficientValue = this.pickRandomElementInArray([ 2, 3 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 2, 3 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 2, 3 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientValue;
            dividendXExponentValue = divisorXExponentValue;
            dividendConstantValue = divisorConstantValue * expectedQuotientValue;
        } else if (currentQuestionNumber === 1) {
            // larger numbers and remainder will be 0
            expectedQuotientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXCoefficientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 4, 5, 6 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientValue;
            dividendXExponentValue = divisorXExponentValue;
            dividendConstantValue = divisorConstantValue * expectedQuotientValue;
        } else if (currentQuestionNumber === 2) {
            // large numbers and remainder will not be 0
            expectedQuotientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXCoefficientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 4, 5, 6 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientValue;
            dividendXExponentValue = divisorXExponentValue;
            dividendConstantValue = this.pickRandomElementInArray([ 7, 11, 13, 17 ]);
        } else if (currentQuestionNumber === 3) {
            // large negative number quotient, remainder will not be 0
            expectedQuotientValue = this.pickRandomElementInArray([ -4, -5, -6 ]);
            divisorXCoefficientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 4, 5, 6 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientValue;
            dividendXExponentValue = divisorXExponentValue;
            dividendConstantValue = this.pickRandomElementInArray([ 7, 11, 13, 17 ]);
        } else if (currentQuestionNumber === 4) {
            // quotient has x-term with x-term exponent of 1
            // also has x-term with x-term exponent of 1
            var expectedQuotientCoefficientValue = this.pickRandomElementInArray([ 6, 5, 4, -4, -5, -6 ]);
            divisorXCoefficientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 4, 5, 6 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientCoefficientValue;
            // accounts for the x-term exponent from the quotient
            dividendXExponentValue = divisorXExponentValue + 1;
            // also has x-term with x-term exponent of 1
            dividendConstantValue = this.pickRandomElementInArray([ 7, 11, 13, 17 ]) + 'x';
        } else if (currentQuestionNumber === 5) {
            // quotient has x-term with x-term exponent greater than 1
            this.$quotient.attr('size', '5').attr('maxlength', '5');

            var expectedQuotientCoefficientValue = this.pickRandomElementInArray([ 6, 5, 4, -4, -5, -6 ]);
            var expectedQuotientExponentValue = this.pickRandomElementInArray([ 2, 3, 4 ]);

            divisorXCoefficientValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorXExponentValue = this.pickRandomElementInArray([ 4, 5, 6 ]);
            divisorConstantValue = this.pickRandomElementInArray([ 4, 5, 6 ]);

            dividendXCoefficientValue = divisorXCoefficientValue * expectedQuotientCoefficientValue;
            // accounts for the x-term exponent from the quotient
            dividendXExponentValue = divisorXExponentValue + expectedQuotientExponentValue;
            // also has x-term with x-term exponent of 1
            dividendConstantValue = this.pickRandomElementInArray([ 7, 11, 13, 17 ]) + 'x<sup>' + expectedQuotientExponentValue + '</sup>';
        }

        this.$divisorXCoefficient.html(divisorXCoefficientValue);
        this.$divisorXExponent.html(divisorXExponentValue);
        this.$divisorConstant.html(divisorConstantValue);
        this.$dividendXCoefficient.html(dividendXCoefficientValue);
        this.$dividendXExponent.html(dividendXExponentValue);
        this.$dividendConstant.html(dividendConstantValue);
    };

    // Display a randomized equation (1 left-hand side expression and 1 right-hand side expression) given the currentQuestionNumber
    // currentQuestionNumber is an integer
    this.makeLevel = function(currentQuestionNumber) {
        this.hideAndResetDivisionWork();
        this.generateConstantsAndExponents(currentQuestionNumber);
        this.enableAllInputs();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var dividePolynomialsExport = {
    create: function() {
        return new DividePolynomials();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = dividePolynomialsExport;
