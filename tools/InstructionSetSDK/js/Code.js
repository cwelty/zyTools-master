/*
    Code is an array of |LineOfCode| built from interleaved |instructions| and |labels|.
    |instructions| is required and an Instructions.
    |labels| is required and a Labels.
*/
function Code(instructions, labels) {
    /*
        Interleave |instructions| and |labels|. Ex: If |instructions| is:
            ['add $s0, $s0, $s0', 'add $s1, $s1, $s1', 'add $s2, $s2, $s2', 'add $s3, $s3, $s3']
        and |labels| is:
            [Label('L1', 1), Label('L2', 2), Label('L3', 3), Label('L4', 3), Label('L5', 4)]
        Then interleaved is:
                add $s0, $s0, $s0
            L1: add $s1, $s1, $s1
            L2: add $s2, $s2, $s2
            L3:
            L4: add $s3, $s3, $s3
            L5:
    */
    var self = this;
    instructions.forEach(function(instruction, index) {
        var labelsForInstruction = labels.lookupLabelNames(index);

        // |instruction| has no labels, so LineOfCode only has |instruction| and no label.
        if (labelsForInstruction.length === 0) {
            self.push(new LineOfCode(instruction));
        }
        // |instruction| has 1 or more labels.
        else {
            labelsForInstruction.forEach(function(labelForInstruction, index) {
                // Only add |instruction| to the last label in |labelsForInstruction|.
                var instructionToAdd = ((index + 1) === labelsForInstruction.length) ? instruction : null;
                self.push(new LineOfCode(instructionToAdd, labelForInstruction));
            });
        }
    });

    // Remaining labels have an |instructionIndex| beyond any instruction.
    var remainingLabels = labels.filter(function(label) {
        return (label.instructionIndex >= instructions.length);
    });

    // Add remaining labels to Code.
    remainingLabels.forEach(function(remainingLabel) {
        self.push(new LineOfCode(null, remainingLabel));
    });
}
Code.prototype = new Array();
Code.prototype.constructor = Code;
