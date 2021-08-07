/*
    ConditionalQuestionFactory inherits QuestionFactory.
    See QuestionFactory for details.
*/
function ConditionalQuestionFactory() {
    QuestionFactory.prototype.constructor.apply(this, arguments);
    this.numberOfQuestions = 5;
}

// Build the ConditionalQuestionFactory prototype.
function buildConditionalQuestionFactoryPrototype() {
    ConditionalQuestionFactory.prototype = new QuestionFactory();
    ConditionalQuestionFactory.prototype.constructor = ConditionalQuestionFactory;

    /*
        Make a Question based on |questionNumber|.
        |questionNumber| is required and a number.
    */
    ConditionalQuestionFactory.prototype.make = function(questionNumber) {
        let questionCode = '';
        const instructions = this._instructionSetSDK.createInstructions();
        const labels = this._instructionSetSDK.createLabels();
        const registers = this._instructionSetSDK.createRegisters();
        const solutionInstructions = this._instructionSetSDK.createInstructions();
        const expectedRegisterNames = [];
        const instructionOptions = [];
        const labelOptions = [];
        const registerOptions = [];
        const disabledInstructions = [];

        // Most registers needed is 6.
        const numberOfRegisters = 6;
        const registerNames = this._chooseNRegisterNames(numberOfRegisters);

        switch (questionNumber) {

            /*
                Convert:
                if ($s0 != $s1)
                   $s2 = $s2 + $s2;

                To (MIPS):
                    beq $s0, $s1, L1
                    add $s2, $s2, $s2
                L1:

                To (ARM):
                    SUB X3, X0, X1
                    CBZ X3, L1
                    ADD X2, X2, X2
                L1:
            */
            case 0:
                questionCode = `if (${registerNames[0]} != ${registerNames[1]})
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[2]};`;

                // ARM uses 3 instructions.
                if (this._isARM()) {
                    instructions.push(
                        this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                    );
                }
                instructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                );
                disabledInstructions.push(instructions.length - 1);

                labels.addLabel('L1', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[2]).setValue(5); // eslint-disable-line no-magic-numbers

                // ARM needs 4 registers and a different solution start than MIPS.
                if (this._isARM()) {
                    registers.lookupByRegisterName(registerNames[3]).setValue(0);

                    solutionInstructions.push(
                        this._makeSubInstruction(registerNames[3], registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnZeroInstruction(registerNames[3], 'L1')
                    );
                }
                else {
                    solutionInstructions.push(
                        this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[0], registerNames[1], 'L1')
                    );
                }

                solutionInstructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                );

                expectedRegisterNames.push(registerNames[2]);

                // ARM and MIPS use different instructions.
                if (this._isARM()) {
                    instructionOptions.push('SUB', 'CBZ', 'CBNZ');
                }
                else {
                    instructionOptions.push('beq', 'bne');
                }
                instructionOptions.push(this._getAddOpCode());
                labelOptions.push('L1');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2]);

                // ARM needs a 4th register.
                if (this._isARM()) {
                    registerOptions.push(registerNames[3]);
                }
                break;

            /*
                Convert:
                if ($s0 == $s1)
                   $s2 = $s2 + $s2;

                To (MIPS):
                    bne $s0, $s1, L1
                    add $s2, $s2, $s2
                L1:

                To (ARM):
                    SUB X3, X0, X1
                    CBNZ X3, L1
                    ADD X2, X2, X2
                L1:
            */
            case 1:
                questionCode = `if (${registerNames[0]} == ${registerNames[1]})
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[2]};`;

                // ARM uses 3 instructions.
                if (this._isARM()) {
                    instructions.push(
                        this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                    );
                }
                instructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                );

                labels.addLabel('L1', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[2]).setValue(5); // eslint-disable-line no-magic-numbers

                // ARM needs 4 registers and a different solution start than MIPS.
                if (this._isARM()) {
                    registers.lookupByRegisterName(registerNames[3]).setValue(0);

                    solutionInstructions.push(
                        this._makeSubInstruction(registerNames[3], registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnNotZeroInstruction(registerNames[3], 'L1')
                    );
                }
                else {
                    solutionInstructions.push(
                        this._instructionSetSDK.createBranchIfNotEqualInstruction(registerNames[0], registerNames[1], 'L1')
                    );
                }

                solutionInstructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                );

                expectedRegisterNames.push(registerNames[2]);

                // ARM and MIPS use different instructions.
                if (this._isARM()) {
                    instructionOptions.push('SUB', 'CBZ', 'CBNZ');
                }
                else {
                    instructionOptions.push('beq', 'bne');
                }
                instructionOptions.push(this._getAddOpCode());
                labelOptions.push('L1');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2]);

                // ARM needs a 4th register.
                if (this._isARM()) {
                    registerOptions.push(registerNames[3]);
                }
                break;

            /*
                Convert:
                if ($s0 == $s1)
                   $s2 = $s2 + $s2;
                $s2 = $s2 + $s3;

                To (MIPS):
                    bne $s0, $s1, L2
                L1: $s2, $s2, $s2
                L2: $s2, $s2, $s3
                L3:

                To (ARM):
                    SUB X4, X0, X1
                    CBNZ X4, L1
                L1: ADD X2, X2, X2
                L2: ADD X2, X2, X3
                L3:
            */
            case 2: // eslint-disable-line no-magic-numbers
                questionCode = `if (${registerNames[0]} == ${registerNames[1]})
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[2]};
${registerNames[2]} = ${registerNames[2]} + ${registerNames[3]};`;

                // ARM uses 4 instructions.
                if (this._isARM()) {
                    instructions.push(
                        this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                    );
                }
                instructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                );

                labels.addLabel('L1', instructions.length - 2); // eslint-disable-line no-magic-numbers
                labels.addLabel('L2', instructions.length - 1);
                labels.addLabel('L3', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[2]).setValue(5); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[3]).setValue(9); // eslint-disable-line no-magic-numbers

                // ARM needs 5 registers and a different solution start than MIPS.
                if (this._isARM()) {
                    registers.lookupByRegisterName(registerNames[4]).setValue(0);

                    solutionInstructions.push(
                        this._makeSubInstruction(registerNames[4], registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnNotZeroInstruction(registerNames[4], 'L2')
                    );
                }
                else {
                    solutionInstructions.push(
                        this._instructionSetSDK.createBranchIfNotEqualInstruction(registerNames[0], registerNames[1], 'L2')
                    );
                }

                solutionInstructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[3])
                );

                expectedRegisterNames.push(registerNames[2]);

                // ARM and MIPS use different instructions.
                if (this._isARM()) {
                    instructionOptions.push('SUB', 'CBZ', 'CBNZ');
                }
                else {
                    instructionOptions.push('beq', 'bne');
                }
                instructionOptions.push(this._getAddOpCode());
                labelOptions.push('L1', 'L2', 'L3');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2], registerNames[3]);

                // ARM needs a 5th register.
                if (this._isARM()) {
                    registerOptions.push(registerNames[4]);
                }
                break;

            /*
                Convert:
                if ($s0 == $s1)
                    $s2 = $s2 + $s2
                else
                    $s2 = $s2 + $s3

                To (MIPS):
                    bne $s0, $s1, L2
                    add $s2, $s2, $s2
                L1: j L3
                L2: add $s2, $s2, $s3
                L3:

                To (ARM):
                    SUB X4, X0, X1
                    CBNZ X4, L1
                    ADD X2, X2, X2
                L1: B L3
                L2: ADD X2, X2, X3
                L3:

                Randomize: == or !=
            */
            case 3: { // eslint-disable-line
                const branchCondition = this._toggleBranchInstruction();

                questionCode = `if (${registerNames[0]} ${branchCondition.pseudocode} ${registerNames[1]})
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[2]};
else
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[3]};`;

                // ARM uses 5 instructions.
                if (this._isARM()) {
                    instructions.push(
                        this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                    );
                }
                instructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[3])
                );
                disabledInstructions.push(instructions.length - 3, instructions.length - 1); // eslint-disable-line no-magic-numbers

                labels.addLabel('L1', instructions.length - 2); // eslint-disable-line no-magic-numbers
                labels.addLabel('L2', instructions.length - 1);
                labels.addLabel('L3', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[2]).setValue(5); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[3]).setValue(9); // eslint-disable-line no-magic-numbers

                // ARM needs 5 registers and a different solution start than MIPS.
                if (this._isARM()) {
                    registers.lookupByRegisterName(registerNames[4]).setValue(0);

                    solutionInstructions.push(
                        this._makeSubInstruction(registerNames[4], registerNames[0], registerNames[1]),
                        branchCondition.instruction(registerNames[4], 'L2')
                    );
                }
                else {
                    solutionInstructions.push(
                        branchCondition.instruction(registerNames[0], registerNames[1], 'L2')
                    );
                }

                solutionInstructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeJumpInstruction('L3'),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[3])
                );

                expectedRegisterNames.push(registerNames[2]);

                // ARM and MIPS use different instructions.
                if (this._isARM()) {
                    instructionOptions.push('SUB', 'CBZ', 'CBNZ');
                }
                else {
                    instructionOptions.push('beq', 'bne');
                }
                instructionOptions.push(this._getAddOpCode(), this._getJumpOpCode());
                labelOptions.push('L1', 'L2', 'L3');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2], registerNames[3]);

                // ARM needs a 5th register.
                if (this._isARM()) {
                    registerOptions.push(registerNames[4]);
                }
                break;
            }

            /*
                Convert:
                if ($s0 == $s1)
                    $s2 = $s2 + $s2
                else
                    $s2 = $s2 + $s3
                $s2 = $s2 + $s4

                To (MIPS):
                    bne $s0, $s1, L1
                    add $s2, $s2, $s2
                    j L2
                L1: add $s2, $s2, $s3
                L2: add $s2, $s2, $s4
                L3:

                To (ARM):
                    SUB X5, X0, X1
                    CBNZ X5, L1
                    ADD X2, X2, X2
                    B L2
                L1: ADD X2, X2, X3
                L2: ADD X2, X2, X4
                L3:

                Randomize: == or !=
            */
            case 4: { // eslint-disable-line
                const branchCondition = this._toggleBranchInstruction();

                questionCode = `if (${registerNames[0]} ${branchCondition.pseudocode} ${registerNames[1]})
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[2]};
else
   ${registerNames[2]} = ${registerNames[2]} + ${registerNames[3]};
${registerNames[2]} = ${registerNames[2]} + ${registerNames[4]};`;

                // ARM uses 6 instructions.
                if (this._isARM()) {
                    instructions.push(
                        this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2])
                    );
                }
                instructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[3]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[4])
                );
                disabledInstructions.push(instructions.length - 4, instructions.length - 2, instructions.length - 1); // eslint-disable-line no-magic-numbers

                labels.addLabel('L1', instructions.length - 2); // eslint-disable-line no-magic-numbers
                labels.addLabel('L2', instructions.length - 1);
                labels.addLabel('L3', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[2]).setValue(5); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[3]).setValue(9); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName(registerNames[4]).setValue(18); // eslint-disable-line no-magic-numbers

                // ARM needs 6 registers and a different solution start than MIPS.
                if (this._isARM()) {
                    registers.lookupByRegisterName(registerNames[5]).setValue(0);

                    solutionInstructions.push(
                        this._makeSubInstruction(registerNames[5], registerNames[0], registerNames[1]),
                        branchCondition.instruction(registerNames[5], 'L1')
                    );
                }
                else {
                    solutionInstructions.push(
                        branchCondition.instruction(registerNames[0], registerNames[1], 'L1')
                    );
                }

                solutionInstructions.push(
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[2]),
                    this._makeJumpInstruction('L2'),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[3]),
                    this._makeAddInstruction(registerNames[2], registerNames[2], registerNames[4])
                );

                expectedRegisterNames.push(registerNames[2]);

                // ARM and MIPS use different instructions.
                if (this._isARM()) {
                    instructionOptions.push('SUB', 'CBZ', 'CBNZ');
                }
                else {
                    instructionOptions.push('beq', 'bne');
                }
                instructionOptions.push(this._getAddOpCode(), this._getJumpOpCode());
                labelOptions.push('L1', 'L2', 'L3');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2], registerNames[3], registerNames[4]);

                // ARM needs a 6th register.
                if (this._isARM()) {
                    registerOptions.push(registerNames[5]);
                }
                break;
            }

            default:
                throw new Error(`Level not supported: ${questionNumber}`);
        }

        const languageName = this._isARM() ? 'ARM' : 'MIPS';
        const code = this._templates.code({ code: questionCode });
        const questionStem = `Convert pseudocode to ${languageName}:${this._utilities.getNewline()}${code}`;

        return new Question(
            questionStem,
            instructions,
            labels,
            registers,
            this._instructionSetSDK.createMemory(),
            solutionInstructions,
            expectedRegisterNames,
            [], // expectedMemoryAddresses is not used in this question factory
            [], // registerBaseAddresses is not used in this question factory
            instructionOptions,
            labelOptions,
            registerOptions,
            disabledInstructions
        );
    };

    /*
        Toggle between choosing branch-if-equal and branch-if-not-equal instruction, along with the
        associated pseudocode.

        Return an object with two properties:
            * |instruction| is required and a function.
            * |pseudocode| is required and a string.
    */
    ConditionalQuestionFactory.prototype._toggleBranchInstruction = function() {
        this._toggleBranchInstructionCounter = this._toggleBranchInstructionCounter || 0;

        const pseudocode = (++this._toggleBranchInstructionCounter % 2) ? '==' : '!='; // eslint-disable-line no-magic-numbers
        let instruction = this._isARM() ?
                          this._instructionSetSDK.createBranchOnZeroInstruction :
                          this._instructionSetSDK.createBranchIfEqualInstruction;

        if (pseudocode === '==') {
            instruction = this._isARM() ?
                          this._instructionSetSDK.createBranchOnNotZeroInstruction :
                          this._instructionSetSDK.createBranchIfNotEqualInstruction;
        }

        return { instruction, pseudocode };
    };

    /**
        Return the correctness of the conditional opcodes. User-selected instructions should match
        the expected instructions.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Correctness of the user's instructions.
    */
    ConditionalQuestionFactory.prototype.checkFactorySpecificCorrectness = function(dataOfUserAndExpectedAnswers) {
        return this._branchIfEqualBranchIfNotEqualJumpInstructionCorrectness(dataOfUserAndExpectedAnswers);
    };
}
