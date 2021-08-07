'use strict';

/* global buildWordTransferQuestionFactoryPrototype, WordTransferQuestionFactory, WordTransferNoOffsetQuestionFactory,
   AddiAddQuestionFactory, AddiAddWordTransferQuestionFactory, LoopQuestionFactory, buildLoopQuestionFactoryPrototype,
   ConditionalQuestionFactory, buildConditionalQuestionFactoryPrototype, LogicalQuestionFactory, buildLogicalQuestionFactoryPrototype,
   AddSubQuestionFactory, buildAddSubQuestionFactoryPrototype, SubMulQuestionFactory, SltAndBranchPseudoQuestionFactory,
   JalJrQuestionFactory, PushPopStackQuestionFactory, AssignmentsQuestionFactory, ExpressionsQuestionFactory,
   ConserveRegistersQuestionFactory, IfElseQuestionFactory, IfElseExpressionsQuestionFactory, COALLoopsQuestionFactory,
   FunctionsQuestionFactory, ArraysQuestionFactory */

/**
    Randomly generate instruction entry levels.
    @module InstructionEntryProgression
    @return {void}
*/
function instructionEntryProgression() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.options = options;

        this.useBlackStorageBorder = options.useBlackStorageBorder || false;

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        let optionsNotSupported = false;

        if (options) {
            switch (options.instructionSet) {
                case 'MIPS':
                    this.instructionSetSDK = require('MIPSSDK').create();
                    break;
                case 'MIPSzy':
                    this.instructionSetSDK = require('MIPSzySDK').create();
                    break;
                case 'ARM':
                    this.instructionSetSDK = require('ARMSDK').create();
                    break;
                default:
                    optionsNotSupported = true;
            }

            let QuestionFactoryClass = null;

            switch (options.type) {
                case 'wordTransfer':
                    buildWordTransferQuestionFactoryPrototype();
                    QuestionFactoryClass = WordTransferQuestionFactory;
                    break;
                case 'addSub':
                    buildAddSubQuestionFactoryPrototype();
                    QuestionFactoryClass = AddSubQuestionFactory;
                    break;
                case 'logical':
                    buildLogicalQuestionFactoryPrototype();
                    QuestionFactoryClass = LogicalQuestionFactory;
                    break;
                case 'conditional':
                    buildConditionalQuestionFactoryPrototype();
                    QuestionFactoryClass = ConditionalQuestionFactory;
                    break;
                case 'loop':
                    buildLoopQuestionFactoryPrototype();
                    QuestionFactoryClass = LoopQuestionFactory;
                    break;
                case 'wordTransferNoOffset':
                    QuestionFactoryClass = WordTransferNoOffsetQuestionFactory;
                    break;
                case 'addiAdd':
                    QuestionFactoryClass = AddiAddQuestionFactory;
                    break;
                case 'addiAddWordTransfer':
                    QuestionFactoryClass = AddiAddWordTransferQuestionFactory;
                    break;
                case 'subMul':
                    QuestionFactoryClass = SubMulQuestionFactory;
                    break;
                case 'sltAndBranchPseudo':
                    QuestionFactoryClass = SltAndBranchPseudoQuestionFactory;
                    break;
                case 'jalJr':
                    QuestionFactoryClass = JalJrQuestionFactory;
                    break;
                case 'pushPopStack':
                    QuestionFactoryClass = PushPopStackQuestionFactory;
                    break;
                case 'assignments':
                    QuestionFactoryClass = AssignmentsQuestionFactory;
                    break;
                case 'expressions':
                    QuestionFactoryClass = ExpressionsQuestionFactory;
                    break;
                case 'conserveRegisters':
                    QuestionFactoryClass = ConserveRegistersQuestionFactory;
                    break;
                case 'ifElse':
                    QuestionFactoryClass = IfElseQuestionFactory;
                    break;
                case 'ifElseExpressions':
                    QuestionFactoryClass = IfElseExpressionsQuestionFactory;
                    break;
                case 'COALLoops':
                    QuestionFactoryClass = COALLoopsQuestionFactory;
                    break;
                case 'functions':
                    QuestionFactoryClass = FunctionsQuestionFactory;
                    break;
                case 'arrays':
                    QuestionFactoryClass = ArraysQuestionFactory;
                    break;
                default:
                    optionsNotSupported = true;
            }

            if (!optionsNotSupported) {
                this.questionFactory = new QuestionFactoryClass(
                    this.instructionSetSDK,
                    options.instructionSet,
                    this[this.name]
                );
            }
        }
        else {
            optionsNotSupported = true;
        }

        if (optionsNotSupported) {
            $(`#${this.id}`).html('This activity has been updated. Please refresh the webpage to download the update.');
            return;
        }

        this._questionCache = this.utilities.getQuestionCache(this.questionFactory, 10);

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name].progressionQuestion({
            developmentEnvironmentID: this.makeID('development-environment')
        });

        var self = this;
        var userEnteredInvalidAnswer = false;
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css + this.instructionSetSDK.css,
            numToWin:         this.questionFactory.numberOfQuestions,
            useMultipleParts: true,
            start: function() {
                self.codeController.enable();
                userEnteredInvalidAnswer = false;
            },
            reset: function() {
                self.generateQuestion(0);
            },
            next: function(currentQuestion) {
                if (!userEnteredInvalidAnswer) {
                    self.generateQuestion(currentQuestion);
                }
                self.codeController.enable();
                userEnteredInvalidAnswer = false;
            },
            isCorrect: function(currentQuestion) {
                self.codeController.disable();

                // Run user's instructions.
                const userRegisters = self.currentQuestion.registers.clone();
                const userMemory = self.currentQuestion.memory.clone();
                const userInstructions = self.codeController.getInstructions();
                const userMapAssemblyAndMachine = self.instructionSetSDK.createMapAssemblyAndMachineInstructions(
                    userInstructions,
                    self.currentQuestion.labels
                );
                const userSimulator = self.instructionSetSDK.createSimulator(
                    userMapAssemblyAndMachine,
                    userRegisters,
                    userMemory
                );

                var userInstructionsHaveInfiniteLoop = false;
                var specialCaseMessage = '';
                var explanationMessage = '';
                try {
                    userInstructions.forEach(instruction => {
                        instruction.checkWhetherRegisterNamesAndConstantValuesAreValid();
                    });

                    // Run up to 1000 instructions before erroring out.
                    userSimulator.run(1000);
                }
                catch (error) {
                    if (error.type === 'InfiniteLoop') {
                        userInstructionsHaveInfiniteLoop = true;
                        specialCaseMessage = error.message;
                    }
                    else {
                        explanationMessage = error.toString();
                        userEnteredInvalidAnswer = true;
                    }
                }

                // Give user another try if no instructions were modified.
                if (self._userDidNotChangeInstructions(userInstructions)) {
                    explanationMessage = 'Modify the instructions to answer the prompt.';
                    userEnteredInvalidAnswer = true;
                }

                // Run expected instructions.
                const expectedRegisters = self.currentQuestion.registers.clone();
                const expectedMemory = self.currentQuestion.memory.clone();
                const expectedMapAssemblyAndMachine = self.instructionSetSDK.createMapAssemblyAndMachineInstructions(
                    self.currentQuestion.solutionInstructions,
                    self.currentQuestion.labels
                );

                self.instructionSetSDK.createSimulator(
                    expectedMapAssemblyAndMachine,
                    expectedRegisters,
                    expectedMemory
                ).run();

                // User entered a valid answer, so check user's answer and provide feedback.
                let isAnswerCorrect = false;

                if (!userEnteredInvalidAnswer) {

                    // Check user's answer against factory-specific tests.
                    const correctness = self.questionFactory.checkFactorySpecificCorrectness({
                        userInstructions,
                        expectedInstructions: self.currentQuestion.solutionInstructions,
                        initialRegisters: self.currentQuestion.registers,
                        userRegisters,
                        registerBaseAddresses: self.currentQuestion.registerBaseAddresses,
                        expectedRegisters,
                    });

                    if (!correctness.isCorrect) {
                        specialCaseMessage += ` ${correctness.explanation}`;
                    }

                    // Check that user's answer matches each expected register and memory.
                    else {
                        var areRegistersCorrect = self.currentQuestion.expectedRegisterNames.every(function(registerName) {
                            var userRegister = userRegisters.lookupByRegisterName(registerName);
                            var expectedRegister = expectedRegisters.lookupByRegisterName(registerName);
                            return userRegister.equals(expectedRegister);
                        });
                        var isMemoryCorrect = self.currentQuestion.expectedMemoryAddresses.every(function(address) {
                            var userMemoryWord = userMemory.lookupWord(address);
                            var expectedMemoryWord = expectedMemory.lookupWord(address);
                            return userMemoryWord.equals(expectedMemoryWord);
                        });
                        isAnswerCorrect = areRegistersCorrect && isMemoryCorrect;

                        // Check that incorrect registers and memory did change.
                        if (!isAnswerCorrect) {
                            var registersThatDidNotChange = self.currentQuestion.expectedRegisterNames.filter(function(registerName) {
                                var userRegister = userRegisters.lookupByRegisterName(registerName);
                                var initialRegister = self.currentQuestion.registers.lookupByRegisterName(registerName);
                                return userRegister.equals(initialRegister);
                            });
                            var memoryThatDidNotChange = self.currentQuestion.expectedMemoryAddresses.filter(function(address) {
                                var expectedMemoryWord = userMemory.lookupWord(address);
                                var initialMemoryWord = self.currentQuestion.memory.lookupWord(address);
                                return expectedMemoryWord.equals(initialMemoryWord);
                            });

                            // Check if register or memory was supposed to change but didn't.
                            var notChangedRegisterOrMemory = null;
                            if (registersThatDidNotChange.length > 0) {
                                notChangedRegisterOrMemory = registersThatDidNotChange[0];
                            }
                            else if (memoryThatDidNotChange.length > 0) {
                                const memoryName = self.questionFactory.getMemoryNameForQuestionStem();

                                notChangedRegisterOrMemory = `${memoryName}[${memoryThatDidNotChange[0]}]`;
                            }

                            if (!!notChangedRegisterOrMemory) {
                                specialCaseMessage += ' Your code didn\'t change ' + notChangedRegisterOrMemory + ', but should have.';
                            }
                        }
                    }
                }

                // Build an explanation. |userEnteredInvalidAnswer| has a custom explanation.
                if (!userEnteredInvalidAnswer) {
                    explanationMessage += self.buildExplanationMessage(
                        isAnswerCorrect,
                        specialCaseMessage,
                        userInstructions,
                        self.currentQuestion.registers.clone(),
                        self.currentQuestion.memory.clone(),
                        self.currentQuestion.labels
                    );
                }

                return {
                    userAnswer:         userInstructions.toString(),
                    expectedAnswer:     self.currentQuestion.solutionInstructions.toString(),
                    isCorrect:          isAnswerCorrect,
                    explanationMessage: explanationMessage,
                    callbackFunction:   function() {
                        self.explanationRegisterController.update(userRegisters);
                        self.explanationMemoryController.update(userMemory);
                    },
                    showTryAgain: userEnteredInvalidAnswer,
                };
            },
            accessibleViewForLevel: levelIndex => {
                const question = this._questionCache.makeQuestion(levelIndex);
                const code = this.instructionSetSDK.createCode(question.solutionInstructions, question.labels);
                const areThereLabels = question.labels.length > 0;
                const solutionInstructions = code.map(lineOfCode => {
                    const label = lineOfCode.label ? `${lineOfCode.label.name}:` : '';
                    let instruction = lineOfCode.instruction ? lineOfCode.instruction.toString() : '';

                    if (instruction && areThereLabels) {
                        instruction = `   ${instruction}`;
                    }

                    const putOnSeparateLines = (label && instruction);

                    return putOnSeparateLines ? `${label}\n${instruction}` : `${label}${instruction}`;
                }).join('\n');
                const accessibleHTML = this[this.name].progressionQuestionAccessible({
                    question,
                    solutionInstructions,
                });

                return new Ember.RSVP.Promise(resolve => {
                    resolve(accessibleHTML);
                });
            },
        });

        this.initializeControllers();
        this.generateQuestion(0);
    };

    /*
        Return whether |userInstructions| differs from |this.currentQuestion.instructions|.
        |userInstructions| is required and an Instructions.
    */
    this._userDidNotChangeInstructions = function(userInstructions) {
        var initialInstructions = this.currentQuestion.instructions;
        // Every property of every instruction matches for user and initial instructions.
        return initialInstructions.every(function(initialInstruction, index) {
            var userProperties = userInstructions[index].getProperties();
            return initialInstruction.getProperties().every(function(initialProperty, index) {
                return (initialProperty === userProperties[index]);
            });
        });
    };

    /*
        Build an explanation message based on whether |isAnswerCorrect|.
        |isAnswerCorrect| is required and a boolean.
        |specialCaseMessage| is required and a string.
        |userInstructions| is required and an Instructions.
        |registers| is required and a Registers.
        |memory| is required and a Memory.
        |labels| is required and a Labels.
    */
    this.buildExplanationMessage = function(isAnswerCorrect, specialCaseMessage, userInstructions, registers, memory, labels) {
        const useCommentsWithRegisterValues = true;

        var userInstructionAndCommentsFactory = this.instructionSetSDK.createInstructionAndCommentsFactory(
            userInstructions,
            registers.clone(),
            memory.clone(),
            labels,
            this.currentQuestion.disabledInstructions,
            useCommentsWithRegisterValues
        );
        var userInstructionsWithCommentsHTML = userInstructionAndCommentsFactory.make();

        var expectedInstructionAndCommentsFactory = this.instructionSetSDK.createInstructionAndCommentsFactory(
            this.currentQuestion.solutionInstructions,
            registers.clone(),
            memory.clone(),
            labels,
            this.currentQuestion.disabledInstructions,
            useCommentsWithRegisterValues
        );
        var expectedInstructionsWithCommentsHTML = expectedInstructionAndCommentsFactory.make();

        // Only show memory if there are values in memory
        var showMemory = (userInstructionAndCommentsFactory.memory.numberOfElementsInLookupTable() !== 0);
        var showRegisters = this._showRegisters();
        var registersAndMemoryHTML = this.instructionSetSDK.developmentEnvironmentTemplate({
            showInstructions: false,
            showMemory,
            showRegisters,
            memoryID: this.makeID('explanationMemory'),
            registersID: this.makeID('explanationRegisters'),
            useBlackStorageBorder: this.useBlackStorageBorder,
        });

        // If memory and registers are not shown, then remove the HTML.
        registersAndMemoryHTML = (!showMemory && !showRegisters) ? '' : registersAndMemoryHTML;

        return this[this.name].explanation({
            id:                                   this.id,
            isAnswerWrong:                        !isAnswerCorrect,
            specialCaseMessage:                   specialCaseMessage,
            registersAndMemory:                   registersAndMemoryHTML,
            userInstructionsWithCommentsHTML:     userInstructionsWithCommentsHTML,
            expectedInstructionsWithCommentsHTML: expectedInstructionsWithCommentsHTML
        });
    };

    /*
        Make a DOM id using |prefix| and |id|.
        |prefix| is required and a string.
    */
    this.makeID = function(prefix) {
        return (prefix + '-' + this.id);
    };

    // Return whether to show the registers.
    this._showRegisters = function() {
        var progressionTypeToNotShowRegisters = [ 'conditional', 'loop' ];
        return (progressionTypeToNotShowRegisters.indexOf(this.options.type) === -1);
    };

    // Initialize |instructionsController|, |registersController|, and |memoryController|.
    this.initializeControllers = function() {
        var self = this;
        this.codeController = this.instructionSetSDK.createCodeController(
            this.instructionSetSDK.createInstructions(),
            this.makeID('instructions'),
            this.id,
            this.instructionSetSDK.codeTemplate,
            this.instructionSetSDK.instructionTemplate,
            this.instructionSetSDK.selectTemplate,
            [], // instructionOptions
            [], // registerOptions
            function(event) {
                if (event.keyCode === self.utilities.ENTER_KEY) {
                    self.progressionTool.check();
                }
            }
        );

        this.registerController = this.instructionSetSDK.createRegistersController(
            this.instructionSetSDK.createRegisters(),
            this.makeID('registers'),
            this.instructionSetSDK.templates,
            this.questionFactory.printRadix
        );

        this.memoryController = this.instructionSetSDK.createMemoryController(
            this.instructionSetSDK.createMemory(),
            this.makeID('memory'),
            this.instructionSetSDK.templates,
            this.questionFactory.printRadix
        );

        this.explanationRegisterController = this.instructionSetSDK.createRegistersController(
            this.instructionSetSDK.createRegisters(),
            this.makeID('explanationRegisters'),
            this.instructionSetSDK.templates,
            this.questionFactory.printRadix
        );

        this.explanationMemoryController = this.instructionSetSDK.createMemoryController(
            this.instructionSetSDK.createMemory(),
            this.makeID('explanationMemory'),
            this.instructionSetSDK.templates,
            this.questionFactory.printRadix
        );
    };

    /*
        Generate a question based on |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this.generateQuestion = function(currentQuestionNumber) {
        this.currentQuestion = this._questionCache.makeQuestion(currentQuestionNumber);
        $('#' + this.id + ' .question-stem').html(this.currentQuestion.questionStem);

        var developmentEnvironmentHTML = this.instructionSetSDK.developmentEnvironmentTemplate({
            showInstructions: true,
            // Only show memory if there are values in memory
            showMemory: (this.currentQuestion.memory.numberOfElementsInLookupTable() !== 0),
            showRegisters: this._showRegisters(),
            instructionsID: this.makeID('instructions'),
            registersID: this.makeID('registers'),
            memoryID: this.makeID('memory'),
            useBlackStorageBorder: this.useBlackStorageBorder,
        });
        $('#' + this.makeID('development-environment')).html(developmentEnvironmentHTML);

        if (this.currentQuestion.useTextNotInput) {
            this.codeController.useTextNotInput();
        }

        if (this.currentQuestion.useTextForOpcodes) {
            this.codeController.useTextForOpcodes();
        }

        this.codeController.update(
            this.currentQuestion.instructions.clone(),
            this.currentQuestion.labels,
            this.currentQuestion.instructionOptions,
            this.currentQuestion.labelOptions,
            this.currentQuestion.registerOptions,
            this.currentQuestion.disabledInstructions
        );
        this.registerController.update(this.currentQuestion.registers);
        this.memoryController.update(this.currentQuestion.memory);

        this.codeController.disable();

        // Set the solution if the platform supports.
        if (this.parentResource.setSolution) {
            this.parentResource.setSolution(this.currentQuestion.solutionInstructions.toString(), this.options.instructionSet);
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var instructionEntryProgressionExport = {
    create: function() {
        return new instructionEntryProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    supportsAccessible: true,
};
module.exports = instructionEntryProgressionExport;
