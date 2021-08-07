'use strict';

/* global InputOutputData */

/**
    ALU simulator activity wherein the user indicates the ALU input signals and the tool gives the output.
    @module AluSimulator
    @return {void}
*/
class AluSimulator {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The name of the tool.
            @property name
            @type {String}
        */
        this.name = '<%= grunt.option("tool") %>';

        /**
            The handlebars template functions.
            @property templates
            @type {Object}
        */
        this.templates = this[this.name];

        /**
            Reference to the parent resource object.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            Reference to the utility module.
            @property utilities
            @type {Utilities}
        */
        this.utilities = require('utilities');

        /**
            Wether an event was submitted to |parentResource|.
            @property submitted
            @type {Boolean}
            @default false
        */
        this.submitted = false;

        /**
            The number of bits for each data input.
            @property inputBits
            @type {Number}
            @default 2
        */
        this.inputBits = 2;

        /**
            The number of output bits of the ALU.
            @property outputBits
            @type {Number}
            @default 2
        */
        this.outputBits = 2;

        /**
            The first data input (A).
            @property aInput
            @type {InputOutputData}
        */
        this.aInput = new InputOutputData('00', this.inputBits, false, 'c');

        /**
            The second data input (B)
            @property bInput
            @type {InputOutputData}
        */
        this.bInput = new InputOutputData('00', this.inputBits, false, 'd');
        const selectBits = 2;

        /**
            The multiplexor selector input.
            @property selectInput
            @type {InputOutputData}
        */
        this.selectInput = new InputOutputData('00', selectBits, false, 'mux');

        /**
            The ALU data output.
            @property aluOutput
            @type {InputOutputData}
        */
        this.aluOutput = new InputOutputData('00', this.outputBits, false, 's');

