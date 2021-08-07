/* exported makeSimulationCounts, makeDotPlot, makeNormalDistribution, makeThresholdSlider, validateInputs, sum, pValueToStrengthWording,
            makeScissorsAnnotation, zScoreToStrengthWording, makeSurgeriesAnnotation, roundWithoutTrailingZeros, makeBarChart */
/* global exampleToOptions */
'use strict';

/**
    Compute the normalized y value for the given normalized x value.
    @method computeNormalYs
    @param {Array} normalXs Array of {Number}. The normalized x value.
    @param {Number} mean The mean of the all normalized x values.
    @param {Number} stdDev standard deviation of normalized x values.
    @param {Integer} repetitions The number of times to repeat a set of attempts.
    @return {Array} of {Number} The normalized y values that corresponds to the normalized x values.
*/
function computeNormalYs(normalXs, mean, stdDev, repetitions) {

    /*
        Formula for the Normal Distribution from:
        https://www.thoughtco.com/normal-distribution-bell-curve-formula-3126278

        This code breaks down that formula for readability and computation optimization.

        The formula has two pieces that do not change per x value, so can be computed once, before the map().

        The rest of the formula is implemented in the map().
    */
    const exponentDenominator = 2 * Math.pow(stdDev, 2); // eslint-disable-line no-magic-numbers
    const denominator = (stdDev * Math.sqrt(2 * Math.PI)); // eslint-disable-line no-magic-numbers

    return normalXs.map(normalX => {
        const exponentNumerator = -Math.pow((normalX - mean), 2); // eslint-disable-line no-magic-numbers
        const numerator = Math.exp(exponentNumerator / exponentDenominator);

        return (numerator * repetitions) / denominator;
    });
}

/**
    Run a simulation and count the number of successes for each repetition.
    @method makeSimulationCounts
    @param {Number} probability The chance of success.
    @param {Integer} attempts The number of times to attempt success per repetition.
    @param {Integer} repetitions The number of times to repeat a set of attempts.
    @return {Array} of {Integer} The counts for each possible number of successes in the simulation.
*/
function makeSimulationCounts(probability, attempts, repetitions) {

    // For each repetition, attempt success |attempts| times. Count the number of successes per repetition.
    const simulation = Array.from(Array(repetitions)).map(() =>
        Array.from(Array(attempts))
             .map(() => Math.random())
             .filter(event => event < probability)
             .length
    );

    // The bins are from 0 to |attempts|.
    const numberOfBins = attempts + 1;
    const bins = Array.from(Array(numberOfBins))
                      .map((value, index) => index);

    // Count how many repetitions go in each bin.
    return bins.map(
        bin => simulation.filter(count => count === bin)
                         .length
    );
}

/**
    Make the list of colors based on the x-values and a threshold that separates between normal (below threshold) and highlighted.
    @method makeBinaryColors
    @param {Array} xValues Array of {Number}. The x-values to color.
    @param {Integer} threshold The value at which to separate colors.
    @param {String} highlightDirection Which direction to highlight. 'left' or 'right'.
    @return {Array} of {String} The colors.
*/
function makeBinaryColors(xValues, threshold, highlightDirection) {

    // Colors from learn.zybooks.com.
    const normalColor = '#afafaf';
    const highlightColor = '#f57c00';

    const directionToThresholdFunction = {
        left: value => value > Number(threshold),
        right: value => value < Number(threshold),
    };
    const thresholdFunction = directionToThresholdFunction[highlightDirection];
    const numberOfNormalColors = xValues.filter(thresholdFunction).length;
    const normalColors = Array.from(Array(numberOfNormalColors)).fill(normalColor);
    const highlightColors = Array.from(Array(xValues.length - numberOfNormalColors)).fill(highlightColor);

    return (highlightDirection === 'left') ?
           highlightColors.concat(normalColors) :
           normalColors.concat(highlightColors);
}

/**
    Make the dot marker object passed to Plotly for a dot plot.
    @method makeDotMarker
    @param {Array} xValues Array of {Number}. The x-values of the dots.
    @param {Integer} threshold The value at which to separate colors.
    @param {String} example The example study to make dots for.
    @return {Object} The marker for dot plot, including the color of each dot.
*/
function makeDotMarker(xValues, threshold, example) {
    const { highlightDirection } = exampleToOptions[example];

    return {
        color: makeBinaryColors(xValues, threshold, highlightDirection),
        size: 8,
        symbol: 'circle',
    };
}

