'use strict';

/* global Law, LawSide */
/* eslint-disable no-underscore-dangle */

/**
    Build {Law} objects given a specific type.
    @class LawFactory
    @constructor
*/
function LawFactory() {
    this.sdk = require('PropositionalCalculusSDK').create();
}

/**
    Make a law of the given type.
    @method make
    @param {String} type The type of law to make. Ex: reverseAndDistribution
    @param {Object} [options={}] Optional properties when making a law.
    @param {Boolean} [options.makeLeftSideButton=true] Whether to make the left {LawSide} a button.
    @param {Boolean} [options.makeRightSideButton=true] Whether to make the right {LawSide} a button.
    @return {Law} A law of the given type.
*/
LawFactory.prototype.make = function(type, options) {
    const functionName = `_make${require('utilities').initialCapitalize(type)}`;
    let newLaw = null;

    if (functionName in this) {
        let makeLeftSideButton = true;
        let makeRightSideButton = true;
        const optionsExists = Boolean(options);

        if (optionsExists) {
            makeLeftSideButton = ('makeLeftSideButton' in options) ? options.makeLeftSideButton : makeLeftSideButton;
            makeRightSideButton = ('makeRightSideButton' in options) ? options.makeRightSideButton : makeRightSideButton;
        }

        newLaw = this[functionName]({
            makeLeftSideButton,
            makeRightSideButton,
        });
    }
    else {
        throw new Error(`Undefined type of law requested: ${type}`);
    }

    return newLaw;
};

/**
    Make a reverse AND distribution law.
    Ex: Convert ((a AND b) OR (a AND c)) to (a AND (b OR c)).
    @method _makeReverseAndDistribution
    @private
    @param {Object} properties Properties used when making the law.
    @param {Boolean} properties.makeLeftSideButton Whether to not make the left {LawSide} a button.
    @param {Boolean} properties.makeRightSideButton Whether to not make the left {LawSide} a button.
    @return {Law} A reverse AND distribution law.
*/
LawFactory.prototype._makeReverseAndDistribution = function(properties) {
    const aAndB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
        this.sdk.makeSymbol('variable', 'a'),
        this.sdk.makeSymbol('variable', 'b'),
    ]);

    const aAndC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
        this.sdk.makeSymbol('variable', 'a'),
        this.sdk.makeSymbol('variable', 'c'),
    ]);

    // (a AND b) OR (a AND c)
    const aAndBOrAAndC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aAndB, aAndC ]);

    // a AND (b OR c)
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const bVariable2 = this.sdk.makeSymbol('variable', 'b');
    const cVariable2 = this.sdk.makeSymbol('variable', 'c');
    const aAndBOrC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
        aVariable2,
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [
            bVariable2,
            cVariable2,
        ]),
    ]);

    return new Law(
        new LawSide(aAndBOrAAndC, properties.makeLeftSideButton, [ aAndB, aAndC ], 'reverseAndDistribution'),
        new LawSide(aAndBOrC, properties.makeRightSideButton, [ aVariable2, bVariable2, cVariable2 ], 'andDistribution')
    );
};

/**
    Make a reverse OR distribution law.
    Ex: Convert ((a OR b) AND (a OR c)) to (a OR (b AND c)).
    @method _makeReverseOrDistribution
    @private
    @param {Object} properties Properties used when making the law.
    @param {Boolean} properties.makeLeftSideButton Whether to not make the left {LawSide} a button.
    @param {Boolean} properties.makeRightSideButton Whether to not make the left {LawSide} a button.
    @return {Law} A reverse OR distribution law.
*/
LawFactory.prototype._makeReverseOrDistribution = function(properties) {
    const aOrB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [
        this.sdk.makeSymbol('variable', 'a'),
        this.sdk.makeSymbol('variable', 'b'),
    ]);

    const aOrC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [
        this.sdk.makeSymbol('variable', 'a'),
        this.sdk.makeSymbol('variable', 'c'),
    ]);

    // (a OR b) AND (a OR c)
    const aOrBAndAOrC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aOrB, aOrC ]);

    // a OR (b AND c)
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const bVariable2 = this.sdk.makeSymbol('variable', 'b');
    const cVariable2 = this.sdk.makeSymbol('variable', 'c');
    const aOrBAndC = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [
        aVariable2,
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
            bVariable2,
            cVariable2,
        ]),
    ]);

    return new Law(
        new LawSide(aOrBAndAOrC, properties.makeLeftSideButton, [ aOrB, aOrC ], 'reverseOrDistribution'),
        new LawSide(aOrBAndC, properties.makeRightSideButton, [ aVariable2, bVariable2, cVariable2 ], 'orDistribution')
    );
};

