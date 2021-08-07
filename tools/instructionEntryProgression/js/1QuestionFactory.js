'use strict';

/* exported QuestionFactory */
/* global QuestionFeedback */

/**
    QuestionFactory is an object to make Question objects for instructionEntryProgression.
    @class QuestionFactory
*/
class QuestionFactory {

    /**
        @constructor
        @param {InstructionSetSDK} instructionSetSDK An instruction set SDK.
        @param {String} instructionSet The name of the instruction set.
        @param {Object} templates Dictionary of HBS templates.
    */
    constructor(instructionSetSDK, instructionSet, templates) {
        this._instructionSet = instructionSet;
        this._instructionSetSDK = instructionSetSDK;
        this._templates = templates;
        this._utilities = require('utilities');
        this.printRadix = 10;

        // Inheriting object should set |numberOfQuestions|.
        this.numberOfQuestions = null;

        /**
            The default feedback is that the user's answer is correct, and no explanation is given.
            @property _defaultFeedback
            @private
            @type {QuestionFeedback}
        */
        this._defaultFeedback = new QuestionFeedback(true, '');
    }

    /**
        Return the name of the instruction set's zero register.
        @method _getZeroRegister
        @return {String} The name of the instruction set's zero register.
    */
    _getZeroRegister() {
        return this._isARM() ? 'XZR' : '$zero';
    }

    /**
        Return whether the instruction set is ARM.
        @method _isARM
        @private
        @return {Boolean} Whether the instruction set is ARM.
    */
    _isARM() {
        return (this._instructionSet === 'ARM');
    }

    /**
        Return the add op code for the given |_instructionSet|.
        @method _getAddOpCode
        @private
        @return {String} The add op code.
    */
    _getAddOpCode() {
        return (this._isARM() ? 'ADD' : 'add');
    }

    /**
        Return the and op code for the given |_instructionSet|.
        @method _getAndOpCode
        @private
        @return {String} The and op code.
    */
    _getAndOpCode() {
        return (this._isARM() ? 'AND' : 'and');
    }

    /**
        Return the or op code for the given |_instructionSet|.
        @method _getOrOpCode
        @private
        @return {String} The or op code.
    */
    _getOrOpCode() {
        return (this._isARM() ? 'ORR' : 'or');
    }

    /**
        Return the subtract op code for the given |_instructionSet|.
        @method _getSubtractOpCode
        @private
        @return {String} The subtract op code.
    */
    _getSubtractOpCode() {
        return (this._isARM() ? 'SUB' : 'sub');
    }

    /**
        Return the add immediate op code for the given |_instructionSet|.
        @method _getAddImmediateOpCode
        @private
        @return {String} The add immediate op code.
    */
    _getAddImmediateOpCode() {
        return (this._isARM() ? 'ADDI' : 'addi');
    }

    /**
        Return the and immediate op code for the given |_instructionSet|.
        @method _getAndImmediateOpCode
        @private
        @return {String} The and immediate op code.
    */
    _getAndImmediateOpCode() {
        return (this._isARM() ? 'ANDI' : 'andi');
    }

    /**
        Return the or immediate op code for the given |_instructionSet|.
        @method _getOrImmediateOpCode
        @private
        @return {String} The or immediate op code.
    */
    _getOrImmediateOpCode() {
        return (this._isARM() ? 'ORRI' : 'ori');
    }

    /**
        Return the shift right op code for the given |_instructionSet|.
        @method _getShiftRightOpCode
        @private
        @return {String} The shift right op code.
    */
    _getShiftRightOpCode() {
        return (this._isARM() ? 'LSR' : 'srl');
    }

    /**
        Return the shift left op code for the given |_instructionSet|.
        @method _getShiftLeftOpCode
        @private
        @return {String} The shift left op code.
    */
    _getShiftLeftOpCode() {
        return (this._isARM() ? 'LSL' : 'sll');
    }

    /**
        Return the load register op code for the given |_instructionSet|.
        @method _getLoadRegisterOpCode
        @private
        @return {String} The load register op code.
    */
    _getLoadRegisterOpCode() {
        return (this._isARM() ? 'LDUR' : 'lw');
    }

    /**
        Return the store register op code for the given |_instructionSet|.
        @method _getStoreRegisterOpCode
        @private
        @return {String} The store register op code.
    */
    _getStoreRegisterOpCode() {
        return (this._isARM() ? 'STUR' : 'sw');
    }