/**
    Make a dot plot.
    @method makeDotPlot
    @param {Array} data Array of {Object}. Each point to plot with |xValue| and |yValue|.
    @param {Integer} thresholdValue The initial repetition threshold.
    @param {String} example The example study to make dots for.
    @return {Object} The dot plot.
*/
function makeDotPlot({ data, thresholdValue, example }) {
    const xValues = data.map(({ xValue }) => xValue);
    const yValues = data.map(({ yValue }) => yValue);

    return {
        type: 'scatter',
        mode: 'markers',
        x: xValues, // eslint-disable-line id-length
        y: yValues, // eslint-disable-line id-length
        marker: makeDotMarker(xValues, thresholdValue, example),
        showlegend: false,
        hoverinfo: 'x+y',
        cliponaxis: false,
    };
}

/**
    Make a bar chart.
    @method makeBarChart
    @param {Array} data Array of {Object}. Each bar to chart with |xValue| and |yValue|.
    @param {Integer} thresholdValue The initial repetition threshold.
    @param {String} example The example study to make dots for.
    @return {Object} The bar chart.
*/
function makeBarChart({ data, thresholdValue, example }) {
    const xValues = data.map(({ xValue }) => xValue);
    const yValues = data.map(({ yValue }) => yValue);
    const { highlightDirection } = exampleToOptions[example];

    return {
        type: 'bar',
        x: xValues, // eslint-disable-line id-length
        y: yValues, // eslint-disable-line id-length
        marker: {
            color: makeBinaryColors(xValues, thresholdValue, highlightDirection),
        },
        showlegend: false,
        hoverinfo: 'x+y',
    };
}

/**
    @method makeNormalDistribution
    @param {Number} probability The chance of success.
    @param {Integer} attempts The number of times to try for success per repetition.
    @param {Integer} repetitions The number of times to repeat a set of attempts.
    @return {Object} The normal distribution.
*/
function makeNormalDistribution(probability, attempts, repetitions) {
    const mean = probability * attempts;
    const stdDev = Math.sqrt(attempts * probability * (1 - probability));
    const normalXInterval = 0.1;
    const numberOfXValues = (attempts / normalXInterval) + 1;
    const normalXs = Array.from(Array(numberOfXValues))
                          .map((value, index) => index * normalXInterval);
    const normalYs = computeNormalYs(normalXs, mean, stdDev, repetitions);

    return {
        type: 'scatter',
        mode: 'lines',
        x: normalXs, // eslint-disable-line id-length
        y: normalYs, // eslint-disable-line id-length
        marker: {
            color: 'rgb(20, 20, 20)',
        },
        showlegend: false,
        hoverinfo: 'skip',
    };
}

/**
    Return prettier numbers for printing.
    @method prettyPrintNumbers
    @param {Array} numbers Array of {Numbers}. The numbers to make pretty.
    @return {Array} of {String} Prettier numbers.
*/
function prettyPrintNumbers(numbers) {
    const decimalPlaces = 3;

    return numbers.map(number => number.toFixed(decimalPlaces));
}

