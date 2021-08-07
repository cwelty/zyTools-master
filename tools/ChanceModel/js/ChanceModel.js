/* exported ChanceModel */
/* global InputsController, PlotController, SummaryController, makeSimulationCounts, pValueToStrengthWording, sum, prettyPrintNumbers,
          zScoreToStrengthWording, proportionalMeanAndStandardDeviation, roundWithoutTrailingZeros */
'use strict';

/**
    Build a chance model from student input, then plot that model's results.
    @module ChanceModel
    @return {void}
*/
class ChanceModel {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned to this instance of the module.
            @property id
            @type {Number}
            @default null
        */
        this.id = null;

        /**
            Dictionary of templates for this module.
            @property templates
            @type {Object}
        */
        this.templates = this['<%= grunt.option("tool") %>'];

        /**
            Reference to the parent of this module.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The plot showing the chance model results.
            @property plot
            @type {PlotController}
            @default null
        */
        this.plot = null;
    }

    /**
        Initialize the viewer.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this module, defined in README.md.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.parentResource = parentResource;

        const html = this.templates.chanceModel({ id });
        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        $(`#${id}`).html(css + html);

        // Make controllers.
        const example = options.example;
        const inputs = new InputsController(this.makeId('inputs'), this.templates);
        const plot = new PlotController(this.makeId('plot'), this.templates);
        const summary = new SummaryController(this.makeId('summary'), this.templates, example, parentResource);

        inputs.render({
            example,
            preSimulate: () => {
                [ plot, summary ].forEach(controller => controller.empty());
            },
            simulate: (probability, attempts, repetitions) => {
                const counts = makeSimulationCounts(probability, attempts, repetitions);
                const threshold = {
                    initial: Math.round(attempts * probability),
                };

                if (example === 'Buzz') {
                    const header = `Result of ${repetitions} repetitions of ${attempts} button pushes with ${probability} probability`;

                    threshold.change = newThreshold => {
                        const countsOverThreshold = counts.filter((count, index) => index >= newThreshold);
                        const repetitionsOverThreshold = sum(...countsOverThreshold);
                        const percentageOverThreshold = Math.round((repetitionsOverThreshold * 100) / repetitions); // eslint-disable-line no-magic-numbers
                        const content = [
                            `${repetitionsOverThreshold} / ${repetitions} (${percentageOverThreshold}%)`,
                            ` of the simulated "could-have-been" statistics had at least ${newThreshold} correct pushes.`,
                        ].join('');

                        summary.render({ header, content });
                    };
                }
                else if (example === 'scissors') {
                    const header = `Result of ${repetitions} repetitions of ${attempts} rounds with ${probability} proportion`;

                    threshold.change = newThreshold => {
                        const countsUnderThreshold = counts.filter((count, index) => index <= newThreshold);
                        const repetitionsUnderThreshold = sum(...countsUnderThreshold);
                        const beingPluralness = repetitionsUnderThreshold === 1 ? 'was' : 'were';
                        const proportion = roundWithoutTrailingZeros({ number: newThreshold / attempts, decimalPlaces: 3 });
                        const pValue = roundWithoutTrailingZeros({ number: repetitionsUnderThreshold / repetitions, decimalPlaces: 2 });
                        const strengthWording = pValueToStrengthWording(pValue);
                        const content = [
                            `${repetitionsUnderThreshold} / ${repetitions} of the simulated`,
                            `proportions ${beingPluralness}`,
                            `at most ${proportion} scissors.`,
                            `<b>p-value</b>: ${pValue}.`,
                            `<b>Strength of evidence</b>: ${strengthWording}.`,
                        ].join(' ');

                        summary.render({ header, content });
                    };
                }
                else if (example === 'surgeries') {
                    const header = `Result of ${repetitions} repetitions of ${attempts} heart surgeries with ${probability} proportion`;
                    const { mean, stdDev } = proportionalMeanAndStandardDeviation(counts);

                    threshold.change = newThreshold => {
                        const proportion = newThreshold / attempts;
                        const zScore = (proportion - mean) / stdDev;
                        const strengthWording = zScoreToStrengthWording(zScore);
                        const [
                            roundedProportion, roundedMean, roundedStdDev, roundedZscore,
                        ] = prettyPrintNumbers([ proportion, mean, stdDev, zScore ]);
                        const content = [
                            `$ z = \\frac{(${roundedProportion} - ${roundedMean})}{${roundedStdDev}} = ${roundedZscore} $`,
                            `represents ${strengthWording} evidence against the null hypothesis.`,
                        ].join(' ');

                        summary.render({ header, content, hasLatex: true });
                    };
                }

                plot.render({ counts, probability, attempts, repetitions, example, threshold });
            },
        });
    }

    /**
        Return the full id for the given element name.
        @method makeId
        @param {String} name The name of the element.
        @return {String} The full id for the given element name.
    */
    makeId(name) {
        return `${name}-${this.id}`;
    }
}

module.exports = {
    create: function() {
        return new ChanceModel();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