    /**
        Return the jump op code for the given |_instructionSet|.
        @method _getJumpOpCode
        @private
        @return {String} The jump op code.
    */
    _getJumpOpCode() {
        return (this._isARM() ? 'B' : 'j');
    }

    /**
        Get the name of memory used in the question stem. Ex: DM or Memory.
        @method getMemoryNameForQuestionStem
        @return {String} The name of memory used in a question stem.
    */
    getMemoryNameForQuestionStem() {
        return ((this._instructionSet === 'MIPSzy') ? 'DM' : 'Memory');
    }

    /**
        Return the correctness and explanation for a given step and user's answer.
        Inheriting objects may override this to include factory-specific behavior.
        @method checkFactorySpecificCorrectness
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @param {Instructions} dataOfUserAndExpectedAnswers.userInstructions The user's selected instructions.
        @param {Instructions} dataOfUserAndExpectedAnswers.expectedInstructions The expected instructions.
        @param {Registers} dataOfUserAndExpectedAnswers.initialRegisters The register's initial values.
        @param {Registers} dataOfUserAndExpectedAnswers.userRegisters Register values after user's instructions are executed.
        @param {Array} dataOfUserAndExpectedAnswers.registerBaseAddresses Array of {String}. The addresses of registers.
        @param {Registers} dataOfUserAndExpectedAnswers.expectedRegisters Register values after solution's instructions are executed.
        @return {QuestionFeedback} Whether the user's answer is correct and an explanation.
    */
    checkFactorySpecificCorrectness(dataOfUserAndExpectedAnswers) { // eslint-disable-line no-unused-vars
        return this._defaultFeedback;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) { // eslint-disable-line no-unused-vars
        throw new Error('Inheriting object should override make.');
    }

    /**
        Return array of register groups. Ex: For MIPS, return two groups: $t0..t9 and $s0..$s7
        @method _makeRegisterGroups
        @private
        @return {Array} Array of {Array} of {String}. List of register groups, wherein each group is an list of register names.
    **/
    _makeRegisterGroups() {
        const registerGroups = [];

        switch (this._instructionSet) {
            case 'MIPSzy': // eslint-disable-line no-case-declarations

                // |tRegisters| contains: $t0, $t1, ..., $t6.
                const tRegisters = [];

                for (let index = 0; index <= 6; ++index) { // eslint-disable-line no-magic-numbers
                    tRegisters.push(`$t${index}`);
                }
                registerGroups.push(tRegisters);
                break;
            case 'MIPS': // eslint-disable-line no-case-declarations

                // |tRegistersMIPS| contains: $t0, $t1, ..., $t9.
                const tRegistersMIPS = [];

                for (let index = 0; index <= 9; ++index) { // eslint-disable-line no-magic-numbers
                    tRegistersMIPS.push(`$t${index}`);
                }
                registerGroups.push(tRegistersMIPS);

                // |sRegisters| contains: $s0, $s1, ..., $s7.
                const sRegisters = [];

                for (let index = 0; index <= 7; ++index) { // eslint-disable-line no-magic-numbers
                    sRegisters.push(`$s${index}`);
                }
                registerGroups.push(sRegisters);
                break;
            case 'ARM': // eslint-disable-line no-case-declarations

                // |lowerRegisters| contains: X0, ..., X9.
                const lowerRegisters = [];

                for (let index = 0; index <= 9; ++index) { // eslint-disable-line no-magic-numbers
                    lowerRegisters.push(`X${index}`);
                }
                registerGroups.push(lowerRegisters);

                // |higherRegisters| contains: X10, ..., X19.
                const higherRegisters = [];

                for (let index = 10; index <= 19; ++index) { // eslint-disable-line no-magic-numbers
                    higherRegisters.push(`X${index}`);
                }
                registerGroups.push(higherRegisters);
                break;
            default:
                throw new Error('Unsupported instruction set');
        }
        return registerGroups;
    }

