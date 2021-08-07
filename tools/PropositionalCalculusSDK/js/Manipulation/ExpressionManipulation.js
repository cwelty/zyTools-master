'use strict';

/* global OPERATOR_SYMBOLS, CONSTANT_SYMBOLS, ManipulationError, PropositionExpression, DigitalExpression, Constant, Operator, Variable, FactoredChildAndNotFactoredChildren */
/* exported ExpressionManipulation */
/* eslint-disable no-underscore-dangle */

/**
    Collection of expression manipulation functions.
    @class ExpressionManipulation
    @constructor
*/
function ExpressionManipulation() {}  // eslint-disable-line no-empty-function

/**
    Perform double negation on first element in |subExpressions|.
    @method doubleNegation
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.doubleNegation = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should begin with two NOT operators.
    const subExpression = subExpressions[0];
    const rootIsNot = (subExpression.root.name === OPERATOR_SYMBOLS.NOT);
    const rootIsNotAndChildIsNot = (rootIsNot && (subExpression.root.children[0].name === OPERATOR_SYMBOLS.NOT));

    if (!rootIsNotAndChildIsNot) {
        let beginOrEnd = '';

        if (subExpressions[0] instanceof PropositionExpression) {
            beginOrEnd = 'begin';
        }
        else if (subExpressions[0] instanceof DigitalExpression) {
            beginOrEnd = 'end';
        }

        throw new ManipulationError([
            `Selected term should ${beginOrEnd} with: `,
            new Operator(OPERATOR_SYMBOLS.NOT, [ new Operator(OPERATOR_SYMBOLS.NOT, []) ]),
        ]);
    }

    const doubleNegatedResult = subExpression.root.children[0].children[0];

    this._insertManipulationResultInExpression(expression, subExpression.root, doubleNegatedResult);
};

/**
    Perform a complement on TRUE.
    Ex: Convert (NOT T) to F.
    @method complementTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementTrue = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should be: NOT T
    const subExpression = subExpressions[0];
    const rootIsNotAndChildIsTrue = subExpression.root.deepEquals(
        new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.TRUE) ])
    );

    if (!rootIsNotAndChildIsTrue) {
        throw new ManipulationError([
            'Selected term should be: ',
            new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.TRUE) ]),
        ]);
    }

    const complementResult = new Constant(CONSTANT_SYMBOLS.FALSE);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a complement on FALSE.
    Ex: Convert (NOT F) to T.
    @method complementFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementFalse = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should be: NOT F
    const subExpression = subExpressions[0];
    const rootIsNotAndChildIsFalse = subExpression.root.deepEquals(
        new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.FALSE) ])
    );

    if (!rootIsNotAndChildIsFalse) {
        throw new ManipulationError([
            'Selected term should be: ',
            new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.FALSE) ]),
        ]);
    }

    const complementResult = new Constant(CONSTANT_SYMBOLS.TRUE);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a reverse AND distribution on an expression given two sub-expressions.
    Ex: Convert ((a AND b) OR (a AND c)) to (a AND (b OR c)).
    @method reverseAndDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseAndDistribution = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    this._expectedSymbolOfSubExpressionsRoot(subExpressions, OPERATOR_SYMBOLS.AND);

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const result = this._findFactoredAndNotFactoredSubExpressionChildren(subExpressions);
    const factoredChild = result.factoredChild;
    const notFactoredChildren = result.notFactoredChildren;

    /*
        Build resulting reverse AND distribution.
        Ex: From ((a AND b) OR (a AND c)) to (a AND (b OR c))
    */
    const reverseDistributedResult = new Operator(OPERATOR_SYMBOLS.AND, [
        factoredChild,
        new Operator(OPERATOR_SYMBOLS.OR, [
            notFactoredChildren[0],
            notFactoredChildren[1],
        ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, reverseDistributedResult);
};

/**
    Perform a reverse OR distribution on an expression given two sub-expressions.
    Ex: Convert ((a OR b) AND (a OR c)) to (a OR (b AND c)).
    @method reverseOrDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseOrDistribution = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    this._expectedSymbolOfSubExpressionsRoot(subExpressions, OPERATOR_SYMBOLS.OR);

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    const result = this._findFactoredAndNotFactoredSubExpressionChildren(subExpressions);
    const factoredChild = result.factoredChild;
    const notFactoredChildren = result.notFactoredChildren;

    /*
        Build resulting reverse OR distribution.
        Ex: From ((a OR b) AND (a OR c)) to (a OR (b AND c))
    */
    const reverseDistributedResult = new Operator(OPERATOR_SYMBOLS.OR, [
        factoredChild,
        new Operator(OPERATOR_SYMBOLS.AND, [
            notFactoredChildren[0],
            notFactoredChildren[1],
        ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, reverseDistributedResult);
};

/**
    Perform a commutative OR on an expression given two sub-expressions.
    Ex: Convert (a OR b) to (b OR a)
    @method commutativeOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.commutativeOr = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const commutativeResult = new Operator(OPERATOR_SYMBOLS.OR, [ subExpressionParent.children[1], subExpressionParent.children[0] ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, commutativeResult);
};

/**
    Perform a commutative AND on an expression given two sub-expressions.
    Ex: Convert (a AND b) to (b AND a)
    @method commutativeAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.commutativeAnd = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    const commutativeResult = new Operator(OPERATOR_SYMBOLS.AND, [ subExpressionParent.children[1], subExpressionParent.children[0] ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, commutativeResult);
};

/**
    Perform a complement between two sub-expressions connected by an OR.
    Ex: Convert (a OR (NOT a)) to T.
    @method complementOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementOr = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const originalSubExpression = this._verifyOneSubExpressionIsNOTOfOtherSubExpression(subExpressions);
    const notFirstSubExpression = new Operator(OPERATOR_SYMBOLS.NOT, [ originalSubExpression.root ]);
    const firstSubExpressionOrNotFirst = new Operator(OPERATOR_SYMBOLS.OR, [ originalSubExpression.root, notFirstSubExpression ]);
    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(firstSubExpressionOrNotFirst).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(firstSubExpressionOrNotFirst).print();
    }

    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], originalSubExpression.root,
        actualExpressionString, expectedExpressionString, 'Right-hand side must be the NOT of left side.');

    const complementResult = new Constant(CONSTANT_SYMBOLS.TRUE);

    this._insertManipulationResultInExpression(expression, subExpressionParent, complementResult);
};

/**
    Perform a reverse complement from a constant to a variable.
    Ex: Convert T to (a OR (NOT a)).
    @method reverseOrComplement
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @param {String} options Additional options for the manipulation.
    @param {String} options.variableName The string representation of the variable to add.
    @return {void}
*/
ExpressionManipulation.prototype.reverseOrComplement = function(expression, subExpressions, options) {
    const variable = new Variable(options.variableName);
    const subExpression = subExpressions[0];

    this._numberOfExpectedSubExpressions(1, subExpressions);

    const trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);

    const isCorrectTerm = subExpression.root.deepEquals(trueConstant);

    if (!isCorrectTerm) {
        throw new ManipulationError([ 'Selected term must be TRUE.' ]);
    }

    const complementResult = new Operator(OPERATOR_SYMBOLS.OR, [
        variable,
        new Operator(OPERATOR_SYMBOLS.NOT, [ variable.clone() ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a complement between two sub-expressions connected by an AND.
    Ex: Convert (a AND (NOT a)) to F.
    @method complementAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementAnd = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    const originalSubExpression = this._verifyOneSubExpressionIsNOTOfOtherSubExpression(subExpressions);

    const notFirstSubExpression = new Operator(OPERATOR_SYMBOLS.NOT, [ originalSubExpression.root ]);
    const firstSubExpressionAndNotFirst = new Operator(OPERATOR_SYMBOLS.AND, [ originalSubExpression.root, notFirstSubExpression ]);

    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(firstSubExpressionAndNotFirst).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(firstSubExpressionAndNotFirst).print();
    }

    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], originalSubExpression.root,
        actualExpressionString, expectedExpressionString, 'Right-hand side must be the NOT of left side.');

    const complementResult = new Constant(CONSTANT_SYMBOLS.FALSE);

    this._insertManipulationResultInExpression(expression, subExpressionParent, complementResult);
};

/**
    Perform an identity: two sub-expressions connected by an AND wherein one sub-expression is TRUE.
    Ex: Convert (a AND T) to a.
    @method identityAndTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.identityAndTrue = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    const otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.TRUE);
    const identityResult = otherExpression.root;

    const trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    const subExpressionAndTrue = new Operator(OPERATOR_SYMBOLS.AND, [ otherExpression.root, trueConstant ]);

    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionAndTrue).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionAndTrue).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], identityResult, actualExpressionString, expectedExpressionString,
        'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, identityResult);
};

/**
    Perform a reverse AND identity: one sub-expression that is converted in sub-expression AND True.
    Ex: Convert a to (a AND T).
    @method reverseIdentityAndTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseIdentityAndTrue = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpression = subExpressions[0];
    const trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    const reverseIdentityAndTrue = new Operator(OPERATOR_SYMBOLS.AND, [ subExpression.root, trueConstant ]);

    this._insertManipulationResultInExpression(expression, subExpression.root, reverseIdentityAndTrue);
};

/**
    Perform an identity: two sub-expressions connected by an OR wherein one sub-expression is FALSE.
    Ex: Convert (a OR F) to a.
    @method identityOrFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.identityOrFalse = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.FALSE);
    const identityResult = otherExpression.root;

    const falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    const subExpressionOrFalse = new Operator(OPERATOR_SYMBOLS.OR, [ otherExpression.root, falseConstant ]);
    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionOrFalse).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionOrFalse).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], identityResult, actualExpressionString, expectedExpressionString,
        'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, identityResult);
};

/**
    Perform a reverse OR identity: one sub-expression that is converted in sub-expression AND False.
    Ex: Convert a to (a OR F).
    @method reverseIdentityOrFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseIdentityOrFalse = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpression = subExpressions[0];
    const falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    const reverseIdentityOrFalse = new Operator(OPERATOR_SYMBOLS.OR, [ subExpression.root, falseConstant ]);

    this._insertManipulationResultInExpression(expression, subExpression.root, reverseIdentityOrFalse);
};

/**
    Perform an OR null element. Two sub-expressions connected by an OR wherein one sub-expression is TRUE.
    Ex: Convert (a OR T) to T.
    @method orNullElements
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orNullElements = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.TRUE);
    const trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    const nullElementsResult = trueConstant.clone();
    const subExpressionOrTrue = new Operator(OPERATOR_SYMBOLS.OR, [ otherExpression.root, trueConstant ]);

    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionOrTrue).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionOrTrue).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], otherExpression.root, actualExpressionString,
        expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, nullElementsResult);
};

/**
    Perform an AND null element. Two sub-expressions connected by an AND wherein one sub-expression is FALSE.
    Ex: Convert (a AND F) to F.
    @method andNullElements
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andNullElements = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    const otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.FALSE);
    const falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    const nullElementsResult = falseConstant.clone();
    const subExpressionAndFalse = new Operator(OPERATOR_SYMBOLS.AND, [ otherExpression.root, falseConstant ]);

    let actualExpressionString = '';
    let expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionAndFalse).print();
    }
    else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionAndFalse).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], otherExpression.root, actualExpressionString,
        expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, nullElementsResult);
};

/**
    Perform an AND idempotence manipulation. Two sub-expressions connected by an AND wherein both sub-expressions are the same.
    Ex: Convert (a AND a) to a.
    @method andIdempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andIdempotence = function(expression, subExpressions) {
    this._idempotence(expression, subExpressions, OPERATOR_SYMBOLS.AND);
};

/**
    Perform an OR idempotence manipulation. Two sub-expressions connected by an OR wherein both sub-expressions are the same.
    Ex: Convert (a OR a) to a.
    @method orIdempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orIdempotence = function(expression, subExpressions) {
    this._idempotence(expression, subExpressions, OPERATOR_SYMBOLS.OR);
};

/**
    Perform an OR idempotence manipulation. Two sub-expressions connected by an OR wherein both sub-expressions are the same.
    Ex: Convert (a OR a) to a.
    @method _idempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @param {String} operator The operator of this idempotence.
    @return {void}
*/
ExpressionManipulation.prototype._idempotence = function(expression, subExpressions, operator) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    if (!subExpressions[0].root.deepEquals(subExpressions[1].root)) {
        throw new ManipulationError([ 'Both sub-expressions must be equivalent.' ]);
    }

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, operator);
    this._insertManipulationResultInExpression(expression, subExpressionParent, subExpressions[0].root.clone());
};

/**
    Perform a conditional manipulation with two sub-expressions connected by a CONDITIONAL operator.
    Ex: Convert (a -> b) to ((NOT a) OR b)
    @method conditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.conditional = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.CONDITIONAL);

    const result = new Operator(OPERATOR_SYMBOLS.OR, [
        new Operator(OPERATOR_SYMBOLS.NOT, [ subExpressions[0].root ]),
        subExpressions[1].root,
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a reverse conditional manipulation with two sub-expressions.
    Ex: Convert ((NOT a) OR b) to (a -> b)
    @method reverseConditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseConditional = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionRootIsGivenOperatorName(subExpressions[0].root, OPERATOR_SYMBOLS.NOT);

    const firstVariable = subExpressions[0].root.children[0];
    const secondVariable = subExpressions[1].root;

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    const result = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ firstVariable, secondVariable ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a biconditional manipulation with two sub-expressions connected by a BICONDITIONAL operator.
    Ex: Convert (a <-> b) to ((a -> b) AND (b -> a))
    @method biconditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.biconditional = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.BICONDITIONAL);

    const result = new Operator(OPERATOR_SYMBOLS.AND, [
        new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ subExpressions[0].root, subExpressions[1].root ]),
        new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ subExpressions[1].root.clone(), subExpressions[0].root.clone() ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a reverse biconditional manipulation with two CONDITIONAL sub-expressions connected by an AND operator.
    Ex: Convert ((a -> b) AND (b -> a)) to (a <-> b)
    @method reverseBiconditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseBiconditional = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const firstSubExpression = subExpressions[0].root;
    const secondSubExpression = subExpressions[1].root;

    this._verifySubexpressionRootIsGivenOperatorName(firstSubExpression, OPERATOR_SYMBOLS.CONDITIONAL);
    this._verifySubexpressionRootIsGivenOperatorName(secondSubExpression, OPERATOR_SYMBOLS.CONDITIONAL);

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    // First sub-expression's left-child must be the same as the second sub-expression's right-child
    const firstSubExpressionLeftChild = firstSubExpression.children[0];
    const secondSubExpressionRightChild = secondSubExpression.children[1];

    // First sub-expression's right-child must be the same as the second sub-expression's left-child
    const firstSubExpressionRightChild = firstSubExpression.children[1];
    const secondSubExpressionLeftChild = secondSubExpression.children[0];

    if (!firstSubExpressionLeftChild.deepEquals(secondSubExpressionRightChild) ||
        !firstSubExpressionRightChild.deepEquals(secondSubExpressionLeftChild)) {
        throw new ManipulationError([ 'Selected terms do not match expectation.' ]);
    }

    const result = new Operator(OPERATOR_SYMBOLS.BICONDITIONAL, [
        firstSubExpressionLeftChild.clone(),
        firstSubExpressionRightChild.clone(),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a de Morgan's manipulation with two sub-expressions connected by an AND operator.
    Ex: Convert NOT(a AND b) to ((NOT a) OR (NOT b))
    @method deMorganAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.deMorganAnd = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);
    const subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.NOT);

    const result = new Operator(OPERATOR_SYMBOLS.OR, [
        new Operator(OPERATOR_SYMBOLS.NOT, [ subExpressions[0].root ]),
        new Operator(OPERATOR_SYMBOLS.NOT, [ subExpressions[1].root ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform a de Morgan's manipulation with two sub-expressions connected by an OR operator.
    Ex: Convert NOT(a OR b) to ((NOT a) AND (NOT b))
    @method deMorganOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.deMorganOr = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);
    const subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.NOT);

    const result = new Operator(OPERATOR_SYMBOLS.AND, [
        new Operator(OPERATOR_SYMBOLS.NOT, [ subExpressions[0].root ]),
        new Operator(OPERATOR_SYMBOLS.NOT, [ subExpressions[1].root ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform an AND distribution.
    Ex: Convert (a AND (b OR c)) to ((a AND b) OR (a AND c))
    @method andDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andDistribution = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(3, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionsOrdered = this.orderSubExpressionsForDistribution(expression, subExpressions);

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, [
        subExpressionsOrdered[1],
        subExpressionsOrdered[2],
    ]);
    const subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.AND);

    const result = new Operator(OPERATOR_SYMBOLS.OR, [
        new Operator(OPERATOR_SYMBOLS.AND, [ subExpressionsOrdered[0].root, subExpressionsOrdered[1].root ]),
        new Operator(OPERATOR_SYMBOLS.AND, [ subExpressionsOrdered[0].root.clone(), subExpressionsOrdered[2].root ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform an OR distribution.
    Ex: Convert (a OR (b AND c)) to ((a OR b) AND (a OR c))
    @method orDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orDistribution = function(expression, subExpressions) {
    this._numberOfExpectedSubExpressions(3, subExpressions); // eslint-disable-line no-magic-numbers

    const subExpressionsOrdered = this.orderSubExpressionsForDistribution(expression, subExpressions);

    const subExpressionParent = this._findCommonParentForBothSubExpressions(expression, [
        subExpressionsOrdered[1],
        subExpressionsOrdered[2],
    ]);
    const subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.OR);

    const result = new Operator(OPERATOR_SYMBOLS.AND, [
        new Operator(OPERATOR_SYMBOLS.OR, [ subExpressionsOrdered[0].root, subExpressionsOrdered[1].root ]),
        new Operator(OPERATOR_SYMBOLS.OR, [ subExpressionsOrdered[0].root.clone(), subExpressionsOrdered[2].root ]),
    ]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Verify that the sub-expressions' parent operator has the expected name.
    @method _verifySubexpressionsConnectedByGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionsConnectedByGivenOperatorName = function(operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError([
            `Selected terms should be connected by ${expectedOperatorString}, but are connected by ${operator.name}.`,
        ]);
    }
};

/**
    Verify that the sub-expressions' grandparent operator exists and has the expected name.
    @method _verifySubexpressionsGrandparentIsGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionsGrandparentIsGivenOperatorName = function(operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError([ 'Selected terms do not match expected format' ]);
    }
};

/**
    Verify that |operator|'s name stores the |expectedOperatorString|.
    @method _verifySubexpressionRootIsGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionRootIsGivenOperatorName = function(operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError([
            operator,
            ' does not match the expected format',
        ]);
    }
};

/**
    Return whether the operator's name stores |expectedOperatorString|.
    @method _operatorHasExpectedName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {Boolean} Whether the operator's name stores |expectedOperatorString|.
*/
ExpressionManipulation.prototype._operatorHasExpectedName = function(operator, expectedOperatorString) {
    return (operator && (operator.name === expectedOperatorString));
};

/**
    Return the other expression from |expressions| that isn't the given |constantString|.
    @method _findOtherExpressionWhenOneConstantIsGiven
    @private
    @param {Array} expressions Array of {Expression}. The expressions to search.
    @param {String} constantString The given constant is expected to exist, and we use this to find the other expression in |expressions|.
    @return {Expression} The other expression that isn't the expected expression.
*/
ExpressionManipulation.prototype._findOtherExpressionWhenOneConstantIsGiven = function(expressions, constantString) {

    // At least one sub-expression should be the |constantString|.
    const foundExpectedExpressions = expressions.filter(expression => expression.root.name === constantString);

    if (foundExpectedExpressions.length === 0) {
        throw new ManipulationError([ 'The selected term on the right-hand side should be: ', new Constant(constantString) ]);
    }

    // Find the other sub-expression besides the expected sub-expression.
    const foundExpectedExpression = foundExpectedExpressions[0];

    return expressions.filter(expression => expression !== foundExpectedExpression)[0];
};

/**
    One sub-expression should be the NOT of the other sub-expression. Throw error otherwise.
    @method _verifyOneSubExpressionIsNOTOfOtherSubExpression
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {Expression} The original sub-expression. Ex: a in (a v ¬a) ; or b in (b ∧ ¬b).
*/
ExpressionManipulation.prototype._verifyOneSubExpressionIsNOTOfOtherSubExpression = function(subExpressions) {
    let originalSubExpression = null;

    // At least one sub-expression's root should be a NOT operator.
    const subExpressionsStartingWithNot = subExpressions.filter(subExpression => subExpression.root.name === OPERATOR_SYMBOLS.NOT);

    let hadError = (subExpressionsStartingWithNot.length === 0);

    if (!hadError) {

        // One sub-expression should be the NOT of the other sub-expression.
        const oneSubExpressionIsNOTOfOther = subExpressionsStartingWithNot.some(subExpressionStartingWithNot =>
            subExpressions.some(subExpression => {
                let subExpressionIsNotOfOther = false;

                if (subExpressionStartingWithNot !== subExpression) {
                    const childOfNot = subExpressionStartingWithNot.root.children[0];

                    subExpressionIsNotOfOther = subExpression.root.deepEquals(childOfNot);
                }

                return subExpressionIsNotOfOther;
            })
        );

        subExpressionsStartingWithNot.forEach(subExpressionStartingWithNot =>
            subExpressions.forEach(subExpression => {
                if (subExpressionStartingWithNot !== subExpression) {
                    const childOfNot = subExpressionStartingWithNot.root.children[0];

                    if (subExpression.root.deepEquals(childOfNot)) {
                        originalSubExpression = subExpression;
                    }
                }
            })
        );

        hadError = !oneSubExpressionIsNOTOfOther;
    }

    if (hadError) {
        throw new ManipulationError([ 'The term on the right-hand side should be the NOT of the term on the left.' ]);
    }

    return originalSubExpression;
};

/**
    Checks that both {MathSymbol} are the same one.
    @method _verifyMathSymbolsAreTheSame
    @private
    @param {MathSymbol} firstMathSymbol The first {MathSymbol} to check if it is the same one as the second.
    @param {MathSymbol} secondMathSymbol The second {MathSymbol} to check if it is the same one as the first.
    @param {String} actualString The expression selected by the user in a {String}.
    @param {String} expectedString The expected expression in a {String}.
    @param {String} [errorMessage='Incorrect expression order.'] The error message to show. If not given a generic error message will be shown.
    @return {void}
*/
ExpressionManipulation.prototype._verifyMathSymbolsAreTheSame = function(firstMathSymbol, secondMathSymbol, actualString, expectedString,
                                                                        errorMessage = 'Incorrect expression order.') {
    const isCorrectOrder = firstMathSymbol.deepEquals(secondMathSymbol);
    const expectedMessage = `${expectedString}, but found ${actualString}.`;

    if (!isCorrectOrder) {
        throw new ManipulationError([ `Expected ${expectedMessage} ${errorMessage} May need to use the Commutative law first.` ]);
    }
};

/**
    Find a factorable common child from each sub-expression and not-factored children.
    Ex: If sub-expressions are [(a OR b), (a OR c)], then factored is |a| and not-factored are [b, c].
    @method _findFactoredAndNotFactoredSubExpressionChildren
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {FactoredChildAndNotFactoredChildren} The factored child and unfactored children.
*/
ExpressionManipulation.prototype._findFactoredAndNotFactoredSubExpressionChildren = function(subExpressions) {

    // At least one variable from each sub-expression should be the same variable.
    const matchingChildren = subExpressions[0].root.children.filter(child0 => {
        const matches = subExpressions[1].root.children.filter(child1 => child0.deepEquals(child1));

        return (matches.length > 0);
    });

    if (matchingChildren.length === 0) {
        throw new ManipulationError([ 'Selected terms do not have a common part.' ]);
    }
    const factoredChild = matchingChildren[0];

    // The factored child has to be on the left side in both sub-expressions.
    const isFactoredChildInLeftSide = subExpressions[0].root.children[0].deepEquals(subExpressions[1].root.children[0]);
    const notFactoredChildren = subExpressions.map(subExpression => {
        let notFactoredChild = subExpression.root.children[0];

        if (factoredChild.deepEquals(subExpression.root.children[0])) {
            notFactoredChild = subExpression.root.children[1];
        }
        return notFactoredChild;
    });

    if (!isFactoredChildInLeftSide) {

        // Find not factored sub-expression children.
        const actualExpressionString1 = `${subExpressions[0].print()}`;
        const factoredAndOther1 = new Operator(subExpressions[0].root.name, [ factoredChild, notFactoredChildren[0] ]);

        const actualExpressionString2 = `${subExpressions[1].print()}`;
        const factoredAndOther2 = new Operator(subExpressions[1].root.name, [ factoredChild, notFactoredChildren[1] ]);

        let expectedExpressionString1 = '';
        let expectedExpressionString2 = '';

        if (subExpressions[0] instanceof PropositionExpression) {
            expectedExpressionString1 = new PropositionExpression(factoredAndOther1).print();
            expectedExpressionString2 = new PropositionExpression(factoredAndOther2).print();
        }
        else if (subExpressions[0] instanceof DigitalExpression) {
            expectedExpressionString1 = new DigitalExpression(factoredAndOther1).print();
            expectedExpressionString2 = new DigitalExpression(factoredAndOther2).print();
        }

        this._verifyMathSymbolsAreTheSame(factoredChild, subExpressions[0].root.children[0],
            actualExpressionString1, expectedExpressionString1, 'The factored term must be on the left side in both sub-expressions.');
        this._verifyMathSymbolsAreTheSame(factoredChild, subExpressions[1].root.children[0],
            actualExpressionString2, expectedExpressionString2, 'The factored term must be on the left side in both sub-expressions.');
    }

    return new FactoredChildAndNotFactoredChildren(factoredChild, notFactoredChildren);
};

/**
    Find the parent of both sub-expressions.
    Throw error if sub-expressions do not have same parent within |expression|.
    @method _findCommonParentForBothSubExpressions
    @private
    @param {Expression} expression The expression containing each sub-expression.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {Operator} The parent of both sub-expressions.
*/
ExpressionManipulation.prototype._findCommonParentForBothSubExpressions = function(expression, subExpressions) {
    const subExpressionParents = subExpressions.map(subExpression => expression.parentOf(subExpression.root));

    if (!subExpressionParents[0] || !subExpressionParents[1] || (subExpressionParents[0] !== subExpressionParents[1])) {
        throw new ManipulationError([ 'Selected terms should be connected by one operator.' ]);
    }
    return subExpressionParents[0];
};

/**
    Throw error if root of each sub-expression is not an expected symbol.
    @method _expectedSymbolOfSubExpressionsRoot
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @param {String} expectedSymbol The expected symbol of each sub-expression's root.
    @return {void}
*/
ExpressionManipulation.prototype._expectedSymbolOfSubExpressionsRoot = function(subExpressions, expectedSymbol) {
    subExpressions.forEach(subExpression => {
        if (subExpression.root.name !== expectedSymbol) {
            throw new ManipulationError([ 'Selected term has wrong form: ', subExpression.root ]);
        }
    });
};

/**
    Throw an error if the number of sub-expressions is different than expected.
    @method _numberOfExpectedSubExpressions
    @private
    @param {Number} numberExpected The number of expected sub-expressions.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions.
    @return {void}
*/
ExpressionManipulation.prototype._numberOfExpectedSubExpressions = function(numberExpected, subExpressions) {
    if (subExpressions.length !== numberExpected) {
        throw new ManipulationError([ `Should have ${numberExpected} term(s) selected but have ${subExpressions.length}.` ]);
    }
};

/**
    Insert a manipulation result into an expression at the given operator.
    @method _insertManipulationResultInExpression
    @private
    @param {Expression} expression The expression to insert result.
    @param {Operator} operatorToReplace The operator in |expression| to replace with |result|.
    @param {MathSymbol} result The manipulation result to insert into |expression|.
    @return {void}
*/
ExpressionManipulation.prototype._insertManipulationResultInExpression = function(expression, operatorToReplace, result) {

    // Special case: |expression|'s root is the |operatorToFind|.
    if (expression.root.is(operatorToReplace)) {
        expression.root = result;
    }

    // Otherwise, set |result| to |subExpressions|'s parent.
    else {
        const parentOfOperatorToReplace = expression.parentOf(operatorToReplace);

        parentOfOperatorToReplace.children.forEach((child, index) => {

            // Replace the |child| of |parentOfOperatorToReplace| that matches |operatorToReplace|.
            if (child.is(operatorToReplace)) {
                parentOfOperatorToReplace.children[index] = result;
            }
        });
    }
};

/**
    Order the sub-expressions such that the two sub-expressions connected by a single-operator are at the end of the array.
    @method orderSubExpressionsForDistribution
    @private
    @param {Expression} expression The expression containing each sub-expression.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to order.
    @return {Array} Array of {Expression}. The ordered sub-expressions.
*/
ExpressionManipulation.prototype.orderSubExpressionsForDistribution = function(expression, subExpressions) {
    const subExpressionParents = subExpressions.map(subExpression => expression.parentOf(subExpression.root));

    let subExpressionsOrdered = [];

    // Index 0 and 1 have the same parent. Place index 0 and 1 at the end.
    if (subExpressionParents[0].is(subExpressionParents[1])) {
        subExpressionsOrdered = [
            subExpressions[2],
            subExpressions[0],
            subExpressions[1],
        ];
    }

    // Index 0 and 2 have the same parent. Place index 0 and 2 at the end.
    else if (subExpressionParents[0].is(subExpressionParents[2])) {
        subExpressionsOrdered = [
            subExpressions[1],
            subExpressions[0],
            subExpressions[2],
        ];
    }

    // Index 1 and 2 have the same parent. Place index 1 and 2 at the end.
    else if (subExpressionParents[1].is(subExpressionParents[2])) {
        subExpressionsOrdered = [
            subExpressions[0],
            subExpressions[1],
            subExpressions[2],
        ];
    }

    // No indices have the same parent.
    else {
        throw new ManipulationError([ 'Selected terms should be connected by one operator.' ]);
    }

    return subExpressionsOrdered;
};
