/*
    Simple recursive descent parser with no backtracking that works for LL(1) grammars.
    Productions are implemented through calling functions when a variable is in the production
    and consuming a token when a terminal is seen.
*/
function Parser(PROPERTY_INDICES) {
    // The list of tokens from the tokenizer
    this.tokens = [];
    // The next token
    this.lookAhead = null;
    // Error message that will be returned after apply property
    this.errorMessage = '';
    // Tree like structure for use in property verification
    this.treeStructure = [];
    this.PROPERTY_INDICES = PROPERTY_INDICES;
}

// Parses general boolean equations, |tokens| - list of tokens generated by a tokenizer.
Parser.prototype.parse = function(tokens) {
    this.tokens = tokens.slice();
    this.lookAhead = this.tokens[0];
    this.errorMessage = '';
    this.treeStructure = [];
    var result = this.expression();
    if (this.tokens.length !== 0) {
        this.errorMessage = 'Unexpected symbol ' + this.lookAhead.sequence + ' found.';
    }
};

// Gets the next token that needs to be process from the list |tokens|
Parser.prototype.nextToken = function() {
    this.tokens.shift();
    if (this.tokens.length === 0) {
        this.lookAhead = {
            sequence: '',
            id: TERMINALS.EPSILON
        };
    }
    else {
        this.lookAhead = this.tokens[0];
    }
};

// Beginning of grammar definition, productions are commented in the functions
Parser.prototype.expression = function() {
    // expression -> term or_op
    return this.term() + this.or_op();
};

// or production
Parser.prototype.or_op = function() {
    // or_op -> OR term or_op
    if (this.lookAhead.id === TERMINALS.OR) {
        var tempLookAhead = this.lookAhead.sequence;
        this.nextToken();
        this.treeStructure.push({
            leaf: null,
            value: tempLookAhead
        });
        return tempLookAhead + this.term() + this.or_op();
    }
    // or_op -> EPSILON
    else {
        return '';
    }
};

// term production
Parser.prototype.term = function() {
    // term -> factor term_op
    return this.factor() + this.term_op();
};

// term_op production
Parser.prototype.term_op = function() {
    // term_op -> AND factor term_op
    if (this.lookAhead.id === TERMINALS.AND) {
        var tempLookAhead = this.lookAhead.sequence;
        this.nextToken();
        return tempLookAhead + this.factor() + this.term_op();
    }
    // term_op -> IMPLIES factor term_op
    else if (this.lookAhead.id === TERMINALS.IMPLIES) {
        var tempLookAhead = this.lookAhead.sequence;
        this.nextToken();
        this.treeStructure.push({
            leaf: null,
            value: tempLookAhead
        });
        return tempLookAhead + this.factor() + this.term_op();
    }
    // term_op -> EPSILON
    else {
        return '';
    }
};

// factor production
Parser.prototype.factor = function() {
    // factor -> LITERAL
    if (this.lookAhead.id === TERMINALS.LITERAL) {
        var tempLookAhead = this.lookAhead.sequence;
        this.nextToken();
        this.treeStructure.push({
            leaf: null,
            value: tempLookAhead
        });
        return tempLookAhead;
    }
    // factor-> LEFT_PAREN experession RIGHT_PAREN
    else if (this.lookAhead.id === TERMINALS.LEFT_PAREN) {
        var returnValue = this.lookAhead.sequence;
        this.nextToken();
        var topLevelSizeBefore = this.treeStructure.length;
        returnValue += this.expression();
        // expect closing bracket
        if (this.lookAhead.id !== TERMINALS.RIGHT_PAREN) {
            this.errorMessage = 'Closing paren expected, found ' + this.lookAhead.sequence + '.';
            return '';
        }
        returnValue += this.lookAhead.sequence;
        this.nextToken();
        if ((this.lookAhead.id === TERMINALS.UNKNOWN) && (this.lookAhead.sequence === '\'')) {
            returnValue += this.lookAhead.sequence;
            this.nextToken();
        }
        // This removes factors that the expression we just found are made up of
        // We want the top level to be literals and expressions containing literals, but if a literal is in an expression we dont want that literal
        // to be in the top level.
        // ex. a(b + c) top level is:  a , (b + c)
        var factorsToRemove = this.treeStructure.length - topLevelSizeBefore;
        var leaf = [];
        for (var i = (this.treeStructure.length - factorsToRemove); i < this.treeStructure.length; i++) {
            leaf.push(this.treeStructure[i]);
        }
        this.treeStructure.splice(this.treeStructure.length - factorsToRemove, factorsToRemove);
        this.treeStructure.push({
            leaf: leaf,
            value: returnValue
        });
        return returnValue;
    }
    else {
        this.errorMessage = 'Unexpected symbol ' + this.lookAhead.sequence + ' found.';
        return '';
    }
};

