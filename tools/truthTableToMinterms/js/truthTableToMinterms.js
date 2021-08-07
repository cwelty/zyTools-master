function TruthTableToMinterms() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.useDiscreteMathNotation = false;
        if (options && ('useDiscreteMathNotation' in options)) {
            this.useDiscreteMathNotation = true;
        }

        /*
            |expectedYValues| is an array that represents a sum of minterms with 0s and 1s.
            A 0 means the minterm is not part of the sum. A 1 means the minterm is part of sum.
            |expectedYValues| is written in |generateProblem| and read in |isCorrect|.
        */
        this.expectedYValues = [];

        // |variables| are the variables in the truth table.
        this.variables = this.useDiscreteMathNotation ? [ 'x', 'y', 'z' ] : [ 'a', 'b', 'c' ];

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].truthTableToMinterms();

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         5,
            useMultipleParts: true,
            start: function() {
                self.enableInput();
            },
            reset: function() {
                self.generateProgressionQuestion(0);
                self.disableInput();
                self.$equationField.val('');
            },
            next: function(currentQuestion) {
                self.generateProgressionQuestion(currentQuestion);
                self.enableInput();
            },
            isCorrect: function() {
                const userAnswer = self.$equationField.val();
                const userYValues = self.getUserYValues(userAnswer);
                const expectedAnswer = self.buildExpectedAnswer();
                let explanationMessage = `Expected: ${expectedAnswer}${self.utilities.getNewline()}`;
                let isAnswerCorrect = false;

                if (!$.isArray(userYValues)) {
                    explanationMessage += 'Your equation is not a sum of minterms.';
                }
                else {
                    self.outputUserYValues(userYValues);
                    var numberOfIncorrectYValues = self.numberOfUserYValuesIncorrect(userYValues);
                    isAnswerCorrect = (numberOfIncorrectYValues === 0);

                    if (!isAnswerCorrect) {
                        explanationMessage += (numberOfIncorrectYValues === 1) ? 'See highlighted entry above' : 'See highlighted entries above';
                    }
                }

                self.yourYColumn().removeClass('invisible');

                self.disableInput();

                return {
                    explanationMessage,
                    userAnswer,
                    expectedAnswer,
                    isCorrect: isAnswerCorrect,
                };
            },
        });

        // Cache commonly used DOM elements.
        var $thisTool = $('#' + this.id);
        this.$equationField = $thisTool.find('input');
        this.$truthTableContainer = $thisTool.find('.truth-table-container');
        this.$yText = $thisTool.find('.y-label-text');

        this.$equationField.keypress(function(event) {
            if (event.which === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });

        this.generateProgressionQuestion(0);
        this.disableInput();
    };

    /**
        Return the expected answer in minterm form.
        @method buildExpectedAnswer
        @return {String} The expected answer in minterm form.
    */
    this.buildExpectedAnswer = function() {
        const twoVariableIndexToMinterm = {
            0: `${this.variables[0]}'${this.variables[1]}'`,
            1: `${this.variables[0]}'${this.variables[1]}`,
            2: `${this.variables[0]}${this.variables[1]}'`,
            3: `${this.variables[0]}${this.variables[1]}`,
        };
        const threeVariableIndexToMinterms = {
            0: `${this.variables[0]}'${this.variables[1]}'${this.variables[2]}'`,
            1: `${this.variables[0]}'${this.variables[1]}'${this.variables[2]}`,
            2: `${this.variables[0]}'${this.variables[1]}${this.variables[2]}'`,
            3: `${this.variables[0]}'${this.variables[1]}${this.variables[2]}`,
            4: `${this.variables[0]}${this.variables[1]}'${this.variables[2]}'`,
            5: `${this.variables[0]}${this.variables[1]}'${this.variables[2]}`,
            6: `${this.variables[0]}${this.variables[1]}${this.variables[2]}'`,
            7: `${this.variables[0]}${this.variables[1]}${this.variables[2]}`,
        };
        const numberOfVariables = Math.log2(this.expectedYValues.length);
        const indexToMinterm = numberOfVariables === 2 ? twoVariableIndexToMinterm : threeVariableIndexToMinterms; // eslint-disable-line no-magic-numbers
        const mintermIndices = this.expectedYValues.map((value, index) => { // eslint-disable-line arrow-body-style
            return value ? index : -1;
        }).filter(index => index >= 0);
        const minTermList = mintermIndices.map(index => indexToMinterm[index]);

        return minTermList.join('+');
    };

    // Disable the input.
    this.disableInput = function() {
        this.$equationField.prop('disabled', true);
    };

    // Enable the input, clear the input's value, and focus on the input.
    this.enableInput = function() {
        this.$equationField.prop('disabled', false).val('').focus();
    };

    /*
        Generates the progression question for the given |questionIndex|.
        The higher the index; the harder the question.
        |questionIndex| is required and a number.
    */
    this.generateProgressionQuestion = function(questionIndex) {
        var numVariables;
        var numMinterms;

        switch (questionIndex) {
            case 0:
                numVariables = 2;
                numMinterms = 1;
                break;
            case 1:
                numVariables = 2;
                numMinterms = 2;
                break;
            case 2:
                numVariables = 3;
                numMinterms = 1;
                break;
            case 3:
                numVariables = 3;
                numMinterms = 2;
                break;
            case 4:
                numVariables = 3;
                numMinterms = 3;
                break;
        }

        this.generateProblem(numVariables, numMinterms);
        this.generateTruthTable(numVariables);

        const twoVariableExample = `${this.variables[0]}${this.variables[1]}'+${this.variables[0]}'${this.variables[1]}`;
        const threeVariableExample = `${this.variables[0]}${this.variables[1]}'${this.variables[2]}+${this.variables[0]}'${this.variables[1]}${this.variables[2]}'`; // eslint-disable-line max-len
        const example = numVariables === 2 ? twoVariableExample : threeVariableExample; // eslint-disable-line no-magic-numbers

        this.$equationField.attr('placeholder', `Ex: ${example}`);
    };

    /*
        Generate |expectedYValues|, which is an array of y values of length 2^|numVariables|.
        |numMinTerms| is how many 1s will exist in the array.
        |numVariables| is how many variables are to be included in the function.
        |numMinTerms| and |numVariables| are required and numbers.
    */
    this.generateProblem = function(numVariables, numMinTerms) {
        // Reset |expectedYValues| to an array of 0s.
        this.expectedYValues = new Array(Math.pow(2, numVariables));
        this.expectedYValues.fill(0);

        // Set |numMinTerms| indices to 1.
        var chosenIndices = this.utilities.pickNIndicesFromArray(this.expectedYValues, numMinTerms);
        var self = this;
        chosenIndices.forEach(function(index) {
            self.expectedYValues[index] = 1;
        });
    };

    // Return a jQuery object containing each td and th inthe Your y column.
    this.yourYColumn = function() {
        return this.$truthTableContainer.find('tr').find('td:last-child, th:last-child');
    };

    /*
        Print the truth table given |numVariables| and |rows|.
        |numVariables| is required and a number.
        |rows| is required and an array of Rows.
    */
    this.printTable = function(numVariables, rows) {
        // Pick the first |numVariables| variables.
        var variablesForTable = this.variables.filter(function(variable, index) {
            return (index < numVariables);
        });

        // |yText| is the name of the function described by the variables.
        var yText = 'y';

        // If discrete math notation, then make something like f(x, y) or f(x, y, z).
        if (this.useDiscreteMathNotation) {
            yText = 'f(';

            variablesForTable.forEach(function(variable, index) {
                yText += (index === (variablesForTable.length - 1)) ? variable : (variable + ', ');
            });

            yText += ')';
        }

        this.$yText.text(yText);

        var truthTableHTML = this[this.name]['truthTable']({
            variables: variablesForTable,
            rows:      rows,
            yText:     yText
        });

        this.$truthTableContainer.html(truthTableHTML);
        this.yourYColumn().addClass('invisible');
    };

    /*
        Return an array of Rows based on the |numVariables|.
        |numVariables| is required and a number.
    */
    this.buildRows = function(numVariables) {
        var rows = [];

        for (var i = 0; i < Math.pow(2, numVariables); i++) {
            // Convert |i| to a binary string. Ex: i = 3 converts to '11'.
            var binaryString = Number(i).toString(2);

            /*
                Prepend 0's to the binary string so the number of bits is |numVariables|.
                Ex: If |numVariables| is 3 and binary string is '11', then binary string becomes '011'.
            */
            while (binaryString.length < numVariables) {
                binaryString = '0' + binaryString;
            }

            // Convert |binaryString| to an array of 0's and 1's.
            var truthValues = binaryString.split('');

            var newRow = new Row(truthValues, this.expectedYValues[i]);
            rows.push(newRow);
        }

        return rows;
    };

    /*
        Build truth table html given |expectedYValues| array of length 2^|numVariables|.
        |numVariables| is required and a number.
    */
    this.generateTruthTable = function(numVariables) {
        var rows = this.buildRows(numVariables);
        this.printTable(numVariables, rows);
    };

    /*
        Output truth table including user's Y values.
        |userYValues| is required and an array of 0s and 1s.
    */
    this.outputUserYValues = function(userYValues) {
        var numVariables = Math.log(userYValues.length) / Math.log(2);
        var rows = this.buildRows(numVariables);

        var self = this;
        rows.forEach(function(row, index) {
            var isWrong = (userYValues[index] !== self.expectedYValues[index]);
            row.updateYourY(isWrong, userYValues[index]);
        });

        this.printTable(numVariables, rows);
    };

    /*
        Return the number of |userYValues| elements that are not the same as |expectedYValues|.
        |userYValues| is required and an array of 0s and 1s.
    */
    this.numberOfUserYValuesIncorrect = function(userYValues) {
        return this.expectedYValues.filter(function(element, index) {
            return (element !== userYValues[index]);
        }).length;
    };

    /*
        Convert user entered |equation| to user's Y values.
        |equation| is required and a string.
    */
    this.getUserYValues = function(equation) {
        // Initialize |userYValues| to 0s. |userYValues| should have the same number of values as |expectedYValues|.
        var userYValues = new Array(this.expectedYValues.length);
        userYValues.fill(0);

        var numVariables = Math.log(userYValues.length) / Math.log(2);

        equation = this.utilities.removeWhitespace(equation);
        equation = equation.toLowerCase();
        equation = this.utilities.replaceSmartQuotes(equation);
        var terms = equation.split('+');

        var self = this;
        var notAMinterm = false;
        terms.forEach(function(term) {
            // |truthValues| stores the truth value for each variable. Ex: if term is ab'c, then truthValues should be [1, 0, 1].
            var truthValues = new Array(numVariables);
            truthValues.fill(null);

            // Convert each variable to either 0 or 1.
            for (var i = 0; i < term.length; i++) {
                var currentCharacter = term[i];
                var variableIndex = self.variables.indexOf(currentCharacter);

                // If next character is ', then assign 0.
                var valueToAssign = null;
                var notSymbols = ['\'', '`' ];
                if (((i + 1) < term.length) && (notSymbols.indexOf(term[i + 1]) !== -1)) {
                    valueToAssign = 0;
                    i++;
                }
                // Otherwise, assign 1.
                else {
                    valueToAssign = 1;
                }

                // Multiple assignments to the same variable means this is not a minterm.
                if (truthValues[variableIndex] !== null) {
                    notAMinterm = true;
                }

                truthValues[variableIndex] = valueToAssign;
            }

            // Convert |truthValues| to a decimal value. Each value in |truthValues| is a bit. Ex: [1, 0, 1] converts to 5.
            var bitValueMultiplier = 1;
            var decimalValue = 0;
            truthValues.reverse().forEach(function(truthValue) {
                // If any truthValue is not assigned a value, then this is not a minterm.
                if (truthValue === null) {
                    notAMinterm = true;
                }
                else {
                    decimalValue += (truthValue * bitValueMultiplier);
                }

                bitValueMultiplier *= 2;
            });

            // If the user's Y value was already set, then the |equation| is not a minterm.
            if (userYValues[decimalValue] !== 0) {
                notAMinterm = true;
            }

            // |decimalValue| is the index location of the minterm in |userYValues|.
            userYValues[decimalValue] = 1;
        });

        return (notAMinterm ? null : userYValues);
    };

    <%= grunt.file.read(hbs_output) %>
}

var truthTableToMintermsExport = {
    create: function() {
        return new TruthTableToMinterms();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = truthTableToMintermsExport;
