'use strict';

/* global MulInstruction, MultInstruction, buildTwoRegistersFormatInstructionPrototype, buildMoveInstructionPrototype,
   buildMulInstructionPrototype, buildMultInstructionPrototype, buildOneRegistersFormatInstructionPrototype,
   buildMfloInstructionPrototype, MfloInstruction, buildImmediateRegisterFormatInstructionPrototype, buildShiftLeftInstructionPrototype,
   buildShiftRightInstructionPrototype, buildBranchIfGreaterOrEqualInstructionPrototype, BranchIfGreaterOrEqualInstruction,
   BranchIfGreaterInstruction, buildBranchIfGreaterInstructionPrototype, BranchIfLessOrEqualInstruction,
   buildBranchIfLessOrEqualInstructionPrototype, BranchIfLessInstruction, buildBranchIfLessInstructionPrototype, MIPSRegisters,
   InstructionFactory, buildDataTransferFormatInstructionPrototype, buildImmediateFormatInstructionPrototype,
   buildBranchFormatInstructionPrototype, MIPSMemory, SetOnLessThanUnsignedInstruction, buildSetOnLessThanUnsignedInstructionPrototype,
   buildSetOnLessThanImmediateUnsignedInstructionPrototype, SetOnLessThanImmediateUnsignedInstruction, buildLoadHalfWordInstructionPrototype,
   LoadHalfWordInstruction, buildJumpLabelFormatInstructionPrototype, buildJumpInstructionPrototype, buildJumpAndLinkInstructionPrototype,
   buildJumpRegisterInstructionPrototype, JumpAndLinkInstruction, JumpRegisterInstruction, buildStoreHalfWordInstructionPrototype,
   StoreHalfWordInstruction, buildLoadHalfWordUnsignedInstructionPrototype, LoadHalfWordUnsignedInstruction,
   buildLoadByteInstructionPrototype, LoadByteInstruction, StoreByteInstruction, buildStoreByteInstructionPrototype,
   buildLoadByteUnsignedInstructionPrototype, LoadByteUnsignedInstruction, LoadWordInstruction, StoreWordInstruction, MIPSCodeController,
   buildMIPSInstructionPrototype, JumpInstruction, BranchIfNotEqualInstruction, BranchIfEqualInstruction */

function MIPSSDK() {
    <%= grunt.file.read(hbs_output) %>

    this.name = '<%= grunt.option("tool") %>';

    // Exposing instruction template.
    MIPSSDK.prototype.instructionTemplate = this[this.name].instruction;
}

