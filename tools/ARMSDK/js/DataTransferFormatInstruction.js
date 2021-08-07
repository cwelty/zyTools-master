'use strict';

/* exported buildDataTransferFormatInstructionPrototype, */
/* global REGISTER_THEN_COMMA, REGISTER_THEN_INPUT, REGISTER_NAME_ORDER */

/**
    DataTransferFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class DataTransferFormatInstruction
    @constructor
*/
function DataTransferFormatInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);

    this._printProperties = [
        REGISTER_THEN_COMMA,
        REGISTER_THEN_INPUT,
    ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to DataTransferFormatInstruction.
    @method buildDataTransferFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildDataTransferFormatInstructionPrototype(instructionSetSDK) {
    DataTransferFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    DataTransferFormatInstruction.prototype.constructor = DataTransferFormatInstruction;
    DataTransferFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    DataTransferFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'constant' ];
    DataTransferFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    DataTransferFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'openBracket', 'register', 'comma', '#', 'number', 'closeBracket',
    ];

    // See InstructionSetSDK's Instruction for details.
    DataTransferFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}, [${this._properties[1]}, #${this._properties[2]}]`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    DataTransferFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);

        const addressBits = 9;

        this._checkWhetherConstantValueIsNBitSigned(this._properties[2], addressBits);
    };
}
