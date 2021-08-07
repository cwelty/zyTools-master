function FractionalExponent() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['fractionalExponent']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         3,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.directFocus(0);
            },
            reset: function() {
                self.makeLevel(0);
                self.disableAllInputs();
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
                self.directFocus(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                var xConstant1 = self.extractCoefficient(self.$xVariableConstant1);
                var xConstant2 = self.extractCoefficient(self.$xVariableConstant2);
                var yConstant1 = self.extractCoefficient(self.$yVariableConstant1);
                var yConstant2 = self.extractCoefficient(self.$yVariableConstant2);
                var xExponent1 = self.extractCoefficient(self.$xVariableExponent1);
                var xExponent2 = self.extractCoefficient(self.$xVariableExponent2);
                var yExponent1 = self.extractCoefficient(self.$yVariableExponent1);
                var yExponent2 = self.extractCoefficient(self.$yVariableExponent2);
                var fractionalExponent = self.extractCoefficient(self.$fractionalExponent);

                var enteredFinalConstantValue = -1;
                var correctFinalConstantValue = -1;
                var enteredFinalXExponentValue = -1;
                var correctFinalXExponentValue = -1;
                var enteredFinalYExponentValue = -1;
                var correctFinalYExponentValue = -1;

                self.progressionTool.userAnswer = '';
                self.progressionTool.expectedAnswer = '';

                if (currentQuestion === 0) {
                    enteredFinalConstantValue = self.extractCoefficient(self.$finalAnswerFullyReducedConstant);
                    correctFinalConstantValue = Math.pow(xConstant1, (1 / fractionalExponent));
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    enteredFinalXExponentValue = self.extractCoefficient(self.$finalAnswerFullyReducedXTermExponent);
                    correctFinalXExponentValue = xExponent1 / fractionalExponent;
                    var isXTermExponentCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    enteredFinalYExponentValue = self.extractCoefficient(self.$finalAnswerFullyReducedYTermExponent);
                    correctFinalYExponentValue = yExponent1 / fractionalExponent;
                    var isYTermExponentCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXTermExponentCorrect && isYTermExponentCorrect;

                    self.progressionTool.explanationMessage = 'Apply fractional exponent to constant: ' + xConstant1 + '<sup>(1/' + fractionalExponent + ')</sup> = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Multiply x\'s exponent by fractional exponent: ' + xExponent1 + ' * (1/' + fractionalExponent + ') = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Multiply y\'s exponent by fractional exponent: ' + yExponent1 + ' * (1/' + fractionalExponent + ') = ' + correctFinalYExponentValue;
                } else if (currentQuestion === 1) {
                    // Constants should be multiplied together
                    enteredFinalConstantValue = self.extractCoefficient(self.$finalAnswerWithFractionalExponentConstant);
                    correctFinalConstantValue = (xConstant1 * yConstant1) / (xConstant2 * yConstant2);
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    // x-variable exponents should be added
                    enteredFinalXExponentValue = self.extractCoefficient(self.$finalAnswerWithFractionalExponentXTermExponent);
                    correctFinalXExponentValue = xExponent1 - xExponent2;
                    var isXExponentValueCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    // y-variable exponents should be added
                    enteredFinalYExponentValue = self.extractCoefficient(self.$finalAnswerWithFractionalExponentYTermExponent);
                    correctFinalYExponentValue = yExponent1 - yExponent2;
                    var isYExponentValueCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXExponentValueCorrect && isYExponentValueCorrect;

                    self.progressionTool.explanationMessage = 'Combine constants: (' + xConstant1 + ' * ' + yConstant1 + ') / (' + xConstant2 + ' * ' + yConstant2 + ') = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided x terms: ' + xExponent1 + ' - ' + xExponent2 + ' = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided y terms: ' + yExponent1 + ' - ' + yExponent2 + ' = ' + correctFinalYExponentValue;
                } else if (currentQuestion === 2) {
                    enteredFinalConstantValue = self.extractCoefficient(self.$finalAnswerFullyReducedConstant);
                    var constantsInsideRadical = (xConstant1 * yConstant1) / (xConstant2 * yConstant2);
                    correctFinalConstantValue = Math.pow(constantsInsideRadical, (1 / fractionalExponent));
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    enteredFinalXExponentValue = self.extractCoefficient(self.$finalAnswerFullyReducedXTermExponent);
                    correctFinalXExponentValue = (xExponent1 - xExponent2) / fractionalExponent;
                    var isXTermExponentCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    enteredFinalYExponentValue = self.extractCoefficient(self.$finalAnswerFullyReducedYTermExponent);
                    correctFinalYExponentValue = (yExponent1 - yExponent2) / fractionalExponent;
                    var isYTermExponentCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXTermExponentCorrect && isYTermExponentCorrect;

                    self.progressionTool.explanationMessage = 'Combine constants then apply radical:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;((' + xConstant1 + ' * ' + yConstant1 + ') / (' + xConstant2 + ' * ' + yConstant2 + '))<sup>(1/' + fractionalExponent + ')</sup> = ' + constantsInsideRadical + '<sup>(1/' + fractionalExponent + ')</sup> = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided x terms then multiply by fractional exponent:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + xExponent1 + ' - ' + xExponent2 + ')' + ' * (1/' + fractionalExponent + ') = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided y terms then multiply by fractional exponent:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + yExponent1 + ' - ' + yExponent2 + ')' + ' * (1/' + fractionalExponent + ') = ' + correctFinalYExponentValue;
                }

                self.progressionTool.userAnswer = enteredFinalConstantValue + ',' + enteredFinalXExponentValue + ',' + enteredFinalYExponentValue;
                self.progressionTool.expectedAnswer = correctFinalConstantValue + ',' + correctFinalXExponentValue + ',' + correctFinalYExponentValue;

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        this.$xVariableConstant1 = $('#' + this.id + ' .x-variable-constant-1');
        this.$xVariableConstant2 = $('#' + this.id + ' .x-variable-constant-2');
        this.$yVariableConstant1 = $('#' + this.id + ' .y-variable-constant-1');
        this.$yVariableConstant2 = $('#' + this.id + ' .y-variable-constant-2');
        this.$xVariableExponent1 = $('#' + this.id + ' .x-variable-exponent-1');
        this.$xVariableExponent2 = $('#' + this.id + ' .x-variable-exponent-2');
        this.$yVariableExponent1 = $('#' + this.id + ' .y-variable-exponent-1');
        this.$yVariableExponent2 = $('#' + this.id + ' .y-variable-exponent-2');
        this.$fractionalExponent = $('#' + this.id + ' .fraction-exponent');

        this.$reducedExpressionWithFractionalExponent = $('#' + this.id + ' .reduced-expression-with-fractional-exponent');
        this.$unreducedExpressionWithFractionalExponent = $('#' + this.id + ' .unreduced-expression-with-fractional-exponent');

        this.$finalAnswerFullyReduced = $('#' + this.id + ' .final-answer-fully-reduced');
        this.$finalAnswerFullyReducedConstant = this.$finalAnswerFullyReduced.find('.constant');
        this.$finalAnswerFullyReducedXTermExponent = this.$finalAnswerFullyReduced.find('.x-term-exponent');
        this.$finalAnswerFullyReducedYTermExponent = this.$finalAnswerFullyReduced.find('.y-term-exponent');

        this.$finalAnswerWithFractionalExponent = $('#' + this.id + ' .final-answer-with-fractional-exponent');
        this.$finalAnswerWithFractionalExponentConstant = this.$finalAnswerWithFractionalExponent.find('.constant');
        this.$finalAnswerWithFractionalExponentXTermExponent = this.$finalAnswerWithFractionalExponent.find('.x-term-exponent');
        this.$finalAnswerWithFractionalExponentYTermExponent = this.$finalAnswerWithFractionalExponent.find('.y-term-exponent');

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
        this.$reducedExpressionWithFractionalExponent.hide();
        this.$unreducedExpressionWithFractionalExponent.hide();

        // Expressions on right-hand side of equation
        this.$finalAnswerFullyReduced.hide();
        this.$finalAnswerWithFractionalExponent.hide();
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
        if ($firstElementInCoefficient.is('input')) {
            coefficientAsString = $firstElementInCoefficient.val();
        } else {
            coefficientAsString = $firstElementInCoefficient.text();
        }

        return coefficientAsString === '' ? 1 : parseInt(coefficientAsString);
    };

    // Return random element value from 'array' passed to this function
    this.pickRandomElementInArray = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    // Generate random constant and exponents numbers
    // currentQuestionNumber is an integer
    this.generateConstantsAndExponents = function(currentQuestionNumber) {
        var xVariableConstant1Value = 1;
        var xVariableConstant2Value = 1;
        var yVariableConstant1Value = 1;
        var yVariableConstant2Value = 1;

        var xVariableExponent1Value = 1;
        var xVariableExponent2Value = 1;
        var yVariableExponent1Value = 1;
        var yVariableExponent2Value = 1;

        var fractionalExponentValue = 1;

        if (currentQuestionNumber === 0) {
            xVariableConstant1Value = this.pickRandomElementInArray([ 8, 27 ]);

            xVariableExponent1Value = this.pickRandomElementInArray([ 3, 6 ]);
            yVariableExponent1Value = this.pickRandomElementInArray([ 9, 12 ]);

            fractionalExponentValue = this.pickRandomElementInArray([ 3 ]);
        } else if ((currentQuestionNumber === 1) || (currentQuestionNumber === 2)) {
            var finalConstantValueBeforeCubeRoot = this.pickRandomElementInArray([ 1, 8 ]);

            if (finalConstantValueBeforeCubeRoot === 1) {
                var randomNumber1 = this.pickRandomElementInArray([ 3, 6 ]);
                var randomNumber2 = this.pickRandomElementInArray([ 2, 4 ]);

                // Numerator constants
                xVariableConstant1Value = randomNumber1;
                yVariableConstant1Value = randomNumber2;

                // Denominator constants
                xVariableConstant2Value = randomNumber2;
                yVariableConstant2Value = randomNumber1;
            } else if (finalConstantValueBeforeCubeRoot === 8) {
                var randomNumber1 = this.pickRandomElementInArray([ 4, 8 ]);
                var randomNumber2 = this.pickRandomElementInArray([ 2, 4 ]);

                // Numerator constants
                xVariableConstant1Value = randomNumber1;
                yVariableConstant1Value = randomNumber2;

                // Denominator constants
                xVariableConstant2Value = (randomNumber1 * randomNumber2) / 8;
                yVariableConstant2Value = 1;
            }

            xVariableExponent1Value = this.pickRandomElementInArray([ 7, 10, 13 ]);
            xVariableExponent2Value = this.pickRandomElementInArray([ 1, 4 ]);

            yVariableExponent1Value = this.pickRandomElementInArray([ 8, 11, 14 ]);
            yVariableExponent2Value = this.pickRandomElementInArray([ 2, 5 ]);

            fractionalExponentValue = this.pickRandomElementInArray([ 3 ]);
        }

        // Display blank '' instead of 1
        this.$xVariableConstant1.text(xVariableConstant1Value === 1 ? '' : xVariableConstant1Value);
        this.$xVariableConstant2.text(xVariableConstant2Value === 1 ? '' : xVariableConstant2Value);
        this.$yVariableConstant1.text(yVariableConstant1Value === 1 ? '' : yVariableConstant1Value);
        this.$yVariableConstant2.text(yVariableConstant2Value === 1 ? '' : yVariableConstant2Value);
        this.$xVariableExponent1.text(xVariableExponent1Value === 1 ? '' : xVariableExponent1Value);
        this.$xVariableExponent2.text(xVariableExponent2Value === 1 ? '' : xVariableExponent2Value);
        this.$yVariableExponent1.text(yVariableExponent1Value === 1 ? '' : yVariableExponent1Value);
        this.$yVariableExponent2.text(yVariableExponent2Value === 1 ? '' : yVariableExponent2Value);

        this.$fractionalExponent.text(fractionalExponentValue === 2 ? '' : fractionalExponentValue);
    };

    this.directFocus = function(currentQuestionNumber) {
        switch(currentQuestionNumber) {

            // Questions without exponents under the radical in the final answer
            case 0:
            case 2:
                this.$finalAnswerFullyReducedConstant.focus();
                break;

            // Questions with exponents left under the radical in the final answer
            case 1:
                this.$finalAnswerWithFractionalExponentConstant.focus();
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

        if (currentQuestionNumber === 0) {
            this.generateConstantsAndExponents(currentQuestionNumber);
            this.$reducedExpressionWithFractionalExponent.show();
            this.$finalAnswerFullyReduced.show();
        } else if (currentQuestionNumber === 1) {
            this.generateConstantsAndExponents(currentQuestionNumber);
            this.$unreducedExpressionWithFractionalExponent.show();
            this.$finalAnswerWithFractionalExponent.show();
        } else if (currentQuestionNumber === 2) {
            this.generateConstantsAndExponents(currentQuestionNumber);
            this.$unreducedExpressionWithFractionalExponent.show();
            this.$finalAnswerFullyReduced.show();
        }
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var fractionalExponentExport = {
    create: function() {
        return new FractionalExponent();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = fractionalExponentExport;
