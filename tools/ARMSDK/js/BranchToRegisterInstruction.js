'use strict';

/* exported buildBranchToRegisterInstructionPrototype */
/* global REGISTER_NAME_ORDER, REGISTER_ONLY, numberOfBytesInAddress */

/**
    Branch to the instruction located at the address stored in the given register.
    See InstructionSetSDK's Instruction for details.
    @class BranchToRegisterInstruction
    @constructor
*/
function BranchToRegisterInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);
    this._printProperties = [ REGISTER_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to BranchToRegisterInstruction.
    @method buildBranchToRegisterInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildBranchToRegisterInstructionPrototype(instructionSetSDK) {
    BranchToRegisterInstruction.prototype = instructionSetSDK.inheritInstruction();
    BranchToRegisterInstruction.prototype.constructor = BranchToRegisterInstruction;
    BranchToRegisterInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    BranchToRegisterInstruction.prototype._propertiesConfiguration = [ 'register' ];
    BranchToRegisterInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    BranchToRegisterInstruction.prototype.expectedTokenNameOrder = [ 'register' ];
    BranchToRegisterInstruction.prototype.opcode = 'BR';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @return {String} The label to jump to.
    */
    BranchToRegisterInstruction.prototype.execute = function(registers, memory) {
        const instructionAddressToJumpTo = registers.lookupByRegisterName(this._properties[0]).getUnsignedValue();

        if ((instructionAddressToJumpTo % numberOfBytesInAddress) !== 0) {
            throw new Error(`Instruction addresses should be word-aligned. Tried to access: ${instructionAddressToJumpTo}`);
        }

        return (instructionAddressToJumpTo - memory.instructionStartAddress) / numberOfBytesInAddress;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchToRegisterInstruction.prototype.toComment = function() {
        return `// go to ${this._properties[0]}`;
    };

    // See InstructionSetSDK's Instruction for details.
    BranchToRegisterInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    BranchToRegisterInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
    };
}