        /**
            jQuery object refering to this instance of the tool.
            @property $tool
            @type {jQuery}
            @default null
        */
        this.$tool = null;
    }

    /**
        Initialize the ALU simulator.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.$tool = $(`#${id}`);
        this.parentResource = parentResource;
        this.utilities.addIfConditionalHandlebars();

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this.templates.aluSimulator({
            aluOutput: this.aluOutput,
            id,
            inputSize: this.inputBits,
            selectInput: this.selectInput,
        });

        this.$tool.html(css + html);
        this.$tool.find('div.function-table-container').html(this.templates.functionTable({}));

        const $muxesDiv = this.$tool.find('div.muxes');
        const $adderDiv = this.$tool.find('div.adder');
        const $firstDataInput = this.$tool.find('div#first-data-input');
        const $secondDataInput = this.$tool.find('div#second-data-input');
        const notResource = this.parentResource.getResourceURL('not.png', this.name);

        $muxesDiv.html(this.templates.mux4x1({
            inputWireName: 'c1',
            wirePrefix: 'c',
            wireNumber: 1,
            isCrossedInFirstRow: true,
        }));
        $muxesDiv.append(this.templates.mux4x1({
            inputWireName: 'c0',
            wirePrefix: 'c',
            wireNumber: 0,
            isCrossedInFirstRow: true,
            isFirstRowFullCross: true,
            isCrossedInSecondRow: true,
        }));
        $muxesDiv.append(this.templates.mux4x1({
            inputWireName: 'd1',
            wirePrefix: 'd',
            wireNumber: 1,
            isInitialFirstRowCross: true,
            isSecondRowFullCross: true,
            not: notResource,
        }));
        $muxesDiv.append(this.templates.mux4x1({
            inputWireName: 'd0',
            wirePrefix: 'd',
            wireNumber: 0,
            isInitialSecondRowCross: true,
            not: notResource,
        }));
        $muxesDiv.append(this.templates.mux4x1({
            inputWireName: 's0',
        }));

        $adderDiv.append(this.templates['2bitAdder']({}));

        $firstDataInput.html(this.templates.dataInput({
            input: this.aInput,
        }));
        $secondDataInput.html(this.templates.dataInput({
            input: this.bInput,
        }));

        this.$tool.find('div.button').click(event => {
            const $element = $(event.target);
            const previousValue = parseInt($element.text(), 10);
            const newValue = previousValue === 0 ? 1 : 0;

            $element.text(newValue);
            this.getInputsAndSimulate();
        });

        // Runs the tool after it has been initialized with initial values
        this.getInputsAndSimulate();

        // If a button is clicked, run the simulator.
        this.$tool.find('.button').click(() => {
            const inputs = this.updateInputDecimalValues();

            this.getInputsAndSimulate();

            // Submits activity data
            const event = {
                part: 0,
                complete: true,
                answer: '',
                metadata: {
                    event: 'ALU simulator used',
                    inputs,
                },
            };

            this.parentResource.postEvent(event);
            this.submitted = true;
        });
    }

    /**
        Gets input values and runs the simulation.
        @method getInputsAndSimulate
        @return {void}
    */
    getInputsAndSimulate() {
        const inputs = this.updateInputDecimalValues();

        this.runALUSimulator(inputs.cInputBinary, inputs.dInputBinary, inputs.muxInputBinary);
    }

    /**
        Updates the decimal value for the inputs
        @method updateInputDecimalValues
        @return {Object}
    */
    updateInputDecimalValues() {

        // Get references to input containers
        const $aInput = this.$tool.find('.c-bit');
        const $bInput = this.$tool.find('.d-bit');
        const $muxSelect = this.$tool.find('.mux-bit');

        // Get all input string values
        let cInputBinary = '';
        let dInputBinary = '';
        let muxInputBinary = '';

        $aInput.each((index, element) => {
            cInputBinary += $(element).text();
        });

        $bInput.each((index, element) => {
            dInputBinary += $(element).text();
        });

        $muxSelect.each((index, element) => {
            muxInputBinary += $(element).text();
        });

        // Update input and selector information shown to user.
        this.$tool.find('.c-binary-string').text(cInputBinary);
        this.$tool.find('.d-binary-string').text(dInputBinary);
        this.$tool.find('.mux-binary-string').text(muxInputBinary);

        this.$tool.find('.c-input-decimal-value').text(`(${parseInt(cInputBinary, 2)})`);
        this.$tool.find('.d-input-decimal-value').text(`(${parseInt(dInputBinary, 2)})`);
        this.$tool.find('.mux-input-decimal-value').text(`(${parseInt(muxInputBinary, 2)})`);

        return {
            cInputBinary,
            dInputBinary,
            muxInputBinary,
        };
    }

    /**
        Runs the ALU simulator
        @method runALUSimulator
        @param {String} cInputBinary The binary value of the first data input.
        @param {String} dInputBinary The binary value of the second data input.
        @param {String} muxInput The binary value of the multiplexor selector inputs.
        @return {void}
    */
    runALUSimulator(cInputBinary, dInputBinary, muxInput) {
        const decimalMuxSelector = parseInt(muxInput, 2);
        const $inputWires = this.$tool.find(`.table-4x1-mux .i${decimalMuxSelector}`)
                                      .add(this.$tool.find(`.input-data-container .wire-table .i${decimalMuxSelector}`));

        // Remove any previous in-mux connection.
        this.$tool.find(`.bottom-select,.right-select,.bottom-select-i${decimalMuxSelector}`)
                  .css('border-bottom', 'none')
                  .css('border-right', 'none');

        // Paint the correct in-mux connection. Color is @zyante-green lightened by 30%.
        $inputWires.filter('.bottom-select')
                   .add(this.$tool.find(`.bottom-select-i${decimalMuxSelector}`))
                   .css('border-bottom', '1px dotted #bfcc80');
        $inputWires.filter('.right-select').css('border-right', '1px dotted #bfcc80');

        // Reset wires (remove bolding and values), then bold the active ones.
        this.$tool.find('.table-4x1-mux td').css('box-shadow', 'none')
                                            .removeClass('activate-right')
                                            .removeClass('activate-bottom')
                                            .removeClass('activate-both')
                                            .css('boder-color', 'gray')
                                            .data('active', false);
        this.boldActiveWires($inputWires, decimalMuxSelector);
        this.displayInputValuesInCircuit(cInputBinary, dInputBinary, decimalMuxSelector);

        // Define adder input and output signals.
        let adderA1 = parseInt(cInputBinary[0], 2);
        let adderA0 = parseInt(cInputBinary[1], 2);
        let adderA = cInputBinary;
        let adderB1 = parseInt(dInputBinary[0], 2);
        let adderB0 = parseInt(dInputBinary[1], 2);
        let adderB = dInputBinary;
        let adderCin = 0;
        let operationResult = null;
        let outputBinary = '';

        // Function table row height, used to move the highlight in the function table.
        const rowHeight = 26;
        let highlightDistanceFromTop = 53;

        // For each possible multiplexor selector input. Do the logic before entering the adder. Then make the addition.
        switch (muxInput) {

            // ADD. No additional logic needed.
            case '00': {
                break;
            }

            // SUB. Invert second data input values. Carry-in is set to 1.
            case '01': {
                highlightDistanceFromTop += rowHeight;

                // Invert B input, then add A and B with 1 in cin input.
                adderB1 = Math.abs(adderB1 - 1);
                adderB0 = Math.abs(adderB0 - 1);
                this.$tool.find('.d1-inverted').text(adderB1);
                this.$tool.find('.d0-inverted').text(adderB0);
                adderCin = 1;
                adderB = `${adderB1}${adderB0}`;
                break;
            }

            // AND. Set first adder input to the AND of both data input. The rest is set to 0.
            case '10': {
                highlightDistanceFromTop += rowHeight * 2; // eslint-disable-line no-magic-numbers

                // Calculate bitwise AND: a1&b1, then a0&b0.
                adderA1 = adderA1 && adderB1;
                adderA0 = adderA0 && adderB0;
                adderB1 = 0;
                adderB0 = 0;
                adderA = `${adderA1}${adderA0}`;
                adderB = `${adderB1}${adderB0}`;

                this.$tool.find('.c1-and-result').text(adderA1);
                this.$tool.find('.c0-and-result').text(adderA0);
                break;
            }

            // Pass first data input through. Second adder input is set to 0.
            case '11': {
                highlightDistanceFromTop += rowHeight * 3; // eslint-disable-line no-magic-numbers

                // b1b0 is 00.
                adderB1 = 0;
                adderB0 = 0;
                adderB = `${adderB1}${adderB0}`;
                break;
            }
            default:
                break;
        }

        // Animate function table selected.
        this.$tool.find('.table-highlight').stop(true).animate({ top: `${highlightDistanceFromTop}px` });

        operationResult = this.binaryAddition(adderA, adderB, adderCin);
        outputBinary = operationResult.stringResult;
        const adderCout = operationResult.cout;

        // Add back leading 0's
        while (outputBinary.length < this.outputBits) {
            outputBinary = `0${outputBinary}`;
        }

        // If there are too many output bits, only take right |this.outputBits| binary values.
        if (outputBinary.length > this.outputBits) {
            outputBinary = outputBinary.substr(-this.inputBits);
        }

        // Set the output to computed value
        const adderS1 = outputBinary[0];
        const adderS0 = outputBinary[1];
        const $output = this.$tool.find('.led-container').children('input');

        // Display arithmetic logic to user
        $($output).val(outputBinary);

        this.$tool.find('td.a1-output').text(adderA1);
        this.$tool.find('td.a0-output').text(adderA0);
        this.$tool.find('td.b1-output').text(adderB1);
        this.$tool.find('td.b0-output').text(adderB0);
        this.$tool.find('td.cin-output').text(adderCin);
        this.$tool.find('td.cout-output').text(adderCout);
        this.$tool.find('td.s1-output').text(outputBinary[0]);
        this.$tool.find('td.s0-output').text(outputBinary[1]);

        // Handle the carry bit for the second bit.
        if (operationResult.carrySecondBit) {
            this.$tool.find('td.operation-carry').text('1');
        }
        else {
            this.$tool.find('td.operation-carry').text('');
        }
        this.$tool.find('td.adder-a1-input').text(adderA1);
        this.$tool.find('td.adder-a0-input').text(adderA0);
        this.$tool.find('td.adder-b1-input').text(adderB1);
        this.$tool.find('td.adder-b0-input').text(adderB0);
        this.$tool.find('td.adder-cin-input').text(adderCin);

        this.$tool.find('td.adder-cout-output').text(adderCout);
        this.$tool.find('td.adder-s1-output').text(adderS1);
        this.$tool.find('td.adder-s0-output').text(adderS0);

        // Sets equation field values
        this.$tool.find('.output-binary-string').text(outputBinary);
        this.$tool.find('.output-decimal-value').text(`(${parseInt(outputBinary, 2)})`);

        // Set output LEDs
        outputBinary.split('').forEach((bit, position) => {
            $($output[position]).prop('checked', bit === '1');
        });
    }

    /**
        Unbold all wires, then find the active wires and bold them.
        @method boldActiveWires
        @param {jQuery} $inputWires jQuery Array containing all wires that may be bolded.
        @param {Number} decimalMuxSelector The decimal value of the mux selector signals.
        @return {void}
    */
    boldActiveWires($inputWires, decimalMuxSelector) {
        const sides = [ 'right', 'bottom' ];

        /*
            Go through the wires and find the ones that need bolding.
            1 - Loop through each border side. We only use right and bottom.
                2 - Loop through each input data wire. Ex: The wires for each a and b input data.
                    3 - Loop through each wire number. Ex: If a data input has 2 wires, loop through a1, then a0.
                        Find the table borders (wire segments) that need bolding and mark them.
        */
        sides.forEach(side => {
            [ 'c', 'd' ].forEach(inputName => {
                [ '1', '0' ].forEach(wireNumber => {

                    // Find the wires filtered by the each loops. Ex: a1r means the wire corresponds to data input a1 and is a vertical one.
                    const $wireClass = inputName + wireNumber + side[0];
                    const $matchingWires = $inputWires.filter(`.${$wireClass}`)
                                                      .add($inputWires.filter(`.${side}.${$wireClass}`))
                                                      .add($inputWires.filter(`.${$wireClass}-i${decimalMuxSelector}`));

                    $matchingWires.each((index, wire) => {
                        const $wire = $(wire);

                        if ($wire.hasClass(side)) {
                            const activeSideData = $wire.data('active');
                            let activeSide = activeSideData;

                            // Activate the corresponding sides.
                            if (activeSideData === 'both') {
                                return;
                            }
                            else if (side === 'right') {
                                activeSide = activeSideData === 'bottom' ? 'both' : 'right';
                            }
                            else if (side === 'bottom') {
                                activeSide = activeSideData === 'right' ? 'both' : 'bottom';
                            }
                            $wire.data('active', activeSide);
                        }
                    });
                });
            });
        });

        // Go through all the wires. Animate the activation of all the marked ones.
        $inputWires.each((index, wire) => {
            const $wire = $(wire);
            const activeSide = $wire.data('active');

            if (activeSide) {
                $wire.addClass(`activate-${activeSide}`);
            }
        });
    }

    /**
        Remove the values shown in the circuit and show the correct ones.
        @method displayInputValuesInCircuit
        @param {String} cInputBinary The binary value of the first data input.
        @param {String} dInputBinary The binary value of the second data input.
        @param {Number} decimalMuxSelector The decimal value of the mux selector signals.
        @return {void}
    */
    displayInputValuesInCircuit(cInputBinary, dInputBinary, decimalMuxSelector) {

        // Display the input value near relevant wires. Hide the rest.
        this.$tool.find('.d1-inverted').text('');
        this.$tool.find('.d0-inverted').text('');
        this.$tool.find('.c1-and-result').text('');
        this.$tool.find('.c0-and-result').text('');

        const wires = [ 'c1', 'c0', 'd1', 'd0' ];
        const allInputConcatenated = cInputBinary + dInputBinary;
        const numberOfMuxInput = 4;

        for (let index = 0; index < numberOfMuxInput; index++) {
            wires.forEach((wireName, wireIndex) => {
                const text = index === decimalMuxSelector ? allInputConcatenated[wireIndex] : '';

                this.$tool.find(`td.i${index}.${wireName}-input`).text(text);
            });
        }

        return;
    }

    /**
        Makes a binary addition given two binary data inputs and a carry-in input.
        @method binaryAddition
        @param {String} inputA The first input.
        @param {String} inputB The second input.
        @param {String} cin The carry-in bit.
        @return {Object} Contains the carry-out bit, the addition result and wether there is a carry bit for the second bit.
    */
    binaryAddition(inputA, inputB, cin) {
        const sumOfInputs = parseInt(inputA, 2) + parseInt(inputB, 2) + parseInt(cin, 2);
        const carrySecondBit = (parseInt(inputA[1], 2) + parseInt(inputB[1], 2) + parseInt(cin, 2)) > 1;
        const stringResult = sumOfInputs.toString(2); // eslint-disable-line no-magic-numbers
        const cout = (stringResult.length > 2) ? 1 : 0; // eslint-disable-line no-magic-numbers

        return { cout, stringResult, carrySecondBit };
    }
}

module.exports = {
    create: function() {
        return new AluSimulator();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
