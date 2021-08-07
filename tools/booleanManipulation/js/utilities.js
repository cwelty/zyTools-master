/*
    Users can select terms in any order. In order to manipulate the terms must be in the same order that they occur in the equation
    ex.

    equation = ab + bc;
    selectedTerms = [{startIndex: 3, completeTerm: 'bc'}, {startIndex:0, completeTerm: 'ab'}]
    returns [{startIndex: 0, completeTerm: 'ab'}, {startIndex:3, completeTerm: 'bc'}]

    |equation| is required and is a string - the current equation being manipulated
    |selectedTerms| is required and is a list of objects whose properties are:
        * |startIndex| is required and is an integer - index of the first character of the term in the equation
        * |completeTerm| is required and is a string - string of the complete term so far
*/
function orderTermsCorrectly(equation, selectedTerms) {
    var termsInCorrectOrder = [];
    var minIndex = 0;
    var minValue = equation.length;
    while (selectedTerms.length > 0) {
        for (var i = 0; i < selectedTerms.length; i++) {
            if (selectedTerms[i].startIndex < minValue) {
                minIndex = i;
                minValue = selectedTerms[i].startIndex;
            }
        }
        termsInCorrectOrder.push(selectedTerms[minIndex]);
        selectedTerms.splice(minIndex, 1);
        minIndex = 0;
        minValue = equation.length;
    }
    return termsInCorrectOrder;
}

/*
    Checks if a term has been partially selected, that is that there other literals that make up the term that were not selected. Returns the boolean !|fullySelected|
    |selectedTerm| - object containing:
        * |variables| is required and is a list of jquery objects - the actual divs that were selected
    |USER_SYMBOLS| - object containing:
        * |VARIABLES| is required and is a list of strings - valid variable names
*/
function isTermPartiallySelected(selectedTerm, USER_SYMBOLS) {
    var fullySelected = true;
    selectedTerm.variables.forEach(function(value) {
        if (isSelectableVariable($(value).prev().text()[0], USER_SYMBOLS) && !$(value).prev().hasClass('selected')) {
            fullySelected = false;
        }
        else if (isSelectableVariable($(value).next().text()[0], USER_SYMBOLS) && !$(value).next().hasClass('selected')) {
            fullySelected = false;
        }
    });
    return !fullySelected;
}

/*
    Finds the beginning index and ending index of the subequation that contains the maximum number of matching parens, returns an object containg |startIndex| and |postIndex|
    |equation| is required and is a string
    |startIndex| is required and is an integer
    |postIndex| is required and is an integer
*/
function findStartandPostIndexWithParens(equation, startIndex, postIndex) {
    // Increment when we see a (, decrement when we see a ), if variable is 0 we have matching parens
    var parensToMatch = 0;
    for (var i = startIndex; i < postIndex; i++) {
        if (equation[i] === SYMBOLS.LEFT_PAREN) {
            parensToMatch++;
        }
        else if (equation[i] === SYMBOLS.RIGHT_PAREN) {
            parensToMatch--;
        }
    }
    // Expands the indices to include the parens containing the terms that the indices come from
    var indiciesUpdated = true;
    do {
        indiciesUpdated = false;
        if (startIndex > 0) {
            if (equation[startIndex - 1] === SYMBOLS.LEFT_PAREN) {
                startIndex = startIndex - 1;
                indiciesUpdated = true;
                parensToMatch++;
            }
            else if (equation[startIndex - 1] === SYMBOLS.RIGHT_PAREN) {
                startIndex = startIndex - 1;
                indiciesUpdated = true;
                parensToMatch--;
            }
        }
        if (parensToMatch === 0) {
            break;
        }
        if (postIndex < equation.length) {
            if (equation[postIndex] === SYMBOLS.RIGHT_PAREN) {
                postIndex = postIndex + 1;
                indiciesUpdated = true;
                parensToMatch--;
            }
            else if (equation[postIndex] === SYMBOLS.LEFT_PAREN) {
                postIndex = postIndex + 1;
                indiciesUpdated = true;
                parensToMatch++;
            }
        }
    } while (indiciesUpdated && (parensToMatch !== 0));
    return {
        startIndex: startIndex,
        postIndex: postIndex
    };
}

