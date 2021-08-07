'use strict';

/* exported buildLogicalShiftLeftInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to shift left by a number of bits.
    @class LogicalShiftLeftInstruction
    @extends ImmediateFormatInstruction
*/
function LogicalShiftLeftInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to LogicalShiftLeftInstruction.
    @method buildLogicalShiftLeftInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildLogicalShiftLeftInstructionPrototype(instructionSetSDK) {
    LogicalShiftLeftInstruction.prototype = new ImmediateFormatInstruction();
    LogicalShiftLeftInstruction.prototype.constructor = LogicalShiftLeftInstruction;
    LogicalShiftLeftInstruction.prototype.opcode = 'LSL';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    LogicalShiftLeftInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().shiftLeft(
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
    LogicalShiftLeftInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} << ${this._properties[2]}`;
    };
}
