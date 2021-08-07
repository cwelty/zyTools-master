'use strict';

/* exported buildMIPSzyCodeControllerPrototype */
/* global MIPSzyInstructionFactory */

/**
    Control UI for MIPSzy coding area.
    @class MIPSzyCodeController
    @extends MIPSCodeController
    @constructor
*/
function MIPSzyCodeController(...args) {
    require('MIPSSDK').create().inheritCodeController().constructor.apply(this, args);
}

/**
    Inherit MIPSSDK's CodeController and attach prototype functions to MIPSzyCodeController.
    @param {MIPSSDK} MIPSSDK Reference to MIPSSDK.
    @return {void}
*/
function buildMIPSzyCodeControllerPrototype(MIPSSDK) {
    MIPSzyCodeController.prototype = MIPSSDK.inheritCodeController();
    MIPSzyCodeController.prototype.constructor = MIPSzyCodeController;
    MIPSzyCodeController.prototype.instructionFactory = new MIPSzyInstructionFactory();
}
