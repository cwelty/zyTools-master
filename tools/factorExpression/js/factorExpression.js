function FactorExpression() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        if (options && options['hasSpecialCases']) {
            this.useSpecialCaseFactoring = true;
            this.numberOfQuestions = 6;
        } else {
            this.useSpecialCaseFactoring = false;
            this.numberOfQuestions = 5;
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['factorExpression']({ id: this.id });

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         this.numberOfQuestions,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.enableButtons();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableButtons();
            },
            next: function(currentQuestion) {
                if (!self.shouldGiveUserAnotherTry) {
                    self.makeLevel(currentQuestion);
                } else {
                    self.shouldGiveUserAnotherTry = false;
                }
                self.enableButtons();
            },
            isCorrect: function(currentQuestion) {
                self.disableButtons();
                var isAnswerCorrect = false;

                // find the selected option
                var $selectedFactoredOption = $('#' + self.id + ' .selected');

                // If no option was selected, then prompt message to do so and give another try
                if ($selectedFactoredOption.length === 0) {
                    self.progressionTool.userAnswer = '';
                    self.progressionTool.explanationMessage = 'Select a factored expression.';
                    self.shouldGiveUserAnotherTry = true;
                } else {
                    self.progressionTool.userAnswer = $selectedFactoredOption.html();
                    self.progressionTool.explanationMessage = self.explanation;
                    if ($selectedFactoredOption.is(self.$correctFactoredOption)) {
                        isAnswerCorrect = true;
                    } else {
                        // If user selected wrong answer, then show correct answer.
                        // Only for the non special cases (general cases)
                        if (!self.useSpecialCaseFactoring) {
                            self.progressionTool.explanationMessage += '<br/>Answer: ' + self.progressionTool.expectedAnswer;
                        }
                    }
                }

                return isAnswerCorrect;
            }
        });

        // Used to give user another try at the same problem if no factor was selected.
        this.shouldGiveUserAnotherTry = false;

        // Used to keep track of which factored option is correct. Set in makeLevel() and read in isCorrect().
        this.$correctFactoredOption = null;

        // Used to store the explanation put together during makeLevel()
        this.explanation = '';

        // Cache regularly used DOM objects
        this.$expressionToFactor = $('#' + this.id + ' .expression-to-factor');
        this.$factoringHint = $('#' + this.id + ' .factoring-hint');
        this.$factoredOption1 = $('#' + this.id + ' .factored-option-1');
        this.$factoredOption2 = $('#' + this.id + ' .factored-option-2');
        this.$factoredOption3 = $('#' + this.id + ' .factored-option-3');

        // Initialize DOM objects
        this.makeLevel(0);
        this.disableButtons();
        this.$factoredOption1.click(function() {
            self.selectFactoredOption(self.$factoredOption1);
        });
        this.$factoredOption2.click(function() {
            self.selectFactoredOption(self.$factoredOption2);
        });
        this.$factoredOption3.click(function() {
            self.selectFactoredOption(self.$factoredOption3);
        });
    };

    this.selectFactoredOption = function($selectedFactoredOption) {
        if (!$selectedFactoredOption.hasClass('disabled')) {
            this.$factoredOption1.removeClass('selected');
            this.$factoredOption2.removeClass('selected');
            this.$factoredOption3.removeClass('selected');

            $selectedFactoredOption.addClass('selected');
        }
    };

    // Apply 'disabled' class to all buttons
    this.disableButtons = function() {
        this.$factoredOption1.addClass('disabled');
        this.$factoredOption2.addClass('disabled');
        this.$factoredOption3.addClass('disabled');
    };

    // Remove 'disabled' class to all buttons
    this.enableButtons = function() {
        this.$factoredOption1.removeClass('disabled');
        this.$factoredOption2.removeClass('disabled');
        this.$factoredOption3.removeClass('disabled');
    };

    // Return random element value from 'array' passed to this function
    this.pickRandomElementInArray = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    // Print x to the power of exponent.
    // 'exponent' is a number
    // (optional) 'base' is a string that overrides the default x base
    this.printXToThePowerOf = function(exponent, base) {
        base = base === undefined ? 'x' : base;

        // if exponent is 0, then |xToPowerOfExponent| is empty string (also default case)
        var xToPowerOfExponent = '';
        if ((exponent > 1) || (exponent < 0)) {
            xToPowerOfExponent = base + '<sup>' + exponent + '</sup>';
        } else if (exponent === 1) {
            xToPowerOfExponent = base;
        }

        return xToPowerOfExponent;
    };

    // Return a string of the multiplication symbol
    this.printMultiplicationSymbol = function() {
        return ' <span class="multiplication-symbol">&middot;</span> ';
    };

    // Return a string with proper spacing for a constant value, e.g., -4 -> ' - 4' and 3 -> ' + 3'.
    // Constant value is a number
    this.printConstantValue = function(constantValue) {
        return constantValue >= 0 ? ' + ' + constantValue : ' - ' + (-1 * constantValue);
    };

    // Randomize the order of the factor options and set the unfactor expression along with the factor options
    // Expects 4 parameters (unfactoredExpression, factoredExpression, decoyFactoredExpression1, decoyFactoredExpression2), each is a string
    // factoringHint is an optional parameter that is a string
    this.randomizeAndSetFactors = function(unfactoredExpression, factoredExpression, decoyFactoredExpression1, decoyFactoredExpression2, factoringHint) {
        factoringHint = factoringHint === undefined ? '' : factoringHint;
        var factorOptions = [ factoredExpression, decoyFactoredExpression1, decoyFactoredExpression2 ];
        this.utilities.shuffleArray(factorOptions);

        var indexOfCorrectAnswer = factorOptions.indexOf(factoredExpression);
        if (indexOfCorrectAnswer === 0) {
            this.$correctFactoredOption = this.$factoredOption1;
        } else if (indexOfCorrectAnswer === 1) {
            this.$correctFactoredOption = this.$factoredOption2;
        } else if (indexOfCorrectAnswer === 2) {
            this.$correctFactoredOption = this.$factoredOption3;
        }

        this.$expressionToFactor.html(unfactoredExpression);
        this.$factoringHint.html(factoringHint);
        this.$factoredOption1.html(factorOptions[0]);
        this.$factoredOption2.html(factorOptions[1]);
        this.$factoredOption3.html(factorOptions[2]);
    };

    // Given the currentQuestionNumber, display a randomized unfactored expression and 3 factored options
    // currentQuestionNumber is an integer
    this.makeLevel = function(currentQuestionNumber) {
        this.$factoredOption1.removeClass('selected');
        this.$factoredOption2.removeClass('selected');
        this.$factoredOption3.removeClass('selected');

        var unfactoredExpression = '';
        var factoringHint = '';
        var factoredExpression = '';
        var decoyFactoredExpression1 = '';
        var decoyFactoredExpression2 = '';

        // If not this.useSpecialCaseFactoring, then use more general (and easier) factoring questions
        // Otherwise, use the special case (and harder) factoring questions
        if (!this.useSpecialCaseFactoring) {
            if ((currentQuestionNumber === 0) || (currentQuestionNumber === 1)) {
                // randomly pick parameters for a factored expression using the notation: a(bx^c + d)
                // a and b should not be the same since they are swapped to make decoyFactoredExpression1
                // b and d should be prime and not the same value since they cannot be factored further
                var a = this.pickRandomElementInArray([ 2, 3, 4, 5, 6, 7, 8 ]);
                a = currentQuestionNumber === 1 ? (-1 * a) : a;
                var b = a;
                while (b === a) {
                    b = this.pickRandomElementInArray([ 2, 3, 5, 7 ]);
                }
                var c = this.pickRandomElementInArray([ 2, 3, 4, 5, 6, 7, 8 ]);
                var d = b;
                while (d === b) {
                    d = this.pickRandomElementInArray([ 2, 3, 5, 7 ]);
                }

                // Build the unfactored expression: [a * b]x^c + [a * d]
                unfactoredExpression = (a * b) + this.printXToThePowerOf(c) + this.printConstantValue(a * d);

                // Build the factored expression: a(bx^c + d)
                factoredExpression = a + '(' + b + this.printXToThePowerOf(c) + this.printConstantValue(d) + ')';

                if (currentQuestionNumber === 0) {
                    // Build a decoy factored expression: b(ax^c + d)
                    decoyFactoredExpression1 = b + '(' + a + this.printXToThePowerOf(c) + this.printConstantValue(d) + ')';
                } else if (currentQuestionNumber === 1) {
                    // Build a decoy factored expression: a(bx^c - d)
                    decoyFactoredExpression1 = a + '(' + b + this.printXToThePowerOf(c) + this.printConstantValue(-1 * d) + ')';
                }

                // Build a decoy factored expression: bx^c(a + d)
                decoyFactoredExpression2 = b + this.printXToThePowerOf(c) + '(' + a + this.printConstantValue(d) + ')';

                this.explanation = 'Greatest common integer: ' + a;
                this.explanation += '<br/>Greatest common variable: none';
                if (currentQuestionNumber === 1) {
                    this.explanation += '<br/>Note: ' + (a * d) + ' factors into ' + a + this.printMultiplicationSymbol() + d;
                }
            } else if ((currentQuestionNumber === 2) || (currentQuestionNumber === 3)) {
                // randomly pick parameters for a factored expression using the notation: ax^b(cx^d + ex^f)
                // a and c should not be the same since they are swapped to make decoyFactoredExpression2
                // c and e should be prime and not the same value since they cannot be factored further
                var a = this.pickRandomElementInArray([ 2, 3, 4, 5, 6, 7, 8 ]);
                a = currentQuestionNumber === 3 ? (-1 * a) : a;
                var b = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var c = a;
                while (c === a) {
                    c = this.pickRandomElementInArray([ 2, 3, 5, 7 ]);
                }
                var d = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var e = c;
                while (e === c) {
                    e = this.pickRandomElementInArray([ 2, 3, 5, 7 ]);
                }
                var f = 0;

                // Build the unfactored expression: [a * c]x^[b + d] + [a * e]x^[b + f]
                unfactoredExpression = (a * c) + this.printXToThePowerOf(b + d) + this.printConstantValue(a * e) + this.printXToThePowerOf(b + f);

                // Build the factored expression: ax^b(cx^d + ex^f)
                factoredExpression = a + this.printXToThePowerOf(b) + '(' + c + this.printXToThePowerOf(d) + this.printConstantValue(e) + this.printXToThePowerOf(f) + ')';

                if (currentQuestionNumber === 2) {
                    // Build a decoy factored expression: ax^[b - 1](cx^[d + 1] - ex^[f + 1])
                    decoyFactoredExpression1 = a + this.printXToThePowerOf(b - 1) + '(' + c + this.printXToThePowerOf(d + 1) + this.printConstantValue(e) + this.printXToThePowerOf(f + 1) + ')';
                } else if (currentQuestionNumber === 3) {
                    // Build a decoy factored expression: ax^b(cx^d - ex^f)
                    decoyFactoredExpression1 = a + this.printXToThePowerOf(b) + '(' + c + this.printXToThePowerOf(d) + this.printConstantValue(-1 * e) + this.printXToThePowerOf(f) + ')';
                }

                // Build a decoy factored expression: cx^b(ax^d + ex^f)
                decoyFactoredExpression2 = c + this.printXToThePowerOf(d) + '(' + a + this.printXToThePowerOf(b) + this.printConstantValue(e) + this.printXToThePowerOf(f) + ')';

                this.explanation = 'Greatest common integer: ' + a;
                this.explanation += '<br/>Greatest common variable: ' + this.printXToThePowerOf(b);
                if (currentQuestionNumber === 3) {
                    this.explanation += '<br/>Note: ' + (a * e) + ' factors into ' + a + this.printMultiplicationSymbol() + e;
                }
            } else if (currentQuestionNumber === 4) {
                // randomly pick parameters for a factored expression using the notation: (x + a)(x + b)
                var a = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var b = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);

                // Build the unfactored expression: x^2 + [a + b]x + [a * b]
                unfactoredExpression = this.printXToThePowerOf(2) + this.printConstantValue(a + b) + this.printXToThePowerOf(1) + this.printConstantValue(a * b);

                // Build the factored expression: (x + a)(x + b)
                factoredExpression = '(' + this.printXToThePowerOf(1) + this.printConstantValue(a) + ')(' + this.printXToThePowerOf(1) + this.printConstantValue(b) + ')';

                // Build a decoy factored expression: x(x + [a + b]) + [a * b]
                decoyFactoredExpression1 = this.printXToThePowerOf(1) + '(' + this.printXToThePowerOf(1) + this.printConstantValue(a + b) + ')' + this.printConstantValue(a * b);

                // Build a decoy factored expression: (x + 1)(x + [a * b])
                decoyFactoredExpression2 = '(' + this.printXToThePowerOf(1) + this.printConstantValue(1) + ')(' + this.printXToThePowerOf(1) + this.printConstantValue(a * b) + ')';

                this.explanation = a + this.printMultiplicationSymbol() + b + ' = ' + (a * b);
                this.explanation += '<br/>' + a + this.printXToThePowerOf(1) + ' + ' + b + this.printXToThePowerOf(1) + ' = ' + (a + b) + this.printXToThePowerOf(1);
            }
        } else {
            if ((currentQuestionNumber === 0) || (currentQuestionNumber === 1) || (currentQuestionNumber === 2)) {
                // randomly pick parameters for a factored expression using the notation: (ax^2 + b)(cx + d)
                var a = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var b = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var c = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);
                var d = this.pickRandomElementInArray([ 2, 3, 4, 5, 6 ]);

                // Group terms in pairs: ([a * c]x^3 + [a * d]x^2) + ([b * c]x + [b * d])
                var groupTermsInPairs = '(' + (a * c) + this.printXToThePowerOf(3)
                                      + this.printConstantValue(a * d) + this.printXToThePowerOf(2) + ') + '
                                      + '(' + (b * c) + this.printXToThePowerOf(1)
                                      + this.printConstantValue(b * d) + this.printXToThePowerOf(0) + ')';

                var factorGCFFromEachPair = a + this.printXToThePowerOf(2) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                          + this.printConstantValue(b) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')';

                // Build the unfactored expression: [a * c]x^3 + [a * d]x^2 + [b * c]x + [b * d]
                unfactoredExpression = (a * c) + this.printXToThePowerOf(3)
                                     + this.printConstantValue(a * d) + this.printXToThePowerOf(2)
                                     + this.printConstantValue(b * c) + this.printXToThePowerOf(1)
                                     + this.printConstantValue(b * d) + this.printXToThePowerOf(0);

                // For first question, show the user grouped terms then factor GCF
                // For second question, show the user grouped terms
                if (currentQuestionNumber === 0) {
                    factoringHint = '<br/>Group terms in pairs: ' + groupTermsInPairs
                                  + '<br/>Factor GCF from each pair: ' + factorGCFFromEachPair;
                } else if (currentQuestionNumber === 1) {
                    factoringHint = '<br/>Group terms in pairs: ' + groupTermsInPairs;
                }

                // Build the factored expression: (cx + d)(ax^2 + b)
                factoredExpression = '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                   + '(' + a + this.printXToThePowerOf(2) + this.printConstantValue(b) + ')';

                // Build a decoy factored expression: ax^2(cx + d) + b(cx + d)
                decoyFactoredExpression1 = a + this.printXToThePowerOf(2) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                         + this.printConstantValue(b) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')';

                // Build a decoy factored expression: (ax^2 + cx)(cx + d)
                decoyFactoredExpression2 = '(' + a + this.printXToThePowerOf(2) + this.printConstantValue(c) + this.printXToThePowerOf(1) + ')'
                                         + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')';

                this.explanation = 'Group terms in pairs: ' + groupTermsInPairs
                                 + '<br/>Factor GCF from each pair: ' + factorGCFFromEachPair
                                 + '<br/>Factor GCF across groups: ' + factoredExpression;
            } else if (currentQuestionNumber === 3) {
               // randomly pick parameters for a factored expression using the notation: (ax + b)(cx + d)
               // a and c cannot be the same value because they're swapped in decoyFactoredExpression1
               // b and d cannot be the same value because they're swapped in decoyFactoredExpression2
               var a = this.pickRandomElementInArray([ 2, 3, 4, 5 ]);
               var b = this.pickRandomElementInArray([ 2, 3, 4, 5 ]);
               var c = a;
               while (c === a) {
                   c = this.pickRandomElementInArray([ 1, 2, 3, 4, 5, 6 ]);
               }
               var d = b;
               while (d === b) {
                   d = this.pickRandomElementInArray([ 1, 2, 3, 4, 5, 6 ]);
               }

               // Build the unfactored expression: [a * c]x^2 + [(a * d) + (b * c)]x + [b * d]
               unfactoredExpression = (a * c) + this.printXToThePowerOf(2)
                                    + this.printConstantValue((a * d) + (b * c)) + this.printXToThePowerOf(1)
                                    + this.printConstantValue(b * d);

               // Build the factored expression: (cx + d)(ax + b)
               factoredExpression = '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                  + '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(b) + ')';

               // Build a decoy factored expression: (cx + b)(ax + d)
               decoyFactoredExpression1 = '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(b) + ')'
                                        + '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')';

               // Build a decoy factored expression: (ax + d)(cx + b)
               decoyFactoredExpression2 = '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                        + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(b) + ')';

               this.explanation = 'Factors of (' + (a * c) + this.printMultiplicationSymbol() + (b * d) + ') that sum to ' + ((a * d) + (b * c)) + ': ' + (a * d) + ' and ' + (b * c)
                                + '<br/>Factor by grouping: (' + (a * c) + this.printXToThePowerOf(2) + this.printConstantValue(a * d) + this.printXToThePowerOf(1) + ') + (' + (b * c) + this.printXToThePowerOf(1) + this.printConstantValue(b * d) + ')'
                                + '<br/>Factor GCF from each pair: ' + a + this.printXToThePowerOf(1) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')' + this.printConstantValue(b) + '(' + c + this.printXToThePowerOf(1) + this.printConstantValue(d) + ')'
                                + '<br/>Factor GCF across groups: ' + factoredExpression;
           } else if (currentQuestionNumber === 4) {
               // randomly pick parameters for a factored expression using the notation: (ax + b)^2
               // a and b are cannot be the same because they're swapped in decoyFactoredExpression1
               var a = this.pickRandomElementInArray([ -6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6 ]);
               var b = a;
               while (b === a) {
                   b = this.pickRandomElementInArray([ -6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6 ]);
               }

               // Build the unfactored expression: [a * a]x^2 + [2 * a * b]x + [b * b]
               unfactoredExpression = (a * a) + this.printXToThePowerOf(2) + this.printConstantValue(2 * a * b) + this.printXToThePowerOf(1) + this.printConstantValue(b * b);

               // Build the factored expression: (ax + b)^2
               if (a < 0) {
                  a = Math.abs(a);
                  b *= -1;
               }
               factoredExpression = '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(b) + ')<sup>2</sup>';

               // Build a decoy factored expression: (bx + a)^2
               decoyFactoredExpression1 = '(' + b + this.printXToThePowerOf(1) + this.printConstantValue(a) + ')<sup>2</sup>';

               // Build a decoy factored expression: (ax - b)^2
               decoyFactoredExpression2 = '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(-1 * b) + ')<sup>2</sup>';

               this.explanation = 'The square of the binomial a + b is: (a + b)<sup>2</sup> = a<sup>2</sup> + 2ab + b<sup>2</sup>.'
                                + '<br/>(' + a + this.printXToThePowerOf(1) + ')<sup>2</sup> + 2(' + a + this.printXToThePowerOf(1) + ')(' + b + ') + (' + b + ')<sup>2</sup> = ' + factoredExpression;
           } else if (currentQuestionNumber === 5) {
               // randomly pick parameters for a factored expression using the notation: (ax + by)(ax - by)
               // a and b are cannot be the same because they're swapped in decoyFactoredExpression1
               var a = this.pickRandomElementInArray([ 2, 3, 4, 5, 6, 7, 8 ]);
               var b = a;
               while (b === a) {
                   b = this.pickRandomElementInArray([ 2, 3, 4, 5, 6, 7, 8 ]);
               }

               // Build the unfactored expression: [a * a]x^2 - [b * b]y^2
               unfactoredExpression = (a * a) + this.printXToThePowerOf(2) + this.printConstantValue(-1 * b * b) + this.printXToThePowerOf(2, 'y');

               // Build the factored expression: (ax + by)(ax - by)
               factoredExpression = '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(b) + this.printXToThePowerOf(1, 'y') + ')(' + a + this.printXToThePowerOf(1) + this.printConstantValue(-1 * b) + this.printXToThePowerOf(1, 'y') + ')';

               // Build a decoy factored expression: (bx + ay)(bx - ay)
               decoyFactoredExpression1 = '(' + b + this.printXToThePowerOf(1) + this.printConstantValue(a) + this.printXToThePowerOf(1, 'y') + ')(' + b + this.printXToThePowerOf(1) + this.printConstantValue(-1 * a) + this.printXToThePowerOf(1, 'y') + ')';

               // Build a decoy factored expression: (ax + by)(bx - ay)
               decoyFactoredExpression2 = '(' + a + this.printXToThePowerOf(1) + this.printConstantValue(b) + this.printXToThePowerOf(1, 'y') + ')(' + (-1 * b) + this.printXToThePowerOf(1) + this.printConstantValue(a) + this.printXToThePowerOf(1, 'y') + ')';

               this.explanation = 'A difference of squares follows the pattern a<sup>2</sup> - b<sup>2</sup> = (a + b)(a - b)'
                                + '<br/>' + unfactoredExpression + ' = (' + a + this.printXToThePowerOf(1) + ')<sup>2</sup> - (' + b + this.printXToThePowerOf(1, 'y') + ')<sup>2</sup> = ' + factoredExpression;
           }
        }

        this.progressionTool.expectedAnswer = factoredExpression;
        this.randomizeAndSetFactors(unfactoredExpression, factoredExpression, decoyFactoredExpression1, decoyFactoredExpression2, factoringHint);
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var factorExpressionExport = {
    create: function() {
        return new FactorExpression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = factorExpressionExport;
