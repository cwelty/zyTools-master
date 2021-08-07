/* global Polynomial, Exponentiation */
/* eslint no-magic-numbers:0 */
'use strict';

$(document).ready(() => {

    // Create a Polynomial instance
    const polynomial = new Polynomial();

    // 2x^(3)
    polynomial.addTerms([ [ new Exponentiation(2, 1), new Exponentiation('x', 3) ] ]);

    // Test if polynomial properties exist.
    const properties = [
        'addTerms',
        'degree',
        'isEqualEmptyValue',
        'print',
        'simplified',
        'simplify',
        'standarize',
        'terms',
    ];

    QUnit.test('Polynomial tests', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in polynomial), `Polynomial has property ${testProperty}`));
    });

    const polynomialA = new Polynomial();
    const polynomialB = new Polynomial();
    const polynomialC = new Polynomial();
    const polynomialD = new Polynomial();
    const polynomialE = new Polynomial();
    const polynomialF = new Polynomial();
    const polynomialG = new Polynomial();
    const xExponentiation = new Exponentiation('x', 1);
    const xSquared = new Exponentiation('x', 2);
    const xCube = new Exponentiation('x', 3);
    const yExponentiation = new Exponentiation('y', 1);
    const ySquared = new Exponentiation('y', 2);
    const yCube = new Exponentiation('y', 3);

    // 2x^(3)4y^(2)y - 2x + 7
    polynomialA.addTerms([ [ new Exponentiation(2, 1), xCube,
                             new Exponentiation(4, 1), ySquared, yExponentiation ],
                           [ new Exponentiation(-2, 1), xExponentiation ],
                           [ new Exponentiation(1, 1) ] ]);

    // -4x^(3)4y^(2)(-y^(5))x^(4) - x^(3) + y - 1
    polynomialB.addTerms([ [ new Exponentiation(-4, 1), xCube,
                             new Exponentiation(4, 1), ySquared,
                             new Exponentiation(-1, 1), new Exponentiation('y', 5),
                             new Exponentiation('x', 4) ] ]);
    polynomialB.addTerms([ [ new Exponentiation(-1, 1), xCube ],
                           [ yExponentiation ],
                           [ new Exponentiation(-1, 1) ] ]);

    // 3x^(2)3a^(2)3z^(2)3y + x2ab^(2) + 4*2x^(2)
    polynomialC.addTerms([ [ new Exponentiation(3, 1), xSquared,
                             new Exponentiation(3, 1), new Exponentiation('a', 2),
                             new Exponentiation(3, 1), new Exponentiation('z', 2),
                             new Exponentiation(3, 1), yExponentiation ],
                           [ new Exponentiation(1, 1), xExponentiation,
                             new Exponentiation(2, 1), new Exponentiation('a', 1),
                             new Exponentiation('b', 2) ],
                           [ new Exponentiation(4, 1), new Exponentiation(2, 1), xSquared ] ]);

    // 1*1 + x*1 + 1*x
    polynomialD.addTerms([ [ new Exponentiation(1, 1), new Exponentiation(1, 1) ],
                           [ xExponentiation, new Exponentiation(1, 1) ],
                           [ new Exponentiation(1, 1), xExponentiation ] ]);

    // 5x^(2) - 2x - 3x^(5) - 1
    polynomialE.addTerms([ [ new Exponentiation(5, 1), xSquared ],
                           [ new Exponentiation(-2, 1), xExponentiation ],
                           [ new Exponentiation(-3, 1), new Exponentiation('x', 5) ],
                           [ new Exponentiation(-1, 1) ] ]);

    // x^(2) - 5x - 4x^(4) + 2
    polynomialF.addTerms([ [ xSquared ],
                           [ new Exponentiation(-5, 1), xExponentiation ],
                           [ new Exponentiation(-4, 1), new Exponentiation('x', 4) ],
                           [ new Exponentiation(2, 1) ] ]);

    // -2y^(4) + yx - x^(4)
    polynomialG.addTerm([ new Exponentiation(-2, 1), new Exponentiation('y', 4) ]);
    polynomialG.addTerm([ new Exponentiation(1, 1), yExponentiation, xExponentiation ]);
    polynomialG.addTerm([ new Exponentiation(-1, 1), new Exponentiation('x', 4) ]);

    QUnit.test('Polynomial printing', assert => {
        let polynomialPrint = polynomial.print({ latex: false, simplified: false });

        assert.equal(polynomialPrint, '2x^(3)');

        polynomialPrint = polynomialA.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, '2x^(3)4y^(2)y-2x+1');

        polynomialPrint = polynomialB.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, '-4x^(3)4y^(2)(-y^(5))x^(4)-x^(3)+y-1');

        polynomialPrint = polynomialC.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, '3x^(2)3a^(2)3z^(2)3y+x2ab^(2)+4*2x^(2)');

        polynomialPrint = polynomialD.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, '1+x+x');

        polynomialPrint = polynomialF.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, 'x^(2)-5x-4x^(4)+2');

        polynomialPrint = polynomialG.print({ latex: false, simplified: false });
        assert.equal(polynomialPrint, '-2y^(4)+yx-x^(4)');
    });

    QUnit.test('Polynomial simplification', assert => {

        // 2x^(3)4y^(2)y - 2x + 7 simplifies to: 8x^(3)y^(3) - 2x + 7
        const simplifiedPolynomialA = [ [ new Exponentiation(8, 1), xCube, yCube ],
                                        [ new Exponentiation(-2, 1), xExponentiation ],
                                        [ new Exponentiation(1, 1) ] ];

        assert.deepEqual(polynomialA.simplified, simplifiedPolynomialA,
                        `Polynomial: ${polynomialA.print({ latex: false, simplified: false })} simplifies to: ` +
                        `${polynomialA.print({ latex: false, simplified: true })}`);

        // -4x^(3)4y^(2)(-y^(5))x^(4) - x^(3) + y - 1 simplifies to: 16x^(7)y^(7) - x^(3) + y - 1
        const simplifiedPolynomialB = [ [ new Exponentiation(16, 1), new Exponentiation('x', 7), new Exponentiation('y', 7) ],
                                        [ new Exponentiation(-1, 1), xCube ],
                                        [ yExponentiation ],
                                        [ new Exponentiation(-1, 1) ] ];

        assert.deepEqual(polynomialB.simplified, simplifiedPolynomialB,
                        `Polynomial: ${polynomialB.print({ latex: false, simplified: false })} simplifies to: ` +
                        `${polynomialB.print({ latex: false, simplified: true })}`);

        // 3x^(2)3a^(2)3z^(2)3y + x2ab^(2) + 4*2x^(2) simplifies to: 81x^(2)a^(2)z^(2)y + 2xab^(2) + 8x^(2)
        const simplifiedPolynomialC = [ [ new Exponentiation(81, 1), xSquared, new Exponentiation('a', 2),
                                          new Exponentiation('z', 2), yExponentiation ],
                                        [ new Exponentiation(2, 1), xExponentiation,
                                          new Exponentiation('a', 1), new Exponentiation('b', 2) ],
                                        [ new Exponentiation(8, 1), xSquared ] ];

        assert.deepEqual(polynomialC.simplified, simplifiedPolynomialC,
                        `Polynomial: ${polynomialC.print({ latex: false, simplified: false })} simplifies to: ` +
                        `${polynomialC.print({ latex: false, simplified: true })}`);

        // 1*1 + x*1 + 1*x simplifies to: 1 + 2x
        const simplifiedPolynomialD = [ [ new Exponentiation(1, 1) ],
                                        [ new Exponentiation(2, 1), xExponentiation ] ];

        assert.deepEqual(polynomialD.simplified, simplifiedPolynomialD,
                        `Polynomial: ${polynomialD.print({ latex: false, simplified: false })} simplifies to: ` +
                        `${polynomialD.print({ latex: false, simplified: true })}`);
    });

    QUnit.test('Polynomial standarization', assert => {
        const standarizedPolynomialA = new Polynomial();
        const standarizedPolynomialB = new Polynomial();
        const standarizedPolynomialC = new Polynomial();
        const standarizedPolynomialE = new Polynomial();
        const standarizedPolynomialF = new Polynomial();
        const standarizedPolynomialG = new Polynomial();

        // 2x^(3)4y^(2)y - 2x + 1 in standard form is: 8x^(3)y^(3) - 2x + 1
        standarizedPolynomialA.addTerms([ [ new Exponentiation(8, 1), xCube, yCube ],
                                          [ new Exponentiation(-2, 1), xExponentiation ],
                                          [ new Exponentiation(1, 1) ] ]);

        assert.deepEqual(polynomialA.standarize(), standarizedPolynomialA.terms);

        // -4x^(3)4y^(2)(-y^(5))x^(4) - x^(3) + y - 1 in standard form is: 16x^(7)y^(7) - x^(3) + y - 1
        standarizedPolynomialB.addTerms([ [ new Exponentiation(16, 1), new Exponentiation('x', 7), new Exponentiation('y', 7) ],
                                          [ new Exponentiation(-1, 1), xCube ],
                                          [ yExponentiation ],
                                          [ new Exponentiation(-1, 1) ] ]);

        assert.deepEqual(polynomialB.standarize(), standarizedPolynomialB.terms);

        // 3x^(2)3a^(2)3z^(2)3y + x2ab^(2) + 4*2x^(2) in standard form is: 81a^(2)x^(2)yz^(2) + 2ab^(2)x + 8x^(2)
        standarizedPolynomialC.addTerms([ [ new Exponentiation(81, 1), new Exponentiation('a', 2), xSquared,
                                            yExponentiation, new Exponentiation('z', 2) ],
                                          [ new Exponentiation(2, 1), new Exponentiation('a', 1),
                                            new Exponentiation('b', 2), xExponentiation ],
                                          [ new Exponentiation(8, 1), xSquared ] ]);

        assert.deepEqual(polynomialC.standarize(), standarizedPolynomialC.terms);

        // 5x^(2) - 2x - 3x^(5) - 1 in standard form is: -3x^(5) + 5x^(2) - 2x - 1
        standarizedPolynomialE.addTerms([ [ new Exponentiation(-3, 1), new Exponentiation('x', 5) ],
                                          [ new Exponentiation(5, 1), xSquared ],
                                          [ new Exponentiation(-2, 1), xExponentiation ],
                                          [ new Exponentiation(-1, 1) ] ]);

        assert.deepEqual(polynomialE.standarize(), standarizedPolynomialE.terms);

        // x^(2) - 5x - 4x^(4) + 2 in standard form is: -4x^(4) + x^(2) - 5x + 2
        standarizedPolynomialF.addTerms([ [ new Exponentiation(-4, 1), new Exponentiation('x', 4) ],
                                          [ xSquared ],
                                          [ new Exponentiation(-5, 1), xExponentiation ],
                                          [ new Exponentiation(2, 1) ] ]);

        assert.deepEqual(polynomialF.standarize(), standarizedPolynomialF.terms);

        // -2y^(4) + yx - x^(4) in standard form is: -x^(4) - 2y^(4) + xy
        standarizedPolynomialG.addTerms([ [ new Exponentiation(-1, 1), new Exponentiation('x', 4) ],
                                          [ new Exponentiation(-2, 1), new Exponentiation('y', 4) ],
                                          [ xExponentiation, yExponentiation ] ]);

        assert.deepEqual(polynomialG.standarize(), standarizedPolynomialG.terms);
    });

    QUnit.test('Polynomial collection', assert => {
        const collectedPolynomialD = new Polynomial();

        // 1 + x + x -> (1) + (1x + 1x)
        collectedPolynomialD.addTerms([ [ new Exponentiation(1, 1) ],
                                        [ xExponentiation ],
                                        [ xExponentiation ] ]);

        assert.deepEqual(polynomialD.collectedTerms, '(1)+(x + x)',
                        `${polynomialD.print({ latex: false, simplified: false })} -> ` +
                        `${collectedPolynomialD.print({ latex: false, simplified: false })}`);

        const polynomialCollectA = new Polynomial([ [ new Exponentiation(-1, 1), xExponentiation ] ]);

        assert.deepEqual(polynomialCollectA.collectedTerms, '(-x)',
                        `${polynomialCollectA.print({ latex: false, simplified: false })} -> (-x)`);

        const polynomialCollectB = new Polynomial([ [ new Exponentiation(2, 1) ], [ new Exponentiation(1, 1) ] ]);

        assert.deepEqual(polynomialCollectB.collectedTerms, '(2 + 1)',
                        `${polynomialCollectB.print({ latex: false, simplified: false })} -> (2 + 1)`);
    });

    QUnit.test('Polynomial multiplication', assert => {

        /*
            Multiply by constant.
            Ex: 3(1 + x + x) = 6x + 3
        */
        const multipliedD = new Polynomial([ [ new Exponentiation(6, 1), xExponentiation ],
                                             [ new Exponentiation(3, 1) ] ]);
        let multiplierConstant = new Exponentiation(3, 1);
        let multipliedResult = new Polynomial(polynomialD.multiplyExponentiation(multiplierConstant).polynomial.standarize());

        assert.deepEqual(multipliedResult.print({ latex: false, simplified: false }),
                         multipliedD.print({ latex: false, simplified: false }),
                        `Multiplying 3(${polynomialD.print({ latex: false, simplified: false })}) gives 6x + 3`);
        assert.deepEqual(polynomialD.multiplyExponentiation(multiplierConstant).steps, '3(1)+3(2x)');

        // Ex: -3(x^2 - 2)
        const toMultiply = new Polynomial([ [ new Exponentiation('x', 2) ], [ new Exponentiation(-2, 1) ] ]);
        const multiplierA = new Exponentiation(-3, 1);
        const multipliedA = toMultiply.multiplyExponentiation(multiplierA).polynomial;
        const handMultiplied = new Polynomial([ [ new Exponentiation(-3, 1), new Exponentiation('x', 2) ], [ new Exponentiation(6, 1) ] ]);
        const stepsA = toMultiply.multiplyExponentiation(multiplierA).steps;

        assert.deepEqual(multipliedA, handMultiplied);
        assert.deepEqual(stepsA, '-3(x^{2})-3(-2)');

        // Ex: -4(-2y^(4) + yx - x^(4)) = 4x^(4) + 8y^(4) - 4yx
        const multipliedG = new Polynomial([ [ new Exponentiation(4, 1), new Exponentiation('x', 4) ],
                                             [ new Exponentiation(8, 1), new Exponentiation('y', 4) ],
                                             [ new Exponentiation(-4, 1), xExponentiation, yExponentiation ] ]);

        multiplierConstant = new Exponentiation(-4, 1);
        multipliedResult = new Polynomial(polynomialG.multiplyExponentiation(multiplierConstant).polynomial.standarize());
        assert.deepEqual(multipliedResult.print({ latex: false, simplified: false }),
                         multipliedG.print({ latex: false, simplified: false }),
                        `Multiplying -4(${polynomialG.print({ latex: false, simplified: false })}) gives 4x^(4) + 8y^(4) - 4xy`);
        assert.deepEqual(polynomialG.multiplyExponentiation(multiplierConstant).steps, '-4(-2y^{4})-4(yx)-4(-x^{4})');

        /*
            Multiply by variable.
            Ex: x(1 + x + x) = 2x^2 + x
        */
        const multipliedD2 = new Polynomial([ [ new Exponentiation(2, 1), xSquared ],
                                              [ xExponentiation ] ]);
        const multipliedDMethod = polynomialD.multiplyExponentiation(xExponentiation);

        multipliedResult = new Polynomial(multipliedDMethod.polynomial.standarize());
        assert.deepEqual(multipliedResult.print({ latex: false, simplified: false }),
                         multipliedD2.print({ latex: false, simplified: false }),
                        `Multiplying x(${polynomialD.print({ latex: false, simplified: false })}) gives 2x^2 + x`);
        assert.deepEqual(multipliedDMethod.steps, 'x(1)+x(2x)');

        // Ex: x(-2y^(4) + yx - x^(4)) = -2xy^4 - x^(5) + x^2y
        const multipliedG2 = new Polynomial([ [ new Exponentiation(-2, 1), xExponentiation, new Exponentiation('y', 4) ],
                                              [ new Exponentiation(-1, 1), new Exponentiation('x', 5) ],
                                              [ new Exponentiation(1, 1), xSquared, yExponentiation ] ]);
        const multipliedG2Method = polynomialG.multiplyExponentiation(xExponentiation);

        multipliedResult = new Polynomial(multipliedG2Method.polynomial.standarize());
        assert.deepEqual(multipliedResult.print({ latex: false, simplified: false }),
                         multipliedG2.print({ latex: false, simplified: false }),
                        `Multiplying xy^2(${polynomialG.print({ latex: false, simplified: false })}) gives -2xy^4 - x^(5) + x^2y`);
        assert.deepEqual(multipliedG2Method.steps, 'x(-2y^{4})+x(yx)+x(-x^{4})');

        /*
            Multiply by term.
            Ex: xy^2(-2y^(4) + yx - x^(4)) = -2xy^6 - x^5y^2 + x^2y^3
        */
        const multipliedG3 = new Polynomial([ [ new Exponentiation(-2, 1), xExponentiation, new Exponentiation('y', 6) ],
                                              [ new Exponentiation(-1, 1), new Exponentiation('x', 5), ySquared ],
                                              [ new Exponentiation(1, 1), xSquared, yCube ] ]);
        const multipliedG3Method = polynomialG.multiplyTerm([ xExponentiation, ySquared ]);

        multipliedResult = new Polynomial(multipliedG3Method.polynomial.standarize());
        assert.deepEqual(multipliedResult.print({ latex: false, simplified: false }),
                         multipliedG3.print({ latex: false, simplified: false }),
                        `Multiplying xy^2(${polynomialG.print({ latex: false, simplified: false })}) gives -2xy^6 - x^5y^2 + x^2y^3`);
        assert.deepEqual(multipliedG3Method.steps, 'xy^{2}(-2y^{4})+xy^{2}(yx)+xy^{2}(-x^{4})');

        // Ex: 3x(−4x + 5) = -12x^2 + 15x
        let multiplier = [ new Exponentiation(3, 1), xExponentiation ];
        let multiplyPolynomial = new Polynomial([ [ new Exponentiation(-4, 1), xExponentiation ],
                                                  [ new Exponentiation(5, 1) ] ]);
        let expectedResult = new Polynomial([ [ new Exponentiation(-12, 1), xSquared ],
                                              [ new Exponentiation(15, 1), xExponentiation ] ]);
        let result = multiplyPolynomial.multiplyTerm(multiplier);

        multipliedResult = new Polynomial(result.polynomial.standarize());
        assert.deepEqual(multipliedResult.print({ latex: false }), expectedResult.print({ latex: false }),
                        `Multiplying 3x(${multiplyPolynomial.print({ latex: false })}) gives -12x^2 + 15x`);

        /*
            Multiply by polynomial.
            Ex: (x + 3)(x - 3) = x^2 - 9
        */
        multiplier = new Polynomial([ [ xExponentiation ], [ new Exponentiation(3, 1) ] ]);
        multiplyPolynomial = new Polynomial([ [ xExponentiation ], [ new Exponentiation(-3, 1) ] ]);
        expectedResult = new Polynomial([ [ xSquared ], [ new Exponentiation(-9, 1) ] ]);
        result = multiplyPolynomial.multiplyPolynomial(multiplier);
        multipliedResult = new Polynomial(result.polynomial.standarize());

        assert.deepEqual(multipliedResult.print({ latex: false }), expectedResult.print({ latex: false }),
                        `Multiplying (${multiplier.print({ latex: false })})(${multiplyPolynomial.print({ latex: false })}) gives x^2 - 9`);
        assert.deepEqual(result.steps, 'x(x)+x(-3)+3(x)+3(-3)');

        // Ex: (xy + x)(x^2y + z) = (x^3y^2 + x^3y + xyz + xz)
        multiplier = new Polynomial([ [ xExponentiation, yExponentiation ],
                                      [ xExponentiation ] ]);
        multiplyPolynomial = new Polynomial([ [ xSquared, yExponentiation ],
                                              [ new Exponentiation('z', 1) ] ]);
        expectedResult = new Polynomial([ [ xCube, ySquared ],
                                          [ xCube, yExponentiation ],
                                          [ xExponentiation, yExponentiation, new Exponentiation('z', 1) ],
                                          [ xExponentiation, new Exponentiation('z', 1) ] ]);
        result = multiplyPolynomial.multiplyPolynomial(multiplier);
        multipliedResult = new Polynomial(result.polynomial.standarize());

        assert.deepEqual(multipliedResult.print({ latex: false }), expectedResult.print({ latex: false }),
                        `Multiplying (${multiplier.print({ latex: false })})(${multiplyPolynomial.print({ latex: false })}) ` +
                        'gives x^3y^2 + x^3y + xyz + xz');
        assert.deepEqual(result.steps, 'xy(x^{2}y)+xy(z)+x(x^{2}y)+x(z)');
    });

    QUnit.test('Polynomial divide', assert => {

        /*
            Divide exponentiations.
            (x^3 + 8x + 6) / -2 = -0.5x^(3) - 4x - 3
        */
        let dividePolynomial = new Polynomial([ [ xCube ],
                                                [ new Exponentiation(8), xExponentiation ],
                                                [ new Exponentiation(6) ] ]);
        let divisor = new Exponentiation(-2);
        let result = dividePolynomial.divideExponentiation(divisor);
        let dividedResult = result.polynomial;
        let steps = result.steps;

        assert.deepEqual(dividedResult.print({ latex: false }), '-0.5x^(3)-4x-3');
        assert.deepEqual(steps, '(x^{3})/-2+(8x)/-2+(6)/-2');

        // (x^3 + 8x + 6) / x = x^(2) - 8 - 6x^-1
        divisor = xExponentiation;
        result = dividePolynomial.divideExponentiation(divisor);
        dividedResult = result.polynomial;
        steps = result.steps;
        assert.deepEqual(dividedResult.print({ latex: false }), 'x^(2)+8+6x^(-1)');
        assert.deepEqual(steps, '(x^{3})/x+(8x)/x+(6)/x');

        /*
            Divide term.
            (x^3 + 8x + 6) / (-2x) = -0.5x^(2) - 4 - 3x^-1
        */
        divisor = [ new Exponentiation(-2), xExponentiation ];
        result = dividePolynomial.divideTerm(divisor);
        dividedResult = result.polynomial;
        steps = result.steps;
        assert.deepEqual(dividedResult.print({ latex: false }), '-0.5x^(2)-4-3x^(-1)');
        assert.deepEqual(steps, '(x^{3})/(-2x)+(8x)/(-2x)+(6)/(-2x)');

        // (9xy + 24x) / (3x)
        dividePolynomial = new Polynomial([ [ new Exponentiation(9), xExponentiation, yExponentiation ],
                                            [ new Exponentiation(24), xExponentiation ] ]);
        divisor = [ new Exponentiation(3), xExponentiation ];
        result = dividePolynomial.divideTerm(divisor);
        dividedResult = result.polynomial;
        steps = result.steps;
        assert.deepEqual(dividedResult.print({ latex: false }), '3y+8');
        assert.deepEqual(steps, '(9xy)/(3x)+(24x)/(3x)');
    });

    QUnit.test('Polynomial GCF', assert => {
        let GCFPolynomial = new Polynomial([ [ new Exponentiation(6, 1), xSquared ],
                                             [ new Exponentiation(3, 1), xExponentiation ],
                                             [ new Exponentiation(12, 1) ] ]);
        let greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;

        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '3');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(5, 1), xSquared ],
                                         [ new Exponentiation(3, 1), xExponentiation ] ]);

        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), 'x');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(4, 1), new Exponentiation('x', 4) ],
                                         [ new Exponentiation(12, 1), xCube ],
                                         [ new Exponentiation(6, 1), xSquared ] ]);

        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '2x^(2)');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(-30, 1), yExponentiation ],
                                         [ new Exponentiation(-12, 1) ] ]);
        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '-6');

        GCFPolynomial = new Polynomial([ [ new Exponentiation('x', 5) ],
                                         [ new Exponentiation('x', 10), ySquared ],
                                         [ new Exponentiation('x', 8), yExponentiation ] ]);
        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), 'x^(5)');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(32), xExponentiation, yExponentiation ],
                                         [ new Exponentiation(-12), yExponentiation ] ]);
        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '4y');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(4, 1), xExponentiation, ySquared ],
                                         [ new Exponentiation(3, 1), new Exponentiation('z', 1) ] ]);
        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '1');

        GCFPolynomial = new Polynomial([ [ new Exponentiation(12, 1), xSquared ],
                                         [ new Exponentiation(17, 1), yExponentiation ],
                                         [ new Exponentiation(49, 1) ] ]);
        greatestCommonFactor = GCFPolynomial.getGreatestCommonFactor().polynomial;
        assert.deepEqual(greatestCommonFactor.print({ latex: false }), '1');
    });
});
