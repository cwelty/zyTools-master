'use strict';

/* exported isValidIdentifier, isReservedWord, reservedWordsErrorMessages, lookupMemoryCellFromVariableLists,
            isGivenSymbolInAbstractSyntaxTree, findNonBuiltInFunctionCalls, makeRandomInteger,
            makeSuggestionForInvalidWordFromSimilarWords, makeSuggestionForInvalidDataType,
            combineWordsIntoSuggestion, nodeHasBuiltInFunctions, convertCommentLineToString */

const reservedWords = [
    'Get', 'next', 'input', 'Put', 'to', 'output', 'with', 'decimal', 'places', 'or', 'and', 'not', 'returns', 'Function',
    'while', 'if', 'else', 'for', 'elseif', 'float', 'integer', 'array', 'nothing',
];

// Associate approriate error message for incorrect usage of reserved words. Exported and used in ExpressionParser.js.
const reservedWordsErrorMessages = {
    Get: 'Get is used to construct an input statement. Get must assign to a variable. Ex: variable = Get next input',
    next: 'next is used to construct an input statement. Ex: variable = Get next input',
    input: 'input is used to construct an input statement. Ex: variable = Get next input',
    Put: 'Put is used to construct an output statement. Ex: Put item to output',
    to: 'to is used to construct an output statement. Ex: Put item to output',
    output: 'output is used to construct an output statement. Ex: Put item to output',
    with: 'with is used to construct an output statement. Ex: Put item to output with 2 decimal places',
    decimal: 'decimal is used to construct an output statement. Ex: Put item to output with 2 decimal places',
    places: 'places is used to construct an output statement. Ex: Put item to output with 2 decimal places',
    returns: 'returns is used as part of a function definition. Ex: Function foo() returns integer',
    Function: 'Function is used to begin a function definition. Ex: Function foo() returns integer',
    while: 'while is used to begin a while loop\'s expression. Ex: while x > 3',
    if: 'if is used in branches. Ex: if item > 3',
    else: 'else is used in if-else branches.\nEx:\nif item > 3\n   ...\nelse\n   ...',
    for: 'for is used to begin a for loop. Ex: for i = 0; i < 3; i = i + 1',
    elseif: 'elseif is used in if-elseif branches.\nEx:\nif item > 9\n   ...\nelseif item > 4\n   ...',
    float: 'float is used as part of a variable declaration. Ex: float a',
    integer: 'integer is used as part of a variable declaration. Ex: integer a',
    array: 'array is used to declare an array variable. Ex: integer array(4) userVals',
    nothing: 'nothing is used as part of a function definition. Ex: Function foo() returns nothing',
};

// Map words in other languages to Coral words with same meaning.
const similarDataTypesInOtherLanguages = {
    int: 'integer',
    double: 'float',
    void: 'nothing',
};
const similarWordsInOtherLanguage = Object.assign({}, similarDataTypesInOtherLanguages, {
    print: 'Put',
    cout: 'Put',
    printf: 'Put',
    println: 'Put',
    def: 'Function',
    function: 'Function',
    return: 'returns',
});

/**
   Returns the distance between the two strings based on a Levenschtein table.
   @method distanceBetweenStrings
   @param {String} alpha First string.
   @param {String} beta  Second String.
   @return {Integer} The distance between the two strings based on a Levenschtein table.
*/
function distanceBetweenStrings(alpha, beta) {
    if (alpha.length === 0) {
        return beta.length;
    }
    if (beta.length === 0) {
        return alpha.length;
    }

    const matrix = [];

    // Increment along the first column of each row.
    for (let i = 0; i <= beta.length; i++) { // eslint-disable-line id-length
        matrix[i] = [ i ];
    }

    // Increment each column in the first row.
    for (let j = 0; j <= alpha.length; j++) { // eslint-disable-line id-length
        matrix[0][j] = j;
    }

    const SUBSTITUTION_COST = 1;
    const INSERTION_COST = 1;
    const DELETION_COST = 1;

    // Fill in the rest of the matrix.
    for (let i = 1; i <= beta.length; i++) { // eslint-disable-line id-length
        for (let j = 1; j <= alpha.length; j++) { // eslint-disable-line id-length
            if (beta.charAt(i - 1) === alpha.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + SUBSTITUTION_COST,
                                        Math.min(matrix[i][j - 1] + INSERTION_COST,
                                                 matrix[i - 1][j] + DELETION_COST));
            }
        }
    }

    // Return the distance.
    return matrix[matrix.length - 1][matrix[0].length - 1];
}

