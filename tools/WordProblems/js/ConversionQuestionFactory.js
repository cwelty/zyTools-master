/* global Question, LaTeXPrefix, LaTeXPostfix, multiplicationSymbol, makeLaTeXFraction, makeLaTeXValueAndUnit, makeLaTeXResult */
'use strict';

/**
    Factory that makes {Question}s.
    @class ConversionQuestionFactory
    @extends QuestionFactory from singleInputQuestionProgressionTool
    @constructor
*/
function ConversionQuestionFactory() {
    this.numberOfQuestions = 6;
}

/**
    Build {ConversionQuestionFactory}'s prototype after dependencies have loaded.
    @method buldConversionQuestionFactoryPrototype
    @return {void}
*/
function buildConversionQuestionFactoryPrototype() {
    ConversionQuestionFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    ConversionQuestionFactory.prototype.constructor = ConversionQuestionFactory;

    const utilities = require('utilities');
    const pickNumberInRange = utilities.pickNumberInRange;
    const newline = utilities.getNewline();

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    ConversionQuestionFactory.prototype.make = function(currentLevelIndex) {

        // Used for |currentLevelIndex| 0 and 5.
        let dollarsPerGallon = pickNumberInRange(2, 4);  // eslint-disable-line no-magic-numbers
        const squareFeetPerGallon = 50 * dollarsPerGallon * pickNumberInRange(1, 6, [ dollarsPerGallon ]);  // eslint-disable-line no-magic-numbers
        const squareFeet = squareFeetPerGallon * pickNumberInRange(3, 9, [ dollarsPerGallon ]);  // eslint-disable-line no-magic-numbers

        // Used for |currentLevelIndex| from 1 to 4.
        var milesPerGallon = (10 * pickNumberInRange(2, 5));
        var numberOfGallons = pickNumberInRange(2, 10);
        var numberOfMiles = milesPerGallon * numberOfGallons;

        var placeholder = 'Ex: 5';
        var answerIsNumber = true;
        var inputPrefix = '';
        var inputPostfix = '';
        var useWideInput = false;
        var prompt, expectedAnswer, explanation;
        switch (currentLevelIndex) {
            // Insert conversion factor (number only).
            case 0:
                expectedAnswer = squareFeetPerGallon;

                prompt = `A wall is ${squareFeet} sq ft.${newline}` +
                        `A gallon of paint covers ${squareFeetPerGallon} sq ft.${newline}` +
                        'Complete the conversion factor: 1 gallon / ? sq ft';

                inputPostfix = 'sq ft';

                explanation = 'The conversion factor is:' + newline
                            + LaTeXPrefix
                            + makeLaTeXFraction(1, 'gallon', false, squareFeetPerGallon, 'sq ft', false)
                            + LaTeXPostfix;
                break;

            // Insert conversion factor and unit.
            case 1:
                expectedAnswer = milesPerGallon + ' miles / 1 gallon';
                answerIsNumber = false;

                prompt = 'A car has ' + numberOfGallons + ' gallons of gas.' + newline
                       + 'The car gets ' + milesPerGallon + ' miles/gallon.' + newline
                       + 'Enter the complete conversion factor. Ex: 300 miles / 1 gallon';

                placeholder = 'Ex: 300 miles / 1 gallon';

                useWideInput = true;

                inputPrefix = LaTeXPrefix
                            + makeLaTeXValueAndUnit(numberOfGallons, 'gallons', false)
                            + multiplicationSymbol
                            + LaTeXPostfix;

                inputPostfix = LaTeXPrefix
                             + makeLaTeXResult('\\verb|_|', 'miles')
                             + LaTeXPostfix;

                explanation = 'Conversion factors convert from the initial units into the desired units.' + newline
                            + LaTeXPrefix
                            + makeLaTeXValueAndUnit(numberOfGallons, 'gallons', true)
                            + multiplicationSymbol
                            + makeLaTeXFraction(milesPerGallon, 'miles', false, 1, 'gallon', true)
                            + makeLaTeXResult(numberOfMiles, 'miles')
                            + LaTeXPostfix;
                break;

            // A single conversion.
            case 2:
                expectedAnswer = numberOfMiles;

                prompt = 'A car has ' + numberOfGallons + ' gallons of gas.' + newline
                       + 'How far can the car drive if the car gets ' + milesPerGallon + ' miles/gallon?';

                inputPostfix = 'miles';

                explanation = 'Conversion factors convert from the initial units into the desired units.' + newline
                            + LaTeXPrefix
                            + makeLaTeXValueAndUnit(numberOfGallons, 'gallons', true)
                            + multiplicationSymbol
                            + makeLaTeXFraction(milesPerGallon, 'miles', false, 1, 'gallon', true)
                            + makeLaTeXResult(numberOfMiles, 'miles')
                            + LaTeXPostfix;
                break;

            // A single conversion that requires the conversion to be flipped.
            case 3: // eslint-disable-line no-magic-numbers
                expectedAnswer = numberOfMiles;

                prompt = `A car has ${numberOfGallons} gallons of gas.${newline}` +
                        `How far can the car drive if 1 gallon of gas gets the car ${milesPerGallon} miles?`;

                inputPostfix = 'miles';

                explanation = `The conversion was described as 1 gallon / ${milesPerGallon} miles, but can be flipped ` +
                            `so the gallon units cancel.${newline}` +
                            `1) Flip the conversion factor (gallon/miles):${newline}` +
                            `${LaTeXPrefix}${makeLaTeXFraction(1, 'gallon', false, milesPerGallon, 'miles', false)}${LaTeXPostfix} and ` +
                            `${LaTeXPrefix}${makeLaTeXFraction(milesPerGallon, 'miles', false, 1, 'gallon', false)}${LaTeXPostfix}` +
                            ` are conversion factors.${newline}` +
                            `2) Convert:${newline}` +
                            `${LaTeXPrefix}${makeLaTeXValueAndUnit(numberOfGallons, 'gallons', true)}${multiplicationSymbol}` +
                            `${makeLaTeXFraction(milesPerGallon, 'miles', false, 1, 'gallon', true)}` +
                            `${makeLaTeXResult(numberOfMiles, 'miles')}${LaTeXPostfix}`;
                break;

            // Two conversions wherein one conversion is flipped. Also, give a hint about flipping the conversion.
            case 4: // eslint-disable-line no-magic-numbers
                dollarsPerGallon = pickNumberInRange(2, 5);

                var dollarsOfGas = dollarsPerGallon * numberOfGallons;

                expectedAnswer = numberOfMiles;

                prompt = 'A car gets ' + milesPerGallon + ' miles/gallon.' + newline
                       + 'Gas costs ' + dollarsPerGallon + ' dollars/gallon.' + newline
                       + 'How far can the car drive with ' + dollarsOfGas + ' dollars of gas?' + newline
                       + 'Hint: Flip dollars/gallon for conversion.';

                inputPostfix = 'miles';

                explanation = 'Multiple conversion factors are used to convert dollars into miles.' + newline
                            + LaTeXPrefix
                            + makeLaTeXValueAndUnit(dollarsOfGas, 'dollars', true)
                            + multiplicationSymbol
                            + makeLaTeXFraction(1, 'gallon', true, dollarsPerGallon, 'dollars', true)
                            + multiplicationSymbol
                            + makeLaTeXFraction(milesPerGallon, 'miles', false, 1, 'gallon', true)
                            + makeLaTeXResult(numberOfMiles, 'miles')
                            + LaTeXPostfix;
                break;

            // Two conversions wherein one conversion is flipped.
            case 5: // eslint-disable-line no-magic-numbers
                expectedAnswer = (squareFeet / squareFeetPerGallon) * dollarsPerGallon;

                prompt = `A wall is ${squareFeet} sq ft.${newline}` +
                        `${squareFeetPerGallon} sq ft is covered by a gallon of paint.${newline}` +
                        `A gallon of paint costs ${dollarsPerGallon} dollars.${newline}` +
                        'How much money is needed to paint the wall?';

                inputPostfix = 'dollars';

                explanation = `The conversion was described as ${squareFeetPerGallon} sq ft/gallon, ` +
                            `but can be flipped so the sq ft units cancel. Then, the ${dollarsPerGallon} dollars / gallon ` +
                            `conversion factor is used to convert to dollars.${newline}` +
                            `1) Flip the sq ft/gallon:${newline}` +
                            `${LaTeXPrefix}${makeLaTeXFraction(squareFeetPerGallon, 'sq ft', false, 1, 'gallon', false)}${LaTeXPostfix} ` +
                            'and ' +
                            `${LaTeXPrefix}${makeLaTeXFraction(1, 'gallon', false, squareFeetPerGallon, 'sq ft', false)}${LaTeXPostfix} ` +
                            `are conversion factors.${newline}` +
                            `2) Convert:${newline}` +
                            `${LaTeXPrefix}${makeLaTeXValueAndUnit(squareFeet, 'sq ft', true)}${multiplicationSymbol}` +
                            `${makeLaTeXFraction(1, 'gallon', true, squareFeetPerGallon, 'sq ft', true)}${multiplicationSymbol}` +
                            `${makeLaTeXFraction(dollarsPerGallon, 'dollars', false, 1, 'gallon', true)}` +
                            `${makeLaTeXResult(expectedAnswer, 'dollars')}${LaTeXPostfix}`;
                break;
        }

        return new Question(prompt, expectedAnswer, explanation, placeholder, answerIsNumber, inputPrefix, inputPostfix, useWideInput);
    };
}
