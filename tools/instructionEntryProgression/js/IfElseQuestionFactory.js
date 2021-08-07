'use strict';

/* exported IfElseQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the writing of if, if-else, and else-if statements.
    @class IfElseQuestionFactory
    @extends QuestionFactory
*/
class IfElseQuestionFactory extends QuestionFactory {

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
        const disabledInstructions = [];
        const labelOptions = [];
        const labels = this._instructionSetSDK.createLabels();
        const instructionOptions = [ 'bne', 'beq', this._getAddImmediateOpCode() ];
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();

        switch (levelNumber) {

            /*
                Convert the C to assembly. Assume w, x, and y values are in $t0, $t1, and $t2.
                if (x == y) {
                  w = 50;
                }
                w = w + 1;

                To:
                    bne $t1, $t2, After # User writes
                    addi $t0, $zero, 50 # User writes
                After:
                    addi $t0, $t0, 1 # User writes
            */
            case 0: {
                code = `if (${variableName2} == ${variableName3}) {
    ${variableName1} = 50;
}
${variableName1} = ${variableName1} + 1;`;
                registerOptions.push('$zero');
                registers.lookupByRegisterName('$zero');
                registers.lookupByRegisterName(registerName1).setValue(11); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName2).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName3).setValue(2); // eslint-disable-line no-magic-numbers
                labelOptions.push('After');
                labels.addLabel('After', 2); // eslint-disable-line no-magic-numbers
                disabledInstructions.push(2); // eslint-disable-line no-magic-numbers
                instructions.push(
                    this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'After'),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1)
                );
                solutionInstructions.push(
                    this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName2, registerName3, 'After'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 50), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1)
                );
                break;
            }

            /*
                Convert the C to assembly. Assume w, x, and y values are in $t0, $t1, and $t2.
                if (x == y) {
                   w = 50;
                }
                else {
                   w = 90;
                }
                w = w + 1;

                To:
                    bne $t1, $t2, Else # User writes
                    addi $t0, $zero, 50
                    j After # User writes
                Else:
                    addi $t0, $zero, 90 # User writes
                After:
                    addi $t0, $t0, 1
            */
            case 1:
            case 2: { // eslint-disable-line no-magic-numbers
                code = `if (${variableName2} == ${variableName3}) {
   ${variableName1} = 50;
}
else {
   ${variableName1} = 90;
}
${variableName1} = ${variableName1} + 1;`;
                registerOptions.push('$zero');
                registers.lookupByRegisterName('$zero');
                registers.lookupByRegisterName(registerName1).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName2).setValue(5); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName3).setValue(11); // eslint-disable-line no-magic-numbers
                disabledInstructions.push(1, 4); // eslint-disable-line no-magic-numbers
                labelOptions.push('Else', 'After');
                labels.addLabel('Else', 3); // eslint-disable-line no-magic-numbers
                labels.addLabel('After', 4); // eslint-disable-line no-magic-numbers
                instructionOptions.push('j');

                let firstInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else');
                let secondInstruction = this._instructionSetSDK.createJumpInstruction('Else');

                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    firstInstruction = this._instructionSetSDK.createBranchIfEqualInstruction(registerName1, registerName1, 'Else');
                    secondInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else');
                }

                instructions.push(
                    firstInstruction,
                    this._makeAddImmediateInstruction(registerName1, '$zero', 50), // eslint-disable-line no-magic-numbers
                    secondInstruction,
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1)
                );
                solutionInstructions.push(
                    this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName2, registerName3, 'Else'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 50), // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createJumpInstruction('After'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 90), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1)
                );
                break;
            }

            /*
                Convert C to assembly. Assume w, x, y, and z values are in $t0, $t1, $t2, and $t3.
                if (x == y) {
                   w = w + 50;
                }
                else if (x == z) {
                   w = w + 60;
                }
                else {
                   w = w + 70;
                }

                To:
                    bne $t1, $t2, Else1 # User writes
                    addi $t0, $t0, 50
                    j After # User writes
                Else1:
                    bne $t1, $t3, Else2 # User writes
                    addi $t0, $t0, 60
                    j After # User writes
                Else2:
                    addi $t0, $t0, 70
                After:
            */
            case 3: // eslint-disable-line no-magic-numbers
            case 4: { // eslint-disable-line no-magic-numbers
                usedRegisterNames.push(registerName4);
                usedVariableNames.push(variableName4);
                registerOptions.push(registerName4);
                registers.lookupByRegisterName(registerName1).setValue(0); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName2).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName3).setValue(5); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerName4).setValue(2); // eslint-disable-line no-magic-numbers
                code = `if (${variableName2} == ${variableName3}) {
   ${variableName1} = ${variableName1} + 50;
}
else if (${variableName2} == ${variableName4}) {
   ${variableName1} = ${variableName1} + 60;
}
else {
   ${variableName1} = ${variableName1} + 70;
}`;
                disabledInstructions.push(1, 4, 6); // eslint-disable-line no-magic-numbers
                labelOptions.push('Else1', 'Else2', 'After');
                labels.addLabel('Else1', 3); // eslint-disable-line no-magic-numbers
                labels.addLabel('Else2', 6); // eslint-disable-line no-magic-numbers
                labels.addLabel('After', 7); // eslint-disable-line no-magic-numbers
                instructionOptions.push('j');

                let firstInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else1');
                let secondInstruction = this._instructionSetSDK.createJumpInstruction('Else1');
                let thirdInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else1');
                let fourthInstruction = this._instructionSetSDK.createJumpInstruction('Else1');

                if (levelNumber === 4) { // eslint-disable-line no-magic-numbers
                    firstInstruction = this._instructionSetSDK.createJumpInstruction('Else1');
                    secondInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else1');
                    thirdInstruction = this._instructionSetSDK.createBranchIfEqualInstruction(registerName1, registerName1, 'Else1');
                    fourthInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName1, registerName1, 'Else1');
                }

                instructions.push(
                    firstInstruction,
                    this._makeAddImmediateInstruction(registerName1, '$zero', 50), // eslint-disable-line no-magic-numbers
                    secondInstruction,
                    thirdInstruction,
                    this._makeAddImmediateInstruction(registerName1, '$zero', 60), // eslint-disable-line no-magic-numbers
                    fourthInstruction,
                    this._makeAddImmediateInstruction(registerName1, '$zero', 70) // eslint-disable-line no-magic-numbers
                );
                solutionInstructions.push(
                    this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName2, registerName3, 'Else1'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 50), // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createJumpInstruction('After'),
                    this._instructionSetSDK.createBranchIfNotEqualInstruction(registerName2, registerName4, 'Else2'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 60), // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createJumpInstruction('After'),
                    this._makeAddImmediateInstruction(registerName1, '$zero', 70) // eslint-disable-line no-magic-numbers
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

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
        Return the correctness of the conditional opcodes. User-selected instructions should match
        the expected instructions.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Correctness of the user's instructions.
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) {
        return this._branchIfEqualBranchIfNotEqualJumpInstructionCorrectness(dataOfUserAndExpectedAnswers);
    }
}
