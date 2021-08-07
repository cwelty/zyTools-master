'use strict';

/* global Byte, HalfWord, CommonExecutes, Word, DoubleWord */

/*
    Print whether the |testCase| |didPass|.
    |testCase| is required and a string.
    |didPass| is required and a bool.
*/
function test(testCase, didPass) {
    var passFail = didPass ? 'pass' : 'FAIL';
    if (!didPass) {
        console.log(testCase + ': ' + passFail);
    }
}

// Test Byte object
function testByte() {
    // Byte using default value
    var byte = new Byte();
    test('Byte\'s value is an Uint8Array', (byte._value instanceof Uint8Array));
    test('Byte\'s setValue is a function', (typeof byte.setValue === 'function'));
    test('Byte\'s getSignedValue is a function', (typeof byte.getSignedValue === 'function'));
    test('Byte default value', (byte.getSignedValue() === 0));
    test('Byte\'s beenWrittenTo is a boolean', (typeof byte.beenWrittenTo === 'boolean'));

    // Byte using assigned value
    var byteValue = 158;
    byte = new Byte({ value: byteValue });
    test('Byte assigned value', (byte.getUnsignedValue() === byteValue));

    // Test setting a value
    var byteNewValue = 50;
    byte.setValue(byteNewValue);
    test('Byte assigned new value', (byte.getUnsignedValue() === byteNewValue));
}

/*
    Test the setValue and getSignedValue functions on |baseWord|.
    |baseWord| is required and a BaseWord object.
*/
function testSetValueOfBaseWord(baseWord) {
    // Test setting of a 4-byte BaseWord
    var testValues = [ 200, 398571023 ];
    testValues.forEach(function(testValue) {
        baseWord.setValue(testValue);
        test('BaseWord\'s toString returns ' + testValue, (baseWord.toString() === testValue.toString()));
    });
}

// Test BaseWord object
function testBaseWord() {
    // Test properties and values of 4-byte Word
    var bytes = [ new Byte({ value: 80 }), new Byte({ value: 13 }), new Byte({ value: 2 }), new Byte() ];
    var baseWord = new BaseWord(bytes);

    test('BaseWord\'s getSignedValue is a function', (typeof baseWord.getSignedValue === 'function'));
    test('BaseWord\'s toString is a function', (typeof baseWord.toString === 'function'));
    test('BaseWord\'s equals is a function', (typeof baseWord.equals === 'function'));
    test('BaseWord\'s add is a function', (typeof baseWord.add === 'function'));
    test('BaseWord\'s subtract is a function', (typeof baseWord.subtract === 'function'));
    test('BaseWord\'s setValueByLong is a function', (typeof baseWord.setValueByLong === 'function'));
    test('BaseWord\'s setValue is a function', (typeof baseWord.setValue === 'function'));
    test('BaseWord\'s beenWrittenTo is a function', (typeof baseWord.beenWrittenTo === 'function'));
    test('BaseWord\'s isReadOnly is a function', (typeof baseWord.isReadOnly === 'function'));

    // Test |equals| function returns true for equal BaseWords.
    var baseWord1 = new BaseWord(bytes);
    test('BaseWord\'s equals returns true', baseWord.equals(baseWord1));

    // Test |equals| function returns false for unequal Byte values.
    var bytes = [ new Byte(), new Byte(), new Byte(), new Byte() ];
    var baseWord1 = new BaseWord(bytes);
    test('BaseWord\'s equals returns false', !baseWord.equals(baseWord1));

    // Test |equals| function returns false for unequal number of Bytes.
    var bytes1 = [ new Byte() ];
    var bytes2 = [ new Byte(), new Byte() ];
    var baseWord1 = new BaseWord(bytes1);
    var baseWord2 = new BaseWord(bytes2);
    test('BaseWord\'s equals returns false', !baseWord1.equals(baseWord2));

    // Test add for baseWords 50 + 10 equals 60.
    var bytes1 = [ new Byte({ value: 50 }), new Byte(), new Byte(), new Byte() ];
    var bytes2 = [ new Byte({ value: 10 }), new Byte(), new Byte(), new Byte() ];
    var baseWord1 = new BaseWord(bytes1);
    var baseWord2 = new BaseWord(bytes2);
    var long = baseWord1.add(baseWord2);
    test('BaseWord\'s add of 50 + 10 = 60', long.toString() === '60');

    // Test subtract for baseWords 50 - 10 equals 40.
    var bytes1 = [ new Byte({ value: 50 }), new Byte(), new Byte(), new Byte() ];
    var bytes2 = [ new Byte({ value: 10 }), new Byte(), new Byte(), new Byte() ];
    var baseWord1 = new BaseWord(bytes1);
    var baseWord2 = new BaseWord(bytes2);
    var long = baseWord1.subtract(baseWord2);
    test('BaseWord\'s subtract of 50 - 10 = 40', long.toString() === '40');
}

