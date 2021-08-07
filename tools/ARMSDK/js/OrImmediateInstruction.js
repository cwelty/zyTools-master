'use strict';

/* exported buildOrImmediateInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to OR with an immediate value.
    @class OrImmediateInstruction
    @extends ImmediateFormatInstruction
*/
function OrImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to OrImmediateInstruction.
    @method buildOrImmediateInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildOrImmediateInstructionPrototype(instructionSetSDK) {
    OrImmediateInstruction.prototype = new ImmediateFormatInstruction();
    OrImmediateInstruction.prototype.constructor = OrImmediateInstruction;
    OrImmediateInstruction.prototype.opcode = 'ORRI';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    OrImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().orImmediate(
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
    OrImmediateInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} | ${this._properties[2]}`;
    };
}
