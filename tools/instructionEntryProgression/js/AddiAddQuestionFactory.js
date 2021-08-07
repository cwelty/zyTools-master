'use strict';

/* exported AddiAddQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the addi and add instructions.
    @class AddiAddQuestionFactory
    @extends QuestionFactory
*/
class AddiAddQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 4;
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
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedRegisterNames = [];
        const instructionOptions = [];
        const registerOptions = [];

        switch (levelNumber) {

            // One addi instruction. Ex: $t1 = $t2 + 3
            case 0: {
                const numberOfIntegers = 2;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const immediate = integers[0];
                const register2Value = integers[1];

                instructionOptions.push(this._getAddImmediateOpCode());

                // Static register ordering.
                const numberOfRegisters = 2;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0));

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];

                questionStem += `${registerName1} = ${registerName2} + ${immediate}`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(register2Value);

                solutionInstructions.push(this._makeAddImmediateInstruction(registerName1, registerName2, immediate));
                expectedRegisterNames.push(registerName1);
                break;
            }

            // One add instruction. Ex: $t1 = $t2 + $t3
            case 1: {
                const numberOfIntegers = 2;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const register2Value = integers[0];
                const register3Value = integers[1];

                instructionOptions.push(this._getAddOpCode());

                // Static register ordering.
                const numberOfRegisters = 3;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(this._makeAddInstruction(registerNames[0], registerNames[0], registerNames[0]));

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];

                questionStem += `${registerName1} = ${registerName2} + ${registerName3}`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(register2Value);
                registers.lookupByRegisterName(registerName3).setValue(register3Value);

                solutionInstructions.push(this._makeAddInstruction(registerName1, registerName2, registerName3));
                expectedRegisterNames.push(registerName1);
                break;
            }

            // Two add instructions. Ex: $t1 = $t2 + $t3 + $t4
            case 2: { // eslint-disable-line no-magic-numbers
                const numberOfIntegers = 3;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const register2Value = integers[0];
                const register3Value = integers[1];
                const register4Value = integers[2];

                instructionOptions.push(this._getAddOpCode());

                // Static register ordering.
                const numberOfRegisters = 4;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeAddInstruction(registerNames[0], registerNames[0], registerNames[0]),
                    this._makeAddInstruction(registerNames[0], registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];
                const registerName4 = registerNames[3];

                questionStem += `${registerName1} = ${registerName2} + ${registerName3} + ${registerName4}`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(register2Value);
                registers.lookupByRegisterName(registerName3).setValue(register3Value);
                registers.lookupByRegisterName(registerName4).setValue(register4Value);

                solutionInstructions.push(
                    this._makeAddInstruction(registerName1, registerName2, registerName3),
                    this._makeAddInstruction(registerName1, registerName1, registerName4)
                );
                expectedRegisterNames.push(registerName1);
                break;
            }

            // One add and one add immediate instruction. Ex: $t1 = $t2 + $t3 + N
            case 3: { // eslint-disable-line no-magic-numbers
                const numberOfIntegers = 3;
                const integers = this._makeNSmallIntegers(numberOfIntegers);
                const register2Value = integers[0];
                const register3Value = integers[1];
                const immediate = integers[2];

                instructionOptions.push(this._getAddOpCode(), this._getAddImmediateOpCode());

                // Static register ordering.
                const numberOfRegisters = 3;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);

                registerOptions.push(...registerNames.slice());
                instructions.push(
                    this._makeAddInstruction(registerNames[0], registerNames[0], registerNames[0]),
                    this._makeAddInstruction(registerNames[0], registerNames[0], registerNames[0])
                );

                // Randomized register ordering.
                this._utilities.shuffleArray(registerNames);

                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];

                questionStem += `${registerName1} = ${registerName2} + ${registerName3} + ${immediate}`;

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(register2Value);
                registers.lookupByRegisterName(registerName3).setValue(register3Value);

                solutionInstructions.push(
                    this._makeAddInstruction(registerName1, registerName2, registerName3),
                    this._makeAddImmediateInstruction(registerName1, registerName1, immediate)
                );
                expectedRegisterNames.push(registerName1);
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
            this._instructionSetSDK.createMemory(),
            solutionInstructions,
            expectedRegisterNames,

            // expectedMemoryAddresses not used
            [],

            // registerBaseAddresses not used
            [],
            instructionOptions,

            // labelOptions not used
            [],
            registerOptions,

            // disabledInstructions is not used
            []
        );
    }
}
