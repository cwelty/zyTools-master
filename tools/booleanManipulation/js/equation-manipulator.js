 /*
    Takes in the property type, the equation to manipulate, the terms that the user selected, and the direction that the property is being applied, forward or reverse
    this will break down the selected terms into a subEquation that the parser knows how to handle, the parser will attempt to apply the passed in property. The parser will pass
    back the newEquation and an errorMessage if there is one.
    property - integer, the property selected by the user
    equation - string, the current equation
    selectedTerms - list of objects with an integer startIndex and a string completeTerm
    direction - integer, the direction selected by the user
    replacementVariable - string, the replacement variable chosen by the user
    tokenizer - object, the tokenizer for building equations
    parser - object. the parser for manipulating equation
*/
 function applyProperty(property, equation, selectedTerms, direction, replacementVariable, tokenizer, parser, discreteMath, PROPERTY_INDICES) {
     var newEquation = '';
     var error;
     var specificErrorMessage = '';
     switch (property) {
        case PROPERTY_INDICES.DISTRIBUTIVE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 2 terms
                if ((selectedTerms.length !== 2) || (selectedTerms[0].variables.length > 2) || (selectedTerms[1].variables.length > 2)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    if (discreteMath) {
                        specificErrorMessage = 'Expected common variable in each term, such as ' + toDiscreteMath(('ab' + SYMBOLS.OR + 'ac')) + ' or ' + toDiscreteMath(('ba' + SYMBOLS.OR + 'ca')) + '.';
                    }
                    else {
                        specificErrorMessage = 'Expected common variable in each term, such as (ab ' + SYMBOLS.OR + ' ac) or (ba ' + SYMBOLS.OR + ' ca).';
                    }
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var expressionInTheMiddle = equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] === SYMBOLS.LEFT_PAREN;
                var noOrInMiddle = equation[selectedTerms[1].startIndex - 1] !== SYMBOLS.OR;
                var firstTermIsPartial = isTermPartiallySelected(selectedTerms[0], SYMBOLS);
                var secondTermIsPartial = isTermPartiallySelected(selectedTerms[1], SYMBOLS);
                if (firstTermIsPartial || secondTermIsPartial || noOrInMiddle || expressionInTheMiddle) {
                    if (discreteMath) {
                        specificErrorMessage = 'Expected common variable in each term, such as ' + toDiscreteMath(('ab' + SYMBOLS.OR + 'ac')) + ' or ' + toDiscreteMath(('ba' + SYMBOLS.OR + 'ca')) + '.';
                    }
                    else {
                        specificErrorMessage = 'Expected common variable in each term, such as (ab ' + SYMBOLS.OR + ' ac) or (ba ' + SYMBOLS.OR + ' ca).';
                    }
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DISTRIBUTIVE, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {

                // Must have 3 terms
                if (selectedTerms.length !== 3) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[2].startIndex + selectedTerms[2].completeTerm.length, true);

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var firstTermIsPartial = isTermPartiallySelected(selectedTerms[0], SYMBOLS);
                var secondTermIsPartial = isTermPartiallySelected(selectedTerms[1], SYMBOLS);
                if (firstTermIsPartial || secondTermIsPartial) {
                    specificErrorMessage = 'Terms were partially selected please try again and select whole terms.';
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DISTRIBUTIVE, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.DISTRIBUTIVE_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 2 terms
                if ((selectedTerms.length !== 2) || (selectedTerms[0].variables.length > 2) || (selectedTerms[1].variables.length > 2)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    if (discreteMath) {
                        specificErrorMessage = 'Expected common variable in each term, such as ' + toDiscreteMath(('(a' + SYMBOLS.OR + 'b)' + '(a' + SYMBOLS.OR + 'c)')) + ' or ' + toDiscreteMath(('(b' + SYMBOLS.OR + 'a)' + '(c' + SYMBOLS.OR + 'a)')) + '.';
                    }
                    else {
                        specificErrorMessage = 'Expected common variable in each term, such as ((a' + SYMBOLS.OR + 'b)' + '(a' + SYMBOLS.OR + 'c)) or ((b' + SYMBOLS.OR + 'a)' + '(c' + SYMBOLS.OR + 'a)).';
                    }
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var expressionInTheMiddle = equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] === SYMBOLS.LEFT_PAREN;
                var noAndIntheMiddle = equation[selectedTerms[1].startIndex - 1] !== SYMBOLS.LEFT_PAREN || equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] !== SYMBOLS.RIGHT_PAREN;
                var firstTermIsPartial = isTermPartiallySelected(selectedTerms[0], SYMBOLS);
                var secondTermIsPartial = isTermPartiallySelected(selectedTerms[1], SYMBOLS);
                if (firstTermIsPartial || secondTermIsPartial || noAndIntheMiddle || expressionInTheMiddle) {
                    if (discreteMath) {
                        specificErrorMessage = 'Expected common variable in each term, such as ' + toDiscreteMath(('(a' + SYMBOLS.OR + 'b)' + '(a' + SYMBOLS.OR + 'c)')) + ' or ' + toDiscreteMath(('(b' + SYMBOLS.OR + 'a)' + '(c' + SYMBOLS.OR + 'a)')) + '.';
                    }
                    else {
                        specificErrorMessage = 'Expected common variable in each term, such as ((a' + SYMBOLS.OR + 'b)' + '(a' + SYMBOLS.OR + 'c)) or ((b' + SYMBOLS.OR + 'a)' + '(c' + SYMBOLS.OR + 'a)).';
                    }
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DISTRIBUTIVE_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {

                // Must have 3 terms
                if (selectedTerms.length !== 3) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[2].startIndex + selectedTerms[2].completeTerm.length, true);

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var firstTermIsPartial = isTermPartiallySelected(selectedTerms[0], SYMBOLS);
                if (firstTermIsPartial) {
                    specificErrorMessage = 'Terms were partially selected please try again and select whole terms.';
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DISTRIBUTIVE_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.DEMORGAN_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 2 terms
                if ((selectedTerms.length !== 2) || (selectedTerms[0].variables.length > 2) || (selectedTerms[1].variables.length > 2)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                var missingParen = false;
                // Check if missing parens
                if (((equationParts.subEquation.indexOf('(') !== -1) && (equationParts.subEquation.indexOf(')') === -1)) || ((equationParts.subEquation.indexOf('(') === -1) && (equationParts.subEquation.indexOf(')') !== -1))) {
                    missingParen = true;
                }

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;
                var missingNot = (equationParts.postEquation.length > 0) && (equationParts.postEquation[0] !== SYMBOLS.NOT) && (equationParts.postEquation[1] !== SYMBOLS.NOT);
                var scanIndex = selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length;
                var missingAnd = false;

                for (; scanIndex < selectedTerms[1].startIndex; scanIndex++) {
                    if (!((equation[scanIndex] === SYMBOLS.LEFT_PAREN) || (equation[scanIndex] === SYMBOLS.RIGHT_PAREN))) {
                        missingAnd = true;
                    }
                }

                if (missingNot || missingAnd || missingParen) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DEMORGAN_AND, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    if(equationParts.postEquation[0] === SYMBOLS.RIGHT_PAREN) {
                        equationParts.postEquation = equationParts.postEquation.substr(2);
                        equationParts.preEquation = equationParts.preEquation.substr(0, equationParts.preEquation.length - 1);
                    }
                    else {
                        equationParts.postEquation = equationParts.postEquation.substr(1);
                    }
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.DEMORGAN_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                // Must have 2 terms
                if ((selectedTerms.length !== 2) || (selectedTerms[0].variables.length > 2) || (selectedTerms[1].variables.length > 2)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                var missingParen = false;
                // Check if missing parens
                if (((equationParts.subEquation.indexOf('(') !== -1) && (equationParts.subEquation.indexOf(')') === -1)) || ((equationParts.subEquation.indexOf('(') === -1) && (equationParts.subEquation.indexOf(')') !== -1))) {
                    missingParen = true;
                }

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var expressionInTheMiddle = equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] === SYMBOLS.LEFT_PAREN;
                var missingNot = equation[selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length + 1] !== SYMBOLS.NOT;
                var scanIndex = selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length;
                var missingOr = true;

                for (; scanIndex < selectedTerms[1].startIndex; scanIndex++) {
                    if (equation[scanIndex] === SYMBOLS.OR) {
                        missingOr = false;
                    }
                }

                if (missingNot || missingOr || expressionInTheMiddle || missingParen) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DEMORGAN_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    if(equationParts.postEquation[0] === SYMBOLS.RIGHT_PAREN) {
                        equationParts.postEquation = equationParts.postEquation.substr(2);
                        equationParts.preEquation = equationParts.preEquation.substr(0, equationParts.preEquation.length - 1);
                    }
                    else {
                        equationParts.postEquation = equationParts.postEquation.substr(1);
                    }
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.CONDITIONAL:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 2 terms
                if ((selectedTerms.length !== 2) || (selectedTerms[0].variables.length > 2) || (selectedTerms[1].variables.length > 2)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;

                // If either term is partial we have a problem, also don't support expressions that aren't selected
                var expressionInTheMiddle = equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] === SYMBOLS.LEFT_PAREN;
                var noImplies = (equation[selectedTerms[1].startIndex - 1] !== DISCRETE_SYMBOLS.IMPLIES) && (equation[selectedTerms[1].startIndex - 2] !== DISCRETE_SYMBOLS.IMPLIES);
                if (noImplies || expressionInTheMiddle) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.CONDITIONAL, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.DOUBLE_NEG:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 1 term
                if ((selectedTerms.length !== 1) || (selectedTerms[0].variables.length > 1)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, false);
                var missingNeg = (equationParts.subEquation[equationParts.subEquation.length - 1] !== SYMBOLS.NOT) || (equationParts.subEquation[equationParts.subEquation.length - 2] !== SYMBOLS.NOT);
                if (missingNeg) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.DOUBLE_NEG, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.IDENTITY_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Some conditions that must be met
                // One term must be just 1
                if ((selectedTerms.length !== 2) || !((selectedTerms[0].variables.length === 1 && selectedTerms[0].completeTerm[0] === SYMBOLS.TRUE) || (selectedTerms[1].variables.length === 1 && selectedTerms[1].completeTerm[0] === SYMBOLS.TRUE))) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    specificErrorMessage = 'Expected variable ';
                    if (discreteMath) {
                        specificErrorMessage += '∧ T';
                    }
                    else {
                        specificErrorMessage += 'AND ' + SYMBOLS.TRUE + ', such as a' + SYMBOLS.AND + SYMBOLS.TRUE + ' or a' + SYMBOLS.AND + '(' + SYMBOLS.TRUE + ').';
                    }
                    break;
                }

                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // Handles and through * and parenthesis
                // a * 1 = a
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDENTITY_AND, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);

                // a = a * 1
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDENTITY_AND, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;

        case PROPERTY_INDICES.IDENTITY_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // One term must be just 0
                if ((selectedTerms.length !== 2) || !((selectedTerms[0].variables.length === 1 && selectedTerms[0].completeTerm[0] === SYMBOLS.FALSE) || (selectedTerms[1].variables.length === 1 && selectedTerms[1].completeTerm[0] === SYMBOLS.FALSE))) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // a  +  0 = a
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDENTITY_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);

                // a = a  +  0
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDENTITY_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;

        case PROPERTY_INDICES.COMPLEMENT_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Some conditions that must be met
                // variables must match
                // should be only 1 variable in each term
                if ((selectedTerms.length !== 2) || (selectedTerms[0].completeTerm[0] !== selectedTerms[1].completeTerm[0]) || (selectedTerms[0].completeTerm === selectedTerms[1].completeTerm) || (selectedTerms[0].variables.length !== 1) || (selectedTerms[1].variables.length !== 1)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    if (selectedTerms[0].completeTerm[0] !== selectedTerms[1].completeTerm[0]) {
                        specificErrorMessage = selectedTerms[0].completeTerm + ' does not match ' + selectedTerms[1].completeTerm[0];
                    }
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // aa' = 0
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.COMPLEMENT_AND, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);
                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;

        case PROPERTY_INDICES.COMPLEMENT_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                /*
                    Some conditions that must be met
                    variables must match
                    should be only 1 variable in each term
                */
                if ((selectedTerms.length !== 2) || (selectedTerms[0].completeTerm[0] !== selectedTerms[1].completeTerm[0]) || (selectedTerms[0].completeTerm === selectedTerms[1].completeTerm) || (selectedTerms[0].variables.length !== 1) || (selectedTerms[1].variables.length !== 1)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    specificErrorMessage = 'Expected variable ';
                    if (discreteMath) {
                        specificErrorMessage += '∨ ¬variable.';
                    }
                    else {
                        specificErrorMessage += 'OR variable' + SYMBOLS.NOT + ', such as a ' + SYMBOLS.OR + ' a' + SYMBOLS.NOT + '.';
                    }
                    break;
                }
                var postIndex = selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length;

                if ((postIndex) < equation.length) {
                    if (!(equation[postIndex] === ')')) {

                        // Not a complete term
                        error = ERROR_TYPE.WRONG_INPUT;
                        break;
                    }
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // a  +  a' = 1
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.COMPLEMENT_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {

                if (!replacementVariable) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.COMPLEMENT_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE, replacementVariable);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.COMPLEMENT_TRUE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 1 term
                if ((selectedTerms.length !== 1) || (selectedTerms[0].variables.length > 1)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);
                var missingNeg = equationParts.subEquation[equationParts.subEquation.length - 1] !== SYMBOLS.NOT;
                var missingOne = selectedTerms[0].completeTerm.indexOf(SYMBOLS.TRUE) === -1;

                if (missingNeg || missingOne) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.COMPLEMENT_TRUE, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.COMPLEMENT_FALSE:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Must have 1 term
                if ((selectedTerms.length !== 1) || (selectedTerms[0].variables.length > 1)) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);
                var missingNeg = equationParts.subEquation[equationParts.subEquation.length - 1] !== SYMBOLS.NOT;
                var missingZero = selectedTerms[0].completeTerm.indexOf(SYMBOLS.FALSE) === -1;

                if (missingNeg || missingZero) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.COMPLEMENT_FALSE, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.ANNIHILATOR_AND:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                // Some conditions that must be met
                if ((selectedTerms.length !== 2) || !((selectedTerms[0].variables.length === 1 && selectedTerms[0].completeTerm[0] === SYMBOLS.FALSE) || (selectedTerms[1].variables.length === 1 && selectedTerms[1].completeTerm[0] === SYMBOLS.FALSE))) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }

                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // Handles and through * and parenthesis
                // a * 0 = 0
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.ANNIHILATOR_AND, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.ANNIHILATOR_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {

                if ((selectedTerms.length !== 2) || !((selectedTerms[0].variables.length === 1 && selectedTerms[0].completeTerm[0] === SYMBOLS.TRUE) || (selectedTerms[1].variables.length === 1 && selectedTerms[1].completeTerm[0] === SYMBOLS.TRUE))) {
                    error = ERROR_TYPE.WRONG_INPUT;
                    break;
                }
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // a  +  1 = 1
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.ANNIHILATOR_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            break;
        case PROPERTY_INDICES.IDEMPOTENCE_OR:
            if (direction === PROPERTY_DIRECTIONS.FORWARD) {
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[1].startIndex + selectedTerms[1].completeTerm.length, true);

                // Part of the equation inbetween terms that does not matter to the property
                var middlePieces = generateMiddleEquation(equation, equationParts.startIndex, equationParts.postIndex, selectedTerms, equationParts.subEquation, equationParts.postEquation);
                var middleEquation = middlePieces.middleEquation;
                equationParts.postEquation = middlePieces.postEquation;
                equationParts.subEquation = middlePieces.subEquation;

                // a  +  a = a
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDEMPOTENCE_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.FORWARD);

                if (!parsedResults.errorMessage) {
                    newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
            else if (direction === PROPERTY_DIRECTIONS.REVERSE) {
                var equationParts = generateEquationParts(equation, selectedTerms[0].startIndex, selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length, true);

                // a = a  +  a
                tokenizer.tokenize(equationParts.subEquation);
                var parsedResults = parser.parseProperty(PROPERTY_INDICES.IDEMPOTENCE_OR, tokenizer.tokens, PROPERTY_DIRECTIONS.REVERSE);

                if (!parsedResults.errorMessage) {
                    if ((equationParts.preEquation.length > 0 && equationParts.preEquation[equationParts.preEquation.length - 1] !== SYMBOLS.OR && equationParts.preEquation[equationParts.preEquation.length - 1] !== SYMBOLS.LEFT_PAREN) || (equationParts.postEquation.length > 0 && equationParts.postEquation[0] !== SYMBOLS.OR && equationParts.postEquation[0] !== SYMBOLS.RIGHT_PAREN)) {
                        newEquation = equationParts.preEquation + SYMBOLS.LEFT_PAREN + parsedResults.newEquation + SYMBOLS.RIGHT_PAREN + equationParts.postEquation;
                    }
                    else {
                        newEquation = equationParts.preEquation + parsedResults.newEquation + equationParts.postEquation;
                    }
                }
                else {
                    specificErrorMessage = parsedResults.errorMessage;
                }
            }
    }
     return { error: error, newEquation: newEquation, specificErrorMessage: specificErrorMessage };
 }

/*
    Fins the part of the equation that is unneeded and is in between the two selected terms
    |equation| is required and is a string
    |startIndex| is required and is an integer
    |postIndex| is required and is an integer
    |selectTerms| is required and is a list of objects
    |subEquation| is required and is a string
    |postEquation| is required and is a string
*/
 function generateMiddleEquation(equation, startIndex, postIndex, selectedTerms, subEquation, postEquation) {
    var middleEquation = equation.substr(startIndex + (selectedTerms[0].startIndex - startIndex) + selectedTerms[0].completeTerm.length, (selectedTerms[1].startIndex) - (startIndex + (selectedTerms[0].startIndex - startIndex) + selectedTerms[0].completeTerm.length));
    if (selectedTerms[1].startIndex !== selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length + 2 && equation[selectedTerms[0].startIndex + selectedTerms[0].completeTerm.length] === SYMBOLS.OR) {
        postEquation = middleEquation.substr(0, middleEquation.length - 1) + postEquation;
        subEquation = selectedTerms[0].completeTerm + SYMBOLS.OR + selectedTerms[1].completeTerm;
    }
    return {
        middleEquation: middleEquation,
        subEquation: subEquation,
        postEquation: postEquation
    };
}

/*
    Breaks the current equation down into the part that the rule applies to, |subEquation|- string, the
    piece that comes before the |subEquation|, the |preEquation| - string, and the piece that comes after,
    the |postEquation|- string, along with the |startIndex| - integer, and the |postIndex| - integer
    |equation| is required and is a string
    |startIndex| is required and is an integer
    |postIndex| is required and is an integer
    |expandParens| is optional and is a boolean
*/
 function generateEquationParts(equation, startIndex, postIndex, expandParens) {
    var indicies;
    if (expandParens) {
        indicies = findStartandPostIndexWithParens(equation, startIndex, postIndex);
    }
    else {
        indicies = {
            startIndex: startIndex,
            postIndex: postIndex
        };
    }
    var subEquation = equation.substr(indicies.startIndex, (indicies.postIndex) - indicies.startIndex);
    var preEquation = equation.substr(0, indicies.startIndex);
    var postEquation = equation.substr(indicies.postIndex);
    return {
        startIndex: indicies.startIndex,
        postIndex: indicies.postIndex,
        subEquation: subEquation,
        preEquation: preEquation,
        postEquation: postEquation
    };
}