// Test Word object
function testWord() {
    // Test properties and values
    var bytes = [ new Byte({ value: 1 }), new Byte({ value: 2 }), new Byte({ value: 4 }), new Byte({ value: 8 }) ];
    var word = new Word(bytes);
    test('Word\'s toString returns 134480385', (word.toString() === '134480385'));
    testSetValueOfBaseWord(word);

    // Test toString returns a string of a positive number
    var bytes = [ new Byte({ value: 80 }), new Byte({ value: 13 }), new Byte({ value: 2 }), new Byte() ];
    var word = new Word(bytes);
    test('Word\'s toString returns 134480', (word.toString() === '134480'));

    // Test toString returns a string of a negative number
    var bytes = [ new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 }) ];
    var word = new Word(bytes);
    test('Word\'s toString returns -1', (word.toString() === '-1'));

    // Test setValueByLong with |long|.
    var long = window.dcodeIO.Long.fromNumber(50);
    word.setValueByLong(long);
    test('BaseWord\'s setValueByLong of 50', word.toString() === '50');
}

// Test DoubleWord object
function testDoubleWord() {
    // Test properties and values
    var bytes = [
        new Byte({ value: 1 }), new Byte({ value: 2 }), new Byte({ value: 4 }), new Byte({ value: 8 }),
        new Byte(), new Byte(), new Byte(), new Byte()
    ];
    var doubleWord = new DoubleWord(bytes);
    test('DoubleWord\'s toString returns 134480385', (doubleWord.toString() === '134480385'));
    testSetValueOfBaseWord(doubleWord);

    // Test |setValue| with lowerWord and upperWord.
    doubleWord.setValue(1, 1);
    test('DoubleWord\'s toString returns 4294967297', (doubleWord.toString() === '4294967297'));

    // Test toString returns a string of a positive number
    var bytes = [
        new Byte({ value: 80 }), new Byte({ value: 13 }), new Byte({ value: 2 }), new Byte(),
        new Byte(), new Byte(), new Byte(), new Byte()
    ];
    var doubleWord = new DoubleWord(bytes);
    test('DoubleWord\'s toString returns 134480', (doubleWord.toString() === '134480'));

    // Test toString returns a string of a negative number
    var bytes = [
        new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 }),
        new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 }), new Byte({ value: 255 })
    ];
    var doubleWord = new DoubleWord(bytes);
    test('DoubleWord\'s toString returns -1', (doubleWord.toString() === '-1'));

    // Test setValueByLong with |long|.
    var long = window.dcodeIO.Long.fromNumber(50);
    doubleWord.setValueByLong(long);
    test('BaseWord\'s setValueByLong of 50', doubleWord.toString() === '50');
}

