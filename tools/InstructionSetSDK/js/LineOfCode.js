/*
    A LineOfCode stores:
        |instructions| is optional and an Instruction.
        |labels| is optional and a Label.
*/
function LineOfCode(instruction, label) {
    this.instruction = instruction || null;
    this.label = label || null;
}
