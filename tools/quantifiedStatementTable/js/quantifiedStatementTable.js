function QuantifiedStatementTable() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        /*
            Stores the expected answer for the current question.
            An expected answer contains whether true or false should be selected,
            and a list of whether each instance is expected to be selected.
                * |isExistential| is required and boolean.
                * |shouldTrueBeSelected| is required and boolean.
                * |instances| is required and an array of booleans.
        */
        this.expectedAnswer = {
            usesExistential:      true,
            shouldTrueBeSelected: true,
            instances:            []
        };

        this.utilities = require('utilities');
        this.discreteMathUtilities = require('discreteMathUtilities');
        this.progressionTool = require('progressionTool').create();
        this.segmentedControl = require('segmentedControl').create();

        this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);
        var numberOfRowsInTable = 3;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['quantifiedStatementTable']({
            id:                  this.id,
            checkmarkURL:        this.checkmarkImageURL,
            numberOfRowsInTable: numberOfRowsInTable
        });

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         8,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.enableInputs();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableInputs();
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
                self.enableInputs();
            },
            isCorrect: function(currentQuestion) {
                self.disableInputs();

                // The truth segment control can have three states.
                var possibleTruthSegmentStates = {
                    trueSelected:  true,
                    falseSelected: false,
                    noneSelected:  null
                };

                // Determine the state of the truth segment control
                var selectedSegmentIndex = self.segmentedControl.getSelectedSegmentIndex();
                var truthSegmentState;
                if (selectedSegmentIndex === null) {
                    truthSegmentState = possibleTruthSegmentStates.noneSelected;
                }
                else if (selectedSegmentIndex === 0) {
                    truthSegmentState = possibleTruthSegmentStates.trueSelected;
                }
                else {
                    truthSegmentState = possibleTruthSegmentStates.falseSelected;
                }

                var userAnswer = {
                    shouldTrueBeSelected: truthSegmentState
                };

                // Assess correctness of truth segment
                var truthValueIsCorrect = (userAnswer.shouldTrueBeSelected === self.expectedAnswer.shouldTrueBeSelected);
                if (truthValueIsCorrect) {
                    self.$checkmarks.eq(0).show();
                }
                else {
                    self.$xMarks.eq(0).show();
                }

                // Assess correctness of instance rows
                var instanceRowsAreCorrect = true;
                var pointerArrowIsShown = false;
                userAnswer.instances = [];
                self.$table.find('tr').each(function(index) {
                    var $row = $(this);

                    // Ignore the first row of headers.
                    if (index > 0) {
                        userAnswer.instances.push($row.hasClass('selected'));

                        /*
                            |index| ranges from 1 to N, which is the number of instances.
                            |userAnswer.instances| and |self.expectedAnswer.instances| range from 0 to (N - 1).
                        */
                        var thisInstanceIsCorrect = true;
                        var instanceIsSelected = userAnswer.instances[index - 1];
                        var instanceExpectedToBeSelected = self.expectedAnswer.instances[index - 1];
                        if (instanceIsSelected !== instanceExpectedToBeSelected) {
                            instanceRowsAreCorrect = false;
                            thisInstanceIsCorrect = false;
                        }

                        // Only mark each instance if the truth value was correct.
                        if (truthValueIsCorrect) {
                            if (instanceIsSelected) {
                                if (instanceExpectedToBeSelected) {
                                    self.$checkmarks.eq(index).show();
                                }
                                else {
                                    self.$xMarks.eq(index).show();
                                }
                            }
                            else {
                                if (instanceExpectedToBeSelected) {
                                    /*
                                        |index| ranges from 1 to N, which is the number of instances.
                                        |pointerArrows| ranges from 0 to (N - 1).
                                    */
                                    self.$pointerArrows.eq(index - 1).show();
                                    pointerArrowIsShown = true;
                                }
                            }
                        }
                    }
                });

                var isCorrect = truthValueIsCorrect && instanceRowsAreCorrect;

                var explanation = '';
                if (isCorrect) {
                    explanation = 'Correct.';
                }
                else if (truthValueIsCorrect) {
                    explanation = 'See above.';
                    if (pointerArrowIsShown) {
                        explanation += ' Arrow means instance should be selected.';
                    }
                }
                else {
                    if (self.expectedAnswer.usesExistential) {
                        if (self.expectedAnswer.shouldTrueBeSelected) {
                            explanation = 'At least one instance is an example, so the statement is true. ' + self.utilities.getNewline() + self.expectedAnswer.explanation;
                        }
                        else {
                            explanation = 'No instance is an example, so the statement is false.';
                        }
                    }
                    else {
                        if (self.expectedAnswer.shouldTrueBeSelected) {
                            explanation = 'No instance is a counter-example, so the statement is true.';
                        }
                        else {
                            explanation = 'At least one instance is a counter-example, so the statement is false.' + self.utilities.getNewline() + self.expectedAnswer.explanation;
                        }
                    }
                }

                return {
                    explanationMessage: explanation,
                    userAnswer:         JSON.stringify(userAnswer),
                    expectedAnswer:     JSON.stringify(self.expectedAnswer),
                    isCorrect:          isCorrect
                };
            }
        });

        this.segmentedControl.init(
            [ 'True', 'False' ],
            'segmented-control-' + this.id,
            function(index) {
                var existentialSelected = index === 0;
                var alwaysShowHint = self.expectedAnswer.alwaysShowHint;
                var hintForExistential = self.expectedAnswer.usesExistential;

                self.$hint.css('visibility', 'visible');
                if (!alwaysShowHint && (existentialSelected !== hintForExistential)) {
                    self.$hint.css('visibility', 'hidden');
                }
            }
        );

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$statement = $thisTool.find('.statement');
        this.$tableContainer = $thisTool.find('.table');
        this.$hint = $thisTool.find('.hint');

        this.makeLevel(0);
        this.disableInputs();
    };

    this.rowClicked = function(event) {
        $(this).toggleClass('selected');
    };

    // Select all rows except the first row in each table in |this.$table|. The first row are headers.
    this.selectAllButFirstRowInTable = function() {
        var $rows = $();
        var self = this;
        this.$table.find('tr').each(function(index) {
            var $row = $(this);
            if (index > 0) {
                $rows = $rows.add($row);
            }
        });

        return $rows;
    };

    this.enableInputs = function() {
        var $rows = this.selectAllButFirstRowInTable();
        $rows.addClass('clickable');
        $rows.on('click', this.rowClicked);
        this.segmentedControl.enable();
    };

    this.disableInputs = function() {
        var $rows = this.selectAllButFirstRowInTable();
        $rows.removeClass('clickable');
        $rows.off('click', this.rowClicked);
        this.segmentedControl.disable();
    };

    /*
        Generate all possible instances for each predicate in |proposition|. Classify each instance as either true or false.
        |proposition| is required and a string representing a proposition. Ex: A(x) ∧ B(x).
    */
    this.getTrueAndFalseInstances = function(proposition) {
        var trueInstances = [];
        var falseInstances = [];
        var self = this;
        [ 'T', 'F' ].forEach(function(firstPredicateValue) {
            [ 'T', 'F' ].forEach(function(secondPredicateValue) {
                [ 'T', 'F' ].forEach(function(thirdPredicateValue) {
                    [ 'T', 'F' ].forEach(function(fourthPredicateValue) {
                        var propositionInstance = proposition;
                        propositionInstance = propositionInstance.replace(self.predicates[0], firstPredicateValue);
                        propositionInstance = propositionInstance.replace(self.predicates[1], secondPredicateValue);
                        propositionInstance = propositionInstance.replace(self.predicates[2], thirdPredicateValue);
                        propositionInstance = propositionInstance.replace(self.predicates[3], fourthPredicateValue);

                        var predicateValues = [];
                        predicateValues.push(firstPredicateValue, secondPredicateValue, thirdPredicateValue, fourthPredicateValue);

                        if (self.discreteMathUtilities.evaluateProposition(propositionInstance)) {
                            trueInstances.push(predicateValues);
                        }
                        else {
                            falseInstances.push(predicateValues);
                        }
                    });
                });
            });
        });

        return {
            trueInstances:  trueInstances,
            falseInstances: falseInstances
        };
    };

    /*
        Generate instances to show user, including which are to be selected, and the statement to show the user.
            * |proposition| is required and a string. Ex: D(x) ∧ B(x)
            * |useExistential| is required and boolean. If true, then the generated statement should use existential operator.
                Otherwise, use universal operator.
            * |shouldTrueBeSelected| is required and boolean. If true, then the statement should be true for the given instances.
                Otherwise, the statement should be false for the given instances.
    */
    this.generateInstancesAndStatement = function(proposition, useExistential, shouldTrueBeSelected) {
        // Generate all possible instances of the proposition.
        var allInstances = this.getTrueAndFalseInstances(proposition);
        var trueInstances = allInstances.trueInstances;
        var falseInstances = allInstances.falseInstances;

        var statement = '';
        var firstInstance = [];
        var secondInstance = [];
        var thirdInstance = [];
        var firstExpectedAnswer = false;
        var secondExpectedAnswer = false;
        var thirdExpectedAnswer = false;

        if (useExistential) {
            statement = this.discreteMathUtilities.existentialQuantifier + 'x (' + proposition + ')';

            // Pick 2 false instances that are not the same.
            firstInstance = this.utilities.pickElementFromArray(falseInstances);
            do {
                secondInstance = this.utilities.pickElementFromArray(falseInstances);
            } while (firstInstance === secondInstance);

            if (shouldTrueBeSelected) {
                // Pick a true instance.
                thirdInstance = this.utilities.pickElementFromArray(trueInstances);
                thirdExpectedAnswer = true;
            }
            else {
                // Pick a third false instance that is not the same as the first two.
                do {
                    thirdInstance = this.utilities.pickElementFromArray(falseInstances);
                } while ((thirdInstance === firstInstance) || (thirdInstance === secondInstance));
            }
        }
        else {
            statement = this.discreteMathUtilities.universalQuantifier + 'x (' + proposition + ')';

            // Pick 2 true instances that are not the same.
            firstInstance = this.utilities.pickElementFromArray(trueInstances);
            do {
                secondInstance = this.utilities.pickElementFromArray(trueInstances);
            } while (firstInstance === secondInstance);

            if (shouldTrueBeSelected) {
                // Pick a third true instance that is not the same as the first two.
                do {
                    thirdInstance = this.utilities.pickElementFromArray(trueInstances);
                } while ((thirdInstance === firstInstance) || (thirdInstance === secondInstance));
            }
            else {
                // Pick a false instance.
                thirdInstance = this.utilities.pickElementFromArray(falseInstances);
                thirdExpectedAnswer = true;
            }
        }

        // Randomize ordering of instances.
        var instances = [
            {
                instance:       firstInstance,
                expectedAnswer: firstExpectedAnswer
            },
            {
                instance:       secondInstance,
                expectedAnswer: secondExpectedAnswer
            },
            {
                instance:       thirdInstance,
                expectedAnswer: thirdExpectedAnswer
            }
        ];

        return {
            instances: instances,
            statement: statement
        };
    };

    this.pickTwoPredicates = function() {
        var firstPredicate = this.utilities.pickElementFromArray(this.predicates);
        var secondPredicate;
        do {
            secondPredicate = this.utilities.pickElementFromArray(this.predicates);
        } while (firstPredicate === secondPredicate);

        return [ firstPredicate, secondPredicate ];
    };

    /*
        Display two tables given the |currentQuestionNumber|.
        |currentQuestionNumber| is required and an integer.
    */
    this.makeLevel = function(currentQuestionNumber) {
        this.predicates = [ 'A(x)', 'B(x)', 'C(x)', 'D(x)' ];

        // Build a |proposition| used in generating a problem.
        var proposition = '';
        switch (currentQuestionNumber) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                // Choose either AND or OR symbol.
                var operators = [ this.discreteMathUtilities.andSymbol, this.discreteMathUtilities.orSymbol ];
                var operator = this.utilities.pickElementFromArray(operators);

                // Choose two predicates.
                var chosenPredicates = this.utilities.pickNElementsFromArray(this.predicates, 2);

                proposition = chosenPredicates[0] + ' ' + operator + ' ' + chosenPredicates[1];
                break;
            case 6:
                // Use conditional symbol.
                var operator = this.discreteMathUtilities.conditionalSymbol;

                // Choose two predicates.
                var chosenPredicates = this.utilities.pickNElementsFromArray(this.predicates, 2);

                proposition = chosenPredicates[0] + ' ' + operator + ' ' + chosenPredicates[1];
                break;
            case 7:
                // Choose two from: AND, OR, and conditional symbols.
                var operators = [ this.discreteMathUtilities.andSymbol, this.discreteMathUtilities.orSymbol, this.discreteMathUtilities.conditionalSymbol ];
                var chosenOperators = this.utilities.pickNElementsFromArray(operators, 2);

                // Choose three predicates.
                var chosenPredicates = this.utilities.pickNElementsFromArray(this.predicates, 3);

                proposition = '(' + chosenPredicates[0] + ' ' + chosenOperators[0] + ' ' + chosenPredicates[1] + ') ' + chosenOperators[1] + ' ' + chosenPredicates[2];
                break;
        }

        /*
            Question progression order:
            1) Existential and a true instance exists
            2) Existential and no true instance exists
            3) Universal and a false instance exists
            4) Universal and no false instance exists
            5) Randomize (existential and true instance exists) or (universal and false instance exists). Use general hint.
            6) Randomize (existential and no true instance exists) or (universal and no false instance exists). Use general hint.
            7) Use conditional operator and (5).
            8) Use three predicates and (5).
        */
        const existentialHint = 'Select an example (row in the table) that shows the expression is true.';
        const universalHint = 'Select a counter-example that shows the expression is false.';
        const generalHint = 'Select an example or counter-example if appropriate.';
        let useExistential = true;
        let shouldTrueBeSelected = true;

        switch (currentQuestionNumber) {
            case 0:
                this.$hint.text(existentialHint);
                break;
            case 1:
                this.$hint.text(existentialHint);
                shouldTrueBeSelected = false;
                break;
            case 2:
                this.$hint.text(universalHint);
                shouldTrueBeSelected = false;
                useExistential = false;
                break;
            case 3:
                this.$hint.text(universalHint);
                useExistential = false;
                break;
            case 4:
                this.$hint.text(generalHint);
                useExistential = this.utilities.flipCoin();
                shouldTrueBeSelected = useExistential;
                break;
            case 5:
                this.$hint.text(generalHint);
                useExistential = this.utilities.flipCoin();
                shouldTrueBeSelected = !useExistential;
                break;
            case 6:
            case 7:
                this.$hint.text(generalHint);
                useExistential = this.utilities.flipCoin();
                shouldTrueBeSelected = useExistential;
                break;
        }

        // For the first 4 questions, show the hint if an example or counter-example is to be selected.
        var alwaysShowHint = true;
        if (currentQuestionNumber < 4) {
            alwaysShowHint = false;
            this.$hint.css('visibility', 'hidden');
        }
        // Otherwise, always show the hint for the latter 4 questions.
        else {
            this.$hint.css('visibility', 'visible');
        }

        // Randomly generate instances. Generate the statement.
        var instanceAndStatement = this.generateInstancesAndStatement(proposition, useExistential, shouldTrueBeSelected);
        var instances = instanceAndStatement.instances;
        var statement = instanceAndStatement.statement;
        this.utilities.shuffleArray(instances);

        var names = [ 'Ann', 'Bob', 'Joe' ];
        var explanation = '';
        if (useExistential) {
            var exampleIndex = null;
            instances.forEach(function(instance, index) {
                if (instance.expectedAnswer) {
                    exampleIndex = index;
                }
            });

            explanation = names[exampleIndex] + ' is an example: ' + proposition + ' = T.';
        }
        else {
            const exampleIndex = instances.findIndex(instance => instance.expectedAnswer);

            explanation = names[exampleIndex] + ' is a counter-example: ' + proposition + ' = F.';
        }

        this.expectedAnswer = {
            usesExistential:      useExistential,
            shouldTrueBeSelected: shouldTrueBeSelected,
            instances: [
                instances[0].expectedAnswer,
                instances[1].expectedAnswer,
                instances[2].expectedAnswer
            ],
            explanation:    explanation,
            alwaysShowHint: alwaysShowHint
        };

        var tableHTML = this[this.name].tableTemplate({
            checkmarkURL: this.checkmarkImageURL,
            instances:  [
                {
                    name:   names[0],
                    values: instances[0].instance
                },
                {
                    name:   names[1],
                    values: instances[1].instance
                },
                {
                    name:   names[2],
                    values: instances[2].instance
                }
            ],
            predicates: this.predicates
        });
        this.$tableContainer.eq(0).html(tableHTML);

        // Cache commonly accessed elements.
        var $thisTool = $('#' + this.id);
        this.$xMarks = $thisTool.find('.x-mark');
        this.$checkmarks = $thisTool.find('.checkmark');
        this.$pointerArrows = $thisTool.find('.pointer-arrow');

        this.$statement.text(statement);
        this.$table = this.$tableContainer.find('table');
        this.segmentedControl.deselectSegments();
        this.$xMarks.show().hide();
        this.$checkmarks.show().hide();
        this.$pointerArrows.show().hide();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var quantifiedStatementTableExport = {
    create: function() {
        return new QuantifiedStatementTable();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = quantifiedStatementTableExport;