/**
    Make an OR commutative law.
    Ex: Convert (a OR b) to (b OR a)
    @method _makeCommutativeOr
    @private
    @return {Law} A commutative OR law.
*/
LawFactory.prototype._makeCommutativeOr = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');
    const aOrB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);

    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const bVariable2 = this.sdk.makeSymbol('variable', 'b');
    const bOrA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ bVariable2, aVariable2 ]);

    return new Law(
        new LawSide(aOrB, true, [ aVariable, bVariable ], 'commutativeOr'),
        new LawSide(bOrA, false)
    );
};

/**
    Make an AND commutative law.
    Ex: Convert (a AND b) to (b AND a)
    @method _makeCommutativeAnd
    @private
    @return {Law} A commutative AND law.
*/
LawFactory.prototype._makeCommutativeAnd = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');
    const aAndB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);

    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const bVariable2 = this.sdk.makeSymbol('variable', 'b');
    const bAndA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ bVariable2, aVariable2 ]);

    return new Law(
        new LawSide(aAndB, true, [ aVariable, bVariable ], 'commutativeAnd'),
        new LawSide(bAndA, false)
    );
};

/**
    Make a complement OR law.
    Ex: Convert (a OR (NOT a)) to T.
    @method _makeComplementOr
    @param {Object} properties Properties used when making the law.
    @param {Boolean} properties.makeLeftSideButton Whether to not make the left {LawSide} a button.
    @param {Boolean} properties.makeRightSideButton Whether to not make the left {LawSide} a button.
    @private
    @return {Law} A complement OR law.
*/
LawFactory.prototype._makeComplementOr = function(properties) {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const notA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('variable', 'a'),
    ]);

    // a OR (NOT a)
    const aOrNotA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, notA ]);
    const trueConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.TRUE);

    return new Law(
        new LawSide(aOrNotA, true, [ aVariable, notA ], 'complementOr'),
        new LawSide(trueConstant, properties.makeRightSideButton, [ trueConstant ], 'reverseOrComplement')
    );
};

/**
    Make a complement AND law.
    Ex: Convert (a AND (NOT a)) to F.
    @method _makeComplementAnd
    @private
    @return {Law} A complement AND law.
*/
LawFactory.prototype._makeComplementAnd = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const notA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [ this.sdk.makeSymbol('variable', 'a') ]);

    // a AND (NOT a)
    const aAndNotA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, notA ]);

    const falseConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.FALSE);

    return new Law(
        new LawSide(aAndNotA, true, [ aVariable, notA ], 'complementAnd'),
        new LawSide(falseConstant, false)
    );
};

/**
    Make a complement TRUE law.
    Ex: Convert (NOT T) to F.
    @method _makeComplementTrue
    @private
    @return {Law} A complement TRUE law.
*/
LawFactory.prototype._makeComplementTrue = function() {
    const notTrue = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.TRUE),
    ]);

    const falseConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.FALSE);

    return new Law(
        new LawSide(notTrue, true, [ notTrue ], 'complementTrue'),
        new LawSide(falseConstant, false)
    );
};

