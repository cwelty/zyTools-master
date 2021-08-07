'use strict';

/* exported buildBranchLabelFormatInstructionPrototype */
/* global BranchLabelFormatInstruction, LABEL_ONLY */

/**
    Abstract class for instructions with format: Opcode Label. Ex: B L1
    @class BranchLabelFormatInstruction
    @extends InstructionSDK.Instruction
*/
function BranchLabelFormatInstruction() {
    this.newInstruction.constructor.apply(this, arguments); // eslint-disable-line

    this._printProperties = [ LABEL_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to BranchLabelFormatInstruction.
    @method buildBranchLabelFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildBranchLabelFormatInstructionPrototype(instructionSetSDK) {
    BranchLabelFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    BranchLabelFormatInstruction.prototype.constructor = BranchLabelFormatInstruction;
    BranchLabelFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    BranchLabelFormatInstruction.prototype._propertiesConfiguration = [ 'label' ];
    BranchLabelFormatInstruction.prototype._validRegisters = [];
    BranchLabelFormatInstruction.prototype.expectedTokenNameOrder = [ 'word' ];

    /**
        Convert the instruction to a string.
        See InstructionSetSDK's Instruction for details.
        @method toString
        @return {String} The instruction as a string.
    */
    BranchLabelFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}`;
    };

    /**
        Jump instructions does not use registers or constants.
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    BranchLabelFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        return;
    };
}
