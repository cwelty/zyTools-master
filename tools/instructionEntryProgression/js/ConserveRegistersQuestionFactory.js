'use strict';

/* exported ConserveRegistersQuestionFactory */
/* global QuestionFactory, Question, QuestionFeedback */

/**
    Generate questions to test conserving registers.
    @class ConserveRegistersQuestionFactory
    @extends QuestionFactory
*/
class ConserveRegistersQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 3;
        this.useTextNotInput = true;
        this.useTextForOpcodes = true;
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
        const memoryAddress = 5008;
        const memoryValue = 0;
        const registerValue1 = 2;
        const registerValue2 = 7;
        const registerValue3 = 11;
        const memory = this._instructionSetSDK.createMemory();
        const registers = this._instructionSetSDK.createRegisters();

        registers.lookupByRegisterName(registerName1).setValue(registerValue1);
        registers.lookupByRegisterName(registerName2).setValue(registerValue2);
        registers.lookupByRegisterName(registerName3).setValue(registerValue3);
        registers.lookupByRegisterName(registerName4).setValue(memoryAddress);
        registers.lookupByRegisterName(registerName5).setValue(0);
        registers.lookupByRegisterName(registerName6).setValue(0);
        memory.lookupWord(memoryAddress).setValue(memoryValue);

        registers.addLabelToAddress('w', registerName1);
        memory.addLabelToAddress('x', memoryAddress);
        registers.addLabelToAddress('y', registerName2);
        registers.addLabelToAddress('z', registerName3);

        const expectedMemoryAddresses = [ memoryAddress ];
        const expectedRegisterNames = [ registerName5 ];

        // Setup the question stem components.
        let code = '';
        let questionStemStart = `Rewrite the instructions to reuse ${registerName5}, to conserve registers.`;

        // Setup instructions to begin with the first instruction disabled.
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const disabledInstructions = [ 0 ];

        // Randomize the second operation in the code.
        const numberOfOperations = 1;
        const operationsChosen = this._chooseNArithmeticOperations(numberOfOperations);
        const operation = operationsChosen[0];

        // Variable randomization of tmp1 and z.
        const variables = [
            {
                name: 'tmp1',
                registerName: registerName5,
            },
            {
                name: 'z',
                registerName: registerName3,
            },
        ];

        this._utilities.shuffleArray(variables);

        const variable1 = variables[0];
        const variable2 = variables[1];
        const expression = `${variable1.name} ${operation.symbol} ${variable2.name}`;

        switch (levelNumber) {

            /*
                Rewrite the instructions to reuse $t4, to conserve registers.
                tmp1 = w + y;
                x = tmp1 + z;

                add $t4, $t0, $t1
                add $t5, $t4, $t2
                sw $t5, 0($t3)

                -----------

                add $t4, $t0, $t1
                add $t4, $t4, $t2 # User write this, but initially show as above
                sw $t4, 0($t3) # User write this, but initially show as above
            */
            case 0: {
                registers.lookupByRegisterName(registerName4).setValue(memoryAddress);
                code = `tmp1 = w + y;
x = ${expression};`;
                instructions.push(
                    this._makeAddInstruction(registerName5, registerName1, registerName2),
                    operation.instruction.call(this, registerName6, variable1.registerName, variable2.registerName),
                    this._makeStoreRegisterNoOffsetInstruction(registerName6, registerName4)
                );
                solutionInstructions.push(
                    this._makeAddInstruction(registerName5, registerName1, registerName2),
                    operation.instruction.call(this, registerName5, variable1.registerName, variable2.registerName),
                    this._makeStoreRegisterNoOffsetInstruction(registerName5, registerName4)
                );
                break;
            }

            /*
                Rewrite the instructions to reuse $t4, to conserve registers.
                tmp1 = w + y;
                tmp2 = tmp1 + z;
                x = tmp2 + 9;

                add $t4, $t0, $t1
                add $t5, $t4, $t2
                addi $t6, $t5, 9
                sw $t6, 0($t3)

                -----------

                add $t4, $t0, $t1
                add $t4, $t4, $t2 # User write this, and initially show as above
                addi $t4, $t4, 9 # User write this, and initially show as above
                sw $t4, 0($t3) # User write this, and initially show as above
            */
            case 1: {
                const immediate = 9;

                registerOptions.push(registerName7);
                registers.lookupByRegisterName(registerName7).setValue(0);
                code = `tmp1 = w + y;
tmp2 = ${expression};
x = tmp2 + ${immediate};`;
                instructions.push(
                    this._makeAddInstruction(registerName5, registerName1, registerName2),
                    operation.instruction.call(this, registerName6, variable1.registerName, variable2.registerName),
                    this._makeAddImmediateInstruction(registerName7, registerName6, immediate),
                    this._makeStoreRegisterNoOffsetInstruction(registerName7, registerName4)
                );
                solutionInstructions.push(
                    this._makeAddInstruction(registerName5, registerName1, registerName2),
                    operation.instruction.call(this, registerName5, variable1.registerName, variable2.registerName),
                    this._makeAddImmediateInstruction(registerName5, registerName5, immediate),
                    this._makeStoreRegisterNoOffsetInstruction(registerName5, registerName4)
                );
                break;
            }

            /*
                Rewrite the instructions to reuse $t4, to conserve registers.
                $t3, $t4, and $t5 hold temporary variables.
                x = (w + y) * (y + z)

                add $t4, $t0, $t1
                add $t5, $t1, $t2
                mul $t6, $t4, $t5
                sw $t6, 0($t3)

                -----------

                add $t4, $t0, $t1
                add $t5, $t1, $t2 # User write this, and initially show as above
                mul $t4, $t4, $t5 # User write this, and initially show as above
                sw $t4, 0($t3) # User write this, and initially show as above
            */
            case 2: { // eslint-disable-line no-magic-numbers
                questionStemStart += `${this._utilities.getNewline()}$t4, $t5, and $t6 hold temporary values.`;

                // Variable randomization of w, y, and z.
                const variableW = {
                    name: 'w',
                    registerName: registerName1,
                };
                const variableY = {
                    name: 'y',
                    registerName: registerName2,
                };
                const variableZ = {
                    name: 'z',
                    registerName: registerName3,
                };

                const firstExpressionVariables = [ variableW, variableY ];
                const secondExpressionVariables = [ variableY, variableZ ];

                this._utilities.shuffleArray(firstExpressionVariables);
                this._utilities.shuffleArray(secondExpressionVariables);

                const firstExpressionVariable1 = firstExpressionVariables[0];
                const firstExpressionVariable2 = firstExpressionVariables[1];
                const secondExpressionVariable1 = secondExpressionVariables[0];
                const secondExpressionVariable2 = secondExpressionVariables[1];

                code = `x = (${firstExpressionVariable1.name} + ${firstExpressionVariable2.name}) * (${secondExpressionVariable1.name} + ${secondExpressionVariable2.name})`; // eslint-disable-line max-len
                registerOptions.push(registerName7);
                registers.lookupByRegisterName(registerName7).setValue(0);
                instructions.push(
                    this._makeAddInstruction(registerName5, firstExpressionVariable1.registerName, firstExpressionVariable2.registerName),
                    this._makeAddInstruction(registerName6, secondExpressionVariable1.registerName, secondExpressionVariable2.registerName),
                    this._makeMulInstruction(registerName7, registerName5, registerName6),
                    this._makeStoreRegisterNoOffsetInstruction(registerName7, registerName4)
                );
                solutionInstructions.push(
                    this._makeAddInstruction(registerName5, firstExpressionVariable1.registerName, firstExpressionVariable2.registerName),
                    this._makeAddInstruction(registerName6, secondExpressionVariable1.registerName, secondExpressionVariable2.registerName),
                    this._makeMulInstruction(registerName5, registerName5, registerName6),
                    this._makeStoreRegisterNoOffsetInstruction(registerName5, registerName4)
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, code),
            instructions,
            this._instructionSetSDK.createLabels(),
            registers,
            memory,
            solutionInstructions,
            expectedRegisterNames,
            expectedMemoryAddresses,
            [],
            [],

            // labelOptions is not used
            [],
            registerOptions,
            disabledInstructions,
            this.useTextNotInput,
            this.useTextForOpcodes
        );
    }

    /**
        Return whether the $t4 has the expected value.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Whether the user's answer is correct and an explanation.
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) {
        const expectedRegister = '$t4';
        const expectedValue = dataOfUserAndExpectedAnswers.expectedRegisters.lookupByRegisterName(expectedRegister).getSignedValue();
        const userValue = dataOfUserAndExpectedAnswers.userRegisters.lookupByRegisterName(expectedRegister).getSignedValue();
        let feedback = this._defaultFeedback;

        if (expectedValue !== userValue) {
            feedback = new QuestionFeedback(false, `${expectedRegister} was not reused as expected.`);
        }

        return feedback;
    }
}