/**
    Make a slider for the repetition threshold.
    @method makeThresholdSlider
    @param {Array} bars Array of {Object}. Each bar's x and y value.
    @param {Array} points Array of {Object}. Each point's x and y value.
    @param {Array} xTickMarks Array of {String}. Each possible tick mark of the x-axis.
    @param {Number} lowerRange The smallest x-axis tick mark to show.
    @param {Number} upperRange The largest x-axis tick mark to show.
    @param {Number} thresholdValue The initial repetition threshold.
    @param {String} example The example study to render.
    @return {Object} The repetition threshold slider.
*/
function makeThresholdSlider({ bars, points, xTickMarks, lowerRange, upperRange, thresholdValue, example }) {
    const { isXAxisProportion, useDotPlot, highlightDirection } = exampleToOptions[example];

    // Zoom into the x-axis to match the lower and upper range.
    const zoomedXTickMarks = xTickMarks.filter(xTickMark =>
        (Number(xTickMark) >= lowerRange) && (Number(xTickMark) <= upperRange)
    );

    const labels = isXAxisProportion ? prettyPrintNumbers(zoomedXTickMarks) : zoomedXTickMarks;
    const ticks = labels.map((label, index) => ({ label, xTickMark: zoomedXTickMarks[index] }));
    const xValues = (useDotPlot ? points : bars).map(({ xValue }) => xValue);
    const thresholdIndex = zoomedXTickMarks.indexOf(thresholdValue);

    // At each slider step, update the dot colors accordingly.
    const sliderSteps = ticks.map(({ label, xTickMark }) => ({
        label,
        method: 'restyle',
        args: [
            {
                marker: useDotPlot ?
                        makeDotMarker(xValues, xTickMark, example) :
                        { color: makeBinaryColors(xValues, xTickMark, highlightDirection) },
            },

            // Update only the first graph (at index 0), which is the dot plot.
            0,
        ],
    }));

    return {
        sliders: [
            {
                currentvalue: {
                    visible: false,
                },
                active: thresholdIndex,

                // (pad)ding: (t)op, (l)eft, (r)ight
                pad: {
                    t: 70, // eslint-disable-line id-length
                    l: 8, // eslint-disable-line id-length
                    r: 8, // eslint-disable-line id-length
                },
                steps: sliderSteps,
            },
        ],
    };
}

/**
    Return the errors and warnings if an input has an invalid value.
    @method validateInputs
    @param {Number} probability The chance of success.
    @param {Integer} attempts The number of times to try for success per repetition.
    @param {Integer} repetitions The number of times to repeat a set of attempts.
    @param {String} example The example study to render.
    @return {Object} Any errors and warnings in validation.
*/
function validateInputs(probability, attempts, repetitions, example) {
    const { validationWording } = exampleToOptions[example];
    const { noun, actionSingular, actionPlural, modelName } = validationWording;
    const errors = [];

    if ((probability < 0) || (probability > 1)) {
        errors.push('Probability must be between 0 and 1 (inclusive).');
    }
    if (attempts < 1) {
        errors.push(`The ${noun} study requires at least 1 ${actionSingular}.`);
    }
    if (repetitions < 1) {
        errors.push(`The ${noun} study requires at least 1 repetition.`);
    }

    // This long simulation was determined empirically.
    const veryLongSimulation = 1000000;

    if (exampleToOptions[example].useDotPlot && (attempts * repetitions) > veryLongSimulation) {
        errors.push(`Please reduce the number of ${actionPlural} or repetitions. Plotting will take too long.`);
    }

    const warnings = [];

    if (repetitions > 10000) { // eslint-disable-line no-magic-numbers
        warnings.push(`No additional information about ${modelName} is gained by simulating more than 10,000 repetitions. In most cases, 1,000 repetitions will be sufficient.`); // eslint-disable-line max-len
    }

    return { errors, warnings };
}

/**
    Sum the passed parameters.
    @method sum
    @param {Object} values The values to sum.
    @return {Object} The sum of the objects.
*/
function sum(...values) {
    return values.reduce((first, second) => first + second, 0);
}

/**
    Compute the mean of the given values.
    @method computeMean
    @param {Array} values Array of {Number}. The values for which to compute the mean.
    @return {Number} The mean.
*/
function computeMean(values) {
    return sum(...values) / values.length;
}

/**
    Return the standard deviation of the values.
    @method computeStdDev
    @param {Array} values Array of {Numbers}. The values to find the standard deviation of.
    @param {Number} mean The mean of the values.
    @return {Number} The standard deviation of the values.
*/
function computeStdDev(values, mean) {
    const squareOfDifferences = values.map(value => Math.pow(value - mean, 2)); // eslint-disable-line no-magic-numbers

    return Math.sqrt(sum(...squareOfDifferences) / values.length);
}