/**
    Test the {HalfWord} object.
    @method testHalfWord
    @return {void}
*/
function testHalfWord() {
    QUnit.test('Half word', assert => {

        // Test positive number and set value via constructor.
        const bytes = [ new Byte({ value: 1 }), new Byte({ value: 2 }) ];
        const halfWord = new HalfWord(bytes);

        assert.strictEqual(halfWord.toString(), '513');

        // Test positive number and set value via setValue function.
        halfWord.setValue(1, 0);
        assert.strictEqual(halfWord.toString(), '1');

        // Test a negative number.
        const bytes2 = [ new Byte({ value: 255 }), new Byte({ value: 255 }) ];
        const halfWord2 = new HalfWord(bytes2);

        assert.strictEqual(halfWord2.toString(), '-1');

        // Test setValueByLong with {Long}.
        const long = window.dcodeIO.Long.fromNumber(50); // eslint-disable-line no-magic-numbers

        halfWord.setValueByLong(long);
        assert.strictEqual(halfWord.toString(), '50');
    });
}

/*
    Expect the evaluated |expression| to throw Error.
    |expression| is required and a function.
    |testCase| is required and a string.
*/
function expectToThrowError(expression, testCase) {
    var didPass = false;
    try {
        expression();
    }
    catch (error) {
        if (error instanceof Error) {
            didPass = true;
        }
    }
    test(testCase, didPass);
}

/*
    Lookup an invalid address in |memory|.
    |storage| is required and a Storage.
    |address| is required and a number.
*/
function expectingInvalidStorageAddress(storage, address) {
    expectToThrowError(
        function() {
            storage.lookupWord(address);
        },
        'Lookup invalid Word addressd ' + address
    );
}

function testStorageProperties(storage) {
    test('Storage\' numberOfBytesInWord is a number', (typeof storage.numberOfBytesInWord === 'number'));
    test('Storage\' _lookupTable is an object', (typeof storage._lookupTable === 'object'));
    test('Storage\' isValidAddress is a function', (typeof storage.isValidAddress === 'function'));
    test('Storage\' lookupWord is a function', (typeof storage.lookupWord === 'function'));
    test('Storage\' addWord is a function', (typeof storage.addWord === 'function'));
    test('Storage\' lookupByte is a function', (typeof storage.lookupByte === 'function'));
    test('Storage\' addByte is a function', (typeof storage.addByte === 'function'));
    test('Storage\' clone is a function', (typeof storage.clone === 'function'));
    test('Storage\' getLookupTable is a function', (typeof storage.getLookupTable === 'function'));
    test('Storage\' clearWhichAddressWasAccessed is a function', (typeof storage.clearWhichAddressWasAccessed === 'function'));
    test('Storage\' validNames is a string', (typeof storage.validNames === 'string'));

}

// Test Storage object
function testStorage() {
    // Test Storage' properties
    var storage = new Storage();
    testStorageProperties(storage);
}

function testCode() {
    var instructions = new Instructions();
    var instruction1 = new Instruction();
    var instruction2 = new Instruction();
    var instruction3 = new Instruction();
    var instruction4 = new Instruction();
    instructions.push(instruction1, instruction2, instruction3, instruction4);

    var labels = new Labels();
    labels.addLabel('L1', 1);
    labels.addLabel('L2', 2);
    labels.addLabel('L3', 3);
    labels.addLabel('L4', 3);
    labels.addLabel('L5', 4);

    var code = new Code(instructions, labels);

    /*
        |code| should be:
                instruction1
            L1: instruction2
            L2: instruction3
            L3:
            L4: instruction4
            L5:
    */
    test('code[0] is just instruction1', ((code[0].instruction === instruction1) && (code[0].label === null)));
    test('code[1] is instruction2 and label L1', ((code[1].instruction === instruction2) && (code[1].label.name === 'L1')));
    test('code[2] is instruction3 and label L2', ((code[2].instruction === instruction3) && (code[2].label.name === 'L2')));
    test('code[3] is just label L3', ((code[3].instruction === null) && (code[3].label.name === 'L3')));
    test('code[4] is instruction4 and label L4', ((code[4].instruction === instruction4) && (code[4].label.name === 'L4')));
    test('code[3] is just label L5', ((code[5].instruction === null) && (code[5].label.name === 'L5')));
}

