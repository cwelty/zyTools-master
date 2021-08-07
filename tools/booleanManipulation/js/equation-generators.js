/*
    Generates an object containig the |start| - string, and |end| - string - equations.
    |discreteMath| is optional and is a boolean
    |progressiveMinterms| is optional and is a boolean
    |reduce| is optional and is a boolean
    |expandAndReduce| is optional and is a boolean
    |questionIndex| is required and is an integer
    |utilities| - utilities object
*/
function generateProgressionEquation(discreteMath, progressiveMinterms, reduce, expandAndReduce, questionIndex, utilities) {
    var generatedEquation;
    if (questionIndex === 0) {
        if (progressiveMinterms) {
            generatedEquation = mintermsOneTerm(utilities);
        }
        else if (reduce) {
            generatedEquation = utilities.flipCoin() ? twoToOneVariableChain(utilities, false) : twoToOneVariableChain(utilities, true);
        }
        else if (expandAndReduce) {
            generatedEquation = expandReduceEasy(utilities);
        }
        else {
            generatedEquation = twoToOneVariableChain(utilities);
        }
    }
    else if (questionIndex === 1) {
        if (progressiveMinterms) {
            generatedEquation = mintermsOneTerm(utilities);
        }
        else if (reduce) {
            generatedEquation = utilities.flipCoin() ? demorganAndChain(utilities) : demorganOrChain(utilities);
        }
        else if (expandAndReduce) {
            generatedEquation = expandReduceHard(utilities);
        }
        else {
            generatedEquation = twoToOneVariableChain(utilities);
        }
    }
    else if (questionIndex === 2) {
        if (progressiveMinterms) {
            generatedEquation = mintermsTwoTerms(utilities);
        }
        else if (reduce) {
            generatedEquation = impliesChain(utilities);
        }
        else {
            generatedEquation = threeToOneVariableChain(utilities);
        }
    }
    else if (questionIndex === 3) {
        if (progressiveMinterms) {
            generatedEquation = mintermsThreeTerms(utilities);
        }
        else if (reduce) {
            generatedEquation = impliesDemorganChain(utilities);
        }
        else {
            generatedEquation = threeToTwoVariableChain(utilities);
        }
    }
    else if (questionIndex === 4) {
        if (reduce) {
            generatedEquation = impliesDemorganDemorganChain(utilities);
        }
        else {
            generatedEquation = fourToOneVariableChain(utilities);
        }
    }
    else if (questionIndex === 5) {
        generatedEquation = fourToTwoVariableChain(utilities);
    }
    if (discreteMath) {
        generatedEquation.start = toDiscreteMath(generatedEquation.start);
        generatedEquation.end = toDiscreteMath(generatedEquation.end);
    }
    return generatedEquation;
}

/*
    Generates an object containig the |start| - string, and |end| - string - equations.
    |discreteMath| - boolean
    |basicOnly| - boolean
    |currentDifficulty| - integer - required
    |utilities| - utilities object
*/
function generateRandomEquation(basicOnly, discreteMath, currentDifficulty, utilities) {
    var newEquation;
    if (discreteMath) {
        if (currentDifficulty === DIFFICULTIES.BASIC) {
            if (basicOnly) {
                newEquation = twoToOneVariableChain(utilities, false);
            }
            else {
                newEquation = utilities.flipCoin() ? twoToOneVariableChain(utilities, false) : twoToOneVariableChain(utilities, true);
            }
        }
        if (currentDifficulty === DIFFICULTIES.INTERMEDIATE) {
            newEquation = utilities.flipCoin() ? demorganAndChain(utilities) : demorganOrChain(utilities);
        }
        if (currentDifficulty === DIFFICULTIES.ADVANCED) {
            newEquation = impliesChain(utilities);
        }
    }
    else {
        if (currentDifficulty === DIFFICULTIES.BASIC) {
            newEquation = twoToOneVariableChain(utilities);
        }
        if (currentDifficulty === DIFFICULTIES.INTERMEDIATE) {
            newEquation = utilities.flipCoin() ? threeToOneVariableChain(utilities) : threeToTwoVariableChain(utilities);
        }
        if (currentDifficulty === DIFFICULTIES.ADVANCED) {
            switch (utilities.pickNumberInRange(0, 2)) {
                case 0:
                    newEquation = fourToOneChain(utilities);
                    break;
                case 1:
                    newEquation = fourToTwoVariableChain(utilities);
                    break;
                case 2:
                    newEquation = fourToOneVariableChain(utilities);
                    break;
            }
        }
    }
    if (discreteMath) {
        newEquation.end = toDiscreteMath(newEquation.end);
        newEquation.start = toDiscreteMath(newEquation.start);
    }
    return newEquation;
}

