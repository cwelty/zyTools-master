function PropositionTable() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useConditional = (options && options.useConditional);

        this.initializeGlobalVariables();

        this.utilities = require('utilities');
        this.discreteMathUtilities = require('discreteMathUtilities');
        this.progressionTool = require('progressionTool').create();

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['propositionTable']();

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         this.numberOfQuestions,
            useMultipleParts: true,
            start: function() {
                self.generateQuestion(0);
                self.focusOnAppropriateInput();
            },
            reset: function() {
                self.generateQuestion(0);
                self.disableInputs();
            },
            next: function(currentQuestion) {
                if (self.userInputWasInvalid) {
                    self.userInputWasInvalid = false;

                    // For wrong truth values, clear the input field.
                    self.$truthValues.filter('.invalid-value').each(function() {
                        var $wrongTruthValue = $(this);
                        $wrongTruthValue.removeClass('invalid-value').val('');
                    });
                }
                else {
                    self.generateQuestion(currentQuestion);
                }
                self.focusOnAppropriateInput();
            },
            isCorrect: currentQuestion => {
                var isCorrect = true;
                var answerIsValid = true;

                var userAnswer = '';
                var expectedAnswer = '';
                let hadBlankAnswer = false;
                this.$truthValues.each(index => {
                    var $truthValue = this.$truthValues.eq(index);
                    var expectedValue = this.expectedTruthValues[index];
                    var userValue = $truthValue.val().toUpperCase();
                    var thisValueIsCorrect = (expectedValue === userValue);

                    hadBlankAnswer = hadBlankAnswer || (userValue === '');

                    // Valid answers are either T or F.
                    var thisValueIsInvalid = !(/^(T|F)$/.test(userValue));

                    if (thisValueIsInvalid) {
                        $truthValue.addClass('invalid-value');
                    }
                    else if (!thisValueIsCorrect) {
                        $truthValue.addClass('wrong-value');
                    }

                    userAnswer += userValue + ',';
                    expectedAnswer += expectedValue + ',';

                    answerIsValid = answerIsValid && !thisValueIsInvalid;
                    isCorrect = isCorrect && thisValueIsCorrect;
                });

                let index = 0;
                const userAnswerRows = this.tableModel.nonHeaders.map(row =>
                    row.map(element => {
                        if (element.value === '') {
                            index++;
                            return this.$truthValues.eq(index - 1).val().toUpperCase();
                        }
                        return element.value;
                    }).join(' ')
                );

                const duplicated = new Set(userAnswerRows.filter(row => userAnswerRows.indexOf(row) !== userAnswerRows.lastIndexOf(row)));

                let explanationMessage = 'Each answer must be either T or F. See highlighted.';


                if (!answerIsValid) {
                    this.userInputWasInvalid = true;
                    this.$truthValues.removeClass('wrong-value');

                    if (hadBlankAnswer) {
                        explanationMessage = 'You did not provide an answer in all fields. See highlighted.';
                    }
                }
                else if (isCorrect) {
                    explanationMessage = 'Correct.';
                }
                else {
                    const usesPattern = !this.useConditional && (currentQuestion === 4 || currentQuestion === 0); // eslint-disable-line no-magic-numbers

                    explanationMessage = 'Each wrong answer is highlighted.';
                    if (usesPattern) {
                        explanationMessage = 'Each highlighted answer does not match the pattern.';
                    }
                }

                if (duplicated.size > 0) {
                    explanationMessage += `\nYou entered duplicate row(s): ${Array.from(duplicated).join(', ')}`;
                }

                this.disableInputs();

                return {
                    isCorrect,
                    explanationMessage,
                    expectedAnswer,
                    userAnswer,
                };
            },
        });

        // Cache regularly used DOM objects.
        var $thisTool = $('#' + this.id);
        this.$table = $thisTool.find('div.table');
        this.$instructions = $thisTool.find('.instructions');

        // Initialize table.
        this.generateNonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty();
        this.initializeTableModelGeneratorFunctions();
        this.generateQuestion(0);
    };

    this.enableInputs = function() {
        this.$truthValues.attr('disabled', false);
    };

    this.disableInputs = function() {
        this.$truthValues.attr('disabled', true);
    };

    // Enable the inputs, then focus on the appropriate input.
    this.focusOnAppropriateInput = function() {
        this.enableInputs();

        // Focus on first element with no input value.
        this.$truthValues.each(function() {
            var $truthValue = $(this);
            if ($truthValue.val() === '') {
                $truthValue.focus();
                return false;
            }
        });
    };

    // Cache truth values and add event listener.
    this.setupTruthValues = function() {
        this.$truthValues = $('#' + this.id + ' input.truth-value');

        var self = this;
        this.$truthValues.keypress(function(event) {
            // Enter pressed.
            if (event.keyCode === 13) {
                self.progressionTool.check();
            }
        });
    };

    this.initializeGlobalVariables = function() {
        // Number of questions in the tool.
        this.numberOfQuestions = this.useConditional ? 5 : 8;

        /*
            The expected truth values that the user would enter.
            Written to in |generateQuestion| and read in |isCorrect|.
        */
        this.expectedTruthValues = [];

        /*
            If the user gave invalid input, then give the user another try.
            Written to in |isCorrect| and read in |next|.
        */
        this.userInputWasInvalid = false;

        /*
            Array of functions used to generate questions.
            Index 0 generates the first step's question.
            Index 1 generates the seconds step's question.
            etc.
        */
        this.tableModelGeneratorFunctions = [];
    };

    // Initialize |tableModelGeneratorFunctions| with functions to generate questions.
    this.initializeTableModelGeneratorFunctions = function() {
        if (this.useConditional) {
            this.tableModelGeneratorFunctions = [
                this.generateTableModelAndOutputInstructionsForFirstQuestionWithConditionals,
                this.generateTableModelAndOutputInstructionsForSecondQuestionWithConditionals,
                this.generateTableModelAndOutputInstructionsForThirdQuestionWithConditionals,
                this.generateTableModelAndOutputInstructionsForFourthQuestionWithConditionals,
                this.generateTableModelAndOutputInstructionsForFifthQuestionWithConditionals
            ];
        }
        else {
            this.tableModelGeneratorFunctions = [
                this.generateTableModelAndOutputInstructionsForFirstQuestion,
                this.generateTableModelAndOutputInstructionsForSecondQuestion,
                this.generateTableModelAndOutputInstructionsForThirdQuestion,
                this.generateTableModelAndOutputInstructionsForFourthQuestion,
                this.generateTableModelAndOutputInstructionsForFifthQuestion,
                this.generateTableModelAndOutputInstructionsForSixthQuestion,
                this.generateTableModelAndOutputInstructionsForSeventhQuestion,
                this.generateTableModelAndOutputInstructionsForEighthQuestion
            ];
        }
    };

    /*
        Return a simple proposition. Ex: ¬p → ¬q.
        |useBiconditional| is required and boolean. If true, then the generated proposition will use ↔. Otherwise, the proposition will use →.
    */
    this.returnTwoVariableConditionalProposition = function(useBiconditional) {
        // Randomly decide whether to include the first ¬ and second ¬
        var beforeFirstVariable = this.utilities.pickNumberInRange(0, 1) ? '¬' : '';
        var beforeSecondVariable = this.utilities.pickNumberInRange(0, 1) ? '¬' : '';

        // Randomly decide variable ordering: p first or q first.
        var firstVariable = 'p';
        var secondVariable = 'q';
        if (this.utilities.pickNumberInRange(0, 1)) {
            firstVariable = 'q';
            secondVariable = 'p';
        }

        var operator = useBiconditional ? '↔' : '→';

        var propositionToSolve = beforeFirstVariable + firstVariable + operator + beforeSecondVariable + secondVariable;

        return propositionToSolve;
    };

    /*
        Generate table and output instructions for the first question using conditionals.
        |useBiconditional| is optional and boolean. If true, then the generated proposition will use ↔. Otherwise, the proposition will use →.
        Example proposition: ¬p → ¬q
    */
    this.generateTableModelAndOutputInstructionsForFirstQuestionWithConditionals = function(useBiconditional) {
        useBiconditional = useBiconditional || false;

        var propositionToSolve = this.returnTwoVariableConditionalProposition(useBiconditional);

        this.generateExpectedTruthValuesForPropositionWithTwoVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', propositionToSolve ],
            nonHeaders: this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty
        };

        return tableModel;
    };

    /*
        Generate table and output instructions for the second question using conditionals.
        Example proposition: ¬p ↔ ¬q.
    */
    this.generateTableModelAndOutputInstructionsForSecondQuestionWithConditionals = function() {
        return this.generateTableModelAndOutputInstructionsForFirstQuestionWithConditionals(true);
    };

    /*
        Generate table and output instructions for the third question using conditionals.
        Example proposition: p ∧ (¬p ↔ ¬q).
    */
    this.generateTableModelAndOutputInstructionsForThirdQuestionWithConditionals = function() {
        // Randomly decide whether first variable is p or q.
        var firstVariable = this.utilities.pickNumberInRange(0, 1) ? 'p' : 'q';

        // Randomly decide operator between first variable and latter part.
        var operatorAfterFirstVariable = this.utilities.pickNumberInRange(0, 1) ? '∧' : '∨';

        // Randomly decide whether to use biconditional for the latter part of the proposition.
        var useBiconditional = this.utilities.pickNumberInRange(0, 1);

        var latterPartOfProposition = this.returnTwoVariableConditionalProposition(useBiconditional);

        var propositionToSolve = firstVariable + operatorAfterFirstVariable + '(' + latterPartOfProposition + ')';

        this.generateExpectedTruthValuesForPropositionWithTwoVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', propositionToSolve ],
            nonHeaders: this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty
        };

        return tableModel;
    };

    /*
        Generate table and output instructions for the fourth question using conditionals.
        |useNegatives| is optional and boolean. If true, then use ¬. Otherwise, do not.
        Example proposition: ¬p ↔ (¬q ∧ ¬s).
    */
    this.generateTableModelAndOutputInstructionsForFourthQuestionWithConditionals = function(useNegatives) {
        useNegatives = useNegatives || false;

        // Randomly decide whether to include the first, second, or third ¬.
        var beforeFirstVariable = (useNegatives && this.utilities.pickNumberInRange(0, 1)) ? '¬' : '';
        var beforeSecondVariable = (useNegatives && this.utilities.pickNumberInRange(0, 1)) ? '¬' : '';
        var beforeThirdVariable = (useNegatives && this.utilities.pickNumberInRange(0, 1)) ? '¬' : '';

        // Randomly order the variables
        var possibleVariables = [ 'p', 'q', 'r' ];
        this.utilities.shuffleArray(possibleVariables);
        var firstVariable = possibleVariables[0];
        var secondVariable = possibleVariables[1];
        var thirdVariable = possibleVariables[2];

        // Randomly decide which operator to use.
        var operator = this.utilities.pickNumberInRange(0, 1) ? '∧' : '∨';

        // Randomly decide whether to use biconditional.
        var conditionalOperator = this.utilities.pickNumberInRange(0, 1) ? '↔' : '→';

        var propositionToSolve = beforeFirstVariable + firstVariable + conditionalOperator + '(' + beforeSecondVariable + secondVariable + operator + beforeThirdVariable + thirdVariable + ')';

        this.generateExpectedTruthValuesForPropositionWithThreeVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', 'r', propositionToSolve ],
            nonHeaders: this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty()
        };

        return tableModel;
    };

    /*
        Generate table and output instructions for the fifth question using conditionals.
        Example proposition:
    */
    this.generateTableModelAndOutputInstructionsForFifthQuestionWithConditionals = function() {
        return this.generateTableModelAndOutputInstructionsForFourthQuestionWithConditionals(true);
    };

    /**
        Return an object with value 'T' and isInput false.
        @method _makeValueTrueInputFalse
        @private
        @return {Object} An object with value 'T' and isInput false.
    */
    this._makeValueTrueInputFalse = function() {
        return { value: 'T', isInput: false };
    };

    /**
        Return an object with value 'F' and isInput false.
        @method _makeValueFalseInputFalse
        @private
        @return {Object} An object with value 'F' and isInput false.
    */
    this._makeValueFalseInputFalse = function() {
        return { value: 'F', isInput: false };
    };

    /**
        Return an object with value '' and isInput true.
        @method _makeInputTrue
        @private
        @return {Object} An object with value '' and isInput true.
    */
    this._makeInputTrue = function() {
        return { value: '', isInput: true };
    };

    // Generate table and output instructions for the first question.
    this.generateTableModelAndOutputInstructionsForFirstQuestion = function() {
        this.$instructions.text('Using the pattern above, fill in all combinations of p and q.');

        const tableModel = {
            headers: [ 'p', 'q' ],
            nonHeaders: [],
        };

        // Randomly choose from 1 of 2 possible formats for the upper-two rows.
        let randomNumber = this.utilities.pickNumberInRange(0, 1);

        if (randomNumber === 0) {
            tableModel.nonHeaders.push(
                [ this._makeValueTrueInputFalse(), this._makeValueTrueInputFalse() ],
                [ this._makeValueTrueInputFalse(), this._makeInputTrue() ]
            );
            this.expectedTruthValues.push('F');
        }
        else {
            tableModel.nonHeaders.push(
                [ this._makeValueTrueInputFalse(), this._makeInputTrue() ],
                [ this._makeValueTrueInputFalse(), this._makeValueFalseInputFalse() ]
            );
            this.expectedTruthValues.push('T');
        }

        // Randomly choose from 1 of 2 formats for the lower-two rows.
        randomNumber = this.utilities.pickNumberInRange(0, 1); // eslint-disable-line no-magic-numbers

        if (randomNumber === 0) {
            tableModel.nonHeaders.push(
                [ this._makeInputTrue(), this._makeValueTrueInputFalse() ],
                [ this._makeInputTrue(), this._makeInputTrue() ]
            );
            this.expectedTruthValues.push('F');
            this.expectedTruthValues.push('F');
            this.expectedTruthValues.push('F');
        }
        else {
            tableModel.nonHeaders.push(
                [ this._makeInputTrue(), this._makeInputTrue() ],
                [ this._makeInputTrue(), this._makeValueFalseInputFalse() ]
            );
            this.expectedTruthValues.push('F');
            this.expectedTruthValues.push('T');
            this.expectedTruthValues.push('F');
        }

        return tableModel;
    };

    // The non-header values consisting of the 2 variables already filled out and the 1 proposition not filled out.
    this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty = [];
    this.generateNonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty = function() {
        var self = this;
        [ 'T', 'F' ].forEach(function(pValue) {
            [ 'T', 'F' ].forEach(function(qValue) {
                self.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty.push([
                    {
                        value:   pValue,
                        isInput: false
                    },
                    {
                        value:   qValue,
                        isInput: false
                    },
                    {
                        value:   '',
                        isInput: true
                    }
                ]);
            });
        });
    };

    /*
        Randomly return an element in the |array|.
        |array| is required and an array.
    */
    this.randomlyReturnAnElementInArray = function(array) {
        this.utilities.shuffleArray(array);
        return array[0];
    };

    /*
        Generate the expected truth values for the given |proposition|.
        |proposition| is required and a string with the form of a proposition. Ex: ¬p∧¬q.
    */
    this.generateExpectedTruthValuesForPropositionWithTwoVariables = function(proposition) {
        var self = this;
        [ 'T', 'F' ].forEach(function(pValue) {
            [ 'T', 'F' ].forEach(function(qValue) {
                // Substitute p with |pValue| and q with |qValue|.
                var propositionWithSubstitutedValues = proposition.replace(/p/g, pValue).replace(/q/g, qValue);
                var result = self.discreteMathUtilities.evaluateProposition(propositionWithSubstitutedValues);
                self.expectedTruthValues.push(result ? 'T' : 'F');
            });
        });
    };

    /*
        Generate the table and output instructions with a single operator proposition.
        That is: ¬p, ¬q, p∧q, and p∨q.
    */
    this.generateTableModelAndOutputInstructionsForSecondQuestion = function() {
        var potentialPropositionsToSolve = [ '¬p', '¬q', 'p∧q', 'p∨q' ];
        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithTwoVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', propositionToSolve ],
            nonHeaders: this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty
        };

        return tableModel;
    };

    /*
        Generate the table and output instructions with 2-3 operators and using both variables once.
        That is: ¬p∧q, p∧¬q, ¬p∨q, p∨¬q, ¬p∨¬q, ¬p∧¬q, ¬q∧p, q∧¬p, ¬q∨p, q∨¬p, ¬q∨¬p, and ¬q∧¬p.
    */
    this.generateTableModelAndOutputInstructionsForThirdQuestion = function() {
        // Potential propositions to solve.
        var potentialPropositionsToSolve = [ '¬p∧q', 'p∧¬q', '¬p∨q', 'p∨¬q', '¬p∨¬q', '¬p∧¬q', '¬q∧p', 'q∧¬p', '¬q∨p', 'q∨¬p', '¬q∨¬p', '¬q∧¬p' ];

        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithTwoVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', propositionToSolve ],
            nonHeaders: this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty
        };

        return tableModel;
    };

    /*
        Generate the table and output instructions with 2-4 operators, using one variable once and the other twice.
        Ex: p∧(q∧p), p∧(q∨p), p∨(q∨p), p∨(q∧p), etc.
    */
    this.generateTableModelAndOutputInstructionsForFourthQuestion = function() {
        // Randomly pick the first operator.
        var randomNumber = this.utilities.pickNumberInRange(0, 1);
        var firstOperator = randomNumber ? '∧' : '∨';

        // Randomly pick the second operator.
        randomNumber = this.utilities.pickNumberInRange(0, 1);
        var secondOperator = randomNumber ? '∧' : '∨';

        // Randomize the variable ordering.
        var variables = [ 'p', 'q' ];
        this.utilities.shuffleArray(variables);

        // If the operators are the same, then do not use the parens.
        var potentialPropositionsToSolve;
        if (firstOperator === secondOperator) {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + variables[1] + secondOperator + variables[1],
                variables[0] + firstOperator + variables[1] + secondOperator + '¬' + variables[1],
                variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[1],
                variables[0] + firstOperator + '¬' + variables[1] + secondOperator + '¬' + variables[1],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + variables[1],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + '¬' + variables[1],
                '¬' + variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[1],
                '¬' + variables[0] + firstOperator + '¬' + variables[1] + secondOperator + '¬' + variables[1]
            ];
        }
        // Otherwise, use the parens.
        else {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + '(' + variables[1] + secondOperator + variables[1] + ')',
                variables[0] + firstOperator + '(' + variables[1] + secondOperator + '¬' + variables[1] + ')',
                '(' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + variables[1],
                '(' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + '¬' + variables[1],
                '(¬' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + variables[1],
                '(¬' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + '¬' + variables[1],
                '(¬' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + variables[1],
                '(¬' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + '¬' + variables[1]
            ];
        }

        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithTwoVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', propositionToSolve ],
            nonHeaders: this.nonHeadersForTwoVariablesFilledOutAndOnePropositionEmpty
        };

        return tableModel;
    };

    // The non-header values consisting of the 3 variables already filled out and the 1 proposition not filled out.
    this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty = function() {
        var nonHeaders = [];
        [ 'T', 'F' ].forEach(function(pValue) {
            [ 'T', 'F' ].forEach(function(qValue) {
                [ 'T', 'F' ].forEach(function(sValue) {
                    nonHeaders.push([
                        {
                            value:   pValue,
                            isInput: false
                        },
                        {
                            value:   qValue,
                            isInput: false
                        },
                        {
                            value:   sValue,
                            isInput: false
                        },
                        {
                            value:   '',
                            isInput: true
                        }
                    ]);
                });
            });
        });

        return nonHeaders;
    };

    /*
        Generate the expected truth values for the given |proposition|.
        |proposition| is required and a string with the form of a proposition. Ex: ¬p∧¬(q∧s).
    */
    this.generateExpectedTruthValuesForPropositionWithThreeVariables = function(proposition) {
        var self = this;
        [ 'T', 'F' ].forEach(function(pValue) {
            [ 'T', 'F' ].forEach(function(qValue) {
                [ 'T', 'F' ].forEach(function(sValue) {
                    // Substitute p with |pValue|, q with |qValue|, and s with |sValue|.
                    var propositionWithSubstitutedValues = proposition.replace(/p/g, pValue).replace(/q/g, qValue).replace(/r/g, sValue);
                    var result = self.discreteMathUtilities.evaluateProposition(propositionWithSubstitutedValues);
                    self.expectedTruthValues.push(result ? 'T' : 'F');
                });
            });
        });
    };

    /*
        Generate the table and output instructions with 2 operators and using 3 variables, each once.
        Ex: p∧(q∧s), p∧(q∨s), p∨(q∨s), p∨(q∧s), etc.
    */
    this.generateTableModelAndOutputInstructionsForFifthQuestion = function() {
        const originalNonHeaders = this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty();

        // Remove proposition column.
        originalNonHeaders.forEach(nonHeaderRow => nonHeaderRow.pop());
        let repeat = false;
        let finalNonHeaders = null;

        do {
            this.expectedTruthValues.length = 0;

            // Need to clone an array of objects. slice would keep the reference to the objects and modify them in the original array too.
            finalNonHeaders = JSON.parse(JSON.stringify(originalNonHeaders));
            const previousValues = [];

            // Randomly choose a cell in each row to become an input. Two rows can't have the same values.
            finalNonHeaders.forEach(nonHeaderRow => { // eslint-disable-line no-loop-func
                repeat = false;
                let tentativeNewRow = null;
                let repeatedTimes = 0;

                // Maximum number of repetitions, just a number, could be changed if needed.
                const maxRepetitions = 5;

                // Change a randomly chosen cell into an input. Two rows can't have the same values.
                do {
                    tentativeNewRow = nonHeaderRow.slice();
                    const nonHeaderCell = this.utilities.pickElementFromArray(tentativeNewRow);
                    const oldValue = nonHeaderCell.value;

                    nonHeaderCell.value = '';

                    repeat = previousValues.some(previousRow => // eslint-disable-line no-loop-func
                        previousRow.every((previousCell, index) => previousCell.value === tentativeNewRow[index].value)
                    );

                    if (repeat) {
                        nonHeaderCell.value = oldValue;
                        repeatedTimes++;
                    }
                    else {
                        this.expectedTruthValues.push(oldValue);
                        nonHeaderCell.isInput = true;
                    }
                } while (repeat && repeatedTimes < maxRepetitions);

                if (!repeat) {
                    previousValues.push(tentativeNewRow);
                }
            });
        } while (repeat);

        const tableModel = {
            headers: [ 'p', 'q', 'r' ],
            nonHeaders: finalNonHeaders,
        };

        this.$instructions.text('Using the pattern above, fill in all combinations of p, q, and r.');

        return tableModel;
    };

    /*
        Generate the table and output instructions with 2 operators and using 3 variables, each once.
        Ex: p∧(q∧s), p∧(q∨s), p∨(q∨s), p∨(q∧s), etc.
    */
    this.generateTableModelAndOutputInstructionsForSixthQuestion = function() {
        // Randomly pick the first operator.
        var randomNumber = this.utilities.pickNumberInRange(0, 1);
        var firstOperator = randomNumber ? '∧' : '∨';

        // Randomly pick the second operator.
        randomNumber = this.utilities.pickNumberInRange(0, 1);
        var secondOperator = randomNumber ? '∧' : '∨';

        // Randomize the variable ordering.
        var variables = [ 'p', 'q', 'r' ];
        this.utilities.shuffleArray(variables);

        // Use parens if the operators are the same.
        var potentialPropositionsToSolve;
        if (firstOperator === secondOperator) {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + variables[1] + secondOperator + variables[2],
                variables[0] + firstOperator + variables[1] + secondOperator + variables[2]
            ];
        }
        // Otherwise, do not use parens.
        else {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + '(' + variables[1] + secondOperator + variables[2] + ')',
                '(' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + variables[2]
            ];
        }

        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithThreeVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', 'r', propositionToSolve ],
            nonHeaders: this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty()
        };

        return tableModel;
    };

    /*
        Generate the table and output instructions with 3-5 operators and using 3 variables, each once.
        Ex: p∧(q∧¬s), p∧(¬q∧s), p∧(¬q∧¬s), ¬p∧(q∧s), ¬p∧(q∧¬s), ¬p∧(¬q∧s), ¬p∧(¬q∧¬s), etc.
    */
    this.generateTableModelAndOutputInstructionsForSeventhQuestion = function() {
        // Randomly pick the first operator.
        var randomNumber = this.utilities.pickNumberInRange(0, 1);
        var firstOperator = randomNumber ? '∧' : '∨';

        // Randomly pick the second operator.
        randomNumber = this.utilities.pickNumberInRange(0, 1);
        var secondOperator = randomNumber ? '∧' : '∨';

        // Randomize the variable ordering.
        var variables = [ 'p', 'q', 'r' ];
        this.utilities.shuffleArray(variables);

        // Use parens if the operators are the same.
        var potentialPropositionsToSolve;
        if (firstOperator === secondOperator) {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + variables[1] + secondOperator + '¬' + variables[2],
                variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[2],
                variables[0] + firstOperator + '¬' + variables[1] + secondOperator + '¬' + variables[2],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + '¬' + variables[2],
                '¬' + variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + '¬' + variables[1] + secondOperator + '¬' + variables[2]
            ];
        }
        // Otherwise, do not use parens.
        else {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + '(' + variables[1] + secondOperator + '¬' + variables[2] + ')',
                '(' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + variables[2],
                '(' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + '¬' + variables[2],
                '(¬' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + variables[2],
                '(¬' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + '¬' + variables[2],
                '(¬' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + variables[2],
                '(¬' + variables[0] + firstOperator + '¬' + variables[1] + ')' + secondOperator + '¬' + variables[2]
            ];
        }

        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithThreeVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', 'r', propositionToSolve ],
            nonHeaders: this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty()
        };

        return tableModel;
    };

    /*
        Generate the table and output instructions with ¬(<variable1>∧<variable2>) and using 3 variables, each once.
        Ex: ¬(p∧q)∧s, p∧¬(q∧s), ¬(p∧q)∧¬s, ¬p∧¬(q∧s), etc.
    */
    this.generateTableModelAndOutputInstructionsForEighthQuestion = function() {
        // Randomly pick the first operator.
        var randomNumber = this.utilities.pickNumberInRange(0, 1);
        var firstOperator = randomNumber ? '∧' : '∨';

        // Randomly pick the second operator.
        randomNumber = this.utilities.pickNumberInRange(0, 1);
        var secondOperator = randomNumber ? '∧' : '∨';

        // Randomize the variable ordering.
        var variables = [ 'p', 'q', 'r' ];
        this.utilities.shuffleArray(variables);

        // Use parens if the operators are the same.
        var potentialPropositionsToSolve;
        if (firstOperator === secondOperator) {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + '¬' + variables[1] + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + variables[1] + secondOperator + '¬' + variables[2]
            ];
        }
        // Otherwise, do not use parens.
        else {
            potentialPropositionsToSolve = [
                variables[0] + firstOperator + '¬(' + variables[1] + secondOperator + variables[2] + ')',
                '¬(' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + variables[2],
                '¬' + variables[0] + firstOperator + '¬(' + variables[1] + secondOperator + variables[2] + ')',
                '¬(' + variables[0] + firstOperator + variables[1] + ')' + secondOperator + '¬' + variables[2]
            ];
        }

        var propositionToSolve = this.randomlyReturnAnElementInArray(potentialPropositionsToSolve);
        this.generateExpectedTruthValuesForPropositionWithThreeVariables(propositionToSolve);
        this.$instructions.text('Fill in ' + propositionToSolve + '.');

        var tableModel = {
            headers:    [ 'p', 'q', 'r', propositionToSolve ],
            nonHeaders: this.generateNonHeadersForThreeVariablesFilledOutAndOnePropositionEmpty()
        };

        return tableModel;
    };

    /*
        Generate a question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is required and an integer.
    */
    this.generateQuestion = function(currentQuestionNumber) {

        // Clear the expected truth values.
        this.expectedTruthValues.length = 0;

        this.tableModel = this.tableModelGeneratorFunctions[currentQuestionNumber].call(this);
        const tableHTML = this[this.name].table(this.tableModel);

        this.$table.html(tableHTML);

        this.setupTruthValues();
    };

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

module.exports = {
    create: function() {
        return new PropositionTable();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
