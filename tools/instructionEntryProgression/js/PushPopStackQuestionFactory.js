'use strict';

/* exported PushPopStackQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the push and pop to stack when calling subroutines.
    @class PushPopStackQuestionFactory
    @extends QuestionFactory
*/
class PushPopStackQuestionFactory extends QuestionFactory {

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
        let questionStem = '';
        const instructions = this._instructionSetSDK.createInstructions();
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const labels = this._instructionSetSDK.createLabels();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const stackRegister = '$sp';
        const expectedRegisterNames = [ stackRegister ];
        const expectedMemoryAddresses = [];
        const instructionOptions = [];
        const registerOptions = [];
        const disabledInstructions = [];
        const registerBaseAddresses = [ stackRegister ];
        const stackChangeAmount = 4;
        const stackIncrement = stackChangeAmount;
        const stackDecrement = -1 * stackChangeAmount;
        const newline = this._utilities.getNewline();

        const stackPointValue = registers.lookupByRegisterName(stackRegister).getSignedValue();

        memory.lookupWord(stackPointValue).setValue(0);

        switch (levelNumber) {

            /*
                Push $t0 to the stack. Update $sp appropriately. Ex:
                addi $sp, $sp, -4
                sw $t0, 0($sp)
            */
            case 0: {
                const registerName = this._chooseNRegisterNames(1)[0];
                const registerValue = this._makeNSmallIntegers(1)[0];

                questionStem = `Push ${registerName} to the stack. Update ${stackRegister} appropriately.`;
                registers.lookupByRegisterName(registerName).setValue(registerValue);
                registerOptions.push(registerName, stackRegister);

                const topOfStack = stackPointValue + stackDecrement;

                memory.lookupWord(topOfStack).setValue(0);
                expectedMemoryAddresses.push(topOfStack);

                instructionOptions.push(this._getAddImmediateOpCode(), this._getStoreRegisterOpCode());

                instructions.push(
                    this._makeAddImmediateInstruction(registerName, registerName, 0),
                    this._makeAddImmediateInstruction(registerName, registerName, 0)
                );

                solutionInstructions.push(
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackDecrement),
                    this._makeStoreRegisterNoOffsetInstruction(registerName, stackRegister)
                );
                break;
            }

