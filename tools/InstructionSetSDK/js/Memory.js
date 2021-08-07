'use strict';

/* global InstructionSetSDKError */

/*
    Memory extends InstructionSetSDK's Storage by adding |bytesPrintedPerAddress|.

    See Storage for details.
*/
function Memory(initialBytesByAddress, smallestAddress, largestAddress) {
    Storage.prototype.constructor.call(this, initialBytesByAddress, smallestAddress, largestAddress);

    /**
        The start of instruction memory.
        @property instructionStartAddress
        @type {Number}
        @default null
    */
    this.instructionStartAddress = null;

    /**
        The end of instruction memory.
        @property instructionEndAddress
        @type {Number}
        @default null
    */
    this.instructionEndAddress = null;
}

/*
    Inherit InstructionSetSDK's Storage and attach prototype functions to Memory.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildMemoryPrototype(instructionSetSDK) {
    Memory.prototype = new Storage();
    Memory.prototype.constructor = Memory;

    /**
        The name of this memory.
        @property storageName
        @type {String}
        @default 'Memory'
    */
    Memory.prototype.storageName = 'Memory';

    // Number of bytes that should be printed per memory address in MemoryController.
    Memory.prototype.bytesPrintedPerAddress = null;

    /*
        Return a clone, including a copy of each Byte.
        |newMemory| is required and a Memory object.
    */
    Memory.prototype.clone = function(newMemory) {
        return Storage.prototype.clone.call(this, newMemory);
    };

    /**
        Verify the given address is an integer, then lookup the given address.
        @method lookupAddress
        @param {Number} address Or {Long} or {String}. The address to lookup.
        @return {BaseWord} The bytes stored at the given address.
    */
    Memory.prototype.lookupAddress = function(address) {
        const addressAsString = address.toString();
        const isAddressAnInteger = addressAsString.match(/^-?\d+$/);

        if (!isAddressAnInteger) {
            throw new InstructionSetSDKError(`Invalid address: ${address}`, 'InvalidAddressName');
        }

        return this._lookupAddress(address);
    };

    /**
        Lookup the given address and return the bytes stored at that address.
        The inheriting class should define this.
        @method _lookupAddress
        @private
        @param {Number} address Or {Long} or {String}. The address to lookup.
        @return {BaseWord} The bytes stored at the given address.
    */
    Memory.prototype._lookupAddress = function(address) { // eslint-disable-line
        throw new Error('Memory\'s _lookupAddress should not be called.');
    };

    /**
        Set the start and end address for the instruction memory. These addresses cannot be read or written to.
        @method addInstructionMemoryBoundaries
        @param {Number} startAddress The first address of instruction memory.
        @param {Number} endAddress The last address of instruction memory.
        @return {void}
    */
    Memory.prototype.setInstructionMemoryBoundaries = function(startAddress, endAddress) {
        this.instructionStartAddress = startAddress;
        this.instructionEndAddress = endAddress;

        // Do not show instruction memory addresses.
        for (let address = startAddress; address < endAddress; ++address) {
            this.byteAddressesToNotShow.push(address);
        }
    };

    /**
        Throw an error if the address is forbidden, such as if the address is instruction memory.
        @method _errorIfAddressIsForbidden
        @private
        @param {Long} byteAddress The address being checked.
        @return {void}
    */
    Memory.prototype._errorIfAddressIsForbidden = function(byteAddress) {

        // Throw error if address is in instruction memory.
        if ((this.instructionStartAddress !== null) && (this.instructionEndAddress !== null)) {
            if ((byteAddress >= this.instructionStartAddress) && (byteAddress <= this.instructionEndAddress)) {
                throw new InstructionSetSDKError(`Accessing instruction memory is forbidden. Tried to access memory address: ${byteAddress}`); // eslint-disable-line max-len
            }
        }
    };
}
