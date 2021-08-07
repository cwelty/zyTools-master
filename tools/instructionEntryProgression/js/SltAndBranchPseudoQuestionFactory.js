'use strict';

/* exported SltAndBranchPseudoQuestionFactory */
/* global QuestionFactory, Question, QuestionFeedback */

/**
    Generate questions testing the slt instruction and branch pseudoinstructions.
    @class SltAndBranchPseudoQuestionFactory
    @extends QuestionFactory
*/
class SltAndBranchPseudoQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 3;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) { // eslint-disable-line complexity
        let questionStem = '';
        const instructions = this._instructionSetSDK.createInstructions();
        const labels = this._instructionSetSDK.createLabels();
        const registers = this._instructionSetSDK.createRegisters();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedRegisterNames = [];
        const instructionOptions = [];
        const registerOptions = [];
        const disabledInstructions = [];
        const labelOptions = [];

        const numberOfRegisters = 3;
        const registerNames = this._chooseNRegisterNames(numberOfRegisters);
        const registerName1 = registerNames[0];
        const registerName2 = registerNames[1];
        const registerName3 = registerNames[2];

        labelOptions.push('L1');
        labels.addLabel('L1', 3); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName1).setValue(1);
        registers.lookupByRegisterName(registerName2).setValue(2); // eslint-disable-line no-magic-numbers
        registers.lookupByRegisterName(registerName3).setValue(5); // eslint-disable-line no-magic-numbers

        switch (levelNumber) {

            /*
                Implement blt to branch when $t0 < $t1. Ex:
                    slt $at, $t0, $t1 # This is editable
                    bne $at, $zero, L1
                    add $t2, $t2, $t2
                L1:
            */
            case 0:

            /*
                Implement ble to branch when $t0 <= $t1. Ex:
                    slt $at, $t1, $t0 # This is editable
                    beq $at, $zero, L1 # This is editable
                    add $t2, $t2, $t2
                L1:
            */
            case 1: {
                let opcode = '';
                let symbol = '';
                let secondInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction('$at', '$zero', 'L1');
                let secondSolutionInstruction = this._instructionSetSDK.createBranchIfNotEqualInstruction('$at', '$zero', 'L1');
                let firstSolutionRegister = '';
                let secondSolutionRegister = '';

                // Level 1 tests the blt and bgt instructions.
                if (levelNumber === 0) {
                    const useBlt = this._utilities.flipCoin();

                    opcode = useBlt ? 'blt' : 'bgt';
                    symbol = useBlt ? '<' : '>';
                    firstSolutionRegister = useBlt ? registerName1 : registerName2;
                    secondSolutionRegister = useBlt ? registerName2 : registerName1;

                    instructionOptions.push('slt', 'bne', this._getAddOpCode());
                    disabledInstructions.push(1);
                }

                // Level 2 tests the bge and ble instructions.
                else {
                    const useBge = this._utilities.flipCoin();

                    opcode = useBge ? 'bge' : 'ble';
                    symbol = useBge ? '>=' : '<=';
                    firstSolutionRegister = useBge ? registerName1 : registerName2;
                    secondSolutionRegister = useBge ? registerName2 : registerName1;

                    instructionOptions.push('slt', 'beq', this._getAddOpCode());
                    secondInstruction = this._instructionSetSDK.createSetOnLessThanInstruction(registerName1, registerName1, registerName1);
                    secondSolutionInstruction = this._instructionSetSDK.createBranchIfEqualInstruction('$at', '$zero', 'L1');
                }

                disabledInstructions.push(2); // eslint-disable-line no-magic-numbers

                questionStem = `Implement ${opcode} to branch when ${registerName1} ${symbol} ${registerName2}.`;

                expectedRegisterNames.push(registerName3, '$at');
                registerOptions.push(registerName1, registerName2, '$at', registerName3, '$zero');

                instructions.push(
                    this._instructionSetSDK.createSetOnLessThanInstruction(registerName1, registerName1, registerName1),
                    secondInstruction,
                    this._instructionSetSDK.createAddInstruction(registerName3, registerName3, registerName3)
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createSetOnLessThanInstruction('$at', firstSolutionRegister, secondSolutionRegister),
                    secondSolutionInstruction,
                    this._instructionSetSDK.createAddInstruction(registerName3, registerName3, registerName3)
                );
                break;
            }

            /*
                Convert comments to instructions:
                # branch if $t0 >= $t1 to L1
                $t2 = $t2 + $t2
                L1:
            */
            case 2: { // eslint-disable-line no-magic-numbers
                const useBle = this._utilities.flipCoin();
                const symbol = useBle ? '<=' : '<';

                const code = `# branch if ${registerName1} ${symbol} ${registerName2} to L1
${registerName3} = ${registerName3} + ${registerName3}
L1:`;
                const codeHTML = this._templates.code({ code });

                questionStem = `Convert the comment to an instruction:${this._utilities.getNewline()}${codeHTML}`;

                expectedRegisterNames.push(registerName3, '$at');
                registerOptions.push(registerName1, registerName2, registerName3);
                instructionOptions.push('ble', 'blt', this._getAddOpCode());
                disabledInstructions.push(1);

                instructions.push(
                    this._instructionSetSDK.createAddInstruction(registerName3, registerName3, registerName3),
                    this._instructionSetSDK.createAddInstruction(registerName3, registerName3, registerName3)
                );

                let firstSolutionInstruction = this._instructionSetSDK.createBranchIfLessInstruction;

                if (useBle) {
                    firstSolutionInstruction = this._instructionSetSDK.createBranchIfLessOrEqualInstruction;
                }

                solutionInstructions.push(
                    firstSolutionInstruction(registerName1, registerName2, 'L1'),
                    this._instructionSetSDK.createAddInstruction(registerName3, registerName3, registerName3)
                );
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
        The slt instruction and the branch instructions should be exactly the same.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Correctness of the user's instructions.
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) {
        const userInstructions = dataOfUserAndExpectedAnswers.userInstructions;
        const expectedInstructions = dataOfUserAndExpectedAnswers.expectedInstructions;
        let feedback = null;

        // Verify slt is exactly the same.
        if (expectedInstructions[0].opcode === 'slt') {
            if (userInstructions[0].opcode === 'slt') {
                const isFirstRegisterCorrect = userInstructions[0].getPropertyByIndex(0) === expectedInstructions[0].getPropertyByIndex(0);
                const isSecondRegisterCorrect = userInstructions[0].getPropertyByIndex(1) === expectedInstructions[0].getPropertyByIndex(1);
                const isThirdRegisterCorrect = userInstructions[0].getPropertyByIndex(2) === expectedInstructions[0].getPropertyByIndex(2); // eslint-disable-line no-magic-numbers
                const areRegistersCorrect = isFirstRegisterCorrect && isSecondRegisterCorrect && isThirdRegisterCorrect;

                if (!areRegistersCorrect) {
                    feedback = new QuestionFeedback(false, 'Wrong register ordering for slt.');
                }
            }
            else {
                feedback = new QuestionFeedback(false, 'The first instruction should be slt.');
            }
        }

        // If no issues with the slt instruction, then check the branch instructions.
        if (!feedback) {
            feedback = this._branchAndJumpInstructionCorrectness(dataOfUserAndExpectedAnswers);
        }

        return feedback;
    }
}