/*
    Converts the given string to the discrete math syntax, returns |equationCopy|
    |equationToConvert| is required and is a string - any equation in digital design format ex. ab + bc,
*/
function toDiscreteMath(equationToConvert) {
    var equationCopy = equationToConvert;
    var notIndex = equationCopy.indexOf(SYMBOLS.NOT);
    // Search for nots and replace with the digital design version
    while (notIndex !== -1) {
        var unmatchedParens = 0;
        // Not applied to a single variable
        if (equationCopy[notIndex - 1] !== ')') {
            equationCopy = equationCopy.substr(0, notIndex - 1) + DISCRETE_SYMBOLS.NOT + equationCopy.substr(notIndex - 1, 1) + equationCopy.substr(notIndex + 1);
        }
        else {
            var leftParenIndex = notIndex - 1;
            unmatchedParens++;
            while (unmatchedParens !== 0) {
                leftParenIndex--;
                if (equationCopy[leftParenIndex] === ')') {
                    unmatchedParens++;
                }
                if (equationCopy[leftParenIndex] === '(') {
                    unmatchedParens--;
                }
            }
            equationCopy = (equationCopy.substr(0, leftParenIndex) + DISCRETE_SYMBOLS.NOT + equationCopy.substr(leftParenIndex)).replace(SYMBOLS.NOT, '');
        }
        notIndex = equationCopy.indexOf(SYMBOLS.NOT);
    }
    // Replacing digital design syntax with discrete math
    equationCopy = equationCopy.replace(new RegExp('(\\' + SYMBOLS.AND + ')', 'g'), DISCRETE_SYMBOLS.AND);
    equationCopy = equationCopy.replace(new RegExp('(\\' + SYMBOLS.OR + ')', 'g'), DISCRETE_SYMBOLS.OR);
    equationCopy = equationCopy.replace(new RegExp('(' + SYMBOLS.TRUE + ')', 'g'), DISCRETE_SYMBOLS.TRUE);
    equationCopy = equationCopy.replace(new RegExp('(' + SYMBOLS.FALSE + ')', 'g'), DISCRETE_SYMBOLS.FALSE);
    equationCopy = equationCopy.replace(new RegExp('(' + VARIABLES[0] + ')', 'g'), DISCRETE_SYMBOLS.VARIABLES[0]);
    equationCopy = equationCopy.replace(new RegExp('(' + VARIABLES[1] + ')', 'g'), DISCRETE_SYMBOLS.VARIABLES[1]);
    equationCopy = equationCopy.replace(new RegExp('(' + VARIABLES[2] + ')', 'g'), DISCRETE_SYMBOLS.VARIABLES[2]);
    equationCopy = equationCopy.replace(new RegExp('\\((' + DISCRETE_SYMBOLS.NOT + '*[a-z' + DISCRETE_SYMBOLS.TRUE + DISCRETE_SYMBOLS.FALSE + '])\\)'), '$1');
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.NOT + '*[a-z' + DISCRETE_SYMBOLS.TRUE + DISCRETE_SYMBOLS.FALSE + '])(' + DISCRETE_SYMBOLS.NOT + '*[a-z' + DISCRETE_SYMBOLS.TRUE + DISCRETE_SYMBOLS.FALSE + '])', 'g'), '($1' + DISCRETE_SYMBOLS.AND + '$2)');
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.NOT + '*\\(.+\\))(' + DISCRETE_SYMBOLS.NOT + '?\\(.+\\))', 'g'), '($1' + DISCRETE_SYMBOLS.AND + '$2)');
    // variable times parens a*(.)
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.NOT + '*[a-z' + DISCRETE_SYMBOLS.TRUE + DISCRETE_SYMBOLS.FALSE + '])(' + DISCRETE_SYMBOLS.NOT + '*\\(.+\\))', 'g'), function($1, $2, $3, $4, $5, $6, $7) {
        var matchedParens = 0;
        var i = 0;
        while ($3[i] !== SYMBOLS.LEFT_PAREN) {
            i++;
        }
        for (; i < $3.length; i++) {
            if ($3[i] === SYMBOLS.LEFT_PAREN) {
                matchedParens++;
            }
            if ($3[i] === SYMBOLS.RIGHT_PAREN) {
                matchedParens--;
            }
            if (matchedParens === 0) {
                break;
            }
        }
        return SYMBOLS.LEFT_PAREN + $2 + DISCRETE_SYMBOLS.AND + $3.substr(0, i) + SYMBOLS.RIGHT_PAREN + $3.substr(i);
    });
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.NOT + '*\\(.+\\))(' + DISCRETE_SYMBOLS.NOT + '?[a-z' + DISCRETE_SYMBOLS.TRUE + DISCRETE_SYMBOLS.FALSE + '])', 'g'), '($1' + DISCRETE_SYMBOLS.AND + '$2)');
    equationCopy = removeRedundentParens(equationCopy);
    equationCopy = equationCopy.replace(new RegExp('\\((' + DISCRETE_SYMBOLS.NOT + '+\\(.*\\))\\)', 'g'), '$1');
    equationCopy = equationCopy.replace(new RegExp('^(\\(([^\\(\\)]*)\\))(?![' + DISCRETE_SYMBOLS.AND + DISCRETE_SYMBOLS.OR + DISCRETE_SYMBOLS.IMPLIES + '])$'), '$2');
    equationCopy = removeRedundentParens(equationCopy);
    return equationCopy;
}

