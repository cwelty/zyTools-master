'use strict';

/* global CompilerError */

/**
    Parse {Token}s, converting to {Instructions}.
    @class Parser
    @constructor
    @param {InsructionSetSDK} instructionSetSDK An SDK from which to make Instructions and Labels.
*/
function Parser(instructionSetSDK) {
    this._instructionSetSDK = instructionSetSDK;
}

/**
    Convert |tokensOfLines| to {Instructions}.
    @method parse
    @param {Array} of {TokensOfLine} tokensOfLines List of each line's tokens.
    @return {Instructions}
*/
Parser.prototype.parse = function(tokensOfLines) {
    // Remove space tokens as space is OK anywhere.
    tokensOfLines.forEach(function(tokensOfLine, index) {
        tokensOfLines[index].tokens = tokensOfLine.tokens.filter(function(token) {
            return (token.name !== 'space') && (token.name !== 'comment');
        });
    });

    const labelAndLineNumber = {};
    var labels             = this._instructionSetSDK.createLabels();
    var instructions       = this._instructionSetSDK.createInstructions();
    var instructionFactory = this._instructionSetSDK.createInstructionFactory();
    var unassignedLabels   = [];
    var self               = this;
    tokensOfLines.forEach(function(tokensOfLine) {
        var lineNumber = tokensOfLine.lineNumber;
        var tokens     = tokensOfLine.tokens;

        for (var i = 0; i < tokens.length; ++i) {
            switch (tokens[i].name) {
                // Add label to list of labels with unassigned instruction index.
                case 'label':
                    var value     = tokens[i].value;
                    var labelName = value.substr(0, value.length - 1); // Remove ending semicolon.

                    if (labelName in labelAndLineNumber) {
                        throw new CompilerError(
                            `Same label as on line ${labelAndLineNumber[labelName]}. A label should be defined only once.`,
                            lineNumber
                        );
                    }
                    labelAndLineNumber[labelName] = lineNumber;
                    unassignedLabels.push(labelName);
                    break;

                // Build instruction.
                case 'word':
                    // Store remaining tokens.
                    var remainingTokens = tokens.slice(i);
                    i                   = tokens.length;

                    // Create instruction from first token, which is the op code.
                    var opcode = remainingTokens[0].value;
                    try {
                        var instruction = instructionFactory.make(opcode);
                    }
                    catch (error) {
                        throw new CompilerError(error.message, lineNumber);
                    }
                    instruction.lineNumber = lineNumber;

                    // Remove first token used as op code.
                    remainingTokens.shift();

                    // Check that remaining tokens match instruction's expected token order.
                    var remainingTokenNames = remainingTokens.map(function(token) {
                        return token.name;
                    });
                    var tokenNamesMatch = require('utilities').twoArraysMatch(
                        instruction.expectedTokenNameOrder,
                        remainingTokenNames
                    );
                    if (!tokenNamesMatch) {
                        throw new CompilerError('Instruction has an error.', lineNumber);
                    }

                    // Convert remaining tokens to instruction properties.
                    var properties = [];
                    var registers  = self._instructionSetSDK.createRegisters();
                    remainingTokens.forEach(function(token) {
                        switch (token.name) {
                            case 'register':
                                var registerName = token.value;
                                properties.push(registerName);
                                break;
                            case 'numberThenRegister':
                                // Extract number from token value.
                                var split  = token.value.split('(');
                                var number = Number(split[0]);
                                properties.push(number);

                                // Extract register name from token value.
                                var registerName = split[1].substr(0, split[1].length - 1);
                                properties.push(registerName);
                                break;
                            case 'number':
                                properties.push(Number(token.value));
                                break;
                            case 'word':
                                properties.push(token.value);
                                break;
                        }
                    });

                    // Add properties to instruction.
                    properties.forEach(function(property, index) {
                        instruction.setPropertyByIndex(index, property);
                    });

                    // Check that register and constant values are valid.
                    try {
                        instruction.checkWhetherRegisterNamesAndConstantValuesAreValid();
                    }
                    catch (error) {
                        throw new CompilerError(error.message, lineNumber);
                    }


                    instructions.push(instruction);

                    // Attached unassigned labels to the new instruction.
                    var newInstructionIndex = instructions.length - 1;
                    self._assignLabels(labels, unassignedLabels, newInstructionIndex);
                    break;
                default:
                    throw new CompilerError('Unexpected text: ' + tokens[i].value, lineNumber);
                    break;
            }
        }
    });

    // Assign remaining labels to the location after the last instruction.
    this._assignLabels(labels, unassignedLabels, instructions.length);

    // Check that each instruction's label is defined.
    instructions.forEach(function(instruction) {
        instruction.getPropertiesConfiguration().forEach(function(propertyType, index) {
            // If the property type is a label, try to lookup that label.
            if (propertyType === 'label') {
                var labelName           = instruction.getPropertyByIndex(index);
                var labelProgramCounter = labels.lookupProgramCounter(labelName);
                if ((labelProgramCounter === null) || isNaN(labelProgramCounter)) {
                    throw new CompilerError('Label is undefined: ' + labelName, instruction.lineNumber);
                }
            }
        });
    });

    return {
        labels:       labels,
        instructions: instructions
    };
}

/**
    Assign each unassigned label an instruction index.
    @method _assignLabels
    @param {Labels} labels List of existing labels.
    @param {Array} of {String} unassignedLabels Names of labels that have yet to be assigned an instruction index.
    @param {Number} instructionIndex The instruction index to assign.
    @return {void}
*/
Parser.prototype._assignLabels = function(labels, unassignedLabels, instructionIndex) {
    unassignedLabels.forEach(function(unassignedLabel) {
        labels.addLabel(unassignedLabel, instructionIndex);
    });
    unassignedLabels.length = 0;
}
