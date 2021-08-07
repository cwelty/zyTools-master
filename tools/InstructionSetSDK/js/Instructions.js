// Instructions is an Array of Instruction.
function Instructions() {}
Instructions.prototype = new Array();
Instructions.prototype.constructor = Instructions;

/**
    Execute the instruction at |programCounter|.
    @method execute
    @param {Registers} registers The registers on which to execute.
    @param {Memory} memory The memory on which to execute.
    @param {Number} programCounter The current program counter.
    @param {Labels} labels The labels of the program on which to execute.
    @param {Object} simulatorContext Miscellaneous context information on the simulation.
    @return {Number} The next instruction to execute.
*/
Instructions.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
    const nextInstruction = this[programCounter].execute(registers, memory, programCounter, labels, simulatorContext);

    // |nextInstruction| is a string label, then lookup the respective program counter.
    return (typeof nextInstruction === 'string') ? labels.lookupProgramCounter(nextInstruction) : nextInstruction;
};

/*
    Return the instructions as text. Ex:
    add $s0, $s1, $s2
    lw $s0, 4($s2)
*/
Instructions.prototype.toString = function() {
    var length = this.length;
    return this.map(function(instruction, index) {
        return instruction.toString();
    }).join('\n');
};

/*
    Set the Labels for each Instruction.
    |labels| is required and a Labels object.
*/
Instructions.prototype.setLabels = function(labels) {
    this.forEach(function(instruction) {
        instruction.setLabels(labels);
    });
};

// Return a cloned Instructions.
Instructions.prototype.clone = function() {
    var newInstructions = new Instructions();
    this.forEach(function(instruction) {
        newInstructions.push(instruction.clone());
    });
    return newInstructions;
};