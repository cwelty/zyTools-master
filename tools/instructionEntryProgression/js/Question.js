'use strict';

/* exported Question */

/**
    Store the properties of a generated question for the progression.
    @class Question
*/
class Question {

    /**
        @constructor
        @param {String} questionStem The question's prompt.
        @param {Instructions} instructions The initially shown instructions.
        @param {Labels} labels The initially shown labels.
        @param {Registers} registers The initially shown registers.
        @param {Memory} memory The initially shown memory.
        @param {Instructions} solutionInstructions Set of instructions that are a solution.
        @param {Array} expectedRegisterNames Array of {String}. The register names that should be compared for correctness.
        @param {Array} expectedMemoryAddresses Array of {String}. The memory addresses that should be compared for correctness.
        @param {Array} registerBaseAddresses Array of {String}. The registers that store the memory base addresses used for load and store instructions.
        @param {Array} instructionOptions Array of {String}. The dropdown options for each op code.
        @param {Array} labelOptions Array of {String}. The dropdown options for each label.
        @param {Array} registerOptions Array of {String}. The dropdown options for each register.
        @param {Array} disabledInstructions Array of {Integer}. The instructions to disable.
        @param {Boolean} [useTextNotInput=false] Whether to use plain text instead of an input field.
        @param {Boolean} [useTextForOpcodes=false] Whether the opcodes should be text.
    */
    constructor(questionStem, instructions, labels, registers, memory, solutionInstructions, expectedRegisterNames, expectedMemoryAddresses, // eslint-disable-line max-params
                registerBaseAddresses, instructionOptions, labelOptions, registerOptions, disabledInstructions, useTextNotInput = false,
                useTextForOpcodes = false) {
        this.questionStem = questionStem;
        this.instructions = instructions;
        this.labels = labels;
        this.registers = registers;
        this.memory = memory;
        this.solutionInstructions = solutionInstructions;
        this.expectedRegisterNames = expectedRegisterNames;
        this.expectedMemoryAddresses = expectedMemoryAddresses;
        this.registerBaseAddresses = registerBaseAddresses;
        this.instructionOptions = instructionOptions;
        this.labelOptions = labelOptions;
        this.registerOptions = registerOptions;
        this.disabledInstructions = disabledInstructions;
        this.useTextNotInput = useTextNotInput;
        this.useTextForOpcodes = useTextForOpcodes;
    }
}
