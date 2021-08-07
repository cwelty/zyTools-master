var LaTeXPrefix = '\\(\\require{cancel}';
var LaTeXPostfix = '\\)';
var multiplicationSymbol = '\\cdot';
var equalSymbol = '\\small{ \\; = \\; }';

/**
    Return LaTeX for a value and unit. Ex: 4 gallons
    @method _makeLaTeXValueAndUnit
    @param {Number} value The value of the unit.
    @param {String} unit The unit for the value.
    @param {Boolean} cancelUnit Whether to cancel the unit.
    @return {String} LaTeX with a value and cancelled unit.
*/
function makeLaTeXValueAndUnit(value, unit, cancelUnit) {
    const unitLaTeX = cancelUnit ? `\\cancel{\\text{${unit}}}` : `\\text{${unit}}`;

    return `${value}\\; ${unitLaTeX}`;
}

/**
    Return a LaTeX fraction with a numerator and denominator that each have a value and unit.
    @method _makeLaTeXFraction
    @param {Number} numeratorValue The value of the numerator.
    @param {String} numeratorUnit The unit of the numerator.
    @param {Boolean} numeratorCancelUnit Whether the numerator's unit should be cancelled.
    @param {Number} denominatorValue The value of the denominator.
    @param {String} denominatorUnit The unit of the denominator.
    @param {Boolean} denominatorCancelUnit Whether the denominator's unit should be cancelled.
    @return {String} LaTeX with fraction that includes a numerator and denominator.
*/
function makeLaTeXFraction(numeratorValue, numeratorUnit, numeratorCancelUnit, denominatorValue, denominatorUnit, denominatorCancelUnit) {
    return ('\\large{\\frac{'
         + makeLaTeXValueAndUnit(numeratorValue, numeratorUnit, numeratorCancelUnit)
         + '}{'
         + makeLaTeXValueAndUnit(denominatorValue, denominatorUnit, denominatorCancelUnit)
         + '}}');
}

/**
    Return LaTeX for an equal sign, value, and unit.
    @method _makeLaTeXResult
    @param {Number} value The value of the unit.
    @param {String} unit The unit for the value.
    @return {String} LaTeX with a value and cancelled unit.
*/
function makeLaTeXResult(value, unit) {
    return ('\\small{ \\; = \\;  ' + makeLaTeXValueAndUnit(value, unit, false) + '}');
}
