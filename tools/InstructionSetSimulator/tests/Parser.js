'use strict';

/* eslint-disable no-magic-numbers */

/* exported parserTests */
/* global testProperties, PropertyAndType, Parser, Tokenizer, MIPSTokenTypes, ARMTokenTypes */

/**
    Parse the given MIPS code.
    @method parseMIPSCode
    @param {String} code The code to parse.
    @return {Object} The result of parsing the code.
*/
function parseMIPSCode(code) {
    const tokenizer = new Tokenizer(MIPSTokenTypes);
    const tokens = tokenizer.tokenize(code);
    const parser = new Parser(require('MIPSSDK').create());

    return parser.parse(tokens);
}

/**
    Parse the given ARM code.
    @method parseARMCode
    @param {String} code The code to parse.
    @return {Object} The result of parsing the code.
*/
function parseARMCode(code) {
    const tokenizer = new Tokenizer(ARMTokenTypes);
    const tokens = tokenizer.tokenize(code);
    const parser = new Parser(require('ARMSDK').create());

    return parser.parse(tokens);
}

/**
    Return whether the given MIPS code has an error.
    @method doesParsingGivenMIPSCodeGenerateAnError
    @param {String} code The code to parse.
    @return {boolean} Whether an error has been caught.
*/
function doesParsingGivenMIPSCodeGenerateAnError(code) {
    try {
        parseMIPSCode(code);
    }
    catch (error) {
        return true;
    }
    return false;
}

/**
    Return whether the given ARM code has an error.
    @method doesParsingGivenARMCodeGenerateAnError
    @param {String} code The code to parse.
    @return {boolean} Whether an error has been caught.
*/
function doesParsingGivenARMCodeGenerateAnError(code) {
    try {
        parseARMCode(code);
    }
    catch (error) {
        return true;
    }
    return false;
}

