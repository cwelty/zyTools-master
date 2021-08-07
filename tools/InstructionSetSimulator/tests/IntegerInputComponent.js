'use strict';

/* eslint-disable no-magic-numbers */

/* exported integerInputComponentTests */
/* global IntegerInputComponent, testProperties, PropertyAndType */

/**
    Test the {IntegerInputComponent} object.
    @method integerInputComponentTests
    @return {void}
*/
function integerInputComponentTests() {
    const propertyAndTypes = [ new PropertyAndType('inputs', 'array') ];

    testProperties(new IntegerInputComponent(''), propertyAndTypes, 'IntegerInputComponent');

    QUnit.test('IntegerInputComponent behavior', assert => {

        // Test a variety of valid inputs.
        const validInputs = [
            {
                inputString: '',
                inputArray: [],
            },
            {
                inputString: '10',
                inputArray: [ 10 ],
            },
            {
                inputString: '-10',
                inputArray: [ -10 ],
            },
            {
                inputString: '    -10    ',
                inputArray: [ -10 ],
            },
            {
                inputString: '\n\t15\n13\t23 -10\t\n',
                inputArray: [ 15, 13, 23, -10 ],
            },
        ];

        validInputs.forEach(validInput => {
            const component = new IntegerInputComponent(validInput.inputString);

            assert.equal(validInput.inputArray.length, component.inputs.length);

            component.inputs.forEach((input, index) => {
                assert.equal(validInput.inputArray[index], input.toNumber());
            });
        });

        // Test a variety of invalid inputs.
        const invalidInputs = [
            '-',
            '10-',
            'x10',
            '10 15 ten',
            '10-15',
        ];

        invalidInputs.forEach(invalidInput => {
            assert.throws(() => new IntegerInputComponent(invalidInput));
        });

        // Simulate execution with input: 10 15 -13
        const component = new IntegerInputComponent('10 15 -13');
        const memory = require('MIPSSDK').create().createMemory();
        const readyAddress = 8192;
        const valueAddress = 8196;
        const value = memory.lookupAddress(valueAddress);
        const ready = memory.lookupAddress(readyAddress);

        // Load first input when ready is 0.
        component.execute(value, ready, memory, valueAddress);
        assert.equal(value.getSignedValue(), 10);
        assert.equal(ready.getSignedValue(), 1);
        memory.clearWhichAddressWasAccessed();

        // Read second input.
        value.toString();
        component.execute(value, ready, memory, valueAddress);
        assert.equal(value.getSignedValue(), 15);
        assert.equal(ready.getSignedValue(), 1);
        memory.clearWhichAddressWasAccessed();

        // Read third input.
        value.toString();
        component.execute(value, ready, memory, valueAddress);
        assert.equal(value.getSignedValue(), -13);
        assert.equal(ready.getSignedValue(), 1);
        memory.clearWhichAddressWasAccessed();

        // No more input.
        value.toString();
        component.execute(value, ready, memory, valueAddress);
        assert.equal(value.getSignedValue(), -13);
        assert.equal(ready.getSignedValue(), 0);
        memory.clearWhichAddressWasAccessed();

        // Try to write to Value.
        value.setValueByLong(window.dcodeIO.Long.fromValue(5));
        assert.throws(() => {
            component.execute(value, ready, memory, valueAddress);
        });
        memory.clearWhichAddressWasAccessed();

        // Try to write to Ready.
        ready.setValueByLong(window.dcodeIO.Long.fromValue(5));
        assert.throws(() => {
            component.execute(value, ready, memory, valueAddress);
        });
        memory.clearWhichAddressWasAccessed();
    });
}
