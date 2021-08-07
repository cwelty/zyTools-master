'use strict';

/* exported getMachineInstructionAddress, makeMachineInstructionCommentMappingLabelToAddress */

const numberOfBytesInAddress = 4;

/**
    Return the machine instruction address for the given label name.
    @method getMachineInstructionAddress
    @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
    @param {String} labelName The name of the label to convert to a memory address.
    @param {Number} instructionMemoryStartAddress The start address of instruction memory.
    @return {Number}
*/
function getMachineInstructionAddress(machineLabels, labelName, instructionMemoryStartAddress) {
    const machineIndex = machineLabels.lookupProgramCounter(labelName);

    return (instructionMemoryStartAddress + (machineIndex * numberOfBytesInAddress));
}

/**
    Return a machine instruction comment that maps the instruction's label to memory address.
    @method makeMachineInstructionCommentMappingLabelToAddress
    @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
    @param {String} labelName The name of the label to convert to a memory address.
    @param {Number} instructionMemoryStartAddress The start address of instruction memory.
    @return {String} The comment showing the map from label to address.
*/
function makeMachineInstructionCommentMappingLabelToAddress(machineLabels, labelName, instructionMemoryStartAddress) {
    const machineInstructionAddress = getMachineInstructionAddress(machineLabels, labelName, instructionMemoryStartAddress);

    return [ `${labelName} => ${machineInstructionAddress}` ];
}
