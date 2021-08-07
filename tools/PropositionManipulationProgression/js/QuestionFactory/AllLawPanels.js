'use strict';

/* exported allLawPanels */
/* global LawFactory, LawCategory */

/**
    Return all the law categories.
    @method allLawPanels
    @return {Array} Array of {Array} of {LawCategory}. All law categories.
*/
function allLawPanels() {
    const lawFactory = new LawFactory();

    return [
        [
            new LawCategory(
                'Distributive',
                [
                    lawFactory.make('reverseAndDistribution'),
                    lawFactory.make('reverseOrDistribution'),
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
                'De Morgan\'s',
                [
                    lawFactory.make('deMorganAnd'),
                    lawFactory.make('deMorganOr'),
                ]
            ),
            new LawCategory(
                'Conditional',
                [
                    lawFactory.make('conditional'),
                    lawFactory.make('biconditional'),
                ]
            ),
        ],
        [
            new LawCategory(
                'Complement',
                [
                    lawFactory.make('complementOr', { makeRightSideButton: false }),
                    lawFactory.make('complementAnd'),
                    lawFactory.make('complementTrue'),
                    lawFactory.make('complementFalse'),
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
