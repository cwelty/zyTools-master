/* global Exponentiation */
/* eslint no-magic-numbers:0 */
'use strict';

$(document).ready(() => {

    // Create an Exponentiation instance
    const exponentiationA = new Exponentiation(2, 1);
    const exponentiationB = new Exponentiation(-2, 4);
    const exponentiationC = new Exponentiation('x', 1);
    const exponentiationD = new Exponentiation('y', 5);

    // Test if exponentiation properties exist.
    const properties = [
        'base',
        'degree',
        'exponent',
        'isVariable',
        'print',
    ];

    QUnit.test('Exponentiation tests', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in exponentiationA), `Exponentiation has property ${testProperty}`));
    });

    QUnit.test('Exponentiation printing', assert => {
        let exponentiationPrint = exponentiationA.print({ latexFormat: false });

        assert.equal(exponentiationPrint, '2');

        exponentiationPrint = exponentiationB.print({ latexFormat: false });
        assert.equal(exponentiationPrint, '-2^(4)');

        exponentiationPrint = exponentiationC.print({ latexFormat: false });
        assert.equal(exponentiationPrint, 'x');

        exponentiationPrint = exponentiationD.print({ latexFormat: true });
        assert.equal(exponentiationPrint, 'y^{5}');
    });

    QUnit.test('Exponentiation multiplication', assert => {
        let multiplied = exponentiationA.multiply(exponentiationB);

        assert.equal(multiplied.length, 1);
        assert.equal(multiplied[0].print({ latexFormat: false }), '32');

        multiplied = exponentiationA.multiply(exponentiationC);
        assert.equal(multiplied.length, 2);
        assert.equal(multiplied[0].print({ latexFormat: false }), '2');
        assert.equal(multiplied[1].print({ latexFormat: false }), 'x');

        multiplied = exponentiationA.multiply(exponentiationD);
        assert.equal(multiplied.length, 2);
        assert.equal(multiplied[0].print({ latexFormat: false }), '2');
        assert.equal(multiplied[1].print({ latexFormat: false }), 'y^(5)');

        multiplied = exponentiationC.multiply(exponentiationD);
        assert.equal(multiplied.length, 2);
        assert.equal(multiplied[0].print({ latexFormat: false }), 'x');
        assert.equal(multiplied[1].print({ latexFormat: false }), 'y^(5)');

        const multiplier = new Exponentiation(-3, 1);

        multiplied = new Exponentiation('x', 2);
        multiplied = multiplied.multiply(multiplier);
        assert.equal(multiplied.length, 2);
        assert.equal(multiplied[0].print({ latexFormat: false }), 'x^(2)');
        assert.equal(multiplied[1].print({ latexFormat: false }), '-3');

        multiplied = new Exponentiation(-2, 1);
        multiplied = multiplied.multiply(multiplier);
        assert.equal(multiplied.length, 1);
        assert.equal(multiplied[0].print({ latexFormat: false }), '6');
    });

    QUnit.test('Exponentiation division', assert => {
        let divide = new Exponentiation(8);
        let divisor = new Exponentiation(2);
        let divided = divide.divide(divisor);

        // 8 / 2 = 4
        assert.equal(divided[0].print({ latexFormat: false }), '4');

        // x / 2 = 0.5x
        divide = new Exponentiation('x');
        divided = divide.divide(divisor);
        assert.equal(divided[0].print({ latexFormat: false }), 'x');
        assert.equal(divided[1].print({ latexFormat: false }), '0.5');

        // x / x = 1
        divisor = new Exponentiation('x');
        divided = divide.divide(divisor);
        assert.equal(divided[0].print({ latexFormat: false }), '1');

        // x^4 / x^2 = x^2
        divide = new Exponentiation('x', 4);
        divisor = new Exponentiation('x', 2);
        divided = divide.divide(divisor);
        assert.equal(divided[0].print({ latexFormat: false }), 'x^(2)');
    });
});