            /*
                Pop from stack to $t1. Update $sp appropriately. Ex:
                lw $t1, 0($sp)
                addi $sp, $sp, 4
            */
            case 1: {
                const registerName = this._chooseNRegisterNames(1)[0];
                const memoryValue = this._makeNSmallIntegers(1)[0];

                questionStem = `Pop from stack to ${registerName}. Update ${stackRegister} appropriately.`;
                registers.lookupByRegisterName(registerName).setValue(0);

                registerOptions.push(registerName, stackRegister);
                expectedRegisterNames.push(registerName);

                const stackPointerInitialValue = stackPointValue + stackDecrement;

                registers.lookupByRegisterName(stackRegister).setValue(stackPointerInitialValue);
                memory.lookupWord(stackPointerInitialValue).setValue(memoryValue);

                instructionOptions.push(this._getAddImmediateOpCode(), this._getLoadRegisterOpCode());

                instructions.push(
                    this._makeAddImmediateInstruction(registerName, registerName, 0),
                    this._makeAddImmediateInstruction(registerName, registerName, 0)
                );

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName, stackRegister),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackIncrement)
                );
                break;
            }

            /*
                Push argument $t0 to the stack, then make space for 1 returned value. Update $sp appropriately. Ex:
                addi $sp, $sp, -4
                sw $t0, 0($sp)
                addi $sp, $sp, -4
                # Subroutine call
            */
            case 2: { // eslint-disable-line no-magic-numbers
                const registerName = this._chooseNRegisterNames(1)[0];
                const registerValue = this._makeNSmallIntegers(1)[0];

                questionStem = `Push argument ${registerName} to the stack, then make space for a return value.${newline}
Update ${stackRegister} appropriately.`;
                registers.lookupByRegisterName(registerName).setValue(registerValue);

                registerOptions.push(registerName, stackRegister);

                const topOfStack = stackPointValue + stackDecrement;

                memory.lookupWord(topOfStack).setValue(0);
                expectedMemoryAddresses.push(topOfStack);

                instructionOptions.push(this._getAddImmediateOpCode(), this._getStoreRegisterOpCode());

                instructions.push(
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0)
                );

                solutionInstructions.push(
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackDecrement),
                    this._makeStoreRegisterNoOffsetInstruction(registerName, stackRegister),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackDecrement)
                );
                break;
            }

            /*
                Pop returned value to $t1, then remove space for argument on stack. Update $sp appropriately. Ex:
                # Subroutine call
                lw $t1, 0($sp)
                addi $sp, $sp, 4
                addi $sp, $sp, 4
            */
            case 3: { // eslint-disable-line no-magic-numbers
                const registerName = this._chooseNRegisterNames(1)[0];
                const memoryValue = this._makeNSmallIntegers(1)[0];

                questionStem = `Pop the return value to ${registerName}, then remove space for argument on stack.${newline}
Update ${stackRegister} appropriately.`;
                registers.lookupByRegisterName(registerName).setValue(0);

                registerOptions.push(registerName, stackRegister);
                expectedRegisterNames.push(registerName);

                const stackPointerInitialValue = stackPointValue + stackDecrement + stackDecrement;

                registers.lookupByRegisterName(stackRegister).setValue(stackPointerInitialValue);
                memory.lookupWord(stackPointerInitialValue).setValue(memoryValue);

                instructionOptions.push(this._getAddImmediateOpCode(), this._getLoadRegisterOpCode());

                instructions.push(
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, 0)
                );

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName, stackRegister),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackIncrement),
                    this._makeAddImmediateInstruction(stackRegister, stackRegister, stackIncrement)
                );
                break;
            }

            /*
                Load argument from stack to $t1. Then, copy return value $t2 to stack. Ex:
                # Rest of program.
                MonthlySalary:
                     lw $t1, 4($sp) # User fills this in
                     addi $t2, $zero, 172
                     mul $t2, $t1, $t2
                     sw $t2, 0($sp) # User fills this in
                     jr $ra
            */
            case 4: { // eslint-disable-line no-magic-numbers
                const numberOfRegisters = 2;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);
                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];

                questionStem = `Load argument from stack to ${registerName1}. Then, copy return value ${registerName2} to stack.`;

                registerOptions.push(registerName1, registerName2, stackRegister, '$zero', '$ra');
                expectedRegisterNames.push(registerName1, registerName2);
                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(0);
                registers.lookupByRegisterName('$zero');

                const stackPointerRegister = registers.lookupByRegisterName(stackRegister);
                const numberOfDecrements = 2;
                const stackPointerInitialValue = stackPointerRegister.getSignedValue() + (numberOfDecrements * stackDecrement);

                stackPointerRegister.setValue(stackPointerInitialValue);

                const memoryValue = this._makeNSmallIntegers(1)[0];

                memory.lookupWord(stackPointerInitialValue).setValue(0);
                memory.lookupWord(stackPointerInitialValue + stackIncrement).setValue(memoryValue);
                expectedMemoryAddresses.push(stackPointerInitialValue, stackPointerInitialValue + stackIncrement);

                instructionOptions.push(
                    this._getLoadRegisterOpCode(),
                    this._getStoreRegisterOpCode(),
                    this._getAddImmediateOpCode(),
                    'mul',
                    'jr'
                );

                const labelName = 'MonthlySalary';

                labels.addLabel(labelName, 0);

                disabledInstructions.push(1, 2, 4); // eslint-disable-line no-magic-numbers

                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(stackRegister, stackRegister),
                    this._makeAddImmediateInstruction(registerName2, '$zero', 172), // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createMulInstruction(registerName2, registerName1, registerName2),
                    this._makeLoadRegisterNoOffsetInstruction(stackRegister, stackRegister),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createLoadWordInstruction(registerName1, stackIncrement, stackRegister),
                    this._makeAddImmediateInstruction(registerName2, '$zero', 172), // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createMulInstruction(registerName2, registerName1, registerName2),
                    this._makeStoreRegisterNoOffsetInstruction(registerName2, stackRegister),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );

                const bytesPerRegister = 4;
                const instructionAddressBeyondProgram = (instructions.length + 1) * bytesPerRegister;

                registers.lookupByRegisterName('$ra').setValue(instructionAddressBeyondProgram);
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        return new Question(
            questionStem,
            instructions,
            labels,
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
            disabledInstructions
        );
    }
}
