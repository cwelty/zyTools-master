function LinearFunctions() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        // If |this.useXIntercept| is true, then user solves for x-intercept. Otherwise, user solves for y-intercept.
        this.useXIntercept = (options !== null) ? options.useXIntercept : false;

        /*
            An |expectedAnswer| includes an |intercept| and |explanation|
            |intercept| and |explanation| are required and strings.
            Written during |makeLevel| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            intercept:   '',
            explanation: '',
        };

        this.utilities = require('utilities');

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['linearFunctions']({
            id: this.id
        });

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 4,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.$intercept.focus();
                self.$intercept.removeClass('invalid-input');
            },
            reset: function() {
                self.makeLevel(0);
                self.$intercept.attr('disabled', true);
                self.$intercept.removeClass('invalid-input');
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                }
                // Input was invalid. Remove invalid input. Keep valid input.
                else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.$intercept.attr('disabled', false);

                    // Remove invalid input
                    self.$intercept.each(function() {
                        var $this = $(this);
                        if ($this.hasClass('invalid-input')) {
                            $this.val('');
                        }
                    });
                }
                self.$intercept.focus();
            },
            isCorrect: function(currentQuestion) {
                var userIntercept = self.$intercept.val().trim();
                var expectedIntercept = self.expectedAnswer.intercept;

                self.progressionTool.userAnswer = userIntercept;
                self.progressionTool.expectedAnswer = expectedIntercept;

                var isInputValid = self.isInputAnInteger(userIntercept);
                var isAnswerCorrect = (userIntercept === expectedIntercept);

                if (!isInputValid) {
                    self.progressionTool.explanationMessage = 'Please enter a number for each intercept.';
                    self.invalidInputEnteredGiveAnotherTry = true;
                }
                else {
                    self.progressionTool.explanationMessage = self.expectedAnswer.explanation;
                }

                self.$intercept.attr('disabled', true);

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$interceptPrompt = $thisTool.find('.intercept-prompt');
        this.$instructions = $thisTool.find('#instructions-' + this.id);
        this.$intercept = $thisTool.find('#intercept-' + this.id);
        this.$interceptLabel = $thisTool.find('#intercept-label-' + this.id);

        // Initialize equation
        this.makeLevel(0);
        this.$intercept.attr('disabled', true);

        // Add event listeners
        this.$intercept.keypress(function(event) {
            // If enter key is pressed, then force Check
            if (event.keyCode === 13) {
                self.progressionTool.check();
            }
        });
    };

    /*
        Return whether the |input| is an integer, either positive or negative.
        |input| is required and a string.
    */
    this.isInputAnInteger = function(input) {
        return (/^-?\d+$/.test(input));
    };

    /*
        Return the y-intercept given the |xIntercept| and |slope|.
        |xIntercept| and |slope| are required and number.
    */
    this.computeYIntercept = function(xIntercept, slope) {
        return (-1 * xIntercept * slope);
    };

    /*
        Return a string showing x-intercept solving, given |slope|, |yIntercept|, and |currentQuestion|.
        |slope| and |yIntercept| are required and numbers.
        |currentQuestion| is required and a number.
        |yCoefficient| is optional and a number.
    */
    this.stringifyXInterceptSolving = function(slope, yIntercept, currentQuestion, yCoefficient) {
        var xInterceptSolving = 'Find x-intercept by setting y to 0:<br/>';

        // For |currentQuestion| 1, 2, and 3, prepend the equation with the yCoefficient.
        if ([ 1, 2, 3 ].indexOf(currentQuestion) !== -1) {
            slope *= yCoefficient;
            yIntercept *= yCoefficient;
            xInterceptSolving += this.utilities.stringifyConstantValue(yCoefficient, true, true) + ' ' + this.utilities.multiplicationSymbol + ' ';
        }

        // For |currentQuestion| 2, move x to the left-side of the equation
        if (currentQuestion === 2) {
            xInterceptSolving += '0' + this.utilities.stringifyConstantValue(-1 * slope) + 'x = ' + this.utilities.stringifyConstantValue(yIntercept, true, true) + '<br/>';
        }
        // For |currentQuestion| 3, move the constant to the left-side of the equation
        else if (currentQuestion === 3) {
            xInterceptSolving += '0' + this.utilities.stringifyConstantValue(-1 * yIntercept, false, true) + ' = ' + this.utilities.stringifyConstantValue(slope, true) + 'x' + '<br/>';
        }
        // Else, move x to the right-side.
        else {
            xInterceptSolving += '0 = ' + this.utilities.stringifyConstantValue(slope, true) + 'x ' + this.utilities.stringifyConstantValue(yIntercept, false, true) + '<br/>';
        }

        if (currentQuestion === 1) {
            xInterceptSolving += '0 = ' + this.utilities.stringifyConstantValue(slope, true) + 'x ' + this.utilities.stringifyConstantValue(yIntercept, false, true) + '<br/>';
        }

        // For |currentQuestion| 0, 1, and 2, x is on the left-side
        if ([ 0, 1, 2 ].indexOf(currentQuestion) !== -1) {
            xInterceptSolving += this.utilities.stringifyConstantValue(-1 * slope, true) + 'x = ' + this.utilities.stringifyConstantValue(yIntercept, true, true) + '<br/>';

            // If the slope is not -1, then divide both sides by slope.
            if (slope !== -1) {
                xInterceptSolving += 'x = ' + this.utilities.stringifyConstantValue(yIntercept, true, true) + ' / ' + this.utilities.stringifyConstantValue(-1 * slope, true, true) + '<br/>';
                xInterceptSolving += 'x = ' + this.utilities.stringifyConstantValue(yIntercept / (-1 * slope), true, true);
            }
        }
        // Otherwise, x is on the right-side
        else {
            xInterceptSolving += this.utilities.stringifyConstantValue(-1 * yIntercept, true, true) + ' = ' + this.utilities.stringifyConstantValue(slope, true) + 'x<br/>';

            // If the slope is not 1, then divide both sides by slope.
            if (slope !== 1) {
                xInterceptSolving += this.utilities.stringifyConstantValue(-1 * yIntercept / slope, true, true) + ' = ' + this.utilities.stringifyConstantValue(slope, true) + 'x' + ' / ' + this.utilities.stringifyConstantValue(slope, true, true) + '<br/>';
                xInterceptSolving += this.utilities.stringifyConstantValue(-1 * yIntercept / slope, true, true) + ' = ' + 'x<br/>';
            }

            xInterceptSolving += 'x = ' + this.utilities.stringifyConstantValue(-1 * yIntercept / slope, true, true) + '<br/>';
        }

        return xInterceptSolving;
    };

    /*
        Return the given |string| wrapped with tags to bold the font.
        |string| is required and a string.
    */
    this.addBoldFontWrapper = function(string) {
        return ('<span class="font-weight-bold">' + string + '</span>');
    };

    /*
        Return a string showing y-intercept solving, given |slope| and |yIntercept|.
        |slope| and |yIntercept| are required and numbers.
        |explainAsSecondStep| is optional and a boolean. If true, then the explanation wording assumes a previous step.
    */
    this.stringifyYInterceptSolving = function(slope, yIntercept, explainAsSecondStep) {
        explainAsSecondStep = explainAsSecondStep || false;

        var yInterceptSolving = explainAsSecondStep ? 'Then f' : 'F';
        yInterceptSolving += 'ind y-intercept from y = mx + ' + this.addBoldFontWrapper('b') + ' form:<br/>';
        yInterceptSolving += 'y = ' + this.utilities.stringifyConstantValue(slope, true, true) + 'x' + this.addBoldFontWrapper(this.utilities.stringifyConstantValue(yIntercept, false, true)) + '<br/>';
        yInterceptSolving += 'So, y-intercept is ' + this.addBoldFontWrapper(this.utilities.stringifyConstantValue(yIntercept, true, true)) + '.';

        return yInterceptSolving;
    };

    /*
        Show steps to divide right-side of equation by y's coefficient.
        |yCoefficient|, |slope|, |yIntercept| are required and numbers.
    */
    this.stringifyInterceptFormWithYCoEfficient = function(yCoefficient, slope, yIntercept) {
        var stringified = 'y = (' + this.utilities.stringifyConstantValue(yCoefficient * slope, true) + 'x / ' + this.utilities.stringifyConstantValue(yCoefficient, true, true) + ') + (' + this.utilities.stringifyConstantValue(yCoefficient * yIntercept, true, true) + ' / ' + this.utilities.stringifyConstantValue(yCoefficient, true, true) + ')<br/>';
        stringified += 'y = ' + this.utilities.stringifyConstantValue(slope, true) + 'x ' + this.utilities.stringifyConstantValue(yIntercept, false, true) + '<br/>';

        return stringified;
    };

    /*
        Return explanation for conversion to slope-intercept form.
        |instructions| is required and a string.
    */
    this.explanationForConversionToSlopeInterceptForm = function(instructions) {
        var explanation = 'Convert to slope-intercept form:<br/>';
        explanation += instructions + '<br/>';

        return explanation;
    };

    /*
        Return the explanation for a conversion to slope-intercept form that has extra terms on the left-side of the equation,
        e.g., y + 2x = 4.
        |instructions| is required and a string.
        |yCoefficient|, |slope|, and |yIntercept| are required and each is a number.
    */
    this.explanationForConversionToSlopeInterceptFormWithExtraTermsOnLeftSide = function(instructions, yCoefficient, slope, yIntercept) {
        var explanation = this.explanationForConversionToSlopeInterceptForm(instructions);
        explanation += this.utilities.stringifyConstantValue(yCoefficient, true) + 'y = ' + this.utilities.stringifyConstantValue(yCoefficient * slope, true) + 'x' + this.utilities.stringifyConstantValue(yCoefficient * yIntercept, false, true) + '<br/>';
        explanation += this.stringifyInterceptFormWithYCoEfficient(yCoefficient, slope, yIntercept);

        return explanation;
    };

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.makeLevel = function(currentQuestionNumber) {
        var xIntercept = this.utilities.pickNumberInRange(-5, 5, [ 0 ]);
        var slope = this.utilities.pickNumberInRange(-3, 3, [ 0 ]);
        var yIntercept = this.computeYIntercept(xIntercept, slope);
        var yCoefficient = this.utilities.pickNumberInRange(-3, 3, [ 0, 1 ]);

        var instructions = '';
        var xExplanation = '';
        var yExplanation = '';

        // Ex: y = -2 - 3
        if (currentQuestionNumber === 0) {
            instructions = 'y = ' + this.utilities.stringifyConstantValue(slope, true) + 'x ' + this.utilities.stringifyConstantValue(yIntercept, false, true);
            xExplanation = this.stringifyXInterceptSolving(slope, yIntercept, currentQuestionNumber);
            yExplanation = this.stringifyYInterceptSolving(slope, yIntercept);
        }
        // Ex: -2y = -2x + 6
        else if (currentQuestionNumber === 1) {
            instructions = this.utilities.stringifyConstantValue(yCoefficient, true) + 'y = ' + this.utilities.stringifyConstantValue(yCoefficient * slope, true) + 'x ' + this.utilities.stringifyConstantValue(yCoefficient * yIntercept, false, true);
            xExplanation = this.stringifyXInterceptSolving(slope, yIntercept, currentQuestionNumber, yCoefficient);
            yExplanation = this.explanationForConversionToSlopeInterceptForm(instructions) + this.stringifyInterceptFormWithYCoEfficient(yCoefficient, slope, yIntercept) + this.stringifyYInterceptSolving(slope, yIntercept, true);
        }
        // Ex: 3y - 6x = 30
        else if (currentQuestionNumber === 2) {
            instructions = this.utilities.stringifyConstantValue(yCoefficient, true) + 'y' + this.utilities.stringifyConstantValue(-1 * yCoefficient * slope) + 'x = ' + this.utilities.stringifyConstantValue(yCoefficient * yIntercept, true, true);
            xExplanation = this.stringifyXInterceptSolving(slope, yIntercept, currentQuestionNumber, yCoefficient);
            yExplanation = this.explanationForConversionToSlopeInterceptFormWithExtraTermsOnLeftSide(instructions, yCoefficient, slope, yIntercept) + this.stringifyYInterceptSolving(slope, yIntercept, true);
        }
        // Ex: 2y + 12 = -6x
        else if (currentQuestionNumber === 3) {
            instructions = this.utilities.stringifyConstantValue(yCoefficient, true) + 'y' + this.utilities.stringifyConstantValue(-1 * yCoefficient * yIntercept, false, true) + ' = ' + this.utilities.stringifyConstantValue(yCoefficient * slope, true) + 'x';
            xExplanation = this.stringifyXInterceptSolving(slope, yIntercept, currentQuestionNumber, yCoefficient);
            yExplanation = this.explanationForConversionToSlopeInterceptFormWithExtraTermsOnLeftSide(instructions, yCoefficient, slope, yIntercept) + this.stringifyYInterceptSolving(slope, yIntercept, true);
        }

        var interceptToUse = '';
        if (this.useXIntercept) {
            interceptToUse = 'x';
            this.expectedAnswer = {
                intercept:   String(xIntercept),
                explanation: xExplanation
            };
        }
        else {
            interceptToUse = 'y';
            this.expectedAnswer = {
                intercept:   String(yIntercept),
                explanation: yExplanation
            };
        }

        this.$instructions.html(instructions);
        this.$interceptPrompt.text('Find the ' + interceptToUse + '-intercept for');
        this.$interceptLabel.text(interceptToUse + '-intercept:');

        // Reset and enable inputs
        this.$intercept.val('');
        this.$intercept.attr('disabled', false);
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var linearFunctionsExport = {
    create: function() {
        return new LinearFunctions();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = linearFunctionsExport;
