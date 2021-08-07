'use strict';

/* exported buildRegisterUtilities, REGISTER_NAME_ORDER, registerToBits, decimalToBits */
/* global numberOfBytesInAddress */

let REGISTER_NAME_TO_ADDRESS = null;
let REGISTER_NAME_ORDER = null;

/**
    Assign values to |REGISTER_NAME_TO_ADDRESS| and |REGISTER_NAME_ORDER|.
    @method buildRegisterUtilities
    @return {void}
*/
function buildRegisterUtilities() {

    // Map of each register name to address.
    REGISTER_NAME_TO_ADDRESS = {
        $zero: 0, $at: 4, $v0: 8, $v1: 12, $a0: 16, $a1: 20, $a2: 24, $a3: 28,
        $t0: 32, $t1: 36, $t2: 40, $t3: 44, $t4: 48, $t5: 52, $t6: 56, $t7: 60,
        $s0: 64, $s1: 68, $s2: 72, $s3: 76, $s4: 80, $s5: 84, $s6: 88, $s7: 92,
        $t8: 96, $t9: 100, $k0: 104, $k1: 108, $gp: 112, $sp: 116, $fp: 120, $ra: 124,
        LO: 128, HI: 132,
    };

    // Array of register names in order.
    REGISTER_NAME_ORDER = Object.keys(REGISTER_NAME_TO_ADDRESS);
}

/**
    Return a bit string representing the given |decimal| and containing the given |numberOfBits|.
    @method decimalToBits
    @param {Number} decimal A decimal value to convert to a bit string.
    @param {Number} numberOfBits The number of bits to have in the returned bit string.
    @return {String} A bit string representing the given |decimal| and containing the given |numberOfBits|.
*/
function decimalToBits(decimal, numberOfBits) {

    // Convert |decimal| to an unsigned integer, then convert the unsigned integer into a bit string.
    let bitString = (decimal >>> 0).toString(2); // eslint-disable-line
    const neededPadding = numberOfBits - bitString.length;

    // If not enough bits, then pad front.
    if (neededPadding > 0) {
        const padString = decimal >= 0 ? '0' : '1';

        bitString = padString.repeat(neededPadding) + bitString;
    }

    // If too many bits, then slice off the extras.
    else if (neededPadding < 0) {
        bitString = bitString.slice(bitString.length - numberOfBits);
    }

    return bitString;
}

/**
    Convert the given register name to a bit string.
    @method registerToBits
    @param {String} registerName The register name to convert a bit string.
    @return {String} The register name as a bit string.
*/
function registerToBits(registerName) {
    const registerByteAddress = REGISTER_NAME_TO_ADDRESS[registerName];
    const decimalRepresentation = registerByteAddress / numberOfBytesInAddress;
    const numberOfBitsForRegister = 5;

    return decimalToBits(decimalRepresentation, numberOfBitsForRegister);
}
