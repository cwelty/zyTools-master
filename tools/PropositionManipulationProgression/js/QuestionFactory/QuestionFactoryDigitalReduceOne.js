'use strict';

/* global LawFactory, LawCategory, QuestionFactory, Question */

/**
    Make progression questions wherein the user reduces simple propositions.
    @class QuestionFactoryDigitalReduceOne
    @extends QuesitonFactory
    @constructor
*/
function QuestionFactoryDigitalReduceOne() {
    const lawFactory = new LawFactory();

    this.numberOfLevels = 2;
    this.expressionAreaWidth = '420px';
    this.lawPanels = [
        [
            new LawCategory('Distributive', [ lawFactory.make('reverseAndDistribution', { makeRightSideButton: false }) ]),
            new LawCategory('Commutative', [ lawFactory.make('commutativeOr') ]),
            new LawCategory('Complement', [ lawFactory.make('complementOr', { makeRightSideButton: false }) ]),
            new LawCategory('Identity', [ lawFactory.make('identityAndTrue', { makeRightSideButton: false }) ]),
        ],
    ];
}

QuestionFactoryDigitalReduceOne.prototype = new QuestionFactory();
QuestionFactoryDigitalReduceOne.prototype.constructor = QuestionFactoryDigitalReduceOne;

/**
    @inheritdoc
*/
QuestionFactoryDigitalReduceOne.prototype.make = function(levelIndex) {
    const sdk = require('PropositionalCalculusSDK').create();
    const isDigital = true;
    const numVariables = 2;

    let initialSymbol = null;
    let expectedSymbol = null;
    const variables = this._makeNVariables(numVariables, isDigital);

    switch (levelIndex) {

        // Complement and identity. Ex: b(a + a') -> b
        case 0: {
            const variable1 = variables[0];
            const variable2 = variables[1];
            const notVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variable2.clone() ]);
            const var2OrNotVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ variable2, notVar2 ]);

            // Var1 · (Var2 + Var2')
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ variable1, var2OrNotVar2 ]);
            expectedSymbol = variable1.clone();
            break;
        }

        // And distributive, complement, and identity laws. Ex: ab + ab'
        case 1: {
            const variable1 = variables[0];
            const variable2 = variables[1];
            const var1AndVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ variable1, variable2 ]);
            const notVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.NOT, [ variable2.clone() ]);
            const var1AndNotVar2 = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.AND, [ variable1.clone(), notVar2 ]);

            // (Var1 · Var2) + (Var1 · Var2')
            initialSymbol = sdk.makeSymbol('operator', sdk.OPERATOR_SYMBOLS.OR, [ var1AndVar2, var1AndNotVar2 ]);
            expectedSymbol = variable1.clone();
            break;
        }
        default:
            throw new Error(`Level not supported: ${levelIndex}`);
    }

    return new Question(initialSymbol, [ expectedSymbol ]);
};
