'use strict';

/* global numberOfBytesInAddress */

/*
    MIPSMemory extends InstructionSetSDK's Memory and stores addresses 0 through (2^32 - 1).
    See InstructionSetSDK's Memory for details.
*/
function MIPSMemory(initialBytesByAddress) {
    this.newMemory.constructor.call(this, initialBytesByAddress, 0, 4294967295);
}

/*
    Inherit InstructionSetSDK's Memory and attach prototype functions to MIPSMemory.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildMIPSMemoryPrototype(instructionSetSDK) {
    MIPSMemory.prototype = instructionSetSDK.inheritMemory();
    MIPSMemory.prototype.constructor = MIPSMemory;
    MIPSMemory.prototype.newMemory = instructionSetSDK.inheritMemory();
    MIPSMemory.prototype.validNames = '0 - 4294967292';

    // Number of bytes that should be printed per memory address in MemoryController.
    MIPSMemory.prototype.bytesPrintedPerAddress = numberOfBytesInAddress;

    /**
        Return a clone, including a copy of each Byte.
        @method clone
        @param {MIPSMemory} [newMemory=null] The memory to clone.
        @return {MIPSMemory} The cloned memory.
    */
    MIPSMemory.prototype.clone = function(newMemory = null) {
        const memoryToClone = newMemory || new MIPSMemory();

        return this.newMemory.clone.call(this, memoryToClone);
    };

    /**
        Lookup the given address and return the bytes stored at that address.
        @method _lookupAddress
        @private
        @param {Number} address Or {Long} or {String}. The address to lookup.
        @return {Word} The bytes stored at the given address.
    */
    MIPSMemory.prototype._lookupAddress = function(address) {
        return this.lookupWord(address);
    };
}
