/*
    ARMRegisters inherits InstructionSetSDK's Registers using ARM-specific register addresses and order.
    See InstructionSetSDK's Registers for details.
*/
function ARMRegisters(initialRegistersByAddress) {
    this.newRegisters.constructor.call(this, initialRegistersByAddress, 0, 255);
}

/*
    Inherit InstructionSetSDK's Registers and attach prototype functions to ARMRegisters.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildARMRegistersPrototype(instructionSetSDK) {
    ARMRegisters.prototype = instructionSetSDK.inheritRegisters();
    ARMRegisters.prototype.constructor = ARMRegisters;
    ARMRegisters.prototype.newRegisters = instructionSetSDK.inheritRegisters();
    ARMRegisters.prototype.REGISTER_NAME_TO_ADDRESS = REGISTER_NAME_TO_ADDRESS;
    ARMRegisters.prototype.REGISTER_NAME_ORDER = REGISTER_NAME_ORDER;

    // XZR's byte addresses are read only.
    ARMRegisters.prototype.readOnlyByteAddresses = [ 248, 249, 250, 251, 252, 253, 254, 255 ];

    /*
        Return an ARM register, which is a DoubleWord.
        See InstructionSDK's Registers for details.
    */
    ARMRegisters.prototype._lookupRegister = function(address) {
        return this.lookupDoubleWord(address);
    };

    // Return a clone, including a copy of each Word.
    ARMRegisters.prototype.clone = function() {
        return this.newRegisters.clone.call(this, new ARMRegisters());
    };
}
