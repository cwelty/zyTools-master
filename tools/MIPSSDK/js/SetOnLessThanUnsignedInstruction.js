'use strict';

/* exported buildSetOnLessThanUnsignedInstructionPrototype */
/* global RegisterFormatInstruction */

/**
    Represent a set on less than instruction that compares via unsigned values.
    @class SetOnLessThanUnsignedInstruction
    @extends RegisterFormatInstruction
    @constructor
*/
function SetOnLessThanUnsignedInstruction(...args) {
    RegisterFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to SetOnLessThanUnsignedInstruction.
    @method buildSetOnLessThanUnsignedInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildSetOnLessThanUnsignedInstructionPrototype(instructionSetSDK) {
    SetOnLessThanUnsignedInstruction.prototype = new RegisterFormatInstruction();
    SetOnLessThanUnsignedInstruction.prototype.constructor = SetOnLessThanUnsignedInstruction;
    SetOnLessThanUnsignedInstruction.prototype.opcode = 'sltu';

    /**
        Execute a set on less than by comparing using unsigned values.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    SetOnLessThanUnsignedInstruction.prototype.execute = function(registers, memory, programCounter) {
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1], this._properties[2] ]
        );
        const setValue = registerBaseWords[1].isLessThanUnsigned(registerBaseWords[2]) ? 1 : 0;

        registerBaseWords[0].setValue(setValue);

        return (programCounter + 1);
    };

    /**
        Return a comment representing this instruction of the form: if ($s2 < $s3) $s1 = 1; else $s1 = 0
        @method toComment
        @return {String} A comment representing this instruction.
    */
    SetOnLessThanUnsignedInstruction.prototype.toComment = function() {
        return `# if (${this._properties[1]} < ${this._properties[2]}) ${this._properties[0]} = 1;\n# else ${this._properties[0]} = 0`;
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    SetOnLessThanUnsignedInstruction.prototype.getFunctionBits = function() {
        return '101011';
    };
}
