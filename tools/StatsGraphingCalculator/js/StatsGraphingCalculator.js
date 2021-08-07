'use strict';

/* global Distribution, UserInput, Plotly */

/**
    A tool that generates graphs depending on user input. Calculates probabilities.
    @module StatsGraphingCalculator
    @return {void}
*/
class StatsGraphingCalculator {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The handlebars template functions.
            @property templates
            @type {Object}
        */
        this.templates = this['<%= grunt.option("tool") %>'];

        /**
            The CSS styles of the tool.
            @property style
            @type {String}
        */
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';

        /**
            The unique ID assigned to this module.
            @property id
            @type {String}
            @default null
        */
        this.id = null;

        /**
            A jQuery reference to this tool.
            @property $tool
            @type {jQuery}
            @default null
        */
        this.$tool = null;

        /**
            Dictionary of functions to access resources and submit activity.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The distribution the graph follows. Normal distribution is the default distribution.
            @property distribution
            @type {String}
            @default 'normal'
        */
        this.distribution = 'normal';
    }

    /**
        Initialize the stats graphing calculator tool.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.$tool = $(`#${id}`);
        this.parentResource = parentResource;
        this.distribution = options && options.distribution ? options.distribution : 'normal';
        this.calculate = options && options.calculate ? options.calculate : 'ztop';
        require('utilities').addIfConditionalHandlebars();

        const html = this.templates.statsGraphingCalculator({ id: this.id, calculate: this.calculate });

        this.$tool.html(html + this.css);

        this.$tool.find('select#case').on('change', event => {
            this.selectChanged(event);
        });

        this.$tool.find('button#build-graph').click(() => {
            this.calculateGraph();
        });

        this.$tool.find('.user-input').keyup(event => {
            const enterKeyCode = 13;

            if (event.keyCode === enterKeyCode) {
                this.calculateGraph();
            }
        });

        // Hide unneeded input boxes and build an empty graph.
        this.selectChanged();
    }

    /**
        Add or remove input field for the between case.
        @method selectChanged
        @return {void}
    */
    selectChanged() {
        const selectedValue = this.$tool.find('select#case').val();
        const $betweenCaseClass = this.$tool.find('.between-case');
        const $userValueLabel = this.$tool.find('#user-value-label');

        // 'between' case in probability to z-score only uses one parameter, no need to show or hide.
        if ((selectedValue === 'between') && (this.calculate !== 'ptoz')) {
            $betweenCaseClass.show();
            $userValueLabel.text('X¹:');
        }
        else {
            const labelText = this.calculate === 'ztop' ? 'X:' : 'Probability:';

            $betweenCaseClass.hide();
            $userValueLabel.text(labelText);
        }
    }

    /**
        Builds the parameters to calculate from z-score to probability.
        @method buildParametersZToProbability
        @param {Distribution} distribution The distribution object.
        @param {UserInput} userInput The user entered parameters that define the distribution and the graph.
        @return {void}
    */
    buildParametersZToProbability(distribution, userInput) {
        let zScoreOf = '';
        let answer = distribution.zToProbability(userInput.userValue);
        const answerForBetween = userInput.userValue2 ? distribution.zToProbability(userInput.userValue2) - answer : NaN;
        const parameters = {};

        switch (userInput.selectedCase) {
            case 'less-than':
                parameters.maxValue = userInput.userValue;
                zScoreOf = `z < ${parameters.maxValue}`;
                break;
            case 'greater-than':
                answer = 1 - answer;
                parameters.minValue = userInput.userValue;
                zScoreOf = `z > ${parameters.minValue}`;
                break;
            case 'between':
                answer = answerForBetween;
                parameters.minValue = userInput.userValue;
                parameters.maxValue = userInput.userValue2;
                zScoreOf = `${parameters.minValue} < z < ${parameters.maxValue}`;
                break;
            default:
                userInput.printError('Invalid dropdown option selected');
        }

        this.writeAnswer(answer, zScoreOf);
        this.postEvent(userInput, answer, zScoreOf);
        return parameters;
    }

    /**
        Builds the parameters to calculate from probability to z-score.
        @method buildParametersProbabilityToZ
        @param {Distribution} distribution The distribution object.
        @param {UserInput} userInput The user entered parameters that define the distribution and the graph.
        @return {void}
    */
    buildParametersProbabilityToZ(distribution, userInput) {
        let probability = 0;
        let answer = NaN;
        let zScoreOf = '';
        const decimalPlaces = 4;
        const parameters = {};

        switch (userInput.selectedCase) {
            case 'less-than':
                probability = distribution.probabilityToZ(userInput.userValue).toFixed(decimalPlaces);
                answer = userInput.userValue;
                parameters.maxValue = probability;
                zScoreOf = `z < ${parameters.maxValue}`;
                break;
            case 'greater-than':

                // probabilityToZ < 0.2 = probabilityToZ > (1 - 0.2)
                probability = distribution.probabilityToZ(1 - userInput.userValue).toFixed(decimalPlaces);
                answer = userInput.userValue;
                parameters.minValue = probability;
                zScoreOf = `z > ${parameters.minValue}`;
                break;
            case 'between': // eslint-disable-line no-case-declarations
                const probabilityLeft = (1 - userInput.userValue) / 2; // eslint-disable-line no-magic-numbers
                const probabilityRight = 1 - probabilityLeft; // eslint-disable-line no-magic-numbers

                answer = userInput.userValue;
                parameters.minValue = distribution.probabilityToZ(probabilityLeft).toFixed(decimalPlaces);
                parameters.maxValue = distribution.probabilityToZ(probabilityRight).toFixed(decimalPlaces);

                zScoreOf = `${parameters.minValue} < z < ${parameters.maxValue}`;
                break;
            default:
                userInput.printError('Invalid dropdown option selected');
        }

        this.writeAnswer(answer, zScoreOf);
        this.postEvent(userInput, answer, zScoreOf);
        return parameters;
    }

    /**
        Writes the result calculated.
        @method writeAnswer
        @param {Number} answer The resulting probability calculated.
        @param {String} zScoreOf The z-score conditional.
        @return {void}
    */
    writeAnswer(answer, zScoreOf) {
        const $answer = this.$tool.find('p.answer');
        const decimalPlaces = 4;

        if (isNaN(answer)) {
            $answer.text('');
        }
        else {
            $answer.removeClass('error').text(`P(${zScoreOf}) = ${answer.toFixed(decimalPlaces)}`);
        }
    }

    /**
        Submits a completion event.
        @method postEvent
        @param {UserInput} userInput An object containing all user inputted data.
        @param {Number} probability The probability calculated or asked for.
        @param {String} zScore The z-score calculated or conditional.
        @return {void}
    */
    postEvent(userInput, probability, zScore) {
        this.parentResource.postEvent({
            part: 0,
            complete: true,
            metadata: {
                probability,
                mean: userInput.mean,
                selectedCase: userInput.selectedCase,
                std: userInput.std,
                userValue: userInput.userValue,
                userValue2: userInput.userValue2,
                zScore,
            },
        });
    }

    /**
        Builds the graph with user data.
        @method calculateGraph
        @return {void}
    */
    calculateGraph() {
        const graphDiv = `graph-container-${this.id}`;
        const $graphContainer = $(`#graph-container-${this.id}`);
        const userInput = new UserInput(this.$tool);

        if (userInput.hasError(this.calculate)) {
            $graphContainer.text('Enter each input above, then press Build graph.');
            return;
        }

        const distribution = new Distribution(this.distribution, userInput);
        let graphingParameters = {};

        // If user entered a Probability or X value. Calculate the graph.
        if (userInput.userValue) {
            if (this.calculate === 'ptoz') {
                graphingParameters = this.buildParametersProbabilityToZ(distribution, userInput);
            }
            else {
                graphingParameters = this.buildParametersZToProbability(distribution, userInput);
            }
        }
        else {
            this.postEvent(userInput, null, null);
        }

        const lines = [];
        const line = this.getLineForGraph(distribution, graphingParameters);
        const fillArea = this.getLineForGraph(distribution, graphingParameters, true);

        lines.push(line);
        if (fillArea) {
            lines.push(fillArea);
        }

        const layout = {
            paper_bgcolor: 'transparent', // eslint-disable-line camelcase
            plot_bgcolor: 'transparent', // eslint-disable-line camelcase
            showlegend: false,
        };

        // Remove some buttons from Plotly's toolbar.
        const options = {
            modeBarButtonsToRemove: [ 'sendDataToCloud', 'pan2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d',
                                      'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines' ],
            displaylogo: false,
        };

        $graphContainer.empty();
        Plotly.purge(graphDiv);
        Plotly.newPlot(graphDiv, lines, layout, options);
    }

    /**
        Calculates a line for the graph made with up to 100 points.
        @method getLineForGraph
        @param {Distribution} distribution The distribution to use to calculate the lines.
        @param {Object} parameters The parameters that define the distribution.
        @param {Boolean} [fillArea=false] Whether the generated line will fill the area under it.
        @return {Object} An object that represents a line for Plotly.
    */
    getLineForGraph(distribution, parameters, fillArea = false) {

        /*
            Setup parameters. These parameters work for the normal distribution.
            99.7% of the observations should fall within three standard deviations of the mean.
        */
        const stdFromMean = 3;
        const numPoints = 100;
        const threeStdLeft = distribution.mean - (distribution.std * stdFromMean);
        const threeStdRight = distribution.mean + (distribution.std * stdFromMean);

        const startValue = fillArea && !isNaN(parameters.minValue) ? Math.max(parameters.minValue, threeStdLeft) : threeStdLeft;
        const endValue = fillArea && !isNaN(parameters.maxValue) ? Math.min(parameters.maxValue, threeStdRight) : threeStdRight;
        const totalLength = endValue - startValue;
        const distanceBetweenPoints = totalLength / numPoints;
        const verySmallDistance = 0.000001;

        if (totalLength <= 0 || distanceBetweenPoints <= verySmallDistance) {
            return null;
        }

        const xValues = [];
        const yValues = [];

        for (let xValue = startValue; xValue <= endValue + verySmallDistance; xValue += distanceBetweenPoints) {
            xValues.push(xValue);
            yValues.push(distribution.probabilityDistributionFunction(xValue));
        }

        const line = {
            x: xValues, // eslint-disable-line id-length
            y: yValues, // eslint-disable-line id-length
            line: {

                // #f57c00 Is the orange color of the buttons in 2.0.
                color: '#f57c00',
                shape: 'spline',
            },
            mode: 'lines',
            name: '',
        };

        if (fillArea) {
            line.fill = 'tozeroy';
            line.hoverinfo = 'none';
        }

        return line;
    }
}

module.exports = {
    create: function() {
        return new StatsGraphingCalculator();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    supportsAccessible: false,
};
