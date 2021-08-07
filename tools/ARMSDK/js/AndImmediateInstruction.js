'use strict';

/* exported buildAndImmediateInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to AND with an immediate value.
    @class AndImmediateInstruction
    @extends ImmediateFormatInstruction
*/
function AndImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to AndImmediateInstruction.
    @method buildAndImmediateInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildAndImmediateInstructionPrototype(instructionSetSDK) {
    AndImmediateInstruction.prototype = new ImmediateFormatInstruction();
    AndImmediateInstruction.prototype.constructor = AndImmediateInstruction;
    AndImmediateInstruction.prototype.opcode = 'ANDI';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    AndImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().andImmediate(
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
    AndImmediateInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} & ${this._properties[2]}`;
    };
}