/**
    Combine suggested words into a string suggestion.
    @method combineWordsIntoSuggestion
    @param {Array} suggestedWords Array of {String}.
    @param {String} [actualWord=null] The actual word. If supplied, check if only off by case.
    @return {String} Suggestion of words to use.
*/
function combineWordsIntoSuggestion(suggestedWords, actualWord = null) {

    // Combine the similar words into a list.
    let wordsJoined = '';

    if (suggestedWords.length) {
        const wordsWithQuotes = suggestedWords.map(similarWord => `'${similarWord}'`);
        const wordsListed = wordsWithQuotes.join(', ');
        const commaOrNot = wordsWithQuotes.length > 1 ? ',' : '';

        wordsJoined = `${wordsListed}${commaOrNot} or something different`;
    }

    const wordsJoinMessage = wordsJoined ? `Maybe you meant ${wordsJoined}?` : '';

    // If there is only 1 suggested word and that word is different by capitalization only, then remind that case matters.
    const caseDifferenceMessage = '\nNote: Capitalization matters';
    const useCaseDifferenceMessage = actualWord &&
                                     (suggestedWords.length === 1) &&
                                     (suggestedWords[0].toUpperCase() === actualWord.toUpperCase());

    return `${wordsJoinMessage}${useCaseDifferenceMessage ? caseDifferenceMessage : ''}`;
}

/**
    Return a suggestion for the given word from a list of candidates.
    @method makeSuggestionFromWordAndCandidates
    @param {String} word The word to compare to.
    @param {Array} candidates Array of {String}. The candidate words.
    @param {Object} otherProgrammingLanguageWords Dictionary of words from other languages that map to Coral words.
    @return {String} The suggestion.
*/
function makeSuggestionFromWordAndCandidates(word, candidates, otherProgrammingLanguageWords) {
    const distances = candidates.map(candidateWord => distanceBetweenStrings(word, candidateWord));
    const shortestDistance = Math.min(...distances);
    const suggestDistance = Math.min(5, Math.floor(word.length / 2)); // eslint-disable-line no-magic-numbers
    const similarWordsSet = new Set();

    // A similar word was found.
    if ((shortestDistance > 0) && (shortestDistance <= suggestDistance)) {

        // Find the indices that share the |shortestDistance|.
        const indexOfShortestDistances = distances.reduce((array, distance, index) => {
            let newArray = array;

            if (distance === shortestDistance) {
                newArray = array.concat(index);
            }

            return newArray;
        }, []);

        const similarWordsList = indexOfShortestDistances.map(indexOfShortestDistance => candidates[indexOfShortestDistance]);

        similarWordsList.forEach(similarWord => similarWordsSet.add(similarWord));
    }

    // Add words with similar meanings in other programming languages.
    if (word in otherProgrammingLanguageWords) {
        similarWordsSet.add(otherProgrammingLanguageWords[word]);
    }

    return combineWordsIntoSuggestion(Array.from(similarWordsSet).sort(), word);
}

/**
    Return similar words to the given word from the reserved words, variable names, and function names.
    @method makeSuggestionForInvalidWordFromSimilarWords
    @param {String} word The word to compare to.
    @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
    @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
    @return {String} The suggestion.
*/
function makeSuggestionForInvalidWordFromSimilarWords(word, arrayOfVariables, functions) {
    const variableNames = arrayOfVariables[0].concat(arrayOfVariables[1]).concat(arrayOfVariables[2]).map(variable => variable.name);
    const functionNames = functions.map(programFunction => programFunction.name);
    const candidateWords = reservedWords.concat(functionNames).concat(variableNames);

    return makeSuggestionFromWordAndCandidates(word, candidateWords, similarWordsInOtherLanguage);
}

/**
    Return similar data types to the given data type.
    @method makeSuggestionForDataType
    @param {String} dataType The data type from which to make a suggestion.
    @return {String} The suggestion.
*/
function makeSuggestionForInvalidDataType(dataType) {
    const candidateDataTypes = [ 'integer', 'float', 'integer array', 'float array' ];

    return makeSuggestionFromWordAndCandidates(dataType, candidateDataTypes, similarDataTypesInOtherLanguages);
}

