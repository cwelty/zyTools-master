function InstrSetSim() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.OPCODES = MIPS_OP_CODES;
        if (!!options) {
            if (options.isARM) {
                this.OPCODES = ARM_OP_CODES;
            }
        }

        this.opCodes = [
            { opCode: '---' },
            { opCode: this.OPCODES.add },
            { opCode: this.OPCODES.sub }
        ];

        this.instructions = [
            { index: '1', initialOpCode: this.OPCODES.add, initialDestination: 'e', initialSource1: 'b', initialSource2: 'c' },
            { index: '2', initialOpCode: this.OPCODES.add, initialDestination: 'a', initialSource1: 'e', initialSource2: 'd' },
            { index: '3', initialOpCode: '---', initialDestination: 'a', initialSource1: 'b', initialSource2: 'c' },
            { index: '4', initialOpCode: '---', initialDestination: 'a', initialSource1: 'b', initialSource2: 'c' },
            { index: '5', initialOpCode: '---', initialDestination: 'a', initialSource1: 'b', initialSource2: 'c' },
            { index: '6', initialOpCode: '---', initialDestination: 'a', initialSource1: 'b', initialSource2: 'c' }
        ];

        this.registers = [
            { name: 'a', initialValue: 2 },
            { name: 'b', initialValue: 5 },
            { name: 'c', initialValue: 19 },
            { name: 'd', initialValue: 3 },
            { name: 'e', initialValue: 11 }
        ];

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['instrSetSim']({
            id:           this.id,
            registers:    this.registers,
            instructions: this.instructions,
            opCodes:      this.opCodes
        });
        $('#' + this.id).html(css + html);

        this.$instructionOptions = $('#' + this.id + ' .instr-block select');
        this.$instructionRows = $('#' + this.id + ' .instr-block tr');
        this.$registers = $('#' + this.id + ' .register-input');
        this.$startButton = $('#startButton_' + this.id);
        this.$resetButton = $('#resetButton_' + this.id);
        this.$executeNextButton = $('#executeNext_' + this.id);
        this.$preExecutionBox = $('#' + this.id + ' .pre-execution-box');

        var self = this;
        // Set initial instruction options.
        for (var i = 0; i < this.instructions.length; i++) {
            $('#opCode_' + this.instructions[i].index + '_' + this.id + ' option').each(function() {
                var $this = $(this);
                $this.prop('selected', $this.val() === self.instructions[i].initialOpCode);
            });
            $('#destination_' + this.instructions[i].index + '_' + this.id + ' option').each(function() {
                var $this = $(this);
                $this.prop('selected', $this.val() === self.instructions[i].initialDestination);
            });
            $('#source1_' + this.instructions[i].index + '_' + this.id + ' option').each(function() {
                var $this = $(this);
                $this.prop('selected', $this.val() === self.instructions[i].initialSource1);
            });
            $('#source2_' + this.instructions[i].index + '_' + this.id + ' option').each(function() {
                var $this = $(this);
                $this.prop('selected', $this.val() === self.instructions[i].initialSource2);
            });
        }

        this.$instructionOptions.attr('disabled', true);
        this.$registers.attr('disabled', true);
        this.$resetButton.hide();
        this.$executeNextButton.addClass('disabled');
        this.$preExecutionBox.css('opacity', 0);
        this.$preExecutionBox.css('width', $('#' + this.id + ' .instr-block').width());

        this.$startButton.click(function() {
            self.startButtonClick();
        });
        this.$resetButton.click(function() {
            self.resetButtonClick();
        });
        this.$executeNextButton.click(function() {
            self.executeNextButtonClick();
        });

        $('#' + this.id).click(function() { // User gets a 'complete' for clicking the tool
            if (!self.beenClicked) {
                self.beenClicked = true;
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'instr sim clicked'
                    }
                };
                self.parentResource.postEvent(event);
            }
        });
    };

    this.currentInstruction = 0; // value of 0 means in edit (pre-execution) state
                                 // value of 1 means currently executing instruction 1
                                 // value of n means currently executing instruction n

    this.startButtonClick = function() {
        this.$instructionOptions.attr('disabled', false);
        this.$registers.attr('disabled', false);
        this.$startButton.hide();
        this.$resetButton.show();
        this.$executeNextButton.removeClass('disabled');
        this.$preExecutionBox.css('opacity', 1);
        this.currentInstruction++;
    };

    this.resetButtonClick = function() {
        this.$instructionOptions.attr('disabled', true);
        this.$registers.attr('disabled', true);
        this.$registers.finish(); // finish animating
        this.$registers.removeClass('highlighted-register');
        this.$startButton.show();
        this.$resetButton.hide();
        this.$executeNextButton.addClass('disabled');
        this.$preExecutionBox.css('opacity', 0);
        this.currentInstruction = 0;
        this.$executeNextButton.text('Execute first instruction');
        this.$instructionRows.removeClass('highlighted');
        this.resetRegisterValues();
    };

    this.executeNextButtonClick = function() {
        if (!this.$executeNextButton.hasClass('disabled')) {
            if (this.currentInstruction === 0) { // Pre-instruction execution when user can edit instructions and register values
                this.$executeNextButton.text('Execute first instruction');
                this.$preExecutionBox.css('opacity', 1);
                this.$instructionRows.removeClass('highlighted');
                this.$registers.removeClass('highlighted-register');
                this.$registers.attr('disabled', false);
                this.$instructionOptions.attr('disabled', false);
                this.resetRegisterValues();
                this.currentInstruction++;
            } else {
                if (this.currentInstruction === 1) { // First instruction about to execute
                    for (var i = 0; i < this.registers.length; i++) { // save initial register values
                        this.registers[i].initialValue = $('#register_' + this.registers[i].name + '_' + this.id).val();
                    }
                }

                this.$instructionOptions.attr('disabled', true);
                this.$registers.attr('disabled', true);
                this.$executeNextButton.addClass('disabled');
                this.$preExecutionBox.css('opacity', 0);

                // -------------- Instruction execution -------------- //
                var destinationRegister = $('#destination_' + this.currentInstruction + '_' + this.id).val();
                var source1Register = $('#source1_' + this.currentInstruction + '_' + this.id).val();
                var source2Register = $('#source2_' + this.currentInstruction + '_' + this.id).val();

                var $destination = $('#register_' + destinationRegister + '_' + this.id);
                var $source1 = $('#register_' + source1Register + '_' + this.id);
                var $source2 = $('#register_' + source2Register + '_' + this.id);

                var opCode = $('#opCode_' + this.currentInstruction + '_' + this.id).val();
                var result = 0;
                var doUpdateRegisterValue = true;
                switch (opCode) {
                    case this.OPCODES.add:
                        result = parseInt($source1.val()) + parseInt($source2.val());
                        break;
                    case this.OPCODES.sub:
                        result = parseInt($source1.val()) - parseInt($source2.val());
                        break;
                    default:
                        doUpdateRegisterValue = false;
                        break;
                }
                // --------------------------------------------------- //

                if (doUpdateRegisterValue) {
                    this.updateRegisterValue($destination, result, this.postInstructionExecution);
                } else {
                    this.postInstructionExecution();
                }
            }
        }
    };

    this.updateRegisterValue = function($destination, result, callback) {
        this.$instructionRows.removeClass('highlighted');
        this.$registers.removeClass('highlighted-register');

        this.$instructionRows.eq(this.currentInstruction - 1).addClass('highlighted'); // highlight instruction
        $destination.addClass('highlighted-register'); // highlight destination register

        // animate register value change
        var initialDelay = 500;
        var animationTimeLength = 1000;

        var self = this;
        $destination.delay(initialDelay)
                    .animate({ opacity: 0 }, animationTimeLength, function() {
                        $destination.val(result);
                    })
                    .animate({ opacity: 1 }, animationTimeLength, function() {
                        callback.apply(self);
                    });
    };

    this.postInstructionExecution = function() {
        this.currentInstruction++;
        var nextOpCode = $('#opCode_' + this.currentInstruction + '_' + this.id).val();
        if (this.currentInstruction === 2) {
            this.$executeNextButton.text('Next instruction');
        } else if ((this.currentInstruction > this.$instructionRows.length) || (nextOpCode === '---')) { // last instruction reached OR the next instruction is invalid
            this.$executeNextButton.text('Again');
            this.currentInstruction = 0;
        }
        this.$executeNextButton.removeClass('disabled');
    };

    this.resetRegisterValues = function() {
        for (var i = 0; i < this.registers.length; i++) { // Revert to initial register values
            $('#register_' + this.registers[i].name + '_' + this.id).val(this.registers[i].initialValue);
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var instrSetSimExport = {
    create: function() {
        return new InstrSetSim();
    }
};
module.exports = instrSetSimExport;
