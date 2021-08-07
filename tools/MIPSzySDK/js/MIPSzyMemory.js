'use strict';

/* exported buildMIPSzyMemoryPrototype */

/**
    Memory representation for a MIPSzy architecture.
    @class MIPSzyMemory
    @extends MIPSMemory
    @constructor
    @param {Object} initialBytesByAddress Dictionary of initial byte address values.
    @return {void}
*/
function MIPSzyMemory(initialBytesByAddress) {
    const largestAddressName = 4294967295;
    const largestInstructionAddress = 4095;

    this.newMIPSMemory.constructor.call(this, initialBytesByAddress, 0, largestAddressName);
    this.setInstructionMemoryBoundaries(0, largestInstructionAddress);
}

/**
    Inherit MIPSSDK's Memory and attach prototype functions to MIPSzyMemory.
    @method buildMIPSzyMemoryPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPSSDK.
    @return {void}
*/
function buildMIPSzyMemoryPrototype(MIPSSDK) {
    MIPSzyMemory.prototype = MIPSSDK.inheritMIPSMemory();
    MIPSzyMemory.prototype.constructor = MIPSzyMemory;
    MIPSzyMemory.prototype.newMIPSMemory = MIPSSDK.inheritMIPSMemory();
    MIPSzyMemory.prototype.validNames = '4096 - 4294967292';

    /**
        The name of this memory.
        @property storageName
        @type {String}
        @default 'Data memory'
    */
    MIPSzyMemory.prototype.storageName = 'Data memory';

    /**
        Return a clone, including a copy of each Byte.
        @method clone
        @return {MIPSzyMemory} The cloned memory.
    */
    MIPSzyMemory.prototype.clone = function() {
        return this.newMIPSMemory.clone.call(this, new MIPSzyMemory());
    };

    /**
        Return the word stored at the given address.
        @method lookupWord
        @param {Number} address The address to look up. May also be a {Long}.
        @return {Word} The word stored at the given address.
    */
    MIPSzyMemory.prototype.lookupWord = function(address) {
        const longAddress = this._convertToLong(address);
        const isMultipleOf4 = (longAddress.getLowBits() % 4) === 0; // eslint-disable-line no-magic-numbers

        // MIPSzy only allows accessing addresses with a multiple of 4. Ex: 5000 (allowed) vs 5003 (not allowed).
        if (!isMultipleOf4) {
            throw new Error(`Memory addresses in MIPSzy should be word-aligned. Tried to access: ${address}`);
        }

        return this.newMIPSMemory.lookupWord.call(this, longAddress);
    };
}
