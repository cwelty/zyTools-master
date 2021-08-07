'use strict';

/* exported LabelInstructionComment */

/**
    Used to print each line of code. Each line may include a label, instruction, and/or comment.
    @class LabelInstructionComment
*/
class LabelInstructionComment {

    /**
        @constructor
        @param {String} label The label for this line.
        @param {String} instruction The instruction for this line.
        @param {String} comment The comment for this line.
        @param {Instruction} instructionObject The instruction object for this line.
        @param {Boolean} isDisabled Whether this line of code should look disabled.
    */
    constructor(label, instruction, comment, instructionObject, isDisabled) {
        this.label = label;
        this.instruction = instruction;
        this.comment = comment;
        this.instructionObject = instructionObject;
        this.isDisabled = isDisabled;
    }
}
