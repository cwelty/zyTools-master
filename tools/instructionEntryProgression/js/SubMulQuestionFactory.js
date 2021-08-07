'use strict';

/* exported SubMulQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the sub and mul instructions.
    @class SubMulQuestionFactory
    @extends QuestionFactory
*/
class SubMulQuestionFactory extends QuestionFactory {

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
        let registers = null;
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        let expectedRegisterNames = null;
        const instructionOptions = [];
        let registerOptions = null;
        let randomizedRegisterNames = null;
        const mulOpCode = 'mul';

        switch (levelNumber) {

            // One sub instruction. Ex: $t4 = $t5 - $t6
            case 0:

            // One mul instruction. Ex: $t4 = $t5 * $t6
            case 1: {
                const numberOfRegisters = 3;
                const result = this._setupRegisters(numberOfRegisters);

                expectedRegisterNames = result.expectedRegisterNames;
                registers = result.registers;
                registerOptions = result.staticRegisterNames;
                randomizedRegisterNames = result.randomizedRegisterNames;

                const registerName1 = randomizedRegisterNames[0];
                const registerName2 = randomizedRegisterNames[1];
                const registerName3 = randomizedRegisterNames[2];
                const opcode = (levelNumber === 0) ? this._getSubtractOpCode() : mulOpCode;
                const operator = (levelNumber === 0) ? '-' : '*';
                const instruction = (levelNumber === 0) ? this._makeSubInstruction : this._makeMulInstruction;

                instructionOptions.push(opcode);
                questionStem += `${registerName3} = ${registerName1} ${operator} ${registerName2}`;
                instructions.push(instruction.call(this, registerOptions[0], registerOptions[0], registerOptions[0]));
                solutionInstructions.push(instruction.call(this, registerName3, registerName1, registerName2));
                break;
            }

            // Two mul instructions. Ex: $t4 = $t1 * $t2 * $t3
            case 2: // eslint-disable-line no-magic-numbers

            // One sub instruction and one mul. Ex: $t4 = ($t1 - $t2) * $t3
            case 3: { // eslint-disable-line no-magic-numbers
                const numberOfRegisters = 4;
                const result = this._setupRegisters(numberOfRegisters);

                expectedRegisterNames = result.expectedRegisterNames;
                registers = result.registers;
                registerOptions = result.staticRegisterNames;
                randomizedRegisterNames = result.randomizedRegisterNames;

                if (levelNumber === 3) { // eslint-disable-line no-magic-numbers
                    instructionOptions.push(this._getSubtractOpCode());
                }
                instructionOptions.push(mulOpCode);

                instructions.push(
                    this._makeMulInstruction(registerOptions[0], registerOptions[0], registerOptions[0]),
                    this._makeMulInstruction(registerOptions[0], registerOptions[0], registerOptions[0])
                );

                const registerName1 = randomizedRegisterNames[0];
                const registerName2 = randomizedRegisterNames[1];
                const registerName3 = randomizedRegisterNames[2];
                const registerName4 = randomizedRegisterNames[3];
                const operator = (levelNumber === 2) ? '*' : '-'; // eslint-disable-line no-magic-numbers
                const instruction = (levelNumber === 2) ? this._makeMulInstruction : this._makeSubInstruction; // eslint-disable-line no-magic-numbers
                const firstOperation = `${registerName1} ${operator} ${registerName2}`;
                const firstOperationParens = (levelNumber === 2) ? firstOperation : `(${firstOperation})`; // eslint-disable-line no-magic-numbers

                questionStem += `${registerName4} = ${firstOperationParens} * ${registerName3}`;
                solutionInstructions.push(
                    instruction.call(this, registerName4, registerName1, registerName2),
                    this._makeMulInstruction(registerName4, registerName4, registerName3)
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

    /**
        Setup the registers for a problem given the number of registers.
        @method _setupRegisters
        @private
        @param {Integer} numberOfRegisters The number of registers to setup.
        @return {Object} Registers, register names (static and randomized), and expected register names.
    */
    _setupRegisters(numberOfRegisters) {

        // Build static and randomized register orderings
        const staticRegisterNames = this._chooseNRegisterNames(numberOfRegisters);
        const randomizedRegisterNames = staticRegisterNames.slice();

        this._utilities.shuffleArray(randomizedRegisterNames);

        const lastRegisterName = randomizedRegisterNames[randomizedRegisterNames.length - 1];
        const expectedRegisterNames = [ lastRegisterName ];

        // Setup initial register values. Last register is assigned 0.
        const registers = this._instructionSetSDK.createRegisters();
        const numberOfIntegers = numberOfRegisters - 1;
        const integers = this._makeNSmallIntegers(numberOfIntegers);
        const lastRegisterValue = 0;
        const registerValues = integers.concat(lastRegisterValue);

        randomizedRegisterNames.forEach((registerName, index) => {
            const registerValue = registerValues[index];

            registers.lookupByRegisterName(registerName).setValue(registerValue);
        });

        return { expectedRegisterNames, registers, staticRegisterNames, randomizedRegisterNames };
    }
}