    /**
        Return an array of |numberOfRegisters| contiguous register names from:
            * If MIPSzy, $t0..$t6
            * If MIPS, either $s0..$s7 or $t0..$t9
            * If ARM, either X0..X9 or X10..X19
        @method _chooseNRegisterNames
        @private
        @param {Integer} numberOfRegisters The number of register names to choose.
        @return {Array} List of register names.
    */
    _chooseNRegisterNames(numberOfRegisters) {

        // Choose a group of registers.
        const registersToChooseFrom = this._utilities.pickElementFromArray(this._makeRegisterGroups());

        // Choose a register name starting index.
        const maxStartingIndex = registersToChooseFrom.length - numberOfRegisters;
        const nameStartingIndex = this._utilities.pickNumberInRange(0, maxStartingIndex);

        /*
            Return array of |numberOfRegisters| register names from |registersToChooseFrom| starting at index
            |nameStartingIndex| through (|nameStartingIndex| + |numberOfRegisters| - 1).
        */
        return Array.apply(0, Array(numberOfRegisters)).map((value, offset) => registersToChooseFrom[nameStartingIndex + offset]);
    }

    /**
        Return an array of N single-digit integers.
        @method _makeNSmallIntegers
        @private
        @param {Integer} numberOfIntegers The number of integers to make.
        @return {Array} Array of {Integer}. The array of N integers.
    */
    _makeNSmallIntegers(numberOfIntegers) {
        const smallestValue = 2;
        const largestValue = 9;

        return this._utilities.pickNNumbersInRange(smallestValue, largestValue, numberOfIntegers);
    }

    /**
        Return an array of N valid memory addresses.
        @method _chooseNMemoryAddresses
        @private
        @param {Integer} numberOfAddresses The number of addresses to make.
        @return {Array} Array of {Integer}. N valid memory addresses.
    */
    _chooseNMemoryAddresses(numberOfAddresses) {

        // Valid addresses are multiples of 4 from 5000 to 8000.
        const smallestAddress = 5000;
        const largestAddress = 8000;
        const addressAlignment = 4;
        const smallestAddressOnAlignment = smallestAddress / addressAlignment;
        const largestAddressOnAlignment = largestAddress / addressAlignment;
        const addressesOnAlignment = this._utilities.pickNNumbersInRange(
            smallestAddressOnAlignment,
            largestAddressOnAlignment,
            numberOfAddresses
        );

        return addressesOnAlignment.map(addressOnAlignment => addressOnAlignment * addressAlignment);
    }

    /**
        Make an add instruction.
        @method _makeAddInstruction
        @private
        @return {AddInstruction}
    */
    _makeAddInstruction(...args) {
        return this._instructionSetSDK.createAddInstruction.apply(null, args);
    }

    /**
        Make an add immediate instruction.
        @method _makeAddImmediateInstruction
        @private
        @return {AddImmediateInstruction}
    */
    _makeAddImmediateInstruction(...args) {
        return this._instructionSetSDK.createAddImmediateInstruction.apply(null, args);
    }

    /**
        Make a sub instruction.
        @method _makeSubInstruction
        @private
        @return {SubtractInstruction}
    */
    _makeSubInstruction(...args) {
        return this._instructionSetSDK.createSubtractInstruction.apply(null, args);
    }

    /**
        Make a mul instruction.
        @method _makeMulInstruction
        @private
        @return {MulInstruction}
    */
    _makeMulInstruction(...args) {
        return this._instructionSetSDK.createMulInstruction.apply(null, args);
    }

    /**
        Make a jump instruction.
        @method _makeJumpInstruction
        @private
        @return {Instruction} The made jump instruction.
    */
    _makeJumpInstruction(...args) {
        let instruction = null;

        if (this._isARM()) {
            instruction = this._instructionSetSDK.createBranchInstruction.apply(null, args);
        }
        else {
            instruction = this._instructionSetSDK.createJumpInstruction.apply(null, args);
        }

        return instruction;
    }

    /**
        Make a load register instruction using a 0 offset.
        @method _makeLoadRegisterNoOffsetInstruction
        @private
        @param {String} firstRegisterName The first register in the instruction.
        @param {String} secondRegisterName The second register in the instruction.
        @return {Instruction} The load register instruction.
    */
    _makeLoadRegisterNoOffsetInstruction(firstRegisterName, secondRegisterName) {
        const instruction = this._instructionSetSDK.createLoadWordInstruction(firstRegisterName, 0, secondRegisterName);

        if (this.useTextNotInput) {
            instruction.useTextNotInput();
        }

        return instruction;
    }