/**
    Make a complement FALSE law.
    Ex: Convert (NOT F) to T.
    @method _makeComplementFalse
    @private
    @return {Law} A complement FALSE law.
*/
LawFactory.prototype._makeComplementFalse = function() {
    const notFalse = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.FALSE),
    ]);

    const trueConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.TRUE);

    return new Law(
        new LawSide(notFalse, true, [ notFalse ], 'complementFalse'),
        new LawSide(trueConstant, false)
    );
};

/**
    Make an identity AND true law.
    Ex: Convert (a AND T) to a.
    @method _makeIdentityAndTrue
    @param {Object} properties Properties used when making the law.
    @param {Boolean} properties.makeLeftSideButton Whether to not make the left {LawSide} a button.
    @param {Boolean} properties.makeRightSideButton Whether to not make the left {LawSide} a button.
    @private
    @return {Law} An identity AND true law.
*/
LawFactory.prototype._makeIdentityAndTrue = function(properties) {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const trueConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.TRUE);
    const aAndTrue = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, trueConstant ]);
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');

    return new Law(
        new LawSide(aAndTrue, true, [ aVariable, trueConstant ], 'identityAndTrue'),
        new LawSide(aVariable2, properties.makeRightSideButton, [ aVariable2 ], 'reverseIdentityAndTrue')
    );
};

/**
    Make an identity OR false.
    Ex: Convert (a OR F) to a.
    @method _makeIdentityOrFalse
    @param {Object} properties Properties used when making the law.
    @param {Boolean} properties.makeLeftSideButton Whether to not make the left {LawSide} a button.
    @param {Boolean} properties.makeRightSideButton Whether to not make the left {LawSide} a button.
    @private
    @return {Law} An identity OR false.
*/
LawFactory.prototype._makeIdentityOrFalse = function(properties) {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const falseConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.FALSE);
    const aOrF = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, falseConstant ]);
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');

    return new Law(
        new LawSide(aOrF, true, [ aVariable, falseConstant ], 'identityOrFalse'),
        new LawSide(aVariable2, properties.makeRightSideButton, [ aVariable2 ], 'reverseIdentityOrFalse')
    );
};

/**
    Make an OR null elements.
    Ex: Convert (a OR T) to T.
    @method _makeOrNullElements
    @private
    @return {Law} An OR null elements.
*/
LawFactory.prototype._makeOrNullElements = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const trueConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.TRUE);
    const aOrT = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, trueConstant ]);

    return new Law(
        new LawSide(aOrT, true, [ aVariable, trueConstant ], 'orNullElements'),
        new LawSide(trueConstant.clone(), false)
    );
};

/**
    Make an AND null elements.
    Ex: Convert (a AND F) to F.
    @method _makeAndNullElements
    @private
    @return {Law} An AND null elements.
*/
LawFactory.prototype._makeAndNullElements = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const falseConstant = this.sdk.makeSymbol('constant', this.sdk.CONSTANT_SYMBOLS.FALSE);
    const aAndF = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, falseConstant ]);

    return new Law(
        new LawSide(aAndF, true, [ aVariable, falseConstant ], 'andNullElements'),
        new LawSide(falseConstant.clone(), false)
    );
};

/**
    Make an OR idempotence.
    Ex: Convert (a OR a) to a.
    @method _makeOrIdempotence
    @private
    @return {Law} An OR idempotence.
*/
LawFactory.prototype._makeOrIdempotence = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const aOrA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, aVariable2 ]);

    return new Law(
        new LawSide(aOrA, true, [ aVariable, aVariable2 ], 'orIdempotence'),
        new LawSide(aVariable.clone(), false)
    );
};

/**
    Make an AND idempotence.
    Ex: Convert (a AND a) to a.
    @method _makeAndIdempotence
    @private
    @return {Law} An AND idempotence.
*/
LawFactory.prototype._makeAndIdempotence = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');
    const aAndA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, aVariable2 ]);

    return new Law(
        new LawSide(aAndA, true, [ aVariable, aVariable2 ], 'andIdempotence'),
        new LawSide(aVariable.clone(), false)
    );
};

