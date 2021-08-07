function QuadraticFormula() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        /*
            An |expectedAnswer| includes a list of |expectedInputs| and an |explanation|.
            |expectedInputs| is a list and required.
            |explanation| is string and required.
            Written during |makeLevel| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            expectedInputs: [],
            explanation:    ''
        };

        this.radicalInQuadraticFormula = this[this.name]['radicalInQuadraticFormula']();

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['quadraticFormula']();

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 6,
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
                var isAnswerCorrect = true;
                var userAnswers = [];
                var isInputValid = true;

                self.$inputs.removeClass('invalid-input');
                self.$inputs.each(function(index) {
                    var $userAnswer = $(this);
                    userAnswers.push($userAnswer.val());

                    // Check whether user answer is valid
                    var thisAnswerValid = self.isUserInputValid($userAnswer);
                    isInputValid = isInputValid && thisAnswerValid;

                    // For questions 0 - 3, order of input matters
                    if (currentQuestion < 4) {
                        // User answer at each element should be the same as the expected answer
                        var thisAnswerCorrect = ($userAnswer.val() === self.expectedAnswer.expectedInputs[index]);
                        isAnswerCorrect = isAnswerCorrect && thisAnswerCorrect;
                    }
                });

                // For question 4, the user's answer needs to contain the same x values, regardless of order
                if (currentQuestion >= 4) {
                    isAnswerCorrect = self.arraysAreEqual(userAnswers, self.expectedAnswer.expectedInputs);
                }

                self.progressionTool.userAnswer = JSON.stringify(userAnswers);
                self.progressionTool.expectedAnswer = JSON.stringify(self.expectedAnswer.expectedInputs);

                if (!isInputValid) {
                    self.progressionTool.explanationMessage = 'Please enter a number for each input.';
                    self.invalidInputEnteredGiveAnotherTry = true;
                }
                else {
                    var $tmp = $('<div>').html(self.expectedAnswer.explanation);
                    if (isAnswerCorrect) {
                        $tmp.find('.explanation').addClass('correct');
                    }
                    else {
                        $tmp.find('.explanation').addClass('wrong');
                    }
                    self.expectedAnswer.explanation = $tmp.html();

                    self.progressionTool.explanationMessage = self.expectedAnswer.explanation;
                }

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$starterEquation = $thisTool.find('.starter-equation');
        this.$userAnswerEquation = $thisTool.find('.user-answer-equation');
        this.$inputs = $thisTool.find('input');

        // Initialize equation
        this.makeLevel(0);
        this.disableAllInputs();
    };

    /*
        Return whether two arrays are equal, meaning have the same values (not necessarily in the same order)
        |arr1| and |arr2| are required and arrays

        If arr1 - arr2 has no elements and arr2 - arr1 has no elements, then arr1 and arr2 are equal.
    */
    this.arraysAreEqual = function(arr1, arr2) {
        return ($(arr1).not(arr2).length === 0) && ($(arr2).not(arr1).length === 0);
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        this.$inputs.attr('disabled', false);
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        this.$inputs.attr('disabled', true);
    };

    // Focus on the first invalid input. If not invalid input, then focus on the a-value input.
    this.focusOnAppropriateInput = function() {
        this.$inputs.eq(0).focus();
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

    this.updateInputs = function() {
        this.$inputs = $('#' + this.id + ' input');

        // Event listeners
        var self = this;
        this.$inputs.keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });

        this.enableAllInputs();
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
        startsEquation = startsEquation || false;

        if (startsEquation) {
            constantValue = (constantValue === 1) ? '' : constantValue;
        }
        else {
            // For non-negative values, use a +. Otherwise, use the large minus sign &#8211.
            constantValue = (constantValue >= 0) ? (' + ' + constantValue) : ' &#8211; ' + (-1 * constantValue);
        }

        return constantValue;
    };

    /*
        Return a randomly-chosen number in the range from |start| to |end| but not including 0.
        |start| is required and an integer.
        |end| is required and an integer.
    */
    this.pickNumberInRangeButNotZero = function(start, end) {
        var nonZeroNumberInRange;
        do {
            nonZeroNumberInRange = this.pickNumberInRange(start, end);
        } while (nonZeroNumberInRange === 0);

        return nonZeroNumberInRange;
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

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.makeLevel = function(currentQuestionNumber) {
        // Generate 2 x's in range {-5 to -1 and 1 to 5}.
        // The x's should not be equal, or x and -x.
        var xValue1 = this.pickNumberInRangeButNotZero(-5, 5);

        var xValue2;
        do {
            xValue2 = this.pickNumberInRangeButNotZero(-5, 5);
        } while ((xValue2 === xValue1) || (xValue2 === (-1 * xValue1)));

        var aValue = 1;
        var bValue = -1 * (xValue1 + xValue2);
        var cValue = xValue1 * xValue2;

        var starterEquationLeftSide = this.stringifyConstantValue(aValue, true) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(bValue) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(cValue);
        this.$starterEquation.html(starterEquationLeftSide + ' = 0');

        // Generate first equation's explanation
        var firstEquationExplanation = this[this.name]['firstEquation']({
            isExplanation: true,
            aValue:        'a',
            bValue:        'b',
            cValue:        'c'
        });

        // Generate second equation's explanation
        var negativeBValue = -1 * bValue;
        var bValueSquared = bValue * bValue;
        var fourAValueCValue = 4 * aValue * cValue;
        var divisor = 2 * aValue;
        var secondEquationExplanation = this[this.name]['secondEquation']({
            isExplanation:    true,
            negativeBValue:   negativeBValue,
            bValueSquared:    bValueSquared,
            fourAValueCValue: fourAValueCValue,
            divisor:          divisor
        });

        // Generate third equations' explanation
        var insideSquareRoot = bValueSquared - fourAValueCValue;
        var reducedRadical = Math.sqrt(bValueSquared - fourAValueCValue);
        var thirdEquationExplanation = this[this.name]['thirdEquation']({
            isExplanation:  true,
            negativeBValue: negativeBValue,
            reducedRadical: reducedRadical,
            divisor:        divisor
        });

        // Generate fourth equation's explanation
        var fourthEquationExplanation = this[this.name]['fourthEquation']({
            isExplanation:  true,
            negativeBValue: negativeBValue,
            reducedRadical: reducedRadical,
            divisor:        divisor
        });

        // Generate fifth equation's explanation
        var positiveXValue = Math.max(xValue1, xValue2);
        var negativeXValue = Math.min(xValue1, xValue2);
        var fifthEquationExplanation = this[this.name]['fifthEquation']({
            isExplanation:  true,
            positiveXValue: positiveXValue,
            negativeXValue: negativeXValue
        });

        var equationPrompt = '';
        if (currentQuestionNumber === 0) {
            // (-[b] +/- sqrt([b]^2 - 4[a][c])) / 2[a]
            equationPrompt = 'firstEquation';
            this.expectedAnswer.expectedInputs = [ bValue, bValue, aValue, cValue, aValue ];
            this.expectedAnswer.explanation = 'Fill in a, b, and c. a = ' + aValue + ', b = ' + bValue + ', c = ' + cValue + '.';
            this.expectedAnswer.explanation += firstEquationExplanation;
        }
        else if (currentQuestionNumber === 1) {
            // ([-b] +/- sqrt([b^2] - [4ac])) / [2a]
            equationPrompt = 'secondEquation';
            this.expectedAnswer.expectedInputs = [ negativeBValue,
                                                  bValueSquared,
                                                  fourAValueCValue,
                                                  divisor ];
            this.expectedAnswer.explanation = 'Fill in -b, b<sup>2</sup>, 4ac, and 2a.';
            this.expectedAnswer.explanation += firstEquationExplanation;
            this.expectedAnswer.explanation += secondEquationExplanation;
        }
        else if (currentQuestionNumber === 2) {
            // ([-b] +/- [sqrt(b^2 - 4ac)]) / [2a]
            equationPrompt = 'thirdEquation';
            this.expectedAnswer.expectedInputs = [ negativeBValue,
                                                  reducedRadical,
                                                  divisor ];
            this.expectedAnswer.explanation = 'Fill in -b, ' + this.radicalInQuadraticFormula + ', and 2a.';
            this.expectedAnswer.explanation += firstEquationExplanation;
            this.expectedAnswer.explanation += secondEquationExplanation;
            this.expectedAnswer.explanation += thirdEquationExplanation;
        }
        else if (currentQuestionNumber === 3) {
            // x = ([-b] + sqrt([b^2 - 4ac])) / [2a] or x = ([-b] - sqrt([b^2 - 4ac])) / [2a]
            equationPrompt = 'fourthEquation';
            this.expectedAnswer.expectedInputs = [ negativeBValue,
                                                  reducedRadical,
                                                  divisor,
                                                  negativeBValue,
                                                  reducedRadical,
                                                  divisor
            ];
            this.expectedAnswer.explanation = 'Fill in -b, ' + this.radicalInQuadraticFormula + ', and 2a.';
            this.expectedAnswer.explanation += firstEquationExplanation;
            this.expectedAnswer.explanation += secondEquationExplanation;
            this.expectedAnswer.explanation += thirdEquationExplanation;
            this.expectedAnswer.explanation += fourthEquationExplanation;
        }
        else if (currentQuestionNumber >= 4) {
            // x = [-b + sqrt([b^2 - 4ac])) / 2a] or x = [-b - sqrt([b^2 - 4ac])) / 2a]
            equationPrompt = 'fifthEquation';
            this.expectedAnswer.expectedInputs = [ positiveXValue,
                                                  negativeXValue
            ];
            this.expectedAnswer.explanation = 'Use the quadratic formula.';
            this.expectedAnswer.explanation += firstEquationExplanation;
            this.expectedAnswer.explanation += secondEquationExplanation;
            this.expectedAnswer.explanation += thirdEquationExplanation;
            this.expectedAnswer.explanation += fourthEquationExplanation;
            this.expectedAnswer.explanation += fifthEquationExplanation;
        }

        // Convert each element in |this.expectedAnswer.expectedInputs| to a string.
        this.expectedAnswer.expectedInputs.forEach(function(expectedInput, index, expectedInputs) {
            expectedInputs[index] = expectedInput.toString();
        });

        // Update equation in which the user enters his/her answer
        this.$inputs.remove();
        var userAnswerEquation = this[this.name][equationPrompt]({
            isExplanation: false
        });
        this.$userAnswerEquation.html(userAnswerEquation);
        this.updateInputs();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var quadraticFormulaExport = {
    create: function() {
        return new QuadraticFormula();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = quadraticFormulaExport;
