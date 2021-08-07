'use strict';

/* exported FunctionsQuestionFactory */
/* global QuestionFactory, Question, QuestionFeedback */

/**
    Generate questions to test converting C functions to assembly.
    @class FunctionsQuestionFactory
    @extends QuestionFactory
*/
class FunctionsQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 2;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {
        let questionStemStart = '';
        let code = '';
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const labels = this._instructionSetSDK.createLabels();
        const expectedRegisterNames = [];
        const expectedMemoryAddresses = [];
        const registerOptions = [ '$t0', '$t1', '$t2', '$t3', '$zero', '$ra' ];
        const disabledInstructions = [];
        const instructionOptions = [ this._getAddImmediateOpCode(), this._getAddOpCode(), 'jr' ];
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();

        labels.addLabel('CalcFunc', 0);
        registers.lookupByRegisterName('$t2');
        registers.lookupByRegisterName('$t3');
        registers.lookupByRegisterName('$zero');

        // Randomize the arithmetic operation in the function.
        const arithmeticOperations = [
            {
                symbol: '*',
                opcode: 'mul',
                instruction: this._makeMulInstruction,
            },
            {
                symbol: '-',
                opcode: 'sub',
                instruction: this._makeSubInstruction,
            },
        ];

        this._utilities.shuffleArray(arithmeticOperations);

        const arithmeticOperation = arithmeticOperations[0];

        instructionOptions.push(arithmeticOperation.opcode);

        // Randomize the arithmetic expression ordering.
        const arithmeticSubExpressions = [ `(aVal ${arithmeticOperation.symbol} 4)`, 'bVal' ];

        this._utilities.shuffleArray(arithmeticSubExpressions);

        const subExpression1 = arithmeticSubExpressions[0];
        const subExpression2 = arithmeticSubExpressions[1];
        const expression = `${subExpression1} + ${subExpression2}`;
        const instruction1 = arithmeticOperation.instruction.call(this, '$t2', '$t0', '$t3');
        const instruction2 = this._makeAddInstruction('$t2', '$t2', '$t1');