/**
    Test signed and unsigned transfer between different memory sizes.
    @method valueTransferTests
    @return {void}
*/
function valueTransferTests() {
    const fullByte = new Byte({ value: 255 });

    QUnit.test('Byte to {Byte, HalfWord, Word, DoubleWord}', assert => {
        const commonExecutes = new CommonExecutes();

        // Byte is same size as Byte, so unsigned and signed are the same value.
        const sameType = new Byte();

        commonExecutes.unsignedTransferToFrom(sameType, fullByte);
        assert.equal(sameType.toString(), '-1');

        commonExecutes.signedTransferToFrom(sameType, fullByte);
        assert.equal(sameType.toString(), '-1');

        // All other types have more bits, so unsigned and signed will differ.
        const others = [ new HalfWord(), new Word(), new DoubleWord() ];

        others.forEach(other => {
            commonExecutes.unsignedTransferToFrom(other, fullByte);
            assert.equal(other.toString(), '255');

            commonExecutes.signedTransferToFrom(other, fullByte);
            assert.equal(other.toString(), '-1');
        });
    });

    QUnit.test('HalfWord to {Byte, HalfWord, Word, DoubleWord}', assert => {
        const commonExecutes = new CommonExecutes();
        const halfWord = new HalfWord([ fullByte, fullByte ]);

        const smallerOrEqualOthers = [ new Byte(), new HalfWord() ];

        // Byte and HalfWord have fewer or equal bits to HalfWord, so unsigned and signed are the same value.
        smallerOrEqualOthers.forEach(other => {
            commonExecutes.unsignedTransferToFrom(other, halfWord);
            assert.equal(other.toString(), '-1');

            commonExecutes.signedTransferToFrom(other, halfWord);
            assert.equal(other.toString(), '-1');
        });

        // All other types have more bits, so unsigned and signed will differ.
        const largerOthers = [ new Word(), new DoubleWord() ];

        largerOthers.forEach(other => {
            commonExecutes.unsignedTransferToFrom(other, halfWord);
            assert.equal(other.toString(), '65535');

            commonExecutes.signedTransferToFrom(other, halfWord);
            assert.equal(other.toString(), '-1');
        });
    });

    QUnit.test('Word to {Byte, HalfWord, Word, DoubleWord}', assert => {
        const commonExecutes = new CommonExecutes();
        const word = new Word([ fullByte, fullByte, fullByte, fullByte ]);

        // Byte, HalfWord, and Word have fewer or equal bits to Word, so unsigned and signed are the same value.
        const smallerOrEqualOthers = [ new Byte(), new HalfWord(), new Word() ];

        smallerOrEqualOthers.forEach(other => {
            commonExecutes.unsignedTransferToFrom(other, word);
            assert.equal(other.toString(), '-1');

            commonExecutes.signedTransferToFrom(other, word);
            assert.equal(other.toString(), '-1');
        });

        // DoubleWord has more bits than Word, so unsigned and signed will differ.
        const doubleWord = new DoubleWord();

        commonExecutes.unsignedTransferToFrom(doubleWord, word);
        assert.equal(doubleWord.toString(), '4294967295');

        commonExecutes.signedTransferToFrom(doubleWord, word);
        assert.equal(doubleWord.toString(), '-1');
    });

    QUnit.test('DoubleWord to {Byte, HalfWord, Word, DoubleWord}', assert => {
        const commonExecutes = new CommonExecutes();
        const doubleWord = new DoubleWord([ fullByte, fullByte, fullByte, fullByte, fullByte, fullByte, fullByte, fullByte ]);

        // All types have fewer or equal bits to DoubleWord, so unsigned and signed are the same value.
        const allTypes = [ new Byte(), new HalfWord(), new Word(), new DoubleWord() ];

        allTypes.forEach(type => {
            commonExecutes.unsignedTransferToFrom(type, doubleWord);
            assert.equal(type.toString(), '-1');

            commonExecutes.signedTransferToFrom(type, doubleWord);
            assert.equal(type.toString(), '-1');
        });
    });
}

$(document).ready(() => {
    testByte();
    testBaseWord();
    testWord();
    testDoubleWord();
    testHalfWord();
    testStorage();
    testCode();
    valueTransferTests();
    console.log('Finished InstructionSetSDK tests');
});