    /**
        Make a store register instruction using a 0 offset.
        @method _makeStoreRegisterNoOffsetInstruction
        @private
        @param {String} firstRegisterName The first register in the instruction.
        @param {String} secondRegisterName The second register in the instruction.
        @return {Instruction} The store register instruction.
    */
    _makeStoreRegisterNoOffsetInstruction(firstRegisterName, secondRegisterName) {
        const instruction = this._instructionSetSDK.createStoreWordInstruction(firstRegisterName, 0, secondRegisterName);

        if (this.useTextNotInput) {
            instruction.useTextNotInput();
        }

        return instruction;
    }

    /**
        Return the correctness of all branch instructions and jump. User-selected instructions should match the expected instructions.
        @method _branchAndJumpInstructionCorrectness
        @private
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {Object}
    */
    _branchAndJumpInstructionCorrectness(dataOfUserAndExpectedAnswers) {
        const userInstructions = dataOfUserAndExpectedAnswers.userInstructions;
        const expectedInstructions = dataOfUserAndExpectedAnswers.expectedInstructions;
        const branchPseudoInstructions = [ 'blt', 'ble', 'bgt', 'bge' ];
        const feedbacks = userInstructions.map((userInstruction, index) => {
            const expectedInstruction = expectedInstructions[index];
            let isCorrect = true;
            let explanation = '';

            if (branchPseudoInstructions.find(opcode => opcode === expectedInstruction.opcode)) {
                if (userInstruction.opcode === expectedInstruction.opcode) {
                    const isFirstRegisterCorrect = expectedInstruction.getPropertyByIndex(0) === userInstruction.getPropertyByIndex(0);
                    const isSecondRegisterCorrect = expectedInstruction.getPropertyByIndex(1) === userInstruction.getPropertyByIndex(1);

                    if (!isFirstRegisterCorrect || !isSecondRegisterCorrect) {
                        isCorrect = false;
                        explanation = 'Wrong registers were compared.';
                    }
                    else if (expectedInstruction.getPropertyByIndex(2) !== userInstruction.getPropertyByIndex(2)) { // eslint-disable-line no-magic-numbers
                        isCorrect = false;
                        explanation = `Wrong label was selected: ${userInstruction.toString()}`;
                    }
                }
                else {
                    isCorrect = false;
                    explanation = 'Wrong conditional operation was selected.';
                }
            }

            return new QuestionFeedback(isCorrect, explanation);
        });

        // Find first feedback with isCorrect as false.
        const specificFeedback = feedbacks.find(feedback => !feedback.isCorrect);

        return specificFeedback || this._branchIfEqualBranchIfNotEqualJumpInstructionCorrectness(dataOfUserAndExpectedAnswers);
    }

    /**
        Check whether the correct branch-if-equal, branch-if-not-equal, and jump instructions were selected.
        @method _branchIfEqualBranchIfNotEqualJumpInstructionCorrectness
        @private
        @param {Object} dataOfUserAndExpectedAnswers Dictionary of data on the user and expected answers.
        @return {QuestionFeedback} Correctness of the user's instructions.
    */
    _branchIfEqualBranchIfNotEqualJumpInstructionCorrectness(dataOfUserAndExpectedAnswers) {
        const userInstructions = dataOfUserAndExpectedAnswers.userInstructions;
        const expectedInstructions = dataOfUserAndExpectedAnswers.expectedInstructions;
        const branchInstructions = [ 'bne', 'beq' ];
        const feedbacks = userInstructions.map((userInstruction, index) => {
            const expectedInstruction = expectedInstructions[index];
            let isCorrect = true;
            let explanation = '';

            // If the expected opcode is bne or beq, then the user must use the exact same opcode and registers.
            if (branchInstructions.find(opcode => opcode === expectedInstruction.opcode)) {

                // User-selected opcode must be same as expected opcode.
                const opcodeIsCorrect = (userInstruction.opcode === expectedInstruction.opcode);

                if (opcodeIsCorrect) {

                    // User-selected registers are in same order as expected registers.
                    const registersAreSame = ((expectedInstruction.getPropertyByIndex(0) === userInstruction.getPropertyByIndex(0)) &&
                                              (expectedInstruction.getPropertyByIndex(1) === userInstruction.getPropertyByIndex(1)));

                    // User-selected registers are reversed in order as expected registers.
                    const registersAreReversed = ((expectedInstruction.getPropertyByIndex(0) === userInstruction.getPropertyByIndex(1)) &&
                                                  (expectedInstruction.getPropertyByIndex(1) === userInstruction.getPropertyByIndex(0)));

                    // User-selected registers are correct if the same registers are picked, even if in reverse order.
                    const registersAreCorrect = registersAreSame || registersAreReversed;

                    if (registersAreCorrect) {

                        // Label must match to be correct.
                        if (expectedInstruction.getPropertyByIndex(2) !== userInstruction.getPropertyByIndex(2)) { // eslint-disable-line no-magic-numbers
                            isCorrect = false;
                            explanation = `Wrong label was selected: ${userInstruction.toString()}`;
                        }
                    }
                    else {
                        isCorrect = false;
                        explanation = 'Wrong registers were compared.';
                    }
                }
                else {
                    isCorrect = false;
                    explanation = 'Wrong conditional operation was selected.';
                }
            }

            // If the expected opcode is j, then the user must use the same opcode and label.
            else if (expectedInstruction.opcode === 'j') {
                const opcodeIsCorrect = (userInstruction.opcode === expectedInstruction.opcode);

                if (opcodeIsCorrect) {

                    // Label must match to be correct.
                    if (expectedInstruction.getPropertyByIndex(0) !== userInstruction.getPropertyByIndex(0)) {
                        isCorrect = false;
                        explanation = `Wrong label was selected: ${userInstruction.toString()}`;
                    }
                }
                else {
                    isCorrect = false;
                    explanation = 'Wrong jump operation was selected.';
                }
            }

            return new QuestionFeedback(isCorrect, explanation);
        });

        const specificFeedback = feedbacks.find(feedback => !feedback.isCorrect);

        return specificFeedback || this._defaultFeedback;
    }