/**
    Make a double negation law.
    Ex: Convert NOT NOT a to a.
    @method _makeDoubleNegation
    @private
    @return {Law} A double negation law.
*/
LawFactory.prototype._makeDoubleNegation = function() {
    const notNotA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [ this.sdk.makeSymbol('variable', 'a') ]),
    ]);
    const aVariable2 = this.sdk.makeSymbol('variable', 'a');

    return new Law(
        new LawSide(notNotA, true, [ notNotA ], 'doubleNegation'),
        new LawSide(aVariable2, false)
    );
};

/**
    Make a conditional law.
    Ex: Convert (a -> b) to ((NOT a) OR b)
    @method _makeConditional
    @private
    @return {Law} A conditional law.
*/
LawFactory.prototype._makeConditional = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');

    const aConditionalB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable, bVariable ]);

    const bVariable2 = this.sdk.makeSymbol('variable', 'b');
    const notA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [ this.sdk.makeSymbol('variable', 'a') ]);
    const notAOrB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ notA, bVariable2 ]);

    return new Law(
        new LawSide(aConditionalB, true, [ aVariable, bVariable ], 'conditional'),
        new LawSide(notAOrB, true, [ notA, bVariable2 ], 'reverseConditional')
    );
};

/**
    Make a biconditional law.
    Ex: Convert (a <-> b) to ((a -> b) AND (b -> a))
    @method _makeBiconditional
    @private
    @return {Law} A biconditional law.
*/
LawFactory.prototype._makeBiconditional = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');
    const aBiconditionalB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.BICONDITIONAL, [ aVariable, bVariable ]);
    const aConditionalB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable.clone(), bVariable.clone() ]);
    const bConditionalA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.CONDITIONAL, [ bVariable.clone(), aVariable.clone() ]);
    const aConditionalBAndBConditionalA = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
        aConditionalB,
        bConditionalA,
    ]);

    return new Law(
        new LawSide(aBiconditionalB, true, [ aVariable, bVariable ], 'biconditional'),
        new LawSide(aConditionalBAndBConditionalA, true, [ aConditionalB, bConditionalA ], 'reverseBiconditional')
    );
};

/**
    Make a de Morgan's AND law.
    Ex: Convert NOT(a AND b) to ((NOT a) OR (NOT b))
    @method _makeDeMorganAnd
    @private
    @return {Law} A de Morgan's AND law.
*/
LawFactory.prototype._makeDeMorganAnd = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');

    const notAAndB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]),
    ]);

    const notAOrNotB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
            this.sdk.makeSymbol('variable', 'a'),
        ]),
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
            this.sdk.makeSymbol('variable', 'b'),
        ]),
    ]);

    return new Law(
        new LawSide(notAAndB, true, [ aVariable, bVariable ], 'deMorganAnd'),
        new LawSide(notAOrNotB, false)
    );
};

/**
    Make a de Morgan's OR law.
    Ex: Convert NOT(a OR b) to ((NOT a) AND (NOT b))
    @method _makeDeMorganOr
    @private
    @return {Law} A de Morgan's OR law.
*/
LawFactory.prototype._makeDeMorganOr = function() {
    const aVariable = this.sdk.makeSymbol('variable', 'a');
    const bVariable = this.sdk.makeSymbol('variable', 'b');

    const notAOrB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]),
    ]);

    const notAAndNotB = this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.AND, [
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
            this.sdk.makeSymbol('variable', 'a'),
        ]),
        this.sdk.makeSymbol('operator', this.sdk.OPERATOR_SYMBOLS.NOT, [
            this.sdk.makeSymbol('variable', 'b'),
        ]),
    ]);

    return new Law(
        new LawSide(notAOrB, true, [ aVariable, bVariable ], 'deMorganOr'),
        new LawSide(notAAndNotB, false)
    );
};