        switch (levelNumber) {

            /*
                Convert the C to assembly. Assume first parameter is in $t0, second parameter is in $t1, and return value is in $t2.
                int CalcFunc(int aVal, int bVal) {
                   return (aVal * 4) + bVal;
                }

                CalcFunc:
                    addi $t3, $zero, 4
                    mul $t2, $t0, $t3 # User write
                    add $t2, $t2, $t1 # User write
                    jr $ra # User write
            */
            case 0: {
                questionStemStart = 'Convert the C to assembly. Assume first parameter is in $t0, second parameter is in $t1, and return value is in $t2.'; // eslint-disable-line max-len
                code = `int CalcFunc(int aVal, int bVal) {
    return ${expression};
}`;
                registers.lookupByRegisterName('$t0').setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName('$t1').setValue(3); // eslint-disable-line no-magic-numbers
                expectedRegisterNames.push('$t2');
                disabledInstructions.push(0);
                instructions.push(
                    this._makeAddImmediateInstruction('$t3', '$zero', 4), // eslint-disable-line no-magic-numbers
                    this._makeAddInstruction('$t2', '$t2', '$t2'),
                    this._makeAddInstruction('$t2', '$t2', '$t2'),
                    this._makeAddInstruction('$t2', '$t2', '$t2')
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction('$t3', '$zero', 4), // eslint-disable-line no-magic-numbers
                    instruction1,
                    instruction2,
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );
                break;
            }

            /*
                Convert the C to assembly using the program stack.
                int CalcFunc(int aVal, int bVal) {
                   return (aVal * 4) + bVal;
                }

                CalcFunc:
                    lw $t0, 8($sp) # User write
                    lw $t1, 4($sp) # User write
                    addi $t3, $zero, 4
                    mul $t2, $t0, $t3 # User write
                    add $t2, $t2, $t1 # User write
                    sw $t2, 0($sp) # User write
                    jr $ra
            */
            case 1: {
                questionStemStart = 'Convert the C to assembly using the program stack.';
                code = `int CalcFunc(int aVal, int bVal) {
    return ${expression};
}`;
                registers.lookupByRegisterName('$t0');
                registers.lookupByRegisterName('$t1');
                registerOptions.push('$sp');
                disabledInstructions.push(2, 6); // eslint-disable-line no-magic-numbers
                instructionOptions.push(this._getLoadRegisterOpCode(), this._getStoreRegisterOpCode());

                // Build initial value for stack pointer with room for 3 items.
                const stackRegister = '$sp';
                const stackPointValue = registers.lookupByRegisterName(stackRegister).getSignedValue();
                const stackIncrement = 4;
                const stackDecrement = -1 * stackIncrement;
                const itemsOnStack = 3;
                const stackPointerInitialValue = stackPointValue + (itemsOnStack * stackDecrement);

                // Initialize stack pointer.
                registers.lookupByRegisterName(stackRegister).setValue(stackPointerInitialValue);

                // Initialize stack values.
                memory.lookupWord(stackPointerInitialValue); // eslint-disable-line no-magic-numbers
                memory.lookupWord(stackPointerInitialValue + stackIncrement).setValue(2); // eslint-disable-line no-magic-numbers
                memory.lookupWord(stackPointerInitialValue + stackIncrement + stackIncrement).setValue(3); // eslint-disable-line no-magic-numbers

                // Return value should match expected value.
                expectedMemoryAddresses.push(stackPointerInitialValue);

                // Build instructions.
                instructions.push(
                    this._instructionSetSDK.createLoadWordInstruction('$t0', 0, '$sp'),
                    this._instructionSetSDK.createLoadWordInstruction('$t1', 0, '$sp'),
                    this._makeAddImmediateInstruction('$t3', '$zero', 4), // eslint-disable-line no-magic-numbers
                    this._makeAddInstruction('$t2', '$t2', '$t2'),
                    this._makeAddInstruction('$t2', '$t2', '$t2'),
                    this._instructionSetSDK.createLoadWordInstruction('$t2', 0, '$sp'),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );
                solutionInstructions.push(
                    this._instructionSetSDK.createLoadWordInstruction('$t0', stackIncrement + stackIncrement, '$sp'),
                    this._instructionSetSDK.createLoadWordInstruction('$t1', stackIncrement, '$sp'),
                    this._makeAddImmediateInstruction('$t3', '$zero', 4), // eslint-disable-line no-magic-numbers
                    instruction1,
                    instruction2,
                    this._instructionSetSDK.createStoreWordInstruction('$t2', 0, '$sp'),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        // Jump well-beyond the last instructions.
        const bigJump = 160;

        registers.lookupByRegisterName('$ra').setValue(bigJump);

        instructionOptions.sort();
        registerOptions.sort();

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, code),
            instructions,
            labels,
            registers,
            memory,
            solutionInstructions,
            expectedRegisterNames,
            expectedMemoryAddresses,

            // registerBaseAddresses not used
            [],
            instructionOptions,

            // labelOptions not used
            [],
            registerOptions,
            disabledInstructions
        );
    }

    /**
        Make sure the last instruction is a jump-register with the $ra register.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @param {Instructions} dataOfUserAndExpectedAnswers.userInstructions The user's selected instructions.
        @return {QuestionFeedback} Feedback on the user's answer.
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) {
        const userInstructions = dataOfUserAndExpectedAnswers.userInstructions;
        const lastInstruction = userInstructions[userInstructions.length - 1];
        let feedback = null;

        // Mark as wrong if the opcode is wrong.
        if (lastInstruction.opcode !== 'jr') {
            feedback = new QuestionFeedback(false, 'The last instruction should be jr.');
        }

        // Mark as wrong if the register is incorrect.
        else if (lastInstruction.getPropertyByIndex(0) !== '$ra') {
            feedback = new QuestionFeedback(false, 'The last instruction has the wrong register.');
        }

        return feedback || this._defaultFeedback;
    }
}
