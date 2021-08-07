function DiscreteMathUtilities() {
    // Common Discrete Math symbols
    this.notSymbol = '¬';
    this.andSymbol = '∧';
    this.orSymbol = '∨';
    this.conditionalSymbol = '→';
    this.biconditionalSymbol = '↔';
    this.existentialQuantifier = '∃';
    this.universalQuantifier = '∀';
    this.unionSymbol = '&cup;';
    this.intersectSymbol = '&cap;';
    this.symmetricDifference = '⊕';

    /*
        Convert a |proposition| into an array of tokens, accounting for special cases with: parens and ¬.
        |proposition| is required and a string with the form of a proposition with truth values. Ex: ¬T∧¬T.

        Three examples:
        * For input 'p∧q', output is: ["p", "∧", "q"]
        * For input '¬¬¬¬¬p∧q', output is: ["¬", "p", "∧", "q"]
        * For input 'p∧(q∧r)', output is: ["p", "∧", "(q∧r)"]
    */
    this.tokenize = function(proposition) {
        var tokens = [];
        var parensCounter = 0;
        var notCounter = 0;
        for (var i = 0; i < proposition.length; i++) {
            var p = proposition[i];

            // Collect all items within parens into 1 token.
            if (p === '(') {
                var parensCounter = 1;
                i++;
                var subProposition = '(';

                for (; (i < proposition.length) && (parensCounter > 0); i++) {
                    var subP = proposition[i];

                    if (subP === '(') {
                        parensCounter++;
                    }
                    else if (subP === ')') {
                        parensCounter--;
                    }

                    subProposition += subP;
                }
                i--;

                if (parensCounter > 0) {
                    throw 'Expected closing parentheses.';
                }

                tokens.push(subProposition);
            }
            // Count consecutive ¬ symbols. If an odd number, then add a ¬ as a token. Otherwise, add no tokens.
            else if (p === this.notSymbol) {
                // Count number of ¬ symbols.
                var notCounter = 0;
                for (; (i < proposition.length) && (proposition[i] === this.notSymbol); i++) {
                    notCounter++;
                }
                i--;

                // If there was an odd number of ¬ symbols, then push a ¬.
                if ((notCounter % 2) === 1) {
                    tokens.push(this.notSymbol);
                }
            }
            else {
                tokens.push(p);
            }
        }

        return tokens;
    };

    /*
        Execute the given |proposition|, returning either T for true, or F for false.
        |proposition| is required and a string with the form of a proposition with truth values. Ex: ¬T∧¬T.
    */
    this.evaluateProposition = function(proposition) {
        // Remove whitespace from |proposition|.
        proposition = proposition.replace(/\s+/g, '');

        var tokens = this.tokenize(proposition);
        var leftSide = null;
        var rightSide = null;
        var operator = null;
        var self = this;

        /*
            For-loop used here instead of forEach because a ¬ token results in multiple tokens being consume at once,
            so |i| is moved forward outside the for-statement.
        */
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            // If token is a literal, then store literal in leftSide. If leftSide is full, then store in rightSide.
            if ((token === 'F') || (token === 'T')) {
                if (leftSide === null) {
                    leftSide = token === 'T';
                }
                else {
                    rightSide = token === 'T';
                }
            }
            // If token is a ¬, then apply ¬ to the next token.
            else if (token === this.notSymbol) {
                // Count and reduce ¬'s

                var evaluation = !self.evaluateProposition(tokens[i + 1]);
                i++;
                if (leftSide === null) {
                    leftSide = evaluation;
                }
                else {
                    rightSide = evaluation;
                }
            }
            // If token starts with parens, then token needs to be evaluated.
            else if (token[0] === '(') {
                var tokenWithOuterParensRemoved = token.substr(1, token.length - 2);
                var evaluation = self.evaluateProposition(tokenWithOuterParensRemoved);
                if (leftSide === null) {
                    leftSide = evaluation;
                }
                else {
                    rightSide = evaluation;
                }
            }
            // If token is an operator, then store the operator.
            else if ([ this.andSymbol, this.orSymbol, this.conditionalSymbol, this.biconditionalSymbol ].indexOf(token) !== -1) {
                if (operator === null) {
                    operator = token;
                }
                // Operator is already set. Cannot set another operator.
                else {
                    throw 'Multiple operators in a row.';
                }
            }
            // Unknown token, generate error.
            else {
                throw 'Unexpected symbol: ' + token;
            }

            // If rightSide is not null, then operation is ready to evaluate.
            if (rightSide !== null) {
                switch (operator) {
                    case this.andSymbol:
                        leftSide = leftSide && rightSide;
                        break;
                    case this.orSymbol:
                        leftSide = leftSide || rightSide;
                        break;
                    case this.conditionalSymbol:
                        leftSide = !leftSide || rightSide;
                        break;
                    case this.biconditionalSymbol:
                        leftSide = leftSide === rightSide;
                }

                operator = null;
                rightSide = null;
            }
        }

        if ((operator !== null) && (rightSide !== null)) {
            throw 'Unused operator and right-side value.';
        }
        else if (operator !== null) {
            throw 'Unused operator.';
        }
        else if (rightSide !== null) {
            throw 'Unused right-side value.';
        }

        return leftSide;
    };

    /*
        Return true if propsitions |a| and |b| are equivalent for given |variables|
        |a| and |b| are required and propositions. Ex: r∧q
        |variables| is required and an array of strings; each string representing a variable. Ex: ['r', 'q']
        |variableValues| is optional and an array of strings.
    */
    this.areLogicallyEquivalentPropositions = function(a, b, variables, variableValues) {
        // If |variableValues| exists, then make a copy.
        variableValues = !!variableValues ? variableValues.slice() : [];

        var areLogicallyEquivalent = true;

        // Base case: If each variable has a corresponding value, then evaluate |a| and |b|.
        if (variableValues.length === variables.length) {
            // Replace each variable with the respective variable value in |a| and |b|.
            variables.forEach(function(variable, index) {
                var variableValue = variableValues[index];
                var variableRegularExpression = new RegExp(variable, 'g');

                a = a.replace(variableRegularExpression, variableValue);
                b = b.replace(variableRegularExpression, variableValue);
            });

            // Try to evaluate |a|. If |a| has syntax errors, then catch the error.
            var aResult;
            try {
                aResult = this.evaluateProposition(a);
            }
            catch (error) {
                areLogicallyEquivalent = false;
                console.error(error);
            }

            var bResult = this.evaluateProposition(b);

            if (aResult !== bResult) {
                areLogicallyEquivalent = false;
            }
        }
        // Recursive case: Try adding a 'T' to |variableValues|, then try 'F'.
        else {
            variableValues.push('T');
            areLogicallyEquivalent = areLogicallyEquivalent && this.areLogicallyEquivalentPropositions(a, b, variables, variableValues);

            variableValues.pop();

            variableValues.push('F');
            areLogicallyEquivalent = areLogicallyEquivalent && this.areLogicallyEquivalentPropositions(a, b, variables, variableValues);
        }

        return areLogicallyEquivalent;
    };
}

module.exports = new DiscreteMathUtilities();
