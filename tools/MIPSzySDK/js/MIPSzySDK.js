'use strict';

/* global buildMIPSzyRegistersPrototype, MIPSzyRegisters, buildRegisterUtilities, buildMIPSzyBranchIfGreaterInstructionPrototype,
   MIPSzyBranchIfGreaterInstruction, buildMIPSzyBranchIfGreaterOrEqualInstructionPrototype, buildMIPSzyBranchIfLessInstructionPrototype,
   buildMIPSzyBranchIfLessOrEqualInstructionPrototype, MIPSzyBranchIfGreaterOrEqualInstruction, MIPSzyBranchIfLessInstruction,
   MIPSzyBranchIfLessOrEqualInstruction, buildMIPSzyInstructionFactoryPrototype, MIPSzyInstructionFactory, buildMIPSzyMemoryPrototype,
   MIPSzyMemory, MIPSzyCodeController, buildMIPSzyCodeControllerPrototype, buildMIPSzyJumpInstructionPrototype,
   buildMIPSzyJumpAndLinkInstructionPrototype, buildMIPSzyJumpRegisterInstructionPrototype, MIPSzyJumpInstruction,
   MIPSzyJumpAndLinkInstruction, MIPSzyJumpRegisterInstruction, buildMIPSzyBranchIfEqualInstructionPrototype,
   buildMIPSzyBranchIfNotEqualInstructionPrototype, MIPSzyBranchIfEqualInstruction, MIPSzyBranchIfNotEqualInstruction */

/**
    MIPSzy is an assembly language used in zyBook's Computer Organization Essentials.
    @module MIPSzySDK
    @extends MIPSSDK
    @return {void}
*/
function MIPSzySDK() {} // eslint-disable-line no-empty-function