/*
    Takes in the |terms| to be randomly added to the equation along with the |separatorSymbol|.
    Returns the built equation
    |terms| is required and is a list of strings
    |separatorSymbol| is required and is a string
*/

function buildEquationFromTerms(terms, separatorSymbol, utilities) {
    utilities.shuffleArray(terms);
    var equation = '';
    terms.forEach(function(value, index) {
        if (equation) {
            equation += separatorSymbol + value;
        }
        else {
            equation += value;
        }
    });
    return equation;
}

/*
    Picks random variables, these can be in complemented form or non-complemented form, returns an array of chosen variables
    |utilities| is required is the utilities object
    |amountToPick| is required and an integer
*/
function pickRandomVariables(utilities, amountToPick) {
    var randomVariableOptions = VARIABLES.slice(0, VARIABLES.length - 2);
    randomVariableOptions = utilities.pickNElementsFromArray(randomVariableOptions, amountToPick);
    for (var i = 0; i < randomVariableOptions.length; i++) {
        if (utilities.flipCoin()) {
            randomVariableOptions[i] = complementVariable(randomVariableOptions[i]);
        }
    }
    return randomVariableOptions;
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab
    ab(1)
    ab(c+c')
    abc + abc'
*/
function mintermsOneTerm(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: sortEquation(a + b + c + ' ' + SYMBOLS.OR + ' ' + a + b + complementVariable(c))
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  a'b'
    ab(1) + a'b'(1)
    ab(c+c') + ab'(c+c')
    abc + abc' + ab'c + ab'c'
*/
function mintermsTwoTerms(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var equation = '';
    var end = '';
    var terms = [ a + b, complementVariable(a) + complementVariable(b) ];
    utilities.shuffleArray(terms);
    terms.forEach(function(value, index) {
        if (equation) {
            equation += SYMBOLS.OR + value;
            end += SYMBOLS.OR + value + c + SYMBOLS.OR + value + complementVariable(c);
        }
        else {
            equation += value;
            end += (value + c) + SYMBOLS.OR + (value + complementVariable(c));
        }
    });
    return {
        start: sortEquation(equation),
        end: sortEquation(end)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ac  +  bc
    ab(1) + ac(1) + bc(1)
    ab(c+c') + ac(b+b') + bc(a+a')
    abc + abc' + abc + ab'c + abc + a'bc
    abc +abc' + ab'c + a'bc
*/
function mintermsThreeTerms(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var equation = '';
    var end = '';
    var terms = [ a + b, a + c, b + c ];
    equation = terms[0] + SYMBOLS.OR + terms[1] + SYMBOLS.OR + terms[2];
    end += (terms[0] + c) + SYMBOLS.OR + (terms[0] + complementVariable(c));
    end += SYMBOLS.OR + (terms[1] + complementVariable(b));
    end += SYMBOLS.OR + (terms[2] + complementVariable(a));
    return {
        start: sortEquation(equation),
        end: sortEquation(end)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (ab)'(a' + b)
    (a' + b')(a' + b)
    a'+(b'b)
    a'+(0)
    a'
*/
function demorganAndChain(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + b + ')' + SYMBOLS.NOT + '(' + complementVariable(a) + SYMBOLS.OR + b + ')';
    return {
        start: sortEquation(equation),
        end: complementVariable(a)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a + (a'b))'
    'a(a'b)'
    'a(a''+b')
    'a(a+b')
    'aa+a'b'
    0 + a'b'
    a'b'
*/
function expandReduceEasy(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + SYMBOLS.OR + '(' + complementVariable(a) + b + '))' + SYMBOLS.NOT;
    return {
        start: sortEquation(equation),
        end: complementVariable(a) + complementVariable(b)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a' → (a'b))'
    (a + (a'b))'
    'a(a'b)'
    'a(a''+b')
    'a(a+b')
    'aa+a'b'
    0 + a'b'
    a'b'
*/
function expandReduceHard(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + complementVariable(a) + DISCRETE_SYMBOLS.IMPLIES + '(' + complementVariable(a) + b + '))' + SYMBOLS.NOT;
    return {
        start: sortEquation(equation),
        end: complementVariable(a) + complementVariable(b)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a+b)'+(a'b)
    (a'b')+(a'b)
    a'(b' + b)
    a'(1)
    a'
*/
function demorganOrChain(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + SYMBOLS.OR + b + ')' + SYMBOLS.NOT + SYMBOLS.OR + '(' + complementVariable(a) + b + ')';
    return {
        start: sortEquation(equation),
        end: complementVariable(a)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a → b)'+(a+b)'
    (a' + b)'+(a+b)'
    (a''b')'+(a+b)'
    (ab')'+(a+b)'
    (ab')'+(a'b')
    b'(a+a')
    b'(1)
    b'
*/
function impliesDemorganDemorganChain(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + DISCRETE_SYMBOLS.IMPLIES + b + ')' + SYMBOLS.NOT + SYMBOLS.OR + '(' + a + SYMBOLS.OR + b + ')' + SYMBOLS.NOT;
    return {
        start: sortEquation(equation),
        end: complementVariable(b)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a → b)(ab)'
    (a' + b)(ab)'
    (a' + b)(a' + b')
    a'+(bb')
    a'+(F)
    a'
*/
function impliesDemorganChain(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + DISCRETE_SYMBOLS.IMPLIES + b + ')' + '(' + a + b + ')' + SYMBOLS.NOT;
    return {
        start: sortEquation(equation),
        end: complementVariable(a)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    (a → b)(a' + b')
    (a' + b)(a' + b')
    a'+(bb')
    a'+(F)
    a'
*/
function impliesChain(utilities) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var equation = '(' + a + DISCRETE_SYMBOLS.IMPLIES + b + ')' + '(' + complementVariable(a) + SYMBOLS.OR + complementVariable(b) + ')';
    return {
        start: sortEquation(equation),
        end: complementVariable(a)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'
    a(b  +  b')
    a(1)
    a
*/
function twoToOneVariableChain(utilities, distributeOr) {
    var a, b;
    var randomVariables = pickRandomVariables(utilities, 2);
    a = randomVariables[0];
    b = randomVariables[1];
    var terms;
    var equation;
    if (distributeOr) {
        terms = [ '(' + a + SYMBOLS.OR + b + ')', '(' + a + SYMBOLS.OR + complementVariable(b) + ')' ];
        equation = buildEquationFromTerms(terms, SYMBOLS.AND, utilities);
    }
    else {
        terms = [ a + b, a + complementVariable(b) ];
        equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    }
    return {
        start: sortEquation(equation),
        end: a
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'  +  ac
    a(b  +  b')  +  ac
    a(1)  +  ac
    a  +  ac
    a(1  +  c)
    a(1)
    a
*/
function threeToOneVariableChain(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b, a + complementVariable(b), a + c ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: a
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'  +  bc
    a(b  +  b')  +  bc
    a(1)  +  bc
    a  +  bc
*/
function threeToTwoVariableChain(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b, a + complementVariable(b), b + c ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: sortEquation(a + SYMBOLS.OR + b + c)
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'  +  a'c  +  a'c'
    a(b + b')  +  a'(c + c')
    a(1)  +  a'(1)
    a  +  a'
    1
*/
function fourToOneChain(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b, a + complementVariable(b), complementVariable(a) + c, complementVariable(a) + complementVariable(c) ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: SYMBOLS.TRUE
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'  +  ac  +  ac'
    a(b + b')  +  a(c + c')
    a(1)  +  a(1)
    a  +  a
    a
*/
function fourToOneVariableChain(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b, a + complementVariable(b), a + c, a + complementVariable(c) ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: a
    };
}

/*
    This function takes in |utilities| which is used to randomly choose values.
    This function generates the start and end equations for a problem.
    This function first picks rnadom variables, these can also randomly be complemented.
    The function then builds an equation that looks like the beginning of the equation sequence listed below.
    The end is the equation that the user should be trying to make the start equation look like.
    The function then returns a sorted version of these start and end equations.

    ab  +  ab'  + bc  +  bc'
    a(b + b')  +  b(c + c')
    a(1)  +  b(1)
    a  +  b
*/
function fourToTwoVariableChain(utilities) {
    var a, b, c;
    var randomVariables = pickRandomVariables(utilities, 3);
    a = randomVariables[0];
    b = randomVariables[1];
    c = randomVariables[2];
    var terms = [ a + b, a + complementVariable(b), b + c, b + complementVariable(c) ];
    var equation = buildEquationFromTerms(terms, SYMBOLS.OR, utilities);
    return {
        start: sortEquation(equation),
        end: sortEquation(a + SYMBOLS.OR + b)
    };
}
