/*
    LoopQuestionFactory inherits QuestionFactory.
    See QuestionFactory for details.
*/
function LoopQuestionFactory() {
    QuestionFactory.prototype.constructor.apply(this, arguments);
    this.numberOfQuestions = 5;
}

// Build the LoopQuestionFactory prototype.
function buildLoopQuestionFactoryPrototype() {
    LoopQuestionFactory.prototype = new QuestionFactory();
    LoopQuestionFactory.prototype.constructor = LoopQuestionFactory;

    /*
        Make a Question based on |questionNumber|.
        |questionNumber| is required and a number.
    */
    LoopQuestionFactory.prototype.make = function(questionNumber) {
        var questionCode = '';
        var instructions = this._instructionSetSDK.createInstructions();
        var labels = this._instructionSetSDK.createLabels();
        var registers = this._instructionSetSDK.createRegisters();
        var solutionInstructions = this._instructionSetSDK.createInstructions();
        var expectedRegisterNames = [];
        var instructionOptions = [];
        var labelOptions = [];
        var registerOptions = [];
        var disabledInstructions = [];

        // Most registers needed is 4.
        var registerNames = this._chooseNRegisterNames(4);
        switch (questionNumber) {
            /*
                Convert:
                while ($s0 != $s1) {
                    $s0 = $s0 << 1;
                }

                To (MIPS):
                Loop: beq $s0, $s1, Exit
                      sll s0, $s0, 1
                      j Loop
                Exit:

                To (ARM):
                Loop: SUBS XZR, X0, X1
                      B.EQ Exit # Disabled
                      LSL X0, X0, 1 # Disabled
                      B Loop # Disabled
                Exit:
            */
            case 0:
                questionCode = 'while (' + registerNames[0] + ' != ' + registerNames[1] + '){\n   ' +
                               registerNames[0] + ' = ' + registerNames[0] + ' << 1;\n}';

                if (this._isARM()) {
                    instructions.push(
                        this._instructionSetSDK.createSubtractAndSetFlagsInstruction(registerNames[0], registerNames[0], registerNames[0]),
                        this._instructionSetSDK.createBranchOnEqualInstruction('Exit'),
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._makeJumpInstruction('Loop')
                    );
                    disabledInstructions.push(1, 2, 3); // eslint-disable-line no-magic-numbers
                }
                else {
                    instructions.push(
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1)
                    );
                }

                labels.addLabel('Loop', 0);
                labels.addLabel('Exit', instructions.length);

                registers.lookupByRegisterName(registerNames[0]).setValue(2);
                registers.lookupByRegisterName(registerNames[1]).setValue(32);

                // ARM uses different branching instructions from MIPS.
                if (this._isARM()) {
                    solutionInstructions.push(
                        this._instructionSetSDK.createSubtractAndSetFlagsInstruction('XZR', registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnEqualInstruction('Exit')
                    );
                }
                else {
                    solutionInstructions.push(
                        this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[0], registerNames[1], 'Exit')
                    );
                }

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                    this._makeJumpInstruction('Loop')
                );

                expectedRegisterNames.push(registerNames[0]);
                labelOptions.push('Loop', 'Exit');
                registerOptions.push(registerNames[0], registerNames[1]);

                // ARM and MIPS use different instructions for branching.
                if (this._isARM()) {
                    instructionOptions.push('SUBS', 'B.EQ');
                }
                else {
                    instructionOptions.push('beq');
                }
                instructionOptions.push(this._getShiftLeftOpCode(), this._getJumpOpCode());
                break;

            /*
                Convert:
                while ($s0 < $s1) {
                    $s0 = $s0 << 1;
                }

                To (MIPS):
                Loop: slt $s2, $s0, $s1
                      beq $s2, $zero, Exit  # Disable this.
                      sll s0, $s0, 1
                      j Loop                # Disable this.
                Exit:

                To (ARM):
                Loop: SUBS XZR, X0, X1
                      B.GE Exit
                      LSL X0, X0, 1 # Disabled
                      B Loop # Disabled
                Exit:
            */
            case 1:

            /*
                Convert:
                while ($s0 < $s1) {
                    $s0 = $s0 << 1;
                }

                To (MIPS):
                Loop: slt $s2, $s0, $s1
                      beq $s2, $zero, Exit
                      sll s0, $s0, 1
                      j Loop                # Disable this.
                Exit:

                To (ARM):
                Loop: SUBS XZR, X0, X1
                      B.GE Exit
                      LSL X0, X0, 1
                      B Loop
                Exit:
            */
            case 2: // eslint-disable-line
                questionCode = 'while (' + registerNames[0] + ' < ' + registerNames[1] + '){\n   ' +
                               registerNames[0] + ' = ' + registerNames[0] + ' << 1;\n}';

                // Question 1 and 2 only differ by the initial instruction setup.
                if (questionNumber === 1) {

                    // ARM uses different branching instructions from MIPS.
                    if (this._isARM()) {
                        instructions.push(
                            this._instructionSetSDK.createSubtractAndSetFlagsInstruction(
                                registerNames[0], registerNames[0], registerNames[0]
                            ),
                            this._instructionSetSDK.createSubtractAndSetFlagsInstruction(
                                registerNames[0], registerNames[0], registerNames[0]
                            )
                        );
                        disabledInstructions.push(2, 3); // eslint-disable-line no-magic-numbers
                    }
                    else {
                        instructions.push(
                            this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                            this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[2], '$zero', 'Exit')
                        );
                        disabledInstructions.push(1, 3); // eslint-disable-line no-magic-numbers
                    }

                    instructions.push(
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._makeJumpInstruction('Loop')
                    );
                }
                else {
                    instructions.push(
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                        this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1)
                    );

                    // MIPS has 1 disabled instruction; ARM has none.
                    if (this._isARM()) {
                        instructions.push(
                            this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1)
                        );
                    }
                    else {
                        instructions.push(
                            this._makeJumpInstruction('Loop')
                        );
                        disabledInstructions.push(3); // eslint-disable-line no-magic-numbers
                    }
                }

                labels.addLabel('Loop', 0);
                labels.addLabel('Exit', 4);

                registers.lookupByRegisterName(registerNames[0]).setValue(2);
                registers.lookupByRegisterName(registerNames[1]).setValue(33);

                // MIPS uses 3 registers and ARM uses 2. ARM uses different branching instructions from MIPS.
                if (this._isARM()) {
                    solutionInstructions.push(
                        this._instructionSetSDK.createSubtractAndSetFlagsInstruction('XZR', registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnGreaterThanOrEqualInstruction('Exit')
                    );
                }
                else {
                    registers.lookupByRegisterName(registerNames[2]).setValue(0);
                    solutionInstructions.push(
                        this._instructionSetSDK.createSetOnLessThanInstruction(registerNames[2], registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[2], '$zero', 'Exit')
                    );
                }

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[0], registerNames[0], 1),
                    this._makeJumpInstruction('Loop')
                );

                expectedRegisterNames.push(registerNames[0]);
                labelOptions.push('Loop', 'Exit');
                registerOptions.push(registerNames[0], registerNames[1]);

                // ARM and MIPS use different zero registers and instructions for branching.
                if (this._isARM()) {
                    instructionOptions.push('SUBS', 'B.GE');
                }
                else {
                    registerOptions.push(registerNames[2], '$zero');
                    instructionOptions.push('beq', 'slt');
                }
                instructionOptions.push(this._getShiftLeftOpCode(), this._getJumpOpCode());
                break;

            /*
                Convert:
                for ($s0 = 0; $s0 < $s1; $s0++) {
                    $s2 = $s2 << 1;
                }

                To (MIPS):
                      addi $s0, $zero, 0    # Disable this. Add comment: $s0 = 0;
                Loop: slt $s3, $s0, $s1
                      beq $t0, $zero, Exit
                      sll $s2, $s2, 1       # Disable this. Add comment: $s2 = $s2 << 1;
                      addi $s0, $s0, 1
                      j Loop                # Disable this.
                Exit:

                To (ARM):
                ADDI X0, XZR, 0 # Disabled
                Loop: SUBS XZR, X0, X1
                      B.GE Exit
                      LSL X2, X2, 1 # Disabled
                      ADDI X0, X0, 1
                      B Loop # Disabled
                Exit:
            */
            case 3:
                questionCode = 'for (' + registerNames[0] + ' = 0; ' + registerNames[0] + ' < ' +
                               registerNames[1] + '; ' + registerNames[0] + '++) {\n    ' +
                               registerNames[2] + ' = ' + registerNames[2] + ' << 1;\n}';

                instructions.push(
                    this._makeAddImmediateInstruction(registerNames[0], this._getZeroRegister(), 0),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[2], registerNames[2], 1),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._makeJumpInstruction('Loop')
                );
                disabledInstructions.push(0, 3, 5);

                labels.addLabel('Loop', 1);
                labels.addLabel('Exit', 6);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(6);
                registers.lookupByRegisterName(registerNames[2]).setValue(2);

                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerNames[0], this._getZeroRegister(), 0)
                );

                if (this._isARM()) {
                    solutionInstructions.push(
                        this._instructionSetSDK.createSubtractAndSetFlagsInstruction('XZR', registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchOnGreaterThanOrEqualInstruction('Exit')
                    );
                }
                else {
                    registers.lookupByRegisterName(registerNames[3]).setValue(0);
                    solutionInstructions.push(
                        this._instructionSetSDK.createSetOnLessThanInstruction(registerNames[3], registerNames[0], registerNames[1]),
                        this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[3], '$zero', 'Exit')
                    );
                }

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[2], registerNames[2], 1),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 1),
                    this._makeJumpInstruction('Loop')
                );

                expectedRegisterNames.push(registerNames[0], registerNames[2]);
                labelOptions.push('Loop', 'Exit');
                registerOptions.push(registerNames[0], registerNames[1], registerNames[2]);

                // ARM and MIPS use different zero registers and instructions for branching.
                if (this._isARM()) {
                    instructionOptions.push('SUBS', 'B.GE');
                }
                else {
                    registerOptions.push(registerNames[3], '$zero');
                    instructionOptions.push('beq', 'slt');
                }
                instructionOptions.push(this._getShiftLeftOpCode(), this._getJumpOpCode(), this._getAddImmediateOpCode());
                break;

            /*
                Convert:
                for ($s0 = 0; $s0 < 4; $s0++) {
                    $s1 = $s1 << 1
                }

                To (MIPS):
                      addi $s0, $zero, 0    # Disable this. Add comment: $s0 = 0;
                Loop: slti $s2, $s0, 4
                      beq $s2, $zero, Exit
                      addi $s0, $s0, 1      # Disable this. Add comment: $s0++
                      sll $s1, $s1, 1
                      j Loop                # Disable this.
                Exit:

                To (ARM):
                ADDI X0, XZR, 0 # Disabled
                Loop: SUBIS XZR, X0, 4
                      B.GE Exit
                      LSL X1, X1, 1 # Disabled
                      ADDI X0, X0, 1
                      B Loop # Disabled
                Exit:
            */
            case 4:
                questionCode = 'for (' + registerNames[0] + ' = 0; ' + registerNames[0] + ' < 4; ' +
                               registerNames[0] + '++) {\n    ' + registerNames[1] + ' = ' +
                               registerNames[1] + ' << 1;\n}';

                instructions.push(
                    this._makeAddImmediateInstruction(registerNames[0], this._getZeroRegister(), 0),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[1], registerNames[1], 1),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 0),
                    this._makeJumpInstruction('Loop')
                );
                disabledInstructions.push(0, 3, 5);

                labels.addLabel('Loop', 1);
                labels.addLabel('Exit', 6);

                registers.lookupByRegisterName(registerNames[0]).setValue(1);
                registers.lookupByRegisterName(registerNames[1]).setValue(2);

                solutionInstructions.push(
                    this._makeAddImmediateInstruction(registerNames[0], this._getZeroRegister(), 0)
                );

                if (this._isARM()) {
                    solutionInstructions.push(
                        this._instructionSetSDK.createSubtractImmediateAndSetFlagsInstruction('XZR', registerNames[0], 4),
                        this._instructionSetSDK.createBranchOnGreaterThanOrEqualInstruction('Exit')
                    );
                }
                else {
                    registers.lookupByRegisterName(registerNames[2]).setValue(0);
                    solutionInstructions.push(
                        this._instructionSetSDK.createSetOnLessThanImmediateInstruction(registerNames[2], registerNames[0], 4),
                        this._instructionSetSDK.createBranchIfEqualInstruction(registerNames[2], '$zero', 'Exit'),
                    );
                }

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftLeftInstruction(registerNames[1], registerNames[1], 1),
                    this._makeAddImmediateInstruction(registerNames[0], registerNames[0], 1),
                    this._makeJumpInstruction('Loop')
                );

                expectedRegisterNames.push(registerNames[0], registerNames[1]);
                labelOptions.push('Loop', 'Exit');
                registerOptions.push(registerNames[0], registerNames[1]);

                // ARM and MIPS use different zero registers and instructions for branching.
                if (this._isARM()) {
                    instructionOptions.push('SUBIS', 'B.GE');
                }
                else {
                    registerOptions.push(registerNames[2], '$zero');
                    instructionOptions.push('beq', 'slti');
                }
                instructionOptions.push(this._getShiftLeftOpCode(), this._getJumpOpCode(), this._getAddImmediateOpCode());
                break;
        }

        // ARM also uses XZR register for conditional branching.
        if (this._isARM()) {
            registerOptions.push('XZR');
        }

        const codeHTML = this._templates.code({ code: questionCode });
        const languageName = this._isARM() ? 'ARM' : 'MIPS';
        const questionStem = `Convert pseudocode to ${languageName}:${this._utilities.getNewline()}${codeHTML}`;

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
}
