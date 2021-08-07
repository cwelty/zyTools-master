'use strict';

/* exported buildRegisterUtilities, REGISTER_NAME_ORDER */

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
        $zero: 0, $at: 4, $t0: 8, $t1: 12, $t2: 16, $t3: 20, $t4: 24, $t5: 28, $t6: 32, $sp: 36, $ra: 40, LO: 44, HI: 48,
    };

    // Array of register names in order.
    REGISTER_NAME_ORDER = Object.keys(REGISTER_NAME_TO_ADDRESS);
}