/**
    Compute the proportional and standard deviation of the counts.
    @method proportionalMeanAndStandardDeviation
    @param {Array} counts Array of {Integer}. The counts for each possible number of successes in the simulation.
    @return {Number} The mean proportion of the counts.
*/
function proportionalMeanAndStandardDeviation(counts) {
    const proportionalValues = counts.map(
        (count, xValue) => Array.from(Array(count))
                                .fill(xValue / counts.length)
    ).flat();
    const mean = computeMean(proportionalValues);

    return { mean, stdDev: computeStdDev(proportionalValues, mean) };
}

/**
    Convert the p-value to strength wording, like p-value = 0.001 to 'Very strong'.
    @method pValueToStrengthWording
    @param {Array} pValue The value to convert to strength wording.
    @return {String} The strength wording.
*/
function pValueToStrengthWording(pValue) {

    /*
        Evidence strength bounds:
        Very strong [0, .01]
        Strong      (.01, .05]
        Moderate    (.05, .1]
        Little      (.1, 1]
    */
    let strengthWording = 'Little to no';

    if (pValue <= 0.01) { // eslint-disable-line no-magic-numbers
        strengthWording = 'Very strong';
    }
    else if (pValue <= 0.05) { // eslint-disable-line no-magic-numbers
        strengthWording = 'Strong';
    }
    else if (pValue <= 0.1) { // eslint-disable-line no-magic-numbers
        strengthWording = 'Moderate';
    }

    return strengthWording;
}

/**
    Convert the z-score to strength wording, like z-score = 2.5 to 'Strong'.
    @method zScoreToStrengthWording
    @param {Array} zScore The value to convert to strength wording.
    @return {String} The strength wording.
*/
function zScoreToStrengthWording(zScore) {

    /*
        Evidence strength bounds:
        Very strong |zScore| >= 3
        Strong      3 > |zScore| >= 2
        Moderate    2 > |zScore| >= 1.5
        Little      1.5 > |zScore|
    */
    const zScoreAbs = Math.abs(zScore);

    let strengthWording = 'little to no';

    if (zScoreAbs >= 3) { // eslint-disable-line no-magic-numbers
        strengthWording = 'very strong';
    }
    else if (zScoreAbs >= 2) { // eslint-disable-line no-magic-numbers
        strengthWording = 'strong';
    }
    else if (zScoreAbs >= 1.5) { // eslint-disable-line no-magic-numbers
        strengthWording = 'moderate';
    }

    return strengthWording;
}

/**
    Return the number rounded without trailing zeros.
    @method roundWithoutTrailingZeros
    @param {Number} number The number to round.
    @param {Integer} decimalPlaces The precision of the rounding.
    @return {Number} The rounded number.
*/
function roundWithoutTrailingZeros({ number, decimalPlaces }) {
    return Number(number.toFixed(decimalPlaces));
}

/**
    Make a plot annotation, located in the top-right.
    @method makeAnnotationFromText
    @param {String} text The annotation text.
    @return {Array} of {Object} The annotation.
*/
function makeAnnotationFromText(text) {
    return [
        {
            xref: 'paper',
            yref: 'paper',
            x: 1, // eslint-disable-line id-length
            y: 1, // eslint-disable-line id-length
            xanchor: 'right',
            yanchor: 'bottom',
            text,
            showarrow: false,
            font: {
                size: 14,
            },
        },
    ];
}

/**
    Make an annotation for the scissors example about the null hypothesis.
    @method makeScissorsAnnotation
    @param {Number} probability The chance of success.
    @return {Array} of {Object} The annotation.
*/
function makeScissorsAnnotation({ probability }) {
    return makeAnnotationFromText(`$ H_0: \\pi = ${probability} $`);
}

/**
    Make an annotation for the surgeries example.
    @method makeSurgeriesAnnotation
    @param {Number} probability The chance of success.
    @param {Array} counts Array of {Integer}. The counts for each possible number of successes in the simulation.
    @return {Array} of {Object} The annotation.
*/
function makeSurgeriesAnnotation({ probability, counts }) {
    const { mean, stdDev } = proportionalMeanAndStandardDeviation(counts);
    const [ roundedMean, roundedStdDev ] = prettyPrintNumbers([ mean, stdDev ]);

    return makeAnnotationFromText([
        `$ H_0: \\pi = ${probability}`,
        `mean = ${roundedMean}`,
        `standard\\;deviation = ${roundedStdDev} $`,
    ].join('\\;\\;\\;'));
}
