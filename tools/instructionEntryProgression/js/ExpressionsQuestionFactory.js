'use strict';

/* exported ExpressionsQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the writing of expressions.
    @class ExpressionsQuestionFactory
    @extends QuestionFactory
*/
class ExpressionsQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 4;
        this.useTextNotInput = true;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {

        // Setup register names.
        const numberOfRegisters = 7;
        const registerNames = this._chooseNRegisterNames(numberOfRegisters);
        const registerName1 = registerNames[0];
        const registerName2 = registerNames[1];
        const registerName3 = registerNames[2];
        const registerName4 = registerNames[3];
        const registerName5 = registerNames[4];
        const registerName6 = registerNames[5];
        const registerName7 = registerNames[6];
        const registerOptions = registerNames.slice(0, registerNames.length - 1);

        // Assign initial values to registers and memory.
        const memoryAddress1 = 5000;
        const memoryAddress2 = 5004;
        const memoryAddress3 = 5008;
        const memoryValue1 = 2;
        const memoryValue2 = 5;
        const memoryValue3 = 11;
        const memory = this._instructionSetSDK.createMemory();
        const memoryName = this.getMemoryNameForQuestionStem();
        const registers = this._instructionSetSDK.createRegisters();

        registers.lookupByRegisterName(registerName1).setValue(memoryAddress1);
        registers.lookupByRegisterName(registerName2).setValue(memoryAddress2);
        registers.lookupByRegisterName(registerName3).setValue(memoryAddress3);
        registers.lookupByRegisterName(registerName4).setValue(0);
        registers.lookupByRegisterName(registerName5).setValue(0);
        registers.lookupByRegisterName(registerName6).setValue(0);
        memory.lookupWord(memoryAddress1).setValue(memoryValue1);
        memory.lookupWord(memoryAddress2).setValue(memoryValue2);
        memory.lookupWord(memoryAddress3).setValue(memoryValue3);

        const expectedMemoryAddresses = [ memoryAddress3 ];
        const registerBaseAddresses = [ registerName1, registerName2, registerName3 ];

        // Setup the question stem components.
        let code = '';
        const questionStemStart = 'Convert the C to assembly.' +
                                  ` x is ${memoryName}[${memoryAddress1}]. y is ${memoryName}[${memoryAddress2}]. ` +
                                  `z is ${memoryName}[${memoryAddress3}].`;

        // Setup instructions to begin with two disabled load register instructions.
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const instructionOptions = [ this._getLoadRegisterOpCode(), this._getStoreRegisterOpCode() ];
        const disabledInstructions = [ 0, 1 ];

        instructions.push(
            this._makeLoadRegisterNoOffsetInstruction(registerName4, registerName1),
            this._makeLoadRegisterNoOffsetInstruction(registerName5, registerName2)
        );
        solutionInstructions.push(
            this._makeLoadRegisterNoOffsetInstruction(registerName4, registerName1),
            this._makeLoadRegisterNoOffsetInstruction(registerName5, registerName2)
        );

        // Setup operations and randomly pick one.
        const numberOfOperations = 2;
        const operationsChosen = this._chooseNArithmeticOperations(numberOfOperations);
        const operation1 = operationsChosen[0];
        const operation2 = operationsChosen[1];

        instructionOptions.push(operation1.opcode);

        // Variable randomization of x and y.
        const variables = [
            {
                name: 'x',
                registerName: registerName4,
            },
            {
                name: 'y',
                registerName: registerName5,
            },
        ];

        this._utilities.shuffleArray(variables);

        const variable1 = variables[0];
        const variable2 = variables[1];
        const firstExpression = `${variable1.name} ${operation1.symbol} ${variable2.name}`;

        switch (levelNumber) {

            /*
                From:
                z = x + y;

                To:
                lw $t3, 0($t0)
                lw $t4, 0($t1)
                add $t5, $t3, $t4 # User writes
                sw $t5 0($t2) # User writes
            */
            case 0: {
                code = `z = ${firstExpression};`;
                instructions.push(
                    operation1.instruction.call(this, registerName4, registerName4, registerName4),
                    operation1.instruction.call(this, registerName4, registerName4, registerName4)
                );
                solutionInstructions.push(operation1.instruction.call(this, registerName6, variable1.registerName, variable2.registerName));
                break;
            }

            /*
                From:
                z = x + y;
                z = z + 1;

                To:
                lw $t3, 0($t0)
                lw $t4, 0($t1)
                add $t5, $t3, $t4 # User writes
                addi $t5, $t5, 1 # User writes
                sw $t5, 0($t2) # User writes
            */
            case 1: {
                code = `z = ${firstExpression};
z = z + 1;`;
                instructions.push(
                    operation1.instruction.call(this, registerName4, registerName4, registerName4),
                    operation1.instruction.call(this, registerName4, registerName4, registerName4),
                    operation1.instruction.call(this, registerName4, registerName4, registerName4)
                );
                solutionInstructions.push(
                    operation1.instruction.call(this, registerName6, variable1.registerName, variable2.registerName),
                    this._makeAddImmediateInstruction(registerName6, registerName6, 1)
                );
                instructionOptions.push(this._getAddImmediateOpCode());
                break;
            }

            /*
                From:
                z = (x + y) + 1;

                To:
                lw $t3, 0($t0)
                lw $t4, 0($t1)
                add $t5, $t3, $t4 # User writes
                addi $t5, $t5, 1 # User writes
                sw $t5, 0($t2) # User writes
            */
            case 2: { // eslint-disable-line no-magic-numbers
                code = `z = (${firstExpression}) + 1;`;
                instructions.push(
                    operation1.instruction.call(this, registerName4, registerName4, registerName4),
                    operation1.instruction.call(this, registerName4, registerName4, registerName4),
                    operation1.instruction.call(this, registerName4, registerName4, registerName4)
                );
                solutionInstructions.push(
                    operation1.instruction.call(this, registerName6, variable1.registerName, variable2.registerName),
                    this._makeAddImmediateInstruction(registerName6, registerName6, 1)
                );
                instructionOptions.push(this._getAddImmediateOpCode());
                break;
            }

            /*
                From:
                z = (x + y) * z;

                To:
                lw $t3, 0($t0)
                lw $t4, 0($t1)
                lw $t5, 0($t2) # User writes
                add $t6, $t3, $t4 # User writes
                mul $t5, $t6, $t5 # User writes
                sw $t5, 0($t2)
            */
            case 3: { // eslint-disable-line no-magic-numbers
                disabledInstructions.push(5); // eslint-disable-line no-magic-numbers
                registerOptions.push(registerName7);
                registers.lookupByRegisterName(registerName7).setValue(0);

                code = `z = (${firstExpression}) ${operation2.symbol} z;`;
                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName3, registerName3),
                    this._makeLoadRegisterNoOffsetInstruction(registerName3, registerName3),
                    this._makeLoadRegisterNoOffsetInstruction(registerName3, registerName3),
                    this._makeStoreRegisterNoOffsetInstruction(registerName6, registerName3)
                );
                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName6, registerName3),
                    operation1.instruction.call(this, registerName7, variable1.registerName, variable2.registerName),
                    operation2.instruction.call(this, registerName6, registerName7, registerName6)
                );
                instructionOptions.push(operation2.opcode);
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        // Last instruction is always the same store.
        solutionInstructions.push(this._makeStoreRegisterNoOffsetInstruction(registerName6, registerName3));

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, code),
            instructions,
            this._instructionSetSDK.createLabels(),
            registers,
            memory,
            solutionInstructions,

            // expectedRegisterNames is not used
            [],
            expectedMemoryAddresses,
            registerBaseAddresses,
            instructionOptions,

            // labelOptions is not used
            [],
            registerOptions,
            disabledInstructions,
            this.useTextNotInput
        );
    }
}
