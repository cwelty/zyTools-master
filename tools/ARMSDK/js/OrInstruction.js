'use strict';

/* exported buildOrInstructionPrototype */
/* global RegisterFormatInstruction */

/**
    Instruction to OR two registers.
    @class OrInstruction
    @extends RegisterFormatInstruction
*/
function OrInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to OrInstruction.
    @method buildOrInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildOrInstructionPrototype(instructionSetSDK) {
    OrInstruction.prototype = new RegisterFormatInstruction();
    OrInstruction.prototype.constructor = OrInstruction;
    OrInstruction.prototype.opcode = 'ORR';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    OrInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().or(
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
    OrInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} | ${this._properties[2]}`;
    };
}
