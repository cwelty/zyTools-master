'use strict';

/* exported buildExclusiveOrInstructionPrototype */
/* global RegisterFormatInstruction */

/**
    Instruction to Exclusive OR two registers.
    @class ExclusiveOrInstruction
    @extends RegisterFormatInstruction
*/
function ExclusiveOrInstruction(...args) {
    RegisterFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to ExclusiveOrInstruction.
    @method buildExclusiveOrInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildExclusiveOrInstructionPrototype(instructionSetSDK) {
    ExclusiveOrInstruction.prototype = new RegisterFormatInstruction();
    ExclusiveOrInstruction.prototype.constructor = ExclusiveOrInstruction;
    ExclusiveOrInstruction.prototype.opcode = 'EOR';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    ExclusiveOrInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().xor(
            registers,

            // destinationRegister
            this._properties[0],

            // sourceRegister1
            this._properties[1],

            // sourceRegister2
            this._properties[2]
        );
        return (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    ExclusiveOrInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} ^ ${this._properties[2]}`;
    };
}
