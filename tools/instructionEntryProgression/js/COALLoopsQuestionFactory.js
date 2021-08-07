'use strict';

/* exported COALLoopsQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the writing of loops.
    @class COALLoopsQuestionFactory
    @extends QuestionFactory
*/
class COALLoopsQuestionFactory extends QuestionFactory {

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

        // Build variable names and associated register names. Randomize the selection of variable/register names.
        const variables = [
            { name: 'w', registerName: '$t0' },
            { name: 'x', registerName: '$t1' },
            { name: 'y', registerName: '$t2' },
        ];

        this._utilities.shuffleArray(variables);

        const variableName1 = variables[0].name;
        const variableName2 = variables[1].name;
        const variableName3 = variables[2].name;
        const registerName1 = variables[0].registerName;
        const registerName2 = variables[1].registerName;
        const registerName3 = variables[2].registerName;

        const expectedRegisterNames = [ registerName1 ];
        const usedVariableNames = variables.map(variable => variable.name);
        const usedRegisterNames = variables.map(variable => variable.registerName);
        const registers = this._instructionSetSDK.createRegisters();
        const registerOptions = usedRegisterNames.slice();

        registers.lookupByRegisterName(registerName1).setValue(11); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName2).setValue(9); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName3).setValue(5); // eslint-disable-line no-magic-numbers

        // Level 2 and 3 increment, instead of decrement, so values should be inverted.
        if ((levelNumber === 1) || (levelNumber === 2)) { // eslint-disable-line no-magic-numbers
            registers.lookupByRegisterName(registerName2).setValue(5); // eslint-disable-line no-magic-numbers
            registers.lookupByRegisterName(registerName3).setValue(9); // eslint-disable-line no-magic-numbers
        }

        // Level 4 needs to count down from 0. registerName3 stores what is counted down to, so needs to be negative.
        else if (levelNumber === 3) { // eslint-disable-line no-magic-numbers
            registers.lookupByRegisterName(registerName3).setValue(-5); // eslint-disable-line no-magic-numbers
        }

        const labelOptions = [ 'While', 'After' ];
        const instructionOptions = [ this._getAddImmediateOpCode(), 'j' ];
        const disabledInstructions = [];
        let code = '';
        const labels = this._instructionSetSDK.createLabels();
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();

        switch (levelNumber) {

            /*
                Convert:
                while (x != y) {
                   w = w + 50;
                   x = x - 1;
                }
                w = w + 10;

                To:
                While:
                    beq $t1, $t2, After # User writes
                    addi $t0, $t0, 50
                    addi $t1, $t1, -1 # User writes
                    j While # User writes
                After:
                    addi $t0, $t0, 10
            */
            case 0:

            // Same as level 1 but with incrementing: x = x + 1
            case 1: {
                const condition = (levelNumber === 0) ? this._makeDecrementingLoopCondition() : this._makeIncrementingLoopCondition();
                const signOperation = (levelNumber === 0) ? '-' : '+';
                const incrementValue = (levelNumber === 0) ? -1 : 1;

                code = `while (${variableName2} ${condition.symbol} ${variableName3}) {
   ${variableName1} = ${variableName1} + 50;
   ${variableName2} = ${variableName2} ${signOperation} 1;
}
${variableName1} = ${variableName1} + 10;`;
                instructionOptions.push(...condition.opcodes);
                disabledInstructions.push(1, 4); // eslint-disable-line no-magic-numbers
                labels.addLabel('While', 0);
                labels.addLabel('After', 4); // eslint-disable-line no-magic-numbers
                instructions.push(
                    this._instructionSetSDK.createJumpInstruction('While'),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 50), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, 0),
                    this._instructionSetSDK.createJumpInstruction('After'),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 10) // eslint-disable-line no-magic-numbers
                );
                solutionInstructions.push(
                    condition.instruction(registerName2, registerName3, 'After'),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 50), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName2, registerName2, incrementValue),
                    this._instructionSetSDK.createJumpInstruction('While'),
                    this._makeAddImmediateInstruction(registerName1, registerName1, 10) // eslint-disable-line no-magic-numbers
                );
                break;
            }

            /*
                Convert:
                for (i = 0;  i < x;  i = i + 1) {
                    w = w + 50;
                }

                To:
                    addi $t0, $zero, 0 # User writes
                While:
                    bge  $t0, $t2, After # User writes
                    addi $t1, $t1, 50
                    addi $t0, $t0, 1 # User writes
                    j While # User writes
                After:
            */
            case 2: // eslint-disable-line no-magic-numbers

            // Same as level 3 but with: i = i - 1
            case 3: { // eslint-disable-line no-magic-numbers
                const condition = (levelNumber === 2) ? this._makeIncrementingLoopCondition() : this._makeDecrementingLoopCondition(); // eslint-disable-line no-magic-numbers
                const signOperation = (levelNumber === 2) ? '+' : '-'; // eslint-disable-line no-magic-numbers
                const incrementValue = (levelNumber === 2) ? 1 : -1; // eslint-disable-line no-magic-numbers
                const conditionalExpression = `${variableName1} ${condition.symbol} ${variableName3};`;

                code = `for (${variableName1} = 0; ${conditionalExpression} ${variableName1} = ${variableName1} ${signOperation} 1) {
    ${variableName2} = ${variableName2} + 50;
}`;
                expectedRegisterNames.push(registerName3);
                registerOptions.push('$zero');
                registers.lookupByRegisterName('$zero');
                instructionOptions.push(...condition.opcodes);
                disabledInstructions.push(2); // eslint-disable-line no-magic-numbers
                labels.addLabel('While', 1);
                labels.addLabel('After', 5); // eslint-disable-line no-magic-numbers
                instructions.push(
                    this._makeAddImmediateInstruction(registerName1, registerName1, 1),
                    this._instructionSetSDK.createJumpInstruction('While'),
                    this._makeAddImmediateInstruction(registerName2, registerName2, 50), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, 0),
                    condition.instruction(registerName1, registerName1, 'While')
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', 0),
                    condition.instruction(registerName1, registerName3, 'After'),
                    this._makeAddImmediateInstruction(registerName2, registerName2, 50), // eslint-disable-line no-magic-numbers
                    this._makeAddImmediateInstruction(registerName1, registerName1, incrementValue),
                    this._instructionSetSDK.createJumpInstruction('While')
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

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

    /**
        Make and randomly choose a condition for a loop that has a decrementing counter. Ex: !=, >=, or >
        @method _makeDecrementingLoopCondition
        @private
        @return {Object} Condition storing a symbol (ex: !=), the associated instruction, and opcodes for instruction options.
    */
    _makeDecrementingLoopCondition() {
        const conditions = [
            {
                symbol: '!=',
                opcodes: [ 'beq', 'bne' ],
                instruction: this._instructionSetSDK.createBranchIfEqualInstruction,
            },
            {
                symbol: '>=',
                opcodes: [ 'bge', 'blt' ],
                instruction: this._instructionSetSDK.createBranchIfLessInstruction,
            },
            {
                symbol: '>',
                opcodes: [ 'bgt', 'ble' ],
                instruction: this._instructionSetSDK.createBranchIfLessOrEqualInstruction,
            },
        ];

        this._utilities.shuffleArray(conditions);
        return conditions[0];
    }

    /**
        Make and randomly choose a condition for a loop that has an incrementing counter. Ex: <= or <
        @method _makeIncrementingLoopCondition
        @private
        @return {Object} Condition storing a symbol (ex: !=), the associated instruction, and opcodes for instruction options.
    */
    _makeIncrementingLoopCondition() {
        const conditions = [
            {
                symbol: '<=',
                opcodes: [ 'ble', 'bgt' ],
                instruction: this._instructionSetSDK.createBranchIfGreaterInstruction,
            },
            {
                symbol: '<',
                opcodes: [ 'blt', 'bge' ],
                instruction: this._instructionSetSDK.createBranchIfGreaterOrEqualInstruction,
            },
        ];

        this._utilities.shuffleArray(conditions);
        return conditions[0];
    }
}