/*
    Remove unneeded parenthesis
    |equation| is required and is a string - current equation being converted, ex. ((ab)) -> (ab)
    returns |equation|
*/
function removeRedundentParens(equation) {
    // Remove redundent parens
    var leftRedundentCandidate, rightRedundentCandidate;
    var leftIndices = [];
    var lastMatch;
    var secondLastMatch;
    var possibleMatch = 0;
    // Looks for instances of ((*)) that can be removed and replace with just single parens
    while (possibleMatch < equation.length) {
        leftRedundentCandidate = -1;
        rightRedundentCandidate = -1;
        leftIndices = [];
        secondLastMatch = -1;
        lastMatch = -1;
        var matchCounter = 0;
        for (; possibleMatch < equation.length; possibleMatch++) {
            if ((equation[possibleMatch] === '(') && (equation[possibleMatch + 1] === '(')) {
                leftRedundentCandidate = possibleMatch;
                matchCounter = 2;
                leftIndices = [ possibleMatch, possibleMatch + 1 ];
                possibleMatch++;
                break;
            }
        }
        if (matchCounter > 0) {
            for (var i = leftRedundentCandidate + 2; i < equation.length; i++) {
                if (equation[i] === '(') {
                    matchCounter++;
                    leftIndices.push(i);
                }
                if (equation[i] === ')') {
                    matchCounter--;
                    secondLastMatch = lastMatch;
                    lastMatch = leftIndices.pop();
                }
                // found it
                if (matchCounter === 0) {
                    if ((equation[i] === ')') && (equation[i - 1] === ')') && (secondLastMatch === (lastMatch + 1))) {
                        rightRedundentCandidate = i;
                        break;
                    }
                }
            }
        }
        if ((leftRedundentCandidate !== -1) && (rightRedundentCandidate !== -1)) {
            equation = equation.substring(0, leftRedundentCandidate) + equation.substring(leftRedundentCandidate + 1);
            equation = equation.substring(0, rightRedundentCandidate - 1) + equation.substring(rightRedundentCandidate);
            possibleMatch = 0;
        }
    }
    return equation;
}

