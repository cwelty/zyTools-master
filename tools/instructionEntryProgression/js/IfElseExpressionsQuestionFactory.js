'use strict';

/* exported IfElseExpressionsQuestionFactory */
/* global QuestionFactory, Question, QuestionFeedback */

/**
    Generate questions testing the writing of expressions in if-else statements.
    @class IfElseExpressionsQuestionFactory
    @extends QuestionFactory
*/
class IfElseExpressionsQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 5;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {

        // Build variable names and associated register names. Randomize the selection of variable/register names.
        const variables = [
            { name: 'w', registerName: '$t0' },
            { name: 'x', registerName: '$t1' },
            { name: 'y', registerName: '$t2' },
            { name: 'z', registerName: '$t3' },
        ];

        this._utilities.shuffleArray(variables);

        const variableName1 = variables[0].name;
        const variableName2 = variables[1].name;
        const variableName3 = variables[2].name;
        const variableName4 = variables[3].name;
        const registerName1 = variables[0].registerName;
        const registerName2 = variables[1].registerName;
        const registerName3 = variables[2].registerName;
        const registerName4 = variables[3].registerName;
        const registerOptions = [ registerName1, registerName2, registerName3 ];
        const usedVariableNames = [ variableName1, variableName2, variableName3 ];
        const usedRegisterNames = registerOptions.slice();
        const expectedRegisterNames = [ registerName1 ];
        let code = '';
        const registers = this._instructionSetSDK.createRegisters();
        const labelOptions = [];
        const instructionOptions = [ this._getAddImmediateOpCode() ];
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();

