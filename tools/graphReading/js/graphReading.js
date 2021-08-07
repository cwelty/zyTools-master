function GraphReading() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        /*
            The expected answer includes the following required strings:
            |expectedInput| is the expected input by the user.
            |explanation| is given after Check is clicked.
            |slope| and |yIntercept| define the line to draw.
            |xPoint| and |yPoint| is the Point on the line the user is prompted to find and is shown after Check is clicked.
            Written during |makeLevel| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            expectedInput: '',
            explanation:   '',
            slope:         '',
            yIntercept:    '',
            xPoint:        '',
            yPoint:        ''
        };

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['graphReading']({
            id: this.id
        });

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html: html,
            css: css,
            numToWin: 5,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.$input.focus();
                self.$input.removeClass('invalid-input');
            },
            reset: function() {
                self.makeLevel(0);
                self.$input.attr('disabled', true);
                self.$input.removeClass('invalid-input');
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                }
                // Input was invalid. Remove invalid input. Keep valid input.
                else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.$input.attr('disabled', false);

                    // Remove invalid input
                    self.$input.val('');
                }
                self.$input.focus();
            },
            isCorrect: function(currentQuestion) {
                var userInput = self.$input.val().trim();
                var expectedInput = self.expectedAnswer.expectedInput;

                self.progressionTool.userAnswer = userInput;
                self.progressionTool.expectedAnswer = expectedInput;

                // Valid input is a positive or negative integer
                var isInputValid = /^-?\d+$/.test(userInput);

                var isAnswerCorrect = false;
                if (!isInputValid) {
                    self.progressionTool.explanationMessage = 'Please enter a number.';
                    self.invalidInputEnteredGiveAnotherTry = true;
                }
                else {
                    isAnswerCorrect = (userInput === expectedInput) ? true : false;
                    self.progressionTool.explanationMessage = self.expectedAnswer.explanation;
                    self.drawLinearGraph(self.expectedAnswer.slope, self.expectedAnswer.yIntercept, self.expectedAnswer.xPoint, self.expectedAnswer.yPoint);
                }

                self.$input.attr('disabled', true);

                return isAnswerCorrect;
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$instructions = $thisTool.find('.instructions');
        this.$input = $thisTool.find('input');
        this.$graph = $thisTool.find('.graph');

        // Add event listener
        this.$input.keypress(function(event) {
            if (event.keyCode === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });

        // Default graph options
        this.graphOptions = {
            axes: {
                yaxis: {
                    label: 'f(x)',
                },
                xaxis: {
                    label: 'x',
                }
            },
            axesDefaults: {
                min:          this.axisMinTick,
                max:          this.axisMaxTick,
                tickInterval: 1,
                tickOptions:  {
                    showMark: false
                }
            },
            grid: {
                background: 'white',
                shadow:     false
            },
            height: 350,
            legend: {
                show: false
            },
            series: [
                {
                    color:      this.utilities.zyanteDarkBlue,
                    showMarker: false
                },
                {
                    color:      this.utilities.zyanteGray,
                    shadow:     false,
                    showMarker: false
                },
                {
                    color:      this.utilities.zyanteGray,
                    shadow:     false,
                    showMarker: false
                },
                {
                    color:      this.utilities.zyanteDarkBlue,
                    markerOptions: {
                        size:  10,
                        style: 'filledCircle'
                    }
                }
            ],
            seriesDefaults: {
                rendererOptions: {
                    smooth: true
                }
            },
            title: {
                show: false
            }
        };

        // Initialize equation
        this.makeLevel(0);
        this.$input.attr('disabled', true);
    };

    // Graph properties
    this.axisMinTick = -8;
    this.axisMaxTick = 8;

    /*
        Adjust the axis CSS after the plot has been rendered.
        Axis rendering writes CSS directly to the element style, so classes are superceded.
    */
    this.postPlotRenderingAxisAdjustments = function() {
        // Bring both axes in front of the graph
        var $bothAxes = $('#' + this.id + ' .jqplot-axis');
        $bothAxes.css('z-index', 2);

        // Adjust the axes location
        var $xAxis = $bothAxes.filter('.jqplot-xaxis');
        $xAxis.css('bottom', '151px');
        var $yAxis = $bothAxes.filter('.jqplot-yaxis');
        $yAxis.css('left', '177px');

        // Adjust the axes label location
        var $xAxisLabel = $xAxis.find('.jqplot-xaxis-label');
        $xAxisLabel.css('left', '411.5px');
        $xAxisLabel.css('bottom', '39px');
        var $yAxisLabel = $yAxis.find('.jqplot-yaxis-label');
        $yAxisLabel.css('top', '-18px');
        $yAxisLabel.css('left', '39px');

        // Hide the tick mark for 0 on both axes
        var $xAxisTicks = $xAxis.find('.jqplot-xaxis-tick');
        $xAxisTicks.eq(-1 * this.axisMinTick).hide();
        var $yAxisTicks = $yAxis.find('.jqplot-yaxis-tick');
        $yAxisTicks.eq(-1 * this.axisMinTick).hide();
    };

    /*
        Draw a graph with a line that has |slope| and |yIntercept|. Optionally, draw a point at position |xPoint| and |yPoint|.
        |slope| and |yIntercept| are required and numbers.
        |xPoint| and |yPoint| are optional and numbers.
    */
    this.drawLinearGraph = function(slope, yIntercept, xPoint, yPoint) {
        var linearFunction = [];
        var xAxis = [];
        var yAxis = [];
        var showPoint = (xPoint !== undefined) && (yPoint !== undefined);
        var point = showPoint ? [ [ xPoint, yPoint ] ] : [];

        // Generate points for line and both axes.
        for (var x = this.axisMinTick; x <= this.axisMaxTick; x++) {
            linearFunction.push([ x, (slope * x) + yIntercept ]);
            xAxis.push([ x, 0 ]);
            yAxis.push([ 0, x ]);
        }

        // Clear then redraw the graph
        this.$graph.empty();
        $.jqplot('graph-' + this.id, [ linearFunction, xAxis, yAxis, point ], this.graphOptions);

        this.postPlotRenderingAxisAdjustments();

        // If a point was drawn, then highlight the respective tick marks
        if (showPoint) {
            var offset = -1 * this.axisMinTick;

            var $xAxisTicks = $('#' + this.id + ' .jqplot-xaxis-tick');
            $xAxisTicks.eq(xPoint + offset).addClass('highlight-tick');

            var $yAxisTicks = $('#' + this.id + ' .jqplot-yaxis-tick');
            $yAxisTicks.eq(yPoint + offset).addClass('highlight-tick');
        }
    };

    /*
        Return the y-value for a line given the |slope|, |xValue|, and |yIntercept|.
        |slope|, |xValue|, and |yIntercept| are required and numbers.
    */
    this.computeYValue = function(slope, xValue, yIntercept) {
        return ((slope * xValue) + yIntercept);
    };

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.makeLevel = function(currentQuestionNumber) {
        var slope = this.utilities.pickNumberInRange(-2, 2, [ 0 ]);
        var yIntercept = this.utilities.pickNumberInRange(-2, 2, [ 0 ]);
        this.drawLinearGraph(slope, yIntercept);

        var instructions = '';
        var expectedInput = '';
        var xValue = 0;
        var yValue = 0;
        if (currentQuestionNumber === 0) {
            xValue = 0;
            yValue = this.computeYValue(slope, yValue, yIntercept);
            instructions = 'f(0) = ';
            expectedInput = yIntercept;
        }
        else if (currentQuestionNumber === 1) {
            xValue = this.utilities.pickNumberInRange(1, 3);
            yValue = this.computeYValue(slope, xValue, yIntercept);
            instructions = 'f(' + xValue + ') = ';
            expectedInput = yValue;
        }
        else if (currentQuestionNumber === 2) {
            xValue = this.utilities.pickNumberInRange(-3, -1);
            yValue = this.computeYValue(slope, xValue, yIntercept);
            instructions = 'f(' + xValue + ') = ';
            expectedInput = yValue;
        }
        else if (currentQuestionNumber === 3) {
            xValue = this.utilities.pickNumberInRange(-3, 3, [ 0 ]);
            yValue = this.computeYValue(slope, xValue, yIntercept);
            instructions = 'If x is ' + xValue + ', then f(x) = ';
            expectedInput = yValue;
        }
        else if (currentQuestionNumber === 4) {
            xValue = this.utilities.pickNumberInRange(-3, 3, [ 0 ]);
            yValue = this.computeYValue(slope, xValue, yIntercept);
            instructions = 'If f(x) is ' + yValue + ', then x = ';
            expectedInput = xValue;
        }

        this.$instructions.html(instructions);
        this.expectedAnswer = {
            expectedInput: String(expectedInput),
            explanation:   'At x = ' + xValue + ', the line has f(x) = ' + yValue + '. Point (' + xValue + ', ' + yValue + ') is shown above.',
            slope:         slope,
            yIntercept:    yIntercept,
            xPoint:        xValue,
            yPoint:        yValue
        };

        // Reset and enable input
        this.$input.val('').attr('disabled', false);
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var graphReadingExport = {
    create: function() {
        return new GraphReading();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = graphReadingExport;
