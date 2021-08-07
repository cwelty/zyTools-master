function MultipleVariableExponent() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['multipleVariableExponent']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         8,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.$finalAnswerConstant.focus();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableAllInputs();
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
                self.$finalAnswerConstant.focus();
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
                var expressionExponent = self.extractCoefficient(self.$expressionExponent);

                var enteredFinalConstantValue = self.extractCoefficient(self.$finalAnswerConstant);
                var enteredFinalXExponentValue = self.extractCoefficient(self.$finalAnswerXVariableExponent);
                var enteredFinalYExponentValue = self.extractCoefficient(self.$finalAnswerYVariableExponent);

                var correctFinalConstantValue = -1;
                var correctFinalXExponentValue = -1;
                var correctFinalYExponentValue = -1;

                if ((currentQuestion === 0) || (currentQuestion === 1) || (currentQuestion === 2)) {
                    // Constants should be multiplied together
                    correctFinalConstantValue = xConstant1 * xConstant2 * yConstant1 * yConstant2;
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    // x-variable exponents should be added
                    correctFinalXExponentValue = xExponent1 + xExponent2;
                    var isXExponentValueCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    // y-variable exponents should be added
                    correctFinalYExponentValue = yExponent1 + yExponent2;
                    var isYExponentValueCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXExponentValueCorrect && isYExponentValueCorrect;

                    self.progressionTool.explanationMessage = 'Multiply constants: ' + xConstant1 + ' * ' + yConstant1 + ' * ' + xConstant2 + ' * ' + yConstant2 + ' = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Add exponents of multiplied x terms: ' + xExponent1 + ' + ' + xExponent2 + ' = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Add exponents of multiplied y terms: ' + yExponent1 + ' + ' + yExponent2 + ' = ' + correctFinalYExponentValue;
                } else if ((currentQuestion === 3) || (currentQuestion === 4) || (currentQuestion === 6)) {
                    // Constants should be multiplied together
                    correctFinalConstantValue = (xConstant1 * yConstant1) / (xConstant2 * yConstant2);
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    // x-variable exponents should be added
                    correctFinalXExponentValue = xExponent1 - xExponent2;
                    var isXExponentValueCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    // y-variable exponents should be added
                    correctFinalYExponentValue = yExponent1 - yExponent2;
                    var isYExponentValueCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXExponentValueCorrect && isYExponentValueCorrect;

                    self.progressionTool.explanationMessage = 'Combine constants: (' + xConstant1 + ' * ' + yConstant1 + ') / (' + xConstant2 + ' * ' + yConstant2 + ') = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided x terms: ' + xExponent1 + ' - ' + xExponent2 + ' = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of divided y terms: ' + yExponent1 + ' - ' + yExponent2 + ' = ' + correctFinalYExponentValue;
                } else if (currentQuestion === 5) {
                    // Constant should be raised to the power of the expression exponent
                    correctFinalConstantValue = Math.pow(xConstant1, expressionExponent);
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    // x-variable exponent should be multiplied by expression exponent
                    correctFinalXExponentValue = xExponent1 * expressionExponent;
                    var isXExponentValueCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    // y-variable exponent should be multiplied by expression exponent
                    correctFinalYExponentValue = yExponent1 * expressionExponent;
                    var isYExponentValueCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXExponentValueCorrect && isYExponentValueCorrect;

                    self.progressionTool.explanationMessage = 'Raise constant to power of expression exponent: (' + xConstant1 + ')<sup>' + expressionExponent + '</sup> = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Multiply x exponent by expression exponent: ' + xExponent1 + ' * ' + expressionExponent + ' = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Multiply y exponent by expression exponent: ' + yExponent1 + ' * ' + expressionExponent + ' = ' + correctFinalYExponentValue;
                } else if (currentQuestion === 7) {
                    // Constants should be multiplied together
                    correctFinalConstantValue = Math.pow((xConstant1 * yConstant1) / (xConstant2 * yConstant2), expressionExponent);
                    var isConstantValueCorrect = correctFinalConstantValue === enteredFinalConstantValue;

                    // x-variable exponents should be added
                    correctFinalXExponentValue = (xExponent1 - xExponent2) * expressionExponent;
                    var isXExponentValueCorrect = correctFinalXExponentValue === enteredFinalXExponentValue;

                    // y-variable exponents should be added
                    correctFinalYExponentValue = (yExponent1 - yExponent2) * expressionExponent;
                    var isYExponentValueCorrect = correctFinalYExponentValue === enteredFinalYExponentValue;

                    isAnswerCorrect = isConstantValueCorrect && isXExponentValueCorrect && isYExponentValueCorrect;

                    self.progressionTool.explanationMessage = 'Combine constants, then raise to power of outer exponent:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;((' + xConstant1 + ' * ' + yConstant1 + ') / (' + xConstant2 + ' * ' + yConstant2 + '))<sup>' + expressionExponent + '</sup> = ' + correctFinalConstantValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of x terms, then multiply by outer exponent:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + xExponent1 + ' - ' + xExponent2 + ') * ' + expressionExponent + ' = ' + correctFinalXExponentValue;
                    self.progressionTool.explanationMessage += '<br/>Subtract exponents of y terms, then multiply by outer exponent:';
                    self.progressionTool.explanationMessage += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + yExponent1 + ' - ' + yExponent2 + ') * ' + expressionExponent + ' = ' + correctFinalYExponentValue;
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
        this.$expressionExponent = $('#' + this.id + ' .expression-exponent');

        this.$finalAnswerConstant = $('#final-answer-constant-' + this.id);
        this.$finalAnswerXVariableExponent = $('#final-answer-x-variable-exponent-' + this.id);
        this.$finalAnswerYVariableExponent = $('#final-answer-y-variable-exponent-' + this.id);

        this.$noDenominator = $('#' + this.id + ' .no-denominator');
        this.$hasDenominator = $('#' + this.id + ' .has-denominator');
        this.$noDenominatorHasExponent = $('#' + this.id + ' .no-denominator-has-exponent');
        this.$hasExpressionExponent = $('#' + this.id + ' .has-expression-exponent');

        this.$finalAnswer = $('#' + this.id + ' .final-answer');
        this.$finalAnswerExpressionExponent = this.$finalAnswer.find('.has-expression-exponent');

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
        this.$noDenominator.hide();
        this.$hasDenominator.hide();
        this.$noDenominatorHasExponent.hide();
        this.$hasExpressionExponent.hide();

        // Expressions on right-hand side of equation
        this.$finalAnswer.hide();
        this.$finalAnswerExpressionExponent.hide();

        // Remove additional classes
        $('#has-denominator-expression-' + this.id).removeClass('left-side-expression-offset');
        $('#' + this.id + ' .left-side-expression-parenthese').removeClass('left-side-expression-parentheses-offset');
        $('#left-side-expression-exponent-' + this.id).removeClass('left-side-expression-exponent');
        $('#right-side-expression-' + this.id).removeClass('right-side-expression');
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
    // Optional parameters:
    //   * useNegativeNumbers is a boolean
    //   * useConstantsThatMakeWholeNumbersWhenDivided is a boolean
    this.generateConstantsAndExponents = function(useNegativeNumbers, useConstantsThatMakeWholeNumbersWhenDivided, useSmallExpressionExponent) {
        useNegativeNumbers = useNegativeNumbers ? true : false;
        useConstantsThatMakeWholeNumbersWhenDivided = useConstantsThatMakeWholeNumbersWhenDivided ? true : false;

        var xVariableConstant1Value = useNegativeNumbers ? this.pickRandomElementInArray([ -3, -2 ]) : this.pickRandomElementInArray([ 2, 3 ]);
        var xVariableConstant2Value = this.pickRandomElementInArray([ 1, 2 ]);
        var yVariableConstant1Value = useConstantsThatMakeWholeNumbersWhenDivided ? this.pickRandomElementInArray([ 2, 4, 8 ]) : this.pickRandomElementInArray([ 1, 2 ]);
        var yVariableConstant2Value = useConstantsThatMakeWholeNumbersWhenDivided ? (yVariableConstant1Value / 2) : this.pickRandomElementInArray([ 2, 3 ]);

        var xVariableExponent1Value = this.pickRandomElementInArray([ 4, 5, 6 ]);
        var xVariableExponent2Value = this.pickRandomElementInArray([ 2, 3 ]);
        var yVariableExponent1Value = useNegativeNumbers ? this.pickRandomElementInArray([ -3, -2 ]) : this.pickRandomElementInArray([ 2, 3 ]);
        var yVariableExponent2Value = this.pickRandomElementInArray([ 4, 5, 6 ]);

        var expressionExponentValue = useSmallExpressionExponent ? 2 : this.pickRandomElementInArray([ 2, 3 ]);

        // Display blank '' instead of 1
        this.$xVariableConstant1.text(xVariableConstant1Value === 1 ? '' : xVariableConstant1Value);
        this.$xVariableConstant2.text(xVariableConstant2Value === 1 ? '' : xVariableConstant2Value);
        this.$yVariableConstant1.text(yVariableConstant1Value === 1 ? '' : yVariableConstant1Value);
        this.$yVariableConstant2.text(yVariableConstant2Value === 1 ? '' : yVariableConstant2Value);
        this.$xVariableExponent1.text(xVariableExponent1Value === 1 ? '' : xVariableExponent1Value);
        this.$xVariableExponent2.text(xVariableExponent2Value === 1 ? '' : xVariableExponent2Value);
        this.$yVariableExponent1.text(yVariableExponent1Value === 1 ? '' : yVariableExponent1Value);
        this.$yVariableExponent2.text(yVariableExponent2Value === 1 ? '' : yVariableExponent2Value);
        this.$expressionExponent.text(expressionExponentValue === 1 ? '' : expressionExponentValue);
    };

    // Display a randomized equation (1 left-hand side expression and 1 right-hand side expression) given the currentQuestionNumber
    // currentQuestionNumber is an integer
    this.makeLevel = function(currentQuestionNumber) {
        this.hideAllExpressions();
        this.enableAllInputs();

        if (currentQuestionNumber === 0) {
            // Exponents are all positive numbers
            this.generateConstantsAndExponents();

            // Give answer to x-variable and y-variable exponents; user just needs to get answer to constant
            var xExponent1 = this.extractCoefficient(this.$xVariableExponent1);
            var xExponent2 = this.extractCoefficient(this.$xVariableExponent2);
            var correctFinalXExponentValue = xExponent1 + xExponent2;
            this.$finalAnswerXVariableExponent.val(correctFinalXExponentValue);

            var yExponent1 = this.extractCoefficient(this.$yVariableExponent1);
            var yExponent2 = this.extractCoefficient(this.$yVariableExponent2);
            var correctFinalYExponentValue = yExponent1 + yExponent2;
            this.$finalAnswerYVariableExponent.val(correctFinalYExponentValue);

            // Expression has no fractions
            this.$noDenominator.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 1) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Exponents are all positive numbers
            // Expression has no fractions
            this.generateConstantsAndExponents();
            this.$noDenominator.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 2) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Some exponents are negative numbers
            // Expression has no fractions
            this.generateConstantsAndExponents(true);
            this.$noDenominator.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 3) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Exponents are all positive numbers
            // Expression has a fraction
            this.generateConstantsAndExponents(false, true);
            this.$hasDenominator.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 4) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Some exponents are negative numbers
            // Expression has a fraction
            this.generateConstantsAndExponents(true, true);
            this.$hasDenominator.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 5) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Some exponents are negative numbers
            // Expression has a no fraction
            this.generateConstantsAndExponents(true, true);
            this.$noDenominatorHasExponent.show();
            this.$finalAnswer.show();
        } else if (currentQuestionNumber === 6) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Some exponents are negative numbers
            // Expression has a fraction
            // Expression is surrounded by exponent
            this.generateConstantsAndExponents(true, true);
            this.$hasDenominator.show();
            this.$finalAnswer.show();
            this.$hasExpressionExponent.show();

            // Add offsets to line-up the expression nicely
            $('#has-denominator-expression-' + this.id).addClass('left-side-expression-offset');
            $('#' + this.id + ' .left-side-expression-parenthese').addClass('left-side-expression-parentheses-offset');
            $('#left-side-expression-exponent-' + this.id).addClass('left-side-expression-exponent');
            $('#right-side-expression-' + this.id).addClass('right-side-expression');
        } else if (currentQuestionNumber === 7) {
            // User must get answer to constant, and x-variable and y-variable exponents
            // Some exponents are negative numbers
            // Expression has a fraction
            // Expression is surrounded by exponent
            this.generateConstantsAndExponents(true, true, true);
            this.$hasDenominator.show();
            this.$finalAnswer.show();
            this.$hasExpressionExponent.show();
            this.$finalAnswerExpressionExponent.hide();
        }
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var multipleVariableExponentExport = {
    create: function() {
        return new MultipleVariableExponent();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = multipleVariableExponentExport;