/*
    Converts the given string to the digital design syntax
    |equationToConvert| is required and is a string - any equation in discrete math format ex. (a^b)v(b^c)
    returns |equationCopy|
*/
function toDigitalDesign(equationToConvert) {
    var equationCopy = equationToConvert;
    var notIndex = equationCopy.indexOf(DISCRETE_SYMBOLS.NOT);
    // Search for nots and replace with the discrete math version
    while (notIndex !== -1) {
        var unmatchedParens = 0;
        // Not applied to a single variable
        if (equationCopy[notIndex + 1] !== '(') {
            var offset = 0;
            while (equationCopy[notIndex + 1 + offset] === DISCRETE_SYMBOLS.NOT) {
                offset++;
            }
            equationCopy = equationCopy.substr(0, notIndex + offset) + equationCopy.substr(notIndex + 1 + offset, 1) + SYMBOLS.NOT + equationCopy.substr(notIndex + 2 + offset);
        }
        else {
            var rightParenIndex = notIndex + 1;
            unmatchedParens++;
            while (unmatchedParens !== 0) {
                rightParenIndex++;
                if (equationCopy[rightParenIndex] === ')') {
                    unmatchedParens--;
                }
                if (equationCopy[rightParenIndex] === '(') {
                    unmatchedParens++;
                }
            }
            equationCopy = (equationCopy.substr(0, rightParenIndex + 1) + SYMBOLS.NOT + equationCopy.substr(rightParenIndex + 1)).replace(DISCRETE_SYMBOLS.NOT, '');
        }
        notIndex = equationCopy.indexOf(DISCRETE_SYMBOLS.NOT);
    }
    equationCopy = removeRedundentParens(equationCopy);
    // Replacing discrete math syntax with digital design
    equationCopy = equationCopy.replace(new RegExp('(\\' + DISCRETE_SYMBOLS.AND + ')', 'g'), '');
    equationCopy = equationCopy.replace(new RegExp('(\\' + DISCRETE_SYMBOLS.OR + ')', 'g'), SYMBOLS.OR);
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.TRUE + ')', 'g'), SYMBOLS.TRUE);
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.FALSE + ')', 'g'), SYMBOLS.FALSE);
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.VARIABLES[0] + ')', 'g'), VARIABLES[0]);
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.VARIABLES[1] + ')', 'g'), VARIABLES[1]);
    equationCopy = equationCopy.replace(new RegExp('(' + DISCRETE_SYMBOLS.VARIABLES[2] + ')', 'g'), VARIABLES[2]);
    equationCopy = equationCopy.replace(new RegExp('([a-z' + SYMBOLS.TRUE + SYMBOLS.FALSE + ']' + SYMBOLS.NOT + '*)([a-z' + SYMBOLS.TRUE + SYMBOLS.FALSE + ']' + SYMBOLS.NOT + '*)', 'g'), '$1$2');
    equationCopy = equationCopy.replace(new RegExp('(\\(.+\\)' + SYMBOLS.NOT + '*)(\\(.+\\)' + SYMBOLS.NOT + '*)', 'g'), '$1$2');
    equationCopy = equationCopy.replace(new RegExp('([a-z' + SYMBOLS.TRUE + SYMBOLS.FALSE + ']' + SYMBOLS.NOT + '*)(\\(.+\\)' + SYMBOLS.NOT + '*)', 'g'), '$1$2');
    equationCopy = equationCopy.replace(new RegExp('(\\(.+\\)' + SYMBOLS.NOT + '*)([a-z' + SYMBOLS.TRUE + SYMBOLS.FALSE + ']' + SYMBOLS.NOT + '*)', 'g'), '$1$2');
    equationCopy = equationCopy.replace(new RegExp('\\((((([a-z' + SYMBOLS.TRUE + SYMBOLS.FALSE + ']' + SYMBOLS.NOT + '*)*)|(\\(.*\\)))+)\\)(?!' + SYMBOLS.NOT + ')', 'g'), '$1');
    return equationCopy;
}

/*
    Generates general prompt text for selecting terms/variables
    |currentStep| is required and is an integer
    returns |newPrompt|
*/
function generatePromptText(currentStep) {
    var newPrompt = 'Select the ';
    if (currentStep === 0) {
        newPrompt += '1st ';
    }
    else if (currentStep === 1) {
        newPrompt += '2nd ';
    }
    else if (currentStep === 2) {
        newPrompt += '3rd ';
    }
    else {
        newPrompt += currentStep + 'th ';
    }
    newPrompt += 'term.';
    return newPrompt;
}

/*
    Go from string representation of equation to html that adds divs so a user can click on individual parts, returns |html|
    |zyID| is required and is an integer
    |equation| is required and is a string
    |newVarFunction| is required and is a function that returns a unique integer
    |USER_SYMBOLS| is required and is a object containing SYMBOLS that are facing the user could be DM or digital design symbols
    |isDiscreteMath| is required and boolean.
*/
function createEquationHTML(zyID, equation, newVarFunction, USER_SYMBOLS, isDiscreteMath) {
    var html = '<div class="entire-equation">';
    if (!isDiscreteMath) {
        html += '<div class="left-hand-side">w =&nbsp;</div>';
    }

    html += '<div class="equation">';
    for (var i = 0; i < equation.length; i++) {
        // Literals should include the NOT symbol associated with them
        html += '<div class="variable" id="var' + newVarFunction() + '_' + zyID + '">' + equation[i];
        if ((equation[i] === DISCRETE_SYMBOLS.NOT) && ((i + 1) < equation.length) && (isSelectableVariable(equation[i + 1], USER_SYMBOLS) || (equation[i + 1] === DISCRETE_SYMBOLS.NOT))) {
            while (equation[i + 1] === DISCRETE_SYMBOLS.NOT) {
                html += equation[i + 1];
                i++;
            }
            html += equation[i + 1];
            i++;
        }
        else if (((i + 1) < equation.length) && (equation[i + 1] === SYMBOLS.NOT)) {
            while (equation[i + 1] === SYMBOLS.NOT) {
                html += SYMBOLS.NOT;
                i++;
            }
        }

        html += '</div>';
    }
    html += '</div></div>';
    return html;
}

