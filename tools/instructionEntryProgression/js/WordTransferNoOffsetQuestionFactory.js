'use strict';

/* exported WordTransferNoOffsetQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the load and store word instructions but without using offsets.
    @class WordTransferNoOffsetQuestionFactory
    @extends QuestionFactory
*/
class WordTransferNoOffsetQuestionFactory extends QuestionFactory {

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

        // Generate addresses and integers.
        const numberOfAddresses = 1;
        const addresses = this._chooseNMemoryAddresses(numberOfAddresses);
        const address = addresses[0];
        const numberOfIntegers = 1;
        const integers = this._makeNSmallIntegers(numberOfIntegers);
        const value = integers[0];

        switch (levelNumber) {

            // One load word instruction. Ex: lw $s1, 0($s2)
            case 0: {
                memory.lookupWord(address).setValue(value);
                instructionOptions.push(this._getLoadRegisterOpCode());

                // Static register ordering.
                const registerNames = this._chooseNRegisterNames(2); // eslint-disable-line no-magic-numbers

                registerOptions.push(...registerNames.slice());
                instructions.push(this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]));

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];

                questionStem += `${registerName1} = ${memoryName}[${address}]`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(address);

                solutionInstructions.push(this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName2));

                expectedRegisterNames.push(registerName1);

                registerBaseAddresses.push(registerName2);
                break;
            }

            // One store word instruction. Ex: sw $s2, 0($s1)
            case 1: {
                memory.lookupWord(address).setValue(0);
                expectedMemoryAddresses.push(address);

                // Static register ordering.
                const registerNames = this._chooseNRegisterNames(2); // eslint-disable-line no-magic-numbers

                registerOptions.push(...registerNames.slice());
                instructions.push(this._makeStoreRegisterNoOffsetInstruction(registerNames[0], registerNames[0]));

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];

                questionStem += `${memoryName}[${address}] = ${registerName1}`;

                registers.lookupByRegisterName(registerName1).setValue(value);
                registers.lookupByRegisterName(registerName2).setValue(address);

                solutionInstructions.push(this._makeStoreRegisterNoOffsetInstruction(registerName1, registerName2));

                registerBaseAddresses.push(registerName2);

                instructionOptions.push(this._getStoreRegisterOpCode());
                break;
            }

            // One load word and one store word instruction. Ex: lw $s1, 0($s2)   sw $s1, 0($s3)
            case 2: { // eslint-disable-line no-magic-numbers
                const address2 = address + 8; // eslint-disable-line no-magic-numbers

                memory.lookupWord(address).setValue(value);
                memory.lookupWord(address2);
                expectedMemoryAddresses.push(address2);
                instructionOptions.push(
                    this._getLoadRegisterOpCode(),
                    this._getStoreRegisterOpCode()
                );

                // Static register ordering.
                const registerNames = this._chooseNRegisterNames(3); // eslint-disable-line no-magic-numbers

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0]),
                    this._makeLoadRegisterNoOffsetInstruction(registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];

                questionStem += `${memoryName}[${address2}] = ${memoryName}[${address}]`;

                registers.lookupByRegisterName(registerName1);
                registers.lookupByRegisterName(registerName2).setValue(address);
                registers.lookupByRegisterName(registerName3).setValue(address2);

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName2),
                    this._makeStoreRegisterNoOffsetInstruction(registerName1, registerName3)
                );

                registerBaseAddresses.push(registerName2, registerName3);
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