/*
    Takes in a list of |tokens| from the tokenizer, the |property| - integer - to be applied, its |direction| - integer, and the |replacementVariable| - string - if needed.
    The parser will ensure will call the proper parsing function which will generate a tree that makes processing easier. The parser will then apply the rules of the
    property generating the new equation with the property applied. Returns an object containing the |newEquation| and |errorMessage|. |errorMessage| will be empty if everything went
    according to plan.
*/
Parser.prototype.parseProperty = function(property, tokens, direction, replacementVariable) {
    this.tokens = tokens.slice();
    this.lookAhead = this.tokens[0];
    this.errorMessage = '';
    this.treeStructure = [];
    var result;
    var newEquation;
    switch (property) {
        case this.PROPERTY_INDICES.DISTRIBUTIVE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.distributiveForward();
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                // Need to find index of the or symbol so that we can compare and find what is similar
                var orIndex;
                for (var i = 0; i < this.treeStructure.length; i++) {
                    if (this.treeStructure[i].value === SYMBOLS.OR) {
                        orIndex = i;
                        break;
                    }
                }
                // Don't know what the terms have in common, try all combinations
                var commonGuessIndex = 0;
                var commonFoundIndex = -1;
                var found = false;
                for (; commonGuessIndex < orIndex; commonGuessIndex++) {
                    for (var i = orIndex + 1; i < this.treeStructure.length; i++) {
                        if (this.treeStructure[i].value === this.treeStructure[commonGuessIndex].value) {
                            commonFoundIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                // Found the common term, factor it out
                if (found) {
                    newEquation = this.treeStructure[commonGuessIndex].value + SYMBOLS.LEFT_PAREN;
                    var termsLeft = 0;
                    for (var i = 0; i < orIndex; i++) {
                        if (i === commonGuessIndex) {
                            continue;
                        }
                        termsLeft++;
                        newEquation += this.treeStructure[i].value;
                    }
                    // No terms left, put a 1
                    if (termsLeft === 0) {
                        newEquation += SYMBOLS.TRUE;
                    }
                    newEquation += SYMBOLS.OR;
                    termsLeft = 0;
                    for (var i = orIndex + 1; i < this.treeStructure.length; i++) {
                        if (i === commonFoundIndex) {
                            continue;
                        }
                        termsLeft++;
                        newEquation += this.treeStructure[i].value;
                    }
                    // No terms left, put a 1
                    if (termsLeft === 0) {
                        newEquation += SYMBOLS.TRUE;
                    }
                    newEquation += SYMBOLS.RIGHT_PAREN;
                }
                // Error nothing to factor out
                else {
                    newEquation = '';
                    this.errorMessage = 'Nothing in common found.';
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.distributiveReverse();
                newEquation = '';
                if (!this.errorMessage) {
                    if (this.treeStructure.length > 1) {
                        var leafToDistributeOver;
                        var termToDistribute = '';
                        for (var i = 0; i < this.treeStructure.length; i++) {
                            if (this.treeStructure[i].value[0] === SYMBOLS.LEFT_PAREN) {
                                leafToDistributeOver = this.treeStructure[i];
                            }
                            else {
                                termToDistribute += this.treeStructure[i].value;
                            }
                        }
                        var doneForThisTerm = false;
                        for (var i = 0; i < leafToDistributeOver.leaf.length; i++) {
                            if ((leafToDistributeOver.leaf[i].value !== SYMBOLS.OR) && (leafToDistributeOver.leaf[i].value !== SYMBOLS.AND) && !doneForThisTerm) {
                                newEquation += termToDistribute + leafToDistributeOver.leaf[i].value;
                                doneForThisTerm = true;
                            }
                            else if (leafToDistributeOver.leaf[i].value === SYMBOLS.OR) {
                                newEquation += leafToDistributeOver.leaf[i].value;
                                doneForThisTerm = false;
                            }
                            // Ignore ands, convert them all to implicit
                            else if (leafToDistributeOver.leaf[i].value !== SYMBOLS.AND) {
                                newEquation += leafToDistributeOver.leaf[i].value;
                            }

                        }
                    }
                    else {
                        this.errorMessage = 'Perhaps wrong distribution selected.';
                    }
                }
            }
            break;
        case this.PROPERTY_INDICES.DISTRIBUTIVE_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.distributiveOrForward();
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                var commonGuessIndex = 0;
                var commonFoundIndex = -1;
                var found = false;
                // Don't know what the terms have in common, try all combinations
                for (; commonGuessIndex < this.treeStructure[0].leaf.length; commonGuessIndex++) {
                    for (var i = 0; i < this.treeStructure[1].leaf.length; i++) {
                        if ((this.treeStructure[0].leaf[commonGuessIndex].value === this.treeStructure[1].leaf[i].value) && (this.treeStructure[0].leaf[commonGuessIndex].value !== SYMBOLS.OR)) {
                            commonFoundIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                /*
                    Found a term that the two terms have in common
                    Pull that term out to the front
                    Go through each of the terms and add them to the equation if they are not the factored out term
                    Add an AND in between the two new terms
                */
                if (found) {
                    newEquation = this.treeStructure[0].leaf[commonGuessIndex].value + SYMBOLS.OR + SYMBOLS.LEFT_PAREN;
                    var termsLeft = 0;
                    var firstLiteral = true;
                    for (var i = 0; i < this.treeStructure[0].leaf.length; i++) {
                        if ((i === commonGuessIndex) || (this.treeStructure[0].leaf[i].value === SYMBOLS.OR)) {
                            continue;
                        }
                        termsLeft++;
                        if (!firstLiteral) {
                            newEquation += SYMBOLS.AND + this.treeStructure[0].leaf[i].value;
                        }
                        else {
                            newEquation += this.treeStructure[0].leaf[i].value;
                        }
                        firstLiteral = false;
                    }
                    // No terms left, put a 1
                    if (termsLeft === 0) {
                        newEquation += SYMBOLS.TRUE;
                    }
                    newEquation += SYMBOLS.AND;
                    termsLeft = 0;
                    firstLiteral = true;
                    for (var i = 0; i < this.treeStructure[1].leaf.length; i++) {
                        if ((i === commonFoundIndex) || (this.treeStructure[0].leaf[i].value === SYMBOLS.OR)) {
                            continue;
                        }
                        termsLeft++;
                        if (!firstLiteral) {
                            newEquation += SYMBOLS.AND + this.treeStructure[1].leaf[i].value;
                        }
                        else {
                            newEquation += this.treeStructure[1].leaf[i].value;
                        }
                        firstLiteral = false;
                    }
                    // No terms left, put a 1
                    if (termsLeft === 0) {
                        newEquation += SYMBOLS.TRUE;
                    }
                    newEquation += SYMBOLS.RIGHT_PAREN;
                }
                // Error nothing to factor out
                else {
                    newEquation = '';
                    this.errorMessage = 'Nothing in common found.';
                }
            }
            /*
                Given something like this a+bc
                Find the OR the '+'
                The term before the + is what is being distributed
                add the term to all other terms after the OR and add parenthesis
            */
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.distributiveReverse();
                newEquation = '';
                if (!this.errorMessage) {
                    if (this.treeStructure.length === 1) {
                        this.treeStructure = this.treeStructure[0].leaf;
                    }
                    for (var i = 0; i < this.treeStructure.length; i++) {
                        if (this.treeStructure[i].value === SYMBOLS.LEFT_PAREN) {
                            leafToDistributeOver = this.treeStructure[i];
                        }
                        else {
                            termToDistribute += this.treeStructure[i].value;
                        }
                    }
                    var orIndex;
                    var orIndexFound = false;
                    for (orIndex = 0; orIndex < this.treeStructure.length; orIndex++) {
                        if (this.treeStructure[orIndex].value === SYMBOLS.OR) {
                            orIndexFound = true;
                            break;
                        }
                    }
                    if (!orIndexFound) {
                        newEquation = '';
                        this.errorMessage = 'Error: Variables were not selected correctly for property.';
                    }
                    else {
                        var leafToDistributeOver = this.treeStructure[orIndex - 1];
                        newEquation = '';
                        for (var i = orIndex + 1; i < this.treeStructure.length; i++) {
                            newEquation += '(' + leafToDistributeOver.value + SYMBOLS.OR + this.treeStructure[i].value + ')';
                        }
                        newEquation = '(' + newEquation + ')';
                    }
                }
            }
            break;
        case this.PROPERTY_INDICES.DEMORGAN_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.expression();
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                newEquation = SYMBOLS.LEFT_PAREN + this.treeStructure[0].value + SYMBOLS.NOT + SYMBOLS.OR + this.treeStructure[1].value + SYMBOLS.NOT + SYMBOLS.RIGHT_PAREN;

            }
            break;
        case this.PROPERTY_INDICES.DEMORGAN_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.expression();
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                if (this.treeStructure.length > 3) {
                    // Find where the OR is in the treeStructure
                    var orIndex;
                    for (orIndex = 0; orIndex < this.treeStructure.length; orIndex++) {
                        if (this.treeStructure[orIndex].value === SYMBOLS.OR) {
                            break;
                        }
                    }
                    // All terms before OR
                    var firstTerm = '';
                    // All terms after OR
                    var secondTerm = '';
                    for (var i = 0; i < orIndex; i++) {
                        firstTerm += this.treeStructure[i].value;
                    }
                    for (var i = orIndex + 1; i < this.treeStructure.length; i++) {
                        secondTerm += this.treeStructure[i].value;
                    }
                    newEquation = '((' + firstTerm + ')' + SYMBOLS.NOT + '(' + secondTerm + ')' + SYMBOLS.NOT + ')';
                }
                else {
                    newEquation = SYMBOLS.LEFT_PAREN + this.treeStructure[0].value + SYMBOLS.NOT + this.treeStructure[2].value + SYMBOLS.NOT + SYMBOLS.RIGHT_PAREN;
                }
            }
            break;
        case this.PROPERTY_INDICES.DOUBLE_NEG:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.expression();
                if ((this.treeStructure.length === 1) && (this.treeStructure[0].leaf !== null)) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                var negatedResult = this.treeStructure[0].value.substr(0, this.treeStructure[0].value.length - 2);
                // See if we need parens
                var negLess = negatedResult.replace(/'/g, '');
                if (negLess.length > 1) {
                    newEquation = SYMBOLS.LEFT_PAREN + negatedResult + SYMBOLS.RIGHT_PAREN;
                }
                else {
                    newEquation = negatedResult;
                }
            }
            break;
        case this.PROPERTY_INDICES.CONDITIONAL:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.conditionalForward();
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                if (this.treeStructure.length > 3) {
                    var impliesIndex;
                    for (impliesIndex = 0; impliesIndex < this.treeStructure.length; impliesIndex++) {
                        if (this.treeStructure[impliesIndex].value === DISCRETE_SYMBOLS.IMPLIES) {
                            break;
                        }
                    }
                    var firstTerm = '', secondTerm = '';
                    for (var i = 0; i < impliesIndex; i++) {
                        firstTerm += this.treeStructure[i].value;
                    }
                    for (var i = impliesIndex + 1; i < this.treeStructure.length; i++) {
                        secondTerm += this.treeStructure[i].value;
                    }
                    newEquation = '((' + firstTerm + ')' + SYMBOLS.NOT + SYMBOLS.OR + '(' + secondTerm + '))';
                }
                else {
                    newEquation = SYMBOLS.LEFT_PAREN + this.treeStructure[0].value + SYMBOLS.NOT + SYMBOLS.OR + this.treeStructure[2].value + SYMBOLS.RIGHT_PAREN;
                }
            }
            break;
        case this.PROPERTY_INDICES.IDENTITY_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.identityAndForward();
                var oneFound = false;
                newEquation = '';
                if (!this.errorMessage) {
                    // Handles paren case
                    if (this.treeStructure.length === 1) {
                        for (var i = 0; i < this.treeStructure[0].leaf.length; i++) {
                            if ((this.treeStructure[0].leaf[i].value === SYMBOLS.TRUE) || (this.treeStructure[0].leaf[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN))) {
                                // There are multiple 1s
                                if (oneFound) {
                                    newEquation += this.treeStructure[0].leaf[i].value;
                                }
                                oneFound = true;
                                continue;
                            }
                            else {
                                newEquation += this.treeStructure[0].leaf[i].value;
                            }
                        }
                    }
                    // Handles non paren case
                    else {
                        for (var i = 0; i < this.treeStructure.length; i++) {
                            if ((this.treeStructure[i].value === SYMBOLS.TRUE) || (this.treeStructure[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN))) {
                                // There are multiple 1s
                                if (oneFound) {
                                    newEquation += this.treeStructure[i].value;
                                }
                                oneFound = true;
                                continue;
                            }
                            else {
                                newEquation += this.treeStructure[i].value;
                            }
                        }
                    }
                    if (!oneFound) {
                        this.errorMessage = 'No ' + SYMBOLS.TRUE + ' was selected.';
                    }
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.identityAndReverse();
                newEquation = '';
                for (var i = 0; i < this.treeStructure.length; i++) {
                    newEquation += this.treeStructure[i].value;
                }
                newEquation += SYMBOLS.AND + SYMBOLS.TRUE;
            }
            break;
        case this.PROPERTY_INDICES.IDENTITY_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.identityOrForward();
                newEquation = '';
                var needParens = false;
                var zeroFound = false;
                if (!this.errorMessage) {
                    // Handles the paren case
                    if (this.treeStructure.length === 1) {
                        for (var i = 0; i < this.treeStructure[0].leaf.length; i++) {
                            if (this.treeStructure[0].leaf[i].value === SYMBOLS.FALSE) {
                                // There are multiple 0s
                                if (zeroFound) {
                                    newEquation += this.treeStructure[0].leaf[i].value;
                                }
                                zeroFound = true;
                                continue;
                            }
                            if (this.treeStructure[0].leaf[i].value === SYMBOLS.OR) {
                                needParens = true;
                                // Exclude unneeded  + 's
                                if (!((i > 0 && this.treeStructure[0].leaf[i - 1].value === SYMBOLS.FALSE) || ((i < this.treeStructure[0].leaf.length - 1) && (this.treeStructure[0].leaf[i + 1].value === SYMBOLS.FALSE)))) {
                                    newEquation += this.treeStructure[0].leaf[i].value;
                                }
                            }
                            else {
                                newEquation += this.treeStructure[0].leaf[i].value;
                            }
                        }
                    }
                    // Handles the case without parens
                    else {
                        for (var i = 0; i < this.treeStructure.length; i++) {
                            if (this.treeStructure[i].value === SYMBOLS.FALSE) {
                                // There are multiple 0s
                                if (zeroFound) {
                                    newEquation += this.treeStructure[i].value;
                                }
                                zeroFound = true;
                                continue;
                            }
                            if (this.treeStructure[i].value === SYMBOLS.OR) {
                                needParens = true;
                                if (!((i > 0 && this.treeStructure[i - 1].value === SYMBOLS.FALSE) || ((i < this.treeStructure.length - 1) && (this.treeStructure[i + 1].value === SYMBOLS.FALSE)))) {
                                    newEquation += this.treeStructure[i].value;
                                }
                            }
                            else {
                                newEquation += this.treeStructure[i].value;
                            }
                        }
                    }
                    if (needParens) {
                        newEquation = SYMBOLS.LEFT_PAREN + newEquation + SYMBOLS.RIGHT_PAREN;
                    }
                    if ((newEquation.length > 0) && (newEquation[0] === SYMBOLS.OR)) {
                        newEquation = newEquation.substr(1);
                    }
                    if ((newEquation.length > 0) && (newEquation[newEquation.length - 1] === SYMBOLS.OR)) {
                        newEquation = newEquation.substr(0, newEquation.length - 1);
                    }
                    if (!zeroFound) {
                        this.errorMessage = 'No ' + SYMBOLS.FALSE + ' was selected.';
                    }
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.identityOrReverse();
                newEquation = SYMBOLS.LEFT_PAREN;
                for (var i = 0; i < this.treeStructure.length; i++) {
                    newEquation += this.treeStructure[i].value;
                }
                newEquation += ' ' + SYMBOLS.OR + ' ' + SYMBOLS.FALSE + SYMBOLS.RIGHT_PAREN;
            }
            break;
        case this.PROPERTY_INDICES.COMPLEMENT_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.complementAndForward();
                var addParens = false;
                if (this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                    addParens = true;
                }
                // One of the factors is the complement of the other
                if ((this.treeStructure.length === 2) && (
                    ((this.treeStructure[0].value === this.treeStructure[1].value.substr(0, this.treeStructure[1].value.length - 1)) && (this.treeStructure[1].value[this.treeStructure[1].value.length - 1] === SYMBOLS.NOT)) || ((this.treeStructure[1].value === this.treeStructure[0].value.substr(0, this.treeStructure[0].value.length - 1)) && (this.treeStructure[0].value[this.treeStructure[0].value.length - 1] === SYMBOLS.NOT)))) {
                    if (addParens) {
                        newEquation = '(' + SYMBOLS.FALSE + ')';
                    }
                    else {
                        newEquation = SYMBOLS.FALSE;
                    }
                }
                else {
                    this.errorMessage = 'The terms were not complements of each other.';
                }
            }
            break;
        case this.PROPERTY_INDICES.COMPLEMENT_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.complementOrForward();
                var addParens = false;
                if (this.treeStructure && this.treeStructure.length === 1) {
                    this.treeStructure = this.treeStructure[0].leaf;
                    addParens = true;
                }
                // One of the factors is the complement of the other
                if (this.treeStructure && (this.treeStructure.length === 3) && (
                    ((this.treeStructure[0].value === this.treeStructure[2].value.substr(0, this.treeStructure[2].value.length - 1)) && (this.treeStructure[2].value[this.treeStructure[2].value.length - 1] === SYMBOLS.NOT)) || ((this.treeStructure[2].value === this.treeStructure[0].value.substr(0, this.treeStructure[0].value.length - 1)) && (this.treeStructure[0].value[this.treeStructure[0].value.length - 1] === SYMBOLS.NOT)))) {
                    if (addParens) {
                        newEquation = '(' + SYMBOLS.TRUE + ')';
                    }
                    else {
                        newEquation = SYMBOLS.TRUE;
                    }
                }
                else {
                    this.errorMessage = 'The terms were not complements of each other.';
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.complementOrReverse();
                newEquation = '';
                var oneFound = false;
                for (var i = 0; i < this.treeStructure.length; i++) {
                    if ((this.treeStructure[i].value === SYMBOLS.TRUE) || (this.treeStructure[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN))) {
                        newEquation += SYMBOLS.LEFT_PAREN + replacementVariable + SYMBOLS.OR + replacementVariable + SYMBOLS.NOT + SYMBOLS.RIGHT_PAREN;
                        oneFound = true;
                    }
                    else {
                        newEquation += this.treeStructure[i].value;
                    }
                }
                if (!oneFound) {
                    this.errorMessage = 'No ' + SYMBOLS.TRUE + ' was selected.';
                    newEquation = '';
                }

            }
            break;
        case this.PROPERTY_INDICES.COMPLEMENT_TRUE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.expression();
                if ((this.treeStructure.length === 1) && (this.treeStructure[0].leaf !== null)) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                newEquation = SYMBOLS.LEFT_PAREN + SYMBOLS.FALSE + SYMBOLS.RIGHT_PAREN;
            }
            break;
        case this.PROPERTY_INDICES.COMPLEMENT_FALSE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.expression();
                if ((this.treeStructure.length === 1) && (this.treeStructure[0].leaf !== null)) {
                    this.treeStructure = this.treeStructure[0].leaf;
                }
                newEquation = SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN;
            }
            break;
        case this.PROPERTY_INDICES.ANNIHILATOR_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.annihilatorAndForward();
                var zeroFound = false;
                for (var i = 0; i < this.treeStructure.length; i++) {
                    if ((this.treeStructure[i].value === SYMBOLS.FALSE) || (this.treeStructure[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.FALSE + SYMBOLS.RIGHT_PAREN))) {
                        zeroFound = true;
                        break;
                    }
                }
                if (!zeroFound) {
                    this.errorMessage = 'No ' + SYMBOLS.FALSE + ' was selected.';
                }
                else {
                    newEquation = SYMBOLS.FALSE;
                }
            }
            break;
        case this.PROPERTY_INDICES.ANNIHILATOR_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.annihilatorOrForward();
                newEquation = '';
                var oneFound = false;
                // Handles the paren case
                if (this.treeStructure.length === 1) {
                    for (var i = 0; i < this.treeStructure[0].leaf.length; i++) {
                        if ((this.treeStructure[0].leaf[i].value === SYMBOLS.TRUE) || (this.treeStructure[0].leaf[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN))) {
                            oneFound = true;
                            continue;
                        }
                    }
                }
                // Handles the case without parens
                else {
                    for (var i = 0; i < this.treeStructure.length; i++) {
                        if ((this.treeStructure[i].value === SYMBOLS.TRUE) || (this.treeStructure[i].value === (SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN))) {
                            oneFound = true;
                            continue;
                        }
                    }
                }
                if (!oneFound) {
                    this.errorMessage = 'No ' + SYMBOLS.TRUE + ' was selected.';
                }
                else {
                    if (this.treeStructure.length === 1) {
                        newEquation = SYMBOLS.LEFT_PAREN + SYMBOLS.TRUE + SYMBOLS.RIGHT_PAREN;
                    }
                    else {
                        newEquation = SYMBOLS.TRUE;
                    }

                }
            }
            break;
        case this.PROPERTY_INDICES.IDEMPOTENCE_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                result = this.idempotenceOrForward();
                newEquation = '';
                var orIndex;
                for (var i = 0; i < this.treeStructure.length; i++) {
                    if (this.treeStructure[i].value === SYMBOLS.OR) {
                        orIndex = i;
                        break;
                    }
                }
                if ((orIndex + orIndex) >= this.treeStructure.length) {
                    this.errorMessage = 'The terms are not of equal length.';
                }
                else {
                    for (var i = 0; i < orIndex; i++) {
                        if ((i + orIndex + 1) >= this.treeStructure.length) {
                            this.errorMessage = 'The terms are not of equal length.';
                            break;
                        }
                        if (this.treeStructure[i].value === this.treeStructure[i + orIndex + 1].value) {
                            if (this.treeStructure[i].value != SYMBOLS.AND) {
                                newEquation += this.treeStructure[i].value;
                            }
                        }
                        else {
                            this.errorMessage = this.treeStructure[i].value + ' did not match ' + this.treeStructure[i + orIndex + 1].value + '.';
                        }
                    }
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                result = this.idempotenceOrReverse();
                newEquation = '';
                if (this.treeStructure.length > 0) {
                    for (var i = 0; i < this.treeStructure.length; i++) {
                        newEquation += this.treeStructure[i].value;
                    }
                    newEquation = newEquation + '+' + newEquation;
                }
                else {
                    this.errorMessage = 'Variables were not selected correctly for property.';
                }
            }
    }
    if (this.tokens.length !== 0) {
        this.errorMessage = 'Unexpected symbol ' + this.lookAhead.sequence + ' found.';
    }
    else if (newEquation) {
        this.errorMessage = '';
    }

    return {
        newEquation: newEquation,
        errorMessage: this.errorMessage
    };
};