/**
    Inherit MIPSSDK and attach functions to MIPSzySDK's prototype.
    @method buildMIPSzySDKPrototype
    @return {void}
*/
function buildMIPSzySDKPrototype() {
    MIPSzySDK.prototype = require('MIPSSDK').inherit();
    MIPSzySDK.prototype.constructor = MIPSzySDK;

    const MIPSSDK = require('MIPSSDK').create();

    buildRegisterUtilities();
    buildMIPSzyRegistersPrototype(MIPSSDK);
    buildMIPSzyMemoryPrototype(MIPSSDK);

    // Build instructions.
    buildMIPSzyBranchIfGreaterInstructionPrototype(MIPSSDK);
    buildMIPSzyBranchIfGreaterOrEqualInstructionPrototype(MIPSSDK);
    buildMIPSzyBranchIfLessInstructionPrototype(MIPSSDK);
    buildMIPSzyBranchIfLessOrEqualInstructionPrototype(MIPSSDK);
    buildMIPSzyInstructionFactoryPrototype(MIPSSDK);
    buildMIPSzyJumpInstructionPrototype(MIPSSDK);
    buildMIPSzyJumpAndLinkInstructionPrototype(MIPSSDK);
    buildMIPSzyJumpRegisterInstructionPrototype(MIPSSDK);
    buildMIPSzyBranchIfEqualInstructionPrototype(MIPSSDK);
    buildMIPSzyBranchIfNotEqualInstructionPrototype(MIPSSDK);

    buildMIPSzyCodeControllerPrototype(MIPSSDK);

    /**
        Return a reference to the newly created MIPSzyRegisters object.
        @method createRegisters
        @return {MIPSzyRegisters} Reference to the created MIPSzyRegisters object.
    */
    MIPSzySDK.prototype.createRegisters = function(...args) {
        const registers = Object.create(MIPSzyRegisters.prototype);

        MIPSzyRegisters.apply(registers, args);

        return registers;
    };

    /**
        Return a reference to the newly created MIPSzyMemory object.
        @method createMemory
        @return {MIPSzyRegisters} Reference to the created MIPSzyMemory object.
    */
    MIPSzySDK.prototype.createMemory = function(...args) {
        const memory = Object.create(MIPSzyMemory.prototype);

        MIPSzyMemory.apply(memory, args);

        return memory;
    };

    /**
        Return a reference to the newly created MIPSzyInstructionFactory object.
        @method createInstructionFactory
        @return {MIPSzyInstructionFactory} Reference to the created MIPSzyInstructionFactory object.
    */
    MIPSzySDK.prototype.createInstructionFactory = function(...args) {
        const instructionFactory = Object.create(MIPSzyInstructionFactory.prototype);

        MIPSzyInstructionFactory.apply(instructionFactory, args);

        return instructionFactory;
    };

    /**
        Return a reference to a new MIPSzyBranchIfGreaterOrEqualInstruction object that was created with passed parameters.
        @method createBranchIfGreaterOrEqualInstruction
        @return {MIPSzyBranchIfGreaterOrEqualInstruction} Reference to a new MIPSzyBranchIfGreaterOrEqualInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfGreaterOrEqualInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfGreaterOrEqualInstruction.prototype);

        MIPSzyBranchIfGreaterOrEqualInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyBranchIfGreaterInstruction object that was created with passed parameters.
        @method createBranchIfGreaterInstruction
        @return {MIPSzyBranchIfGreaterInstruction} Reference to a new MIPSzyBranchIfGreaterInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfGreaterInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfGreaterInstruction.prototype);

        MIPSzyBranchIfGreaterInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyBranchIfLessOrEqualInstruction object that was created with passed parameters.
        @method createBranchIfLessOrEqualInstruction
        @return {MIPSzyBranchIfLessOrEqualInstruction} Reference to a new MIPSzyBranchIfLessOrEqualInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfLessOrEqualInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfLessOrEqualInstruction.prototype);

        MIPSzyBranchIfLessOrEqualInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyBranchIfLessInstruction object that was created with passed parameters.
        @method createBranchIfLessInstruction
        @return {MIPSzyBranchIfLessInstruction} Reference to a new MIPSzyBranchIfLessInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfLessInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfLessInstruction.prototype);

        MIPSzyBranchIfLessInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyBranchIfEqualInstruction object that was created with passed parameters.
        @method createBranchIfEqualInstruction
        @return {MIPSzyBranchIfEqualInstruction} Reference to a new MIPSzyBranchIfEqualInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfEqualInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfEqualInstruction.prototype);

        MIPSzyBranchIfEqualInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyBranchIfNotEqualInstruction object that was created with passed parameters.
        @method createBranchIfNotEqualInstruction
        @return {MIPSzyBranchIfNotEqualInstruction} Reference to a new MIPSzyBranchIfNotEqualInstruction object.
    */
    MIPSzySDK.prototype.createBranchIfNotEqualInstruction = function(...args) {
        const instruction = Object.create(MIPSzyBranchIfNotEqualInstruction.prototype);

        MIPSzyBranchIfNotEqualInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyJumpInstruction object that was created with passed parameters.
        @method createJumpInstruction
        @return {MIPSzyJumpInstruction} Reference to a new MIPSzyJumpInstruction object.
    */
    MIPSzySDK.prototype.createJumpInstruction = function(...args) {
        const instruction = Object.create(MIPSzyJumpInstruction.prototype);

        MIPSzyJumpInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyJumpAndLinkInstruction object that was created with passed parameters.
        @method createJumpAndLinkInstruction
        @return {MIPSzyJumpAndLinkInstruction} Reference to a new MIPSzyJumpAndLinkInstruction object.
    */
    MIPSzySDK.prototype.createJumpAndLinkInstruction = function(...args) {
        const instruction = Object.create(MIPSzyJumpAndLinkInstruction.prototype);

        MIPSzyJumpAndLinkInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyJumpRegisterInstruction object that was created with passed parameters.
        @method createJumpRegisterInstruction
        @return {MIPSzyJumpRegisterInstruction} Reference to a new MIPSzyJumpRegisterInstruction object.
    */
    MIPSzySDK.prototype.createJumpRegisterInstruction = function(...args) {
        const instruction = Object.create(MIPSzyJumpRegisterInstruction.prototype);

        MIPSzyJumpRegisterInstruction.apply(instruction, args);

        return instruction;
    };

    /**
        Return a reference to a new MIPSzyCodeController object that was created with passed parameters.
        @method createCodeController
        @return {MIPSzyCodeController} Reference to a new MIPSzyCodeController object.
    */
    MIPSzySDK.prototype.createCodeController = function(...args) {
        const instructionsController = Object.create(MIPSzyCodeController.prototype);

        MIPSzyCodeController.apply(instructionsController, args);

        return instructionsController;
    };
}

module.exports = {
    create: function() {
        if (!this.MIPSzySDK) {
            buildMIPSzySDKPrototype();
            this.MIPSzySDK = new MIPSzySDK();
        }
        return this.MIPSzySDK;
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
