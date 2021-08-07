'use strict';

/**
    Whether the current question uses variables. The last two levels use variables.
    @method isQuestionWithVariables
    @param {Boolean} currentQuestion The level of the current question.
    @param {Integer} numLevels The number of levels in total.
    @return {Boolean} Whether current question has variables.
*/
function isQuestionWithVariables(currentQuestion, numLevels) {
    const questionsWithVariables = [ numLevels - 1, numLevels - 2 ]; // eslint-disable-line no-magic-numbers

    return questionsWithVariables.indexOf(currentQuestion) !== -1;
}

function getCppText(currentQuestion, textToProcess, intVariableName, intVariableValue, numLevels) {
    var numDoubleQuotes = 0;
    var error = '';
    var usesNumericalLiteral = false;

    // Remove extra spaces at the beginning and at the end
    textToProcess = textToProcess.trim();

    // If user adds semicolon at the end by mistake, just remove the semicolon
    if (textToProcess.charAt(textToProcess.length - 1) === ';') {
        textToProcess = textToProcess.slice(0, -1);
    }

    var textToProcessSplit = textToProcess.split('"');
    // re-join string segments that contain the \" escape sequence that were incorrectly split up
    for (var i = 0; i < textToProcessSplit.length - 1; i++) {
        if (textToProcessSplit[i].charAt(textToProcessSplit[i].length - 1) === '\\') {
            textToProcessSplit[i] = textToProcessSplit[i] + '"' + textToProcessSplit[i + 1];
            textToProcessSplit.splice(i + 1, 1);
        }
    }
    // only do these replaces in string literals, which are the odd numbered indexes in the array
    for (var i = 1; i < textToProcessSplit.length; i = i + 2) {
        if (textToProcessSplit[i].match(/\d+/)) {
            // String contains number literal
            usesNumericalLiteral = true;
        }
    }

    // only do these replaces in non-string literals, which are the even numbered indexes in the array
    for (let index = 0; index < textToProcessSplit.length; index += 2) {

        // Error: Variable doesn't exist
        if (!isQuestionWithVariables(currentQuestion, numLevels) && (textToProcessSplit[index].indexOf(intVariableName) !== -1)) {
            error = 'syntax';
        }

        // Error: There is + between string literals
        if (textToProcessSplit[index].indexOf('+') !== -1) {
            error = 'syntax';
        }

        // replace endl with \n
        textToProcessSplit[index] = textToProcessSplit[index].replace(/endl/g, '"\\n"');

        // replace number with SDataTypesSummary_IStrSim2Var_1_var1
        textToProcessSplit[index] = textToProcessSplit[index].replace(new RegExp(intVariableName, 'g'), `\"${intVariableValue}\"`);
    }
    textToProcess = textToProcessSplit.join('"');

    // replace " << " with nothing, eval doesn't use this syntax
    textToProcess = textToProcess.replace(/\"\s*<<\s*\"/g, '');

    // Count the number of double-quotes used, excluding the double-quotes escape sequence \"
    if (textToProcess.charAt(0) === '"') {
        numDoubleQuotes++;
    }
    for (var i = 1; i < textToProcess.length; i++) {
        if (textToProcess.charAt(i) === '"' && textToProcess.charAt(i - 1) !== '\\') {
            numDoubleQuotes++;
        }
    }

    if (textToProcess) {
        var outputText = textToProcess;
        // Single quotes not the same as double quotes
        if (textToProcess.charAt(0) === '\'' && textToProcess.charAt(textToProcess.length - 1) === '\'') {
            error = 'quotes';
        }
        try {
            outputText = eval(outputText); // check for string correctness at least w/in JavaScript
        }
        catch (err) {
            // User forgot to enclose string with double quotes
            if (numDoubleQuotes === 0) {
                error = 'quotes';
            }
            else {
                error = 'syntax';
            }
        }

        var checkStringReturn = checkStringEval(textToProcess, outputText);
        textToProcess = checkStringReturn.text;
        error = checkStringReturn.error || error;
    }
    else {
        error = 'syntax';
    }

    return {
        text:                 textToProcess,
        error:                error,
        usesNumericalLiteral: usesNumericalLiteral
    };
}

function getCText(currentQuestion, textToProcess, intVariableName, intVariableValue, numLevels) {
    var numDoubleQuotes = 0;
    var error = '';
    var usesNumericalLiteral = false;

    // Remove extra spaces at the beginning and at the end
    textToProcess = textToProcess.trim();

    // If user adds ) or ); at the end by mistake, simply remove them
    if (textToProcess.charAt(textToProcess.length - 1) === ')') {
        textToProcess = textToProcess.slice(0, -1);
    }
    if (textToProcess.charAt(textToProcess.length - 1) === ';' && textToProcess.charAt(textToProcess.length - 2) === ')') {
        textToProcess = textToProcess.slice(0, -2);
    }

    // String contains number literal
    if (textToProcess.match(/\d+/)) {
        usesNumericalLiteral = true;
    }

    // Expect to have two quotes w/o anything in front
    // ^\s*".*"(\s*,\w+\s*)+$
    if (textToProcess.indexOf('"') === -1) { // AE 080313: user input does not contain a double quotes
        error = 'syntax';
    }

    // Count the number of double-quotes used, excluding the double-quotes escape sequence \"
    // If there aren't exactly two double-quotes used, then syntax error
    if (textToProcess.charAt(0) === '"') {
        numDoubleQuotes++;
    }
    for (var i = 1; i < textToProcess.length; i++) {
        if (textToProcess.charAt(i) === '"' && textToProcess.charAt(i - 1) !== '\\') {
            numDoubleQuotes++;
        }
    }
    if (numDoubleQuotes !== 2) {
        error = 'syntax';
    }

    var tS = textToProcess.split('"');
    var beg = tS.shift(1);
    var end = tS.pop();
    var mid = tS.join('"');

    // int variables must have corresponding %d or %i in string, else syntax error
    var tEnd = '';
    if (end) {
        tEnd = end.replace(/ /g, '');
    }
    var prefixOfPrintf = tEnd.split(',');

    if (prefixOfPrintf[0]) {
        error = 'syntax';
    }
    prefixOfPrintf.shift();

    /*
        Replace each specifier with the respective variable's value.
    */
    for (var i = 0; i < mid.length - 1; i++) {
        if (mid.charAt(i) === '%') {
            do {
                i++;
            } while ((mid.charAt(i) === ' ') && (i < mid.length - 1));

            // List of unsupported specifiers for printf.
            var unsupportedSpecifiers = 'uoxXfFeEgGaAcspn';

            // Give error if unsupported specifier was used.
            if (unsupportedSpecifiers.indexOf(mid.charAt(i)) !== -1) {
                error = 'specifier';
                mid = replaceAt(mid, mid.indexOf('%'), '', i + 1);
            }
            else if (mid.charAt(i) === 'd' || mid.charAt(i) === 'i') {
                if (prefixOfPrintf.length === 0) {
                    if (i === mid.indexOf('%') + 1) {
                        mid = replaceAt(mid, mid.indexOf('%'), '0', i + 1);
                    }
                    else {
                        mid = replaceAt(mid, mid.indexOf('%'), ' 0', i + 1);
                    }
                }
                else if (prefixOfPrintf[0] === intVariableName) {
                    if (i === (mid.indexOf('%') + 1)) {
                        mid = replaceAt(mid, mid.indexOf('%'), String(intVariableValue), i + 1);
                    }
                    else {
                        mid = replaceAt(mid, mid.indexOf('%'), ' ' + String(intVariableValue), i + 1);
                    }
                    prefixOfPrintf.shift();
                }
                else if (!isNaN(parseInt(prefixOfPrintf[0]))) {
                    if (i === mid.indexOf('%') + 1) {
                        mid = replaceAt(mid, mid.indexOf('%'), prefixOfPrintf[0], i + 1);
                    }
                    else {
                        mid = replaceAt(mid, mid.indexOf('%'), ' ' + prefixOfPrintf[0], i + 1);
                    }
                    prefixOfPrintf.shift();
                }
                else {
                    error = 'syntax';
                }
            }
            else if (mid.charAt(i) === '%') {
                mid = replaceAt(mid, mid.indexOf('%') + 1, '', i);
            }
            else if (mid.charAt(i) === ' ') {
                mid = replaceAt(mid, mid.indexOf('%'), '', i + 1);
            }
            else {
                mid = replaceAt(mid, mid.indexOf('%'), '', i);
            }
        }
    }

    if (mid.charAt(mid.length - 1) === '%') {
        mid = mid.slice(0, -1);
    }

    if (prefixOfPrintf.length !== 0) {
        error = 'syntax';
    }

    if (mid !== '') {
        mid = '"' + mid + '"';
    }

    textToProcess = beg + mid;

    if (textToProcess) {
        var outputText = textToProcess;
        // Single quotes not the same as double quotes
        if (textToProcess.charAt(0) === '\'' && textToProcess.charAt(textToProcess.length - 1) === '\'') {
            error = 'quotes';
        }
        try {
            // check for string correctness at least w/in JavaScript
            outputText = eval(outputText);
        }
        catch (err) {
            if (numDoubleQuotes === 0) {
                error = 'quotes';
            }
            else {
                error = 'syntax';
            }
        }

        var checkStringReturn = checkStringEval(textToProcess, outputText);
        textToProcess = checkStringReturn.text;
        error = checkStringReturn.error || error;
    }
    else {
        error = 'syntax';
    }

    return {
        text:                 textToProcess,
        error:                error,
        usesNumericalLiteral: usesNumericalLiteral
    };
}

function getJavaText(currentQuestion, textToProcess, intVariableName, intVariableValue, numLevels) {
    var numDoubleQuotes = 0;
    var error = '';
    var usesNumericalLiteral = false;

    // If user adds ) or ); at the end by mistake, simply remove them
    if (textToProcess.charAt(textToProcess.length - 1) === ')') {
        textToProcess = textToProcess.slice(0, -1);
    }
    if (textToProcess.charAt(textToProcess.length - 1) === ';' && textToProcess.charAt(textToProcess.length - 2) === ')') {
        textToProcess = textToProcess.slice(0, -2);
    }

    var textToProcessSplit = textToProcess.split('"');
    // re-join string segments that contain the \" escape sequence that were incorrectly split up
    for (var i = 0; i < textToProcessSplit.length - 1; i++) {
        if (textToProcessSplit[i].charAt(textToProcessSplit[i].length - 1) === '\\') {
            textToProcessSplit[i] = textToProcessSplit[i] + '"' + textToProcessSplit[i + 1];
            textToProcessSplit.splice(i + 1, 1);
        }
    }
    // only check in string literals, which are the odd numbered indexes in the array
    for (var i = 1; i < textToProcessSplit.length; i = i + 2) {
        if (textToProcessSplit[i].match(/\d+/)) {
            // String contains number literal
            usesNumericalLiteral = true;
        }
    }

    // only do these replaces in non-string literals, which are the even numbered indexes in the array
    for (let index = 0; index < textToProcessSplit.length; index += 2) {

        // Error: Variable doesn't exist
        if (!isQuestionWithVariables(currentQuestion, numLevels) && (textToProcessSplit[index].indexOf(intVariableName) !== -1)) {
            error = 'syntax';
        }

        // Add double-quotes around the integer variable name.
        textToProcessSplit[index] = textToProcessSplit[index].replace(new RegExp(intVariableName, 'g'), `\"${intVariableValue}\"`);
    }
    textToProcess = textToProcessSplit.join('"');

    // Count the number of double quotes in the string, excluding the double-quotes escape sequence \"
    for (var i = 0; i < textToProcess.length; i++) {
        if (i === 0 && textToProcess.charAt(i) === '"') {
            numDoubleQuotes++;
        }
        else if (i !== 0 && (textToProcess.charAt(i) === '"') && (textToProcess.charAt(i - 1) !== '\\')) {
            numDoubleQuotes++;
        }
    }

    var checkContent = textToProcess.split('"');
    // re-join string segments that contain the \" escape sequence that were incorrectly split up
    for (var i = 0; i < checkContent.length - 1; i++) {
        if (checkContent[i].charAt(checkContent[i].length - 1) === '\\') {
            checkContent[i] = checkContent[i] + '"' + checkContent[i + 1];
            checkContent.splice(i + 1, 1);
        }
    }
    // if there is anything other than spaces or + in non-string literals, report syntax error
    for (var i = 0; i < checkContent.length; i = i + 2) {
        // Error: Variable doesn't exist
        for (var j = 0; j < checkContent[i].length; j++) {
            if (checkContent[i].charAt(j) !== ' ' && checkContent[i].charAt(j) !== '+') {
                error = 'syntax';
            }
        }
    }

    // replace < and > with &lt; and &gt;, respectively
    textToProcess = textToProcess.replace(/</g, '&lt;');
    textToProcess = textToProcess.replace(/>/g, '&gt;');

    if (textToProcess) {
        var outputText = textToProcess;
        try {
            // check for string correctness at least w/in JavaScript
            outputText = eval(outputText);
        }
        catch (err) {
            if (numDoubleQuotes === 0) {
                error = 'quotes';
            }
            else {
                error = 'syntax';
            }
        }

        var checkStringReturn = checkStringEval(textToProcess, outputText);
        textToProcess = checkStringReturn.text;
        error = checkStringReturn.error || error;
    }
    else {
        error = 'syntax';
    }

    return {
        text:                 textToProcess,
        error:                error,
        usesNumericalLiteral: usesNumericalLiteral
    };
}

function getPython2Text(currentQuestion, textToProcess, intVariableName, intVariableValue, numLevels) {
    var error = '';
    var usesNumericalLiteral = false;
    var syntaxError = false;

    var trim = function(str) {
        str = str.replace(/^\s+/, '');
        for (var i = str.length - 1; i >= 0; i--) {
            if (/\S/.test(str.charAt(i))) {
                str = str.substring(0, i + 1);
                break;
            }
        }
        return str;
    };

    // Get list of comma-separated terms (could be string literals, variables, or keyword params
    var term = '';
    var terms = [];
    var open_quote = '';
    for (var i = 0; i < textToProcess.length; i += 1) {
        var c = textToProcess[i];
        if ((c === '\'') || (c === '"')) {
            if (open_quote === '') {
                open_quote = c;
                term += '"';
            } else {
                if (c === open_quote) {
                    open_quote = '';
                    term += '"';
                } else {
                    if (c == '"') {
                        term += '\\"';
                    }
                    else {
                        term += c;
                    }
                }
            }
        }
        else if ((c === ',') && (open_quote === '')) {
            terms.push(trim(term));
            term = '';
        }
        else {
            term += c;
        }
    }
    terms.push(trim(term)); // last term

    // Find predefined variables
    var indexIntVar = [];
    for (let index = 0; index < terms.length; index += 1) {
        if (terms[index] === intVariableName) {
            if (!isQuestionWithVariables(currentQuestion, numLevels)) {

                // ERROR: a variable name that doesn't exist
                // (for the first 3 questions)
                error = 'syntax';
            }
            indexIntVar.push(index);
        }
    }

    // Returns whether the parameter |n| is a number
    // |n| is a require parameters
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Check whether string literal is missing double quotes
    if (terms.length === 1 && terms[0] && (terms[0][0] !== '"') && (terms[0][terms[0].length - 1] !== '"') &&
        terms[0].indexOf('"') === -1) {
        error = 'quotes';
        syntaxError = true;
    }

    // Error check that all terms are a literal or variable
    for (var i = 0; i < terms.length; i++) {
        // If term is variable name, then continue
        if (indexIntVar.indexOf(i) !== -1) {
            continue;
        }

        // Otherwise, check whether term is a literal
        if (terms[i].length > 0 && !isNumber(terms[i])) {
            if ((terms[i].length === 1) && (terms[i][0] === '"')) {
                syntaxError = true;
                break;
            }
            if ((terms[i][0] !== '"') || (terms[i][terms[i].length - 1] !== '"')) {
                syntaxError = true;
                break;
            }
            else if (terms[i].match(/\d+/)) {
                // String contains number literal
                usesNumericalLiteral = true;
            }
        }
    }

    // Ready to build an eval string
    var evalStr = '"';

    for (var i = 0; i < terms.length; i += 1) {
        if (indexIntVar.indexOf(i) !== -1) {
            evalStr += intVariableValue;
        }
        else if (isNumber(terms[i])) {
            evalStr += terms[i];
        }
        else if (!terms[i].indexOf('\\n"') === (terms[i].length - 3)) {
            evalStr += terms[i].slice(1, terms[i].length - 1);
        }
        else {
            evalStr += terms[i].slice(1, terms[i].length - 1);
        }

        if (i < terms.length - 1) {
            evalStr += ' ';
        }
    }

    evalStr += '"';

    // If there is text and not a syntax error, then try to execute |evalStr|
    if ((textToProcess !== '') && !syntaxError) {
        var outputText = evalStr;
        try {
            // check for string correctness at least w/in JavaScript
            outputText = eval(outputText);

            // replace < and > with &lt; and &gt;, respectively
            outputText = outputText.replace(/</g, '&lt;');
            outputText = outputText.replace(/>/g, '&gt;');
        }
        catch(err) {
            error = 'syntax';
        }

        var checkStringReturn = checkStringEval(textToProcess, outputText);
        textToProcess = checkStringReturn.text;
        error = checkStringReturn.error || error;
    }
    else if (!(error)) {
        error = 'syntax';
    }

    return {
        text:                 textToProcess,
        error:                error,
        usesNumericalLiteral: usesNumericalLiteral
    };
}

function getPython3Text(currentQuestion, textToProcess, intVariableName, intVariableValue, numLevels) {
    var error = '';
    var usesNumericalLiteral = false;
    var syntaxError = false;

    var trim = function(str) {
        str = str.replace(/^\s+/, '');
        for (var i = str.length - 1; i >= 0; i--) {
            if (/\S/.test(str.charAt(i))) {
                str = str.substring(0, i + 1);
                break;
            }
        }
        return str;
    };

    // Get list of comma-separated terms (could be string literals, variables, or keyword params
    var term = '';
    var terms = [];
    var open_quote = '';
    for (var i = 0; i < textToProcess.length; i += 1) {
        var c = textToProcess[i];
        if ((c === '\'') || (c === '"')) {
            if (open_quote === '') {
                open_quote = c;
                term += '"';
            }
            else {
                if (c === open_quote) {
                    open_quote = '';
                    term += '"';
                }
                else {
                    if (c === '"') {
                        term += '\\"';
                    }
                    else {
                        term += c;
                    }
                }
            }
        }
        else if (c === ',' && open_quote === '') {
            terms.push(trim(term));
            term = '';
        }
        else {
            term += c;
        }
    }
    terms.push(trim(term));

    // Error check: Placement of parameter end or parameter sep must be last
    var indexKeywordEnd = -1;
    var indexKeywordSep = -1;
    for (var i = 0; i < terms.length; i += 1) {
        if (terms[i].indexOf('end=') === 0) {
            // Can't specify keyword param twice
            if (indexKeywordEnd >= 0) {
                syntaxError = true;
            }
            indexKeywordEnd = i;
        }
        if (terms[i].indexOf('sep=') === 0) {
            // Can't specify keyword param twice
            if (indexKeywordSep >= 0) {
                syntaxError = true;
            }
            indexKeywordSep = i;
        }
    }

    // end='' and sep='' both given
    if (indexKeywordEnd >= 0 && indexKeywordSep >= 0) {
        // end='' is after sep=''
        if (indexKeywordEnd > indexKeywordSep) {
            if (indexKeywordEnd != terms.length - 1 || indexKeywordSep != terms.length - 2) {
                syntaxError = true;
            }
        }
        // sep='' is after end=''
        else {
            if (indexKeywordEnd != terms.length - 2 || indexKeywordSep != terms.length - 1) {
                syntaxError = true;
            }
        }
    }
    // Just end='' given
    else if (indexKeywordEnd >= 0) {
        if (indexKeywordEnd != terms.length - 1) {
            syntaxError = true;
        }
    }
    // Just sep='' given
    else if (indexKeywordSep >= 0) {
        if (indexKeywordSep != terms.length - 1) {
            syntaxError = true;
        }
    }

    // Find predefined variables
    var indexIntVar = [];
    for (let index = 0; index < terms.length; index += 1) {
        if (terms[index] === intVariableName) {
            indexIntVar.push(index);

            // ERROR: a variable name that doesn't exist (for the first 3 questions)
            if (!isQuestionWithVariables(currentQuestion, numLevels)) {
                error = 'syntax';
            }
        }
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Check whether string literal is missing double quotes
    if (terms.length === 1 && terms[0] && (terms[0][0] !== '"') && (terms[0][terms[0].length - 1] !== '"') &&
        terms[0].indexOf('"') === -1) {
        error = 'quotes';
        syntaxError = true;
    }

    // Error check that all terms are a literal, variable, or keyword param
    for (var i = 0; i < terms.length; i += 1) {
        // If term is variable name, then continue
        if (indexIntVar.indexOf(i) !== -1) {
            continue;
        }

        // Otherwise, check whether term is a literal
        if (i === indexKeywordEnd) {
            // |terms[i]| should start with end= then contain a valid Python string
            if (!terms[i].match(/end=\s*[\'\"]([^\'\"]*)[\'\"]/g)) {
                syntaxError = true;
            }
        } else if (i == indexKeywordSep) {
            // |terms[i]| should start with sep= then contain a valid Python string
            if (!terms[i].match(/sep=\s*[\'\"]([^\'\"]*)[\'\"]/g)) {
                syntaxError = true;
            }
        } else if ((terms[i].length > 0) && !isNumber(terms[i])) {
            if ((terms[i].length === 1) && (terms[i][0] === '"')) {
                syntaxError = true;
            }
            if ((terms[i][0] !== '"') || (terms[i][terms[i].length - 1] !== '"')) {
                syntaxError = true;
            }
            else if (terms[i].match(/\d+/)) {
                // String contains number literal
                usesNumericalLiteral = true;
            }
        }

    }

    // Ready to build an eval string
    var evalStr = '\"';

    // Get separator value
    var sep = ' ';
    if (indexKeywordSep >= 0) {
        var sepThenValidPythonStringRegex = /sep=\s*[\'\"]([^\'\"]*)[\'\"]/g;
        var result = sepThenValidPythonStringRegex.exec(terms[indexKeywordSep]);
        if (result) {
            if (result.length > 2) {
                syntaxError = true;
            }
            else {
                sep = result[1];
            }
        }
    }

    for (var i = 0; i < terms.length; i += 1) {
        if ((i === indexKeywordEnd) || (i === indexKeywordSep)) {
            break;
        }

        if (indexIntVar.indexOf(i) !== -1) {
            evalStr += intVariableValue;
        }
        else {
            evalStr += terms[i].slice(1, terms[i].length - 1);
        }

        var keywordEndOffset = indexKeywordEnd >= 0 ? 1 : 0;
        var keywordSepOffset = indexKeywordSep >= 0 ? 1 : 0;
        if (i < (terms.length - 1 - keywordEndOffset - keywordSepOffset)) {
            evalStr += sep;
        }
    }

    // The string in end=' ' go to end of output
    if (indexKeywordEnd >= 0) {
        var re = /end=\s*[\'\"]([^\'\"]*)[\'\"]/g;
        var end = re.exec(terms[indexKeywordEnd]);
        if (end) {
            if (end.length > 2) {
                syntaxError = true;
            }
            else {
                evalStr += end[1];
            }
        }
    }

    evalStr += '"';

    // If there is text and not a syntax error, then try to execute |evalStr|
    if ((textToProcess !== '') && !syntaxError) {
        var outputText = evalStr;
        try {
            // check for string correctness at least w/in JavaScript
            outputText = eval(outputText);

            // replace < and > with &lt; and &gt;, respectively
            outputText = outputText.replace(/</g, '&lt;');
            outputText = outputText.replace(/>/g, '&gt;');
        }
        catch(err) {
            error = 'syntax';
        }

        var checkStringReturn = checkStringEval(textToProcess, outputText);
        textToProcess = checkStringReturn.text;
        error = checkStringReturn.error || error;
    }
    else if (!(error)) {
        error = 'syntax';
    }

    return {
        text:                 textToProcess,
        error:                error,
        usesNumericalLiteral: usesNumericalLiteral
    };
}

// this function checks if eval() returned the correct string
function checkStringEval(textToProcess, outputText) {
    var textToReturn = '';
    var error = '';
    if (typeof outputText !== 'string') {
        // eval(outputText) returned 0; report syntax error and use textToProcess
        error = 'syntax';
        textToReturn = textToProcess;
    }
    else {
        // eval(outputText) okay; use outputText
        error = null;
        textToReturn = outputText;
    }

    return {
        text:  textToReturn,
        error: error
    };
}

// this function will replace the substring at the given index with the specified string
function replaceAt(text, oldIndex, newStr, rightIndex) {
    return text.substring(0, oldIndex) + newStr + text.substring(rightIndex);
}
