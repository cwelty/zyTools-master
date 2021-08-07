'use strict';

/* global LawFactory, LawCategory, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces simple propositions.
    @class QuestionFactoryReduceOne
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryReduceOne() {
    const lawFactory = new LawFactory();

    this.numberOfLevels = 3;
    this.expressionAreaWidth = '420px';
    this.lawPanels = [
        [
            new LawCategory(
                'Distributive',
                [
                    lawFactory.make('reverseAndDistribution', { makeRightSideButton: false }),
                    lawFactory.make('reverseOrDistribution', { makeRightSideButton: false }),
                ]
            ),
            new LawCategory(
                'Commutative',
                [
                    lawFactory.make('commutativeOr'),
                    lawFactory.make('commutativeAnd'),
                ]
            ),
            new LawCategory(
                'Complement',
                [
                    lawFactory.make('complementOr', { makeRightSideButton: false }),
                    lawFactory.make('complementAnd'),
                ]
            ),
            new LawCategory(
                'Identity',
                [
                    lawFactory.make('identityAndTrue', { makeRightSideButton: false }),
                    lawFactory.make('identityOrFalse', { makeRightSideButton: false }),
                ]
            ),
            new LawCategory(
                'Double negation',
                [
                    lawFactory.make('doubleNegation'),
                ]
            ),
        ],
    ];
}

QuestionFactoryReduceOne.prototype = new QuestionFactory();
QuestionFactoryReduceOne.prototype.constructor = QuestionFactoryReduceOne;

/**
    @inheritdoc
*/
QuestionFactoryReduceOne.prototype.make = function(levelIndex) {
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');

    let initialSymbol = null;
    let expectedSymbol = null;
    let variables = null;

    switch (levelIndex) {

        // Double negation and identity laws. Ex: NOT NOT a AND T
        case 0: {
            const variable = this._makeNVariables(1)[0];

            const notNotVariable = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                    variable.clone(),
                ]),
            ]);

            initialSymbol = this._randomIdentityLawWithSymbol(notNotVariable);
            expectedSymbol = variable.clone();
            break;
        }

        // Complement and identity laws. Ex: a AND (b OR NOT b)
        case 1: {
            variables = this._makeNVariables(2); // eslint-disable-line no-magic-numbers

            const innerSymbols = [
                variables[1].clone(),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variables[1].clone() ]),
            ];

            utilities.shuffleArray(innerSymbols);

            // Ex: a AND (b OR NOT b)
            if (utilities.flipCoin()) {
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                    variables[0].clone(),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, innerSymbols),
                ]);
            }

            // Ex: a OR (b AND NOT b)
            else {
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                    variables[0].clone(),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, innerSymbols),
                ]);
            }
            expectedSymbol = variables[0].clone();
            break;
        }

        // Distributive, complement, and identity laws. Ex: (a OR b) AND (a OR NOT b)
        case 2: { // eslint-disable-line no-magic-numbers
            variables = this._makeNVariables(2); // eslint-disable-line no-magic-numbers

            const firstInnerSymbols = [
                variables[0].clone(),
                variables[1].clone(),
            ];
            const secondInnerSymbols = [
                variables[0].clone(),
                sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [
                    variables[1].clone(),
                ]),
            ];

            utilities.shuffleArray(secondInnerSymbols);

            // Ex: (a AND b) OR (a AND NOT b)
            if (utilities.flipCoin()) {
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, firstInnerSymbols),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, secondInnerSymbols),
                ]);
            }

            // Ex: (a OR b) AND (a OR NOT b)
            else {
                initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, firstInnerSymbols),
                    sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, secondInnerSymbols),
                ]);
            }

            expectedSymbol = variables[0].clone();
            break;
        }
        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, [ expectedSymbol ]);
};

/**
    Return a random identity law using the given symbol.
    @method _randomIdentityLawWithSymbol
    @private
    @param {MathSymbol} symbol The math symbol to include in the identity law. Ex: The a in: a AND T
    @return {MathSymbol} The resulting identity law using the given symbol.
*/
QuestionFactoryReduceOne.prototype._randomIdentityLawWithSymbol = function(symbol) {
    const sdk = require('PropositionalCalculusSDK').create();
    const utilities = require('utilities');

    let identity = null;
    const symbols = [ symbol ];

    // Identity AND TRUE. Ex: a AND T
    if (utilities.flipCoin()) {
        symbols.push(sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.TRUE));
        identity = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, symbols);
    }

    // Identity OR FALSE. Ex: a OR F
    else {
        symbols.push(sdk.makeSymbol('constant', sdk.CONSTANT_SYMBOLS.FALSE));
        identity = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, symbols);
    }

    return identity;
};