/**
    Return whether the given identifier is valid.
    Valid identifier cannot be a reserved word.
    Valid idenitifier must start with a letter or underscore, then may be followed by letters, underscores, or numbers.
    @method isValidIdentifier
    @param {String} identifier The identifier to check.
    @return {Boolean} Whether the given identifier is valid.
*/
function isValidIdentifier(identifier) {
    return !(reservedWords || []).includes(identifier) && (/^[a-z,A-Z]\w*$/).test(identifier);
}

/**
    Return whether the given word is reserved.
    @method isReservedWord
    @param {String} word The word to check.
    @return {Boolean} Whether the given word is reserved.
*/
function isReservedWord(word) {
    return reservedWords.includes(word);
}

/**
    Given a variable name and the list of variables, find the associated memory cell.
    @method lookupMemoryCellFromVariableLists
    @param {String} variableName The name of the variable to find.
    @param {Array} arrayOfVariables Array of {Variables}. List of variables to search.
    @return {MemoryCell} The memory cell with the given variable name.
*/
function lookupMemoryCellFromVariableLists(variableName, arrayOfVariables) {
    return arrayOfVariables.map(variables => variables.getMemoryCell(variableName)).find(memoryCell => memoryCell);
}

/**
    Recursively find the non-builtin function calls in the tree, in post-fix order.
    @method findNonBuiltInFunctionCalls
    @param {TreeSymbol} symbol The currently traversed symbol.
    @param {Array} nonBuiltInFunctionCalls Array of {FunctionCallSymbol}. The non-builtin function calls.
    @return {void}
*/
function findNonBuiltInFunctionCalls(symbol, nonBuiltInFunctionCalls) {
    symbol.children.forEach(child => findNonBuiltInFunctionCalls(child, nonBuiltInFunctionCalls));

    if ((symbol.getClassName() === 'FunctionCallSymbol') && !symbol.function.isBuiltIn()) {
        nonBuiltInFunctionCalls.push(symbol);
    }
}

/**
    Return whether the given symbol is in the given tree.
    @method isGivenSymbolInAbstractSyntaxTree
    @param {Symbol} symbol The symbol to find.
    @param {Symbol} currentSymbol The current symbol in the tree being traversed.
    @return {Boolean} Whether the given symbol is in the given tree.
*/
function isGivenSymbolInAbstractSyntaxTree(symbol, currentSymbol) {
    let wasChildFound = true;

    if (symbol !== currentSymbol) {
        wasChildFound = currentSymbol.children.some(child => isGivenSymbolInAbstractSyntaxTree(symbol, child));
    }

    return wasChildFound;
}

/**
    Generate a random integer.
    @method makeRandomInteger
    @return {Integer} A random integer.
*/
function makeRandomInteger() {
    const largeNumber = 1000000000000000;

    return Math.ceil(Math.random() * largeNumber);
}

/**
    Return whether the given tree has a built-in math function.
    @method hasBuiltInFunctions
    @param {TreeSymbol} symbol The currently traversed symbol.
    @param {Array} functions Array of {String}. The built-in functions to find.
    @return {Boolean} Whether this function uses a built-in math function.
*/
function hasBuiltInFunctions(symbol, functions) {
    let foundBuiltInMathFunction = false;

    if (symbol) {
        if ((symbol.getClassName() === 'FunctionCallSymbol') && functions.includes(symbol.function.name)) {
            foundBuiltInMathFunction = true;
        }
        else {
            foundBuiltInMathFunction = symbol.children.some(child => hasBuiltInFunctions(child, functions));
        }
    }

    return foundBuiltInMathFunction;
}

/**
    Return whether the node has a built-in math function.
    @method nodeHasBuiltInFunctions
    @param {FlowchartNode} node The node to check.
    @param {Array} functions Array of {String}. The built-in functions to find.
    @return {Boolean} Whether the node has a built-in math function.
*/
function nodeHasBuiltInFunctions(node, functions) {
    let expressionHas = hasBuiltInFunctions(node.expression && node.expression.root, functions);

    if (node.getName() === 'AssignmentNode') {
        expressionHas = expressionHas || hasBuiltInFunctions(node.assignedTree && node.assignedTree.root, functions);
    }

    return expressionHas;
}

/**
    Convert the given comment line to a string.
    @method convertCommentLineToString
    @param {TokensOfLine} commentLine The comment line to convert to a string.
    @return {String} The comment line as a string.
*/
function convertCommentLineToString(commentLine) {
    return commentLine.tokens[0].value.trim();
}
