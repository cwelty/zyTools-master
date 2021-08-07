'use strict';

/**
    Loop handlebars helpers for creating repeating elements with indices represented in binary.
    @param {Number} loopAmount A number indicating loop iterations.
    @param {Number} binaryLength A number specifying the binary represented length.
    @param {Number} startIndex A number specifying the starting index.
    @param {Number} outerIndex A number specifying the index of an outer loop.
    @param {String} block The handlebars block for this helper.
*/
Handlebars.registerHelper('loopWithBinaryIndexOutput', function(loopAmount, binaryLength, startIndex, outerIndex, block) {
    let totalLoops = '';

    for (let index = startIndex; index < (startIndex + loopAmount); index++) {

        // Convert the index into a binary string with a set bit-width
        let binaryIndex = index.toString(2); // eslint-disable-line no-magic-numbers

        while (binaryIndex.length < binaryLength) {
            binaryIndex = `0${binaryIndex}`;
        }

        totalLoops += block.fn({
            index,
            outerIndex,
            binaryIndex,
        });
    }

    return totalLoops;
});

function machineInstruction() {

    this.init = function(id, eventManager, options) {

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        this.submitted = false;
        this.showAssembly = (options && options.assemblerMode);

        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        // Include the assembly code block template
        Handlebars.registerPartial('assemblyCodeBlock', this[this.name]['assemblyInstructions']);

        var html = this[this.name]['machineInstruction']({
            id:           this.id,
            showAssembly: this.showAssembly
        });

        $('#' + this.id).html(css + html);

        var self = this;

        // Set up listeners based on tool's mode
        if (this.showAssembly) {
            // Hides run buttons and fades out machine instructions
            $('#' + this.id + ' .run-container').css('visibility', 'hidden');
            $('#' + this.id + ' .machine-instruction-container').fadeTo(0, 0);
            $('#' + this.id + ' .memory-container').fadeTo(0, 0);


            // Run assembler button
            $('#' + this.id + ' .run-assembler').click(function() {
                self.runAssembler();
            });

            // Enable/disable operand fields based on opCode
            $('#' + this.id + ' .assembly-op-code-text').change(function() {
                self.showAssemble();

                var opCodeValue = $(this).val();
                var lineNumber = $(this).attr('line');

                switch(opCodeValue) {
                    // Stop - Disable op1, op2, op3
                    case '00':
                        self.toggleOperand(0, lineNumber, true, false);
                        self.toggleOperand(1, lineNumber, true, false);
                        self.toggleOperand(2, lineNumber, true, false);
                        break;

                    // Output - Disable op2, op3
                    case '10':
                    // Input - Disable op2, op3
                    case '01':
                        self.toggleOperand(0, lineNumber, true, true);
                        self.toggleOperand(1, lineNumber, true, false);
                        self.toggleOperand(2, lineNumber, true, false);
                        break;

                    // ADD - Disable none
                    case '11':
                        self.toggleOperand(0, lineNumber, true, true);
                        self.toggleOperand(1, lineNumber, true, true);
                        self.toggleOperand(2, lineNumber, true, true);
                        break;
                }
            });

            // Assembly code was changed
            $('#' + this.id + ' .assembly-operand-text').change(function() {
                self.showAssemble();
            });
        }
        else {
            // If any opCode is changed update operands to be enabled or disabled
            $('#' + this.id + ' .op-code-text').change(function() {

                var lineNumber = parseInt($(this).attr('line'));

                var $opCodeInput = $('#' + self.id + ' .opCode' + lineNumber);
                var opCodeValue = $opCodeInput.val();

                // Enables / disables appropriate operands
                self.updateOperands(opCodeValue, lineNumber, true);

                // Update human readable instruction
                self.updateMessage(lineNumber);
            });

            // Operand changed, reset machine and update human readable instruction
            $('#' + this.id + ' .operand-text').change(function() {
                // Resets highlighted line and stored data
                self.resetMachine();

                var lineNumber = parseInt($(this).attr('line'));
                self.updateMessage(lineNumber);
            });
        }

        // Checks if user's input is valid when enter is pressed
        $('#' + this.id + ' .input-textbox').keypress(function(event) {
            if (event.keyCode === 13) {
                self.checkUserInput();
            }
        });

        // Checks if user's input is valid
        $('#' + this.id + ' .enter-input').click(function() {
            self.checkUserInput();
        });

        // Show reset prompt
        $('#' + this.id + ' .reset-button').click(function() {
            $('#' + self.id + ' .reset-prompt').show();
        });

        // Hide reset prompt
        $('#' + this.id + ' .cancel-button, #' + this.id + ' .reset-prompt').click(function() {
            $('#' + self.id + ' .reset-prompt').hide();
        });

        // Fires reset on tool
        $('#' + this.id + ' .confirm-button').click(function() {

            // Clears machine code
            $('#' + self.id + ' .op-code-text').val('00');
            $('#' + self.id + ' .operand-text').val('000');

            if (self.showAssembly) {
                // Clears assembly/machine code
                $('#' + self.id + ' .assembly-op-code-text').val('00').prop('disabled', false);
                $('#' + self.id + ' .assembly-operand-text').val('000').prop('disabled', true).addClass('hidden');

                // Reveal run assembler button
                $('#' + self.id + ' .run-assembler').show();

                // Hide machine instruction controls
                $('#' + self.id + ' .run-container').css('visibility', 'hidden');
                $('#' + self.id + ' .machine-instruction-container').fadeTo(0, 0);
                $('#' + self.id + ' .memory-container').fadeTo(0, 0);
            }
            else {
                // Disables appropriate machine code fields
                $('#' + self.id + ' .op-code-text').prop('disabled', false);
                $('#' + self.id + ' .operand-text').prop('disabled', true);

                $('#' + self.id + ' .instruction-action').text('Stop');
            }

            // Stops/resets machine if it was running
            self.startCodeAt = 0;
            self.stepMode = false;

            $('#' + self.id + ' .step-run').text('Run first instruction');
            $('#' + self.id + ' .run-all-container').show();
            $('#' + self.id + ' .step-run').show();

            // Resets saved memory and line trace
            self.resetMachine();
        });

        // Run machine instructions
        $('#' + this.id + ' .run-button').click(function() {
            self.stepMode = false;
            self.runMachineInstructions();
        });

        // Run first->run next->run first
        $('#' + this.id + ' .step-run').click(function() {
            self.stepMode = true;
            self.runMachineInstructions();
        });
    };

    // Stores the program counter to simulate a system with interrupts
    this.startCodeAt = 0;

    // Stores values at each memory location
    this.memoryLocations = [];

    // Indicates run mode
    this.stepMode = false;

    this.outputText = '';
    this.userInput = '';

    // Checks if the user's input is within the allowed bounds
    this.checkUserInput = function() {
        // Reference to the userInput container
        this.$userInputContainer = $('#' + this.id + ' .input-textbox');

        // Prevents decimal values
        this.userInput = parseInt(Number(this.$userInputContainer.val()));

        // Not a valid input
        if (isNaN(this.userInput) || (this.userInput > 99) || (this.userInput < 0)) {
            // Flash input field so user gets click feedback
            this.$userInputContainer.fadeOut().fadeIn();

            // Informs user of invalid input
            this.$userInputContainer.addClass('invalid-entry');
            $('#' + this.id + ' .prompt-warning').text('Please enter a value between 0 and 99.');
            return;
        }

        // Clears invalid input indicators
        this.$userInputContainer.removeClass('invalid-entry');
        $('#' + this.id + ' .prompt-warning').text('');

        $('#' + this.id + ' .enter-value-prompt').fadeOut();

        // Checks if the machine is in auto-run mode
        this.runMachineInstructions();
    };

    /*
        Enables / disables an operand input field
        |operand| (string) - specifies which operand is being modified.
        |lineNumber| (number) - specifies which line is being modified.
        |reset| (boolean) - determines if the value needs to be reset.
        |enable| (boolean) - sets mode of the operand to be enabled if true
    */
    this.toggleOperand = function(operand, lineNumber, reset, enable) {
        var operandId = (this.showAssembly) ? 'assemblyOperand' : 'operand';

        if (enable) {
            if (reset) {
                $('#' + this.id + ' .' + operandId + operand + lineNumber).val('101');
            }

            var $operandContainer = $('#' + this.id + ' .' + operandId + operand + lineNumber);
            $operandContainer.find('option[value=000]').hide();
            $operandContainer.prop('disabled', false);
            $operandContainer.removeClass('hidden');
        }
        else {
            if (reset) {
                $('#' + this.id + ' .' + operandId + operand + lineNumber).val('000');
            }

            var $operandContainer = $('#' + this.id + ' .' + operandId + operand + lineNumber);
            $operandContainer.prop('disabled', true);
            $operandContainer.addClass('hidden');
        }
    };

    // Highlights the current line of code
    this.highlightLine = function(line) {
        $('#' + this.id + ' .highlighted-line').removeClass('highlighted-line');

        // No line to highlight
        if (line === -1) {
            return;
        }

        $('#' + this.id + ' .machine-instructions').find('tr').eq(line).addClass('highlighted-line');

        // Line highlighting for assembly code
        if (this.showAssembly) {
            $('#' + this.id + ' .assembly-instructions').find('tr').eq(line).addClass('highlighted-line');
        }
    };

    // Clears data memory
    this.clearMemory = function() {
        this.memoryLocations[5] = 0;
        this.memoryLocations[6] = 0;
        this.memoryLocations[7] = 0;

        $('#' + this.id + ' .data-at-memory').text('00000000000');
        $('#' + this.id + ' .data-decimal-value').text('0');
    };

    // Resets highlighted line and stored memory
    this.resetMachine = function() {
        this.highlightLine(-1);
        this.clearMemory();
    };

    // Updates the human readable instructions
    this.updateMessage = function(line) {
        var opCode = $('#' + this.id + ' .opCode' + line).val();
        var op1 = $('#' + this.id + ' .operand0' + line).val();
        var op2 = $('#' + this.id + ' .operand1' + line).val();
        var op3 = $('#' + this.id + ' .operand2' + line).val();

        var message = '';
        // Format the message based on operation
        switch(opCode) {
            case '00':
                message = 'Stop';
                break;

            case '10':
                message = 'Outputs M[' + op1 + ']';
                break;

            case '01':
                message = 'Gets input into M[' + op1 + ']';
                break;

            case '11':
                message = 'M[' + op1 + '] = M[' + op2 + '] + M[' + op3 + ']';
                break;
        }

        var $tableRows = $('#' + this.id + ' .human-readable-instructions').find('tr');
        $tableRows.eq(line).find('td').text(message);
    };

    // Enables/disables appropriate operands
    this.updateOperands = function(opCodeValue, lineNumber, reset) {
        // Disables appropriate operands
        switch(opCodeValue) {
            // Stop - Disable op1, op2, op3
            case '00':
                this.toggleOperand(0, lineNumber, reset, false);
                this.toggleOperand(1, lineNumber, reset, false);
                this.toggleOperand(2, lineNumber, reset, false);
                break;

            // Output - Disable op2, op3
            case '10':
            // Input - Disable op2, op3
            case '01':
                this.toggleOperand(0, lineNumber, reset, true);
                this.toggleOperand(1, lineNumber, reset, false);
                this.toggleOperand(2, lineNumber, reset, false);
                break;

            // ADD - Disable none
            case '11':
                this.toggleOperand(0, lineNumber, reset, true);
                this.toggleOperand(1, lineNumber, reset, true);
                this.toggleOperand(2, lineNumber, reset, true);
                break;
        }
    };


    // Sets output variable to |output| and if |append| is true append the |output| string to existing output.
    this.setOutput = function(output, append) {
        if (append) {
            // Appends |output| to existing this.outputText
            this.outputText = this.outputText + output;
        }
        else {
            // Set output to |output|
            this.outputText = output;
        }

        // Clear console
        $('#' + this.id + ' .output-console').val(this.outputText);
    };

    // Sets data memory location
    this.setDataMemory = function(location, value) {
        var binaryDataValue = parseInt(value).toString(2);

        var binaryStringLength = 11;

        while (binaryDataValue.length < binaryStringLength) {
            binaryDataValue = '0' + binaryDataValue;
        }

        var decimalDataValue = parseInt(value);

        if (binaryDataValue.length > binaryStringLength) {
            binaryDataValue = binaryDataValue.substr(-binaryStringLength);
            decimalDataValue = parseInt(binaryDataValue, 2);
        }

        $('#' + this.id + ' .location-' + location).text(binaryDataValue);
        $('#' + this.id + ' .decimal-' + location).text(decimalDataValue);
    };

    // Run machine instructions
    this.runMachineInstructions = function() {

        if (this.startCodeAt === 0) {
            // Fade out run buttons
            $('#' + this.id + ' .run-all-container').hide();

            if (!this.stepMode) {
                $('#' + this.id + ' .step-run').hide();
            }

            // Clear output console
            this.setOutput('', false);

            if (this.showAssembly) {
                $('#' + this.id + ' .assembly-op-code-text, #' + this.id + ' .assembly-operand-text').prop('disabled', true);
            }
            else {
                $('#' + this.id + ' .op-code-text, #' + this.id + ' .operand-text').prop('disabled', true);
            }
        }

        var self = this;
        var $instructions = $('#' + this.id + ' .machine-instructions').find('tr.instruction-line');
        $instructions.each(function(instructionLine) {
            // Skip instructions that have already been evaluated
            if ((instructionLine < self.startCodeAt) || (self.stepMode && (instructionLine != self.startCodeAt))) {
                return true;
            }

            self.highlightLine(instructionLine);

            // Last instruction line in the program
            var endOfProgram = 4;

            // Terminate if machine code reaches the 5th instruction
            if (instructionLine === endOfProgram) {
                self.startCodeAt = ($instructions.length + 1);
                return false;
            }

            // Get all op values
            var $operationSegments = $(this).find('td');

            var opCode = $operationSegments.eq(0).find('select, input').val();
            var op1 = $operationSegments.eq(1).find('select, input').val();
            var op2 = $operationSegments.eq(2).find('select, input').val();
            var op3 = $operationSegments.eq(3).find('select, input').val();

            // Get user's input
            if ((opCode === '01') && (self.userInput === '')) {
                self.startCodeAt = instructionLine;
                $('#' + self.id + ' .enter-value-prompt').fadeIn();
                $('#' + self.id + ' .input-textbox').focus().val('0');
                return false;
            }
            // Terminate program
            else if (opCode === '00') {
                self.startCodeAt = ($instructions.length + 1);
                return false;
            }
            // Store user's input
            else if ((opCode === '01') && (self.userInput !== '')) {
                self.memoryLocations[parseInt(op1, 2)] = self.userInput;

                self.setDataMemory(op1, self.userInput);
                self.userInput = '';
            }
            // Output value at memory location
            else if (opCode === '10') {
                self.setOutput(self.memoryLocations[parseInt(op1, 2)] + '\r\n', true);
            }
            // Add values and store the sum
            else if (opCode === '11') {
                var computedSum = (parseInt(self.memoryLocations[parseInt(op2, 2)]) + parseInt(self.memoryLocations[parseInt(op3, 2)]));
                self.memoryLocations[parseInt(op1, 2)] = computedSum;

                self.setDataMemory(op1, computedSum);
            }

            // Set next instruction for step mode
            if (self.stepMode) {
                self.startCodeAt = instructionLine + 1;
                return false;
            }
        });

        // Program completed, reset the starting pointer
        if (this.startCodeAt >= $instructions.length) {
            // Reset line iterator and run mode
            this.startCodeAt = 0;
            this.stepMode = false;

            // Reset button text
            $('#' + this.id + ' .step-run').text('Run first instruction');

            // Reveal run buttons
            $('#' + this.id + ' .run-all-container').show();
            $('#' + this.id + ' .step-run').show();

            var self = this;

            if (this.showAssembly) {
                // Re-enable drop-downs
                $('#' + this.id + ' .assembly-op-code-text, #' + this.id + ' .assembly-operand-text').prop('disabled', false);

                $('#' + this.id + ' .assembly-instructions').find('tr').each(function(instructionsLine) {
                    // Get opCode
                    var $operationSegments = $(this).find('td');
                    var opCode = $operationSegments.eq(0).find('select').val();
                    self.updateOperands(opCode, instructionsLine, false);
                });
            }
            else {
                // Re-enable drop-downs
                $('#' + this.id + ' .op-code-text, #' + this.id + ' .operand-text').prop('disabled', false);

                $instructions.each(function(instructionsLine) {
                    // Get opCode
                    var $operationSegments = $(this).find('td');
                    var opCode = $operationSegments.eq(0).find('select').val();
                    self.updateOperands(opCode, instructionsLine, false);
                });
            }


            if (!this.submitted) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        event: 'Simulation completed.'
                    }
                };

                this.eventManager.postEvent(event);
                this.submitted = true;
            }
        }
        else if (this.stepMode) {
            // Update run button text for step mode
            $('#' + this.id + ' .step-run').text('Run next');
        }
    };

    // Converts the assembly code into machine instructions
    this.runAssembler = function() {
        $('#' + this.id + ' .run-assembler').hide();
        this.resetMachine();

        // Assembly instruction lines
        var $assemblyInstructions = $('#' + this.id + ' .assembly-instructions').find('tr');

        // Machine instruction lines
        var $machineInstructions = $('#' + this.id + ' .machine-instructions').find('tr');

        $assemblyInstructions.each(function(instructionLine) {
            var $columns = $(this).find('td');

            // Termination line does not change
            if ($(this).hasClass('stop-line')) {
                return false;
            }

            // Get all op values
            var opCode = $columns.eq(0).find('select').val();
            var op1 = $columns.eq(1).find('select').val();
            var op2 = $columns.eq(2).find('select').val();
            var op3 = $columns.eq(3).find('select').val();

            // Fill in machine instructions
            var $machineInstructionCells = $machineInstructions.eq(instructionLine).find('td');
            $machineInstructionCells.eq(0).find('input').val(opCode);
            $machineInstructionCells.eq(1).find('input').val(op1);
            $machineInstructionCells.eq(2).find('input').val(op2);
            $machineInstructionCells.eq(3).find('input').val(op3);
        });

        // Fade in machine instruction container and buttons
        $('#' + this.id + ' .run-container').css('visibility', 'visible');
        $('#' + this.id + ' .run-container').fadeTo(0, 0);
        $('#' + this.id + ' .run-container').fadeTo(2000, 1);
        $('#' + this.id + ' .machine-instruction-container').fadeTo(2000, 1);
        $('#' + this.id + ' .memory-container').fadeTo(2000, 1);

    };

    // Show the run assembler button and fade out machine instructions
    this.showAssemble = function() {
        $('#' + this.id + ' .run-assembler').show();

        // Hides run buttons and fades out machine instructions
        $('#' + this.id + ' .run-container').css('visibility', 'hidden');
        $('#' + this.id + ' .machine-instruction-container').fadeTo(0, 0);
        $('#' + this.id + ' .memory-container').fadeTo(0, 0);
    };
    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

var machineInstructionExport = {
    create: function() {
        return new machineInstruction();
    }
};
module.exports = machineInstructionExport;