/**
    Test the {Parser} object.
    @method parserTests
    @return {void}
*/
function parserTests() {
    const propertyAndTypes = [ new PropertyAndType('parse', 'function') ];
    const parser = new Parser(require('MIPSSDK').create());

    testProperties(parser, propertyAndTypes, 'Parser');

    QUnit.test('Parser parsing MIPS', assert => {
        let mipsCode = 'loop:';
        let parseResult = parseMIPSCode(mipsCode);

        assert.ok((parseResult.labels.length === 1), 'Parser makes 1 label from 1 label.');
        assert.ok((parseResult.instructions.length === 0), 'Parser makes 0 instructions from 1 label.');

        let caughtError = false;

        mipsCode = '$s1';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generated error when line starts with register.');

        mipsCode = '     ';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(!caughtError, 'Parser not generate an error when line is just space.');

        mipsCode = 'test1: test2: test3: test4:   ';
        parseResult = parseMIPSCode(mipsCode);
        assert.ok((parseResult.labels.length === 4), 'Parser makes 4 labels from 4 labels on same line.');
        assert.ok((parseResult.instructions.length === 0), 'Parser makes 0 instructions from 4 labels on same line.');

        mipsCode = '  test1:   \ntest2:\n  test3:test4:\n';
        parseResult = parseMIPSCode(mipsCode);
        assert.ok((parseResult.labels.length === 4), 'Parser makes 4 labels from 4 labels on many lines.');
        assert.ok((parseResult.instructions.length === 0), 'Parser makes 0 instructions from 4 labels on many lines.');
        parseResult.labels.forEach(label => {
            assert.ok((label.instructionIndex === 0), 'Label\'s instruction index is 0.');
        });

        mipsCode = 'fakeop';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Error generated for unknown op code.');

        mipsCode = 'add $s1, $s2, $s3';
        parseResult = parseMIPSCode(mipsCode);
        assert.ok((parseResult.labels.length === 0), 'Parser makes 0 labels from an add instruction.');
        assert.ok((parseResult.instructions.length === 1), 'Parser makes 1 instruction from an add instruction.');
        assert.strictEqual(parseResult.instructions[0]._properties[0], '$s1', 'First register is $s1.');
        assert.strictEqual(parseResult.instructions[0]._properties[1], '$s2', 'Second register is $s2.');
        assert.strictEqual(parseResult.instructions[0]._properties[2], '$s3', 'Third register is $s3.');

        mipsCode = 'lw $s1, 100($s2)';
        parseResult = parseMIPSCode(mipsCode);
        assert.ok((parseResult.labels.length === 0), 'Parser makes 0 labels from 1 instruction.');
        assert.ok((parseResult.instructions.length === 1), 'Parser makes 1 instruction from 1 instruction.');
        assert.strictEqual(parseResult.instructions[0]._properties[0], '$s1', 'First register is $s1.');
        assert.strictEqual(parseResult.instructions[0]._properties[1], 100, 'Constant is 100.');
        assert.strictEqual(parseResult.instructions[0]._properties[2], '$s2', 'Second register is $s2.');

        mipsCode = 'add $s1, $s2, $s3, $s4';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generates error when instruction has extra tokens.');

        mipsCode = 'add $s1, $s2 $s3';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generates error when instruction has too few tokens.');

        mipsCode = 'add $s1, $s2, 100';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generates error when instruction has wrong order of tokens.');

        mipsCode = 'add $s1, $s2, $v9';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generates error when invalid register name used.');

        mipsCode = 'j loop';
        caughtError = doesParsingGivenMIPSCodeGenerateAnError(mipsCode);
        assert.ok(caughtError, 'Parser generates error when undefined label used.');
    });

    QUnit.test('Parser parsing ARM', assert => {
        let code = 'loop:';
        let result = parseARMCode(code);

        assert.equal(result.labels.length, 1);
        assert.equal(result.instructions.length, 0);

        let caughtError = false;

        code = 'X2';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = '     ';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.notOk(caughtError);

        code = 'test1: test2: test3: test4:   ';
        result = parseARMCode(code);
        assert.equal(result.labels.length, 4);
        assert.equal(result.instructions.length, 0);

        code = '  test1:   \ntest2:\n  test3:test4:\n';
        result = parseARMCode(code);
        assert.equal(result.labels.length, 4);
        assert.equal(result.instructions.length, 0);
        result.labels.forEach(label => assert.equal(label.instructionIndex, 0));

        code = 'fakeop';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = 'ADD X1, X2, X3';
        result = parseARMCode(code);
        assert.equal(result.labels.length, 0);
        assert.equal(result.instructions.length, 1);
        assert.equal(result.instructions[0]._properties[0], 'X1');
        assert.equal(result.instructions[0]._properties[1], 'X2');
        assert.equal(result.instructions[0]._properties[2], 'X3');

        code = 'LDUR X1, [X2, #40]';
        result = parseARMCode(code);
        assert.equal(result.labels.length, 0);
        assert.equal(result.instructions.length, 1);
        assert.equal(result.instructions[0]._properties[0], 'X1');
        assert.equal(result.instructions[0]._properties[1], 'X2');
        assert.strictEqual(result.instructions[0]._properties[2], 40);

        code = 'ADD X1, X2, X3, X4';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = 'ADD X1, X2 X3';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = 'ADD X1, X2, 100';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = 'ADD X1, X2, X50';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);

        code = 'B loop';
        caughtError = doesParsingGivenARMCodeGenerateAnError(code);
        assert.ok(caughtError);
    });

    QUnit.test('No duplicate labels', assert => {
        const duplicateLabelCodes = [

            // Duplicate labels at beginning.
            `bacon:
bacon:
add $t0, $t0, $t0`,

            // Duplicate labels at beginning and middle.
            `bacon:
add $t0, $t0, $t0
bacon:
add $t0, $t0, $t0`,

            // Duplicate labels at middle and end.
            `add $t0, $t0, $t0
bacon:
add $t0, $t0, $t0
bacon:`,

            // Duplicate labels at end.
            `add $t0, $t0, $t0
bacon:
bacon:`,
        ];

        duplicateLabelCodes.forEach(code => assert.ok(doesParsingGivenMIPSCodeGenerateAnError(code)));

        const noDuplicateLabelCodes = [
            `bacon:
ham:
add $t0, $t0, $t0`,
            `bacon:
notBacon:
add $t0, $t0, $t0`,
        ];

        noDuplicateLabelCodes.forEach(code => assert.notOk(doesParsingGivenMIPSCodeGenerateAnError(code)));
    });

    QUnit.test('MIPSzy machine instructions', assert => {
        const pairs = [
            [ 'lw $t0, 0($t1)', '100011 01001 01000 0000000000000000' ],
            [ 'sw $t0, 0($t1)', '101011 01001 01000 0000000000000000' ],
            [ 'addi $t0, $t1, 15', '001000 01001 01000 0000000000001111' ],
            [ 'add $t0, $t1, $t2', '000000 01001 01010 01000 00000 100000' ],
            [ 'sub $t0, $t1, $t2', '000000 01001 01010 01000 00000 100010' ],
            [ 'mult $t1, $t2', '000000 01001 01010 00000 00000 011000' ],
            [ 'mflo $t0', '000000 00000 00000 01000 00000 010010' ],
            [ 'beq $t1, $t2, BLabel', '000100 01001 01010 1111111111111000' ],
            [ 'bne $t1, $t2, BLabel', '000101 01001 01010 1111111111110111' ],
            [ 'slt $t0, $t1, $t2', '000000 01001 01010 01000 00000 101010' ],
            [ 'j JLabel', '000010 00000000000000000000000000' ],
            [ 'jal JLabel', '000011 00000000000000000000000000' ],
            [ 'jr $t1', '000000 01001 00000 00000 00000 001000' ],
        ];
        const assembly = `JLabel:
BLabel:
${pairs.map(pair => pair[0]).join('\n')}`;
        const tokenizer = new Tokenizer(MIPSTokenTypes);
        const tokens = tokenizer.tokenize(assembly);
        const instructionSetSDK = require('MIPSzySDK').create();
        const parser = new Parser(instructionSetSDK);
        const parseResult = parser.parse(tokens);
        const mapAssemblyAndMachine = instructionSetSDK.createMapAssemblyAndMachineInstructions(
            parseResult.instructions,
            parseResult.labels
        );
        const actual = mapAssemblyAndMachine.makeMachineBits(0);
        const expected = pairs.map(pair => pair[1]).join('\n');

        assert.equal(actual, expected);
    });
}
