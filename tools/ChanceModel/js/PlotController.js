/* exported PlotController */
/* global AbstractController, Plotly, exampleToOptions, makeDotPlot, makeThresholdSlider, prettyPrintNumbers, makeBarChart */
'use strict';

// Config object passed to Plotly.
const config = {
    displaylogo: false,
    modeBarButtonsToRemove: [
        'zoom2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestGl2d', 'hoverClosestPie', 'toggleHover', 'resetViews',
        'sendDataToCloud', 'toggleSpikelines', 'resetViewMapbox', 'hoverClosestCartesian', 'hoverCompareCartesian',

        // May be useful in later sections.
        'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d',
    ],
};

// Layout object passed to Plotly.
const basicLayout = {
    width: 900,
    height: 500,
    xaxis: {
        fixedrange: true,
    },
    yaxis: {
        title: 'Number of repetitions',
        fixedrange: true,
    },
};

/**
    Control the rendering of the plot.
    @module PlotController
    @extends AbstractController
*/
class PlotController extends AbstractController {

    /**
        Render the plot.
        @method render
        @param {Array} counts Array of {Integer}. The counts for each possible number of successes in the simulation.
        @param {Number} probability The chance of success.
        @param {Integer} attempts The number of times to try for success per repetition.
        @param {String} example The example study to render.
        @param {Object} threshold Handles threshold if a threshold is to be used.
        @param {Number} threshold.initial The initial threshold value to use.
        @param {Function} threshold.change Callback function when repetition threshold changes.
        @return {void}
    */
    render({ counts, probability, attempts, example, threshold }) {
        const { isXAxisProportion, useDotPlot } = exampleToOptions[example];
        const bars = counts.map((count, xValue) =>
            ({
                xValue: isXAxisProportion ? xValue / attempts : xValue,
                yValue: count,
            })
        );
        const points = bars.map(
            ({ xValue, yValue }) => Array.from(Array(yValue))
                                         .map((ignored, index) => ({ xValue, yValue: index + 1 }))
        ).flat();
        const xTickMarks = bars.map(({ xValue }) => xValue);
        const thresholdValue = isXAxisProportion ? xTickMarks[threshold.initial] : threshold.initial;
        const graphOptions = {
            data: useDotPlot ? points : bars,
            thresholdValue,
            example,
        };
        const dataGraph = useDotPlot ?
                          makeDotPlot(graphOptions) :
                          makeBarChart(graphOptions);
        const graphs = [ dataGraph ];

        // Make the slider.
        const { lowerRange, upperRange } = this.computeXAxisRange(example, points, attempts);
        const thresholdSlider = makeThresholdSlider({ bars, points, xTickMarks, lowerRange, upperRange, thresholdValue, example });

        // Draw the plot.
        const layout = this.makeLayout({ example, thresholdSlider, lowerRange, upperRange, probability, counts });

        Plotly.newPlot(this.id, graphs, layout, config);

        // Handle threshold changes.
        const printedXTickMarks = prettyPrintNumbers(xTickMarks).map(number => Number(number));

        threshold.change(threshold.initial);
        document.getElementById(this.id).on('plotly_sliderchange', event => {
            const tickValue = Number(event.step.value);

            threshold.change(printedXTickMarks.indexOf(tickValue));
        });
    }

    /**
        Compute the lower and upper value for the x-axis.
        @method computeXAxisRange
        @param {String} example The example study to render.
        @param {Array} points Array of {Object}. Each point's x and y value.
        @param {Integer} attempts The number of times to try for success per repetition.
        @return {Object} The lower and upper range to use when rendering the x-axis.
    */
    computeXAxisRange(example, points, attempts) {
        const { autoZoom, isXAxisProportion } = exampleToOptions[example];
        const pointXValues = points.map(({ xValue }) => xValue);
        let lowerRange = 0;
        let upperRange = attempts;

        // Zoom-in to the relevant areas.
        if (autoZoom) {
            const zoomDistance = 3;
            const zoomProportion = zoomDistance / attempts;
            const smallestXValue = pointXValues[0];
            const largestXValue = pointXValues[pointXValues.length - 1];

            lowerRange = Math.max(0, smallestXValue - zoomProportion);
            upperRange = Math.min(attempts, largestXValue + zoomProportion);
        }
        else if (isXAxisProportion) {
            upperRange = 1;
        }

        return { lowerRange, upperRange };
    }

    /**
        Build the plot's layout.
        @method makeLayout
        @param {String} example The example study to make dots for.
        @param {Object} thresholdSlider The slider to add to the layout.
        @param {Number} lowerRange The lowest value on the x-axis.
        @param {Number} upperRange The highest value on the x-axis.
        @param {Array} counts Array of {Integer}. The counts for each possible number of successes in the simulation.
        @param {Number} probability The chance of success.
        @return {Object} The layout to use for the plot.
    */
    makeLayout({ example, thresholdSlider, lowerRange, upperRange, probability, counts }) {
        const { plotTitle, xAxisTitle, annotationFunction, hoverformat } = exampleToOptions[example];

        // Plotly adds properties to the layout object, so make a deep copy so each render() has a clean object.
        const copyBasicLayout = $.extend(true, {}, basicLayout);
        const layout = Object.assign({}, copyBasicLayout, thresholdSlider);

        layout.xaxis.range = [ lowerRange, upperRange ];
        layout.xaxis.title = xAxisTitle;
        layout.xaxis.hoverformat = hoverformat;
        layout.title = plotTitle;

        if (annotationFunction) {
            layout.annotations = annotationFunction({ probability, counts });
        }

        return layout;
    }
}