    /**
        Make a question from the start of the stem and code.
        @method _makeQuestionStemFromStemStartAndCode
        @private
        @param {String} questionStemStart The start of the question stem. Ex: Convert the C to assembly.
        @param {String} code The code portion of the question stem.
        @return {String} The question stem.
    */
    _makeQuestionStemFromStemStartAndCode(questionStemStart, code) {
        const codeHTML = this._templates.code({ code });

        return `${questionStemStart}${this._utilities.getNewline()}${codeHTML}`;
    }

    /**
        Choose N arithmetic operations, ex: add, sub, and mul.
        @method _chooseNArithmeticOperations
        @private
        @param {Integer} numberOfOperations Number of operations to choose.
        @return {Array} Array of {Object}. Object stores each operation symbol, opcode, and instruction.
    */
    _chooseNArithmeticOperations(numberOfOperations) {
        const operations = [
            {
                symbol: '+',
                opcode: this._getAddOpCode(),
                instruction: this._makeAddInstruction,
            },
            {
                symbol: '-',
                opcode: this._getSubtractOpCode(),
                instruction: this._makeSubInstruction,
            },
            {
                symbol: '*',
                opcode: 'mul',
                instruction: this._makeMulInstruction,
            },
        ];

        return this._utilities.pickNElementsFromArray(operations, numberOfOperations);
    }

    /**
        Combine each element of |variableNames| with the respective element in |registerNames|, into a string.
        The returned string explains which register corresponds to which variable.
        The lists should have the same number of elements, and there should be at least 3 elements.
        @method _makeVariableValues
        @private
        @param {Array} _variableNames Array of {String}. List of variable names.
        @param {Array} _registerNames Array of {String}. List of register names.
        @return {String} Explanation of which register corresponds to which variable.
    */
    _makeVariableValues(_variableNames, _registerNames) {
        const minNumberOfElements = 3;

        if (_variableNames.length !== _registerNames.length) {
            throw new Error('Lists passed to _makeVariableValues should be of equal length, but aren\'t.');
        }
        else if (_variableNames.length < minNumberOfElements) {
            throw new Error(`List passed to _makeVariableValues should have at least ${minNumberOfElements} elements, but don\'t.`);
        }

        // Copy and sort the variables and registers.
        const variableNames = _variableNames.slice().sort();
        const registerNames = _registerNames.slice().sort();

        // Map each variable to a register.
        const variableRegisterMap = variableNames.map((variableName, index) => `${variableName} is in ${registerNames[index]}`);
        const lastMap = variableRegisterMap.pop();

        return `Variables: ${variableRegisterMap.join(', ')}, and ${lastMap}.`;
    }
}
