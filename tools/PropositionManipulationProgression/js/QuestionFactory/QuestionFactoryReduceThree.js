'use strict';

/* global allLawPanels, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces propositions by expanding then reducing.
    @class QuestionFactoryReduceThree
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryReduceThree() {
    this.numberOfLevels = 2;
    this.expressionAreaWidth = '470px';
    this.lawPanels = allLawPanels();
}

QuestionFactoryReduceThree.prototype = new QuestionFactory();
QuestionFactoryReduceThree.prototype.constructor = QuestionFactoryReduceThree;

/**
    @inheritdoc
*/
QuestionFactoryReduceThree.prototype.make = function(levelIndex) {
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');

    let initialSymbol = null;
    let expectedSymbols = null;
    const variables = this._makeNVariables(2); // eslint-disable-line no-magic-numbers

    switch (levelIndex) {

        /*
            Expected laws to use: De Morgan's, distribution, complement, then identity law.
            Ex: Convert NOT(a OR (NOT a AND b)) to (NOT a AND NOT b)
        */
        case 0: {
            const operatorSymbols = [ sdk.OPERATOR_SYMBOLS.OR, sdk.OPERATOR_SYMBOLS.AND ];

            utilities.shuffleArray(operatorSymbols);

            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                sdk.makeSymbol('operator', operatorSymbols[0], [
                    variables[0].clone(),
                    sdk.makeSymbol('operator', operatorSymbols[1], [
                        variables[1].clone(),
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0].clone() ]),
                    ]),
                ]),
            ]);

            expectedSymbols = [
                sdk.makeSymbol('operator', operatorSymbols[1], [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0].clone() ]),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1].clone() ]),
                ]),
                sdk.makeSymbol('operator', operatorSymbols[1], [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1].clone() ]),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0].clone() ]),
                ]),
            ];
            break;
        }

        /*
            Expected laws to use: Conditional, distribution, complement, then identity law.
            Ex: Convert NOT(a -> (a AND NOT b)) to (a AND b)
        */
        case 1: {
            const firstVariable = [
                variables[0],
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[0] ]),
            ];

            utilities.shuffleArray(firstVariable);

            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.CONDITIONAL, [
                    firstVariable[0].clone(),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                        sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1].clone() ]),
                        firstVariable[0].clone(),
                    ]),
                ]),
            ]);
            expectedSymbols = [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                    firstVariable[0].clone(),
                    variables[1].clone(),
                ]),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                    variables[1].clone(),
                    firstVariable[0].clone(),
                ]),
            ];
            break;
        }
        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, expectedSymbols);
};
