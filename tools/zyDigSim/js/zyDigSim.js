/* global ELEMENT_FUNCTIONS, Component */
'use strict';

function ZyDigSim() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useMultipleParts = false;
        this.isProgressionTool = false;
        this.useComponents = false;
        var circuit = '';
        if (options) {
            if ('useMultipleParts' in options) {
                this.useMultipleParts = options.useMultipleParts;
            }

            if ('progressive' in options) {
                this.isProgressionTool = options.progressive;
            }

            if ('useComponents' in options) {
                this.useComponents = options.useComponents;
            }

            if ('useDiscreteMathNotation' in options) {
                this.useDiscreteMathNotation = options.useDiscreteMathNotation;
            }

            if ('circuit' in options) {
                circuit = options.circuit;
            }
            // Try JSONToLoad if circuit doesn't exist. JSONToLoad is legacy support.
            else if ('JSONToLoad' in options) {
                circuit = options.JSONToLoad;
            }
        }

        var examples = [
            'Example D latch',
            'Example half adder',
            'Example decoder (2x4)'
        ];
        if (this.useComponents) {
            examples = [
                'Example datapath with mux and adder'
            ];
        }

        this.latexPrefix = '\\(';
        this.latexPostfix = '\\)';

        this.utilities = require('utilities');
        this.discreteMathUtilities = require('discreteMathUtilities');

        this.css = '<style><%= grunt.file.read(css_filename) %></style>';
        this.html = this[this.name].template({
            id,
            isProgressionTool: this.isProgressionTool,
            examples,
        });

        if (this.isProgressionTool) {
            var numToWin = 7;
            if (this.useComponents) {
                numToWin = 5;
            } else if (this.useDiscreteMathNotation) {
                numToWin = 8;
            }

            var incorrectAnswer = false;
            var tryAgain = false;
            var previousQuestion = -1;
            this.progressionTool = require('progressionTool').create();

            var self = this;
            this.progressionTool.init(this.id, this.parentResource, {
                html: this.html,
                css: this.css,
                numToWin: numToWin,
                useMultipleParts: this.useMultipleParts,
                start: function() {
                    self.setAllowedToEdit(true);
                    self.reset();
                    if (self.useComponents) {
                        self.loadGates();
                    }
                    self.currentProblem = self.generateProgressionQuestion(0);
                    self.displayNextQuestion(self.currentProblem, 0, -1);
                    self.resetUndoRedoStack();
                    previousQuestion = 0;
                    tryAgain = false;
                },
                reset: function() {
                    $('#progressionPrompt_' + self.id).text('');
                    self.setAllowedToEdit(false);
                    self.reset();
                    self.tryAgain = false;
                    if (self.useComponents) {
                        $('#progressionPrompt_' + self.id).text('');
                        $('#' + self.id + ' .progression-image').hide();
                        $('#' + self.id + ' .generated-text').hide();
                        $('#' + self.id + ' .progression-container').animate({
                            height: 0
                        }, 500);
                    }
                },
                next: function(currentQuestion) {
                    self.setAllowedToEdit(true);
                    if (!self.tryAgain) {
                        if (!(incorrectAnswer && self.useComponents)) {
                            self.reset();
                        }
                        if (self.useComponents) {
                            self.loadGates();
                        }
                        self.currentProblem = self.generateProgressionQuestion(currentQuestion);
                        self.displayNextQuestion(self.currentProblem, currentQuestion, previousQuestion);
                        self.resetUndoRedoStack();
                    }
                    self.tryAgain = false;
                    incorrectAnswer = false;
                    previousQuestion = currentQuestion;
                },
                isCorrect: function(currentQuestion) {
                    /*
                        |answerObject| contains four properties:
                            * explanationMessage - string
                            * userAnswer - string
                            * expectedAnswer - string
                            * isCorrect - boolean
                    */
                    var answerObject = self.verifyQuestion(self.currentProblem);
                    answerIsCorrect = answerObject.isCorrect;
                    self.setAllowedToEdit(false);
                    incorrectAnswer = !answerIsCorrect;
                    return answerObject;
                }
            });

            this.$middleContainerCover = $('#' + this.id + ' .middle-container-cover');

            this.valueType = {
                CONSTANT : 0,
                RANDOM8 : 1
            };
        }
        else {
            $('#' + this.id).html(this.css + this.html);

            var self = this;
            $('#' + this.id).click(function() {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'zyDigSim clicked'
                    }
                };

                self.parentResource.postEvent(event);
            });
        }

        if (options !== null) {
            this.initZyDigSim(this.id, this.parentResource, this.name, options['canEdit'], options['canExport'], options['toolBoxEnabled'], options['width'], options['height'], circuit, options['basicOnly'], options['scrollable'], options['progressive'], options['useComponents'], options['useGates']);
        }
        else {
            this.initZyDigSim(this.id, this.parentResource, this.name);
        }

        if (this.isProgressionTool) {
            this.setAllowedToEdit(false);
        }
    };

    <%= grunt.file.read(hbs_output) %>

    // Helper for a 'random' integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.loadGates = function() {
        this.Dgt = this.getElementThatContains('D_');
        this.Ts = this.getElementByName('T_s');
        this.Tld = this.getElementByName('T_ld');
        this.clock = this.getElementByName('clk');
        this.D = this.getElementByName('D');
        this.T = this.getElementByName('T');
    };

    this.displayImage = function($imageToDisplay, currentQuestion) {
        $('#progressionPrompt_' + this.id).text('');

        var self = this;
        $('#' + this.id + ' .progression-container').animate({
            height: $imageToDisplay[0].naturalHeight
        }, 500, function() {
            $imageToDisplay.show();
            $('#' + self.id + ' .problem' + (currentQuestion + 1)).show();
            $('#progressionPrompt_' + self.id).text('Build the datapath for the given HLSM');
        });
    };

    this.displayNextQuestion = function(currentProblem, currentQuestion, previousQuestion) {
        if (this.useComponents) {
            $('#' + this.id + ' .generated-text').hide();
            if (currentQuestion === previousQuestion) {
                $('#' + this.id + ' .problem' + (currentQuestion + 1)).show();
            }
            else {
                $('#' + this.id + ' .progression-image').hide();
                this.displayImage($('#progressionImage' + (currentQuestion + 1) + '_' + this.id), currentQuestion);
            }
        }
        else {
            if (this.useDiscreteMathNotation) {
                $('#progressionPrompt_' + this.id).text(this.latexPrefix + currentProblem.display + this.latexPostfix);
                this.parentResource.latexChanged();
            }
            else {
                $('#progressionPrompt_' + this.id).text(currentProblem.display);
            }
        }
    };

    /*
        Verify the users's answer based on the |currentProblem| and returns an Object to be passed to the progressionTool's isCorrect function.
        |currentProblem| is required and a Question.
    */
    this.verifyQuestion = function(currentProblem) {
        var answerIsCorrect = false;
        var explanation = '';
        var userAnswer = '';
        var expectedAnswer = '';
        var latexChanged = false;
        if (this.useComponents) {
            for (var w = 0; w < currentProblem.solutions.length; w++) {
                for (var j = 0; j < currentProblem.solutions[w].length; j++) {
                    for (var i = 0; i < currentProblem.solutions[w][j].inputs.length; i++) {
                        currentProblem.solutions[w][j].inputs[i].element = this.getElementByName(currentProblem.solutions[w][j].inputs[i].element.name);
                    }
                    for (var i = 0; i < currentProblem.solutions[w][j].outputs.length; i++) {
                        currentProblem.solutions[w][j].outputs[i].element = this.getElementByName(currentProblem.solutions[w][j].outputs[i].element.name);
                    }
                }
            }
            var records = [];
            var passedSolutions = [];
            var incorrectCase = [];
            for (var w = 0; w < currentProblem.solutions.length; w++) {
                records.push({});
                answerIsCorrect = true;
                var timesToVerfiy = 3;
                var oldT = this.T.value;
                var currentCase = currentProblem.solutions[w];
                for (var i = 0; i < currentCase[0].inputs.length; i++) {
                    records[w][currentCase[0].inputs[i].element.name] = ({ name:currentCase[0].inputs[i].element.name, values: [], class: 'test-variable' });
                }
                records[w][this.clock.name] = ({ name:this.clock.name, values: [], class: 'test-variable' });
                for (var i = 0; i < currentCase[0].outputs.length; i++) {
                    records[w][currentCase[0].outputs[i].element.name] = ({ name:currentCase[0].outputs[i].element.name, values: [], class: 'test-variable expected' });
                    records[w]['Your ' + currentCase[0].outputs[i].element.name] = ({ name:'Your ' + currentCase[0].outputs[i].element.name, values: [], class: 'user-variable' });
                }
                for (var i = 0; i < timesToVerfiy; i++) {
                    for (var j = 0; j < currentCase.length; j++) {
                        for (var k = 0; k < currentCase[j].inputs.length; k++) {
                            if (currentCase[j].inputs[k].valueType == this.valueType.CONSTANT) {
                                currentCase[j].inputs[k].element.value = currentCase[j].inputs[k].value;
                                records[w][currentCase[j].inputs[k].element.name].values.push(currentCase[j].inputs[k].value);
                                records[w][currentCase[j].inputs[k].element.name].values.push(currentCase[j].inputs[k].value);
                            }
                            else if (currentCase[j].inputs[k].valueType == this.valueType.RANDOM8) {
                                var randomValue = getRandomInt(0, 255);
                                if (currentCase[j].inputs[k].comparisonOperation) {
                                    var operation = currentCase[j].inputs[k].comparisonOperation;
                                    var value = currentCase[j].inputs[k].comparisonValue;
                                    if (operation == '>') {
                                        // every other test flip truth value
                                        if (i % 2 == 0) {
                                            randomValue = getRandomInt(value + 1, 255);
                                        }
                                        else {
                                            randomValue = getRandomInt(0, value);
                                        }
                                    }
                                    else if (operation == '<') {
                                        // every other test flip truth value
                                        if (i % 2 == 0) {
                                            randomValue = getRandomInt(0, value - 1);
                                        }
                                        else {
                                            randomValue = getRandomInt(value, 255);
                                        }
                                    }
                                    else if (operation == '==') {
                                        // every other test flip truth value
                                        if (i % 2 == 0) {
                                            randomValue = value;
                                        }
                                        else {
                                            randomValue = getRandomInt(0, 1) ? getRandomInt(0, value - 1) : getRandomInt(value + 1, 255);
                                        }
                                    }
                                }
                                currentCase[j].inputs[k].element.value = randomValue;
                                records[w][currentCase[j].inputs[k].element.name].values.push(randomValue);
                                records[w][currentCase[j].inputs[k].element.name].values.push(randomValue);
                            }
                        }
                        records[w][this.clock.name].values.push(0);
                        records[w][this.clock.name].values.push(1);
                        for (var k = 0; k < currentCase[j].outputs.length; k++) {
                            var operation = currentCase[j].outputs[k].dataOperation;
                            operation = operation.replace('oldT', oldT);
                            operation = operation.replace('D', this.D.value);
                            var correctValue = eval(operation);
                            // convert boolean value to integer
                            if (typeof correctValue == 'boolean') {
                                correctValue = correctValue ? 1 : 0;
                            }
                            var zeroValue = correctValue;
                            // Need a rising clock
                            this.clock.value = 0;
                            this.verifyUpdate();
                            if (currentCase[j].outputs[k].element.name == 'T') {
                                zeroValue = oldT;
                            }
                            records[w][currentCase[j].outputs[k].element.name].values.push(zeroValue);
                            records[w]['Your ' + currentCase[j].outputs[k].element.name].values.push(currentCase[j].outputs[k].element.value);
                            if (currentCase[j].outputs[k].element.value != zeroValue) {
                                answerIsCorrect = false;
                                incorrectCase[w] = i;
                            }
                            this.clock.value = 1;
                            this.verifyUpdate();
                            if (currentCase[j].outputs[k].element.name == 'T') {
                                oldT = correctValue;
                            }
                            records[w][currentCase[j].outputs[k].element.name].values.push(correctValue);
                            records[w]['Your ' + currentCase[j].outputs[k].element.name].values.push(currentCase[j].outputs[k].element.value);
                            if (currentCase[j].outputs[k].element.value != correctValue) {
                                answerIsCorrect = false;
                                incorrectCase[w] = i;
                            }
                        }
                    }
                }
                passedSolutions.push(answerIsCorrect);
            }
            answerIsCorrect = false;
            for (var i = 0; i < passedSolutions.length; i++) {
                answerIsCorrect |= passedSolutions[i];
            }
            if (answerIsCorrect) {
                explanation = 'Correct';
            }
            else if (this.getElementByType(Component.LOAD_REGISTER).length == 0) {
                explanation = 'Load register required to output data from datapath.';
            }
            else {
                explanation = '';
                for (var i = 0; i < records.length; i++) {

                    // Record first wrong solution
                    if (!passedSolutions[i] && !explanation) {

                        // Pull out only one of the wrong cases
                        const recordsToDisplay = $.extend(true, {}, records[i]);
                        const explanationTableRows = [];
                        let expectedAnswersAdded = 0;

                        for (const propertyName in recordsToDisplay) {
                            const property = recordsToDisplay[propertyName];
                            const recordLength = property.values.length / timesToVerfiy;

                            property.values.splice((incorrectCase[i] - 1) * recordLength, incorrectCase[i] * recordLength);
                            property.values.splice(incorrectCase[i] * recordLength + recordLength);

                            // Add "Expected" to the expected results, and place those rows at the end of the table.
                            if (property.class.includes('expected')) {
                                property.name = `Expected ${property.name}`;
                                explanationTableRows.push(property);
                                expectedAnswersAdded++;
                            }
                            else {

                                // Since this is not an "expected" row, place it before all the "expected" rows.
                                explanationTableRows.splice(-expectedAnswersAdded, 0, property);
                            }
                        }
                        explanation = this[this.name].explanation({
                            explanation: 'Your T does not match the expected T at every clock edge.',
                            records: explanationTableRows,
                        });
                    }
                }
            }
        }
        else {
            userAnswer = this.buildCompleteEquation('digitalDesign');
            var userAnswerDM = this.buildCompleteEquation('proposition');
            var userAnswerLatex = this.buildCompleteEquation('latex');

            expectedAnswer = currentProblem.equation;
            var expectedAnswerDM = currentProblem.discreteMathEquation;

            if (this.discreteMathUtilities.areLogicallyEquivalentPropositions(userAnswerDM, expectedAnswerDM, [ 'a', 'b', 'c' ])) {
                explanation = 'Correct';
                answerIsCorrect = true;
            }
            else if (userAnswer === '') {
                explanation = 'Circuit incomplete. Use the toolbox on the right to create components. Connect the components to match the equation.';
                answerIsCorrect = false;
                this.tryAgain = true;
            }
            else {
                var userAnswerDisplay = 'z = ' + userAnswer;
                var expectedAnswerDisplay = currentProblem.display;
                if (this.useDiscreteMathNotation) {
                    userAnswerDisplay = this.latexPrefix + 'z = ' + userAnswerLatex + this.latexPostfix;
                    expectedAnswerDisplay = this.latexPrefix + expectedAnswerDisplay + this.latexPostfix;
                }

                explanation = 'Your circuit\'s equation ' + userAnswerDisplay + ' does not match ' + expectedAnswerDisplay + '.';
                answerIsCorrect = false;
                latexChanged = true;
            }
        }

        return {
            explanationMessage: explanation,
            userAnswer:         userAnswer,
            expectedAnswer:     expectedAnswer,
            isCorrect:          answerIsCorrect,
            latexChanged:       latexChanged
        };
    };

    /*
        Convert |equations| to a Carousel of Questions.
        Carousel (described in utilities zyTool) stores an array with Question elements.
        Question is an object described in Questions.js of this tool.

        |equations| is required and an array of strings.
        |discreteMathEquations| is required and an array of strings.
        |latexEquations| is not required and an array of strings.
    */
    this.convertToCarouselOfQuestions = function(equations, discreteMathEquations, latexEquations) {
        var self = this;
        var questions = equations.map(function(equation, index) {
            var discreteMathEquation = discreteMathEquations[index];
            if (self.useDiscreteMathNotation) {
                var display = !!latexEquations ? latexEquations[index] : self.convertNottedVariablesToLatexOverline(equation);
                return new Question(equation, discreteMathEquation, display);
            }
            else {
                return new Question(equation, discreteMathEquation);
            }
        });
        return this.utilities.getCarousel(questions);
    };

    /*
        Replace single-quotes with latex overline in |equation|. Ex: ab' becomes $$a\overline{b}$$
        |equation| is required and a string.
    */
    this.convertNottedVariablesToLatexOverline = function(equation) {
        var latextEquation = equation;
        for (var i = 0; i < latextEquation.length; i++) {
            var symbol = latextEquation[i];

            if (symbol === '\'') {
                var prefix = latextEquation.slice(0, i - 1);
                var variable = latextEquation[i - 1];
                var postfix = latextEquation.slice(i + 1, latextEquation.length);

                latextEquation = prefix + '\\overline{' + variable + '}' + postfix;
            }
        }
        return latextEquation;
    };

    // The variables a, b, c in each possible order.
    this.allPossibleVariableOrders = [
        [ 'a', 'b', 'c' ],
        [ 'a', 'c', 'b' ],
        [ 'b', 'a', 'c' ],
        [ 'b', 'c', 'a' ],
        [ 'c', 'a', 'b' ],
        [ 'c', 'b', 'a' ]
    ];

    /*
        Generate a progression question without components based on the |questionNumber|.
        |questionNumber| is required and a number.
    */
    this.generateProgressionQuestionWithoutComponents = function(questionNumber) {
        var generatedQuestion;
        var equations = [];
        var discreteMathEquations = [];
        var self = this;

        // Generate level one question. Ex: a + b
        if (questionNumber === 0) {
            if (!this.questionOneCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + ' + ' + variableOrder[1]);
                    discreteMathEquations.push(variableOrder[0] + self.discreteMathUtilities.orSymbol + variableOrder[1]);
                });

                this.questionOneCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionOneCarousel.getValue();
        }
        // Generate level two question. Ex: ab + c
        else if (questionNumber === 1) {
            if (!this.questionTwoCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + variableOrder[1] + ' + ' + variableOrder[2]);
                    equations.push(variableOrder[0] + ' + ' + variableOrder[1] + variableOrder[2]);

                    discreteMathEquations.push('(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + variableOrder[2]);
                    discreteMathEquations.push(variableOrder[0] + self.discreteMathUtilities.orSymbol + '(' + variableOrder[1] + self.discreteMathUtilities.andSymbol + variableOrder[2] + ')');
                });

                this.questionTwoCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionTwoCarousel.getValue();
        }
        // Generate level three question. Ex: a'b
        else if (questionNumber === 2) {
            if (!this.questionThreeCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + '\'' + variableOrder[1]);
                    equations.push(variableOrder[0] + variableOrder[1] + '\'');

                    discreteMathEquations.push(self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1]);
                    discreteMathEquations.push(variableOrder[0] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[1]);
                });

                this.questionThreeCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionThreeCarousel.getValue();
        }
        // Generate level four question. Ex: a'b + c
        else if (questionNumber === 3) {
            if (!this.questionFourCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + '\'' + variableOrder[1] + ' + ' + variableOrder[2]);
                    equations.push(variableOrder[0] + variableOrder[1] + '\' + ' + variableOrder[2]);

                    discreteMathEquations.push('(' + self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + variableOrder[2]);
                    discreteMathEquations.push('(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + variableOrder[2]);
                });

                this.questionFourCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionFourCarousel.getValue();
        }
        // Generate level five question. Ex: abc'
        else if (questionNumber === 4) {
            if (!this.questionFiveCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + '\'' + variableOrder[1] + variableOrder[2]);
                    equations.push(variableOrder[0] + variableOrder[1] + '\'' + variableOrder[2]);
                    equations.push(variableOrder[0] + variableOrder[1] + variableOrder[2] + '\'');

                    discreteMathEquations.push(self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + self.discreteMathUtilities.andSymbol + variableOrder[2]);
                    discreteMathEquations.push(variableOrder[0] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[1] + self.discreteMathUtilities.andSymbol + variableOrder[2]);
                    discreteMathEquations.push(variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[2]);
                });
                this.questionFiveCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionFiveCarousel.getValue();
        }
        // Generate level six question. Ex: ab + a'c
        else if (questionNumber === 5) {
            if (!this.questionSixCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + variableOrder[1] + ' + ' + variableOrder[0] + '\'' + variableOrder[2]);
                    equations.push(variableOrder[0] + '\'' + variableOrder[1] + ' + ' + variableOrder[0] + variableOrder[2]);

                    discreteMathEquations.push('(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + '(' + self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[2] + ')');
                    discreteMathEquations.push('(' + self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + '(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[2] + ')');
                });
                this.questionSixCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionSixCarousel.getValue();
        }
        // Generate level seven question. Ex: a'b + c'a
        else if (questionNumber === 6) {
            if (!this.questionSevenCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push(variableOrder[0] + '\'' + variableOrder[1] + ' + ' + variableOrder[0] + variableOrder[2] + '\'');
                    equations.push(variableOrder[0] + variableOrder[1] + '\' + ' + variableOrder[0] + '\'' + variableOrder[2]);

                    discreteMathEquations.push('(' + self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + '(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[2] + ')');
                    discreteMathEquations.push('(' + variableOrder[0] + self.discreteMathUtilities.andSymbol + self.discreteMathUtilities.notSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + '(' + self.discreteMathUtilities.notSymbol + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[2] + ')');
                });
                this.questionSevenCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations);
            }

            generatedQuestion = this.questionSevenCarousel.getValue();
        }
        // Generate level eight question. Ex: (ab + c)'
        else if (questionNumber === 7) {
            var latexEquations = [];
            if (!this.questionEightCarousel) {
                this.allPossibleVariableOrders.forEach(function(variableOrder) {
                    equations.push('((' + variableOrder[0] + variableOrder[1] + ') + ' + variableOrder[2] + ')\'');
                    discreteMathEquations.push(self.discreteMathUtilities.notSymbol + '((' + variableOrder[0] + self.discreteMathUtilities.andSymbol + variableOrder[1] + ')' + self.discreteMathUtilities.orSymbol + variableOrder[2] + ')');
                    latexEquations.push('\\overline{' + variableOrder[0] + variableOrder[1] + ' + ' + variableOrder[2] + '}');
                });
                this.questionEightCarousel = this.convertToCarouselOfQuestions(equations, discreteMathEquations, latexEquations);
            }

            generatedQuestion = this.questionEightCarousel.getValue();
        }

        return generatedQuestion;
    };

    /*
        Generate a progression question based on the |questionNumber|.
        |questionNumber| is required and a number.
    */
    this.generateProgressionQuestion = function(questionNumber) {
        if (this.useComponents) {
            if (questionNumber === 0) {
                var solutions = [];
                var casesToTest = [];
                this.Dgt.shouldDraw = false;
                this.Ts.shouldDraw = false;
                this.Tld.shouldDraw = true;
                this.clock.shouldDraw = true;
                this.D.shouldDraw = false;
                this.T.shouldDraw = true;
                this.saveState();
                this.loadPreviousState();
                var randomValue = getRandomInt(0, 255);
                var entry = {
                    inputs : [
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: randomValue + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                $('#' + this.id + ' .problem1.assign1').text('T = ' + randomValue + ';');
                this.draw();
                return {
                    solutions: solutions
                };
            }
            else if (questionNumber === 1) {
                var solutions = [];
                this.Dgt.shouldDraw = false;
                this.Ts.shouldDraw = true;
                this.Tld.shouldDraw = true;
                this.clock.shouldDraw = true;
                this.D.shouldDraw = false;
                this.T.shouldDraw = true;
                this.saveState();
                this.loadPreviousState();
                var firstRandomValue = getRandomInt(0, 255);
                var secondRandomValue = getRandomInt(0, 255);
                var casesToTest = [];
                var entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: firstRandomValue + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: secondRandomValue + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                casesToTest = [];
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: firstRandomValue + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: secondRandomValue + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                $('#' + this.id + ' .problem2.assign1').text('T = ' + firstRandomValue + ';');
                $('#' + this.id + ' .problem2.assign2').text('T = ' + secondRandomValue + ';');
                this.draw();
                return {
                    solutions: solutions
                };
            }
            else if (questionNumber === 2) {
                this.Dgt.shouldDraw = false;
                this.Ts.shouldDraw = true;
                this.Tld.shouldDraw = true;
                this.clock.shouldDraw = true;
                this.D.shouldDraw = true;
                this.T.shouldDraw = true;
                this.saveState();
                this.loadPreviousState();
                var randomValue = getRandomInt(0, 255);
                var randomOperation = randomValue;
                var solutions = [];
                var casesToTest = [];
                var entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'D'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: randomOperation + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                casesToTest = [];
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'D'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: randomOperation + ''
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                $('#' + this.id + ' .problem3.assign1').text('T = D;');
                $('#' + this.id + ' .problem3.assign2').text('T = D;');
                $('#' + this.id + ' .problem3.assign3').text('T = ' + randomOperation + ';');
                $('#' + this.id + ' .problem3.assign4').text('T = ' + randomOperation + ';');
                this.draw();
                return {
                    solutions: solutions
                };
            }
            else if (questionNumber === 3) {
                this.Dgt.shouldDraw = false;
                this.Ts.shouldDraw = true;
                this.Tld.shouldDraw = true;
                this.clock.shouldDraw = true;
                this.D.shouldDraw = true;
                this.T.shouldDraw = true;
                this.saveState();
                this.loadPreviousState();
                var randomValue = getRandomInt(1, 9);
                var randomOperation = 'D + ' + randomValue;
                var solutions = [];
                var casesToTest = [];
                var entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'D'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: randomOperation
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                casesToTest = [];
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'D'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: randomOperation
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                $('#' + this.id + ' .problem4.assign1').text('T = D;');
                $('#' + this.id + ' .problem4.assign2').text('T = D;');
                $('#' + this.id + ' .problem4.assign3').text('T = ' + randomOperation + ';');
                $('#' + this.id + ' .problem4.assign4').text('T = ' + randomOperation + ';');
                this.draw();
                return {
                    solutions: solutions
                };
            }
            else if (questionNumber === 4) {
                this.Dgt.shouldDraw = true;
                this.Ts.shouldDraw = true;
                this.Tld.shouldDraw = true;
                this.clock.shouldDraw = true;
                this.D.shouldDraw = true;
                this.T.shouldDraw = true;
                var randomCompValue = getRandomInt(1, 254);
                var operations = [
                    '>',
                    '<',
                    '=='
                ];
                var operationName = {
                    '>' : 'gt',
                    '<' : 'lt',
                    '==' : 'eq'
                };
                var randomCompOperation = operations[getRandomInt(0, 2)];
                this.Dgt.name = 'D_' + operationName[randomCompOperation];
                this.saveState();
                this.loadPreviousState();
                var firstRandomValue = getRandomInt(0, 99);
                var secondRandomValue = getRandomInt(0, 99);
                var randomCondition = 'D ' + randomCompOperation + ' ' + randomCompValue;
                var solutions = [];
                var casesToTest = [];
                var entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: firstRandomValue + ''
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: secondRandomValue + ''
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                casesToTest = [];
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: firstRandomValue + ''
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 1,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: secondRandomValue + ''
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                entry = {
                    inputs : [
                        {
                            element: this.Ts,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.Tld,
                            value: 0,
                            valueType : this.valueType.CONSTANT
                        },
                        {
                            element: this.D,
                            valueType: this.valueType.RANDOM8,
                            comparisonOperation: randomCompOperation,
                            comparisonValue: randomCompValue
                        }
                    ],
                    outputs : [
                        {
                            element: this.T,
                            dataOperation: 'oldT'
                        },
                        {
                            element: this.Dgt,
                            dataOperation: randomCondition
                        }
                    ]
                };
                casesToTest.push(entry);
                solutions.push(casesToTest);
                $('#' + this.id + ' .problem5.assign1').text('T = ' + firstRandomValue + ';');
                $('#' + this.id + ' .problem5.assign2').text('T = ' + secondRandomValue + ';');
                $('#' + this.id + ' .problem5.condition1').text('!(' + randomCondition + ')');
                $('#' + this.id + ' .problem5.condition2').text(randomCondition);
                $('#' + this.id + ' .problem5.condition3').text('(' + randomCondition + ') || !b');
                $('#' + this.id + ' .problem5.condition4').text('!((' + randomCondition + ') || !b)');
                this.draw();
                return {
                    solutions: solutions
                };
            }

        }
        else {
            return this.generateProgressionQuestionWithoutComponents(questionNumber);
        }
    };


    this.initZyDigSim = function(zyID, parentResource, name, canEdit, canExport, toolBoxEnabled, width, height, JSONToLoad, basicOnly, scrollable, progressive, useComponents, useGates) {
        var canvas;
        var context;
        var drawHandle;
        var drawables;
        var imagesToLoad;
        var currentElement;
        var toolBoxCanvas;
        var toolBoxCanvasContext;
        var tools;
        var mouseHold;
        var selectedElements;
        var oldSelectedPosition;
        var holdTimeout;
        var wireClicked;
        var wirePosition;
        var currUpdates;
        var maxUpdates;
        var dragSelect;
        var oldMouse;
        var pressAndRelease;
        var undoRedo;
        var oldScroll;
        var zyDigSimActive;
        var selectedWires;
        var oldElement;
        var loadedJSON;
        var logicContainerScrollbarDimensions;
        var allowedToEdit;
        var canToggle;
        var closestPosition;
        var closestElement;
        var closestElementInputIndex;
        var justCreated;
        var $componentInput;
        var self = this;
        // UndoRedo class that saves the state of the tool so that the user can undo (ctrl z) and redo (ctrl shift z), these states are strings of JSON
        // that can be loaded with the loadFromJSON function.

        function UndoRedo(size, state) {
            this.undoRedoIndex = 0;
            this.undoRedoStack = new Array();
            this.maxSize = size;
            this.reset(state);
        }

        // Push the current state of the digsim tool, the current state is at undoRedoIndex-1
        UndoRedo.prototype.pushState = function(state) {
            // Size too big remove the earliest state
            if ((this.undoRedoIndex + 1) >= this.maxSize) {
                this.undoRedoStack.splice(0, 1);
                this.undoRedoStack[this.undoRedoIndex] = state;
            }
            else {
                this.undoRedoStack.splice(this.undoRedoIndex, this.undoRedoStack.length - this.undoRedoIndex);
                this.undoRedoStack.push(state);
                this.undoRedoIndex++;
                if (!this.empty()) {
                    $('#undoButton_' + zyID).prop('disabled', false);
                    $('#undoButton_' + zyID).removeClass('disabled');
                }
            }
        };
        // Changes the current state to be undoRedoIndex-1
        UndoRedo.prototype.undo = function() {
            if (this.undoRedoIndex > 0) {
                this.undoRedoIndex--;
                selectedElements = null;
                selectedWires = [];
                enableDisableDeleteButton();
                if (this.empty()) {
                    $('#undoButton_' + zyID).prop('disabled', true);
                    $('#undoButton_' + zyID).addClass('disabled');
                }
                return this.undoRedoStack[this.undoRedoIndex - 1];
            }
            return null;
        };
        // Changes the current state to be undoRedoIndex+1 if such a state exists
        UndoRedo.prototype.redo = function() {
            if (this.undoRedoIndex < this.undoRedoStack.length) {
                this.undoRedoIndex++;
                selectedElements = null;
                selectedWires = [];
                enableDisableDeleteButton();
                if (!this.empty()) {
                    $('#undoButton_' + zyID).prop('disabled', false);
                    $('#undoButton_' + zyID).removeClass('disabled');
                }
                return this.undoRedoStack[this.undoRedoIndex - 1];
            }
            return null;
        };

        UndoRedo.prototype.empty = function() {
            return this.undoRedoIndex === 1;
        };

        UndoRedo.prototype.reset = function(state) {
            this.undoRedoStack = [ state ];
            this.undoRedoIndex = 1;
            selectedElements = null;
            selectedWires = [];
            enableDisableDeleteButton();
            $('#undoButton_' + zyID).prop('disabled', true);
            $('#undoButton_' + zyID).addClass('disabled');
        };

        Array.prototype.indexOfObject = function arrayObjectIndexOf(value) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i] === value) {
                    return i;
                }
            }
            return -1;
        };

        function init() {
            NAMES[Element.IN] = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ];
            NAMES[Element.OUT] = [ 'z', 'y', 'x', 'w', 'v', 'u', 't', 's', 'r', 'q' ];
            NAMES[Component.ADDER] = [ 'Adder1', 'Adder2', 'Adder3', 'Adder4', 'Adder5', 'Adder6', 'Adder7', 'Adder8', 'Adder9', 'Adder10' ];
            NAMES[Component.MUX] = [ 'Mux1', 'Mux2', 'Mux3', 'Mux4', 'Mux5', 'Mux6', 'Mux7', 'Mux8', 'Mux9', 'Mux10' ];
            NAMES[Component.COMPARATOR] = [ 'Comparator1', 'Comparator2', 'Comparator3', 'Comparator4', 'Comparator5', 'Comparator6', 'Comparator7', 'Comparator8', 'Comparator9', 'Comparator10' ];
            NAMES[Component.LOAD_REGISTER] = [ 'Load register1', 'Load register2', 'Load register3', 'Load register4', 'Load register5', 'Load register6', 'Load register7', 'Load register8', 'Load register9', 'Load register10' ];
            NAMES[Component.IN] = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ];
            NAMES[Component.OUT] = [ 'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q' ];
            canEdit = typeof canEdit !== 'undefined' ? canEdit : true;
            canExport = typeof canExport !== 'undefined' ? canExport : true;
            toolBoxEnabled = typeof toolBoxEnabled !== 'undefined' ? toolBoxEnabled : true;
            scrollable = typeof scrollable !== 'undefined' ? scrollable : true;
            progressive = typeof progressive !== 'undefined' ? progressive : false;
            width = typeof width !== 'undefined' ? width : DEFAULT_WIDTH;
            height = typeof height !== 'undefined' ? height : DEFAULT_HEIGHT;
            useComponents = typeof useComponents !== 'undefined' ? useComponents : false;
            useGates = typeof useGates !== 'undefined' ? useGates : true;
            canvas = $('#logicCanvas' + '_' + zyID)[0];
            if (progressive) {
                $('#resetButton_' + zyID).hide();
            }
            else {
                $('#toolBoxCanvas' + '_' + zyID).addClass('gate-pointer');
            }
            // Need different minimum heights depending on what is enabled
            if (canExport && toolBoxEnabled) {
                width = (width < 680) ? 680 : width;
            }
            else if (canExport) {
                width = (width < 675) ? 675 : width;
            }
            else {
                width = (width < 250) ? 250 : width;
            }
            if (basicOnly) {
                height = (height < 315) ? 315 : height;
            }
            if (!toolBoxEnabled) {
                $('#toolBoxCanvas' + '_' + zyID).hide();
                $('#' + zyID + ' .toolbox-container').css('width', '0').hide();
            }
            $('#logicCanvasContainer_' + zyID).width(width);
            $('#logicCanvasContainer_' + zyID).height(height);
            $('#' + zyID + ' .bottom-buttons').width($('#' + zyID + ' .bottom-buttons').width() - (DEFAULT_WIDTH - width) + 50);
            $('#' + zyID + ' .middle-container').width(width + $('#' + zyID + ' .toolbox-container').width() + 15);
            context = canvas.getContext('2d');
            drawables = new Array();
            toolBoxCanvas = $('#toolBoxCanvas' + '_' + zyID)[0];
            toolBoxCanvasContext = toolBoxCanvas.getContext('2d');
            tools = new Array();
            zyDigSimActive = false;
            selectedWires = [];
            oldElement = null;
            inputNameIndex = 0;
            outputNameIndex = 0;
            closestElement = -1;
            allowedToEdit = canEdit;
            canToggle = true;
            justCreated = false;
            oldScroll = {
                x: $('#logicCanvasContainer' + '_' + zyID).scrollLeft(),
                y: $('#logicCanvasContainer' + '_' + zyID).scrollTop()
            };
            // Only load image assets once
            if (typeof ZyDigSim.imageAssets == 'undefined') {
                loadAssets();
            }
            // Already loaded just grab images and draw
            else if (ZyDigSim.imagesHaveLoaded) {
                initToolbox();
                drawToolbox();
            }
            else {
                // Tell loading tool to run my init when it is finished
                ZyDigSim.imagesHaveLoadedCallbacks.push(function() {
                    initToolbox();
                    drawToolbox();
                    update();
                });
            }
            // Don't need delete when user cannot modify circuit
            if (!canEdit) {
                $('#deleteSelectedItemsButton_' + zyID).hide();
                $('#undoButton_' + zyID).hide();
            }
            mouseHold = false;
            wireClicked = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true
            };
            selectedElements = null;
            currUpdates = 0;
            currentElement = new Element(0, 0, tools[0], null, 0, 'none');
            if (!canExport) {
                $('#JSONLoadSave' + '_' + zyID).hide();
                $('#' + zyID + ' .bottom-buttons').hide();
            }
            if (!scrollable) {
                $('#logicCanvasContainer_' + zyID).css('overflow', 'hidden');
            }
            // Whenever the mouse moves in the main canvas update mouse position and update any elements that need updating
            $('#logicCanvas' + '_' + zyID).on('touchmove mousemove', function(e) {
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                logicMouseMove(x, y);
            });
            // Checks what kind of collision exists and starts a timeout to enable dragging
            $('#logicCanvas' + '_' + zyID).on('touchstart mousedown', function(e) {
                $componentInput.blur();
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                e.preventDefault();
                logicMouseDown(x, y, e.which);

            });
            // If its a wire collision we try to connect the two elements
            // otherwise it was just a mouse click see if its a toggle element
            $('#logicCanvas' + '_' + zyID).on('touchend mouseup', function(e) {
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                logicMouseUp(x, y);
            });
            // We just need to see what gate was clicked on and set that as the currentElement to be placed
            $('#toolBoxCanvas' + '_' + zyID).on('touchend mouseup', (function(e) {
                $componentInput.blur();
                mouseHold = false;
                var pagePosition = getPageXY(e);
                var x = (pagePosition.x - $('#toolBoxCanvas' + '_' + zyID).offset().left);
                var y = (pagePosition.y - $('#toolBoxCanvas' + '_' + zyID).offset().top);
                // e.which, 1 = left click, 2 = middle click, 3 = right click
                if (e.which == 1 && allowedToEdit) {
                    for (var i = 0; i < tools.length; i++) {
                        var tool = tools[i];
                        if (rectPointCollision(x, y, tool.x, tool.y, tool.width, tool.height)) {
                            // Grab tool from toolbox canvas
                            currentElement.elementType = tools[i].elementType;
                            if (tools[i].elementType.indexOf('component') == -1) {
                                if (tools[i].operation == ELEMENT_FUNCTIONS.OUT) {
                                    currentElement.img = ZyDigSim.imageAssets.undefinedImg;
                                }
                                else if (tools[i].operation == ELEMENT_FUNCTIONS.IN) {
                                    currentElement.img = ZyDigSim.imageAssets.zeroImg;
                                }
                                else {
                                    currentElement.img = tools[i].img;
                                }
                                currentElement.operation = tools[i].operation;
                            }
                            currentElement.maxInput = tools[i].maxInput;
                            // Place in an area around center, all coords are multiples of 5
                            currentElement.x = Math.round(((3 * $('#logicCanvasContainer' + '_' + zyID).width() / 4) + (Math.random() * ($('#logicCanvasContainer' + '_' + zyID).width() / 4) - ($('#logicCanvasContainer' + '_' + zyID).width() / 4)) + $('#logicCanvasContainer' + '_' + zyID).scrollLeft()) / 5) * 5;
                            currentElement.y = Math.round((($('#logicCanvasContainer' + '_' + zyID).height() / 4) + (Math.random() * ($('#logicCanvasContainer' + '_' + zyID).height() / 4) - ($('#logicCanvasContainer' + '_' + zyID).height() / 4)) + $('#logicCanvasContainer' + '_' + zyID).scrollTop()) / 5) * 5;
                            if (tools[i].elementType.indexOf('component') == -1) {
                                drawables.push(new Element(currentElement.x, currentElement.y, currentElement.img, currentElement.operation, currentElement.maxInput, currentElement.elementType, assignName(currentElement.elementType), false));
                                if (currentElement.operation == ELEMENT_FUNCTIONS.LABEL) {
                                    var labelElement = drawables[drawables.length - 1];
                                    labelElement.value = 'Text';
                                    // Labels have a div along with an entry into the drawables array
                                    initLabel(labelElement);
                                }
                            }
                            else {
                                drawables.push(new Component(currentElement.x, currentElement.y, currentElement.elementType, tools[i].bitWidth, false));
                                if (NAMES[drawables[drawables.length - 1].elementType]) {
                                    drawables[drawables.length - 1].name = assignName(drawables[drawables.length - 1].elementType);
                                }
                            }
                            currentElement.img = tools[0].img;
                            currentElement.maxInput = tools[0].maxInput;
                            currentElement.operation = tools[0].operation;
                            currentElement.elementType = 'none';
                            currUpdates = 0;
                            selectedElements = [ drawables[drawables.length - 1] ];
                            $('#deleteSelectedItemsButton_' + zyID).prop('disabled', false);
                            $('#deleteSelectedItemsButton_' + zyID).removeClass('disabled');
                            undoRedo.pushState(saveToJSON());
                            update();
                            if (selectedElements[0].elementType == Component.CONSTANT) {
                                var userInput = prompt('Enter value', 0);
                                if (userInput != null) {
                                    selectedElements[0].value = parseInt(userInput, 10);
                                }
                            }
                            justCreated = true;
                            setTimeout(function() {
                                justCreated = false;
                                draw();
                                setTimeout(function() {
                                    justCreated = true;
                                    draw();
                                    setTimeout(function() {
                                        justCreated = false;
                                        draw();
                                    }, 250);
                                }, 250);
                            }, 250);
                            break;
                        }
                    }
                }


            }));
            $(document).on('touchend mouseup', (function(e) {
                // Catch mouseup events outside of canvas otherwise this will go undetected and it will behave badly until another mouseup is detected in the canvas
                mouseHold = false;
                dragSelect = null;
            }));
            // Used to make sure key event should be firing
            $(document).on('mousedown touchstart', function(e) {
                const toolContainer = document.getElementById(zyID);

                if (toolContainer && $.contains(toolContainer, e.target)) {
                    zyDigSimActive = true;
                }
                else {
                    zyDigSimActive = false;
                }
                return;
            });
            // Handles deleting and undo/redo
            $(document).keyup(function(e) {
                e.preventDefault();
                if (!allowedToEdit || !zyDigSimActive) {
                    return false;
                }
                // Delete
                if (e.keyCode == 46) {
                    deleteSelectedItems();
                    currUpdates = 0;
                }
                // Ctrl Shift Z
                if (e.keyCode == 90 && e.ctrlKey && e.shiftKey) {
                    // Redo
                    loadFromJSON(undoRedo.redo());
                    update();
                }
                // Ctrl Z
                else if (e.keyCode == 90 && e.ctrlKey) {
                    undoClicked();
                }

            });
            $('#undoButton_' + zyID).click(function() {
                undoClicked();
            });

            // Anytime the canvas is scrolled all of the divs on top need to be moved
            $('#logicCanvasContainer' + '_' + zyID).scroll(function(e) {
                if (!scrollable) {
                    return;
                }
                $componentInput.blur();
                for (var i = 0; i < drawables.length; i++) {
                    if (drawables[i].operation == ELEMENT_FUNCTIONS.LABEL) {
                        adjustLabel(drawables[i]);
                    }
                }
            });
            $('#resetButton_' + zyID).click(reset);
            $('#deleteSelectedItemsButton_' + zyID).click(deleteSelectedItems);
            $('#importBtn' + '_' + zyID).click(function() {
                importClick();
            });
            $('#exportBtn' + '_' + zyID).click(function() {
                exportClick();
            });
            $('#exampleDrop_' + zyID).change(function() {
                exampleChanged();
                undoRedo.pushState(saveToJSON());
            });


            if (JSONToLoad) {
                loadFromJSON(JSONToLoad);
                loadedJSON = JSONToLoad;
            }
            else {
                exampleChanged();
                loadedJSON = saveToJSON();

            }

            $('#deleteSelectedItemsButton_' + zyID).prop('disabled', true);
            $('#deleteSelectedItemsButton_' + zyID).addClass('disabled');
            $componentInput = $('#' + zyID + ' .component-input');
            $componentInput.hide();
            logicContainerScrollbarDimensions = getScrollbarDimensions();
            undoRedo = new UndoRedo(50000, saveToJSON());
            update();
            if (progressive) {
                if (useComponents) {
                    $('#progressionImage1_' + zyID)[0].src = parentResource.getResourceURL('q1.png', name);
                    $('#progressionImage2_' + zyID)[0].src = parentResource.getResourceURL('q2.png', name);
                    $('#progressionImage3_' + zyID)[0].src = parentResource.getResourceURL('q3.png', name);
                    $('#progressionImage4_' + zyID)[0].src = parentResource.getResourceURL('q4.png', name);
                    $('#progressionImage5_' + zyID)[0].src = parentResource.getResourceURL('q5.png', name);
                    $('#' + self.id).width('900px');
                    $('#progressionImage1_' + zyID).hide();
                    $('#progressionImage2_' + zyID).hide();
                    $('#progressionImage3_' + zyID).hide();
                    $('#progressionImage4_' + zyID).hide();
                    $('#progressionImage5_' + zyID).hide();
                    // generate problem 1 divs
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem1 assign1\'>T = 6;</div>');

                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem2 assign1\'>T = 6;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem2 assign2\'>T = 12;</div>');

                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem3 assign1\'>T = D;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem3 assign2\'>T = D;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem3 assign3\'>T = 5;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem3 assign4\'>T = 5;</div>');

                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem4 assign1\'>T = D;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem4 assign2\'>T = D;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem4 assign3\'>T = D + 5;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem4 assign4\'>T = D + 5;</div>');

                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 assign1\'>T = 0;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 assign2\'>T = 9;</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 condition1\'>!(D &gt; 6)</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 condition2\'>D &gt; 6</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 condition3\'>(D &gt; 6) || !b</div>');
                    $('#progressionImageContainer_' + zyID).append('<div class=\'generated-text problem5 condition4\'>!((D &gt; 6) || !b)</div>');
                    $('#' + zyID + ' .generated-text').hide();
                }
                else {
                    $('#' + self.id).width('712px');
                    $('#progressionImageContainer_' + zyID).hide();
                }
            }
            else {
                $('#progressionImageContainer_' + zyID).hide();
            }

            if (useComponents) {
                $('#legendCanvas_' + zyID).css('left', $('#legendCanvas_' + zyID).position().left + $('#logicCanvasContainer' + '_' + zyID).width() - $('#legendCanvas_' + zyID).width() - logicContainerScrollbarDimensions.width);
                var legendCanvas = $('#legendCanvas_' + zyID)[0];
                var legendContext = legendCanvas.getContext('2d');
                legendContext.fillStyle = 'white';
                legendContext.fillRect(0, 0, legendCanvas.width, legendCanvas.height);
                legendContext.fillStyle = 'black';
                legendContext.font = '12px Helvetica';
                legendContext.textBaseline = 'middle';
                legendContext.beginPath();
                legendContext.fillText('Legend:', 5, (legendCanvas.height / 2));
                legendContext.moveTo(10 + legendContext.measureText('Legend:').width, (legendCanvas.height / 2) + QUARTER_WIRE_LENGTH);
                legendContext.lineTo(10 + HALF_WIRE_LENGTH + legendContext.measureText('Legend:').width, (legendCanvas.height / 2) - QUARTER_WIRE_LENGTH);
                legendContext.fillText('8 bits', (legendCanvas.width / 2) + WIRE_LENGTH, (legendCanvas.height / 2));
                legendContext.stroke();
            }
            else {
                $('#legendCanvas_' + zyID).hide();
            }
            $('#undoButton_' + zyID).prop('disabled', true);
            $('#undoButton_' + zyID).addClass('disabled');
            // Progression tool needs a reference to the tools variables
            self.buildCompleteEquation = buildCompleteEquation;
            self.reset = reset;
            self.setAllowedToEdit = setAllowedToEdit;
            self.getElementByName = getElementByName;
            self.getElementThatContains = getElementThatContains;
            self.draw = draw;
            self.getElementByType = getElementByType;
            self.saveState = saveState;
            self.loadPreviousState = loadPreviousState;
            self.resetUndoRedoStack = resetUndoRedoStack;
            self.verifyUpdate = function() {
                currUpdates = 0;
                update();
            };
        }

        function getPageXY(event) {
            // This is a touch event
            if (event.type.indexOf('touch') != -1) {
                if (event.originalEvent.touches.length > 0) {
                    return { x: event.originalEvent.touches[0].pageX, y: event.originalEvent.touches[0].pageY };
                }
                else {
                    return { x: event.originalEvent.changedTouches[0].pageX, y: event.originalEvent.changedTouches[0].pageY };
                }
            }
            else {
                return { x: event.pageX, y: event.pageY };
            }
        }

        function resetUndoRedoStack() {
            undoRedo.reset(saveToJSON());
        }

        function undoClicked() {
            loadFromJSON(undoRedo.undo());
            update();
            if (useComponents && progressive) {
                self.loadGates();
            }
        }

        function loadPreviousState() {
            undoRedo.undo();
        }

        function saveState() {
            undoRedo.pushState(saveToJSON());
        }

        function getElementByName(name) {
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].name == name) {
                    return drawables[i];
                }
            }
            return null;
        }

        function getElementThatContains(contains) {
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].name.indexOf(contains) !== -1) {
                    return drawables[i];
                }
            }
            return null;
        }

        function getElementByType(type) {
            elementsWithType = [];
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].elementType == type) {
                    elementsWithType.push(drawables[i]);
                }
            }
            return elementsWithType;
        }

        // Resets the circuit to be the circuit that is initially loaded
        function reset() {
            $(this).blur();
            loadFromJSON(loadedJSON);
            undoRedo.reset(loadedJSON);
            selectedElements = null;
            selectedWires = [];
            wireClicked = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true
            };
            enableDisableDeleteButton();
        }

        // Handles enabling and disabling delete button
        function enableDisableDeleteButton() {
            if (((selectedElements == null || selectedElements.length == 0) && (selectedWires.length == 0)) || !allowedToEdit) {
                $('#deleteSelectedItemsButton_' + zyID).prop('disabled', true);
                $('#deleteSelectedItemsButton_' + zyID).addClass('disabled');
            }
            else {
                $('#deleteSelectedItemsButton_' + zyID).prop('disabled', false);
                $('#deleteSelectedItemsButton_' + zyID).removeClass('disabled');
            }
        }

        // Setter for allowedToEdit, exposed to progression tool
        function setAllowedToEdit(editUpdate) {
            allowedToEdit = editUpdate;
            canToggle = editUpdate;
            if (editUpdate) {
                $('#toolBoxCanvas' + '_' + zyID).addClass('gate-pointer');
                if (!undoRedo.empty()) {
                    $('#undoButton_' + zyID).prop('disabled', false);
                    $('#undoButton_' + zyID).removeClass('disabled');
                }

                if (progressive) {
                    self.$middleContainerCover.removeClass('active');
                }
            }
            else {
                $('#toolBoxCanvas' + '_' + zyID).removeClass('gate-pointer');
                $('#undoButton_' + zyID).prop('disabled', true);
                $('#undoButton_' + zyID).addClass('disabled');

                if (progressive) {
                    self.$middleContainerCover.addClass('active');
                }
            }
        }

        /*
            Recursively builds an equation starting with the output gate.
            |element| is required and an Element.
            |returnNotation| is required and a string with one of the following values:
                * 'digitalDesign' Ex: (ab + c)'
                * 'proposition' Ex: ¬((a ∧ b) ∨ c)
                * 'latex' Ex: \overline{ab + c}
        */
        function buildEquationFromGates(element, returnNotation) {
            if (!element) {
                return '';
            }
            else if (element.elementType === Element.AND) {
                // If both of the AND's inputs aren't used, then return empty equation.
                if ((element.inputs.length !== 2) || (element.inputs[0] === null) || (element.inputs[1] === null)) {
                    return '';
                }
                else {
                    var firstEquation = buildEquationFromGates(element.inputs[0], returnNotation);
                    var secondEquation = buildEquationFromGates(element.inputs[1], returnNotation);

                    var centerSymbol = '';
                    if (returnNotation === 'proposition') {
                        centerSymbol = self.discreteMathUtilities.andSymbol;
                    }

                    var equation = firstEquation + centerSymbol + secondEquation;
                    return '(' + equation + ')';
                }
            }
            else if (element.elementType === Element.OR) {
                // If both of the OR's inputs aren't used, then return empty equation.
                if ((element.inputs.length !== 2) || (element.inputs[0] === null) || (element.inputs[1] === null)) {
                    return '';
                }
                else {
                    var firstEquation = buildEquationFromGates(element.inputs[0], returnNotation);
                    var secondEquation = buildEquationFromGates(element.inputs[1], returnNotation);

                    var centerSymbol = ' + ';
                    if (returnNotation === 'proposition') {
                        centerSymbol = self.discreteMathUtilities.orSymbol;
                    }

                    var equation = firstEquation + centerSymbol + secondEquation;
                    return '(' + equation + ')';
                }
            }
            else if (element.elementType === Element.NOT) {
                // If the NOT's input is not used, then return empty equation.
                if ((element.inputs.length !== 1) || (element.inputs[0] === null)) {
                    return '';
                }
                else {
                    var equation = buildEquationFromGates(element.inputs[0], returnNotation);

                    // If NOT is being applied to a gate, then add parens.
                    if (element.inputs[0].elementType !== Element.IN) {
                        equation = '(' + equation + ')';
                    }

                    switch (returnNotation) {
                        case 'digitalDesign':
                            equation += '\'';
                            break;
                        case 'proposition':
                            equation = self.discreteMathUtilities.notSymbol + equation;
                            break;
                        case 'latex':
                            equation = '\\overline{' + equation + '}';
                            break;
                    }

                    return equation;
                }
            }
            else if (element.elementType == Element.IN) {
                return element.name;
            }
        }

        /*
            Finds the output gate and then calls buildEquationFromGates to build the equation.
            |returnNotation| is required and a string. See |buildEquationFromGates| for a description.
        */
        function buildCompleteEquation(returnNotation) {
            var startElement = null;
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].elementType == Element.OUT) {
                    startElement = drawables[i];
                }
            }

            var builtEquation = '';
            if (startElement) {
                var currentElement = startElement.inputs[0];
                builtEquation = buildEquationFromGates(currentElement, returnNotation);
            }

            return builtEquation;
        }

        /*
            Assigns names to inputs and outputs
            Will assign the first available name
            type is the type element or component
        */
        function assignName(type) {
            if (!NAMES[type]) {
                return '';
            }
            var nameToReturn = '';
            var takenNames = {};
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].elementType == type) {
                    takenNames[drawables[i].name] = 1;
                }
            }
            for (var i = 0; i < NAMES[type].length; i++) {
                if (NAMES[type][i] in takenNames) {
                    continue;
                }
                else {
                    nameToReturn = NAMES[type][i];
                    break;
                }
            }
            return nameToReturn;

        }

        // Init a label, have to generate a div for it and pass all mouse events down to the canvas
        function initLabel(labelElement) {
            const id = getNextLabelID(zyID);

            labelElement.labelID = id;
            $('#' + zyID).append('<div id=\'label' + id + '_' + zyID + '\' contenteditable=\'true\' class=\'label\'>' + labelElement.value + '</div>');
            $('#label' + id + '_' + zyID).mousemove(function(e) {
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                logicMouseMove(x, y);
                if (!canEdit) {
                    e.preventDefault();
                    $(this).blur();
                }
            });
            $('#label' + id + '_' + zyID).mousedown(function(e) {
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                logicMouseDown(x, y, e.which);
                if (!canEdit) {
                    e.preventDefault();
                    $(this).blur();
                }
            });
            $('#label' + id + '_' + zyID).mouseup(function(e) {
                var pagePosition = getPageXY(e);
                var x = pagePosition.x + $('#logicCanvasContainer' + '_' + zyID).scrollLeft() - $('#logicCanvasContainer' + '_' + zyID).offset().left;
                var y = pagePosition.y + $('#logicCanvasContainer' + '_' + zyID).scrollTop() - $('#logicCanvasContainer' + '_' + zyID).offset().top;
                logicMouseUp(x, y);
                if (!canEdit) {
                    e.preventDefault();
                    $(this).blur();
                }
            });
            $('#label' + id + '_' + zyID).keydown(function(e) {
                if (canEdit) {
                    labelElement.value = this.value;
                    labelElement.width = $(this).width();
                    labelElement.height = $(this).height();
                }
            });
            adjustLabel(labelElement);
            labelElement.width = $('#label' + id + '_' + zyID).width();
            labelElement.height = $('#label' + id + '_' + zyID).height();
        }

        // Adjusts the text div for the labels whenever a user moves them using mouse input in the canvas
        function adjustLabel(element) {
            var newX = element.x - $('#logicCanvasContainer' + '_' + zyID).scrollLeft() + $('#' + zyID + ' .middle-container').position().left;
            var newY = element.y - $('#logicCanvasContainer' + '_' + zyID).scrollTop() + $('#' + zyID + ' .middle-container').position().top;
            $('#label' + (element.labelID) + '_' + zyID).css('left', newX);
            $('#label' + (element.labelID) + '_' + zyID).css('top', newY);
            // If label is outside of the canvas, hide it
            if ((newY > ($('#logicCanvasContainer_' + zyID).position().top + $('#logicCanvasContainer_' + zyID).height())) || (newX > ($('#logicCanvasContainer_' + zyID).position().left + $('#logicCanvasContainer_' + zyID).width())) || (newY < ($('#logicCanvasContainer_' + zyID).position().top)) || (newX < ($('#logicCanvasContainer_' + zyID).position().left))) {
                $('#label' + (element.labelID) + '_' + zyID).hide();
            }
            else {
                $('#label' + (element.labelID) + '_' + zyID).show();
            }
        }

        /**
            This gives an id for the new label div that wont conflict with the other labels already in the tool.
            @method getNextLabelID
            @param {Number} toolID The id of this instance of the tool.
            @return {Number} The ID number for the new label div.
        */
        function getNextLabelID(toolID) {
            let id = 0;

            $(`#${toolID} .label`).each((index, element) => {
                const regex = /\d+/;
                const oldID = parseFloat($(element).attr('id').match(regex));

                if (oldID >= id) {
                    id = oldID + 1;
                }
            });
            return id;
        }

        /*
            This handles all of the setup that allows mousemove to move elements and mouseup to handle toggling.
            Records what element has been click and adds a timeout to check if the element is being dragged
        */
        function logicMouseDown(x, y, which) {
            // Left click or touch
            if (((which === 1) || (which === 0)) && canToggle) {
                holdTimeout = setTimeout(function() {
                    mouseHold = true;
                }, 100);
                if (selectedElements != null && selectedElements.length == 1) {
                    selectedElements = null;
                }
                // Test to see if an element was clicked
                if (selectedElements == null || selectedElements.length <= 1) {
                        wireClicked = {
                            elementIndex: -1,
                            wireIndex: -1,
                            isOutput: true
                        };
                        if (!canEdit) {
                            pressAndRelease = true;
                        }
                        else if (oldElement != null) {
                            if (getCollision(x, y) == oldElement) {
                                pressAndRelease = true;
                            }
                            else {
                                pressAndRelease = false;
                            }
                        }
                        else {
                            pressAndRelease = false;
                        }
                        $('#' + zyID + ' .label').blur();
                        selectedElements = new Array();
                        var topCollidedElement = null;
                        var topCollidedWire = null;
                        for (var i = drawables.length - 1; i >= 0; i--) {
                            topCollidedElement = getCollision(x, y, i);
                            if (topCollidedElement != null && !canEdit && topCollidedElement.elementType !== Element.IN)
                            {
                                topCollidedElement = null;
                            }
                            if (topCollidedElement == null) {
                                wireClicked = getWireCollision(x, y, i);
                                if (wireClicked.elementIndex != -1) {
                                    if (topCollidedWire == null) {
                                        topCollidedWire = wireClicked;
                                    }
                                    // Give preference to output wires
                                    else if ((wireClicked.isOutput && !topCollidedWire.isOutput) || (wireClicked.isOutput && topCollidedWire.isOutput && wireClicked.elementIndex > topCollidedWire.elementIndex) || (!wireClicked.isOutput && !topCollidedWire.isOutput && wireClicked.elementIndex > topCollidedWire.elementIndex)) {
                                        topCollidedWire = wireClicked;
                                    }

                                }

                            }
                        }
                        if (topCollidedWire != null) {
                            wireClicked = topCollidedWire;
                        }
                        // Only take the wire if an element wasn't selected
                        if (topCollidedElement != null) {
                            wireClicked = {
                                elementIndex: -1,
                                wireIndex: -1,
                                isOutput: true
                            };
                        }
                        selectedElements.push(topCollidedElement);

                        if (selectedElements[0] != null) {
                            selectedWires = [];
                            oldElement = selectedElements[0];
                            oldSelectedPosition = {
                                x: selectedElements[0].x,
                                y: selectedElements[0].y
                            };
                        }
                        else {
                            oldSelectedPosition = null;
                        }

                        if (selectedElements[0] == null) {
                            selectedElements = null;
                        }

                    }
                if (selectedElements == null) {
                    if (selectedWires.length > 0 && selectedElements != null && selectedElements.length > 1) {

                    }
                    else {
                        if (wireClicked.elementIndex == -1) {
                            wireClicked = getWireCollision(x, y);
                        }
                        if (!canEdit) {
                            wireClicked = {
                                elementIndex: -1,
                                wireIndex: -1,
                                isOutput: true
                            };
                        }
                        wirePosition = [ x, y ];
                        // Connection exists and is not being selected from the output
                        if (wireClicked.elementIndex != -1 && !wireClicked.isOutput && drawables.indexOf(drawables[wireClicked.elementIndex].inputs[wireClicked.wireIndex]) != -1) {
                            selectedWires = [ wireClicked ];
                        }
                        else {
                            selectedWires = [];
                        }
                        // Prevent already connected inputs from being selected or not being able to edit
                        if ((!wireClicked.isOutput && drawables[wireClicked.elementIndex].inputs[wireClicked.wireIndex] != null) || !allowedToEdit || (selectedElements != null && selectedElements.length > 1) || wireClicked.elementIndex == -1) {
                            wireClicked = {
                                elementIndex: -1,
                                wireIndex: -1,
                                isOutput: true
                            };
                        }
                        else {
                            selectedWires = [ wireClicked ];
                        }
                    }
                }

                // No element nor wire was selected, start multi select box
                if (wireClicked.elementIndex == -1 && selectedElements == null && selectedWires.length == 0) {
                    // Used to define the multi select bounding box
                    dragSelect = {
                        origin: {
                            X: x,
                            Y: y
                        },
                        end: {
                            X: x,
                            Y: y
                        }
                    };
                }
                else {
                    dragSelect = null;
                }
                oldMouse = {
                    X: x,
                    Y: y
                };
            }
            closestElement = -1;
            enableDisableDeleteButton();
            clearInterval(drawHandle);
            drawHandle = 0;
            drawHandle = setInterval(update, DRAW_INTERVAL);
        }
        // Toggles inputs, places wires, places elements
        function logicMouseUp(x, y) {
            if (selectedElements != null && allowedToEdit && mouseHold) {
                for (var i = 0; i < selectedElements.length; i++) {
                    selectedElements[i].moveTo(Math.round((selectedElements[i].x) / CANVAS_GRANULARITY) * CANVAS_GRANULARITY, Math.round((selectedElements[i].y) / CANVAS_GRANULARITY) * CANVAS_GRANULARITY);
                    if (selectedElements[i].elementType == Element.LABEL) {
                        adjustLabel(selectedElements[i]);
                    }
                }
                undoRedo.pushState(saveToJSON());

            }
            if (oldSelectedPosition != null && selectedElements != null && selectedElements[0] != null) {
                if (oldSelectedPosition.x == selectedElements[0].x && oldSelectedPosition.y == selectedElements[0].y) {
                    mouseHold = false;
                }
            }
            // Try to connect the wire
            if (mouseHold && wireClicked.elementIndex != -1) {
                if (closestElement !== -1) {
                    if (!wireClicked.isOutput) {
                        drawables[closestElement].connectOutput(drawables[wireClicked.elementIndex], wireClicked.wireIndex, closestElementInputIndex);
                        drawables[wireClicked.elementIndex].connectInput(drawables[closestElement], wireClicked.wireIndex, closestElementInputIndex);
                    }
                    else if (wireClicked.isOutput) {
                        drawables[wireClicked.elementIndex].connectOutput(drawables[closestElement], closestElementInputIndex, wireClicked.wireIndex);
                        drawables[closestElement].connectInput(drawables[wireClicked.elementIndex], closestElementInputIndex, wireClicked.wireIndex);
                    }

                    currUpdates = 0;
                    undoRedo.pushState(saveToJSON());

                }
                selectedWires = [];
            }
            // Handles multi selection
            else if (mouseHold && selectedElements == null && canEdit && selectedWires.length == 0) {
                var multiSelectBoundingBox = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
                // Covers all cases of how the bounding box is created
                if (dragSelect.origin.X > dragSelect.end.X) {
                    multiSelectBoundingBox.x = dragSelect.end.X;
                    multiSelectBoundingBox.width = dragSelect.origin.X - dragSelect.end.X;
                }
                else {
                    multiSelectBoundingBox.x = dragSelect.origin.X;
                    multiSelectBoundingBox.width = dragSelect.end.X - dragSelect.origin.X;
                }
                if (dragSelect.origin.Y > dragSelect.end.Y) {
                    multiSelectBoundingBox.y = dragSelect.end.Y;
                    multiSelectBoundingBox.height = dragSelect.origin.Y - dragSelect.end.Y;
                }
                else {
                    multiSelectBoundingBox.y = dragSelect.origin.Y;
                    multiSelectBoundingBox.height = dragSelect.end.Y - dragSelect.origin.Y;
                }
                pressAndRelease = false;
                selectedElements = [];
                $('#' + zyID + ' .label').blur();
                for (var i = 0; i < drawables.length; i++) {
                    if (!drawables[i].shouldDraw) {
                        continue;
                    }
                    if (rectRectCollision(drawables[i].x, drawables[i].y, drawables[i].width, drawables[i].height, multiSelectBoundingBox.x, multiSelectBoundingBox.y, multiSelectBoundingBox.width, multiSelectBoundingBox.height)) {
                        selectedElements.push(drawables[i]);
                    }
                }
                wireMultiSelect(multiSelectBoundingBox.x, multiSelectBoundingBox.y, multiSelectBoundingBox.width, multiSelectBoundingBox.height);
                if (selectedElements.length > 0) {
                    oldSelectedPosition = {
                        x: selectedElements[0].x,
                        y: selectedElements[0].y
                    };
                }
                else {
                    oldSelectedPosition = null;
                }

            }
            // Just a click, maybe they are toggling an input
            else if (!mouseHold) {
                var collided = getCollision(x, y);
                if (collided != null && (collided.elementType == Element.IN || collided.elementType == Component.IN) && pressAndRelease && canToggle) {
                    pressAndRelease = false;
                    if (collided.elementType == Element.IN) {
                        if (collided.value == ELEMENT_VALUES.TRUE) {
                            collided.value = ELEMENT_VALUES.FALSE;
                        }
                        else {
                            collided.value = ELEMENT_VALUES.TRUE;
                        }
                    }
                    else if (collided.elementType == Component.IN) {
                        var userInput;
                        var newX = collided.x - $('#logicCanvasContainer' + '_' + zyID).scrollLeft();
                        var newY = collided.y - $('#logicCanvasContainer' + '_' + zyID).scrollTop();
                        $componentInput.css('left', newX);
                        $componentInput.css('top', newY);
                        $componentInput.show();
                        $componentInput.val(collided.value);
                        $componentInput.select();
                        $componentInput.blur(function() {
                            userInput = $(this).val();
                            if (userInput != null && !isNaN(parseInt(userInput, 10))) {
                                collided.value = parseInt(userInput, 10);
                            }
                            $componentInput.hide();
                            $componentInput.unbind('blur');
                            $componentInput.unbind('change');
                            currUpdates = 0;
                            undoRedo.pushState(saveToJSON());
                            update();
                        });
                        $componentInput.change(function() {
                            userInput = $(this).val();
                            if (userInput != null && !isNaN(parseInt(userInput, 10))) {
                                collided.value = parseInt(userInput, 10);
                            }
                            currUpdates = 0;
                            update();
                        });
                    }
                    currUpdates = 0;
                    undoRedo.pushState(saveToJSON());
                }
                else if (collided != null) {
                    if (selectedElements != null && selectedElements.length > 1) {
                        var wasSelected = false;
                        for (var i = 0; i < selectedElements.length; i++) {
                            if (drawables.indexOf(selectedElements[i]) == drawables.indexOf(collided)) {
                                wasSelected = true;
                            }
                        }
                        if (!wasSelected) {
                            selectedElements = [ collided ];
                            selectedWires = [];
                        }
                    }
                }
                else if (selectedElements != null && selectedElements.length > 1) {
                    selectedElements = null;
                    selectedWires = [];
                }
                else if (collided == null) {
                    selectedElements = null;
                    // Clear wires that were not connected
                    if (selectedWires.length == 1 && ((!selectedWires[0].isOutput && !drawables[selectedWires[0].elementIndex].inputs[selectedWires[0].wireIndex]) || (!selectedWires[0].onlyForSelection))) {
                        selectedWires = [];
                    }
                }

            }
            oldMouse = {
                X: x,
                Y: y
            };
            dragSelect = null;
            closestElement = -1;
            clearTimeout(holdTimeout);
            wirePosition = [ 0, 0 ];
            wireClicked = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true
            };
            mouseHold = false;
            enableDisableDeleteButton();
            clearInterval(drawHandle);
            drawHandle = 0;
            update();
        }

        // Fancy function for getting the dimensions of the scrollbars, called once during initialization and stored in logicContainerScrollbarDimensions
        function getScrollbarDimensions() {
            var outer = document.createElement('div');
            outer.style.visibility = 'hidden';
            outer.style.width = '100px';
            outer.style.height = '100px';
            outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
            document.body.appendChild(outer);
            var widthNoScroll = outer.offsetWidth;
            var heightNoScroll = outer.offsetHeight;
            // force scrollbars
            outer.style.overflow = 'scroll';
            // add innerdiv
            var inner = document.createElement('div');
            inner.style.width = '100%';
            inner.style.height = '100%';
            outer.appendChild(inner);
            var widthWithScroll = inner.offsetWidth;
            var heightWithScroll = inner.offsetHeight;
            // remove divs
            outer.parentNode.removeChild(outer);
            return {
                width: widthNoScroll - widthWithScroll,
                height: heightNoScroll - heightWithScroll
            };
        }

        function updateElementPosition(element, newX, newY) {
            var oldX = element.x;
            var oldY = element.y;
            var minX, minY, maxX, maxY;
            minX = $('#logicCanvasContainer' + '_' + zyID).scrollLeft();
            minY = $('#logicCanvasContainer' + '_' + zyID).scrollTop();
            maxX = $('#logicCanvasContainer' + '_' + zyID).scrollLeft() + $('#logicCanvasContainer' + '_' + zyID).width();
            maxY = $('#logicCanvasContainer' + '_' + zyID).scrollTop() + $('#logicCanvasContainer' + '_' + zyID).height();
            if (!(newX + element.width + logicContainerScrollbarDimensions.width >= maxX || newX <= minX)) {
                element.moveTo(newX, element.y);
            }
            if (!(newY + element.height + logicContainerScrollbarDimensions.height >= maxY || newY <= minY)) {
                element.moveTo(element.x, newY);
            }
        }
        // Moves dragging elements and extends wires
        function logicMouseMove(x, y) {
            /*
                If we have an element selected and mouse is down we
                move the element to the new location for dragging, otherwise it is a wire and we must update the wire location
                we always update the cursor element
            */
            if (mouseHold && (selectedElements != null) && selectedElements.length > 0 && allowedToEdit) {
                if (selectedElements.length == 1) {
                    updateElementPosition(selectedElements[0], x - (selectedElements[0].width / 2), y - (selectedElements[0].height / 2));
                    if (selectedElements[0].elementType == Element.LABEL) {
                        adjustLabel(selectedElements[0]);
                    }
                }
                else {
                    for (var i = 0; i < selectedElements.length; i++) {
                        updateElementPosition(selectedElements[i], selectedElements[i].x + x - oldMouse.X, selectedElements[i].y + y - oldMouse.Y);
                        if (selectedElements[i].elementType == Element.LABEL) {
                            adjustLabel(selectedElements[i]);
                        }
                    }
                }

            }
            else if (mouseHold && dragSelect != null && allowedToEdit) {
                dragSelect.end.X = x;
                dragSelect.end.Y = y;
            }
            else if (mouseHold && allowedToEdit) {
                wirePosition = [ x, y ];
                // Show closest connection
                if (wireClicked.elementIndex != -1) {
                    findClosestElementInput();
                }
            }
            oldMouse = {
                X: x,
                Y: y
            };
            if (!drawHandle) {
                drawHandle = setInterval(update, DRAW_INTERVAL);
            }
        }

        function exampleChanged() {
            let JSON = '';

            switch ($(`#exampleDrop_${zyID}`)[0].selectedIndex) {
                case 0:
                    if (useComponents) {
                        JSON = '{"elements":[{"id":"element_0","type":"constant-component","x":265,"y":180,"maxInput":0,"currentVal":1,"name":"Constant","bitWidth":8},{"id":"element_1","type":"in-component","x":155,"y":35,"maxInput":0,"currentVal":5,"name":"A","bitWidth":8},{"id":"element_2","type":"in-component","x":220,"y":35,"maxInput":0,"currentVal":17,"name":"B","bitWidth":8},{"id":"element_3","type":"out-component","x":240,"y":385,"maxInput":1,"currentVal":6,"name":"Z","bitWidth":8},{"id":"element_4","type":"mux-component","x":160,"y":140,"maxInput":3,"currentVal":0,"name":"Mux1","bitWidth":8},{"id":"element_5","type":"adder-component","x":205,"y":275,"maxInput":2,"currentVal":6,"name":"Adder1","bitWidth":8},{"id":"element_6","type":"in","x":75,"y":145,"maxInput":0,"currentVal":0,"name":"a","bitWidth":1}],"connections":[{"id":"element_0_1","src":"element_0","dst":"element_5","portIndex":0},{"id":"element_0_0","src":"element_1","dst":"element_4","portIndex":0},{"id":"element_0_1","src":"element_2","dst":"element_4","portIndex":0},{"id":"element_0_0","src":"element_4","dst":"element_5","portIndex":0},{"id":"element_0_0","src":"element_5","dst":"element_3","portIndex":0},{"id":"element_0_2","src":"element_6","dst":"element_4","portIndex":0}]}'; // eslint-disable-line max-len
                    }
                    else {
                        JSON = '{"elements":[{"id":"element_0","type":"not","x":200,"y":115,"maxInput":1,"currentVal":1,"name":""},{"id":"element_1","type":"in","x":60,"y":120,"maxInput":0,"currentVal":0,"name":""},{"id":"element_2","type":"and","x":310,"y":115,"maxInput":2,"currentVal":0,"name":""},{"id":"element_3","type":"and","x":270,"y":200,"maxInput":2,"currentVal":0,"name":""},{"id":"element_4","type":"in","x":60,"y":210,"maxInput":0,"currentVal":0,"name":""},{"id":"element_5","type":"out","x":525,"y":140,"maxInput":1,"currentVal":1,"name":""},{"id":"element_6","type":"nor","x":405,"y":130,"maxInput":2,"currentVal":1,"name":""},{"id":"element_7","type":"nor","x":405,"y":200,"maxInput":2,"currentVal":0,"name":""},{"id":"element_8","type":"label","x":20,"y":215,"maxInput":0,"currentVal":"E","name":""},{"id":"element_9","type":"label","x":20,"y":125,"maxInput":0,"currentVal":"D","name":""},{"id":"element_10","type":"label","x":590,"y":145,"maxInput":0,"currentVal":"Q","name":""}],"connections":[{"id":"element_0_0","src":"element_1","dst":"element_0"},{"id":"element_2_0","src":"element_0","dst":"element_2"},{"id":"element_2_1","src":"element_4","dst":"element_2"},{"id":"element_3_0","src":"element_4","dst":"element_3"},{"id":"element_3_1","src":"element_1","dst":"element_3"},{"id":"element_5_0","src":"element_6","dst":"element_5"},{"id":"element_6_0","src":"element_2","dst":"element_6"},{"id":"element_6_1","src":"element_7","dst":"element_6"},{"id":"element_7_0","src":"element_6","dst":"element_7"},{"id":"element_7_1","src":"element_3","dst":"element_7"}]}'; // eslint-disable-line max-len
                    }
                    break;
                case 1:
                    JSON = '{"elements":[{"id":"element_0","type":"and","x":320,"y":135,"maxInput":2,"currentVal":0,"name":""},{"id":"element_1","type":"xor","x":320,"y":230,"maxInput":2,"currentVal":1,"name":""},{"id":"element_2","type":"in","x":135,"y":145,"maxInput":0,"currentVal":1,"name":""},{"id":"element_3","type":"in","x":145,"y":250,"maxInput":0,"currentVal":0,"name":""},{"id":"element_4","type":"out","x":420,"y":155,"maxInput":1,"currentVal":0,"name":""},{"id":"element_5","type":"out","x":420,"y":245,"maxInput":1,"currentVal":1,"name":""},{"id":"element_6","type":"label","x":500,"y":250,"maxInput":0,"currentVal":"Sum","name":""},{"id":"element_7","type":"label","x":500,"y":160,"maxInput":0,"currentVal":"Carry","name":""},{"id":"element_8","type":"label","x":80,"y":150,"maxInput":0,"currentVal":"A","name":""},{"id":"element_9","type":"label","x":75,"y":255,"maxInput":0,"currentVal":"B","name":""}],"connections":[{"id":"element_0_0","src":"element_2","dst":"element_0"},{"id":"element_0_1","src":"element_3","dst":"element_0"},{"id":"element_1_0","src":"element_2","dst":"element_1"},{"id":"element_1_1","src":"element_3","dst":"element_1"},{"id":"element_4_0","src":"element_0","dst":"element_4"},{"id":"element_5_0","src":"element_1","dst":"element_5"}]}'; // eslint-disable-line max-len
                    break;
                case 2: // eslint-disable-line no-magic-numbers
                    JSON = '{"elements":[{"id":"element_0","type":"and","x":395,"y":70,"maxInput":2,"currentVal":0,"name":""},{"id":"element_1","type":"and","x":395,"y":295,"maxInput":2,"currentVal":1,"name":""},{"id":"element_2","type":"and","x":395,"y":220,"maxInput":2,"currentVal":0,"name":""},{"id":"element_3","type":"and","x":395,"y":145,"maxInput":2,"currentVal":0,"name":""},{"id":"element_4","type":"out","x":490,"y":310,"maxInput":1,"currentVal":1,"name":""},{"id":"element_5","type":"out","x":490,"y":160,"maxInput":1,"currentVal":0,"name":""},{"id":"element_6","type":"out","x":490,"y":235,"maxInput":1,"currentVal":0,"name":""},{"id":"element_7","type":"out","x":490,"y":85,"maxInput":1,"currentVal":0,"name":""},{"id":"element_8","type":"not","x":205,"y":70,"maxInput":1,"currentVal":0,"name":""},{"id":"element_9","type":"not","x":205,"y":125,"maxInput":1,"currentVal":0,"name":""},{"id":"element_10","type":"in","x":45,"y":130,"maxInput":0,"currentVal":1,"name":""},{"id":"element_11","type":"in","x":45,"y":80,"maxInput":0,"currentVal":1,"name":""},{"id":"element_12","type":"label","x":15,"y":80,"maxInput":0,"currentVal":"A0","name":""},{"id":"element_13","type":"label","x":15,"y":130,"maxInput":0,"currentVal":"A1","name":""},{"id":"element_14","type":"label","x":560,"y":90,"maxInput":0,"currentVal":"D0","name":""},{"id":"element_15","type":"label","x":560,"y":165,"maxInput":0,"currentVal":"D1","name":""},{"id":"element_16","type":"label","x":560,"y":240,"maxInput":0,"currentVal":"D2","name":""},{"id":"element_17","type":"label","x":560,"y":315,"maxInput":0,"currentVal":"D3","name":""}],"connections":[{"id":"element_0_0","src":"element_8","dst":"element_0"},{"id":"element_0_1","src":"element_9","dst":"element_0"},{"id":"element_1_0","src":"element_10","dst":"element_1"},{"id":"element_1_1","src":"element_11","dst":"element_1"},{"id":"element_2_0","src":"element_10","dst":"element_2"},{"id":"element_2_1","src":"element_8","dst":"element_2"},{"id":"element_3_0","src":"element_11","dst":"element_3"},{"id":"element_3_1","src":"element_9","dst":"element_3"},{"id":"element_4_0","src":"element_1","dst":"element_4"},{"id":"element_5_0","src":"element_3","dst":"element_5"},{"id":"element_6_0","src":"element_2","dst":"element_6"},{"id":"element_7_0","src":"element_0","dst":"element_7"},{"id":"element_8_0","src":"element_11","dst":"element_8"},{"id":"element_9_0","src":"element_10","dst":"element_9"}]}'; // eslint-disable-line max-len
                    break;
            }
            loadFromJSON(JSON);
        }

        function draw() {
            // Make sure all images are loaded before drawing
            if (!ZyDigSim.imagesHaveLoaded) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillText('Loading', canvas.width / 2, canvas.height / 2);
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (useComponents && progressive) {
                context.save();
                context.strokeStyle = ZYANTE_DARK_BLUE;
                var x = 71, y = 60, width = 420, height = 295;
                context.strokeRect(x, y, width, height);
                context.fillStyle = 'black';
                context.font = '12px Helvetica';
                var textHeight = 12;
                context.fillText('Datapath', x + width - context.measureText('Datapath').width - 5, y + height - textHeight);
                context.restore();
            }
            // Draw all connections first so that they appear under the gates
            drawConnections();
            context.globalAlpha = 1;
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].elementType != Element.PASS && drawables[i].elementType != Element.LABEL) {
                    drawables[i].draw(context);
                }
            }
            // Draws selection box around current element
            if (selectedElements != null && canEdit) {
                if (justCreated) {
                    context.globalAlpha = 0.5;
                }
                for (var i = selectedElements.length - 1; i >= 0; i--) {
                    context.save();
                    context.lineWidth = 2;
                    context.strokeStyle = ZYANTE_DARK_ORANGE;
                    if (selectedElements[i].elementType == Element.LABEL) {
                        context.strokeRect(selectedElements[i].x - 5, selectedElements[i].y - 5, selectedElements[i].width + 10, selectedElements[i].height + 10);
                    }
                    else {
                        context.strokeRect(selectedElements[i].x - 5, selectedElements[i].y - 5, selectedElements[i].width + 10, selectedElements[i].height + 10);
                    }
                    context.lineWidth = 1;
                    context.restore();
                }
                context.globalAlpha = 1;
            }
            // Draw wire user is currently trying to attach
            drawCurrentWire();

            // Draw dashed line showing the connection that will be made
            if (closestElement !== -1) {
                context.save();
                context.strokeStyle = WIRE_COLOR;
                context.beginPath();
                context.dashedLine(wirePosition[0], wirePosition[1], closestPosition[0], closestPosition[1]);
                context.stroke();
                context.restore();
            }
            // Draw drag select on top of everything
            if (dragSelect != null) {
                context.save();
                context.strokeStyle = ZYANTE_DARK_ORANGE;
                context.beginPath();
                context.moveTo(dragSelect.origin.X, dragSelect.origin.Y);
                context.lineTo(dragSelect.origin.X, dragSelect.end.Y);
                context.lineTo(dragSelect.end.X, dragSelect.end.Y);
                context.lineTo(dragSelect.end.X, dragSelect.origin.Y);
                context.lineTo(dragSelect.origin.X, dragSelect.origin.Y);
                context.stroke();
                context.restore();
            }
            // Draw debug stuff
            if (DEBUG) {
                highlightWires(context);
            }
        }

        // Draws a bounding box around the wires for debugging
        function highlightWires(context) {
            context.save();
            context.strokeStyle = ZYANTE_DARK_ORANGE;
            for (var i = 0; i < drawables.length; i++) {
                var offset = drawables[i].height / (drawables[i].maxInput + 1);
                for (var j = 0, newOffset = offset; j < drawables[i].maxInput; j++, newOffset += offset) {
                    context.strokeRect(drawables[i].x - WIRE_LENGTH - WIRE_BUFFER, drawables[i].y + newOffset - WIRE_BUFFER, 2 * WIRE_BUFFER, 2 * WIRE_BUFFER);
                }
                if (drawables[i].operation == ELEMENT_FUNCTIONS.OUT) {
                    continue;
                }
                context.strokeRect(drawables[i].x + drawables[i].width, drawables[i].y + (drawables[i].height / 2) - WIRE_BUFFER, WIRE_LENGTH + WIRE_BUFFER, 2 * WIRE_BUFFER);
            }
            context.restore();
        }

        // Draws the current wire that the user to trying to attach
        function drawCurrentWire() {
            // Depending on input or output wire origin is different
            if (wireClicked.elementIndex != -1) {
                if (wireClicked.isOutput) {
                    context.save();
                    context.strokeStyle = WIRE_COLOR;
                    context.beginPath();
                    context.moveTo(drawables[wireClicked.elementIndex].outputPorts[wireClicked.wireIndex].endPoint().x, drawables[wireClicked.elementIndex].outputPorts[wireClicked.wireIndex].endPoint().y);
                    context.lineTo(wirePosition[0], wirePosition[1]);
                    context.stroke();
                    context.restore();
                }
                else {
                    context.save();
                    context.strokeStyle = WIRE_COLOR;
                    context.beginPath();
                    context.moveTo(drawables[wireClicked.elementIndex].inputPorts[wireClicked.wireIndex].endPoint().x, drawables[wireClicked.elementIndex].inputPorts[wireClicked.wireIndex].endPoint().y);
                    context.lineTo(wirePosition[0], wirePosition[1]);
                    context.stroke();
                    context.restore();
                }
            }
        }
        // Draws all connections and colors the wire accordingly
        function drawConnections() {
            for (var i = 0; i < drawables.length; i++) {
                for (var j = 0; j < drawables[i].outputs.length; j++) {
                    if (drawables[i].outputs[j] == null) {
                        continue;
                    }
                    var wireOffset = HALF_WIRE_LENGTH;
                    context.beginPath();
                    var portIndex = drawables[i].outputs[j].portIndex ? drawables[i].outputs[j].portIndex : 0;
                    context.moveTo(drawables[i].outputPorts[portIndex].endPoint().x, drawables[i].outputPorts[portIndex].endPoint().y);
                    var index = drawables[i].outputs[j].inputIndex;
                    context.lineTo(drawables[i].outputs[j].outputEle.inputPorts[index].endPoint().x, drawables[i].outputs[j].outputEle.inputPorts[index].endPoint().y);
                    if (drawables[i].bitWidth > 1) {
                        context.strokeStyle = ZYANTE_DARK_BLUE;
                    }
                    else if (drawables[i].value == ELEMENT_VALUES.TRUE) {
                        context.strokeStyle = ZYANTE_GREEN;
                    }
                    else if (drawables[i].value == ELEMENT_VALUES.FALSE) {
                        context.strokeStyle = ZYANTE_MEDIUM_RED;
                    }
                    else {
                        context.strokeStyle = WIRE_COLOR;
                    }


                    for (var k = 0; k < selectedWires.length; k++) {
                        if (!selectedWires[k].isOutput && selectedWires[k].elementIndex == drawables.indexOf(drawables[i].outputs[j].outputEle) && selectedWires[k].wireIndex == drawables[i].outputs[j].inputIndex) {
                            context.lineWidth = 2;
                            context.strokeStyle = ZYANTE_DARK_ORANGE;
                            break;
                        }
                    }
                    if (drawables[i].outputPorts[0].bitWidth > 1) {
                        context.font = '12px Helvetica';
                        var midPoint = { x:((drawables[i].outputPorts[portIndex].endPoint().x + drawables[i].outputs[j].outputEle.inputPorts[index].endPoint().x) / 2), y: ((drawables[i].outputPorts[portIndex].endPoint().y + drawables[i].outputs[j].outputEle.inputPorts[index].endPoint().y) / 2) };
                        context.moveTo(midPoint.x - QUARTER_WIRE_LENGTH, midPoint.y + QUARTER_WIRE_LENGTH);
                        context.lineTo(midPoint.x + QUARTER_WIRE_LENGTH, midPoint.y - QUARTER_WIRE_LENGTH);
                        context.fillStyle = context.strokeStyle;
                    }
                    context.stroke();
                    // Reset to default
                    context.lineWidth = 1;
                }
            }
        }

        // Finds the closest connection to make using the current position of the clicked wire
        function findClosestElementInput() {
            closestElement = -1;
            closestElementInputIndex = -1;
            if (!wirePosition || wireClicked.elementIndex === -1) {
                return;
            }
            for (var i = 0; i < drawables.length; i++) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                if (!wireClicked.isOutput) {
                    for (var j = 0; j < drawables[i].outputPorts.length; j++) {
                        var x = drawables[i].outputPorts[j].endPoint().x;
                        var y = drawables[i].outputPorts[j].endPoint().y;
                        if (drawables[wireClicked.elementIndex].inputPorts[wireClicked.wireIndex].bitWidth == drawables[i].outputPorts[j].bitWidth && closestElement === -1 && i !== wireClicked.elementIndex && drawables[i].elementType !== Element.OUT && drawables[i].elementType !== Component.OUT) {
                            closestElement = i;
                            closestElementInputIndex = j;
                            closestPosition = [ x, y ];
                        }
                        // Choose the closest element that is not the same as the element that the wire is being dragged from and not an output element
                        else if (drawables[i].elementType !== Element.OUT && drawables[i].elementType !== Component.OUT && i !== wireClicked.elementIndex && drawables[wireClicked.elementIndex].inputPorts[wireClicked.wireIndex].bitWidth == drawables[i].outputPorts[j].bitWidth && (Math.pow((wirePosition[0] - x), 2) + Math.pow((wirePosition[1] - y), 2)) < (Math.pow((wirePosition[0] - closestPosition[0]), 2) + Math.pow((wirePosition[1] - closestPosition[1]), 2)) && i !== wireClicked.elementIndex) {
                            closestPosition = [ x, y ];
                            closestElementInputIndex = j;
                            closestElement = i;
                        }
                    }
                }
                else if (wireClicked.isOutput) {
                    for (var j = 0; j < drawables[i].inputPorts.length; j++) {
                        if (drawables[i].inputs[j] !== null) {
                            continue;
                        }
                        var x = drawables[i].inputPorts[j].endPoint().x;
                        var y = drawables[i].inputPorts[j].endPoint().y;
                        if (closestElement === -1 && i !== wireClicked.elementIndex && drawables[wireClicked.elementIndex].outputPorts[wireClicked.wireIndex].bitWidth == drawables[i].inputPorts[j].bitWidth) {
                            closestElement = i;
                            closestElementInputIndex = j;
                            closestPosition = [ x, y ];
                        }
                        // Choose closest element
                        else if (i !== wireClicked.elementIndex && drawables[wireClicked.elementIndex].outputPorts[wireClicked.wireIndex].bitWidth == drawables[i].inputPorts[j].bitWidth && (Math.pow((wirePosition[0] - x), 2) + Math.pow((wirePosition[1] - y), 2)) < (Math.pow((wirePosition[0] - closestPosition[0]), 2) + Math.pow((wirePosition[1] - closestPosition[1]), 2))) {
                            closestPosition = [ x, y ];
                            closestElementInputIndex = j;
                            closestElement = i;
                        }
                    }
                }
            }
        }
        /*
            Function to fix up toolbox when images are loaded.
            Called after an image loads, we don't know the dimensions of each image before hand so we must wait till they load so that we can place them in the toolbox
        */
        function loadComplete() {
            imagesToLoad--;
            if (imagesToLoad == 0) {
                drawToolbox();
                update();
                for (var i = 0; i < ZyDigSim.imagesHaveLoadedCallbacks.length; i++) {
                    ZyDigSim.imagesHaveLoadedCallbacks[i]();
                }
            }
        }

        function drawToolbox() {
            // Draw first to intialize
            for (var i = 0; i < tools.length; i++) {
                tools[i].draw(toolBoxCanvasContext);
            }
            var MARGIN_BETWEEN_IMAGES = 5;
            var ALIGN_OFFSET = 1;
            var Y_OFFSET_FOR_TEXT = 25;
            var componentTextY = 0;
            if (tools[0].elementType === Element.IN) {
                tools[0].moveTo(ALIGN_OFFSET, tools[0].y);
            }
            else {
                tools[0].moveTo(HALF_WIRE_LENGTH + ALIGN_OFFSET, tools[0].y);
            }
            var firstComponent = true;
            if (tools[0].elementType.indexOf('component') == -1) {
                tools[0].updateDimensions({ width:tools[0].img.width, height:tools[0].img.height });
            }
            else {
                tools[0].x = 0;
                tools[0].y = Y_OFFSET_FOR_TEXT;
                firstComponent = false;
            }
            for (var i = 1; i < tools.length; i++) {
                if (tools[i].elementType.indexOf('component') == -1) {
                    tools[i].updateDimensions({ width:tools[i].img.width, height:tools[i].img.height });
                    MARGIN_BETWEEN_IMAGES = 5;
                    tools[i].moveTo(HALF_WIRE_LENGTH + ALIGN_OFFSET, tools[i].y);
                }
                else {
                    tools[i].x = 0;
                    MARGIN_BETWEEN_IMAGES = 5;
                }
                // In and Out at same height
                if (tools[i].elementType == Element.OUT) {
                    var previousY = i - 2 < 0 ? 0 : tools[i - 2].y;
                    var previousHeight = i - 2 < 0 ? 0 : tools[i - 2].height;
                    var margin = i == 1 ? 0 : MARGIN_BETWEEN_IMAGES;
                    tools[i].moveTo(WIRE_LENGTH + (tools[i - 1].x + tools[i - 1].width) + (MARGIN_BETWEEN_IMAGES * 4), previousY + previousHeight + margin);
                }
                else if (tools[i].elementType == Element.IN) {
                    tools[i].moveTo(0, tools[i - 1].y + tools[i - 1].height + MARGIN_BETWEEN_IMAGES);
                }
                else {
                    if (tools[i].elementType.indexOf('component') != -1 && firstComponent) {
                        firstComponent = false;
                        componentTextY = tools[i - 1].height + MARGIN_BETWEEN_IMAGES + Y_OFFSET_FOR_TEXT;
                        tools[i].moveTo(ALIGN_OFFSET, tools[i - 1].y + tools[i - 1].height + MARGIN_BETWEEN_IMAGES + Y_OFFSET_FOR_TEXT * 2);
                    }
                    else if (tools[i].elementType.indexOf('component') != -1) {
                        tools[i].moveTo(ALIGN_OFFSET, tools[i - 1].y + tools[i - 1].height + MARGIN_BETWEEN_IMAGES);
                    }
                    else {
                        tools[i].moveTo(HALF_WIRE_LENGTH + ALIGN_OFFSET, tools[i - 1].y + tools[i - 1].height + MARGIN_BETWEEN_IMAGES);
                    }

                }
            }
            // Update any drawables already created
            for (var i = 0; i < drawables.length; i++) {
                if (drawables[i].elementType.indexOf('component') == -1) {
                    drawables[i].updateDimensions({ width: drawables[i].img.width, height: drawables[i].img.height });
                }
            }
            toolBoxCanvas.height = tools[tools.length - 1].y + tools[tools.length - 1].height + WIRE_LENGTH;
            $('#' + zyID + ' .toolbox-container').height($('#' + zyID + ' .toolbox-container').height() < $('#' + zyID + ' .middle-container').height() ? $('#' + zyID + ' .middle-container').height() : $('#' + zyID + ' .toolbox-container').height());
            ZyDigSim.imagesHaveLoaded = true;
            // Draw toolbox only needs to be done once
            toolBoxCanvasContext.clearRect(0, 0, toolBoxCanvas.width, toolBoxCanvas.height);
            for (var i = 0; i < tools.length; i++) {
                tools[i].draw(toolBoxCanvasContext);
                if (tools[i].elementType == Element.IN) {
                    toolBoxCanvasContext.save();
                    toolBoxCanvasContext.fillStyle = ZYANTE_DARK_BLUE;
                    var textHeight = 14;
                    toolBoxCanvasContext.font = 'bold 14px Helvetica';
                    var elementText = 'In';
                    toolBoxCanvasContext.translate(tools[i].x + tools[i].width / 2 - toolBoxCanvasContext.measureText(elementText).width / 2, tools[i].y + tools[i].height / 2 + textHeight / 2);
                    toolBoxCanvasContext.rotate(90 * Math.PI / 180);
                    toolBoxCanvasContext.translate(-(tools[i].x + tools[i].width / 2 - toolBoxCanvasContext.measureText(elementText).width / 2), -(tools[i].y + tools[i].height / 2 + textHeight / 2));
                    toolBoxCanvasContext.fillText(elementText, tools[i].x - toolBoxCanvasContext.measureText(elementText).width, tools[i].y + tools[i].height / 2 + textHeight / 2);
                    toolBoxCanvasContext.restore();
                }
                else if (tools[i].elementType == Element.OUT) {
                    toolBoxCanvasContext.save();
                    toolBoxCanvasContext.fillStyle = ZYANTE_DARK_BLUE;
                    var textHeight = 14;
                    toolBoxCanvasContext.font = 'bold 14px Helvetica';
                    var elementText = 'Out';
                    toolBoxCanvasContext.translate(tools[i].x + (tools[i].width / 2) - (toolBoxCanvasContext.measureText(elementText).width / 2), tools[i].y + (tools[i].height / 2) + (textHeight / 2));
                    toolBoxCanvasContext.rotate(90 * Math.PI / 180);
                    toolBoxCanvasContext.translate(-(tools[i].x + (tools[i].width / 2) - (toolBoxCanvasContext.measureText(elementText).width / 2)), -(tools[i].y + (tools[i].height / 2) + (textHeight / 2)));
                    toolBoxCanvasContext.fillText(elementText, tools[i].x - toolBoxCanvasContext.measureText(elementText).width, tools[i].y + (tools[i].height / 2));
                    toolBoxCanvasContext.restore();
                }
            }
            if (useComponents) {
                var componentText = 'All datapath components are 8-bits';
                toolBoxCanvasContext.save();
                toolBoxCanvasContext.fillStyle = ZYANTE_DARK_BLUE;
                toolBoxCanvasContext.font = '14px Helvetica';
                toolBoxCanvasContext.textBaseline = 'middle';
                toolBoxCanvasContext.fillText(componentText, 0, componentTextY);
                toolBoxCanvasContext.restore();
            }

        }
        function initToolbox() {
            if (useGates) {
                tools.push(new Element(0, 0, ZyDigSim.imageAssets.andImg, ELEMENT_FUNCTIONS.AND, 2, 'and', ''));
                if (!basicOnly) {
                    tools.push(new Element(0, 0, ZyDigSim.imageAssets.nandImg, ELEMENT_FUNCTIONS.NAND, 2, 'nand', ''));
                }
                tools.push(new Element(0, 0, ZyDigSim.imageAssets.orImg, ELEMENT_FUNCTIONS.OR, 2, 'or', ''));
                if (!basicOnly) {
                    tools.push(new Element(0, 0, ZyDigSim.imageAssets.norImg, ELEMENT_FUNCTIONS.NOR, 2, 'nor', ''));
                }
                if (!basicOnly) {
                    tools.push(new Element(0, 0, ZyDigSim.imageAssets.xorImg, ELEMENT_FUNCTIONS.XOR, 2, 'xor', ''));
                }
                tools.push(new Element(0, 0, ZyDigSim.imageAssets.notImg, ELEMENT_FUNCTIONS.NOT, 1, 'not', ''));
            }

            // Do not show input and output if progression and not useComponents.
            if (!(progressive && !useComponents)) {
                tools.push(new Element(0, 0, ZyDigSim.imageAssets.inImg, ELEMENT_FUNCTIONS.IN, 0, 'in', ''));
                tools.push(new Element(0, 0, ZyDigSim.imageAssets.outImg, ELEMENT_FUNCTIONS.OUT, 1, 'out', ''));
            }

            if (useComponents) {
                tools.push(new Component(0, 0, Component.CONSTANT, 8));
                if (!progressive) {
                    tools.push(new Component(0, 0, Component.IN, 8));
                    tools.push(new Component(0, 0, Component.OUT, 8));
                }
                tools.push(new Component(0, 0, Component.ADDER, 8));
                tools.push(new Component(0, 0, Component.COMPARATOR, 8));
                tools.push(new Component(0, 0, Component.MUX, 8));
                tools.push(new Component(0, 0, Component.LOAD_REGISTER, 8));
            }

        }
        // Load all images and insert the one's used in the toolbox into the tools array
        function loadAssets() {

            ZyDigSim.imageAssets = {
                zeroImg: null,
                oneImg: null,
                andImg: null,
                orImg: null,
                inImg: null,
                norImg: null,
                notImg: null,
                xorImg: null,
                outImg: null,
                undefinedImg: null,
                nandImg: null,
                labelImg: null
            };

            ZyDigSim.imagesHaveLoadedCallbacks = [];
            ZyDigSim.imagesHaveLoaded = false;
            imagesToLoad = Object.keys(ZyDigSim.imageAssets).length;
            // For each element in the toolbox we must get it's image and add it to the toolbox array tools, once all are loaded we can adjust their positions
            ZyDigSim.imageAssets.andImg = new Image();
            ZyDigSim.imageAssets.andImg.src = parentResource.getResourceURL('and.png', name);
            ZyDigSim.imageAssets.andImg.onload = loadComplete;

            ZyDigSim.imageAssets.nandImg = new Image();
            ZyDigSim.imageAssets.nandImg.src = parentResource.getResourceURL('nand.png', name);
            ZyDigSim.imageAssets.nandImg.onload = loadComplete;

            ZyDigSim.imageAssets.orImg = new Image();
            ZyDigSim.imageAssets.orImg.src = parentResource.getResourceURL('or.png', name);
            ZyDigSim.imageAssets.orImg.onload = loadComplete;

            ZyDigSim.imageAssets.norImg = new Image();
            ZyDigSim.imageAssets.norImg.src = parentResource.getResourceURL('nor.png', name);
            ZyDigSim.imageAssets.norImg.onload = loadComplete;


            ZyDigSim.imageAssets.xorImg = new Image();
            ZyDigSim.imageAssets.xorImg.src = parentResource.getResourceURL('xor.png', name);
            ZyDigSim.imageAssets.xorImg.onload = loadComplete;


            ZyDigSim.imageAssets.notImg = new Image();
            ZyDigSim.imageAssets.notImg.src = parentResource.getResourceURL('not.png', name);
            ZyDigSim.imageAssets.notImg.onload = loadComplete;


            ZyDigSim.imageAssets.inImg = new Image();
            ZyDigSim.imageAssets.inImg.src = parentResource.getResourceURL('in.png', name);
            ZyDigSim.imageAssets.inImg.onload = loadComplete;


            ZyDigSim.imageAssets.outImg = new Image();
            ZyDigSim.imageAssets.outImg.src = parentResource.getResourceURL('out.png', name);
            ZyDigSim.imageAssets.outImg.onload = loadComplete;


            ZyDigSim.imageAssets.labelImg = new Image();
            ZyDigSim.imageAssets.labelImg.src = parentResource.getResourceURL('label.png', name);
            ZyDigSim.imageAssets.labelImg.onload = loadComplete;

            // These images are not shown in the toolbox, we just need to load them for later use
            ZyDigSim.imageAssets.oneImg = new Image();
            ZyDigSim.imageAssets.oneImg.src = parentResource.getResourceURL('one.png', name);
            ZyDigSim.imageAssets.oneImg.onload = loadComplete;
            ZyDigSim.imageAssets.zeroImg = new Image();
            ZyDigSim.imageAssets.zeroImg.src = parentResource.getResourceURL('zero.png', name);
            ZyDigSim.imageAssets.zeroImg.onload = loadComplete;
            ZyDigSim.imageAssets.undefinedImg = new Image();
            ZyDigSim.imageAssets.undefinedImg.src = parentResource.getResourceURL('que.png', name);
            ZyDigSim.imageAssets.undefinedImg.onload = loadComplete;

            initToolbox();
        }

        // Simple box collision for a single point
        function getCollision(x, y, elementToCheck) {
            if (elementToCheck == undefined) {
                elementToCheck = 0;
            }
            var collidedElement = null;
            for (var i = drawables.length - 1; i >= elementToCheck; i--) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                if (rectPointCollision(x, y, drawables[i].x, drawables[i].y, drawables[i].width, drawables[i].height)) {
                    collidedElement = drawables[i];
                    break;
                }
            }
            return collidedElement;
        }
        // Uses box collision of an area around a wire
        function getWireCollision(x, y, elementToCheck) {
            var collidedWire = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true,
                onlyForSelection: false
            };
            for (var i = 0; i < drawables.length; i++) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                for (var j = 0; j < drawables[i].inputPorts.length; j++) {
                    var portTip = drawables[i].inputPorts[j].endPoint();
                    if (rectPointCollision(x, y, portTip.x - WIRE_BUFFER, portTip.y - WIRE_BUFFER, 2 * WIRE_BUFFER, 2 * WIRE_BUFFER) && drawables[i].inputs[j] == null && !(elementToCheck != undefined && elementToCheck != i)) {
                        collidedWire = {
                            elementIndex: i,
                            wireIndex: j,
                            isOutput: false
                        };
                        return collidedWire;
                    }
                }
                if (drawables[i].elementType == Element.OUT || drawables[i].elementType == Element.LABEL) {
                    continue;
                }
                for (var j = 0; j < drawables[i].outputPorts.length; j++) {
                    var portTip = drawables[i].outputPorts[j].endPoint();
                    if (rectPointCollision(x, y, portTip.x - WIRE_BUFFER, portTip.y - WIRE_BUFFER, WIRE_LENGTH + WIRE_BUFFER, 2 * WIRE_BUFFER) && !(elementToCheck != undefined && elementToCheck != i)) {
                        collidedWire = {
                            elementIndex: i,
                            wireIndex: j,
                            isOutput: true
                        };
                        return collidedWire;
                    }
                }
            }

            for (var i = 0; i < drawables.length; i++) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                for (var j = 0; j < drawables[i].maxInput; j++) {
                    var inputElementIndex = drawables.indexOf(drawables[i].inputs[j]);
                    // Test if point is on any part of the wire
                    if (inputElementIndex >= 0) {
                        // Make a small multi select rectangle around click area and use that to test collisions with wire
                        wireMultiSelect(x - 25, y - 25, 50, 50);
                        if (selectedWires.length > 0 && !(elementToCheck != undefined && elementToCheck != selectedWires[0].elementIndex)) {
                            collidedWire = selectedWires[0];
                            collidedWire.onlyForSelection = true;
                            return collidedWire;
                        }
                    }

                }
            }
            return collidedWire;
        }

        // Test for intersection in all wires using the 4 lines that make up the selection bounding box
        function wireMultiSelect(x, y, width, height) {
            selectedWires = [];
            //  __4__
            //  |   |
            // 2 |   | 3
            //  |___|
            //    1
            getWireLineCollision(x, y, x + width, y);
            getWireLineCollision(x, y, x, y + height);
            getWireLineCollision(x + width, y, x + width, y + height);
            getWireLineCollision(x, y + height, x + width, y + height);
            // Check if inside rectangle
            var collidedWires = [];
            var collidedWire = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true
            };

            for (var i = 0; i < drawables.length; i++) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                for (var j = 0; j < drawables[i].maxInput; j++) {
                    var inputElementIndex = drawables.indexOf(drawables[i].inputs[j]);
                    if (inputElementIndex >= 0) {
                        var x1 = x;
                        var y1 = y;
                        var x2 = x + width;
                        var y2 = y + height;
                        var x3 = drawables[inputElementIndex].x + drawables[inputElementIndex].width;
                        var y3 = drawables[inputElementIndex].y + (drawables[inputElementIndex].height / 2) - WIRE_BUFFER;
                        var x4 = drawables[i].inputPorts[j].endPoint().x;
                        var y4 = drawables[i].inputPorts[j].endPoint().y;
                        if (x3 >= x1 && x3 <= x2 && x4 >= x1 && x4 <= x2 && y3 >= y1 && y3 <= y2 && y4 >= y1 && y4 <= y2) {
                            collidedWire = {
                                elementIndex: i,
                                wireIndex: j,
                                isOutput: false
                            };
                            collidedWires.push(collidedWire);
                        }

                    }
                }
            }
            // Only add new wires, don't want duplicates
            for (var i = 0; i < collidedWires.length; i++) {
                var alreadyChosen = false;
                for (var j = 0; j < selectedWires.length; j++) {
                    if (selectedWires[j].elementIndex == collidedWires[i].elementIndex && selectedWires[j].wireIndex == collidedWires[i].wireIndex) {
                        alreadyChosen = true;
                        break;
                    }
                }
                if (!alreadyChosen) {
                    selectedWires.push(collidedWires[i]);
                }
            }

        }

        // Used to test if a wire intersects a line, adds all intersected wires to selectedWires
        function getWireLineCollision(x1, y1, x2, y2) {
            var collidedWires = [];
            var collidedWire = {
                elementIndex: -1,
                wireIndex: -1,
                isOutput: true
            };

            for (var i = 0; i < drawables.length; i++) {
                if (!drawables[i].shouldDraw) {
                    continue;
                }
                for (var j = 0; j < drawables[i].maxInput; j++) {
                    var inputElementIndex = drawables.indexOf(drawables[i].inputs[j]);
                    if (inputElementIndex >= 0) {
                        if (lineLineCollision(x1, y1, x2, y2, drawables[inputElementIndex].x + drawables[i].width, drawables[inputElementIndex].y + (drawables[i].height / 2) - WIRE_BUFFER, drawables[i].inputPorts[j].endPoint().x, drawables[i].inputPorts[j].endPoint().y)) {
                            collidedWire = {
                                elementIndex: i,
                                wireIndex: j,
                                isOutput: false
                            };
                            collidedWires.push(collidedWire);
                        }

                    }
                }
            }
            // Only add new wires, don't want duplicates
            for (var i = 0; i < collidedWires.length; i++) {
                var alreadyChosen = false;
                for (var j = 0; j < selectedWires.length; j++) {
                    if (selectedWires[j].elementIndex == collidedWires[i].elementIndex && selectedWires[j].wireIndex == collidedWires[i].wireIndex) {
                        alreadyChosen = true;
                        break;
                    }
                }
                if (!alreadyChosen) {
                    selectedWires.push(collidedWires[i]);
                }
            }
        }

        // Updates values by calling the gate's operation, we know there is an upper limit on the amount of updates needed for the outputs to be correct
        function update() {
            maxUpdates = drawables.length - 1;
            while (currUpdates < maxUpdates) {
                for (var i = 0; i < drawables.length; i++) {
                    drawables[i].update(context);
                }
                currUpdates++;
            }
            draw();
        }

        // Goes through and deletes the selectedElement from all arrays it is stored in
        function deleteSelectedItems() {
            // Disable deletion button after deleting
            $('#deleteSelectedItemsButton_' + zyID).prop('disabled', true);
            $('#deleteSelectedItemsButton_' + zyID).addClass('disabled');
            var mustSave = false;
            if (selectedWires.length > 0) {
                for (var i = 0; i < selectedWires.length; i++) {
                    // Must delete entry of this wire in the outputs of the element connected to this wire, have to find which element it is and which index into the output array the wire resides
                    for (var j = 0; j < drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex].outputs.length; j++) {
                        if (drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex] != null && drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex].outputs[j] != null && drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex].outputs[j].outputEle == drawables[selectedWires[i].elementIndex] && drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex].outputs[j].inputIndex == selectedWires[i].wireIndex) {
                            drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex].outputs.splice(j, 1);
                            break;
                        }
                    }
                    drawables[selectedWires[i].elementIndex].inputs[selectedWires[i].wireIndex] = null;
                }
                mustSave = true;
            }
            if (selectedElements !== null) {
                for (var k = 0; k < selectedElements.length; k++) {
                    var selectedElement = selectedElements[k];
                    for (var i = 0; i < selectedElement.inputs.length; i++) {
                        if (selectedElement.inputs[i] == null) continue;
                        for (var j = 0; j < selectedElement.inputs[i].outputs.length; j++) {
                            if (selectedElement.inputs[i].outputs[j] == null || selectedElement.inputs[i].outputs[j].outputEle == selectedElement) {
                                selectedElement.inputs[i].outputs.splice(j, 1);
                            }
                        }
                    }
                    for (var i = 0; i < selectedElement.outputs.length; i++) {
                        if (selectedElement.outputs[i] == null) continue;
                        for (var j = 0; j < selectedElement.outputs[i].outputEle.inputs.length; j++) {
                            if (selectedElement.outputs[i].outputEle.inputs[j] == selectedElement) {
                                selectedElement.outputs[i].outputEle.inputs[j] = null;
                            }
                        }
                    }
                    if (selectedElement.operation == ELEMENT_FUNCTIONS.LABEL) {
                        $('#label' + (selectedElement.labelID) + '_' + zyID).remove();
                    }
                    var index = drawables.indexOf(selectedElement);
                    drawables.splice(index, 1);
                }
                mustSave = true;
            }

            if (mustSave) {
                currUpdates = 0;
                selectedElements = null;
                selectedWires = [];
                undoRedo.pushState(saveToJSON());
                update();
            }

        }

        function importClick() {
            loadFromJSON($('#JSONLoadSave' + '_' + zyID).val());
        }

        function exportClick() {
            $('#JSONLoadSave' + '_' + zyID).val(saveToJSON());
        }

        function loadFromJSON(inputString) {
            if (inputString == null || !inputString.length) {
                return;
            }
            var parsedObject = JSON.parse(inputString);
            if (parsedObject.elements.length <= 0) {
                return;
            }
            selectedElements = null;

            $('#' + zyID).find('.label').each(function() {
                $(this).remove();
            });

            drawables = new Array(parsedObject.elements.length);
            parsedObject.elements.forEach(element => {
                const index = parseInt(element.id.substring(element.id.lastIndexOf('_') + 1), 10);
                let operation = null;
                let imgToUse = null;

                switch (element.type) {
                    case Element.AND:
                        operation = ELEMENT_FUNCTIONS.AND;
                        imgToUse = ZyDigSim.imageAssets.andImg;
                        break;
                    case Element.OR:
                        operation = ELEMENT_FUNCTIONS.OR;
                        imgToUse = ZyDigSim.imageAssets.orImg;
                        break;
                    case Element.XOR:
                        operation = ELEMENT_FUNCTIONS.XOR;
                        imgToUse = ZyDigSim.imageAssets.xorImg;
                        break;
                    case Element.NOT:
                        operation = ELEMENT_FUNCTIONS.NOT;
                        imgToUse = ZyDigSim.imageAssets.notImg;
                        break;
                    case Element.IN:
                        operation = ELEMENT_FUNCTIONS.IN;
                        imgToUse = ZyDigSim.imageAssets.zeroImg;
                        break;
                    case Element.OUT:
                        operation = ELEMENT_FUNCTIONS.OUT;
                        imgToUse = ZyDigSim.imageAssets.zeroImg;
                        break;
                    case Element.NAND:
                        operation = ELEMENT_FUNCTIONS.NAND;
                        imgToUse = ZyDigSim.imageAssets.nandImg;
                        break;
                    case Element.NOR:
                        operation = ELEMENT_FUNCTIONS.NOR;
                        imgToUse = ZyDigSim.imageAssets.norImg;
                        break;
                    case Element.LABEL:
                        operation = ELEMENT_FUNCTIONS.LABEL;
                        imgToUse = ZyDigSim.imageAssets.labelImg;
                        break;
                    default:
                        break;
                }
                const shouldDraw = typeof element.shouldDraw == 'undefined' ? true : element.shouldDraw;

                if (element.type.indexOf('component') === -1) {
                    drawables[index] = new Element(parseInt(element.x, 10), parseInt(element.y, 10),
                                                   imgToUse, operation, parseInt(element.maxInput, 10), element.type, element.name, false);
                }
                else {
                    drawables[index] = new Component(parseInt(element.x, 10), parseInt(element.y, 10),
                                                     element.type, element.bitWidth, false);
                    drawables[index].name = element.name;
                }
                drawables[index].value = parseInt(element.currentVal, 10);
                drawables[index].shouldDraw = shouldDraw;
                if (drawables[index].operation === ELEMENT_FUNCTIONS.LABEL) {
                    drawables[index].value = element.currentVal;
                    const labelElement = drawables[index];

                    initLabel(labelElement);
                }
            });

            // Connections can between elements not yet existing have to wait for all elements to be created before doing connections
            for (var i = 0; i < parsedObject.connections.length; i++) {
                var connection = parsedObject.connections[i];
                var src = parseInt(connection.src.substring(connection.src.lastIndexOf('_') + 1));
                var dst = parseInt(connection.dst.substring(connection.dst.lastIndexOf('_') + 1));
                var whichInput = parseInt(connection.id.substring(connection.id.lastIndexOf('_') + 1));
                var portIndex = connection.portIndex ? parseInt(connection.portIndex, 10) : 0;
                if (isNaN(src)) continue;
                drawables[dst].connectInput(drawables[src], whichInput, portIndex);
                drawables[src].connectOutput(drawables[dst], whichInput, portIndex);
            }
            currUpdates = 0;
            update();
        }

        function saveToJSON() {
            var objectToStringify = {
                elements: [],
                connections: []
            };
            for (var i = 0; i < drawables.length; i++) {
                objectToStringify.elements.push({
                    id: 'element_' + i,
                    type: drawables[i].elementType,
                    x: drawables[i].x,
                    y: drawables[i].y,
                    maxInput: drawables[i].maxInput,
                    currentVal: drawables[i].value,
                    name: drawables[i].name ? drawables[i].name : '',
                    bitWidth: drawables[i].bitWidth ? drawables[i].bitWidth : 1,
                    shouldDraw: drawables[i].shouldDraw
                });
                for (var j = 0; j < drawables[i].outputs.length; j++) {
                    var index = drawables.indexOfObject(drawables[i].outputs[j].outputEle);
                    if (index == -1) {
                        index = 'null';
                    }
                    var portIndex = drawables[i].outputs[j].portIndex ? drawables[i].outputs[j].portIndex : 0;
                    objectToStringify.connections.push({
                        id: 'element_' + j + '_' + drawables[i].outputs[j].inputIndex,
                        src: 'element_' + i,
                        dst: 'element_' + index,
                        portIndex: portIndex
                    });
                }
            }
            return JSON.stringify(objectToStringify);
        }

        function rectPointCollision(px, py, x, y, w, h) {
            return (x <= px) && (px <= x + w) && (y <= py) && (py <= y + h);
        }

        function rectRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
            return !((x1 > x2 + w2) || (x1 + w1 < x2) || (y1 > y2 + h2) || (y1 + h1 < y2));
        }

        // Tests for collision between the lines (x1,y1,x2,y2) and (x3,y3,x4,y4)
        function lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
            var a1, a2, b1, b2, c1, c2;
            var r1, r2, r3, r4;
            var denom, offset, num;
            /*
                Compute a1, b1, c1, where line joining points 1 and 2
                is "a1 x + b1 y + c1 = 0".
            */
            a1 = y2 - y1;
            b1 = x1 - x2;
            c1 = (x2 * y1) - (x1 * y2);
            // Compute r3 and r4.
            r3 = ((a1 * x3) + (b1 * y3) + c1);
            r4 = ((a1 * x4) + (b1 * y4) + c1);
            /*
                Check signs of r3 and r4. If both point 3 and point 4 lie on
                same side of line 1, the line segments do not intersect.
            */
            if ((r3 != 0) && (r4 != 0) && ((r3 * r4) >= 0)) {
                return INTERSECTION.NO_INTERSECT;
            }
            // Compute a2, b2, c2
            a2 = y4 - y3;
            b2 = x3 - x4;
            c2 = (x4 * y3) - (x3 * y4);
            // Compute r1 and r2
            r1 = (a2 * x1) + (b2 * y1) + c2;
            r2 = (a2 * x2) + (b2 * y2) + c2;
            /*
                Check signs of r1 and r2. If both point 1 and point 2 lie
                on same side of second line segment, the line segments do
                not intersect.
            */
            if ((r1 != 0) && (r2 != 0) && ((r1 * r2) >= 0)) {
                return INTERSECTION.NO_INTERSECT;
            }
            // Line segments intersect: compute intersection point.
            denom = (a1 * b2) - (a2 * b1);
            if (denom == 0) {
                return INTERSECTION.COLLINEAR;
            }
            if (denom < 0) {
                offset = -denom / 2;
            }
            else {
                offset = denom / 2;
            }
            // lines_intersect
            return INTERSECTION.DO_INTERSECT;
        }
        // Intialize object after everything is defined
        init();
    };
}
var zyDigSimExport = {
    create: function() {
        return new ZyDigSim();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};

module.exports = zyDigSimExport;
