'use strict';

/* global buildRegisterUtilities, buildARMRegistersPrototype, buildARMMemoryPrototype, LogicalShiftLeftInstruction
   buildRegisterFormatInstructionPrototype, buildAddInstructionPrototype, buildSubtractInstructionPrototype,
   buildImmediateFormatInstructionPrototype, buildAddImmediateInstructionPrototype, buildDataTransferFormatInstructionPrototype,
   buildLoadDoubleWordInstructionPrototype, buildStoreDoubleWordInstructionPrototype, StoreDoubleWordInstruction, ARMCodeController
   buildARMCodeControllerPrototype, buildAndImmediateInstructionPrototype, buildLogicalShiftRightInstructionPrototype,
   AndImmediateInstruction, LogicalShiftRightInstruction, ARMRegisters, ARMMemory, AddInstruction, SubtractInstruction,
   AddImmediateInstruction, LoadDoubleWordInstruction, buildAndInstructionPrototype, AndInstruction, buildOrInstructionPrototype,
   OrInstruction, buildOrImmediateInstructionPrototype, OrImmediateInstruction, buildLogicalShiftLeftInstructionPrototype,
   buildBranchLabelFormatInstructionPrototype, buildBranchInstructionPrototype, BranchInstruction, BranchOnZeroInstruction
   buildBranchRegisterLabelFormatInstructionPrototype, BranchOnNotZeroInstruction, buildBranchOnNotZeroInstructionPrototype,
   buildBranchOnZeroInstructionPrototype, buildSubtractAndSetFlagsInstructionPrototype, ARMSimulator, buildARMSimulatorPrototype,
   SubtractAndSetFlagsInstruction, SubtractImmediateAndSetFlagsInstruction, SubtractImmediateInstruction, BranchOnNotEqualInstruction
   buildBranchOnNotEqualInstructionPrototype, buildSubtractImmediateAndSetFlagsInstructionPrototype,
   buildSubtractImmediateInstructionPrototype, BranchOnLessThanInstruction, buildBranchOnLessThanInstructionPrototype,
   BranchOnEqualInstruction, buildBranchOnEqualInstructionPrototype, BranchOnGreaterThanOrEqualInstruction,
   buildBranchOnGreaterThanOrEqualInstructionPrototype, InstructionFactory, buildBranchWithLinkInstructionPrototype,
   buildBranchToRegisterInstructionPrototype, buildExclusiveOrInstructionPrototype, buildExclusiveOrImmediateInstructionPrototype,
   buildLoadSignedWordInstructionPrototype, buildStoreWordInstructionPrototype, buildLoadHalfWordInstructionPrototype,
   buildStoreHalfWordInstructionPrototype, buildLoadByteInstructionPrototype, buildStoreByteInstructionPrototype,
   buildAddAndSetFlagsInstructionPrototype, buildAddImmediateAndSetFlagsInstructionPrototype,
   buildBranchOnLessThanOrEqualInstructionPrototype, buildBranchOnGreaterThanInstructionPrototype,
   buildBranchOnCarryBitLowInstructionPrototype, buildBranchOnCarryBitHighInstructionPrototype,
   buildBranchOnNegativeInstructionPrototype, buildBranchOnPositiveInstructionPrototype, buildBranchOnOverflowSetInstructionPrototype,
   buildBranchOnOverflowClearInstructionPrototype, buildBranchOnUnsignedGreaterThanInstructionPrototype,
   buildBranchOnUnsignedLessThanOrEqualInstructionPrototype */

/**
    ARM is an assembly language used in Computer Organization and Design zyBook.
    @module ARMSDK
    @extends InstructionSetSDK
    @return {void}
*/
function ARMSDK() {
    <%= grunt.file.read(hbs_output) %>

    this.name = '<%= grunt.option("tool") %>';

    // Exposing instruction template.
    ARMSDK.prototype.instructionTemplate = this[this.name].instruction;
}

