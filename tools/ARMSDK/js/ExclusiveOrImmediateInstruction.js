'use strict';

/* exported buildExclusiveOrImmediateInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to EOR with an immediate value.
    @class ExclusiveOrImmediateInstruction
    @extends ImmediateFormatInstruction
*/
function ExclusiveOrImmediateInstruction(...args) {
    ImmediateFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to ExclusiveOrImmediateInstruction.
    @method buildExclusiveOrImmediateInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildExclusiveOrImmediateInstructionPrototype(instructionSetSDK) {
    ExclusiveOrImmediateInstruction.prototype = new ImmediateFormatInstruction();
    ExclusiveOrImmediateInstruction.prototype.constructor = ExclusiveOrImmediateInstruction;
    ExclusiveOrImmediateInstruction.prototype.opcode = 'EORI';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    ExclusiveOrImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().exclusiveOrImmediate(
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
    ExclusiveOrImmediateInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} ^ ${this._properties[2]}`;
    };
}
