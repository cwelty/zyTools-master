'use strict';

/* exported buildBranchRegisterLabelFormatInstructionPrototype */
/* global BranchRegisterLabelFormatInstruction, REGISTER_THEN_COMMA, LABEL_ONLY, REGISTER_NAME_ORDER */

/**
    Abstract class for instructions with format: Opcode Register Label. Ex: CBZ X1 L1
    @class BranchRegisterLabelFormatInstruction
    @extends InstructionSetSDK.Instruction
*/
function BranchRegisterLabelFormatInstruction() {
    this.newInstruction.constructor.apply(this, arguments); // eslint-disable-line

    this._printProperties = [ REGISTER_THEN_COMMA, LABEL_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to BranchRegisterLabelFormatInstruction.
    @method buildBranchRegisterLabelFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildBranchRegisterLabelFormatInstructionPrototype(instructionSetSDK) {
    BranchRegisterLabelFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    BranchRegisterLabelFormatInstruction.prototype.constructor = BranchRegisterLabelFormatInstruction;
    BranchRegisterLabelFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    BranchRegisterLabelFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'label' ];
    BranchRegisterLabelFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    BranchRegisterLabelFormatInstruction.prototype.expectedTokenNameOrder = [ 'register', 'comma', 'word' ];

    /**
        Convert the instruction to a string.
        See InstructionSetSDK's Instruction for details.
        @method toString
        @return {String} The instruction as a string.
    */
    BranchRegisterLabelFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]} ${this._properties[1]}`;
    };

    /**
        Jump instructions does not use registers or constants.
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    BranchRegisterLabelFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
    };
}
