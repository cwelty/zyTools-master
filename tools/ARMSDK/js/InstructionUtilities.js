'use strict';

/* exported buildInstructionUtilities, REGISTER_ONLY, REGISTER_THEN_COMMA, INPUT_ONLY, REGISTER_THEN_INPUT, LABEL_ONLY,
            updateConditionalFlagsForSubtraction, makeCommentForLoadInstruction, makeCommentForStoreInstruction,
            updateConditionalFlagsForAddition */

// Constants used by *FormatInstruction objects to print an instruction with instruction.hbs.
let INPUT_ONLY = { useInput: true };
let LABEL_ONLY = { useLabel: true };
let REGISTER_ONLY = { useRegister: true };
let REGISTER_THEN_COMMA = {
    useRegister: true,
    useComma: true,
};
let REGISTER_THEN_INPUT = {
    useRegister: true,
    alsoUseInput: true,
};

/**
    Return whether the long is negative.
    @method isLongNegative
    @param {Long} long The long to check.
    @return {Boolean} Whether the long is negative.
*/
function isLongNegative(long) {
    return long.high < 0;
}

/**
    Update the conditional flags based on the result of the subtraction.
    @method updateConditionalFlagsForSubtraction
    @param {Long} firstValue The value to be subtracted from.
    @param {Long} secondValue The value to be subtracted with.
    @param {Object} simulatorContext Stores the conditional flags.
    @return {void}
*/
function updateConditionalFlagsForSubtraction(firstValue, secondValue, simulatorContext) {
    const result = firstValue.subtract(secondValue);

    // If highest 32-bits are negative, then result is negative.
    const isNegative = isLongNegative(result);

    // If all bits are 0, then result is 0.
    const isZero = (result.low === 0) && (result.high === 0);

    // In unsigned subtraction, borrow occurs when second value is larger than first value.
    const isBorrow = secondValue.greaterThan(firstValue);

    /*
        Overflow occurs if the result (C) has the wrong sign:
        * (+A) - (-B) = -C
        * (-A) - (+B) = +C
    */
    const firstCase = !isLongNegative(firstValue) && isLongNegative(secondValue) && isLongNegative(result);
    const secondCase = isLongNegative(firstValue) && !isLongNegative(secondValue) && !isLongNegative(result);
    const isOverflow = firstCase || secondCase;

    // Set conditional flags.
    simulatorContext.negative = isNegative ? 1 : 0;
    simulatorContext.zero = isZero ? 1 : 0;
    simulatorContext.carry = isBorrow ? 0 : 1;
    simulatorContext.overflow = isOverflow ? 1 : 0;
}

/**
    Update the conditional flags based on the result of the addition.
    @method updateConditionalFlagsForAddition
    @param {Long} firstValue The value to be added to.
    @param {Long} secondValue The value to be added with.
    @param {Object} simulatorContext Stores the conditional flags.
    @return {void}
*/
function updateConditionalFlagsForAddition(firstValue, secondValue, simulatorContext) {
    const result = firstValue.add(secondValue);

    // If highest 32-bits are negative, then result is negative.
    const isNegative = isLongNegative(result);

    // If all bits are 0, then result is 0.
    const isZero = (result.low === 0) && (result.high === 0);

    // In unsigned addition, carry occurs when the result is smaller than either operand.
    const isCarry = result.lessThan(firstValue) || result.lessThan(secondValue);

    /*
        Overflow occurs in signed addition when the operands have the same sign. Both operands are:
        * Positive: If result is negative, then we had overflow.
        * Negative: If result is positive, then we had overflow.
    */
    const positiveCase = !isLongNegative(firstValue) && !isLongNegative(secondValue) && isLongNegative(result);
    const negativeCase = isLongNegative(firstValue) && isLongNegative(secondValue) && !isLongNegative(result);
    const isOverflow = positiveCase || negativeCase;

    // Set conditional flags.
    simulatorContext.negative = isNegative ? 1 : 0;
    simulatorContext.zero = isZero ? 1 : 0;
    simulatorContext.carry = isCarry ? 1 : 0;
    simulatorContext.overflow = isOverflow ? 1 : 0;
}

/**
    Return a string comment for the load instruction.
    @method makeCommentForLoadInstruction
    @param {Array} properties Array of {String}. The properties of the load instruction.
    @param {Registers} registers The registers in the simulator.
    @return {String} A comment explaining this instruction.
*/
function makeCommentForLoadInstruction(properties, registers) {
    let comment = `// ${properties[0]} = M[${properties[1]} + ${properties[2]}]`;

    if (registers) {
        const memoryAddress = registers.lookupByRegisterName(properties[1]).add(properties[2]).toString();

        comment += ` = M[${memoryAddress}]`;
    }

    return comment;
}

/**
    Return a string comment for the store instruction.
    @method makeCommentForStoreInstruction
    @param {Array} properties Array of {String}. The properties of the store instruction.
    @param {Registers} registers The registers in the simulator.
    @return {String} A comment explaining this instruction.
*/
function makeCommentForStoreInstruction(properties, registers) {
    let comment = `// M[${properties[1]} + ${properties[2]}] = `;

    if (registers) {
        const memoryAddress = registers.lookupByRegisterName(properties[1]).add(properties[2]).toString();

        comment += `M[${memoryAddress}] = `;
    }

    return (comment + properties[0]);
}
