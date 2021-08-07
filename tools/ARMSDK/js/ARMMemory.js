/*
    ARMMemory extends InstructionSetSDK's Memory and stores addresses 0 through (2^62 - 1).
    See InstructionSetSDK's Memory for details.
*/
function ARMMemory(initialBytesByAddress) {

    // |largestAddress| is 2^62 - 1, which is the same as (1 << 62) - 1.
    const exponent = 62;
    const largestAddress = window.dcodeIO.Long.fromNumber(1).shiftLeft(exponent).subtract(1);

    this.newMemory.constructor.call(this, initialBytesByAddress, 0, largestAddress);
}

/*
    Inherit InstructionSetSDK's Memory and attach prototype functions to ARMMemory.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildARMMemoryPrototype(instructionSetSDK) {
    ARMMemory.prototype = instructionSetSDK.inheritMemory();
    ARMMemory.prototype.constructor = ARMMemory;
    ARMMemory.prototype.newMemory = instructionSetSDK.inheritMemory();

    // Number of bytes that should be printed per memory address in MemoryController.
    ARMMemory.prototype.bytesPrintedPerAddress = 8;

    // Return a clone, including a copy of each Byte.
    ARMMemory.prototype.clone = function() {
        return this.newMemory.clone.call(this, new ARMMemory());
    };

    /**
        Lookup the given address and return the bytes stored at that address.
        @method _lookupAddress
        @private
        @param {Number} address Or {Long} or {String}. The address to lookup.
        @return {DoubleWord} The bytes stored at the given address.
    */
    ARMMemory.prototype._lookupAddress = function(address) {
        return this.lookupDoubleWord(address);
    };
}