/*
    The following functions use the grammar parse function that makes sense according to what the given equation is suppose to look like.
    Some extra bookkeeping may be necessary.
*/

// This property is expecting an expression
Parser.prototype.conditionalForward = function() {
    return this.expression();
};

// This property is expecting an expression
Parser.prototype.distributiveForward = function() {
    return this.expression();
};

// This property is expecting an expression
Parser.prototype.distributiveOrForward = function() {
    return this.expression();
};

// This property is expecting a term
Parser.prototype.distributiveReverse = function() {
    return this.expression();
};

// This property is expecting a term
Parser.prototype.identityAndForward = function() {
    return this.term();
};

// This property is expecting a term
Parser.prototype.identityAndReverse = function() {
    return this.term();
};

// This property is expecting an expression
Parser.prototype.identityOrForward = function() {
    return this.expression();
};

// This property is expecting a term
Parser.prototype.identityOrReverse = function() {
    return this.term();
};

// This property is expecting a term
Parser.prototype.complementAndForward = function() {
    return this.term();
};

// This property is expecting an or term, need to fix up structure
Parser.prototype.complementOrForward = function() {
    var returnValue = this.factor();
    if (this.lookAhead.id !== TERMINALS.OR) {
        this.errorMessage = 'Expected symbol ' + SYMBOLS.OR + ' , found ' + this.lookAhead.sequence + ' instead.';
        return '';
    }
    this.treeStructure.push({
        leaf: null,
        value: SYMBOLS.OR
    });
    returnValue += this.lookAhead.sequence;
    this.nextToken();
    returnValue += this.factor();
    return returnValue;
};

// This property is expecting a term
Parser.prototype.complementOrReverse = function() {
    return this.term();
};

// This property is expecting a term
Parser.prototype.annihilatorAndForward = function() {
    return this.term();
};

// This property is expecting an expression
Parser.prototype.annihilatorOrForward = function() {
    return this.expression();
};

// This property is expecting an expression
Parser.prototype.idempotenceOrForward = function() {
    return this.expression();
};

// This property is expecting a term
Parser.prototype.idempotenceOrReverse = function() {
    return this.term();
};
