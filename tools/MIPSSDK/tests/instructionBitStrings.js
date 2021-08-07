'use strict';

/* global AddImmediateInstruction, registerToBits, AndImmediateInstruction, SetOnLessThanImmediateInstruction, OrImmediateInstruction,
   LoadWordInstruction, StoreWordInstruction, AddInstruction, AndInstruction, NorInstruction, OrInstruction, SetOnLessThanInstruction,
   ShiftLeftInstruction, ShiftRightInstruction, BranchIfGreaterInstruction, BranchIfGreaterOrEqualInstruction, BranchIfLessInstruction,
   BranchIfLessOrEqualInstruction, MoveInstruction, MulInstruction, MultInstruction, MfloInstruction, BranchIfEqualInstruction
   BranchIfNotEqualInstruction, JumpInstruction, SetOnLessThanUnsignedInstruction, SetOnLessThanImmediateUnsignedInstruction,
   JumpAndLinkInstruction, JumpRegisterInstruction, LoadHalfWordInstruction, StoreHalfWordInstruction, LoadHalfWordUnsignedInstruction,
   LoadByteInstruction, StoreByteInstruction, LoadByteUnsignedInstruction */

$(document).ready(() => {
    const instructionSetSDK = require('InstructionSetSDK').create();

    /**
        Build and compare to the expected bit string.
        @method buildAndCompareToExpectedBitString
        @param {Object} assert The assert object passed by Qunit for testing.
        @param {Object} expectedBitStrings Dictionary with expected bit string as key and instruction class as value.
        @param {Array} instructionParameters The parameters to pass to the instruction.
        @param {Labels} [labels=null] The labels to apply.
        @return {void}
    */
    function buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParameters, labels = null) {
        Object.keys(expectedBitStrings).forEach(expectedBitString => {
            const instruction = new expectedBitStrings[expectedBitString]();

            instructionParameters.forEach((parameter, index) => {
                instruction.setPropertyByIndex(index, parameter);
            });

            const labelsToUse = labels ? labels : instructionSetSDK.createLabels();
            const mapAssemblyAndMachine = instructionSetSDK.createMapAssemblyAndMachineInstructions(
                [ instruction ], labelsToUse
            );
            const instructionStartingAddress = 0;
            const actualBitString = instruction.toMachineInstructionBitString(
                mapAssemblyAndMachine.machine, mapAssemblyAndMachine.machineLabels, instructionStartingAddress
            );

            assert.equal(actualBitString, expectedBitString);
        });
    }

    QUnit.test('Immediate format bit strings', assert => {

        // Positive immediate value.
        let expectedBitStrings = {
            '001000 10001 10000 0000000000000101': AddImmediateInstruction,
            '001100 10001 10000 0000000000000101': AndImmediateInstruction,
            '001010 10001 10000 0000000000000101': SetOnLessThanImmediateInstruction,
            '001011 10001 10000 0000000000000101': SetOnLessThanImmediateUnsignedInstruction,
            '001101 10001 10000 0000000000000101': OrImmediateInstruction,
            '000000 10001 00000 10000 00101 000000': ShiftLeftInstruction,
            '000000 10001 00000 10000 00101 000010': ShiftRightInstruction,
        };
        let immediateValue = 5;
        let instructionParams = [ '$s0', '$s1', immediateValue ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);

        // Negative immediate value.
        expectedBitStrings = {
            '001000 10001 10000 1111111111111011': AddImmediateInstruction,
            '001100 10001 10000 1111111111111011': AndImmediateInstruction,
            '001010 10001 10000 1111111111111011': SetOnLessThanImmediateInstruction,
            '001011 10001 10000 1111111111111011': SetOnLessThanImmediateUnsignedInstruction,
            '001101 10001 10000 1111111111111011': OrImmediateInstruction,
            '000000 10001 00000 10000 11011 000000': ShiftLeftInstruction,
            '000000 10001 00000 10000 11011 000010': ShiftRightInstruction,
        };
        immediateValue = -5;
        instructionParams = [ '$s0', '$s1', immediateValue ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);
    });

    QUnit.test('Data transfer format bit strings', assert => {
        const expectedBitStrings = {
            '100011 10001 10000 0000000000000101': LoadWordInstruction,
            '101011 10001 10000 0000000000000101': StoreWordInstruction,
            '100001 10001 10000 0000000000000101': LoadHalfWordInstruction,
            '101001 10001 10000 0000000000000101': StoreHalfWordInstruction,
            '100101 10001 10000 0000000000000101': LoadHalfWordUnsignedInstruction,
            '100000 10001 10000 0000000000000101': LoadByteInstruction,
            '101000 10001 10000 0000000000000101': StoreByteInstruction,
            '100100 10001 10000 0000000000000101': LoadByteUnsignedInstruction,
        };
        const immediateValue = 5;
        const instructionParams = [ '$s0', immediateValue, '$s1' ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);
    });

    QUnit.test('Register format bit strings', assert => {
        const expectedBitStrings = {
            '000000 10001 10010 10000 00000 100000': AddInstruction,
            '000000 10001 10010 10000 00000 101000': AndInstruction,
            '000000 10001 10010 10000 00000 100111': NorInstruction,
            '000000 10001 10010 10000 00000 100101': OrInstruction,
            '000000 10001 10010 10000 00000 100100': SetOnLessThanInstruction,
            '000000 10001 10010 10000 00000 101011': SetOnLessThanUnsignedInstruction,
        };
        const instructionParams = [ '$s0', '$s1', '$s2' ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);
    });

    QUnit.test('Pseudo-instructions throw errors', assert => {
        const pseudoInstructions = [
            BranchIfGreaterInstruction, BranchIfGreaterOrEqualInstruction, BranchIfLessInstruction, BranchIfLessOrEqualInstruction,
            MoveInstruction, MulInstruction,
        ];

        pseudoInstructions.forEach(PsuedoInstruction => {
            const instruction = new PsuedoInstruction();

            assert.throws(() => {
                instruction.toMachineInstructionBitString();
            });
        });
    });

    QUnit.test('Two register format bit strings', assert => {
        const expectedBitStrings = {
            '000000 10000 10001 00000 00000 011000': MultInstruction,
        };
        const instructionParams = [ '$s0', '$s1' ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);
    });

    QUnit.test('One register format bit strings', assert => {
        const expectedBitStrings = {
            '000000 00000 00000 10000 00000 010010': MfloInstruction,
            '000000 10000 00000 00000 00000 001000': JumpRegisterInstruction,
        };
        const instructionParams = [ '$s0' ];

        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams);
    });

    QUnit.test('Branch format bit strings', assert => {
        const expectedBitStrings = {
            '000100 10001 10000 0000000000000000': BranchIfEqualInstruction,
            '000101 10001 10000 0000000000000000': BranchIfNotEqualInstruction,
        };
        const instructionParams = [ '$s0', '$s1', 'loop' ];
        const labels = instructionSetSDK.createLabels();

        labels.addLabel('loop', 1);
        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams, labels);
    });

    QUnit.test('Jump format bit strings', assert => {
        const expectedBitStrings = {
            '000010 00000000000000000000000001': JumpInstruction,
            '000011 00000000000000000000000001': JumpAndLinkInstruction,
        };
        const instructionParams = [ 'loop' ];
        const labels = instructionSetSDK.createLabels();

        labels.addLabel('loop', 1);
        buildAndCompareToExpectedBitString(assert, expectedBitStrings, instructionParams, labels);
    });

    QUnit.test('Register name to bit strings', assert => {
        const expectedRegisterBitStrings = {
            $zero: '00000', $at: '00001', $v0: '00010', $v1: '00011', $a0: '00100', $a1: '00101', $a2: '00110', $a3: '00111',
            $t0: '01000', $t1: '01001', $t2: '01010', $t3: '01011', $t4: '01100', $t5: '01101', $t6: '01110', $t7: '01111',
            $s0: '10000', $s1: '10001', $s2: '10010', $s3: '10011', $s4: '10100', $s5: '10101', $s6: '10110', $s7: '10111',
            $t8: '11000', $t9: '11001', $k0: '11010', $k1: '11011', $gp: '11100', $sp: '11101', $fp: '11110', $ra: '11111',
        };

        Object.keys(expectedRegisterBitStrings).forEach(registerName => {
            const actualRegisterBitString = registerToBits(registerName);

            assert.equal(actualRegisterBitString, expectedRegisterBitStrings[registerName]);
        });
    });
});
