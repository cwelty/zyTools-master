'use strict';

/* exported buildAddAndSetFlagsInstructionPrototype */
/* global AddInstruction, updateConditionalFlagsForAddition */

/**
    Instruction to add two registers, and set conditional flags.
    @class AddAndSetFlagsInstruction
    @extends AddInstruction
*/
function AddAndSetFlagsInstruction() {
    AddInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit AddInstruction and attach prototype functions to AddAndSetFlagsInstruction.
    @method buildAddAndSetFlagsInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildAddAndSetFlagsInstructionPrototype(instructionSetSDK) {
    AddAndSetFlagsInstruction.prototype = new AddInstruction();
    AddAndSetFlagsInstruction.prototype.constructor = AddAndSetFlagsInstruction;
    AddAndSetFlagsInstruction.prototype.opcode = 'ADDS';

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
    AddAndSetFlagsInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const updatedProgramCounter = AddInstruction.prototype.execute.call(this, registers, memory, programCounter);
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(registers,
            [ this._properties[1], this._properties[2] ]
        );
        const firstValue = registerBaseWords[0].getLong();
        const secondValue = registerBaseWords[1].getLong();

        updateConditionalFlagsForAddition(firstValue, secondValue, simulatorContext);

        return updatedProgramCounter;
    };
}
