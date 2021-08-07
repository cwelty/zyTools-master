'use strict';

/* exported buildLogicalShiftRightInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Instruction to shift right by a number of bits.
    @class LogicalShiftRightInstruction
    @extends ImmediateFormatInstruction
*/
function LogicalShiftRightInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to LogicalShiftRightInstruction.
    @method buildLogicalShiftRightInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildLogicalShiftRightInstructionPrototype(instructionSetSDK) {
    LogicalShiftRightInstruction.prototype = new ImmediateFormatInstruction();
    LogicalShiftRightInstruction.prototype.constructor = LogicalShiftRightInstruction;
    LogicalShiftRightInstruction.prototype.opcode = 'LSR';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    LogicalShiftRightInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().shiftRight(
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
    LogicalShiftRightInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} >> ${this._properties[2]}`;
    };
}