/*
    Calculates the position in the equation string of the selected variable
    |zyID| is required and is an integer
    |selectedVariable| is required and is a selector for the variable that was clicked
    returns |calculatedIndex|
*/
function findPositionInStringFromDiv(zyID, selectedVariable) {
    var variableDivs = $('#' + zyID + ' div.equation:last').find('.variable');
    var calculatedIndex = 0;
    for (var i = 0; i < variableDivs.length; i++) {
        if ($(variableDivs[i])[0].id === $(selectedVariable)[0].id) {
            break;
        }
        else {
            calculatedIndex += $(variableDivs[i]).text().length;
        }
    }
    return calculatedIndex;
}

/*
    Complements the given variable
    |variable| is required and is a character
    returns complemented variable
*/
function complementVariable(variable) {
    // Already is the complement of a variable
    // a'
    if (variable[variable.length - 1] === SYMBOLS.NOT) {
        return variable.substr(0, variable.length - 1);
    }
    else {
        return variable + SYMBOLS.NOT;
    }
}

/*
    Sorts each term in an equation
    Terms should be ordered alphabetically
    Expressions should come at the end
    Anding with 0 or 1 should come before expressions
    Returns the sorted equation |newEquation|
    |equation| is required and is a string - the equation to be sorted
*/
function sortEquation(equation) {
    var sortTokenizer = new Tokenizer();
    sortTokenizer.add('(' + SYMBOLS.LITERAL + ')|(\\(.*\\)\'*)', TERMINALS.LITERAL);
    sortTokenizer.add(TERMINAL_REGEX[TERMINALS.OR], TERMINALS.OR);
    sortTokenizer.add(TERMINAL_REGEX[TERMINALS.AND] + '[0-1]', TERMINALS.AND);
    sortTokenizer.tokenize(equation);
    var newEquation = '';
    var currentTerm = '';
    var expressionToAdd = '';
    // Go through the tokens and order them as stated above
    for (var i = 0; i < sortTokenizer.tokens.length; i++) {
        if (sortTokenizer.tokens[i].sequence[0] === '(') {
            expressionToAdd += sortTokenizer.tokens[i].sequence;
        }
        else if (sortTokenizer.tokens[i].id === TERMINALS.OR) {
            newEquation += currentTerm + expressionToAdd + sortTokenizer.tokens[i].sequence;
            currentTerm = '';
            expressionToAdd = '';
        }
        else if ((sortTokenizer.tokens[i].id === TERMINALS.AND) && (sortTokenizer.tokens[i].sequence.length > 1)) {
            expressionToAdd = sortTokenizer.tokens[i].sequence + expressionToAdd;
        }
        // Just a variable, see where it goes
        else if (sortTokenizer.tokens[i].id === TERMINALS.LITERAL) {
            // We have no built up term just put the next one in
            if (!currentTerm) {
                currentTerm = sortTokenizer.tokens[i].sequence;
            }
            else {
                // There is already a currentTerm being built, have to find out where it should go
                var currentVariable;
                var startIndex = -1;
                var j;
                for (j = 0; j < currentTerm.length; j++) {
                    if (startIndex === -1) {
                        currentVariable = currentTerm[j];
                        startIndex = j;
                        if (((startIndex + 1) < currentTerm.length) && (currentTerm[startIndex + 1] === SYMBOLS.NOT)) {
                            currentVariable += SYMBOLS.NOT;
                            j++;
                        }
                        // should come before
                        if (sortTokenizer.tokens[i].sequence[0] <= currentVariable[0]) {
                            currentTerm = currentTerm.substr(0, startIndex) + sortTokenizer.tokens[i].sequence + currentTerm.substr(startIndex);
                            break;
                        }
                        //
                        else {
                            startIndex = -1;
                        }
                    }
                }
                // New variable needs to come after the currentTerm
                if (j === currentTerm.length) {
                    currentTerm = currentTerm + sortTokenizer.tokens[i].sequence;
                }
            }
        }
        else {
            newEquation += currentTerm + sortTokenizer.tokens[i].sequence;
            currentTerm = '';
        }

    }
    newEquation += currentTerm + expressionToAdd;
    newEquation = newEquation.replace(/([\w']+)*·([a-zA-Z']+)/g, '$1$2');
    newEquation = newEquation.replace(/([\w']+)*·([a-zA-Z']+)/g, '$1$2');
    newEquation = newEquation.replace(/([\w']+)*·(\(.+\))/g, '$1$2');
    newEquation = newEquation.replace(/··/g, '·');
    currentTerm = '';
    expressionToAdd = '';
    return newEquation;
}

/*
    Checks if |newVariable| is a part of the |currentlySelectedTerm|
    |newVariable| is the variable that the user clicked on, returns a boolean
    |zyID| is required and is an integer - id of the tool
    |newVariable| is required and is a variable div
    |currentlySelectedTerm| is required and is an object containing:
        * |startIndex| is required and is an index in the equation that this term starts at
        * |completeTerm| is required and is a string - the complete term as a string
*/
function isPartOfCurrentTerm(zyID, newVariable, currentlySelectedTerm, USER_SYMBOLS) {
    var newVariableIndexInString = findPositionInStringFromDiv(zyID, $(newVariable));
    var indexDifference = newVariableIndexInString - currentlySelectedTerm.startIndex;
    var equation = $('#' + zyID + ' div.equation:last').text();
    // The new variable comes after the current term
    if (indexDifference > 0) {
        for (var i = currentlySelectedTerm.startIndex; i < newVariableIndexInString; i++) {
            var termCheck = currentTermCheck(equation, i, USER_SYMBOLS);
            if (termCheck === CURRENT_TERM_CHECK_VALUES.IS_PART_OF) {
                return true;
            }
            else if (termCheck === CURRENT_TERM_CHECK_VALUES.NOT_PART_OF) {
                return false;
            }
            else {
                continue;
            }
        }
    }
    // The new variable comes before the current term
    else if (indexDifference < 0) {
        for (var i = newVariableIndexInString; i < currentlySelectedTerm.startIndex; i++) {
            var termCheck = currentTermCheck(equation, i, USER_SYMBOLS);
            if (termCheck === CURRENT_TERM_CHECK_VALUES.IS_PART_OF) {
                return true;
            }
            else if (termCheck === CURRENT_TERM_CHECK_VALUES.NOT_PART_OF) {
                return false;
            }
            else {
                continue;
            }
        }
    }
    return true;
}

var CURRENT_TERM_CHECK_VALUES = {
    IS_PART_OF: 0,
    NOT_PART_OF: 1,
    UNKNOWN: 2
};

/*
    Checks if |newVariable| is a part of the |currentlySelectedTerm|
    |equation| is required and a string
    |i| is required and is an integer
*/
function currentTermCheck(equation, i, USER_SYMBOLS) {
    if ((equation[i] === SYMBOLS.LEFT_PAREN) || (equation[i] === SYMBOLS.RIGHT_PAREN)) {
        return CURRENT_TERM_CHECK_VALUES.NOT_PART_OF;
    }
    else if (equation[i] === USER_SYMBOLS.OR) {
        for (var j = i; j >= 0; j--) {
            if (equation[j] === SYMBOLS.RIGHT_PAREN) {
                return CURRENT_TERM_CHECK_VALUES.NOT_PART_OF;
            }
            else if (equation[j] === SYMBOLS.LEFT_PAREN) {
                return CURRENT_TERM_CHECK_VALUES.IS_PART_OF;
            }
        }
        for (var j = i; j < equation.length; j++) {
            if (equation[j] === SYMBOLS.RIGHT_PAREN) {
                return CURRENT_TERM_CHECK_VALUES.IS_PART_OF;
            }
            else if (equation[j] === SYMBOLS.LEFT_PAREN) {
                return CURRENT_TERM_CHECK_VALUES.NOT_PART_OF;
            }
        }
        return CURRENT_TERM_CHECK_VALUES.NOT_PART_OF;
    }
    return CURRENT_TERM_CHECK_VALUES.UNKNOWN;
}

/*
    Checks if this character is one of the variables a user is allowed to click on, returns a boolean
    |character| is required and is a char
    |USER_SYMBOLS| is required and is an object containing:
        * |VARIABLES| is required and is a list of strings - valid variable names
*/
function isSelectableVariable(character, USER_SYMBOLS) {
    for (var i = 0; i < USER_SYMBOLS.VARIABLES.length; i++) {
        if (character === USER_SYMBOLS.VARIABLES[i]) {
            return true;
        }
    }
    return false;
}
