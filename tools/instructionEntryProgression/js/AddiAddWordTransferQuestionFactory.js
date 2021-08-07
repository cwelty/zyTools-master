'use strict';

/* exported AddiAddWordTransferQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the lw, sw, add, and addi instructions.
    @class AddiAddWordTransferQuestionFactory
    @extends QuestionFactory
*/
class AddiAddWordTransferQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 3;
        this.useTextNotInput = true;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {
        let questionStem = 'Compute: ';
        const instructions = this._instructionSetSDK.createInstructions();
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedRegisterNames = [];
        const expectedMemoryAddresses = [];
        const registerBaseAddresses = [];
        const instructionOptions = [];
        const registerOptions = [];
        const memoryName = this.getMemoryNameForQuestionStem();

        switch (levelNumber) {

            // One lw instruction, one add, and one sw. Ex: DM[5088] = $t2 + DM[5048]
            case 0: {
                const numberOfMemoryAddresses = 2;
                const baseAddresses = this._chooseNMemoryAddresses(numberOfMemoryAddresses);
                const address1 = baseAddresses[0];
                const address2 = baseAddresses[1];
                const numberOfIntegers = 2;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const memoryValue = integers[0];
                const registerValue = integers[1];

                memory.lookupWord(address1).setValue(0);
                memory.lookupWord(address2).setValue(memoryValue);
                instructionOptions.push(this._getLoadRegisterOpCode(), this._getAddOpCode(), this._getStoreRegisterOpCode());

                // Static register ordering.
                const numberOfRegisters = 4;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];
                const registerName4 = registerNames[3];

                questionStem += `${memoryName}[${address1}] = ${registerName4} + ${memoryName}[${address2}]`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(address1);
                registers.lookupByRegisterName(registerName3).setValue(address2);
                registers.lookupByRegisterName(registerName4).setValue(registerValue);
                expectedMemoryAddresses.push(address1);
                registerBaseAddresses.push(registerName2, registerName3);

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName3),
                    this._makeAddInstruction(registerName1, registerName1, registerName4),
                    this._makeStoreRegisterNoOffsetInstruction(registerName1, registerName2)
                );
                break;
            }

            // Two lw instructions, one add, and one sw. Ex: DM[5088] = DM[5052] + DM[5048]
            case 1: {
                const numberOfMemoryAddresses = 3;
                const baseAddresses = this._chooseNMemoryAddresses(numberOfMemoryAddresses);
                const address1 = baseAddresses[0];
                const address2 = baseAddresses[1];
                const address3 = baseAddresses[2];
                const numberOfIntegers = 2;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const memoryValue1 = integers[0];
                const memoryValue2 = integers[1];

                memory.lookupWord(address1).setValue(0);
                memory.lookupWord(address2).setValue(memoryValue1);
                memory.lookupWord(address3).setValue(memoryValue2);
                instructionOptions.push(this._getLoadRegisterOpCode(), this._getAddOpCode(), this._getStoreRegisterOpCode());

                // Static register ordering.
                const numberOfRegisters = 6;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];
                const registerName4 = registerNames[3];
                const registerName5 = registerNames[4];
                const registerName6 = registerNames[5];

                questionStem += `${memoryName}[${address1}] = ${memoryName}[${address2}] + ${memoryName}[${address3}]`;

                registers.lookupByRegisterName(registerName1).setValue(address1);
                registers.lookupByRegisterName(registerName2).setValue(address2);
                registers.lookupByRegisterName(registerName3).setValue(address3);
                registers.lookupByRegisterName(registerName4).setValue(0);
                registers.lookupByRegisterName(registerName5).setValue(0);
                registers.lookupByRegisterName(registerName6).setValue(0);
                expectedMemoryAddresses.push(address1);
                registerBaseAddresses.push(registerName1, registerName2, registerName3);

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName4, registerName2),
                    this._makeLoadRegisterNoOffsetInstruction(registerName5, registerName3),
                    this._makeAddInstruction(registerName6, registerName4, registerName5),
                    this._makeStoreRegisterNoOffsetInstruction(registerName6, registerName1)
                );
                break;
            }

            // Two lw instructions, one add, one addi, and one sw. Ex: Memory[5088] = Memory[5052] + Memory[5048] + 6
            case 2: { // eslint-disable-line no-magic-numbers
                const numberOfMemoryAddresses = 3;
                const baseAddresses = this._chooseNMemoryAddresses(numberOfMemoryAddresses);
                const address1 = baseAddresses[0];
                const address2 = baseAddresses[1];
                const address3 = baseAddresses[2];
                const numberOfIntegers = 3;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const memoryValue1 = integers[0];
                const memoryValue2 = integers[1];
                const immediate = integers[2];

                memory.lookupWord(address1).setValue(0);
                memory.lookupWord(address2).setValue(memoryValue1);
                memory.lookupWord(address3).setValue(memoryValue2);
                instructionOptions.push(
                    this._getLoadRegisterOpCode(),
                    this._getAddOpCode(),
                    this._getAddImmediateOpCode(),
                    this._getStoreRegisterOpCode()
                );

                // Static register ordering.
                const numberOfRegisters = 6;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];
                const registerName4 = registerNames[3];
                const registerName5 = registerNames[4];
                const registerName6 = registerNames[5];

                questionStem += `${memoryName}[${address1}] = ${memoryName}[${address2}] + ${memoryName}[${address3}] + ${immediate}`;

                registers.lookupByRegisterName(registerName1).setValue(address1);
                registers.lookupByRegisterName(registerName2).setValue(address2);
                registers.lookupByRegisterName(registerName3).setValue(address3);
                registers.lookupByRegisterName(registerName4).setValue(0);
                registers.lookupByRegisterName(registerName5).setValue(0);
                registers.lookupByRegisterName(registerName6).setValue(0);
                expectedMemoryAddresses.push(address1);
                registerBaseAddresses.push(registerName1, registerName2, registerName3);

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName4, registerName2),
                    this._makeLoadRegisterNoOffsetInstruction(registerName5, registerName3),
                    this._makeAddInstruction(registerName6, registerName4, registerName5),
                    this._makeAddImmediateInstruction(registerName6, registerName6, immediate),
                    this._makeStoreRegisterNoOffsetInstruction(registerName6, registerName1)
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
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

            // labelOptions not used
            [],
            registerOptions,

            // disabledInstructions is not used
            [],
            this.useTextNotInput
        );
    }
}
