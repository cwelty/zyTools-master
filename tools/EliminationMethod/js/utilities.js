/* exported plusOrMinus, manageAddition, makeLatexSystemOfEquations */
'use strict';

/**
    Returns a plus or minus sign depending on the passed value.
    @method plusOrMinus
    @param {Number} value The value to check.
    @return {String} A '+' or '-' sign.
*/
function plusOrMinus(value) {
    return (value >= 0 ? '+' : '-');
}

/**
    Checks if a number is positive or negative to add a '+' sign. If the number is 1 or -1 it just returns 'y' or '-y'.
    Negative numbers come with the negative sign, in those cases don't add any sign.
    @method manageAddition
    @param {Number} addition The number that multiplies |variable|.
    @param {String} variable The variable to place in the addition.
    @param {String} [sign='+'] The sign of the addition
    @return {String} A string containing the addition.
*/
function manageAddition(addition, variable, sign = '+') {
    let variableAddition = `${addition}${variable}`;
    const hasVariable = variable !== '';

    // Ex: +3x or +0y
    if (addition > 1 || addition === 0) {
        variableAddition = `${sign}${addition}${variable}`;
    }

    // Ex: +x or +y
    else if ((addition === 1) && hasVariable) {
        variableAddition = `${sign}${variable}`;
    }

    // Ex: -x or -y
    else if ((addition === -1) && hasVariable) {
        variableAddition = `-${variable}`;
    }

    // Other cases ex: -4x or -5y
    return variableAddition;
}

/**
    Return a LaTeX system of equations.
    @method makeLatexSystemOfEquations
    @private
    @param {String} firstEquation The first equation in a LaTeX formatted string.
    @param {String} secondEquation The second equation in a LaTeX formatted string.
    @return {String} The system of equations in a LaTeX string.
*/
function makeLatexSystemOfEquations(firstEquation, secondEquation) {
    return require('utilities').envelopLatex(`\\begin{matrix} \\begin{align} ${firstEquation} \\\\` +
                                `${secondEquation} \\end{align} \\end{matrix}\\`);
}
