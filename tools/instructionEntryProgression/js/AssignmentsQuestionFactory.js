'use strict';

/* exported AssignmentsQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing C assignments.
    @class AssignmentsQuestionFactory
    @extends QuestionFactory
*/
class AssignmentsQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 2;
        this.useTextNotInput = true;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {
        const memoryName = this.getMemoryNameForQuestionStem();
        const instructions = this._instructionSetSDK.createInstructions();
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedMemoryAddresses = [];
        const instructionOptions = [];
        const registerOptions = [];
        const disabledInstructions = [];
        let cCode = '';

        // Configure question stem.
        const memoryAddress1 = 5000;
        const memoryAddress2 = 5004;
        let questionStemStart = `Convert the C to assembly. x is ${memoryName}[${memoryAddress1}].`;

        // Setup memory.
        expectedMemoryAddresses.push(memoryAddress1);

        // Setup registers.
        const numberOfRegisters = 3;
        const registerNames = this._chooseNRegisterNames(numberOfRegisters);
        const registerName1 = registerNames[0];
        const registerName2 = registerNames[1];

        registerOptions.push('$zero', registerName1, registerName2);
        registers.lookupByRegisterName(registerName1);
        registers.lookupByRegisterName(registerName2);

        switch (levelNumber) {

            /*
                Convert C:
                int x;
                x = 9;

                To assembly:
                addi $t2, $zero, 5000 # User writes
                addi $t1, $zero, 9 # User writes
                sw $t1, 0($t2) # User writes
            */
            case 0: {
                const immediate = 9;

                cCode = `int x;
x = ${immediate};`;
                instructionOptions.push(this._getAddImmediateOpCode(), this._getStoreRegisterOpCode());
                instructions.push(
                    this._makeAddImmediateInstruction(registerName1, registerName1, 0),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 0),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 0)
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', memoryAddress1),
                    this._makeAddImmediateInstruction(registerName2, '$zero', immediate),
                    this._makeStoreRegisterNoOffsetInstruction(registerName2, registerName1)
                );
                memory.lookupWord(memoryAddress1).setValue(0);
                break;
            }

            /*
                Convert C:
                y = x;

                To assembly:
                addi $t0, $zero, 5000
                addi $t1, $zero, 5004
                lw $t2, 0($t0) # User writes
                sw $t2, 0($t1) # User writes
            */
            case 1: {
                questionStemStart += ` y is ${memoryName}[${memoryAddress2}].`;
                memory.lookupWord(memoryAddress1).setValue(15); // eslint-disable-line no-magic-numbers
                memory.lookupWord(memoryAddress2).setValue(20); // eslint-disable-line no-magic-numbers
                expectedMemoryAddresses.push(memoryAddress2);
                disabledInstructions.push(0, 1);

                // Setup third register.
                const registerName3 = registerNames[2];

                registerOptions.push(registerName3);
                registers.lookupByRegisterName(registerName3);

                // Configure C code and assembly instructions.
                cCode = 'y = x;';
                instructionOptions.push(this._getAddImmediateOpCode(), this._getLoadRegisterOpCode(), this._getStoreRegisterOpCode());
                instructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', memoryAddress1),
                    this._makeAddImmediateInstruction(registerName2, '$zero', memoryAddress2),
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1),
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1)
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', memoryAddress1),
                    this._makeAddImmediateInstruction(registerName2, '$zero', memoryAddress2),
                    this._makeLoadRegisterNoOffsetInstruction(registerName3, registerName1),
                    this._makeStoreRegisterNoOffsetInstruction(registerName3, registerName2)
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, cCode),
            instructions,
            this._instructionSetSDK.createLabels(),
            registers,
            memory,
            solutionInstructions,

            // expectedRegisterNames is not used
            [],
            expectedMemoryAddresses,

            // registerBaseAddresses is not used
            [],
            instructionOptions,

            // labelOptions is not used
            [],
            registerOptions,
            disabledInstructions,
            this.useTextNotInput
        );
    }
}
