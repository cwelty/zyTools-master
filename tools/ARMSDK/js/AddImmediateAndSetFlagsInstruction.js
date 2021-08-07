'use strict';

/* exported buildAddImmediateAndSetFlagsInstructionPrototype */
/* global AddImmediateInstruction, updateConditionalFlagsForAddition */

/**
    Instruction to add with an immediate value, and set conditional flags.
    @class AddImmediateAndSetFlagsInstruction
    @extends AddImmediateInstruction
*/
function AddImmediateAndSetFlagsInstruction() {
    AddImmediateInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit AddImmediateInstruction and attach prototype functions to AddImmediateAndSetFlagsInstruction.
    @method buildAddImmediateAndSetFlagsInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildAddImmediateAndSetFlagsInstructionPrototype(instructionSetSDK) {
    AddImmediateAndSetFlagsInstruction.prototype = new AddImmediateInstruction();
    AddImmediateAndSetFlagsInstruction.prototype.constructor = AddImmediateAndSetFlagsInstruction;
    AddImmediateAndSetFlagsInstruction.prototype.opcode = 'ADDIS';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @param {Labels} labels The labels of the program on which to execute.
        @param {Object} simulatorContext Miscellaneous context information on the simulation.
        @return {Number} The program counter after execution.
    */
    AddImmediateAndSetFlagsInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const updatedProgramCounter = AddImmediateInstruction.prototype.execute.call(this, registers, memory, programCounter);
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(registers,
            [ this._properties[1] ]
        );
        const firstValue = registerBaseWords[0].getLong();
        const secondValue = window.dcodeIO.Long.fromValue(this._properties[2]);

        updateConditionalFlagsForAddition(firstValue, secondValue, simulatorContext);

        return updatedProgramCounter;
    };
}
