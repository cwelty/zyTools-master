'use strict';

/* exported buildAndInstructionPrototype */
/* global RegisterFormatInstruction */

/**
    Instruction to AND two registers.
    @class AndInstruction
    @extends RegisterFormatInstruction
*/
function AndInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to AndInstruction.
    @method buildAndInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildAndInstructionPrototype(instructionSetSDK) {
    AndInstruction.prototype = new RegisterFormatInstruction();
    AndInstruction.prototype.constructor = AndInstruction;
    AndInstruction.prototype.opcode = 'AND';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    AndInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().and(
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
    AndInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} & ${this._properties[2]}`;
    };
}
