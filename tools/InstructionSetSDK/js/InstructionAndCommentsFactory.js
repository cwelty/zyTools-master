'use strict';

/* global LabelInstructionComment, MapAssemblyAndMachineInstructions, Simulator, LabelsInstructionsComments, Code */

/*
    InstructionAndCommentsFactory makes InstructionAndComments.
    |instructions| is required and an Instructions.
    |registers| is required and a Registers.
    |memory| is required and a Memory.
    |labels| is required and a Labels.
    |disabledInstructions| is required and an array.
    |useCommentsWithRegisterValues| is required and boolean.
*/
function InstructionAndCommentsFactory(instructions, registers, memory, labels, disabledInstructions, useCommentsWithRegisterValues) {
    this.instructions = instructions.clone();
    this.registers = registers;
    this.memory = memory;
    this.labels = labels;
    this.disabledInstructions = disabledInstructions;
    this.useCommentsWithRegisterValues = useCommentsWithRegisterValues;

    // Flag each |instruction| as either disabled or not.
    this.instructions.forEach(function(instruction, index) {
        instruction.isDisabled = (disabledInstructions.indexOf(index) !== -1);
    });
}

/*
    Build the InstructionAndCommentsFactory prototype.
    |templateFunction| is required and a function.
*/
function buildInstructionAndCommentsFactoryPrototype(templateFunction) {
    /*
        Convert each instruction to an instruction and comment.

        If |useCommentsWithRegisterValues| is true, then include register values in the comment.
        Ex: ld $s0, $s1(20) # $s0 = M[$s1 + 20] = M[1020]

        Otherwise, do not include register values in the comment.
        Ex: ld $s0, $s1(20) # $s0 = M[$s1 + 20]
    */
    InstructionAndCommentsFactory.prototype.make = function() {
        const labelsInstructionsComments = new LabelsInstructionsComments();

        // Create code comments using actual register values. Ex: Given $s1 is 5000, lw $s0, 4($s1) # $s0 = M[$s1 + 4] = M[5000 + 4]
        if (this.useCommentsWithRegisterValues) {
            const mapAssemblyAndMachine = new MapAssemblyAndMachineInstructions(this.instructions, this.labels);
            const mipsSimulator = new Simulator(mapAssemblyAndMachine, this.registers, this.memory);

            /*
                Run the simulator to keep registers updated.
                Capture the register values before running each instruction.
                Instructions are printed in the order that the instructions are executed.
            */
            while (mipsSimulator.moreInstructionsToExecute()) {
                const programCounter = mipsSimulator.getAssemblyProgramCounter();
                const nextAssemblyInstruction = mipsSimulator.mapAssemblyAndMachine.assembly[programCounter];
                const labelObject = mapAssemblyAndMachine.assemblyLabels.find(label => label.instructionIndex === programCounter);
                const label = labelObject ? labelObject.name : '';

                labelsInstructionsComments.push(new LabelInstructionComment(
                    label,
                    nextAssemblyInstruction.toString(),
                    nextAssemblyInstruction.toComment(this.registers),
                    nextAssemblyInstruction,
                    nextAssemblyInstruction.isDisabled
                ));
                mipsSimulator.runNextAssemblyInstruction();

                /*
                    If there are more comments than instructions, then there's a loop, so we'll end up with too many comments.
                    Instead, break from the loop and redo without register values.
                */
                if (labelsInstructionsComments.length > mapAssemblyAndMachine.assembly.length) {
                    break;
                }
            }

            // Verify that the assembly instructions are in the expected order.
            const assembly = labelsInstructionsComments.map(labelsInstructionsComment => labelsInstructionsComment.instructionObject);
            const assemblyInstructionsMatch = require('utilities').twoArraysMatch(mapAssemblyAndMachine.assembly, assembly);

            if (assemblyInstructionsMatch) {

                // Add any labels that are after the last instruction.
                const extraLabels = mapAssemblyAndMachine.assemblyLabels.filter(
                    label => label.instructionIndex >= mapAssemblyAndMachine.assembly.length
                );

                extraLabels.forEach(label => {
                    labelsInstructionsComments.push(new LabelInstructionComment(label.name, '', '', null, false));
                });
            }

            // If the instructions do not match, then there is a branch in the code, so redo this function but without register values.
            else {
                this.useCommentsWithRegisterValues = false;
                return this.make();
            }
        }

        // Build array of |LabelsInstructionsComments| in order of |instructions|.
        else {
            const code = new Code(this.instructions, this.labels);

            code.forEach(lineOfCode => {
                const label = lineOfCode.label ? lineOfCode.label.name : '';

                // Build the instruction and comment for this line of code if an instruction exists.
                let instruction = '';
                let comment = '';

                if (lineOfCode.instruction) {
                    instruction = lineOfCode.instruction.toString();
                    comment = lineOfCode.instruction.toComment();
                }

                labelsInstructionsComments.push(new LabelInstructionComment(
                    label,
                    instruction,
                    comment,
                    lineOfCode.instruction,
                    lineOfCode.instruction && lineOfCode.instruction.isDisabled
                ));
            });
        }

        return templateFunction({ labelsInstructionsComments });
    };
}
