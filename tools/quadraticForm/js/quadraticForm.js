function QuadraticForm() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        /*
            An |expectedAnswer| includes an |aValue|, |bValue|, |cValue|, and |explanation|.
            |aValue|, |bValue| and |cValue| are required numbers.
            |explanation| is a required string.
            Written during |makeLevel| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            aValue     : 0,
            bValue     : 0,
            cValue     : 0,
            explanation: ''
        };

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['quadraticForm']();

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 8,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.focusOnAppropriateInput(0);
                self.$inputs.removeClass('invalid-input');
            },
            reset: function() {
                self.makeLevel(0);
                self.disableAllInputs();
                self.$inputs.removeClass('invalid-input');
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                    self.$inputs.removeClass('invalid-input');
                }
                // Input was invalid. Remove invalid input. Keep valid input.
                else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.enableAllInputs();

                    // Remove invalid input
                    self.$inputs.each(function() {
                        var $this = $(this);
                        if ($this.hasClass('invalid-input')) {
                            $this.val('');
                        }
                    });
                }
                self.focusOnAppropriateInput(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                var userA = self.$aValue.val();
                var userB = self.$bValue.val();
                var userC = self.$cValue.val();

                self.$inputs.removeClass('invalid-input');
                var isUserAValid = self.isUserInputValid(self.$aValue);
                var isUserBValid = self.isUserInputValid(self.$bValue);
                var isUserCValid = self.isUserInputValid(self.$cValue);
                var isInputValid = isUserAValid && isUserBValid && isUserCValid;

                var exptA = self.expectedAnswer.aValue;
                var exptB = self.expectedAnswer.bValue;
                var exptC = self.expectedAnswer.cValue;

                self.progressionTool.userAnswer = self.answerSubmissionFormat(userA, userB, userC);
                self.progressionTool.expectedAnswer = self.answerSubmissionFormat(exptA, exptB, exptC);

                if (!isInputValid) {
                    self.progressionTool.explanationMessage = 'Please enter a number for a, b, and c.';
                    self.invalidInputEnteredGiveAnotherTry = true;
                }
                else {
                    isAnswerCorrect = (userA === exptA) && (userB === exptB) && (userC === exptC);
                    self.progressionTool.explanationMessage = self.expectedAnswer.explanation;
                }

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$starterEquation = $thisTool.find('.starter-equation');
        this.$inputs = $thisTool.find('input');
        this.$aValue = this.$inputs.filter('.a-value');
        this.$bValue = this.$inputs.filter('.b-value');
        this.$cValue = this.$inputs.filter('.c-value');

        // Initialize equation
        this.makeLevel(0);
        this.disableAllInputs();

        this.$inputs.keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        this.$inputs.attr('disabled', false);
    };

    // Clear all input fields in tool
    this.clearAllInputs = function() {
        this.$inputs.val('');
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        this.$inputs.attr('disabled', true);
    };

    // Focus on the first invalid input. If not invalid input, then focus on the a-value input.
    this.focusOnAppropriateInput = function() {
        this.$aValue.focus();
        // Highlight the first invalid input if one exists
        this.$inputs.each(function() {
            var $this = $(this);
            if ($this.hasClass('invalid-input')) {
                $this.focus();
                return false;
            }
        });
    };

    /*
        Return whether |$value.val()| is a valid input. Also, if not valid, then highlight the input.
        |$value| is a required jQuery object.
    */
    this.isUserInputValid = function($value) {
        var isInputValid = true;
        if (!$.isNumeric($value.val())) {
            isInputValid = false;
            $value.addClass('invalid-input');
        }
        return isInputValid;
    };

    /*
        Return string in answer submission format using |a|, |b|, and |c|.
        |a|, |b|, and |c| are required strings.
    */
    this.answerSubmissionFormat = function(a, b, c) {
        return 'a = ' + a + ', b = ' + b + ', c = ' + c;
    };

    /*
        Return string of x to the power of exponent.
        |exponent| is a number and required
    */
    this.stringifyXToThePowerOf = function(exponent) {
        // if exponent is 0, then |xToPowerOfExponent| is empty string (also default case)
        var xToPowerOfExponent = '';
        if ((exponent > 1) || (exponent < 0)) {
            xToPowerOfExponent = 'x<sup>' + exponent + '</sup>';
        }
        else if (exponent === 1) {
            xToPowerOfExponent = 'x';
        }

        return xToPowerOfExponent;
    };

    /*
        Return a string with proper spacing for a |constantValue|, e.g., -4 -> ' - 4' and 3 -> ' + 3'.
        If the |constantValue| does not |startsEquation|, then -4 -> '-4', 3 -> '3', and 1 -> ''
        |constantValue| is a required number
        |startsEquation| is boolean and not required
    */
    this.stringifyConstantValue = function(constantValue, startsEquation) {
        startsEquation = (startsEquation !== undefined) ? startsEquation : false;

        if (startsEquation) {
            if (constantValue === 1) {
                constantValue = '';
            }
            else if (constantValue === -1) {
                constantValue = '-';
            }
        }
        else {
            if (constantValue >= 0) {
                constantValue = ' + ' + constantValue;
            }
            else if (constantValue === -1) {
                constantValue = ' - ';
            }
            else {
                constantValue = ' - ' + (-1 * constantValue);
            }
        }

        return constantValue;
    };

    /*
        Return a randomly-chosen number in the range from |start| to |end|
        |start| is required and an integer.
        |end| is required and an integer.
    */
    this.pickNumberInRange = function(start, end) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    };

    /*
        Compute the greatest common divisor of |num1| and |num2|
        |num1| and |num2| are integers and required
    */
    this.greatestCommonDivisor = function(num1, num2) {
        return ((num2 === 0) ? num1 : this.greatestCommonDivisor(num2, (num1 % num2)));
    };

    /*
        Determine whether |num1| and |num2| have an integer factor
        If the greatest common divisor (gcd) is 1, then there is no integer factor
        |num1| and |num2| are integers and required
    */
    this.hasIntegerFactor = function(num1, num2) {
        return (this.greatestCommonDivisor(num1, num2) > 1);
    };

    // Map of type of explanation (e.g., add, divide) to the appropriate HBS filename
    this.explanationTables = {
        add     : 'explanationTableAdd',
        divide  : 'explanationTableDivide',
        multiply: 'explanationTableMultiply'
    };

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.makeLevel = function(currentQuestionNumber) {
        // a, b, and c should not have an integer factor (aka cannot be reduced)
        var aValue = this.pickNumberInRange(1, 9);
        var bValue = this.pickNumberInRange(1, 9);
        var cValue;
        do {
            cValue = this.pickNumberInRange(1, 9);
        } while (this.hasIntegerFactor(aValue, cValue) || this.hasIntegerFactor(bValue, cValue));

        currentQuestionNumber = 5;

        var starterEquationLeftSide;
        var starterEquationRightSide;
        var explanation;
        var explanationTableToUse;
        var adjustmentValue;
        if (currentQuestionNumber === 0) {
            // Make equation ax^2 + bx + 0 = -c, without reduction required
            starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(bValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(0);
            starterEquationRightSide = this.stringifyConstantValue(-1 * cValue, true);
            adjustmentValue = cValue;
            explanation = 'Add ' + adjustmentValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
        }
        else if (currentQuestionNumber === 1) {
            // Make equation ax^2 + bx = -c, without reduction required
            starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(bValue) + this.stringifyXToThePowerOf(1);
            starterEquationRightSide = this.stringifyConstantValue(-1 * cValue, true);
            adjustmentValue = cValue;
            explanation = 'Add ' + adjustmentValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
        }
        else if (currentQuestionNumber === 2) {
            // Make equation ax^2 + bx = -c, with reduction required
            var reductionFactor = this.pickNumberInRange(2, 5);
            var shownAValue = aValue * reductionFactor;
            var shownBValue = bValue * reductionFactor;
            var shownCValue = cValue * reductionFactor;

            starterEquationLeftSide = this.stringifyConstantValue(shownAValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(shownBValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(shownCValue);
            starterEquationRightSide = '0';
            explanation = '<i>a</i>, <i>b</i>, and <i>c</i> should be reduced. Divide both sides by ' + reductionFactor + '.';
            explanationTableToUse = this.explanationTables.divide;
            adjustmentValue = reductionFactor;
        }
        else if (currentQuestionNumber === 3) {
            // Make equation -ax^2 - bx -c = 0, need to multiply by -1
            starterEquationLeftSide = this.stringifyConstantValue(-1 * aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(-1 * bValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(-1 * cValue);
            starterEquationRightSide = '0';
            explanation = 'Multiply both sides by -1.';
            explanationTableToUse = this.explanationTables.multiply;
            adjustmentValue = '-1';
        }
        else if (currentQuestionNumber === 4) {
            // Make equation ax^2 + bx + (c - d) = -d, without reduction required
            var dValue = this.pickNumberInRange(1, 9);
            starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(bValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(cValue - dValue);
            starterEquationRightSide = this.stringifyConstantValue(-1 * dValue, true);
            explanation = 'Add ' + dValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
            adjustmentValue = dValue;
        }
        else if (currentQuestionNumber === 5) {
            // Make equation ax^2 + c = -bx, without reduction required
            starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(cValue);
            starterEquationRightSide = this.stringifyConstantValue(-1 * bValue, true) + this.stringifyXToThePowerOf(1);
            adjustmentValue = this.stringifyConstantValue(bValue, true) + this.stringifyXToThePowerOf(1);
            explanation = 'Add ' + adjustmentValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
        }
        else if (currentQuestionNumber === 6) {
            // Make equation ax^2 = -bx - c, without reduction required
            starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2);
            starterEquationRightSide = this.stringifyConstantValue(-1 * bValue, true) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(-1 * cValue);
            adjustmentValue = this.stringifyConstantValue(bValue, true) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(cValue);
            explanation = 'Add ' + adjustmentValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
        }
        else if (currentQuestionNumber === 7) {
            // Make equation bx + c = -ax^2, without reduction required
            starterEquationLeftSide = this.stringifyConstantValue(bValue, true) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(cValue);
            starterEquationRightSide = this.stringifyConstantValue(-1 * aValue, true) + this.stringifyXToThePowerOf(2);
            adjustmentValue = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2);
            explanation = 'Add ' + adjustmentValue + ' to both sides.';
            explanationTableToUse = this.explanationTables.add;
        }

        this.$starterEquation.html(starterEquationLeftSide + ' = ' + starterEquationRightSide);

        var answerEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(bValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(cValue);
        var answerEquationRightSide = '0';

        var explanationEquations = this[this.name][explanationTableToUse]({
            starterEquationLeftSide : starterEquationLeftSide,
            starterEquationRightSide: starterEquationRightSide,
            adjustmentValue         : adjustmentValue,
            answerEquationLeftSide  : answerEquationLeftSide,
            answerEquationRightSide : answerEquationRightSide
        });

        explanation = explanation + explanationEquations;

        this.expectedAnswer = {
            aValue     : aValue.toString(),
            bValue     : bValue.toString(),
            cValue     : cValue.toString(),
            explanation: explanation
        };

        this.enableAllInputs();
        this.clearAllInputs();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var quadraticFormExport = {
    create: function() {
        return new QuadraticForm();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = quadraticFormExport;
