function CompoundProposition() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        if (options) {
            this.useShortAnswer = (options.useShortAnswer || false);
            this.useConditionalOperators = (this.useShortAnswer && options.useConditionalOperators);
        }

        // The symbols the tool can interpret.
        this.validOperators = [ '∨', '∧', '¬' ];
        if (this.useConditionalOperators) {
            this.validOperators.push('→', '↔');
        }
        this.validSymbols = [ 'r', 'q', 'p' ].concat(this.validOperators, [ '(', ')' ]);

        /*
            An |expectedAnswer| includes a list of |expectedDropdowns|, a |shortAnswerProposition|, and an |explanation|.
            |expectedDropdowns| is a list and required.
            |shortAnswerProposition| is a string and required.
            |explanation| is string and required.
            Written during |generateQuestion| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            expectedDropdowns:      [],
            shortAnswerProposition: '',
            explanation:            ''
        };

        this.utilities = require('utilities');
        this.discreteMathUtilities = require('discreteMathUtilities');
        this.progressionTool = require('progressionTool').create();

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['compoundProposition']();

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 5,
            useMultipleParts: true,
            start: function() {
                self.generateQuestion(0);
                self.focusOnAppropriateInput();
                self.addPickOneToDropdown();
            },
            reset: function() {
                self.generateQuestion(0);
                self.disableInputs();
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.generateQuestion(currentQuestion);
                    self.addPickOneToDropdown();
                }
                else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.disableInputs(true);
                }
                self.focusOnAppropriateInput();
            },
            isCorrect: function(currentQuestion) {
                var userAnswer;
                var expectedAnswer;
                var userEnteredInvalidAnswer;
                var isAnswerCorrect;
                var shortAnswerUserEnteredOperatorOnly = false;

                if (self.useShortAnswer) {
                    userAnswer = self.replaceLookalikeSymbols(self.$inputs.val());
                    shortAnswerUserEnteredOperatorOnly = self.userAnswerContainsOnlyAnOperator(userAnswer);
                    userEnteredInvalidAnswer = !self.shortAnswerIsValid(userAnswer);
                    expectedAnswer = self.expectedAnswer.shortAnswerProposition;
                    isAnswerCorrect = self.discreteMathUtilities.areLogicallyEquivalentPropositions(userAnswer, expectedAnswer, self.variables);
                }
                else {
                    // Build array of the user-selected option in each dropdown.
                    userAnswer = [];
                    self.$inputs.each(function() {
                        // Store user-selected option in |answer|.
                        var answer = $(this).find(':selected').val();
                        userAnswer.push(answer);
                    });

                    // User did not select an option for at least 1 dropdown.
                    userEnteredInvalidAnswer = (userAnswer.indexOf('default') !== -1);

                    expectedAnswer = self.expectedAnswer.expectedDropdowns;
                    isAnswerCorrect = self.doArraysContainSameElementInSameOrder(userAnswer, expectedAnswer);

                    userAnswer = JSON.stringify(userAnswer);
                    expectedAnswer = JSON.stringify(expectedAnswer);
                }

                self.disableInputs();

                var explanationMessage = self.expectedAnswer.explanation;

                // If user answer is just an operator or contains invalid symbols, then give the user another try.
                if (shortAnswerUserEnteredOperatorOnly || userEnteredInvalidAnswer) {
                    self.invalidInputEnteredGiveAnotherTry = true;
                    isAnswerCorrect = false;

                    if (shortAnswerUserEnteredOperatorOnly) {
                        explanationMessage = 'You entered an operator but should enter a proposition. Ex: a ∧ b';
                    }
                    else {
                        explanationMessage = self.useShortAnswer ? 'Valid symbols are: ' + self.makeValidSymbolList() + '.' : 'Pick an option';
                    }
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         userAnswer,
                    expectedAnswer:     expectedAnswer,
                    isCorrect:          isAnswerCorrect
                };
            }
        });

        // Cache regularly used DOM objects.
        var $thisTool = $('#' + this.id);
        this.$propositionInWords = $thisTool.find('.proposition-in-words');
        this.$propositionInSymbols = $thisTool.find('.proposition-in-symbols');
        this.$variablesList = $thisTool.find('.variables-list');

        if (this.useShortAnswer) {
            var shortAnswerHTML = this[this.name]['shortAnswer']();
            this.$propositionInSymbols.html(shortAnswerHTML);
            this.$inputs = $thisTool.find('.proposition-input');

            // Execute check() when enter key pressed.
            this.$inputs.keypress(function(event) {
                if (event.keyCode === self.utilities.ENTER_KEY) {
                    self.progressionTool.check();
                }
            });

            symbolsToIncludeInPalette = [ '¬', '∧', '∨' ];
            if (this.useConditionalOperators) {
                symbolsToIncludeInPalette.push('→', '↔');
            }

            this.propositionSymbolPalette = require('symbolPalette').create();
            this.propositionSymbolPalette.init(this.$inputs, {
                symbols: symbolsToIncludeInPalette
            });
        }

        this.generatePotentialQuestions();
        this.generateQuestion(0);
        this.disableInputs();
    };

    /*
        Return whether |userAnswer| contains only a single operator.
        |userAnswer| is required and a string.
    */
    this.userAnswerContainsOnlyAnOperator = function(userAnswer) {
        userAnswer = this.utilities.removeWhitespace(userAnswer);
        return this.validOperators.some(function(validOperator) {
            return (userAnswer === validOperator);
        });
    };

    // Return a string of the valid symbols. Ex: r, q, and p
    this.makeValidSymbolList = function() {
        var validSymbolList = '';
        var self = this;
        this.validSymbols.forEach(function(symbol, index) {
            if (index < (self.validSymbols.length - 1)) {
                validSymbolList += symbol + ', ';
            }
            else {
                validSymbolList += 'and ' + symbol;
            }
        });
        return validSymbolList;
    };

    // For each drop down in |this.$inputs|, add the text 'Pick one' to the first option.
    this.addPickOneToDropdown = function() {
        if (!this.shortAnswer) {
            this.$inputs.each(function() {
                $(this).find('option').eq(0).text('Pick one');
            });
        }
    };

    /*
        Return |symbol| escaped for a regular expression if escaping was needed.
        |symbol| is required and a string.
    */
    this.escapeForRegularExpression = function(symbol) {
        var symbolsThatNeedEscaping = [ '.', '$', '^', '{', '[', '(', '|', ')', '*', '+', '?', '\\' ];
        if (symbolsThatNeedEscaping.indexOf(symbol) !== -1) {
            symbol = '\\' + symbol;
        }
        return symbol;
    };

    /*
        Return whether |shortAnswer| contains only valid symbols.
        |shortAnswer| is required and a string.
    */
    this.shortAnswerIsValid = function(shortAnswer) {
        // Build regular expression of valid symbols
        var validSymbolsForRegularExpression = '';
        var self = this;
        this.validSymbols.forEach(function(symbol) {
            validSymbolsForRegularExpression += self.escapeForRegularExpression(symbol);
        });
        var validCharactersRegEx = new RegExp('^[' + validSymbolsForRegularExpression + '\\s]*$');

        var hasValidCharacters = validCharactersRegEx.test(shortAnswer);
        var isJustWhitespace = /^\s*$/.test(shortAnswer);
        return (hasValidCharacters && !isJustWhitespace);
    };

    /*
        Replace lookalike symbols in |shortAnswer|.
        |shortAnswer| is required and a string.
    */
    this.replaceLookalikeSymbols = function(shortAnswer) {
        // ^ looks like ∧, v looks like ∨, and V looks like ∨.
        return (shortAnswer.replace(/\^/g, '∧').replace(/v/g, '∨').replace(/V/g, '∨'));
    };

    /*
        Return whether |array1| and |array2| contain the same elements at each index.
        |array1| and |array2| are required and arrays.
    */
    this.doArraysContainSameElementInSameOrder = function(array1, array2) {
        /*
            Return true if:
            (a) The arrays have the same length.
            (b) For each index, the element at that index in |array1| is the same in |array2|.
        */
        var areArraysSameLength = array1.length === array2.length;
        var doElementsInArray1MatchArray2 = array1.every(function(element, index) {
            return element === array2[index];
        });
        return areArraysSameLength && doElementsInArray1MatchArray2;
    };

    /*
        Disable |$inputs| unless |enableInputs| is true.
        |enableInputs| is optional, boolean, and defaulted to false.
    */
    this.disableInputs = function(enableInputs) {
        enableInputs = enableInputs || false;
        this.$inputs.attr('disabled', !enableInputs);
    };

    // If |useShortAnswer| is true, then focus on |$inputs|.
    this.focusOnAppropriateInput = function() {
        if (this.useShortAnswer) {
            this.$inputs.focus();
        }
    };

    this.notSymbol = '&not;';
    this.andSymbol = '&and;';
    this.orSymbol = '&or;';
    this.variables = [ 'p', 'q', 'r' ];
    this.symbolsToEnglish = {
        'p':  'the weather is bad',
        '¬p': 'the weather is good',
        'q':  'the trip is cancelled',
        '¬q': 'the trip is not cancelled',
        'r':  'the trip is delayed',
        '¬r': 'the trip is not delayed',
        '∧':  ' and ',
        '∨':  ' or ',
        '¬':  'the opposite of',
        '(':  ' (',
        ')':  ') '
    };
    this.symbolsToEnglishFutureTense = {
        'p':  'the weather will be bad',
        '¬p': 'the weather will be good',
        'q':  'the trip will be cancelled',
        '¬q': 'the trip will not be cancelled',
        'r':  'the trip will be delayed',
        '¬r': 'the trip will not be delayed',
    };
    this.symbolsToEnglishUsingBeing = {
        'p':  'the weather being bad',
        '¬p': 'the weather being good',
        'q':  'the trip being cancelled',
        '¬q': 'the trip not being cancelled',
        'r':  'the trip being delayed',
        '¬r': 'the trip not being delayed',
    };
    this.symbolsToEnglishUsingToBe = {
        'p':  'the weather to be bad',
        '¬p': 'the weather not to be good',
        'q':  'the trip to be cancelled',
        '¬q': 'the trip not to be cancelled',
        'r':  'the trip to be delayed',
        '¬r': 'the trip not to be delayed',
    };

    this.harderConnectorsSymbolsToEnglish = {
        '∧':  ', but '
    };

    /*
        Capitalize first word and add period to the end of |sentence|.
        |sentence| is required and a string.
    */
    this.initialCapitalizeAndAddPeriod = function(sentence) {
        // Remove extra space before/after sentence.
        var trimmedSentence = sentence.trim();

        // Capitolize the first character.
        var initialCapitalLetter = trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1);

        // Add period to end of sentence.
        var addPeriodToEnd = initialCapitalLetter + '.';

        return addPeriodToEnd;
    };

    /*
        Tokenize a |proposition| into an array of tokens.
        Each token is a symbol in |this.symbolsToEnglish| or a parens.
        |proposition| is required and a string, e.g., '¬p' or '¬(p) ∧ (q)'.
    */
    this.tokenizePropositionInSymbols = function(proposition) {
        var tokens = [];
        for (var i = 0; i < proposition.length; i++) {
            var character = proposition[i];
            var token = character;

            // Check for ¬variable, e.g., ¬p.
            // If ¬ and there are more characters, then check whether the next character is a variable.
            var thereAreMoreCharacters = ((i + 1) < proposition.length);
            if ((character === '¬') && thereAreMoreCharacters) {
                var nextCharacter = proposition[i + 1];
                // Check whether the next character is a variable
                if (this.variables.indexOf(nextCharacter) !== -1) {
                    // Add the variable to the token, then skip over processing the variable
                    token += nextCharacter;
                    i++;
                }
            }

            tokens.push(token);
        }
        return tokens;
    };

    /*
        Convert |tokens| to English.
        |tokens| are required and an array of strings, e.g., ['¬', '(', 'p', ')', '∧', 'q'].
        |useHarderConnectors| is optional and boolean. If true, then use connectors like "but" and "neither/nor".
    */
    this.convertTokensToEnglish = function(tokens, useHarderConnectors) {
        useHarderConnectors = useHarderConnectors || false;

        var english = '';
        var self = this;
        // Convert each token to English.
        tokens.forEach(function(token) {
            if (useHarderConnectors && (token in self.harderConnectorsSymbolsToEnglish)) {
                english += self.harderConnectorsSymbolsToEnglish[token];
            }
            else {
                english += self.symbolsToEnglish[token];
            }
        });
        return english;
    };

    /*
        Convert |propositionInSymbols| into a proposition in English.
        |propositionInSymbols| is required and a string including characters from |this.symbolsToEnglish|.
        |useHarderConnectors| is optional and boolean. If true, then use connectors like "but" and "neither/nor".
    */
    this.generatePropositionInWords = function(propositionInSymbols, useHarderConnectors) {
        useHarderConnectors = useHarderConnectors || false;

        var propositionTokens = this.tokenizePropositionInSymbols(propositionInSymbols);
        var propositionInEnglish = this.convertTokensToEnglish(propositionTokens, useHarderConnectors);
        return this.initialCapitalizeAndAddPeriod(propositionInEnglish);
    };

    /*
        Generate the 4-step explanation based on the |proposition| and the |propositionWithParens|.
        |proposition| and |propositionWithParens| are required and strings of compound propositions, e.g., ¬p∧q.
        |useHarderConnectors| is optional and boolean. If true, then use connectors like "but" and "neither/nor".
    */
    this.generateExplanation = function(proposition, propositionWithParens, useHarderConnectors) {
        useHarderConnectors = useHarderConnectors || false;

        var step1 = this.generatePropositionInWords(proposition, useHarderConnectors);
        var step2 = this.generatePropositionInWords(propositionWithParens);
        var step3 = propositionWithParens;
        var step4 = proposition;

        return (step1 + this.utilities.getNewline() + step2 + this.utilities.getNewline() + step3 + this.utilities.getNewline() + step4);
    };

    /*
        Generate all combinations of two variables and one operator, including pruning for combinations that don't make sense.
        |variables| is required and is an array of variables, e.g., ['p', 'q', 'r'].
        |operators| is required and is an array of operators, e.g., ['∧', '∨'].
        |newQuestionCallBack| is required and is a function that returns a new question.
    */
    this.twoVariableAndOneOperatorLoops = function(newQuestionCallBack) {
        var operators = [ '∧', '∨' ];
        var self = this;
        this.variables.forEach(function(variableOne) {
            self.variables.forEach(function(variableTwo) {
                operators.forEach(function(operator) {
                    // The generated sentence doesn't make sense with the same variable logical-or to itself.
                    var variableValuesAreSame = (variableOne === variableTwo);

                    // The generated sentence doesn't make sense with q∧r.
                    var propositionIsQAndR = (operator === '∧') && ((variableOne === 'q') && (variableTwo === 'r')) || ((variableOne === 'r') && (variableTwo === 'q'));

                    if (!variableValuesAreSame && !propositionIsQAndR) {
                        newQuestionCallBack(variableOne, variableTwo, operator);
                    }
                });
            });
        });
    };

    // Build questions that require one variable to answer.
    this.generateOneVariableQuestions = function() {
        var oneVariableQuestions = [];

        var self = this;
        // Questions with the form: ¬p
        this.variables.forEach(function(variable) {
            var newQuestion = {
                proposition:           '¬' + variable,
                propositionWithParens: '¬(' + variable + ')',
                expectedDropdowns:     [ variable ],
                propositionInSymbols:  self.notSymbol + self.dropdownVariablesHTML
            };
            oneVariableQuestions.push(newQuestion);
        });

        // Example form: p∧q.
        this.twoVariableAndOneOperatorLoops(function(variableOne, variableTwo, operator) {
            var newQuestion = {
                proposition:           variableOne + operator + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '(' + variableTwo + ')',
                expectedDropdowns:     [ variableTwo ],
                propositionInSymbols:  variableOne + operator + self.dropdownVariablesHTML
            };
            oneVariableQuestions.push(newQuestion);
        });

        return oneVariableQuestions;
    };

    // Build questions that require two variables to answer.
    this.generateTwoVariableQuestions = function() {
        var twoVariableQuestions = [];

        var self = this;
        this.twoVariableAndOneOperatorLoops(function(variableOne, variableTwo, operator) {
            // Example form: ¬p∧q.
            var newQuestionOne = {
                proposition:           '¬' + variableOne + operator + variableTwo,
                propositionWithParens: '¬(' + variableOne + ')' + operator + '(' + variableTwo + ')',
                expectedDropdowns:     [ variableOne, variableTwo ],
                propositionInSymbols:  self.notSymbol + self.dropdownVariablesHTML + operator + self.dropdownVariablesHTML
            };
            twoVariableQuestions.push(newQuestionOne);

            // Example form: p∧¬q.
            var newQuestionTwo = {
                proposition:           variableOne + operator + '¬' + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '¬(' + variableTwo + ')',
                expectedDropdowns:     [ variableOne, variableTwo ],
                propositionInSymbols:  self.dropdownVariablesHTML + operator + self.notSymbol + self.dropdownVariablesHTML
            };
            twoVariableQuestions.push(newQuestionTwo);
        });

        return twoVariableQuestions;
    };

    // Build questions that require one operator to answer.
    this.generateOneOperatorQuestions = function() {
        var oneOperatorQuestions = [];

        var self = this;
        // Example form: ¬p.
        this.variables.forEach(function(variable) {
            var newQuestion = {
                proposition:           '¬' + variable,
                propositionWithParens: '¬(' + variable + ')',
                expectedDropdowns:     [ '¬' ],
                propositionInSymbols:  self.dropdownOperatorsHTML + variable
            };
            oneOperatorQuestions.push(newQuestion);
        });

        // Example form: p∧q.
        this.twoVariableAndOneOperatorLoops(function(variableOne, variableTwo, operator) {
            var newQuestion = {
                proposition:           variableOne + operator + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '(' + variableTwo + ')',
                expectedDropdowns:     [ operator ],
                propositionInSymbols:  variableOne + self.dropdownOperatorsHTML + variableTwo
            };
            oneOperatorQuestions.push(newQuestion);
        });

        return oneOperatorQuestions;
    };

    // Build questions that require two operators to answer.
    this.generateTwoOperatorQuestions = function() {
        var twoOperatorQuestions = [];

        var self = this;
        this.twoVariableAndOneOperatorLoops(function(variableOne, variableTwo, operator) {
            // Example form: ¬p∧q.
            var newQuestionOne = {
                proposition:           '¬' + variableOne + operator + variableTwo,
                propositionWithParens: '¬(' + variableOne + ')' + operator + '(' + variableTwo + ')',
                expectedDropdowns:     [ '¬', operator ],
                propositionInSymbols:  self.dropdownOperatorsHTML + variableOne + self.dropdownOperatorsHTML + variableTwo
            };
            twoOperatorQuestions.push(newQuestionOne);

            // Example form: p∧¬q.
            var newQuestionTwo = {
                proposition:           variableOne + operator + '¬' + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '¬(' + variableTwo + ')',
                expectedDropdowns:     [ operator, '¬' ],
                propositionInSymbols:  variableOne + self.dropdownOperatorsHTML + self.dropdownOperatorsHTML + variableTwo
            };
            twoOperatorQuestions.push(newQuestionTwo);
        });

        return twoOperatorQuestions;
    };

    // Build questions that require one variable and one operator to answer.
    this.generateOneOperatorOneVariableQuestions = function() {
        var oneOperatorOneVariableQuestions = [];

        var self = this;
        this.twoVariableAndOneOperatorLoops(function(variableOne, variableTwo, operator) {
            // Example form: p∧q   -- user picks the first variable.
            var variableOneOperatorVariableTwo = {
                proposition:           variableOne + operator + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '(' + variableTwo + ')'
            };
            var newQuestionOne = jQuery.extend({}, variableOneOperatorVariableTwo, {
                expectedDropdowns:    [ variableOne, operator ],
                propositionInSymbols: self.dropdownVariablesHTML + self.dropdownOperatorsHTML + variableTwo
            });
            oneOperatorOneVariableQuestions.push(newQuestionOne);

            // Example form: p∧q   -- user picks the second variable.
            var newQuestionTwo = jQuery.extend({}, variableOneOperatorVariableTwo, {
                expectedDropdowns:    [ operator, variableTwo ],
                propositionInSymbols: variableOne + self.dropdownOperatorsHTML + self.dropdownVariablesHTML
            });
            oneOperatorOneVariableQuestions.push(newQuestionTwo);

            // Example form: ¬p∧q   -- user picks the first variable and the first operator.
            var notVariableOnOperatorVariableTwo = {
                proposition:           '¬' + variableOne + operator + variableTwo,
                propositionWithParens: '¬(' + variableOne + ')' + operator + '(' + variableTwo + ')'
            };
            var newQuestionThree = jQuery.extend({}, notVariableOnOperatorVariableTwo, {
                expectedDropdowns:    [ '¬', variableOne ],
                propositionInSymbols: self.dropdownOperatorsHTML + self.dropdownVariablesHTML + operator + variableTwo
            });
            oneOperatorOneVariableQuestions.push(newQuestionThree);

            // Example form: ¬p∧q   -- user picks the first variable and the second operator.
            var newQuestionFour = jQuery.extend({}, notVariableOnOperatorVariableTwo, {
                expectedDropdowns:    [ variableOne, operator ],
                propositionInSymbols: '¬' + self.dropdownVariablesHTML + self.dropdownOperatorsHTML + variableTwo
            });
            oneOperatorOneVariableQuestions.push(newQuestionFour);

            // Example form: ¬p∧q   -- user picks the second variable and the first operator.
            var newQuestionFive = jQuery.extend({}, notVariableOnOperatorVariableTwo, {
                expectedDropdowns:    [ '¬', variableTwo ],
                propositionInSymbols: self.dropdownOperatorsHTML + variableOne + operator + self.dropdownVariablesHTML
            });
            oneOperatorOneVariableQuestions.push(newQuestionFive);

            // Example form: ¬p∧q   -- user picks the second variable and the second operator.
            var newQuestionSix = jQuery.extend({}, notVariableOnOperatorVariableTwo, {
                expectedDropdowns:    [ operator, variableTwo ],
                propositionInSymbols: '¬' + variableOne + self.dropdownOperatorsHTML + self.dropdownVariablesHTML
            });
            oneOperatorOneVariableQuestions.push(newQuestionSix);

            // Example form: p∧¬q   -- user picks the first variable and the first operator.
            var variableOnOperatorNotVariableTwo = {
                proposition:           variableOne + operator + '¬' + variableTwo,
                propositionWithParens: '(' + variableOne + ')' + operator + '¬(' + variableTwo + ')'
            };
            var newQuestionSeven = jQuery.extend({}, variableOnOperatorNotVariableTwo, {
                expectedDropdowns:    [ variableOne, operator ],
                propositionInSymbols: self.dropdownVariablesHTML + self.dropdownOperatorsHTML + '¬' + variableTwo
            });
            oneOperatorOneVariableQuestions.push(newQuestionSeven);

            // Example form: p∧¬q   -- user picks the first variable and the second operator.
            var newQuestionEight = jQuery.extend({}, variableOnOperatorNotVariableTwo, {
                expectedDropdowns:    [ variableOne, '¬' ],
                propositionInSymbols: self.dropdownVariablesHTML + operator + self.dropdownOperatorsHTML + variableTwo
            });
            oneOperatorOneVariableQuestions.push(newQuestionEight);

            // Example form: p∧¬q   -- user picks the second variable and the first operator.
            var newQuestionNine = jQuery.extend({}, variableOnOperatorNotVariableTwo, {
                expectedDropdowns:    [ operator, variableTwo ],
                propositionInSymbols: variableOne + self.dropdownOperatorsHTML + '¬' + self.dropdownVariablesHTML
            });
            oneOperatorOneVariableQuestions.push(newQuestionNine);

            // Example form: p∧¬q   -- user picks the second variable and the second operator.
            var newQuestionTen = jQuery.extend({}, variableOnOperatorNotVariableTwo, {
                expectedDropdowns:    [ '¬', variableTwo ],
                propositionInSymbols: variableOne + operator + self.dropdownOperatorsHTML + self.dropdownVariablesHTML
            });
            oneOperatorOneVariableQuestions.push(newQuestionTen);
        });

        return oneOperatorOneVariableQuestions;
    };

    // Generate the questions with harder connectors.
    this.generateHarderConnectors = function() {
        var harderConnectors = [];

        /*
            Example form: p∧¬q   -- proposition in words is: The weather is bad, but the trip is not canceled.
            The two forEach loops generate a total of 8 questions.
        */
        var self = this;
        [ 'q', 'r' ].forEach(function(eitherQorR) {
            [ true, false ].forEach(function(swapVariableOrder) {
                var variableOne = 'p';
                var variableTwo = eitherQorR;

                if (swapVariableOrder) {
                    var tmp = variableOne;
                    variableOne = variableTwo;
                    variableTwo = tmp;
                }

                harderConnectors.push(
                    {
                        proposition:           variableOne + '∧¬' + variableTwo,
                        propositionWithParens: '(' + variableOne + ')∧¬(' + variableTwo + ')',
                        expectedDropdowns:     [ '¬', variableTwo ],
                        propositionInSymbols:  variableOne + '∧' + self.dropdownOperatorsHTML + self.dropdownVariablesHTML
                    },
                    {
                        proposition:           '¬' + variableOne + '∧' + variableTwo,
                        propositionWithParens: '¬(' + variableOne + ')∧(' + variableTwo + ')',
                        expectedDropdowns:     [ '¬', variableOne ],
                        propositionInSymbols:  self.dropdownOperatorsHTML + self.dropdownVariablesHTML + '∧' + variableTwo
                    }
                );
            });
        });

        // These harder connectors are different enough that the functions to generate explanation and proposition in words will not work.
        var propositionOne = '¬(q∨r)';
        var propositionOneInWords = 'The trip was neither cancelled nor delayed.';
        var propositionTwo = '¬(r∨q)';
        var propositionTwoInWords = 'The trip was neither delayed nor cancelled.';
        harderConnectors.push(
            {
                proposition:           propositionOne,
                expectedDropdowns:     [ '¬', '∨' ],
                propositionInSymbols:  this.dropdownOperatorsHTML + '(q' + this.dropdownOperatorsHTML + 'r)',
                propositionInWords:    propositionOneInWords,
                explanation:           propositionOneInWords + this.utilities.getNewline() + 'The opposite of((the trip was cancelled) or (the trip was delayed))' + this.utilities.getNewline() + propositionOne
            },
            {
                proposition:           propositionTwo,
                expectedDropdowns:     [ '¬', '∨' ],
                propositionInSymbols:  this.dropdownOperatorsHTML + '(r' + this.dropdownOperatorsHTML + 'q)',
                propositionInWords:    propositionTwoInWords,
                explanation:           propositionTwoInWords + this.utilities.getNewline() + 'The opposite of((the trip was delayed) or (the trip was cancelled))' + this.utilities.getNewline() + propositionTwo
            }
        );

        return harderConnectors;
    };

    /*
        Generate a conditional operator question given |firstVariable| and |secondVariable|.
        |firstVariable| and |secondVariable| are required and strings.
    */
    this.generateConditionalOperator = function(firstVariable, secondVariable) {
        var proposition = firstVariable + '→' + secondVariable;
        var englishSentence = 'If ' + this.symbolsToEnglish[firstVariable] + ', then ' + this.symbolsToEnglishFutureTense[secondVariable] + '.';
        var englishSentenceWithParens = 'If (' + this.symbolsToEnglish[firstVariable] + '), then (' + this.symbolsToEnglishFutureTense[secondVariable] + ').';
        return {
            proposition:          proposition,
            expectedDropdowns:    [], // Not used by this question type.
            propositionInSymbols: '', // Not used by this question type.
            propositionInWords:   englishSentence,
            explanation:          englishSentence + this.utilities.getNewline() + englishSentenceWithParens + this.utilities.getNewline() + proposition
        };
    };

    // Generate questions with conditional operators. Ex: If the weather is bad, then the trip will be cancelled.
    this.generateConditionalOperators = function() {
        var conditionalOperators = [];

        /*
            Generate the following:
            If the weather is bad, then the trip will be cancelled.
            If the weather is bad, then the trip will be delayed.
            If the weather is good, then the trip will not be cancelled.
            If the weather is good, then the trip will not be delayed.
        */
        var self = this;
        [ 'p' ].forEach(function(firstVariable) {
            [ 'q', 'r' ].forEach(function(secondVariable) {
                [ '', '¬' ].forEach(function(beforeVariable) {
                    conditionalOperators.push(self.generateConditionalOperator(beforeVariable + firstVariable, beforeVariable + secondVariable));
                });
            });
        });

        // Generates: If the trip is delayed, then the trip will not be cancelled.
        conditionalOperators.push(this.generateConditionalOperator('r', '¬q'));

        // Generates: If the trip is not delayed, then the trip will not be cancelled.
        conditionalOperators.push(this.generateConditionalOperator('¬r', '¬q'));

        // Generates: If the trip is cancelled, then the trip will not be delayed.
        conditionalOperators.push(this.generateConditionalOperator('q', '¬r'));

        return conditionalOperators;
    };

    /*
        Generate a conditional operator question with sufficient condition wording, given |firstVariable| and |secondVariable|.
        |firstVariable| and |secondVariable| are required and strings.
    */
    this.generateConditionalOperatorWithSufficientConditionWording = function(firstVariable, secondVariable) {
        var proposition = firstVariable + '→' + secondVariable;
        var englishSentence = this.initialCapitalizeAndAddPeriod(this.symbolsToEnglishUsingBeing[firstVariable] + ' is a sufficient condition for ' + this.symbolsToEnglishUsingToBe[secondVariable]);
        var englishSentenceWithParens = this.initialCapitalizeAndAddPeriod('(' + this.symbolsToEnglishUsingBeing[firstVariable] + ') is a sufficient condition for (' + this.symbolsToEnglishUsingToBe[secondVariable] + ')');
        return {
            proposition:           proposition,
            expectedDropdowns:     [], // Not used by this question type.
            propositionInSymbols:  '', // Not used by this question type.
            propositionInWords:    englishSentence,
            explanation:           englishSentence + this.utilities.getNewline() + englishSentenceWithParens + this.utilities.getNewline() + proposition
        };
    };

    /*
        Generate questions with conditional operators using "sufficient condition" wording.
        Ex: The weather not being good is a sufficient condition for the trip to be cancelled.
    */
    this.generateConditionalOperatorsWithSufficientConditionWording = function() {
        var conditionalOperatorsWithSufficientConditionWording = [];

        /*
            Generate the following:
            The weather not being good is a sufficient condition for the trip to be cancelled.
            The weather not being good is a sufficient condition for the trip to be delayed.
            The weather being good is a sufficient condition for the trip to not be cancelled.
            The weather being good is a sufficient condition for the trip to not be delayed.
        */
        var self = this;
        [ 'p' ].forEach(function(firstVariable) {
            [ 'q', 'r' ].forEach(function(secondVariable) {
                [ '', '¬' ].forEach(function(beforeVariable) {
                    conditionalOperatorsWithSufficientConditionWording.push(self.generateConditionalOperatorWithSufficientConditionWording(beforeVariable + firstVariable, beforeVariable + secondVariable));
                });
            });
        });

        // Generates: The trip being delayed is a sufficient condition for the trip not to be cancelled.
        conditionalOperatorsWithSufficientConditionWording.push(this.generateConditionalOperatorWithSufficientConditionWording('r', '¬q'));

        // Generates: The trip not being delayed is a sufficient condition for the trip not to be cancelled.
        conditionalOperatorsWithSufficientConditionWording.push(this.generateConditionalOperatorWithSufficientConditionWording('¬r', '¬q'));

        // Generates: The trip being cancelled is a sufficient condition for the trip to not be delayed.
        conditionalOperatorsWithSufficientConditionWording.push(this.generateConditionalOperatorWithSufficientConditionWording('q', '¬r'));

        return conditionalOperatorsWithSufficientConditionWording;
    };

    // Generate the potential questions.
    this.generatePotentialQuestions = function() {
        var questionsNamesToGenerate = [];
        if (this.useShortAnswer) {
            if (this.useConditionalOperators) {
                questionsNamesToGenerate = [
                    'conditionalOperators',
                    'conditionalOperatorsWithSufficientConditionWording',
                    'harderConnectors',
                    'conditionalOperators',
                    'conditionalOperatorsWithSufficientConditionWording'
                ];
            }
            else {
                questionsNamesToGenerate = [
                    'oneVariableQuestions',
                    'oneVariableQuestions',
                    'twoVariableQuestions',
                    'twoVariableQuestions',
                    'harderConnectors'
                ];
            }
        }
        else {
            questionsNamesToGenerate = [
                'oneVariableQuestions',
                'twoVariableQuestions',
                'oneOperatorQuestions',
                'twoOperatorQuestions',
                'oneOperatorOneVariableQuestions'
            ];
        }

        this.dropdownVariablesHTML = this[this.name]['dropdown']({
            options: this.variables
        });

        var operators = [ '¬', '∧', '∨' ];
        this.dropdownOperatorsHTML = this[this.name]['dropdown']({
            options: operators
        });

        var questionGenerators = {
            oneVariableQuestions: {
                function:    this.generateOneVariableQuestions,
                questionSet: []
            },
            twoVariableQuestions: {
                function:    this.generateTwoVariableQuestions,
                questionSet: []
            },
            oneOperatorQuestions: {
                function:    this.generateOneOperatorQuestions,
                questionSet: []
            },
            twoOperatorQuestions: {
                function:    this.generateTwoOperatorQuestions,
                questionSet: []
            },
            oneOperatorOneVariableQuestions: {
                function:    this.generateOneOperatorOneVariableQuestions,
                questionSet: []
            },
            harderConnectors: {
                function:    this.generateHarderConnectors,
                questionSet: []
            },
            conditionalOperators: {
                function:    this.generateConditionalOperators,
                questionSet: []
            },
            conditionalOperatorsWithSufficientConditionWording: {
                function:    this.generateConditionalOperatorsWithSufficientConditionWording,
                questionSet: []
            }
        };

        // Generate questions and set |this.questions|.
        var self = this;
        this.questions = [];
        var generativeFunctionsAlreadyExecuted = [];
        questionsNamesToGenerate.forEach(function(questionNamesToGenerate) {
            var questionToGenerate = questionGenerators[questionNamesToGenerate];

            // Call generate function if not already executed.
            if (generativeFunctionsAlreadyExecuted.indexOf(questionNamesToGenerate) === -1) {
                questionToGenerate.questionSet = questionToGenerate.function.call(self);

                generativeFunctionsAlreadyExecuted.push(questionNamesToGenerate);
            }

            self.questions.push(questionToGenerate.questionSet);
        });

        // Shuffle the order of the questions in each |questionArray|.
        this.questions.forEach(function(questionArray) {
            self.utilities.shuffleArray(questionArray);
        });
    };

    // Used in |generateQuestion| function to cycle through the question array.
    this.questionIncrementor = 0;

    /*
        Generate a question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this.generateQuestion = function(currentQuestionNumber) {
        var questionArray = this.questions[currentQuestionNumber];
        var question = questionArray[this.questionIncrementor++ % questionArray.length];

        // If |questionArray| is |this.harderConnectors|, then set |useHarderConnectors| to true.
        var useHarderConnectors = questionArray === this.harderConnectors;

        this.expectedAnswer = {
            expectedDropdowns:      question.expectedDropdowns,
            shortAnswerProposition: question.proposition
        };
        this.expectedAnswer.explanation = question.explanation ? question.explanation : this.generateExplanation(question.proposition, question.propositionWithParens, useHarderConnectors);

        var listItemsHTML = this[this.name]['listItems']({
            listItems: [
                'p: The weather is bad.',
                'q: The trip is cancelled.',
                'r: The trip is delayed.'
            ]
        });
        this.$variablesList.html(listItemsHTML);

        var propositionInWords = question.propositionInWords ? question.propositionInWords : this.generatePropositionInWords(question.proposition, useHarderConnectors);
        this.$propositionInWords.text(propositionInWords);

        if (this.useShortAnswer) {
            this.$inputs.val('');
        }
        else {
            this.$propositionInSymbols.html(question.propositionInSymbols);
            this.$inputs = $('#' + this.id + ' .dropdown');
        }

        this.disableInputs(true);
    };

    <%= grunt.file.read(hbs_output) %>
}

var compoundPropositionExport = {
    create: function() {
        return new CompoundProposition();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = compoundPropositionExport;
