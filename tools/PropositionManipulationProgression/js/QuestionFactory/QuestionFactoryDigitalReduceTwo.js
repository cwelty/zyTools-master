'use strict';

/* global LawFactory, LawCategory, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces simple propositions.
    @class QuestionFactoryDigitalReduceTwo
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryDigitalReduceTwo() {
    const lawFactory = new LawFactory();

    this.numberOfLevels = 3;
    this.expressionAreaWidth = '420px';
    this.lawPanels = [
        [
            new LawCategory('Distributive', [
                lawFactory.make('reverseAndDistribution'),
                lawFactory.make('reverseOrDistribution'),
            ]),
            new LawCategory('Commutative', [
                lawFactory.make('commutativeAnd'),
                lawFactory.make('commutativeOr'),
            ]),
            new LawCategory('Complement', [
                lawFactory.make('complementAnd'),
                lawFactory.make('complementOr', { makeRightSideButton: false }),
            ]),
        ], [
            new LawCategory('Identity', [
                lawFactory.make('identityAndTrue', { makeRightSideButton: true }),
                lawFactory.make('identityOrFalse', { makeRightSideButton: false }),
            ]),
            new LawCategory('Null elements', [
                lawFactory.make('andNullElements'),
                lawFactory.make('orNullElements'),
            ]),
            new LawCategory('Idempotence', [
                lawFactory.make('andIdempotence'),
                lawFactory.make('orIdempotence'),
            ]),
        ],
    ];
}

QuestionFactoryDigitalReduceTwo.prototype = new QuestionFactory();
QuestionFactoryDigitalReduceTwo.prototype.constructor = QuestionFactoryDigitalReduceTwo;

/**
    @inheritdoc
*/
QuestionFactoryDigitalReduceTwo.prototype.make = function(levelIndex) { // eslint-disable-line complexity
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');
    const isDigital = true;
    const numVariables = 3;

    let initialSymbol = null;
    let expectedSymbol = null;
    const variables = this._makeNVariables(numVariables, isDigital);

    switch (levelIndex) {

        // Distributive, complement, identity. Ex: z'x'+z'x -> z'
        case 0: {
            const var1 = utilities.flipCoin() ? variables[0] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]);
            const var2 = variables[1];
            const notVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var2.clone() ]);

            const var1AndVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1, var2 ]);
            const var1AndNotVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), notVar2 ]);
            const symbols = [ var1AndVar2, var1AndNotVar2 ];

            utilities.shuffleArray(symbols);
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, symbols);
            expectedSymbol = [ var1.clone() ];
            break;
        }

        // Distributive, complement, identity.
        case 1: {

            // Ex: ab + ab' + ac -> a
            if (utilities.flipCoin()) {
                const var1 = utilities.flipCoin() ? variables[0] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]);
                const var2 = utilities.flipCoin() ? variables[1] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1] ]);
                const var3 = variables[2];
                const notVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var3.clone() ]);

                const var1AndVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), var3 ]);
                const var1AndNotVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), notVar3 ]);
                const var1AndVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), var2 ]);
                const orSymbols = [ var1AndVar3, var1AndNotVar3 ];

                utilities.shuffleArray(orSymbols);
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, orSymbols),
                    var1AndVar2,
                ]);
                expectedSymbol = [ var1.clone() ];
            }

            // Ex: ac + ac' + c'b -> a+c'b
            else {
                const var1 = utilities.flipCoin() ? variables[0] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]);
                const var2 = utilities.flipCoin() ? variables[1] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1] ]);
                const var3 = variables[2];
                const notVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var3.clone() ]);
                const randomVar3 = [ var3, notVar3 ];

                utilities.shuffleArray(randomVar3);

                const var1AndVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), randomVar3[0].clone() ]);
                const var1AndNotVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1.clone(), randomVar3[1].clone() ]);
                const var2AndNotVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var2.clone(), randomVar3[1].clone() ]);
                const orSymbols = [ var1AndVar3.clone(), var1AndNotVar3.clone() ];

                utilities.shuffleArray(orSymbols);
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, orSymbols),
                    var2AndNotVar3.clone(),
                ]);

                // Accept either a+c'b or a+bc'
                expectedSymbol = [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                        var1.clone(),
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ randomVar3[1].clone(), var2.clone() ]),
                    ]),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                        var1.clone(),
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var2.clone(), randomVar3[1].clone() ]),
                    ]),
                ];
            }
            break;
        }

        // Distributive, complement, identity
        case 2: { // eslint-disable-line no-magic-numbers

            // (x'y + x'y') + (x'z' + x'z) -> x' or (x'y + x'y') + (xz' + xz) -> 1 or (yx + yx') + (zx + zx') -> y + z or (yx + yx') + (xz + xz') -> y + x ...
            const var1 = variables[0];
            const notVar1 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var1.clone() ]);
            const possibleVar1 = [ var1, notVar1 ];
            const var2 = variables[1];
            const notVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var2.clone() ]);
            const possibleVar2 = [ var2, notVar2 ];
            const var3 = variables[2];
            const notVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var3.clone() ]);
            const possibleVar3 = [ var3, notVar3 ];

            utilities.shuffleArray(possibleVar1);
            utilities.shuffleArray(possibleVar2);
            utilities.shuffleArray(possibleVar3);

            // Each distributive will need to have a common term on each side of the distributive.
            const areVar1CommonInFirstDistributive = utilities.flipCoin();
            const areVar2CommonInFirstDistributive = !areVar1CommonInFirstDistributive;
            const firstVar1 = possibleVar1[0].clone();
            const firstVar2 = possibleVar2[0].clone();
            const secondVar1 = areVar1CommonInFirstDistributive ? firstVar1.clone() : possibleVar1[1].clone();
            const secondVar2 = areVar2CommonInFirstDistributive ? firstVar2.clone() : possibleVar2[1].clone();

            // Order symbols to avoid using commutative too much.
            const firstAndSymbols = areVar1CommonInFirstDistributive ? [ firstVar1, firstVar2 ] : [ firstVar2, firstVar1 ];
            const secondAndSymbols = areVar1CommonInFirstDistributive ? [ secondVar1, secondVar2 ] : [ secondVar2, secondVar1 ];

            const firstVar1AndFirstVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, firstAndSymbols);
            const secondVar1AndSecondVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, secondAndSymbols);
            const firstDistributiveSymbols = [ firstVar1AndFirstVar2, secondVar1AndSecondVar2 ];

            utilities.shuffleArray(firstDistributiveSymbols);
            const firstDistributive = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, firstDistributiveSymbols);

            utilities.shuffleArray(possibleVar1);
            const areVar1CommonInSecondDistributive = utilities.flipCoin();
            const areVar3CommonInSecondDistributive = !areVar1CommonInSecondDistributive;
            const thirdVar1 = possibleVar1[0].clone();
            const firstVar3 = possibleVar3[0].clone();
            const forthVar1 = areVar1CommonInSecondDistributive ? thirdVar1.clone() : possibleVar1[1].clone();
            const secondVar3 = areVar3CommonInSecondDistributive ? firstVar3.clone() : possibleVar3[1].clone();

            // Order symbols to avoid using commutative too much.
            const thirdAndSymbols = areVar1CommonInSecondDistributive ? [ thirdVar1, firstVar3 ] : [ firstVar3, thirdVar1 ];
            const forthAndSymbols = areVar1CommonInSecondDistributive ? [ forthVar1, secondVar3 ] : [ secondVar3, forthVar1 ];

            const thirdVar1AndFirstVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, thirdAndSymbols);
            const forthVar1AndSecondVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, forthAndSymbols);
            const secondDistributiveSymbols = [ thirdVar1AndFirstVar3, forthVar1AndSecondVar3 ];

            utilities.shuffleArray(secondDistributiveSymbols);
            const secondDistributive = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, secondDistributiveSymbols);

            const bothDistributiveSymbols = [ firstDistributive, secondDistributive ];

            utilities.shuffleArray(bothDistributiveSymbols);
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, bothDistributiveSymbols);

            // Common variables are the ones that form the |expectedSymbol|
            if (areVar1CommonInFirstDistributive && areVar1CommonInSecondDistributive) {
                const trueConstant = sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.TRUE);

                expectedSymbol = firstVar1.deepEquals(thirdVar1) ? [ firstVar1.clone() ] : [ trueConstant ];
            }
            else if (areVar1CommonInFirstDistributive && !areVar1CommonInSecondDistributive) {
                expectedSymbol = [ sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ firstVar1.clone(), firstVar3.clone() ]),
                                   sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ firstVar3.clone(), firstVar1.clone() ]) ];
            }
            else if (!areVar1CommonInFirstDistributive && areVar1CommonInSecondDistributive) {
                expectedSymbol = [ sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ firstVar2.clone(), thirdVar1.clone() ]),
                                   sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ thirdVar1.clone(), firstVar2.clone() ]) ];
            }
            else if (!areVar1CommonInFirstDistributive && !areVar1CommonInSecondDistributive) {
                expectedSymbol = [ sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ firstVar2.clone(), firstVar3.clone() ]),
                                   sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ firstVar3.clone(), firstVar2.clone() ]) ];
            }
            else {
                throw new Error(`Error building level: ${levelIndex}`);
            }
            break;
        }

        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, expectedSymbol);
};
