'use strict';

/* global MapAssemblyAndMachineInstructions, buildHalfWordPrototype, buildDoubleWordPrototype, buildWordPrototype, Simulator */

function InstructionSetSDK() {
    <%= grunt.file.read(hbs_output) %>

    this.name = '<%= grunt.option("tool") %>';

    buildInstructionAndCommentsFactoryPrototype(this[this.name].labelsInstructionsComments);

    // Exposing templates
    var templates = this[this.name];
    InstructionSetSDK.prototype.codeTemplate = templates.code;
    InstructionSetSDK.prototype.selectTemplate = templates.select;
    InstructionSetSDK.prototype.developmentEnvironmentTemplate = templates.developmentEnvironment;
    InstructionSetSDK.prototype.templates = templates;
}

// Build prototype of Objects
buildBytePrototype();
buildBaseWordPrototype();
buildStoragePrototype();
buildRegistersPrototype();
buildMemoryPrototype();
buildCommonExecutesPrototype();
buildInstructionPrototype();
buildSimulatorPrototype();
buildStorageControllerPrototype();
buildMemoryControllerPrototype();
buildRegistersControllerPrototype();
buildInstructionControllerPrototype();
buildCodeControllerPrototype();

InstructionSetSDK.prototype.css = '<style><%= grunt.file.read(css_filename) %></style>';

/*
    These functions are purely used for inheritance in inheriting SDKs.
    These functions should not be accessed directly.
*/

// Return a new Registers.
InstructionSetSDK.prototype.inheritRegisters = function() {
    return new Registers();
};

// Return a new Memory.
InstructionSetSDK.prototype.inheritMemory = function() {
    return new Memory();
};

// Return a new Instruction.
InstructionSetSDK.prototype.inheritInstruction = function() {
    return new Instruction();
};

// Return a new CodeController.
InstructionSetSDK.prototype.inheritCodeController = function() {
    return new CodeController();
};

/**
    Return an instance of {Simulator} for use in inheritance.
    @method inheritSimulator
    @return {Simulator} New instance of the simulator.
*/
InstructionSetSDK.prototype.inheritSimulator = function() {
    return new Simulator();
};

/*
    These functions are used to create instances of the respective objects,
    including passing arguments to the constructor.
*/

// Return a new Instructions created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createInstructions = function() {
    var instructions = Object.create(Instructions.prototype);
    Instructions.apply(instructions, arguments);
    return instructions;
};

// Return a new Labels created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createLabels = function() {
    var instructions = Object.create(Labels.prototype);
    Labels.apply(instructions, arguments);
    return instructions;
};

// Return a new RegistersController created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createRegistersController = function() {
    var registersController = Object.create(RegistersController.prototype);
    RegistersController.apply(registersController, arguments);
    return registersController;
};

// Return a new MemoryController created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createMemoryController = function() {
    var memoryController = Object.create(MemoryController.prototype);
    MemoryController.apply(memoryController, arguments);
    return memoryController;
};

// Return a new Simulator created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createSimulator = function() {
    var simulator = Object.create(Simulator.prototype);
    Simulator.apply(simulator, arguments);
    return simulator;
};

// Return a new InstructionAndCommentsFactory created with the |arguments| passed to this function.
InstructionSetSDK.prototype.createInstructionAndCommentsFactory = function() {
    var instructionAndCommentsFactory = Object.create(InstructionAndCommentsFactory.prototype);
    InstructionAndCommentsFactory.apply(instructionAndCommentsFactory, arguments);
    return instructionAndCommentsFactory;
};

// Return a new CommonExecutes.
InstructionSetSDK.prototype.createCommonExecutes = function() {
    var commonExecutes = Object.create(CommonExecutes.prototype);
    CommonExecutes.apply(commonExecutes);
    return commonExecutes;
};

/**
    Return a new {Code} object.
    @method createCode
    @return {Code} A new object.
*/
InstructionSetSDK.prototype.createCode = function() {
    const code = Object.create(Code.prototype);

    Code.apply(code, arguments);

    return code;
};

/**
    Return a new {MapAssemblyAndMachineInstructions} object.
    @method createMapAssemblyAndMachineInstructions
    @param {Instructions} assembly The assembly instructions.
    @param {Array} machine Array of {Array} of {Instruction} Machine instructions associated with the assembly instructions.
    @return {MapAssemblyAndMachineInstructions} A new object.
*/
InstructionSetSDK.prototype.createMapAssemblyAndMachineInstructions = function() {
    const mapAssemblyMachine = Object.create(MapAssemblyAndMachineInstructions.prototype);

    MapAssemblyAndMachineInstructions.apply(mapAssemblyMachine, arguments); // eslint-disable-line

    return mapAssemblyMachine;
};

let hasBuiltBaseWordExtensionsAlready = false;

/**
    Build the {BaseWord} extensions.
    @method buildBaseWordExtensions
    @return {void}
*/
function buildBaseWordExtensions() {
    if (!hasBuiltBaseWordExtensionsAlready) {
        hasBuiltBaseWordExtensionsAlready = true;
        buildWordPrototype();
        buildDoubleWordPrototype();
        buildHalfWordPrototype();
    }
}

module.exports = {
    create: function() {
        if (!this.instructionSetSDK) {
            buildBaseWordExtensions();
            this.instructionSetSDK = new InstructionSetSDK();
        }
        return this.instructionSetSDK;
    },
    inherit: function() {
        return new InstructionSetSDK();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {
        buildBaseWordExtensions();

        <%= grunt.file.read(tests) %>
    },
};