// Inherit InstructionSetSDK and attach functions to MIPSSDK's prototype.
function buildMIPSSDKPrototype() {
    var instructionSetSDK = require('InstructionSetSDK').create();

    buildRegisterUtilities();
    buildMIPSRegistersPrototype(instructionSetSDK);
    buildMIPSMemoryPrototype(instructionSetSDK);

    buildInstructionUtilities();
    buildMIPSInstructionPrototype(instructionSetSDK);

    // Register format instructions
    buildRegisterFormatInstructionPrototype(instructionSetSDK);
    buildAddInstructionPrototype(instructionSetSDK);
    buildSubtractInstructionPrototype(instructionSetSDK);
    buildAndInstructionPrototype(instructionSetSDK);
    buildOrInstructionPrototype(instructionSetSDK);
    buildNorInstructionPrototype(instructionSetSDK);
    buildSetOnLessThanInstructionPrototype(instructionSetSDK);
    buildSetOnLessThanUnsignedInstructionPrototype(instructionSetSDK);
    buildMulInstructionPrototype();

    // One register format instructions
    buildOneRegistersFormatInstructionPrototype();
    buildMfloInstructionPrototype();
    buildJumpRegisterInstructionPrototype();

    // Two registers format instructions
    buildTwoRegistersFormatInstructionPrototype();
    buildMoveInstructionPrototype();
    buildMultInstructionPrototype(instructionSetSDK);

    // Immediate format instructions
    buildImmediateFormatInstructionPrototype(instructionSetSDK);
    buildAddImmediateInstructionPrototype(instructionSetSDK);
    buildAndImmediateInstructionPrototype(instructionSetSDK);
    buildOrImmediateInstructionPrototype(instructionSetSDK);
    buildSetOnLessThanImmediateInstructionPrototype(instructionSetSDK);
    buildSetOnLessThanImmediateUnsignedInstructionPrototype(instructionSetSDK);

    // Two register and one immediate instructions
    buildImmediateRegisterFormatInstructionPrototype();
    buildShiftLeftInstructionPrototype(instructionSetSDK);
    buildShiftRightInstructionPrototype(instructionSetSDK);

    // Data transfer instructions
    buildDataTransferFormatInstructionPrototype();
    buildLoadWordInstructionPrototype(instructionSetSDK);
    buildStoreWordInstructionPrototype(instructionSetSDK);
    buildLoadHalfWordInstructionPrototype(instructionSetSDK);
    buildLoadHalfWordUnsignedInstructionPrototype(instructionSetSDK);
    buildStoreHalfWordInstructionPrototype(instructionSetSDK);
    buildLoadByteInstructionPrototype(instructionSetSDK);
    buildStoreByteInstructionPrototype(instructionSetSDK);
    buildLoadByteUnsignedInstructionPrototype(instructionSetSDK);

    // Conditional instructions
    buildBranchFormatInstructionPrototype();
    buildBranchIfEqualInstructionPrototype(instructionSetSDK);
    buildBranchIfNotEqualInstructionPrototype(instructionSetSDK);
    buildBranchIfGreaterOrEqualInstructionPrototype();
    buildBranchIfGreaterInstructionPrototype();
    buildBranchIfLessOrEqualInstructionPrototype();
    buildBranchIfLessInstructionPrototype();

    // Jump label instructions
    buildJumpLabelFormatInstructionPrototype(instructionSetSDK);
    buildJumpInstructionPrototype();
    buildJumpAndLinkInstructionPrototype();

    buildInstructionFactoryPrototype();
    buildMIPSCodeControllerPrototype(instructionSetSDK);

    MIPSSDK.prototype = require('InstructionSetSDK').inherit();
    MIPSSDK.prototype.constructor = MIPSSDK;

    // Return a new MIPSRegisters created with the |arguments| passed to this function.
    MIPSSDK.prototype.createRegisters = function() {
        var registers = Object.create(MIPSRegisters.prototype);
        MIPSRegisters.apply(registers, arguments);
        return registers;
    };

    /**
        Return a reference to a MIPSRegisters object.
        @method inheritMIPSRegisters
        @return {MIPSRegisters} Reference to MIPSRegisters object.
    */
    MIPSSDK.prototype.inheritMIPSRegisters = function() {
        return new MIPSRegisters();
    };

    // Return a new MIPSMemory created with the |arguments| passed to this function.
    MIPSSDK.prototype.createMemory = function() {
        var memory = Object.create(MIPSMemory.prototype);
        MIPSMemory.apply(memory, arguments);
        return memory;
    };

    /**
        Return a reference to a MIPSMemory object.
        @method inheritMIPSMemory
        @return {MIPSMemory} Reference to MIPSMemory object.
    */
    MIPSSDK.prototype.inheritMIPSMemory = function() {
        return new MIPSMemory();
    };

    // Return a new InstructionFactory created with the |arguments| passed to this function.
    MIPSSDK.prototype.createInstructionFactory = function() {
        var instructionFactory = Object.create(InstructionFactory.prototype);
        InstructionFactory.apply(instructionFactory, arguments);
        return instructionFactory;
    };

    /**
        Return a reference to the InstructionFactory object.
        @method inheritInstructionFactory
        @return {InstructionFactory} Reference to the created InstructionFactory object.
    */
    MIPSSDK.prototype.inheritInstructionFactory = function() {
        return new InstructionFactory();
    };

    // Return a new AddInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createAddInstruction = function() {
        var instruction = Object.create(AddInstruction.prototype);
        AddInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new SubtractInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createSubtractInstruction = function() {
        var instruction = Object.create(SubtractInstruction.prototype);
        SubtractInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new AndInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createAndInstruction = function() {
        var instruction = Object.create(AndInstruction.prototype);
        AndInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new OrInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createOrInstruction = function() {
        var instruction = Object.create(OrInstruction.prototype);
        OrInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new NorInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createNorInstruction = function() {
        var instruction = Object.create(NorInstruction.prototype);
        NorInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a new {MulInstruction} created with the |arguments| passed to this function.
        @method createMulInstruction
        @return {MulInstruction} The newly created mul instruction.
    */
    MIPSSDK.prototype.createMulInstruction = function() {
        const instruction = Object.create(MulInstruction.prototype);

        MulInstruction.apply(instruction, arguments); // eslint-disable-line
        return instruction;
    };

    /**
        Return a new {MultInstruction} created with the |arguments| passed to this function.
        @method createMultInstruction
        @return {MultInstruction} The newly created mult instruction.
    */
    MIPSSDK.prototype.createMultInstruction = function() {
        const instruction = Object.create(MultInstruction.prototype);

        MultInstruction.apply(instruction, arguments); // eslint-disable-line
        return instruction;
    };

    /**
        Return a new {MfloInstruction} created with the arguments passed to this function.
        @method createMfloInstruction
        @return {MfloInstruction} The newly created mflo instruction.
    */
    MIPSSDK.prototype.createMfloInstruction = function(...args) {
        const instruction = Object.create(MfloInstruction.prototype);

        MfloInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {JumpRegisterInstruction} created with the arguments passed to this function.
        @method createJumpRegisterInstruction
        @return {JumpRegisterInstruction} The newly created jr instruction.
    */
    MIPSSDK.prototype.createJumpRegisterInstruction = function(...args) {
        const instruction = Object.create(JumpRegisterInstruction.prototype);

        JumpRegisterInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a reference to JumpRegisterInstruction object.
        @method inheritJumpRegisterInstruction
        @return {JumpRegisterInstruction} Reference to JumpRegisterInstruction object.
    */
    MIPSSDK.prototype.inheritJumpRegisterInstruction = function() {
        return new JumpRegisterInstruction();
    };

    // Return a new SetOnLessThanInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createSetOnLessThanInstruction = function() {
        var instruction = Object.create(SetOnLessThanInstruction.prototype);
        SetOnLessThanInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a new {SetOnLessThanUnsignedInstruction} created with the arguments passed to this function.
        @method createSetOnLessThanUnsignedInstruction
        @return {SetOnLessThanUnsignedInstruction} The newly created sltu instruction.
    */
    MIPSSDK.prototype.createSetOnLessThanUnsignedInstruction = function(...args) {
        const instruction = Object.create(SetOnLessThanUnsignedInstruction.prototype);

        SetOnLessThanUnsignedInstruction.apply(instruction, args);
        return instruction;
    };

    // Return a new AddImmediateInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createAddImmediateInstruction = function() {
        var instruction = Object.create(AddImmediateInstruction.prototype);
        AddImmediateInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new AndImmediateInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createAndImmediateInstruction = function() {
        var instruction = Object.create(AndImmediateInstruction.prototype);
        AndImmediateInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new OrImmediateInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createOrImmediateInstruction = function() {
        var instruction = Object.create(OrImmediateInstruction.prototype);
        OrImmediateInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new ShiftLeftInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createShiftLeftInstruction = function() {
        var instruction = Object.create(ShiftLeftInstruction.prototype);
        ShiftLeftInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new ShiftRightInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createShiftRightInstruction = function() {
        var instruction = Object.create(ShiftRightInstruction.prototype);
        ShiftRightInstruction.apply(instruction, arguments);
        return instruction;
    };

    // Return a new SetOnLessThanImmediateInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createSetOnLessThanImmediateInstruction = function() {
        var instruction = Object.create(SetOnLessThanImmediateInstruction.prototype);
        SetOnLessThanImmediateInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a new {SetOnLessThanImmediateUnsignedInstruction} created with the arguments passed to this function.
        @method createSetOnLessThanImmediateUnsignedInstruction
        @return {SetOnLessThanImmediateUnsignedInstruction} The newly created sltiu instruction.
    */
    MIPSSDK.prototype.createSetOnLessThanImmediateUnsignedInstruction = function(...args) {
        const instruction = Object.create(SetOnLessThanImmediateUnsignedInstruction.prototype);

        SetOnLessThanImmediateUnsignedInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a reference to LoadWordInstruction object.
        @method inheritLoadWordInstruction
        @return {LoadWordInstruction} Reference to LoadWordInstruction object.
    */
    MIPSSDK.prototype.inheritLoadWordInstruction = function() {
        return new LoadWordInstruction();
    };

    // Return a new LoadWordInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createLoadWordInstruction = function() {
        var instruction = Object.create(LoadWordInstruction.prototype);
        LoadWordInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a new {LoadHalfWordInstruction} created with the arguments passed to this function.
        @method createLoadHalfWordInstruction
        @return {LoadHalfWordInstruction} The newly created lh instruction.
    */
    MIPSSDK.prototype.createLoadHalfWordInstruction = function(...args) {
        const instruction = Object.create(LoadHalfWordInstruction.prototype);

        LoadHalfWordInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LoadHalfWordUnsignedInstruction} created with the arguments passed to this function.
        @method createLoadHalfWordUnsignedInstruction
        @return {LoadHalfWordUnsignedInstruction} The newly created lhu instruction.
    */
    MIPSSDK.prototype.createLoadHalfWordUnsignedInstruction = function(...args) {
        const instruction = Object.create(LoadHalfWordUnsignedInstruction.prototype);

        LoadHalfWordUnsignedInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LoadByteInstruction} created with the arguments passed to this function.
        @method createLoadByteInstruction
        @return {LoadByteInstruction} The newly created lb instruction.
    */
    MIPSSDK.prototype.createLoadByteInstruction = function(...args) {
        const instruction = Object.create(LoadByteInstruction.prototype);

        LoadByteInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {LoadByteUnsignedInstruction} created with the arguments passed to this function.
        @method createLoadByteUnsignedInstruction
        @return {LoadByteUnsignedInstruction} The newly created lbu instruction.
    */
    MIPSSDK.prototype.createLoadByteUnsignedInstruction = function(...args) {
        const instruction = Object.create(LoadByteUnsignedInstruction.prototype);

        LoadByteUnsignedInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a new {StoreByteInstruction} created with the arguments passed to this function.
        @method createStoreByteInstruction
        @return {StoreByteInstruction} The newly created sb instruction.
    */
    MIPSSDK.prototype.createStoreByteInstruction = function(...args) {
        const instruction = Object.create(StoreByteInstruction.prototype);

        StoreByteInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a reference to StoreWordInstruction object.
        @method inheritStoreWordInstruction
        @return {StoreWordInstruction} Reference to StoreWordInstruction object.
    */
    MIPSSDK.prototype.inheritStoreWordInstruction = function() {
        return new StoreWordInstruction();
    };

    // Return a new StoreWordInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createStoreWordInstruction = function() {
        var instruction = Object.create(StoreWordInstruction.prototype);
        StoreWordInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a new {StoreHalfWordInstruction} created with the arguments passed to this function.
        @method createStoreHalfWordInstruction
        @return {StoreHalfWordInstruction} The newly created sh instruction.
    */
    MIPSSDK.prototype.createStoreHalfWordInstruction = function(...args) {
        const instruction = Object.create(StoreHalfWordInstruction.prototype);

        StoreHalfWordInstruction.apply(instruction, args);
        return instruction;
    };

    // Return a new BranchIfEqualInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfEqualInstruction = function() {
        var instruction = Object.create(BranchIfEqualInstruction.prototype);
        BranchIfEqualInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a reference to BranchIfEqualInstruction object.
        @method inheritBranchIfEqualInstruction
        @return {BranchIfEqualInstruction} Reference to BranchIfEqualInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfEqualInstruction = function() {
        return new BranchIfEqualInstruction();
    };

    // Return a new BranchIfNotEqualInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfNotEqualInstruction = function() {
        var instruction = Object.create(BranchIfNotEqualInstruction.prototype);
        BranchIfNotEqualInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a reference to BranchIfNotEqualInstruction object.
        @method inheritBranchIfNotEqualInstruction
        @return {BranchIfNotEqualInstruction} Reference to BranchIfNotEqualInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfNotEqualInstruction = function() {
        return new BranchIfNotEqualInstruction();
    };

    // Return a new BranchIfGreaterOrEqualInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfGreaterOrEqualInstruction = function() {
        const instruction = Object.create(BranchIfGreaterOrEqualInstruction.prototype);

        BranchIfGreaterOrEqualInstruction.apply(instruction, arguments); // eslint-disable-line

        return instruction;
    };

    /**
        Return a reference to BranchIfGreaterOrEqualInstruction object.
        @method inheritBranchIfGreaterOrEqualInstruction
        @return {BranchIfGreaterOrEqualInstruction} Reference to BranchIfGreaterOrEqualInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfGreaterOrEqualInstruction = function() {
        return new BranchIfGreaterOrEqualInstruction();
    };

    // Return a new BranchIfGreaterInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfGreaterInstruction = function() {
        const instruction = Object.create(BranchIfGreaterInstruction.prototype);

        BranchIfGreaterInstruction.apply(instruction, arguments); // eslint-disable-line

        return instruction;
    };

    /**
        Return a reference to BranchIfGreaterInstruction object.
        @method inheritBranchIfGreaterInstruction
        @return {BranchIfGreaterInstruction} Reference to BranchIfGreaterInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfGreaterInstruction = function() {
        return new BranchIfGreaterInstruction();
    };

    // Return a new BranchIfLessOrEqualInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfLessOrEqualInstruction = function() {
        const instruction = Object.create(BranchIfLessOrEqualInstruction.prototype);

        BranchIfLessOrEqualInstruction.apply(instruction, arguments); // eslint-disable-line

        return instruction;
    };

    /**
        Return a reference to BranchIfLessOrEqualInstruction object.
        @method inheritBranchIfLessOrEqualInstruction
        @return {BranchIfLessOrEqualInstruction} Reference to BranchIfLessOrEqualInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfLessOrEqualInstruction = function() {
        return new BranchIfLessOrEqualInstruction();
    };

    // Return a new BranchIfLessInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createBranchIfLessInstruction = function() {
        const instruction = Object.create(BranchIfLessInstruction.prototype);

        BranchIfLessInstruction.apply(instruction, arguments); // eslint-disable-line

        return instruction;
    };

    /**
        Return a reference to BranchIfLessInstruction object.
        @method inheritBranchIfLessInstruction
        @return {BranchIfLessInstruction} Reference to BranchIfLessInstruction object.
    */
    MIPSSDK.prototype.inheritBranchIfLessInstruction = function() {
        return new BranchIfLessInstruction();
    };

    // Return a new JumpInstruction created with the |arguments| passed to this function.
    MIPSSDK.prototype.createJumpInstruction = function() {
        var instruction = Object.create(JumpInstruction.prototype);
        JumpInstruction.apply(instruction, arguments);
        return instruction;
    };

    /**
        Return a reference to JumpInstruction object.
        @method inheritJumpInstruction
        @return {JumpInstruction} Reference to JumpInstruction object.
    */
    MIPSSDK.prototype.inheritJumpInstruction = function() {
        return new JumpInstruction();
    };

    /**
        Return a new jump and link instruction.
        @method createJumpAndLinkInstruction
        @return {JumpAndLinkInstruction} New jump and link instruction.
    */
    MIPSSDK.prototype.createJumpAndLinkInstruction = function(...args) {
        const instruction = Object.create(JumpAndLinkInstruction.prototype);

        JumpAndLinkInstruction.apply(instruction, args);
        return instruction;
    };

    /**
        Return a reference to JumpAndLinkInstruction object.
        @method inheritJumpAndLinkInstruction
        @return {JumpAndLinkInstruction} Reference to JumpAndLinkInstruction object.
    */
    MIPSSDK.prototype.inheritJumpAndLinkInstruction = function() {
        return new JumpAndLinkInstruction();
    };

    /**
        Return a new MoveInstruction created with the |arguments| passed to this function.
        @method createMoveInstruction
        @return {MoveInstruction} The newly created move instruction.
    */
    MIPSSDK.prototype.createMoveInstruction = function() {
        const instruction = Object.create(MoveInstruction.prototype);

        MoveInstruction.apply(instruction, arguments); // eslint-disable-line
        return instruction;
    };

    /**
        Return a reference to MIPSCodeController object.
        @method inheritCodeController
        @return {MIPSCodeController} Reference to MIPSCodeController object.
    */
    MIPSSDK.prototype.inheritCodeController = function() {
        return new MIPSCodeController();
    };

    // Return a new MIPSCodeController created with the |arguments| passed to this function.
    MIPSSDK.prototype.createCodeController = function() {
        var instructionsController = Object.create(MIPSCodeController.prototype);
        MIPSCodeController.apply(instructionsController, arguments);
        return instructionsController;
    };
}

module.exports = {
    create: function() {
        if (!this.MIPSSDK) {
            buildMIPSSDKPrototype();
            this.MIPSSDK = new MIPSSDK();
        }
        return this.MIPSSDK;
    },
    inherit: function() {
        buildMIPSSDKPrototype();
        return new MIPSSDK();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {
        buildMIPSSDKPrototype();

        <%= grunt.file.read(tests) %>
    },
};
