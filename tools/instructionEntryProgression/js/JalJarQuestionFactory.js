'use strict';

/* exported JalJrQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions testing the jal and jr instructions.
    @class JalJrQuestionFactory
    @extends QuestionFactory
*/
class JalJrQuestionFactory extends QuestionFactory {

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
        let questionStem = '';
        const instructions = this._instructionSetSDK.createInstructions();
        const labels = this._instructionSetSDK.createLabels();
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const memoryName = this.getMemoryNameForQuestionStem();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedRegisterNames = [];
        const expectedMemoryAddresses = [];
        const instructionOptions = [];
        const registerOptions = [];
        const disabledInstructions = [];
        const labelOptions = [];
        const registerBaseAddresses = [];
        const newline = this._utilities.getNewline();

        switch (levelNumber) {

            /*
                Use lw, jal, sw, and j instructions. Pass M[$t2] to YearlySalary, store result in M[$t3].
                $t0 is subroutine argument.
                $t1 is subroutine return value.

                lw $t0, 0($t2)
                jal YearlySalary
                sw $t1, 0($t3)
                j Done

                YearlySalary:
                   addi $t1, $zero, 2000
                   mul $t1, $t0, $t1
                   jr $ra

                Done:
            */
            case 0: {
                const numberOfRegisters = 4;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);
                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const registerName3 = registerNames[2];
                const registerName4 = registerNames[3];
                const wordAddress1 = 5000;
                const wordAddress2 = 5004;
                const salaryPeriods = [
                    {
                        label: 'YearlySalary',
                        immediate: 2000,
                    },
                    {
                        label: 'MonthlySalary',
                        immediate: 172,
                    },
                    {
                        label: 'WeeklySalary',
                        immediate: 40,
                    },
                ];
                const salaryPeriod = this._utilities.pickElementFromArray(salaryPeriods);
                const label = salaryPeriod.label;
                const immediate = salaryPeriod.immediate;

                /* eslint-disable */
                questionStem = `Pass ${memoryName}[${registerName3}] to the ${label} subroutine, and store the return value to ${memoryName}[${registerName4}].
${newline}${registerName1} is the subroutine argument.
${newline}${registerName2} is the subroutine return value.`;
                /* eslint-enable */

                instructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1),
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1),
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1),
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName1),
                    this._makeAddImmediateInstruction(registerName2, '$zero', immediate),
                    this._instructionSetSDK.createMulInstruction(registerName2, registerName1, registerName2),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );

                disabledInstructions.push(4, 5, 6); // eslint-disable-line no-magic-numbers

                labels.addLabel('Done', 7); // eslint-disable-line no-magic-numbers
                labels.addLabel(label, 4); // eslint-disable-line no-magic-numbers

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(0);
                registers.lookupByRegisterName(registerName3).setValue(wordAddress1);
                registers.lookupByRegisterName(registerName4).setValue(wordAddress2);
                registerBaseAddresses.push(wordAddress1, wordAddress2);

                memory.lookupWord(wordAddress1).setValue(15); // eslint-disable-line no-magic-numbers
                memory.lookupWord(wordAddress2).setValue(0);

                solutionInstructions.push(
                    this._makeLoadRegisterNoOffsetInstruction(registerName1, registerName3),
                    this._instructionSetSDK.createJumpAndLinkInstruction(label),
                    this._makeStoreRegisterNoOffsetInstruction(registerName2, registerName4),
                    this._instructionSetSDK.createJumpInstruction('Done'),
                    this._makeAddImmediateInstruction(registerName2, '$zero', immediate),
                    this._instructionSetSDK.createMulInstruction(registerName2, registerName1, registerName2),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );

                expectedMemoryAddresses.push(wordAddress2);
                instructionOptions.push(
                    this._getLoadRegisterOpCode(), 'jal', this._getStoreRegisterOpCode(), 'j', this._getAddImmediateOpCode(), 'mul', 'jr'
                );
                labelOptions.push('Done', label);
                registerOptions.push('$zero', registerName1, registerName2, registerName3, registerName4, '$ra');
                break;
            }

            /*
                Use YValue label, along with mul, addi, and jar instructions. Write YValue subroutine: y = x^2 + 5.
                $t0 is subroutine argument, x
                $t1 is subroutine return value, y

                addi $t0, $zero, 3
                jal YValue
                j Done

                YValue:
                   mul $t1, $t0, $t0
                   addi $t1, $t1, 5
                   jr $ra

                Done:
            */
            case 1: {
                const numberOfRegisters = 4;
                const registerNames = this._chooseNRegisterNames(numberOfRegisters);
                const registerName1 = registerNames[0];
                const registerName2 = registerNames[1];
                const immediate = this._makeNSmallIntegers(1)[0];

                questionStem = `Write the YValue subroutine to compute y = x<sup>2</sup> + ${immediate}.
${newline}${registerName1} is the subroutine argument x.
${newline}${registerName2} is the subroutine return value y.`;

                instructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', 3),  // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createJumpAndLinkInstruction('YValue'),
                    this._instructionSetSDK.createJumpInstruction('Done'),
                    this._instructionSetSDK.createMulInstruction(registerName1, registerName1, registerName1),
                    this._instructionSetSDK.createMulInstruction(registerName1, registerName1, registerName1),
                    this._instructionSetSDK.createMulInstruction(registerName1, registerName1, registerName1)
                );

                disabledInstructions.push(0, 1, 2); // eslint-disable-line no-magic-numbers

                labels.addLabel('Done', 6); // eslint-disable-line no-magic-numbers
                labels.addLabel('YValue', 3); // eslint-disable-line no-magic-numbers

                registers.lookupByRegisterName(registerName1).setValue(0);
                registers.lookupByRegisterName(registerName2).setValue(0);
                expectedRegisterNames.push(registerName2);

                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerName1, '$zero', 3),  // eslint-disable-line no-magic-numbers
                    this._instructionSetSDK.createJumpAndLinkInstruction('YValue'),
                    this._instructionSetSDK.createJumpInstruction('Done'),
                    this._instructionSetSDK.createMulInstruction(registerName2, registerName1, registerName1),
                    this._makeAddImmediateInstruction(registerName2, registerName2, immediate),
                    this._instructionSetSDK.createJumpRegisterInstruction('$ra')
                );

                instructionOptions.push('mul', this._getAddImmediateOpCode(), 'jr', 'jal', 'j');
                labelOptions.push('Done', 'YValue');
                registerOptions.push('$zero', registerName1, registerName2, '$ra');
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
            labelOptions,
            registerOptions,
            disabledInstructions,
            this.useTextNotInput
        );
    }
}
