'use strict';

/* exported buildMIPSzyRegistersPrototype */
/* global REGISTER_NAME_TO_ADDRESS, REGISTER_NAME_ORDER */

/**
    Modify MIPSRegisters to support registers $zero, $t0-$t6, $ra, $sp, LO, and HI.
    @class MIPSzyRegisters
    @constructor
    @extends MIPSRegisters
    @param {Object} initialRegistersByAddress The initial registers to load with register address as key and register value as key's value.
    @return {void}
*/
function MIPSzyRegisters(initialRegistersByAddress) {
    this.newMIPSRegisters.constructor.call(this, initialRegistersByAddress, 0, 47); // eslint-disable-line

    // LO and HI are not to be shown.
    this.byteAddressesToNotShow = [ '44', '45', '46', '47', '48', '49', '50', '51' ];
}

/**
    Inherit MIPSSDK's Registers and attach prototype functions to MIPSzyRegisters.
    @method buildMIPSzyRegistersPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyRegistersPrototype(MIPSSDK) {
    MIPSzyRegisters.prototype = MIPSSDK.inheritMIPSRegisters();
    MIPSzyRegisters.prototype.constructor = MIPSzyRegisters;
    MIPSzyRegisters.prototype.newMIPSRegisters = MIPSSDK.inheritMIPSRegisters();
    MIPSzyRegisters.prototype.REGISTER_NAME_TO_ADDRESS = REGISTER_NAME_TO_ADDRESS;
    MIPSzyRegisters.prototype.REGISTER_NAME_ORDER = REGISTER_NAME_ORDER;
    MIPSzyRegisters.prototype.validNames = '$zero, $at, $t0-$t6, $ra, and $sp';

    /**
        The address of the last {Word} in the stack.
        @property endOfStack
        @type {Number}
        @default 8188
    */
    MIPSzyRegisters.prototype.endOfStack = 8188;

    /**
        Return a clone, including a copy of each Byte.
        @method clone
        @return {MIPSzyRegisters} Clone of the registers.
    */
    MIPSzyRegisters.prototype.clone = function() {
        return this.newMIPSRegisters.clone.call(this, new MIPSzyRegisters());
    };
}
