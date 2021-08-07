'use strict';

/* exported MapAssemblyAndMachineInstructions */
/* global Labels, Instructions */

/**
    Map a list of assembly instructions to a list of machine instructions.
    Ex: Index 0 of |machineMapped| are the machine instructions that map to index 0 of |assembly|.
    Note: Often, there is only 1 machine instruction per assembly instruction, but not always (ex: mul).
    @class MapAssemblyAndMachineInstructions
*/
class MapAssemblyAndMachineInstructions {

    /**
        @constructor
        @param {Instructions} assembly The assembly instructions.
        @param {Labels} assemblyLabels The labels associated with the assembly instructions.
    */
    constructor(assembly, assemblyLabels) {
        this.assembly = assembly;
        this.assemblyLabels = assemblyLabels;

        // Build machine instruction mapping from assembly.
        this.machineMapped = assembly.map(instruction => instruction.toMachineInstructions());

        // Store a flattened version of the machine instructions.
        this.machine = new Instructions();
        this.machineMapped.forEach(machineInstructions => {
            machineInstructions.forEach(machineInstruction => {
                this.machine.push(machineInstruction);
            });
        });

        // Build machine labels from the assembly labels.
        this.machineLabels = new Labels();
        assemblyLabels.forEach(label => {
            const assemblyIndex = label.instructionIndex;
            const machineInstructionList = this.machineMapped[assemblyIndex];
            const machineIndex = machineInstructionList ? this.machine.indexOf(machineInstructionList[0]) : this.machine.length;

            this.machineLabels.addLabel(label.name, machineIndex);
        });
    }

    /**
        Return the machine instructions as text.
        @method makeMachineText
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String}
    */
    makeMachineText(instructionMemoryStartAddress) {
        return this.machineMapped.map((machineInstructionList, machineIndex) => {
            const comments = this.assembly[machineIndex].toMachineInstructionComments(this.machineLabels, instructionMemoryStartAddress);

            // Build an instruction and comment for each machine instruction. Ex: beq $t4, $zero, 24 ; exit => 24
            return machineInstructionList.map((machineInstruction, instructionIndex) => {
                const text = machineInstruction.toMachineInstructionString(this.machineLabels, instructionMemoryStartAddress, this.machine);
                const commentText = comments[instructionIndex];
                const comment = commentText ? ` ; ${commentText}` : '';

                return `${text}${comment}`;
            }).join('\n');
        }).join('\n');
    }

    /**
        Return the machine instructions as bits.
        @method makeMachineBits
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String}
    */
    makeMachineBits(instructionMemoryStartAddress) {
        return this.machineMapped.map(machineInstructionList => { // eslint-disable-line arrow-body-style
            return machineInstructionList.map(machineInstruction => { // eslint-disable-line arrow-body-style
                return machineInstruction.toMachineInstructionBitString(
                    this.machine,
                    this.machineLabels,
                    instructionMemoryStartAddress
                );
            }).join('\n');
        }).join('\n');
    }

    /**
        Convert the given machine program counter to assembly program counter.
        @method getAssemblyProgramCounter
        @param {Number} machineProgramCounter The machine program counter to convert.
        @return {Number} The assembly program counter that maps to the assembly counter.
    */
    getAssemblyProgramCounter(machineProgramCounter) {
        const machineInstructionToFind = this.machine[machineProgramCounter];

        return this.machineMapped.findIndex(machineInstructionList => machineInstructionList.indexOf(machineInstructionToFind) !== -1);
    }
}
