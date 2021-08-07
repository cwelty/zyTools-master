'use strict';

/* exported buildSubtractImmediateInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to SUB with an immediate value.
    @class SubtractImmediateInstruction
    @extends ImmediateFormatInstruction
*/
function SubtractImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to SubtractImmediateInstruction.
    @method buildSubtractImmediateInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildSubtractImmediateInstructionPrototype(instructionSetSDK) {
    SubtractImmediateInstruction.prototype = new ImmediateFormatInstruction();
    SubtractImmediateInstruction.prototype.constructor = SubtractImmediateInstruction;
    SubtractImmediateInstruction.prototype.opcode = 'SUBI';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    SubtractImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().subtractImmediate(
            registers,

            // destinationRegister
            this._properties[0],

            // sourceRegister
            this._properties[1],

            // immediate
            this._properties[2]
        );
        return (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    SubtractImmediateInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} - ${this._properties[2]}`;
    };
}
