'use strict';

/* global LawFactory, LawCategory, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces simple propositions.
    @class QuestionFactoryDigitalExpandOne
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryDigitalExpandOne() {
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
                lawFactory.make('complementOr'),
            ]),
        ],
        [
            new LawCategory('Identity', [
                lawFactory.make('identityAndTrue'),
                lawFactory.make('identityOrFalse'),
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

QuestionFactoryDigitalExpandOne.prototype = new QuestionFactory();
QuestionFactoryDigitalExpandOne.prototype.constructor = QuestionFactoryDigitalExpandOne;

/**
    @inheritdoc
*/
QuestionFactoryDigitalExpandOne.prototype.make = function(levelIndex) {
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');
    const isDigital = true;
    const numVariables = 3;

    let initialSymbol = null;
    let expectedSymbol = null;
    const variables = this._makeNVariables(numVariables, isDigital);

    // Sort by variable name.
    variables.sort((variable1, variable2) => {
        if (variable1.name < variable2.name) {
            return -1;
        }
        else if (variable2.name < variable1.name) {
            return 1;
        }
        return 0;
    });

    switch (levelIndex) {

        // xy -> xyz + xyz'
        case 0:
        case 1: {
            const var1 = utilities.flipCoin() ? variables[0] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]);
            const var2 = utilities.flipCoin() ? variables[1] : sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1] ]);
            const var3 = variables[2];
            const notVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var3.clone() ]);

            const possibleTerms1 = [ var1, var2, var3 ];
            const possibleTerms2 = [ var1, var2, notVar3 ];

            const possibleAnd1 = [];
            const possibleAnd2 = [];

            possibleTerms1.forEach((term1, index1) => possibleTerms1.forEach((term2, index2) => possibleTerms1.forEach((term3, index3) => {
                if (index1 !== index2 && index1 !== index3 && index2 !== index3) {
                    possibleAnd1.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term1, term2 ]),
                        term3,
                    ]));
                }
            })));
            possibleTerms2.forEach((term1, index1) => possibleTerms2.forEach((term2, index2) => possibleTerms2.forEach((term3, index3) => {
                if (index1 !== index2 && index1 !== index3 && index2 !== index3) {
                    possibleAnd2.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term1, term2 ]),
                        term3,
                    ]));
                }
            })));

            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1, var2 ]);
            expectedSymbol = [];
            possibleAnd1.forEach(and1 => possibleAnd2.forEach(and2 => {
                expectedSymbol.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ and1, and2 ]));
                expectedSymbol.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ and2, and1 ]));
            }));
            break;
        }

        // xy + x'y' -> xyz + xyz' + x'y'z + x'y'z'
        case 2: { // eslint-disable-line no-magic-numbers
            const var1 = variables[0];
            const notVar1 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var1.clone() ]);
            const var1Array = [ var1, notVar1 ];
            const var2 = variables[1];
            const notVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var2.clone() ]);
            const var3 = variables[2];
            const notVar3 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ var3.clone() ]);

            utilities.shuffleArray(var1Array);

            // Prepare initial terms and equivalent. Ex: xy + x'y' or yx + y'x' or xy + y'x' or yx + x'y'
            const possibleTermLeft = [];
            const possibleTermRight = [];

            possibleTermLeft.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1Array[0].clone(), var2.clone() ]));
            possibleTermLeft.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var2.clone(), var1Array[0].clone() ]));
            possibleTermRight.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var1Array[1].clone(), notVar2.clone() ]));
            possibleTermRight.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ notVar2.clone(), var1Array[1].clone() ]));
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ possibleTermLeft[0], possibleTermRight[0] ]);

            // Make all accepted answers. Anything equivalent to: (xyz + xyz') + (x'y'z + x'y'z')
            const firstOr = [];
            const secondOr = [];
            const thirdOr = [];
            const forthOr = [];

            possibleTermLeft.forEach(term => {
                firstOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term.clone(), var3.clone() ]));
                firstOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var3.clone(), term.clone() ]));

                secondOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term.clone(), notVar3.clone() ]));
                secondOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ notVar3.clone(), term.clone() ]));
            });

            possibleTermRight.forEach(term => {
                thirdOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term.clone(), var3.clone() ]));
                thirdOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ var3.clone(), term.clone() ]));

                forthOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ term.clone(), notVar3.clone() ]));
                forthOr.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ notVar3.clone(), term.clone() ]));
            });

            expectedSymbol = [];
            firstOr.forEach(or1 => secondOr.forEach(or2 =>
                thirdOr.forEach(or3 => forthOr.forEach(or4 => {
                    const or1And2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ or1, or2 ]);
                    const or3And4 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ or3, or4 ]);

                    expectedSymbol.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ or1And2, or3And4 ]));
                    expectedSymbol.push(sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ or3And4, or1And2 ]));
                }))
            ));

            break;
        }

        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, expectedSymbol);
};