        registers.lookupByRegisterName(registerName1).setValue(11); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName2).setValue(3); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName3).setValue(2); // eslint-disable-line no-magic-numbers
        labelOptions.push('After');

        switch (levelNumber) {

            /*
                Convert:
                if (x != y) {
                   w = w + 50;
                }

                To:
                    beq $t0, $t1, After # User writes
                    addi $t2, $t2, 50
                After:
            */
            case 0: {
                code = `if (${variableName2} != ${variableName3}) {
    ${variableName1} = ${variableName1} + 50;
}`;
                instructionOptions.push('beq', 'bne');
                instructions.push(this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName2, registerName2, 'After'));
                solutionInstructions.push(this._instructionSetSDK.createBranchIfEqualInstruction(registerName2, registerName3, 'After'));
                break;
            }

            /*
                Convert:
                if (x <= y) {
                   w = w + 50;
                }

                To:
                    bgt $t0, $t1, After # User writes
                    addi $t2, $t2, 50
                After:
            */
            case 1: {
                const operations = [
                    {
                        symbol: '<=',
                        initialInstruction: this._instructionSetSDK.createBranchIfLessInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfGreaterInstruction,
                    },
                    {
                        symbol: '>=',
                        initialInstruction: this._instructionSetSDK.createBranchIfGreaterInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfLessInstruction,
                    },
                ];

                this._utilities.shuffleArray(operations);

                const operation = operations[0];

                code = `if (${variableName2} ${operation.symbol} ${variableName3}) {
    ${variableName1} = ${variableName1} + 50;
}`;
                instructionOptions.push('blt', 'bgt');
                instructions.push(operation.initialInstruction(registerName2, registerName2, 'After'));
                solutionInstructions.push(operation.solutionInstruction(registerName2, registerName3, 'After'));
                break;
            }

            /*
                Convert:
                if (x < y) {
                   w = w + 50;
                }

                To:
                    bge $t0, $t1, After # User writes
                    addi $t2, $t2, 50
                After:
            */
            case 2: { // eslint-disable-line no-magic-numbers
                const operations = [
                    {
                        symbol: '<',
                        initialInstruction: this._instructionSetSDK.createBranchIfLessOrEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfGreaterOrEqualInstruction,
                    },
                    {
                        symbol: '>',
                        initialInstruction: this._instructionSetSDK.createBranchIfGreaterOrEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfLessOrEqualInstruction,
                    },
                ];

                this._utilities.shuffleArray(operations);

                const operation = operations[0];

                code = `if (${variableName2} ${operation.symbol} ${variableName3}) {
    ${variableName1} = ${variableName1} + 50;
}`;
                instructionOptions.push('ble', 'bge');
                instructions.push(operation.initialInstruction(registerName2, registerName2, 'After'));
                solutionInstructions.push(operation.solutionInstruction(registerName2, registerName3, 'After'));
                break;
            }

            /*
                Convert:
                if ((x + y) > z) {
                   w = w + 50;
                }

                To:
                    add $t4, $t0, $t1 # User writes
                    ble $t4, $t2, After # User writes
                    addi $t3, $t3, 50
                After:
            */
            case 3: { // eslint-disable-line no-magic-numbers
                const registerName5 = '$t4';

                usedRegisterNames.push(registerName4);
                usedVariableNames.push(variableName4);
                registerOptions.push(registerName4, registerName5);

                const operations = [
                    {
                        symbol: '<',
                        initialInstruction: this._instructionSetSDK.createBranchIfLessOrEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfGreaterOrEqualInstruction,
                    },
                    {
                        symbol: '>',
                        initialInstruction: this._instructionSetSDK.createBranchIfGreaterOrEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfLessOrEqualInstruction,
                    },
                ];

                this._utilities.shuffleArray(operations);

                const operation = operations[0];

                code = `if ((${variableName2} + ${variableName4}) ${operation.symbol} ${variableName3}) {
    ${variableName1} = ${variableName1} + 50;
}`;
                registers.lookupByRegisterName(registerName4).setValue(7); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName5).setValue(0);
                instructionOptions.push('ble', 'bge', this._getAddOpCode());
                instructions.push(
                    this._makeAddInstruction(registerName2, registerName2, registerName2),
                    operation.initialInstruction(registerName3, registerName3, 'After')
                );
                solutionInstructions.push(
                    this._makeAddInstruction(registerName5, registerName2, registerName4),
                    operation.solutionInstruction(registerName5, registerName3, 'After')
                );
                break;
            }

            /*
                Convert:
                if ((x - y) == (x * z) {
                   w = w + 50;
                }

                To:
                    sub $t4, $t0, $t1 # User writes
                    mul $t5, $t0, $t2 # User writes
                    bne $t4, $t5, After # User writes
                    addi $t3, $t3, 50
                After:
            */
            case 4: { // eslint-disable-line no-magic-numbers
                const registerName5 = '$t4';
                const registerName6 = '$t5';

                usedRegisterNames.push(registerName4);
                usedVariableNames.push(variableName4);
                registerOptions.push(registerName4, registerName5, registerName6);

                const operations = [
                    {
                        symbol: '==',
                        initialInstruction: this._instructionSetSDK.createBranchIfEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfNotEqualInstruction,
                    },
                    {
                        symbol: '!=',
                        initialInstruction: this._instructionSetSDK.createBranchIfNotEqualInstruction,
                        solutionInstruction: this._instructionSetSDK.createBranchIfEqualInstruction,
                    },
                ];

                this._utilities.shuffleArray(operations);

                const operation = operations[0];

                code = `if ((${variableName2} - ${variableName3}) ${operation.symbol} (${variableName2} * ${variableName4})) {
    ${variableName1} = ${variableName1} + 50;
}`;
                registers.lookupByRegisterName(registerName4).setValue(7); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName5).setValue(0);
                registers.lookupByRegisterName(registerName6).setValue(0);
                instructionOptions.push('bne', 'beq', this._getSubtractOpCode(), 'mul');
                instructions.push(
                    operation.initialInstruction(registerName1, registerName1, 'After'),
                    operation.initialInstruction(registerName1, registerName1, 'After'),
                    operation.initialInstruction(registerName1, registerName1, 'After')
                );
                solutionInstructions.push(
                    this._makeSubInstruction(registerName5, registerName2, registerName3),
                    this._makeMulInstruction(registerName6, registerName2, registerName4),
                    operation.solutionInstruction(registerName5, registerName6, 'After')
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        instructions.push(
            this._makeAddImmediateInstruction(registerName1, registerName1, 50) // eslint-disable-line no-magic-numbers
        );
        solutionInstructions.push(
            this._makeAddImmediateInstruction(registerName1, registerName1, 50) // eslint-disable-line no-magic-numbers
        );

        const disabledInstructions = [ instructions.length - 1 ];
        const labels = this._instructionSetSDK.createLabels();

        labels.addLabel('After', instructions.length);

        instructionOptions.sort();
        registerOptions.sort();

        const variableValues = this._makeVariableValues(usedVariableNames, usedRegisterNames);
        const questionStemStart = `Convert the C to assembly. ${variableValues}`;

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, code),
            instructions,
            labels,
            registers,
            this._instructionSetSDK.createMemory(),
            solutionInstructions,
            expectedRegisterNames,

            // expectedMemoryAddresses is not used in this question factory
            [],

            // registerBaseAddresses is not used in this question factory
            [],
            instructionOptions,
            labelOptions,
            registerOptions,
            disabledInstructions
        );
    }

    /**
        Return the correctness of the branch pseudo-instructions opcodes. User-selected instructions should match the expected instructions.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {Object}
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) {
        return this._branchAndJumpInstructionCorrectness(dataOfUserAndExpectedAnswers);
    }
}
