/*
    BranchIfNotEqualInstruction inherits BranchFormatInstruction.
    See BranchFormatInstruction for details.
*/
function BranchIfNotEqualInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfNotEqualInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildBranchIfNotEqualInstructionPrototype(instructionSetSDK) {
    BranchIfNotEqualInstruction.prototype = new BranchFormatInstruction();
    BranchIfNotEqualInstruction.prototype.constructor = BranchIfNotEqualInstruction;
    BranchIfNotEqualInstruction.prototype.opcode = 'bne';

    // See InstructionSetSDK's Instruction for details.
    BranchIfNotEqualInstruction.prototype.execute = function(registers, memory, programCounter) {
        var registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1] ]
        );
        return (registerBaseWords[0].equals(registerBaseWords[1]) ? ++programCounter : this._properties[2]);
    };

    // See InstructionSetSDK's Instruction for details.
    BranchIfNotEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} != ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    BranchIfNotEqualInstruction.prototype.getOpcodeBits = function() {
        return '000101';
    };
}
