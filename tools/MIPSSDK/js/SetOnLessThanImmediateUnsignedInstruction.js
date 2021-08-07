'use strict';

/* exported buildSetOnLessThanImmediateUnsignedInstructionPrototype */
/* global ImmediateFormatInstruction */

/**
    Represent a set on less than immediate instruction that compares via unsigned values.
    @class SetOnLessThanImmediateUnsignedInstruction
    @extends ImmediateFormatInstruction
    @constructor
*/
function SetOnLessThanImmediateUnsignedInstruction(...args) {
    ImmediateFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to SetOnLessThanImmediateUnsignedInstruction.
    @method buildSetOnLessThanImmediateUnsignedInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildSetOnLessThanImmediateUnsignedInstructionPrototype(instructionSetSDK) {
    SetOnLessThanImmediateUnsignedInstruction.prototype = new ImmediateFormatInstruction();
    SetOnLessThanImmediateUnsignedInstruction.prototype.constructor = SetOnLessThanImmediateUnsignedInstruction;
    SetOnLessThanImmediateUnsignedInstruction.prototype.opcode = 'sltiu';

    /**
        Execute a set on less than immediate by comparing using unsigned values.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    SetOnLessThanImmediateUnsignedInstruction.prototype.execute = function(registers, memory, programCounter) {
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1] ]
        );
        const setValue = registerBaseWords[1].isLessThanUnsigned(this._properties[2]) ? 1 : 0;

        registerBaseWords[0].setValue(setValue);

        return (programCounter + 1);
    };

    /**
        Return a comment representing this instruction of the form: if ($s2 < 400) $s1 = 1; else $s1 = 0
        @method toComment
        @return {String} A comment representing this instruction.
    */
    SetOnLessThanImmediateUnsignedInstruction.prototype.toComment = function() {
        return `# if (${this._properties[1]} < ${this._properties[2]}) ${this._properties[0]} = 1;\n# else ${this._properties[0]} = 0`;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    SetOnLessThanImmediateUnsignedInstruction.prototype.getOpcodeBits = function() {
        return '001011';
    };
}
