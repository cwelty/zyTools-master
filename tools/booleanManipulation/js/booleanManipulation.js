function BooleanManipulation() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        var self = this;
        this.utilities = require('utilities');

        this.propositionIntroductionVideoID = 'mzT0x87Qirg';
        this.equationIntroductionVideoID = 'Aon9DAsuhEU';

        // Init options
        this.basicOnly = options && options.basicOnly ? options.basicOnly : false;
        this.progressive = options && options.progressive ? options.progressive : false;
        this.progressiveMinterms = options && options.progressiveMinterms ? options.progressiveMinterms : false;
        this.discreteMath = options && options.discreteMath ? options.discreteMath : false;
        this.reduce = options && options.reduce ? options.reduce : false;
        this.expandAndReduce = options && options.expandAndReduce ? options.expandAndReduce : false;
        this.useMultipleParts = options && options.useMultipleParts ? options.useMultipleParts : false;

        this.videoID = this.discreteMath ? this.propositionIntroductionVideoID : this.equationIntroductionVideoID;
        this.videoURL = 'https://www.youtube.com/embed/' + this.videoID + '?rel=0';

        var videoLinkHTML = this[this.name]['videoLink']({
            videoURL: this.videoURL
        });

        var templateToChoose = this.progressive ? 'progression' : 'template';
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name][templateToChoose]({
            id:        this.id,
            videoLink: videoLinkHTML
        });
        this.preventInteraction = false;
        if (this.progressive) {
            this.progressionTool = require('progressionTool').create();

            // Normal progressive mode
            var numToWin = 6;
            if (this.progressiveMinterms) {
                numToWin = 3;
            }
            else if (this.reduce) {
                numToWin = 5;
            }
            else if (this.expandAndReduce) {
                numToWin = 2;
            }
            var started = false;
            this.progressionTool.init(this.id, this.parentResource, {
                html: html,
                css: css,
                numToWin: numToWin,
                useMultipleParts: self.useMultipleParts,
                start: function() {
                    self.startClicked();
                    self.generatedEquation = self.generateProgressionQuestion(0);
                    self.preventInteraction = false;
                },
                reset: function() {
                    self.reset();
                },
                next: function(currentQuestion) {
                    self.generatedEquation = self.generateProgressionQuestion(currentQuestion);
                    self.$sidebar.addClass('highlight-sidebar');
                    self.preventInteraction = false;
                },
                isCorrect: function(currentQuestion) {
                    self.$variableSelectContainer.hide();
                    self.$modalCover.removeClass('active-cover');
                    self.showButtons();
                    self.resetSelection();
                    self.$sidebar.removeClass('highlight-sidebar');
                    // Disable undo button
                    var $undoButton = $('#' + self.id + ' .undo-button');
                    self.utilities.disableButton($undoButton);

                    // Get user and expected answers
                    var unmodifiedUserAnswer = $('#' + self.id + ' div.entire-equation:last').text();
                    var unmodifiedExpectedAnswer = self.generatedEquation.end;

                    // Remove white space from user and expected answers
                    var userAnswer = self.trimAndRemoveSpaces(unmodifiedUserAnswer);
                    var expectedAnswer = self.trimAndRemoveSpaces(unmodifiedExpectedAnswer);

                    // Determine correctness and output message
                    var isAnswerCorrect = self.verifyEquation(userAnswer, expectedAnswer);
                    var explanationMessage = isAnswerCorrect ? 'Correct' : 'Your equation: ' + unmodifiedUserAnswer + ' does not match the goal: ' + unmodifiedExpectedAnswer;

                    self.preventInteraction = true;

                    return {
                        explanationMessage: explanationMessage,
                        userAnswer:         userAnswer,
                        expectedAnswer:     expectedAnswer,
                        isCorrect:          isAnswerCorrect
                    };
                }
            });
        }
        else {
            $('#' + this.id).html(css + html);
        }
        $('#' + this.id).addClass('unselectable');
        this.propertyIndex = -1;
        this.currentVarID = 0;
        this.selectionReady = false;
        this.selectedTerms = null;
        this.isError = false;
        this.propertyDirection = PROPERTY_DIRECTIONS.UNDEFINED;
        this.currentDifficulty = DIFFICULTIES.BASIC;
        this.propertySelected = false;
        this.previousDifficulty = DIFFICULTIES.BASIC;
        this.PROPERTY_INDICES = {
            DISTRIBUTIVE: 0,
            IDENTITY_AND: 1,
            IDENTITY_OR: 2,
            COMPLEMENT_OR: 3,
            IDEMPOTENCE_OR: 4,
            COMPLEMENT_AND: 5,
            ANNIHILATOR_AND: 6,
            ANNIHILATOR_OR: 7
        };
        this.DISCRETE_PROPERTY_INDICES = {
            DISTRIBUTIVE: 0,
            DISTRIBUTIVE_OR: 1,
            DEMORGAN_AND: 2,
            DEMORGAN_OR: 3,
            CONDITIONAL: 4,
            IDENTITY_AND: 5,
            IDENTITY_OR: 6,
            DOUBLE_NEG: 7,
            COMPLEMENT_OR: 8,
            COMPLEMENT_AND: 9,
            COMPLEMENT_TRUE: 10,
            COMPLEMENT_FALSE: 11,
            IDEMPOTENCE_OR: 12,
            ANNIHILATOR_AND: 13,
            ANNIHILATOR_OR: 14
        };

        // Cache
        this.$userPrompt = $('#' + this.id + ' .user-prompt');
        this.$selectNextTermButton = $('#' + this.id + ' .select-next-term-button');
        this.utilities.disableButton(this.$selectNextTermButton);

        this.$resetConfirmContainer = $('#' + this.id + ' .reset-confirm-container');
        this.$resetConfirmContainer.hide();

        this.$variableSelectContainer = $('#' + this.id + ' .variable-select-container');
        this.$variableSelectContainer.hide();

        this.$undoButton = $('#' + this.id + ' .undo-button');
        this.utilities.disableButton(this.$undoButton);

        this.$applyButton = $('#' + this.id + ' .apply-button');
        this.utilities.disableButton(this.$applyButton);

        this.$resetButton = $('#' + this.id + ' .reset-button');

        this.$goal = $('#' + this.id + ' .goal');
        this.$equationContainer = $('#' + this.id + ' .equation-container');
        this.$sidebar = $('#' + this.id + ' .sidebar');
        this.$modalCover = $('#' + this.id + ' .modal-cover');
        if (this.discreteMath) {
            this.USER_SYMBOLS = DISCRETE_SYMBOLS;
            this.PROPERTY_INDICES = this.DISCRETE_PROPERTY_INDICES;
            $('#' + this.id).addClass('discrete-math');

            // Build list of properties with their steps forward and steps reverse
            this.PROPERTIES = [
                new Property(2, 3),
                new Property(2, 3),
                new Property(2, 0),
                new Property(2, 0),
                new Property(2, 0),
                new Property(2, 0),
                new Property(2, 0),
                new Property(1, 0),
                new Property(2, 0),
                new Property(2, 0),
                new Property(1, 0),
                new Property(1, 0),
                new Property(2, 0),
                new Property(2, 0),
                new Property(2, 0)
            ];

            // Build sidebar with laws
            var html = this[this.name]['rules'](generateSidebarForDiscreteMath(this.basicOnly, this.expandAndReduce));
            this.$sidebar.append(html);
        }
        else {
            this.USER_SYMBOLS = SYMBOLS;
            this.USER_SYMBOLS.VARIABLES = VARIABLES;

            // Build list of properties with their steps forward and steps reverse
            this.PROPERTIES = [
                new Property(2, 3),
                new Property(2, 1),
                new Property(2, 1),
                new Property(2, 1),
                new Property(2, 1),
                new Property(2, 0),
                new Property(2, 0),
                new Property(2, 0)
            ];

            // Build sidebar with properties
            var html = this[this.name]['rules'](generateSidebar());
            this.$sidebar.append(html);
        }

        this.$propertyContainer = $('#' + this.id + ' .property-container');

        if (this.basicOnly) {
            $('#' + this.id + ' .bi-directional .direction.left').hide();
            $('#difficultyContainer_' + this.id).hide();
            $('#' + this.id + ' .property').each(function(index) {

                // Hide everything but the introduced properties
                if ((index === self.PROPERTY_INDICES.IDENTITY_AND) || (index === self.PROPERTY_INDICES.COMPLEMENT_OR) || (index === self.PROPERTY_INDICES.DISTRIBUTIVE)) {
                    self.PROPERTIES[index].stepsReverse = 0;
                }
                else {
                    $(this).hide();
                }
            });
            $('#' + this.id + ' .property-label').each(function(index) {

                // Hide everything but the introduced properties
                if ((index === self.PROPERTY_INDICES.IDENTITY_AND) || (index === self.PROPERTY_INDICES.COMPLEMENT_OR) || (index === self.PROPERTY_INDICES.DISTRIBUTIVE)) {
                    self.PROPERTIES[index].stepsReverse = 0;
                }
                else {
                    $(this).hide();
                }
            });
            if (!this.discreteMath) {
                $('#' + this.id + ' .unidirectional-container').hide();
            }
        }
        if (!this.progressive) {
            $('#' + this.id + ' .start-button').click(function() {
                $(this).hide();
                self.startClicked();
                if (!self.beenClicked) {
                    var event = {
                        part: 0,
                        complete: true,
                        answer: '',
                        metadata: {
                            event: 'booleanManipulation started'
                        }
                    };
                    self.parentResource.postEvent(event);
                }
                self.beenClicked = true;
            });
        }

        // Undoes the last property applied
        this.$undoButton.click(function(e) {
            var numEquations = $('#' + self.id + ' .equation').length;
            if (self.propertySelected && (numEquations > 1)) {
                if (self.selectedTerms.length > 0) {
                    var $deselectedVariable;
                    if (self.$selectNextTermButton.is(':disabled')) {
                        if (!self.currentlySelectedTerm.completeTerm) {
                            $deselectedVariable = $(self.selectedTerms[self.selectedTerms.length - 1].variables[0]);
                            self.currentlySelectedTerm = self.selectedTerms[self.selectedTerms.length - 1];
                            self.selectedTerms.splice(self.selectedTerms.length - 1, 1);
                            self.stepsTaken--;
                        }
                        else {
                            $deselectedVariable = $(self.currentlySelectedTerm.variables[0]);
                        }
                    }
                    else {
                        $deselectedVariable = $(self.currentlySelectedTerm.variables[0]);
                    }
                    self.variableClicked($deselectedVariable);
                    self.$userPrompt.text(generatePromptText(self.stepsTaken));
                    self.utilities.disableButton(self.$selectNextTermButton);
                    self.utilities.disableButton(self.$applyButton);
                }
                else {
                    self.resetSelection();
                    self.propertySelected = false;
                }
            }
            else if (numEquations > 1) {
                $('#' + self.id + '  div.entire-equation:last').remove();
                $('#' + self.id + ' .variable').unbind('click');
                $('#' + self.id + '  div.equation:last .variable').click(function() {
                    self.variableClicked(this);
                });
                self.highlightCurrentEquation();
                if (numEquations === 2) {
                    self.utilities.disableButton(self.$undoButton);
                    self.propertySelected = false;
                }
                self.isError = false;
                self.resetSelection();
            }
            else if (self.propertySelected && !(numEquations > 1)) {
                if (self.selectedTerms.length > 0) {
                    var $deselectedVariable;
                    if (self.$selectNextTermButton.is(':disabled')) {
                        if (!self.currentlySelectedTerm.completeTerm) {
                            $deselectedVariable = $(self.selectedTerms[self.selectedTerms.length - 1].variables[0]);
                            self.currentlySelectedTerm = self.selectedTerms[self.selectedTerms.length - 1];
                            self.selectedTerms.splice(self.selectedTerms.length - 1, 1);
                            self.stepsTaken--;
                        }
                        else {
                            $deselectedVariable = $(self.currentlySelectedTerm.variables[0]);
                        }
                    }
                    else {
                        $deselectedVariable = $(self.currentlySelectedTerm.variables[0]);
                    }
                    self.variableClicked($deselectedVariable);
                    self.$userPrompt.text(generatePromptText(self.stepsTaken));
                    self.utilities.disableButton(self.$selectNextTermButton);
                    self.utilities.disableButton(self.$applyButton);
                }
                else {
                    self.resetSelection();
                    self.propertySelected = false;
                }
                if (self.selectedTerms.length === 0) {
                    self.utilities.disableButton(self.$undoButton);
                }
            }
            self.$equationContainer.css('cursor', '');
        });
    };

    // |str| is required and a string
    this.trimAndRemoveSpaces = function(str) {
        return str.trim().replace(/\s/g, '');
    };

    // Class - Properties have a number of steps for each direction
    function Property(stepsForward, stepsReverse) {
        this.stepsForward = stepsForward;
        this.stepsReverse = stepsReverse;
    }

    /*
        Verifies that the user equation is the same as the correct equation. Allows the user
        to create equations that are ordered differently than the correct answer. Returns a boolean that
        is true when the |userEquation| is correct.
        |userEquation| - string
        |correctEquation| - string
    */
    this.verifyEquation = function(userEquation, correctEquation) {
        if (this.discreteMath) {
            userEquation = toDigitalDesign(userEquation);
            correctEquation = toDigitalDesign(correctEquation);
        }
        var sortRightUser = sortEquation(userEquation.substr(userEquation.indexOf('=') + 1));
        var sortRightCorrect = sortEquation(correctEquation.substr(correctEquation.indexOf('=') + 1));
        sortRightUser = sortRightUser.replace(/\s/g, '');
        var sortedTermsUser = sortRightUser.split(SYMBOLS.OR);
        sortRightCorrect = sortRightCorrect.replace(/\s/g, '');
        var sortedTermsCorrect = sortRightCorrect.split(SYMBOLS.OR);

        // True as long as the right hand side of the equations of both the userEquation and the correctEquation are the same
        var rightHandSame = true;
        for (var i = 0; i < sortedTermsUser.length; i++) {
            var j;
            for (j = 0; j < sortedTermsCorrect.length; j++) {
                if (sortedTermsUser[i] === sortedTermsCorrect[j]) {
                    break;
                }
            }

            // Couldn't find term, right hand sides are not the same
            if (j === sortedTermsCorrect.length) {
                rightHandSame = false;
                break;
            }
        }
        return rightHandSame && (sortedTermsUser.length === sortedTermsCorrect.length);
    };

    // Hide buttons when reset dialog is showing
    this.hideButtons = function() {
        this.utilities.disableButton(this.$resetButton);
        this.utilities.disableButton(this.$selectNextTermButton);
        this.utilities.disableButton(this.$undoButton);
        this.utilities.disableButton(this.$applyButton);
    };

    // Show buttons after reset dialog has been confirmed or canceled
    this.showButtons = function() {
        this.utilities.enableButton(this.$resetButton);
        this.utilities.enableButton(this.$selectNextTermButton);
        this.utilities.enableButton(this.$undoButton);
        this.utilities.enableButton(this.$applyButton);
    };

    // Display a dialog to confirm reseting the tool, |e| - event object
    this.resetClick = function(e) {
        var self = this;
        var numEquations = $('#' + this.id + ' .equation').length;
        if ((numEquations > 1) && (this.$userPrompt.text() !== 'Done.')) {
            this.$modalCover.addClass('active-cover');
            this.$resetConfirmContainer.show();
            this.hideButtons();
            $('#' + this.id).mousedown(function(event) {

                // Cancel reset unless confirm reset is clicked
                if (!$(event.target).hasClass('confirm-reset-button')) {
                    self.cancelReset();
                }
            });
        }
        else {
            this.reset();
        }
    };

    // Helper to enable/disable the Ok button, |enabled| - boolean - true enables the button
    this.enableOkButton = function(enabled) {
        if (enabled) {
            this.utilities.enableButton($('#' + this.id + ' .ok-button'));
            $('#' + this.id + ' .ok-button').show();

            // Don't want user to undo when ok prompt is up
            this.utilities.disableButton(this.$undoButton);
        }
        else {
            this.utilities.disableButton($('#' + this.id + ' .ok-button'));
            $('#' + this.id + ' .ok-button').hide();
        }
    };

    // Highlights the current equation that can be manipulated
    this.highlightCurrentEquation = function() {
        $('#' + this.id + ' .equation').removeClass('current-equation');
        $('#' + this.id + '  div.left-hand-side').removeClass('current-equation');
        $('#' + this.id + '  div.equation:last').addClass('current-equation');
        $('#' + this.id + '  div.left-hand-side:last').addClass('current-equation');
    };

    /*
        Return the goal text for |generatedEquation|.
        |expectedEquation| is required and a string.
    */
    this.buildGoalText = function(expectedEquation) {
        var goalText = 'Goal: ';
        if (!this.discreteMath) {
            goalText += 'w = ';
        }
        goalText += expectedEquation;
        return goalText;
    };

    // Generates progression question using the given |questionIndex|, the greater the index the harder the question
    this.generateProgressionQuestion = function(questionIndex) {
        var mintermGenericGoalText = 'Goal: Convert to sum-of-minterms';
        var simplifyGenericGoalText = 'Goal: Simplify the equation';
        var self = this;
        var generatedEquation = generateProgressionEquation(this.discreteMath, this.progressiveMinterms, this.reduce, this.expandAndReduce, questionIndex, this.utilities);

        if (questionIndex === 0) {
            var goalText = this.buildGoalText(generatedEquation.end);
            this.$goal.text(goalText);
        }
        else if (this.progressiveMinterms) {
            this.$goal.text(mintermGenericGoalText);
        }
        else {
            this.$goal.text(simplifyGenericGoalText);
        }

        this.$equationContainer.children().remove();
        this.$equationContainer.append(createEquationHTML(this.id, generatedEquation.start, function() {
            return self.newVarID();
        }, this.USER_SYMBOLS, this.discreteMath));

        if (this.discreteMath) {
            if (this.progressive) {
                this.$userPrompt.text('Select a law, or click Check if finished.');
            }
            else {
                this.$userPrompt.text('Select a law.');
            }
        }
        else {
            if (this.progressive) {
                this.$userPrompt.text('Select a property, or click Check if finished.');
            }
            else {
                this.$userPrompt.text('Select a property.');
            }
        }

        this.$sidebar.addClass('highlight');
        $('#' + this.id + ' div.equation:last').removeClass('highlight-border');
        var self = this;
        $('#' + this.id + ' .variable').click(function() {
            self.variableClicked(this);
        });
        this.highlightCurrentEquation();
        return generatedEquation;
    };

    // Creates all of the different ui handlers after the user has clicked the start button
    this.startClicked = function() {
        var self = this;

        this.$selectNextTermButton.unbind('click');
        this.$applyButton.unbind('click');
        // Clicking next takes the currently selected term and adds it to the list of terms
        // Once all of the terms have been selected user can then apply the property using the same button
        this.$selectNextTermButton.click(function(e) {
            if (self.currentlySelectedTerm.completeTerm && self.stepsTaken < self.stepsForProperty) {
                self.selectedTerms.push(self.currentlySelectedTerm);
                self.currentlySelectedTerm = {
                    variables: [],
                    startIndex: $('#' + self.id + ' div.equation:last').text().length,
                    completeTerm: ''
                };
                self.stepsTaken++;
                self.$userPrompt.text(generatePromptText(self.stepsTaken));
                self.utilities.disableButton(self.$selectNextTermButton);
            }
        });

        this.$applyButton.click(function() {
            self.selectedTerms.push(self.currentlySelectedTerm);
            self.currentlySelectedTerm = {
                variables: [],
                startIndex: $('#' + self.id + ' div.equation:last').text().length,
                completeTerm: ''
            };
            self.stepsTaken++;
            if (self.stepsTaken === self.stepsForProperty && self.stepsTaken != 0) {
                if (self.propertyIndex === self.PROPERTY_INDICES.COMPLEMENT_OR && self.propertyDirection === PROPERTY_DIRECTIONS.REVERSE) {

                    // Show variable options then manipulate
                    self.$variableSelectContainer.show();
                    self.hideButtons();
                    self.$modalCover.addClass('active-cover');
                }
                else {
                    self.manipulate(self.propertyIndex, $('#' + self.id + ' div.equation:last').text(), self.selectedTerms, self.propertyDirection);
                }
            }

            // Property cannot be executed in this direction
            else {
                self.resetSelection();
            }
            self.utilities.disableButton(self.$applyButton);
        });

        $('#' + this.id + '  div.equation:last .variable').click(function() {
            self.variableClicked(this);
        });

        // Left hand side of the property is clicked, user wants to apply property in reverse
        $('#' + this.id + ' .condition').click(function(e) {
            if (self.isError || self.$modalCover.hasClass('active-cover') || self.preventInteraction) {
                return;
            }
            self.resetSelection();
            self.propertyIndex = self.$propertyContainer.find('.property').index($(this).parent());
            self.propertyDirection = PROPERTY_DIRECTIONS.FORWARD;
            self.stepsForProperty = self.PROPERTIES[self.propertyIndex].stepsForward;
            if (self.stepsForProperty === 0) {
                self.propertyDirection = PROPERTY_DIRECTIONS.REVERSE;
                self.stepsForProperty = self.PROPERTIES[self.propertyIndex].stepsReverse;
            }
            self.readyToSelect(this);
            self.$sidebar.removeClass('highlight-sidebar');
            $('#' + self.id + ' div.equation:last').addClass('highlight-border');
            self.propertySelected = true;
            self.utilities.enableButton(self.$undoButton);
            self.$equationContainer.css('cursor', 'pointer');
        });

        // Right hand side of the property is clicked, user wants to apply property in reverse
        $('#' + this.id + ' .property-container .result').click(function(e) {
            if (self.isError || self.$modalCover.hasClass('active-cover') || self.preventInteraction) {
                return;
            }
            self.resetSelection();
            self.propertyIndex = self.$propertyContainer.find('.property').index($(this).parent());
            self.propertyDirection = PROPERTY_DIRECTIONS.REVERSE;
            self.stepsForProperty = self.PROPERTIES[self.propertyIndex].stepsReverse;
            if (self.stepsForProperty === 0) {
                self.propertyDirection = PROPERTY_DIRECTIONS.FORWARD;
                self.stepsForProperty = self.PROPERTIES[self.propertyIndex].stepsForward;
            }
            self.readyToSelect(this);
            self.$sidebar.removeClass('highlight-sidebar');
            $('#' + self.id + ' div.equation:last').addClass('highlight-border');
            self.propertySelected = true;
            self.utilities.enableButton(self.$undoButton);
            self.$equationContainer.css('cursor', 'pointer');
        });

        $('#' + this.id + ' .variable-select-container .result').unbind('click');
        $('#' + this.id + ' .variable-select-container .result').click(function(e) {
            var replacementVariable = $(this).text()[0];
            self.$variableSelectContainer.hide();
            self.$modalCover.removeClass('active-cover');
            self.showButtons();
            self.manipulate(self.propertyIndex, $('#' + self.id + ' div.equation:last').text(), self.selectedTerms, self.propertyDirection, replacementVariable);
        });

        // Displays a prompt to reset the tool with a confirm and cancel button
        this.$resetButton.click(function(e) {
            self.resetClick(e);
        });

        if (!this.progressive) {
            this.segmentedControl = require('segmentedControl').create();
            this.segmentedControl.init([ 'Basic', 'Intermediate', 'Advanced' ], 'difficultyContainer_' + this.id, function(index, title) {
                self.previousDifficulty = self.currentDifficulty;
                switch(index) {
                    case 0:
                        self.currentDifficulty = DIFFICULTIES.BASIC;
                        break;
                    case 1:
                        self.currentDifficulty = DIFFICULTIES.INTERMEDIATE;
                        break;
                    case 2:
                        self.currentDifficulty = DIFFICULTIES.ADVANCED;
                        break;
                }
                self.resetClick();
            });
        }

        $('#' + this.id + ' .ok-button').click(function(e) {
            if (self.isError) {
                self.resetSelection();
                self.isError = false;
                self.enableOkButton(false);
            }
        });

        // Cancel reset dialog
        $('#' + this.id + ' .cancel-reset-button').click(function() {
            self.cancelReset();
        });

        // Confirm reset dialog
        $('#' + this.id + ' .confirm-reset-button').click(function() {
            self.reset();
        });

        this.$resetButton.show();
        this.$equationContainer.append(createEquationHTML(this.id, this.generateRandomProblem(), function() {
            return self.newVarID();
        }, this.USER_SYMBOLS, this.discreteMath));
        $('#' + this.id + ' .variable').click(function() {
            self.variableClicked(this);
        });
        this.highlightCurrentEquation();
        this.$sidebar.addClass('highlight-sidebar');
        this.resetSelection();
    };

    /*
        Intializes some variables so that the user can begin selecting variables
        |clickedObject| is required and a DOM object.
    */
    this.readyToSelect = function(clickedObject) {
        this.selectionReady = true;
        this.selectedTerms = [];
        this.stepsTaken = 0;

        // Visually tells the user the direction that the property is being applied
        $('#' + this.id + ' .property .direction').removeClass('left');
        $('#' + this.id + ' .property .direction').removeClass('right');
        if (this.propertyDirection === PROPERTY_DIRECTIONS.FORWARD) {
            $(clickedObject).parent().find('.direction').addClass('right');
            $(clickedObject).parent().find('.result').addClass('light-gray');
            $(clickedObject).parent().find('.condition').addClass('gray');
        }
        else if (this.propertyDirection === PROPERTY_DIRECTIONS.REVERSE) {
            $(clickedObject).parent().find('.direction').addClass('left');
            $(clickedObject).parent().find('.condition').addClass('light-gray');
            $(clickedObject).parent().find('.result').addClass('gray');
        }
        this.$selectNextTermButton.text('Select next term');
        this.$userPrompt.text(generatePromptText(this.stepsTaken));
    };

    /*
        Takes in the property type, the equation to manipulate, the terms that the user selected, and the direction that the property is being applied, forward or reverse
        this will break down the selected terms into a subEquation that the parser knows how to handle, the parser will attempt to apply the passed in property. The parser will pass
        back the newEquation and an errorMessage if there is one. Manipulate then uses this information to either create the newEquation or display an error message
        |property| is required and is an integer
        |equation| is required and is a string
        |selectedTerms| is required and is a list of objects with an integer startIndex and a string completeTerm
        |direction| is required and is an integer
        |replacementVariable| is required and is a string
    */
    this.manipulate = function(property, equation, selectedTerms, direction, replacementVariable) {
        var self = this;

        /*
            If we are in discrete math we need to convert to digital design.
            All of the divs and indicies must be updated to correspond to the digital design version of the equation.
        */
        if (this.discreteMath) {
            var originalEquation = equation;
            equation = toDigitalDesign(equation);
            var variableDivs = $('#' + this.id + ' div.equation:last').find('.variable');
            this.$equationContainer.append(createEquationHTML(this.id, equation, function() {
                return self.newVarID();
            }, this.USER_SYMBOLS, this.discreteMath));
            var newVariableDivs = $('#' + this.id + ' div.equation:last').find('.variable');
            var i = 0, j = 0;
            var noChange;

            // Update selected terms to correspond to the digital design version of the equation
            while ((i !== newVariableDivs.length) && (j !== variableDivs.length)) {
                noChange = true;
                var newVariableIText = $(newVariableDivs[i]).text();
                var newVariableJText = $(variableDivs[j]).text();
                if ((newVariableIText === SYMBOLS.LEFT_PAREN) && (newVariableJText === SYMBOLS.LEFT_PAREN)) {
                    i++;
                    j++;
                    noChange = false;
                }
                else if ((newVariableIText === SYMBOLS.RIGHT_PAREN) && (newVariableJText === SYMBOLS.RIGHT_PAREN)) {
                    i++;
                    j++;
                    noChange = false;
                }
                else if ((newVariableIText === (SYMBOLS.RIGHT_PAREN + '\'')) && (newVariableJText === SYMBOLS.RIGHT_PAREN)) {
                    i++;
                    j++;
                    noChange = false;
                }
                else if (newVariableJText === SYMBOLS.LEFT_PAREN) {
                    j++;
                    noChange = false;
                }
                else if (newVariableJText === SYMBOLS.RIGHT_PAREN) {
                    j++;
                    noChange = false;
                }
                else if ((newVariableIText === SYMBOLS.OR) && (newVariableJText === DISCRETE_SYMBOLS.OR)) {
                    i++;
                    j++;
                    noChange = false;
                }
                else if (newVariableJText === DISCRETE_SYMBOLS.AND) {
                    j++;
                    noChange = false;
                }
                else {
                    for (var k = 0; k < selectedTerms.length; k++) {
                        if ((i === newVariableDivs.length) || (j === variableDivs.length)) {
                            break;
                        }
                        for (var w = 0; w < selectedTerms[k].variables.length; w++) {
                            if ($(variableDivs[j])[0].id === $(selectedTerms[k].variables[w])[0].id) {
                                selectedTerms[k].variables[w] = newVariableDivs[i];
                                $(selectedTerms[k].variables[w]).addClass('selected');
                                i++;
                                j++;
                                noChange = false;
                            }
                        }
                    }
                }

                // Currently at selectable variable but it wasn't selected
                if (noChange) {
                    i++;
                    j++;
                }
            }
            selectedTerms.forEach(function(value, index) {
                selectedTerms[index].completeTerm = toDigitalDesign(selectedTerms[index].completeTerm);
                selectedTerms[index].startIndex = findPositionInStringFromDiv(self.id, $(selectedTerms[index].variables[0]));
            });
            $('#' + this.id + ' div.equation:last').parent().remove();
        }

        // Make sure the terms are ordered left to right
        selectedTerms = orderTermsCorrectly(equation, selectedTerms);
        var tokenizer = new Tokenizer();
        var parser = new Parser(this.PROPERTY_INDICES);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.LITERAL], TERMINALS.LITERAL);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.OR], TERMINALS.OR);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.AND], TERMINALS.AND);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.LEFT_PAREN], TERMINALS.LEFT_PAREN);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.RIGHT_PAREN], TERMINALS.RIGHT_PAREN);
        tokenizer.add(TERMINAL_REGEX[TERMINALS.IMPLIES], TERMINALS.IMPLIES);
        var propertyResults = applyProperty(property, equation, selectedTerms, direction, replacementVariable, tokenizer, parser, this.discreteMath, this.PROPERTY_INDICES);
        var specificErrorMessage = propertyResults.specificErrorMessage;
        var error = propertyResults.error;
        var newEquation = propertyResults.newEquation;
        this.$equationContainer.css('cursor', '');
        // Property was applied, add new equation to equation container and only allow variables from this equation to be selected
        if (newEquation) {

            if (!this.discreteMath) {
                // Remove all ands if not followed by 0 or 1, replace with implicit ands
                newEquation = newEquation.replace(/\*/g, '');
                newEquation = newEquation.replace(/(\w+'?)\(([0-1])\)/g, '$1·$2');
                newEquation = newEquation.replace(/\(\((.*)\)\)/g, '($1)');
            }
            newEquation = sortEquation(newEquation);
            if (this.discreteMath) {
                newEquation = toDiscreteMath(newEquation);
            }
            $('#' + this.id + ' div.equation:last').removeClass('highlight-border');
            this.$equationContainer.append(createEquationHTML(this.id, newEquation, function() {
                return self.newVarID();
            }, this.USER_SYMBOLS, this.discreteMath));
            this.highlightCurrentEquation();
            $('#' + this.id + ' .variable').unbind('click');
            $('#' + this.id + '  div.equation:last .variable').click(function() {
                self.variableClicked(this);
            });
            this.utilities.enableButton(this.$undoButton);
            this.resetSelection();
        }

        // Error handle
        else {
            var genericErrorMessage;

            // Bad input, not enough variables, too many, improper length, etc.
            if (error === ERROR_TYPE.WRONG_INPUT) {
                genericErrorMessage = 'Error: Variables were not selected correctly for property.';
            }

            // Variables selected in wrong order
            else if (error === ERROR_TYPE.WRONG_ORDER) {
                genericErrorMessage = 'Error: Variables were selected in the wrong order.';
            }

            // Something went wrong
            else {
                genericErrorMessage = 'Error: Property could not be applied.';
            }
            this.isError = true;
            this.enableOkButton(true);
            if (specificErrorMessage) {
                if (this.discreteMath) {
                    var selectionError = 'Unexpected symbol ';
                    if (specificErrorMessage.indexOf(selectionError) !== -1) {
                        var charToConvert = specificErrorMessage[specificErrorMessage.indexOf(selectionError) + selectionError.length];
                        charToConvert = toDiscreteMath(charToConvert);
                        specificErrorMessage = specificErrorMessage.substring(0, specificErrorMessage.indexOf(selectionError) + selectionError.length) + charToConvert + specificErrorMessage.substring(specificErrorMessage.indexOf(selectionError) + selectionError.length + 1);
                    }
                }
                this.$userPrompt.text(specificErrorMessage);
            }
            else {
                this.$userPrompt.text(genericErrorMessage);
            }
        }
        this.propertySelected = false;
    };

    // Cancel the reset either through the button or outside clicking
    this.cancelReset = function() {
        this.showButtons();
        this.$modalCover.removeClass('active-cover');
        this.$resetConfirmContainer.hide();
        $('#' + this.id).unbind('mousedown');

        // Reset was canceled, fix difficulty if reset came from a difficulty button
        this.currentDifficulty = this.previousDifficulty;
        $('#' + this.id + ' .basic-button').removeClass('selected-difficulty');
        $('#' + this.id + ' .intermediate-button').removeClass('selected-difficulty');
        $('#' + this.id + ' .advanced-button').removeClass('selected-difficulty');

        if (this.currentDifficulty === DIFFICULTIES.BASIC) {
            $('#' + this.id + ' .basic-button').addClass('selected-difficulty');
        }
        else if (this.currentDifficulty === DIFFICULTIES.INTERMEDIATE) {
            $('#' + this.id + ' .intermediate-button').addClass('selected-difficulty');
        }
        else if (this.currentDifficulty === DIFFICULTIES.ADVANCED) {
            $('#' + this.id + ' .advanced-button').addClass('selected-difficulty');
        }
    };

    // Every variable we generate needs a unique ID so that we can identify it later.
    this.newVarID = function() {
        return this.currentVarID++;
    };

    // Resets after confirmation
    this.reset = function() {
        var self = this;
        this.$equationContainer.css('cursor', '');
        this.$userPrompt.removeClass('done');
        this.resetSelection();
        this.$modalCover.removeClass('active-cover');
        this.$resetConfirmContainer.hide();
        $('#' + this.id).unbind('mousedown');
        this.$equationContainer.children().remove();

        this.$equationContainer.append(createEquationHTML(this.id, this.generateRandomProblem(), function() {
            return self.newVarID();
        }, this.USER_SYMBOLS, this.discreteMath));

        this.highlightCurrentEquation();
        this.resetSelection();
        this.showButtons();
        this.isError = false;

        $('#' + this.id + ' .variable').click(function() {
            self.variableClicked(this);
        });

        this.utilities.disableButton(this.$selectNextTermButton);
        this.utilities.disableButton(this.$applyButton);

        if (this.progressive) {
            this.$equationContainer.children().remove();
            this.$userPrompt.text('');
            this.$goal.text('');
            $('#' + this.id + ' .property-container .result, #' + this.id + ' .property-container .condition').unbind('click');
            this.$sidebar.removeClass('highlight-sidebar');
            this.$applyButton.unbind('click');
        }

        this.enableOkButton(false);
    };

    // Resets everything that the user has selected
    this.resetSelection = function() {
        this.propertyIndex = -1;
        this.propertyDirection = PROPERTY_DIRECTIONS.UNDEFINED;
        this.selectionReady = false;
        $('#' + this.id + ' .condition').removeClass('gray light-gray');
        $('#' + this.id + ' .result').removeClass('gray light-gray');
        $('#' + this.id + ' .property .direction').removeClass('left right');
        $('#' + this.id + ' .equation .variable').removeClass('selected');
        this.$selectNextTermButton.text('Select next term');
        var currentGoal = $('#' + this.id + ' div.entire-equation:last').text().trim().replace(/\s/g, '');
        var endGoal = this.$goal.text().substr(this.$goal.text().indexOf('w')).trim().replace(/\s/g, '');
        if (!this.progressive && this.verifyEquation(currentGoal, endGoal)) {
            this.$userPrompt.text('Done.');
            this.$userPrompt.addClass('done');
            this.$propertyContainer.removeClass('highlight-border');
            $('#' + this.id + ' div.equation:last').removeClass('highlight-border');
            this.$resetButton.trigger('focus');
        }
        else {
            if (this.discreteMath) {
                if (this.progressive) {
                    this.$userPrompt.text('Select a law, or click Check if finished.');
                }
                else {
                    this.$userPrompt.text('Select a law.');
                }
            }
            else {
                if (this.progressive) {
                    this.$userPrompt.text('Select a property, or click Check if finished.');
                }
                else {
                    this.$userPrompt.text('Select a property.');
                }
            }
            this.$sidebar.addClass('highlight-sidebar');
            $('#' + this.id + ' div.equation:last').removeClass('highlight-border');
        }
        if ($('#' + this.id + ' .equation').length > 1) {
            this.utilities.enableButton(this.$undoButton);
        }
        else {
            this.utilities.disableButton(this.$undoButton);
        }
        this.utilities.disableButton(this.$selectNextTermButton);
        this.utilities.disableButton(this.$applyButton);
        this.currentlySelectedTerm = {
            variables: [],
            startIndex: $('#' + this.id + ' div.equation:last').text().length,
            completeTerm: ''
        };
    };

    // Generate a random equation with a variable number of terms
    this.generateRandomProblem = function() {
        this.$userPrompt.removeClass('done');
        var newEquation = generateRandomEquation(this.basicOnly, this.discreteMath, this.currentDifficulty, this.utilities);
        var goalText = this.buildGoalText(newEquation.end);
        this.$goal.text(goalText);
        return newEquation.start;
    };

    // Adds the selected variable from the user to the currently selected term, |newVariable| - html object - div user clicked on
    this.addVariableToTerm = function(newVariable) {
        // Make this variable highlight
        $(newVariable).addClass('selected');
        if (this.$selectNextTermButton.hasClass('disabled')) {
            if (this.stepsTaken === (this.stepsForProperty - 1)) {
                this.utilities.enableButton(this.$applyButton);
                this.utilities.disableButton(this.$selectNextTermButton);
            }
            else {
                this.utilities.disableButton(this.$applyButton);
                this.utilities.enableButton(this.$selectNextTermButton);
            }
        }

        // Add this variable to the current term need to keep them in the order that they come in the equation
        var indexNewVariableBelongs = 0;
        var newVariableIndexInString = findPositionInStringFromDiv(this.id, $(newVariable));
        for (; indexNewVariableBelongs < this.currentlySelectedTerm.variables.length; indexNewVariableBelongs++) {
            if (findPositionInStringFromDiv(this.id, this.currentlySelectedTerm.variables[indexNewVariableBelongs]) > newVariableIndexInString) {
                break;
            }
        }
        var variableToMove = $(newVariable);
        var i;
        for (i = indexNewVariableBelongs; i < this.currentlySelectedTerm.variables.length; i++) {
            var temp = this.currentlySelectedTerm.variables[i];
            this.currentlySelectedTerm.variables[i] = variableToMove;
            variableToMove = temp;
        }
        this.currentlySelectedTerm.variables[i] = variableToMove;

        // A variable has been added, have to recalculate the startIndex and completeTerm
        var equation = $('#' + this.id + ' div.equation:last').text();
        var startIndex = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[0]));
        var length = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1])) - startIndex + $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1]).text().length;
        this.currentlySelectedTerm.completeTerm = equation.substr(startIndex, length);
        this.currentlySelectedTerm.startIndex = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[0]));
        var variablesToSelect = this.currentlySelectedTerm.completeTerm.replace(new RegExp(this.USER_SYMBOLS.NOT, 'g'), '');
        for (var i = 0, $variable = this.currentlySelectedTerm.variables[0]; i < variablesToSelect.length; i++, $variable = $variable.next()) {
            if (!$variable.hasClass('selected')) {
                $variable.addClass('selected');
            }
        }
    };

    /*
        Takes the passed in variable and looks around for other variables that belong to the same term, adding them to the currently selected term
        |$variable| is required and is a jquery object
    */
    this.selectWholeTerm = function($variable) {
        if (this.discreteMath && ((this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE) || (this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE_OR))) {
            var $previous = $variable.prev();
            while($previous && ($previous.text() !== '(')) {
                if (!$previous.hasClass('selected') && isSelectableVariable($previous.text()[$previous.text().length - 1], this.USER_SYMBOLS)) {
                    this.addVariableToTerm($previous);
                }
                $previous = $previous.prev();
            }

            var $next = $variable.next();
            while($next && ($next.text() !== ')')) {
                if (!$next.hasClass('selected') && isSelectableVariable($next.text()[$next.text().length - 1], this.USER_SYMBOLS)) {
                    this.addVariableToTerm($next);
                }
                $next = $next.next();
            }
        }
        else {
            if (!$variable.prev().hasClass('selected') && isSelectableVariable($variable.prev().text()[0], this.USER_SYMBOLS)) {
                this.addVariableToTerm($variable.prev());
            }
            if (!$variable.next().hasClass('selected') && isSelectableVariable($variable.next().text()[0], this.USER_SYMBOLS)) {
                this.addVariableToTerm($variable.next());
            }
        }
    };

    // Removes all variables from the currently selected term
    this.deSelectWholeTerm = function() {
        var $currentVariable;
        for ($currentVariable = $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1]); $currentVariable.text() !== $(this.currentlySelectedTerm.variables[0]).text(); $currentVariable = $currentVariable.prev()) {
            $currentVariable.removeClass('selected');
        }
        $currentVariable.removeClass('selected');
        this.currentlySelectedTerm.completeTerm = '';
        this.currentlySelectedTerm.variables = [];
    };

    /*
        The clicked variable is added to the current term if applicable. If already selected, this will also deselect that variable.
        |clickedVariable| is required and a DOM object.
    */
    this.variableClicked = function(clickedVariable) {

        // Can select variables and variable has not already been selected, clickedVariable is also a valid variable
        if (this.selectionReady && !$(clickedVariable).hasClass('selected') && (isSelectableVariable($(clickedVariable).text()[$(clickedVariable).text().length - 1], this.USER_SYMBOLS) || isSelectableVariable($(clickedVariable).text()[0], this.USER_SYMBOLS))) {

            // Trying to select a variable that is not part of the current term
            if ((this.currentlySelectedTerm.variables.length > 0) && (!isPartOfCurrentTerm(this.id, clickedVariable, this.currentlySelectedTerm, this.USER_SYMBOLS))) {
                var $currentVariable;
                for ($currentVariable = $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1]); $currentVariable.text() !== $(this.currentlySelectedTerm.variables[0]).text(); $currentVariable = $currentVariable.prev()) {
                    $currentVariable.removeClass('selected');
                }
                $currentVariable.removeClass('selected');
                this.currentlySelectedTerm = {
                    variables: [],
                    startIndex: $('#' + this.id + ' div.equation:last').text().length,
                    completeTerm: ''
                };
            }
            this.addVariableToTerm($(clickedVariable));

            // Select entire term
            if (this.basicOnly || (this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE && this.propertyDirection === PROPERTY_DIRECTIONS.FORWARD) || (this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE_OR && this.propertyDirection === PROPERTY_DIRECTIONS.FORWARD) || (this.propertyIndex === this.PROPERTY_INDICES.IDENTITY_AND && this.propertyDirection === PROPERTY_DIRECTIONS.REVERSE)) {
                this.selectWholeTerm($(clickedVariable));
            }
        }
        else if ($(clickedVariable).hasClass('selected')) {

            // Deselect entire term
            if (this.basicOnly || (this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE && this.propertyDirection === PROPERTY_DIRECTIONS.FORWARD) || (this.propertyIndex === this.PROPERTY_INDICES.DISTRIBUTIVE_OR && this.propertyDirection === PROPERTY_DIRECTIONS.FORWARD) || (this.propertyIndex === this.PROPERTY_INDICES.IDENTITY_AND && this.propertyDirection === PROPERTY_DIRECTIONS.REVERSE)) {
                this.deSelectWholeTerm();
            }
            else {
                var variableWasSelected = false;

                // Find and remove the selected variable
                for (var i = 0; i < this.currentlySelectedTerm.variables.length; i++) {
                    if ($(this.currentlySelectedTerm.variables[i])[0].id === $(clickedVariable)[0].id) {
                        variableWasSelected = true;
                        var $nextVariable = $(this.currentlySelectedTerm.variables[i]).next();
                        var $previousVariable = $(this.currentlySelectedTerm.variables[i]).prev();
                        if ($nextVariable.text() === this.USER_SYMBOLS.OR) {
                            $nextVariable.removeClass('selected');
                        }
                        if ($nextVariable.text() === this.USER_SYMBOLS.AND) {
                            $nextVariable.removeClass('selected');
                        }
                        if ($previousVariable.text() === this.USER_SYMBOLS.OR) {
                            $previousVariable.removeClass('selected');
                        }
                        if ($previousVariable.text() === this.USER_SYMBOLS.AND) {
                            $previousVariable.removeClass('selected');
                        }
                        if ($nextVariable.text() === DISCRETE_SYMBOLS.IMPLIES) {
                            $nextVariable.removeClass('selected');
                        }
                        if ($previousVariable.text() === DISCRETE_SYMBOLS.IMPLIES) {
                            $previousVariable.removeClass('selected');
                        }
                        this.currentlySelectedTerm.variables.splice(i, 1);
                        break;
                    }
                }
                if (!variableWasSelected) {
                    return;
                }
                $(clickedVariable).removeClass('selected');

                // A variable has been removed, have to recalculate the startIndex and completeTerm
                if (this.currentlySelectedTerm.variables.length > 0) {
                    var equation = $('#' + this.id + ' div.equation:last').text();
                    var startIndex = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[0]));
                    var length = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1])) - startIndex + $(this.currentlySelectedTerm.variables[this.currentlySelectedTerm.variables.length - 1]).text().length;
                    this.currentlySelectedTerm.completeTerm = equation.substr(startIndex, length);
                    this.currentlySelectedTerm.startIndex = findPositionInStringFromDiv(this.id, $(this.currentlySelectedTerm.variables[0]));
                }
            }
            if (this.currentlySelectedTerm.variables.length === 0) {
                this.utilities.disableButton(this.$selectNextTermButton);
                this.currentlySelectedTerm = {
                    variables: [],
                    startIndex: $('#' + this.id + ' div.equation:last').text().length,
                    completeTerm: ''
                };
            }
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var booleanManipulationExport = {
    create: function() {
        return new BooleanManipulation();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = booleanManipulationExport;
