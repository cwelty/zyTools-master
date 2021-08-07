'use strict';

/* eslint-disable no-magic-numbers */

/* exported integerOutputComponentTests */
/* global IntegerOutputComponent, testProperties, PropertyAndType */

/**
    Test the {IntegerOutputComponent} object.
    @method integerOutputComponentTests
    @return {void}
*/
function integerOutputComponentTests() {
    const propertyAndTypes = [ new PropertyAndType('output', 'string') ];

    testProperties(new IntegerOutputComponent(), propertyAndTypes, 'IntegerOutputComponent');

    QUnit.test('IntegerOutputComponent behavior', assert => {

        // Simulate execution with input: 10 15 -13
        const component = new IntegerOutputComponent();
        const memory = require('MIPSSDK').create().createMemory();
        const valueAddress = 8200;
        const value = memory.lookupAddress(valueAddress);

        // Print 10.
        value.setValue(10, 0);
        component.execute(value, memory, valueAddress);
        assert.equal(component.output, '10 ');
        assert.equal(value.getSignedValue(), 10);

        // Print -15.
        value.setValue(-15, 0);
        component.execute(value, memory, valueAddress);
        assert.equal(component.output, '10 -15 ');
        assert.equal(value.getSignedValue(), -15);

        // Print 3.
        value.setValue(3, 0);
        component.execute(value, memory, valueAddress);
        assert.equal(component.output, '10 -15 3 ');
        assert.equal(value.getSignedValue(), 3);
    });
}
