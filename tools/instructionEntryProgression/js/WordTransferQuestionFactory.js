/*
    WordTransferQuestionFactory makes questions on the transfer of words between registers and memory,
    i.e., load word and store word.

    WordTransferQuestionFactory inherits QuestionFactory and stores:
    See QuestionFactory for details.
*/
function WordTransferQuestionFactory() {
    QuestionFactory.prototype.constructor.apply(this, arguments);
    this.numberOfQuestions = 5;
}

// Build the WordTransferQuestionFactory prototype.
function buildWordTransferQuestionFactoryPrototype() {
    WordTransferQuestionFactory.prototype = new QuestionFactory();
    WordTransferQuestionFactory.prototype.constructor = WordTransferQuestionFactory;

    /*
        Make a Question based on |questionNumber|.
        |questionNumber| is required and a number.
    */
    WordTransferQuestionFactory.prototype.make = function(questionNumber) {
        var questionStem = 'Compute: ';
        var instructions = this._instructionSetSDK.createInstructions();
        var registers = this._instructionSetSDK.createRegisters();
        var memory = this._instructionSetSDK.createMemory();
        var solutionInstructions = this._instructionSetSDK.createInstructions();
        var expectedRegisterNames = [];
        var expectedMemoryAddresses = [];
        var registerBaseAddresses = [];
        var instructionOptions = [];
        var registerOptions = [];
        var baseAddress = this._utilities.pickNumberInRange(5, 9) * 1000;

        const memoryName = this.getMemoryNameForQuestionStem();
        const isMIPSzy = this._instructionSet === 'MIPSzy';
        const questionNumberToGenerate = (isMIPSzy && (questionNumber === 4)) ? 3 : questionNumber; // eslint-disable-line no-magic-numbers

        switch (questionNumberToGenerate) {
            // Write an instruction to load a word from memory to a register.
            case 0:
                var offset = this._utilities.pickNumberInRange(1, 12) * 8;
                var valueInMemory = this._utilities.pickNumberInRange(20, 300);

                questionStem += `${this._makeRegisterName(1)} = ${memoryName}[${baseAddress + offset}]`;

                instructions.push(this._createLoadRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0)));

                registers.lookupByRegisterName(this._makeRegisterName(0)).setValue(baseAddress);
                registers.lookupByRegisterName(this._makeRegisterName(1)).setValue(0);

                memory.lookupWord(baseAddress + offset).setValue(valueInMemory);

                solutionInstructions.push(this._createLoadRegisterInstruction(this._makeRegisterName(1), offset, this._makeRegisterName(0)));

                expectedRegisterNames.push(this._makeRegisterName(1));

                registerBaseAddresses.push(this._makeRegisterName(0));

                instructionOptions.push(this._getLoadRegisterOpCode());

                registerOptions.push(this._makeRegisterName(0), this._makeRegisterName(1));
                break;

            // Write an instruction to store a word from a register to memory.
            case 1:
                var offset = this._utilities.pickNumberInRange(1, 12) * 8;
                var valueInRegister = this._utilities.pickNumberInRange(20, 300);

                questionStem += `${memoryName}[${baseAddress + offset}] = ${this._makeRegisterName(0)}`;

                instructions.push(this._createStoreRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0)));

                registers.lookupByRegisterName(this._makeRegisterName(0)).setValue(valueInRegister);
                registers.lookupByRegisterName(this._makeRegisterName(1)).setValue(baseAddress);

                memory.lookupWord(baseAddress + offset).setValue(0);

                solutionInstructions.push(this._createStoreRegisterInstruction(this._makeRegisterName(0), offset, this._makeRegisterName(1)));

                expectedMemoryAddresses.push(baseAddress + offset);

                registerBaseAddresses.push(this._makeRegisterName(1));

                instructionOptions.push(this._getStoreRegisterOpCode());

                registerOptions.push(this._makeRegisterName(0), this._makeRegisterName(1));
                break;

            // Write two instructions to load a word then add a value, storing the result in a register.
            case 2:
                var offset = this._utilities.pickNumberInRange(1, 12) * 8;
                var valueInRegister = this._utilities.pickNumberInRange(20, 300);
                var valueInMemory = this._utilities.pickNumberInRange(400, 700);

                questionStem += `${this._makeRegisterName(1)} = ${this._makeRegisterName(2)} + ${memoryName}[${baseAddress + offset}]`; // eslint-disable-line no-magic-numbers

                instructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0)),
                    this._instructionSetSDK.createAddInstruction(this._makeRegisterName(0), this._makeRegisterName(0), this._makeRegisterName(0))
                );

                registers.lookupByRegisterName(this._makeRegisterName(0)).setValue(baseAddress);
                registers.lookupByRegisterName(this._makeRegisterName(1)).setValue(0);
                registers.lookupByRegisterName(this._makeRegisterName(2)).setValue(valueInRegister);

                memory.lookupWord(baseAddress + offset).setValue(valueInMemory);

                solutionInstructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(1), offset, this._makeRegisterName(0)),
                    this._instructionSetSDK.createAddInstruction(this._makeRegisterName(1), this._makeRegisterName(2), this._makeRegisterName(1))
                );

                expectedRegisterNames.push(this._makeRegisterName(1));

                registerBaseAddresses.push(this._makeRegisterName(0));

                instructionOptions.push(this._getAddOpCode(), this._getLoadRegisterOpCode());

                registerOptions.push(this._makeRegisterName(0), this._makeRegisterName(1), this._makeRegisterName(2));
                break;

            // Write three instructions to load a word, add a value, then store the word in memory.
            case 3:
                var offset1 = this._utilities.pickNumberInRange(1, 6) * 8;
                var offset2 = this._utilities.pickNumberInRange(7, 12) * 8;
                var value1 = this._utilities.pickNumberInRange(20, 300);
                var value2 = this._utilities.pickNumberInRange(400, 600);

                questionStem += `${memoryName}[${baseAddress + offset2}] = ${this._makeRegisterName(2)} + ${memoryName}[${baseAddress + offset1}]`; // eslint-disable-line

                instructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0)),
                    this._instructionSetSDK.createAddInstruction(this._makeRegisterName(0), this._makeRegisterName(0), this._makeRegisterName(0)),
                    this._createStoreRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0))
                );

                registers.lookupByRegisterName(this._makeRegisterName(0)).setValue(baseAddress);
                registers.lookupByRegisterName(this._makeRegisterName(1)).setValue(0);
                registers.lookupByRegisterName(this._makeRegisterName(2)).setValue(value2);

                memory.lookupWord(baseAddress + offset1).setValue(value1);
                memory.lookupWord(baseAddress + offset2).setValue(0);

                solutionInstructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(1), offset1, this._makeRegisterName(0)),
                    this._instructionSetSDK.createAddInstruction(this._makeRegisterName(1), this._makeRegisterName(1), this._makeRegisterName(2)),
                    this._createStoreRegisterInstruction(this._makeRegisterName(1), offset2, this._makeRegisterName(0))
                );

                expectedMemoryAddresses.push(baseAddress + offset2);

                registerBaseAddresses.push(this._makeRegisterName(0));

                instructionOptions.push(this._getAddOpCode(), this._getLoadRegisterOpCode(), this._getStoreRegisterOpCode());

                registerOptions.push(this._makeRegisterName(0), this._makeRegisterName(1), this._makeRegisterName(2));
                break;

            // Write three instructions to load a word, add a constant value, then store in memory.
            case 4:
                var offset1 = this._utilities.pickNumberInRange(1, 6) * 8;
                var offset2 = this._utilities.pickNumberInRange(7, 12) * 8;
                var value1 = this._utilities.pickNumberInRange(10, 99);
                var value2 = this._utilities.pickNumberInRange(400, 600);

                questionStem += `${memoryName}[${baseAddress + offset2}] = ${value1} + ${memoryName}[${baseAddress + offset1}]`;

                instructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0)),
                    this._instructionSetSDK.createAddImmediateInstruction(this._makeRegisterName(0), this._makeRegisterName(0), 0),
                    this._createStoreRegisterInstruction(this._makeRegisterName(0), 0, this._makeRegisterName(0))
                );

                registers.lookupByRegisterName(this._makeRegisterName(0)).setValue(0);
                registers.lookupByRegisterName(this._makeRegisterName(1)).setValue(baseAddress);

                memory.lookupWord(baseAddress + offset1).setValue(value2);
                memory.lookupWord(baseAddress + offset2).setValue(0);

                solutionInstructions.push(
                    this._createLoadRegisterInstruction(this._makeRegisterName(0), offset1, this._makeRegisterName(1)),
                    this._instructionSetSDK.createAddImmediateInstruction(this._makeRegisterName(0), this._makeRegisterName(0), value1),
                    this._createStoreRegisterInstruction(this._makeRegisterName(0), offset2, this._makeRegisterName(1))
                );

                expectedMemoryAddresses.push(baseAddress + offset2);

                registerBaseAddresses.push(this._makeRegisterName(1));

                instructionOptions.push(this._getAddOpCode(), this._getAddImmediateOpCode(), this._getLoadRegisterOpCode(), this._getStoreRegisterOpCode());

                registerOptions.push(this._makeRegisterName(0), this._makeRegisterName(1));
                break;
        }

        return new Question(
            questionStem,
            instructions,
            this._instructionSetSDK.createLabels(),
            registers,
            memory,
            solutionInstructions,
            expectedRegisterNames,
            expectedMemoryAddresses,
            registerBaseAddresses,
            instructionOptions,
            [], // labelOptions not used
            registerOptions,
            [] // disabledInstructions is not used
        );
    };

    /*
        Make a register name ending with |number|.
        |number| is required.
    */
    WordTransferQuestionFactory.prototype._makeRegisterName = function(number) {
        const prefix = this._isARM() ? 'X' : '$t';

        return prefix + number;
    };

    /*
        Return a load register instruction using given parameters.
        |firstRegisterName| and |secondRegisterName| are required and a string.
        |immediate| is required and a number or Long.
    */
    WordTransferQuestionFactory.prototype._createLoadRegisterInstruction = function(firstRegisterName, immediate, secondRegisterName) {
        let instruction = null;

        if (this._isARM()) {
            instruction = this._instructionSetSDK.createLoadDoubleWordInstruction(
                firstRegisterName,
                secondRegisterName,
                immediate
            );
        }
        else {
            instruction = this._instructionSetSDK.createLoadWordInstruction(
                firstRegisterName,
                immediate,
                secondRegisterName
            );
        }

        return instruction;
    };

    /*
        Return a store register instruction using given parameters.
        |firstRegisterName| and |secondRegisterName| are required and a string.
        |immediate| is required and a number or Long.
    */
    WordTransferQuestionFactory.prototype._createStoreRegisterInstruction = function(firstRegisterName, immediate, secondRegisterName) {
        let instruction = null;

        if (this._isARM()) {
            instruction = this._instructionSetSDK.createStoreDoubleWordInstruction(
                firstRegisterName,
                secondRegisterName,
                immediate
            );
        }
        else {
            instruction = this._instructionSetSDK.createStoreWordInstruction(
                firstRegisterName,
                immediate,
                secondRegisterName
            );
        }

        return instruction;
    };

    /**
        Check that |registerBaseAddresses| did not change.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Correctness of the user's instructions.
    */
    WordTransferQuestionFactory.prototype.checkFactorySpecificCorrectness = function(dataOfUserAndExpectedAnswers) {
        const initialRegisters = dataOfUserAndExpectedAnswers.initialRegisters;
        const userRegisters = dataOfUserAndExpectedAnswers.userRegisters;
        const registerBaseAddresses = dataOfUserAndExpectedAnswers.registerBaseAddresses;

        // Find base addresses that did change.
        var baseAddressesThatChanged = registerBaseAddresses.filter(function(registerName) {
            var userRegister = userRegisters.lookupByRegisterName(registerName);
            var initialRegister = initialRegisters.lookupByRegisterName(registerName);
            return !userRegister.equals(initialRegister);
        });

        var isCorrect = (baseAddressesThatChanged.length === 0);
        var explanation = '';
        if (!isCorrect) {
            explanation = 'Your code overwrote the base address in ' + baseAddressesThatChanged[0] + ', but should not have.';
        }

        return {
            isCorrect:   isCorrect,
            explanation: explanation
        };
    };
}
