'use strict';

/* global allLawPanels, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces propositions using de Morgan's and conditional law.
    @class QuestionFactoryReduceTwo
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryReduceTwo() {
    this.numberOfLevels = 3;
    this.expressionAreaWidth = '470px';
    this.lawPanels = allLawPanels();
}

QuestionFactoryReduceTwo.prototype = new QuestionFactory();
QuestionFactoryReduceTwo.prototype.constructor = QuestionFactoryReduceTwo;

/**
    @inheritdoc
*/
QuestionFactoryReduceTwo.prototype.make = function(levelIndex) {
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');

    let initialSymbol = null;
    let expectedSymbols = null;
    const variables = this._makeNVariables(2); // eslint-disable-line no-magic-numbers
    const firstVariable = [
        variables[0],
        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]),
    ];

    utilities.shuffleArray(firstVariable);

    switch (levelIndex) {

        // De Morgan's, reverse distribution, complement, then identity law. Ex: NOT(NOT a OR b) OR (a AND b)
        case 0: {
            const operatorSymbols = [ sdk.OPERATOR_SYMBOLS.OR, sdk.OPERATOR_SYMBOLS.AND ];

            utilities.shuffleArray(operatorSymbols);

            initialSymbol = sdk.makeSymbol('operator', operatorSymbols[0], [
                sdk.makeSymbol('operator', operatorSymbols[1], [ firstVariable[1].clone(), variables[1].clone() ]),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                    sdk.makeSymbol('operator', operatorSymbols[0], [
                        firstVariable[0].clone(),
                        variables[1].clone(),
                    ]),
                ]),
            ]);
            expectedSymbols = [ firstVariable[1].clone() ];
            break;
        }

        // Conditional, de Morgan's, complement, then identity law. Ex: NOT(a -> NOT NOT a)
        case 1: {
            const variable = variables[0];
            const terms = [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                        variable.clone(),
                    ]),
                ]),
                variable.clone(),
            ];

            utilities.shuffleArray(terms);
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.CONDITIONAL, terms),
            ]);
            expectedSymbols = [ sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE) ];
            break;
        }

        // Identity, double negation, then reverse biconditional. Ex: ((a AND T) -> b) AND (b -> NOT NOT a)
        case 2: { // eslint-disable-line no-magic-numbers

            // Randomize whether first variable has identity TRUE or identity FALSE.
            const firstTermRandomized = [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                    variables[0].clone(),
                    sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.TRUE),
                ]),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                    variables[0].clone(),
                    sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE),
                ]),
            ];

            utilities.shuffleArray(firstTermRandomized);

            // Randomize whether first or second variable has double-negation.
            const secondTermRandomized = [
                [
                    variables[1].clone(),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0].clone() ]),
                    ]),
                ],
                [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1].clone() ]),
                    ]),
                    variables[0].clone(),
                ],
            ];

            utilities.shuffleArray(secondTermRandomized);

            // Randomize the ordering of the terms.
            const conditionalTermsRandomized = [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.CONDITIONAL, [
                    firstTermRandomized[0],
                    variables[1].clone(),
                ]),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.CONDITIONAL, secondTermRandomized[0]),
            ];

            utilities.shuffleArray(conditionalTermsRandomized);

            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, conditionalTermsRandomized);
            expectedSymbols = [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.BICONDITIONAL, [ variables[0].clone(), variables[1].clone() ]),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.BICONDITIONAL, [ variables[1].clone(), variables[0].clone() ]),
            ];
            break;
        }
        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, expectedSymbols);
};
