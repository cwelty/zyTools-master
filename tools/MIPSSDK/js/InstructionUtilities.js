'use strict';

/* exported buildInstructionUtilities, REGISTER_ONLY, REGISTER_THEN_COMMA, INPUT_ONLY, INPUT_THEN_REGISTER, LABEL_ONLY,
   TEXT_THEN_REGISTER */

// Constants used by FormatInstruction objects to print an instruction with instruction.hbs.
let REGISTER_ONLY = null;
let REGISTER_THEN_COMMA = null;
let INPUT_ONLY = null;
let INPUT_THEN_REGISTER = null;
let LABEL_ONLY = null;
let TEXT_THEN_REGISTER = null;

/**
    Add values to the constants used for printing an instruction.
    @method buildInstructionUtilities
    @return {void}
*/
function buildInstructionUtilities() {
    INPUT_ONLY = {
        useInput: true,
    };
    INPUT_THEN_REGISTER = {
        alsoUseRegister: true,
        useInput: true,
    };
    LABEL_ONLY = {
        useLabel: true,
    };
    TEXT_THEN_REGISTER = {
        alsoUseRegister: true,
        justNumber: true,
        useInput: true,
    };
    REGISTER_ONLY = {
        useRegister: true,
    };
    REGISTER_THEN_COMMA = {
        useComma: true,
        useRegister: true,
    };
}