/**
    Inherit InstructionSetSDK and attach functions to ARMSDK's prototype.
    @method buildARMSDKPrototype
    @return {void}
*/
function buildARMSDKPrototype() {
    const instructionSetSDK = require('InstructionSetSDK').create();

    // Registers and memory.
    buildRegisterUtilities();
    buildARMRegistersPrototype(instructionSetSDK);
    buildARMMemoryPrototype(instructionSetSDK);

    // Register format instructions.
    buildRegisterFormatInstructionPrototype(instructionSetSDK);
    buildAddInstructionPrototype(instructionSetSDK);
    buildAddAndSetFlagsInstructionPrototype(instructionSetSDK);
    buildSubtractInstructionPrototype(instructionSetSDK);
    buildSubtractAndSetFlagsInstructionPrototype(instructionSetSDK);
    buildAndInstructionPrototype(instructionSetSDK);
    buildOrInstructionPrototype(instructionSetSDK);
    buildExclusiveOrInstructionPrototype(instructionSetSDK);

    // Immediate format instructions.
    buildImmediateFormatInstructionPrototype(instructionSetSDK);
    buildAndImmediateInstructionPrototype(instructionSetSDK);
    buildExclusiveOrImmediateInstructionPrototype(instructionSetSDK);
    buildLogicalShiftLeftInstructionPrototype(instructionSetSDK);
    buildLogicalShiftRightInstructionPrototype(instructionSetSDK);
    buildOrImmediateInstructionPrototype(instructionSetSDK);

    // Build subtract immediate instructions.
    buildSubtractImmediateInstructionPrototype(instructionSetSDK);
    buildSubtractImmediateAndSetFlagsInstructionPrototype(instructionSetSDK);

    // Build add immediate instructions.
    buildAddImmediateInstructionPrototype(instructionSetSDK);
    buildAddImmediateAndSetFlagsInstructionPrototype(instructionSetSDK);

    // Data transfer instructions.
    buildDataTransferFormatInstructionPrototype(instructionSetSDK);
    buildLoadByteInstructionPrototype(instructionSetSDK);
    buildLoadDoubleWordInstructionPrototype(instructionSetSDK);
    buildLoadHalfWordInstructionPrototype(instructionSetSDK);
    buildLoadSignedWordInstructionPrototype(instructionSetSDK);
    buildStoreByteInstructionPrototype(instructionSetSDK);
    buildStoreDoubleWordInstructionPrototype(instructionSetSDK);
    buildStoreHalfWordInstructionPrototype(instructionSetSDK);
    buildStoreWordInstructionPrototype(instructionSetSDK);

    // Branch label instructions.
    buildBranchLabelFormatInstructionPrototype(instructionSetSDK);
    buildBranchInstructionPrototype();
    buildBranchOnCarryBitHighInstructionPrototype();
    buildBranchOnCarryBitLowInstructionPrototype();
    buildBranchOnEqualInstructionPrototype();
    buildBranchOnGreaterThanInstructionPrototype();
    buildBranchOnGreaterThanOrEqualInstructionPrototype();
    buildBranchOnLessThanInstructionPrototype();
    buildBranchOnLessThanOrEqualInstructionPrototype();
    buildBranchOnNegativeInstructionPrototype();
    buildBranchOnNotEqualInstructionPrototype();
    buildBranchOnOverflowClearInstructionPrototype();
    buildBranchOnOverflowSetInstructionPrototype();
    buildBranchOnPositiveInstructionPrototype();
    buildBranchOnUnsignedGreaterThanInstructionPrototype();
    buildBranchOnUnsignedLessThanOrEqualInstructionPrototype();
    buildBranchWithLinkInstructionPrototype();

    // Branch to register instruction.
    buildBranchToRegisterInstructionPrototype(instructionSetSDK);

    // Branch register and label instructions.
    buildBranchRegisterLabelFormatInstructionPrototype(instructionSetSDK);
    buildBranchOnZeroInstructionPrototype();
    buildBranchOnNotZeroInstructionPrototype();

    // Support models.
    buildARMCodeControllerPrototype(instructionSetSDK);
    buildARMSimulatorPrototype(instructionSetSDK);

    ARMSDK.prototype = instructionSetSDK;
    ARMSDK.prototype.constructor = ARMSDK;

    /**
        Return a new {ARMSimulator} created with the arguments passed to this function.
        @method createSimulator
        @return {ARMSimulator} The newly created simulator.
    */
    ARMSDK.prototype.createSimulator = function(...args) {
        const simulator = Object.create(ARMSimulator.prototype);

        ARMSimulator.apply(simulator, args);
        return simulator;
    };

    /**
        Return a new {ARMRegisters} created with the arguments passed to this function.
        @method createRegisters
        @return {ARMRegisters} The newly created registers.
    */
    ARMSDK.prototype.createRegisters = function(...args) {
        const registers = Object.create(ARMRegisters.prototype);

        ARMRegisters.apply(registers, args);
        return registers;
    };

    /**
        Return a new {ARMMemory} created with the arguments passed to this function.
        @method createMemory
        @return {ARMMemory} The newly created memory.
    */
    ARMSDK.prototype.createMemory = function(...args) {
        const memory = Object.create(ARMMemory.prototype);

        ARMMemory.apply(memory, args);
        return memory;
    };

    /**
        Return a new {InstructionFactory} created with the arguments passed to this function.
        @method createInstructionFactory
        @return {InstructionFactory} The newly created instruction factory.
    */
    ARMSDK.prototype.createInstructionFactory = function(...args) {
        const memory = Object.create(InstructionFactory.prototype);

        InstructionFactory.apply(memory, args);
        return memory;
    };

    /**
        Return a new {AddInstruction} created with the arguments passed to this function.
        @method createAddInstruction
        @return {AddInstruction} The newly created ADD instruction.
    */
    ARMSDK.prototype.createAddInstruction = function(...args) {
        const instruction = Object.create(AddInstruction.prototype);

        AddInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {SubtractImmediateInstruction} created with the arguments passed to this function.
        @method createSubtractImmediateInstruction
        @return {SubtractImmediateInstruction} The newly created SUBI instruction.
    */
    ARMSDK.prototype.createSubtractImmediateInstruction = function(...args) {
        const instruction = Object.create(SubtractImmediateInstruction.prototype);

        SubtractImmediateInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {SubtractImmediateAndSetFlagsInstruction} created with the arguments passed to this function.
        @method createSubtractImmediateAndSetFlagsInstruction
        @return {SubtractImmediateAndSetFlagsInstruction} The newly created SUBIS instruction.
    */
    ARMSDK.prototype.createSubtractImmediateAndSetFlagsInstruction = function(...args) {
        const instruction = Object.create(SubtractImmediateAndSetFlagsInstruction.prototype);

        SubtractImmediateAndSetFlagsInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {AndInstruction} created with the arguments passed to this function.
        @method createAndInstruction
        @return {AndInstruction} The newly created AND instruction.
    */
    ARMSDK.prototype.createAndInstruction = function(...args) {
        const instruction = Object.create(AndInstruction.prototype);

        AndInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {SubtractInstruction} created with the arguments passed to this function.
        @method createSubtractInstruction
        @return {SubtractInstruction} The newly created SUB instruction.
    */
    ARMSDK.prototype.createSubtractInstruction = function(...args) {
        const instruction = Object.create(SubtractInstruction.prototype);

        SubtractInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {SubtractAndSetFlagsInstruction} created with the arguments passed to this function.
        @method createSubtractAndSetFlagsInstruction
        @return {SubtractAndSetFlagsInstruction} The newly created SUBS instruction.
    */
    ARMSDK.prototype.createSubtractAndSetFlagsInstruction = function(...args) {
        const instruction = Object.create(SubtractAndSetFlagsInstruction.prototype);

        SubtractAndSetFlagsInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {OrInstruction} created with the arguments passed to this function.
        @method createOrInstruction
        @return {OrInstruction} The newly created OR instruction.
    */
    ARMSDK.prototype.createOrInstruction = function(...args) {
        const instruction = Object.create(OrInstruction.prototype);

        OrInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {AddImmediateInstruction} created with the arguments passed to this function.
        @method createAddImmediateInstruction
        @return {AddImmediateInstruction} The newly created ADDI instruction.
    */
    ARMSDK.prototype.createAddImmediateInstruction = function(...args) {
        const instruction = Object.create(AddImmediateInstruction.prototype);

        AddImmediateInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {OrImmediateInstruction} created with the arguments passed to this function.
        @method createOrImmediateInstruction
        @return {OrImmediateInstruction} The newly created ORI instruction.
    */
    ARMSDK.prototype.createOrImmediateInstruction = function(...args) {
        const instruction = Object.create(OrImmediateInstruction.prototype);

        OrImmediateInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {AndImmediateInstruction} created with the arguments passed to this function.
        @method createAndImmediateInstruction
        @return {AndImmediateInstruction} The newly created ANDI instruction.
    */
    ARMSDK.prototype.createAndImmediateInstruction = function(...args) {
        const instruction = Object.create(AndImmediateInstruction.prototype);

        AndImmediateInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LogicalShiftRightInstruction} created with the arguments passed to this function.
        @method createShiftRightInstruction
        @return {LogicalShiftRightInstruction} The newly created LSR instruction.
    */
    ARMSDK.prototype.createShiftRightInstruction = function(...args) {
        const instruction = Object.create(LogicalShiftRightInstruction.prototype);

        LogicalShiftRightInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LogicalShiftLeftInstruction} created with the arguments passed to this function.
        @method createShiftLeftInstruction
        @return {LogicalShiftLeftInstruction} The newly created LSR instruction.
    */
    ARMSDK.prototype.createShiftLeftInstruction = function(...args) {
        const instruction = Object.create(LogicalShiftLeftInstruction.prototype);

        LogicalShiftLeftInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LoadDoubleWordInstruction} created with the arguments passed to this function.
        @method createLoadDoubleWordInstruction
        @return {LoadDoubleWordInstruction} The newly created LDUR instruction.
    */
    ARMSDK.prototype.createLoadDoubleWordInstruction = function(...args) {
        const instruction = Object.create(LoadDoubleWordInstruction.prototype);

        LoadDoubleWordInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {StoreDoubleWordInstruction} created with the arguments passed to this function.
        @method createStoreDoubleWordInstruction
        @return {StoreDoubleWordInstruction} The newly created STUR instruction.
    */
    ARMSDK.prototype.createStoreDoubleWordInstruction = function(...args) {
        const instruction = Object.create(StoreDoubleWordInstruction.prototype);

        StoreDoubleWordInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchInstruction} created with the arguments passed to this function.
        @method createBranchInstruction
        @return {BranchInstruction} The newly created B instruction.
    */
    ARMSDK.prototype.createBranchInstruction = function(...args) {
        const instruction = Object.create(BranchInstruction.prototype);

        BranchInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnEqualInstruction} created with the arguments passed to this function.
        @method createBranchOnEqualInstruction
        @return {BranchOnEqualInstruction} The newly created B.EQ instruction.
    */
    ARMSDK.prototype.createBranchOnEqualInstruction = function(...args) {
        const instruction = Object.create(BranchOnEqualInstruction.prototype);

        BranchOnEqualInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnNotEqualInstruction} created with the arguments passed to this function.
        @method createBranchOnNotEqualInstruction
        @return {BranchOnNotEqualInstruction} The newly created B.NE instruction.
    */
    ARMSDK.prototype.createBranchOnNotEqualInstruction = function(...args) {
        const instruction = Object.create(BranchOnNotEqualInstruction.prototype);

        BranchOnNotEqualInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnLessThanInstruction} created with the arguments passed to this function.
        @method createBranchOnLessThanInstruction
        @return {BranchOnLessThanInstruction} The newly created B.LT instruction.
    */
    ARMSDK.prototype.createBranchOnLessThanInstruction = function(...args) {
        const instruction = Object.create(BranchOnLessThanInstruction.prototype);

        BranchOnLessThanInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnGreaterThanOrEqualInstruction} created with the arguments passed to this function.
        @method createBranchOnGreaterThanOrEqualInstruction
        @return {BranchOnGreaterThanOrEqualInstruction} The newly created B.GE instruction.
    */
    ARMSDK.prototype.createBranchOnGreaterThanOrEqualInstruction = function(...args) {
        const instruction = Object.create(BranchOnGreaterThanOrEqualInstruction.prototype);

        BranchOnGreaterThanOrEqualInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnZeroInstruction} created with the arguments passed to this function.
        @method createBranchOnZeroInstruction
        @return {BranchOnZeroInstruction} The newly created CBZ instruction.
    */
    ARMSDK.prototype.createBranchOnZeroInstruction = function(...args) {
        const instruction = Object.create(BranchOnZeroInstruction.prototype);

        BranchOnZeroInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {BranchOnNotZeroInstruction} created with the arguments passed to this function.
        @method createBranchOnNotZeroInstruction
        @return {BranchOnNotZeroInstruction} The newly created CBNZ instruction.
    */
    ARMSDK.prototype.createBranchOnNotZeroInstruction = function(...args) {
        const instruction = Object.create(BranchOnNotZeroInstruction.prototype);

        BranchOnNotZeroInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {ARMCodeController} created with the arguments passed to this function.
        @method createCodeController
        @return {ARMCodeController} The newly created code controller.
    */
    ARMSDK.prototype.createCodeController = function(...args) {
        const instructionsController = Object.create(ARMCodeController.prototype);

        ARMCodeController.apply(instructionsController, args);
        return instructionsController;
    };
}

module.exports = {
    create: function() {
        if (!this.ARMSDK) {
            buildARMSDKPrototype();
            this.ARMSDK = new ARMSDK();
        }
        return this.ARMSDK;
    },

    dependencies: <%= grunt.file.read(dependencies) %>,
};
