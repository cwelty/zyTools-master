function linearGrapher() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.utilities = require('utilities');

        var html = this[this.name]['linearGrapher']({ id: this.id });

        $('#' + this.id).html(this.css + html);

        // Initializes the slider for variable m
        var self = this;
        $('#' + this.id + ' .variable-m-slider').slider({
            min: -5,
            max: 5,
            step: 1,
            value: 1,
            slide: function(event, ui) {
                $('#' + self.id + ' .m-value').text(ui.value);
                self.clearAndDraw();
            }
        });

        // Initializes the slider for variable b
        $('#' + this.id + ' .variable-b-slider').slider({
            min: -5,
            max: 5,
            value: 0,
            slide: function(event, ui) {
                $('#' + self.id + ' .b-value').text(ui.value);
                self.clearAndDraw();
            }
        });

        // Gets references to the canvases and their contexts
        this.graphCanvas = $('#' + this.id + ' .graph-canvas')[0];
        this.graphContext = this.graphCanvas.getContext('2d');

        this.lineCanvas = $('#' + this.id + ' .line-canvas')[0];
        this.lineContext = this.lineCanvas.getContext('2d');

        this.slopeCanvas = $('#' + this.id + ' .slope-canvas')[0];
        this.slopeContext = this.slopeCanvas.getContext('2d');

        // Initial draw
        this.clearAndDraw();

        $('#' + this.id).mousedown(function() {
            if (!self.submittedAlready) {
                self.parentResource.postEvent({
                    answer: '',
                    metadata: {
                        event: 'User clicked the activity'
                    },
                    complete: true,
                    part:     0
                });
                self.submittedAlready = true;
            }
        });
    };

    // Clears canvas and redraws grid along with the equation
    this.clearAndDraw = function() {
        this.drawGrid();
        this.drawLine();
    };

    // Draws an [-8, 8] graph grid
    this.drawGrid = function() {
        this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);

        var canvasPadding = 10;
        var canvasCellSpacing = 20;
        var lineWidth = 0.5;
        var canvasPaddingMinusLineWidth = 2 * (canvasPadding - lineWidth);
        var squareLength = this.graphCanvas.width - canvasPaddingMinusLineWidth;
        var halfCanvasWidth = squareLength / 2;
        var axisLabelColor = this.utilities.zyanteExpiredGray;

        // Draw x-axis & y-axis grid lines
        for (var xtick = 0; xtick <= squareLength - canvasCellSpacing; xtick += canvasCellSpacing) {
            this.graphContext.beginPath();
            // Offsets account for the white space padding of the canvas and line width
            this.graphContext.moveTo(canvasPadding + lineWidth + xtick, canvasCellSpacing);
            this.graphContext.lineTo(canvasPadding + lineWidth + xtick, squareLength);

            this.graphContext.moveTo(canvasPadding, canvasCellSpacing + lineWidth + xtick);
            this.graphContext.lineTo(squareLength - canvasPadding, canvasCellSpacing + lineWidth + xtick);
            this.graphContext.strokeStyle = this.utilities.zyanteTableGray;
            this.graphContext.lineWidth = 1;
            this.graphContext.stroke();
        }
        console.log('graph drawn');

        this.graphContext.font = '20px Helvetica';
        this.graphContext.fillStyle = axisLabelColor;

        // Y-axis
        this.graphContext.beginPath();
        this.graphContext.moveTo(halfCanvasWidth, canvasCellSpacing);
        this.graphContext.lineTo(halfCanvasWidth, squareLength);
        this.graphContext.strokeStyle = axisLabelColor;
        this.graphContext.lineWidth = 2;
        this.graphContext.fillText('y', halfCanvasWidth - 1, canvasPadding);
        this.graphContext.stroke();

        // X-axis
        this.graphContext.beginPath();
        this.graphContext.moveTo(canvasPadding, halfCanvasWidth + canvasPadding);
        this.graphContext.lineTo(squareLength - canvasPadding, halfCanvasWidth + canvasPadding);
        this.graphContext.strokeStyle = axisLabelColor;
        this.graphContext.lineWidth = 2;
        this.graphContext.fillText('x', squareLength - 5, halfCanvasWidth + canvasPadding);
        this.graphContext.stroke();

        this.graphContext.font = '10px Helvetica';
        // Draw tick labels -- Range: [-8, 8]
        for (var tick = 20, currentTick = 0; tick <= (squareLength - (2 * canvasCellSpacing)); tick += canvasCellSpacing, currentTick++) {
            if (currentTick === 8) continue;

            // x-axis labels
            this.graphContext.fillText(-8 + currentTick, tick + canvasPadding, halfCanvasWidth + canvasCellSpacing);

            // y-axis labels
            this.graphContext.fillText(8 - currentTick, halfCanvasWidth - canvasPadding - (2 * lineWidth), tick + canvasCellSpacing);
        }
    };

    // Draws the line y = mx + b
    this.drawLine = function() {
        this.lineContext.clearRect(0, 0, this.lineCanvas.width, this.lineCanvas.height);

        // y = mx + b
        var m = parseFloat($('#' + this.id + ' .m-value').text());
        var b = parseFloat($('#' + this.id + ' .b-value').text());

        // Calculates Y values for two points of the line
        var maxAxisValue = 10;

        var leftPoint = -(m * (maxAxisValue) - b);
        var rightPoint = m * (maxAxisValue) + b;

        var canvasCellSpacing = 20;

        // Draws line based on the two computed points
        this.lineContext.beginPath();

        var canvasWidth = this.graphCanvas.width;
        var halfGridWidth = (canvasWidth - canvasCellSpacing) / 2;
        var canvasPaddingWithLine = 11;

        // Normalize width by subtracting out the padding from both sides (20)
        this.lineContext.moveTo(halfGridWidth - (canvasWidth / 2), halfGridWidth - (leftPoint * canvasCellSpacing) + canvasPaddingWithLine);
        this.lineContext.lineTo(halfGridWidth + (canvasWidth / 2), halfGridWidth - (rightPoint * canvasCellSpacing) + canvasPaddingWithLine);
        this.lineContext.strokeStyle = this.utilities.zyanteLighterBlue;
        this.lineContext.lineWidth = 2;
        this.lineContext.stroke();

        var yInterceptHeight = halfGridWidth - (b * canvasCellSpacing) + canvasPaddingWithLine;

        this.slopeContext.clearRect(0, 0, this.lineCanvas.width, this.lineCanvas.height);

        // Draw dashed lines for the slope triangle
        this.slopeContext.beginPath();
        this.slopeContext.lineWidth = 1;
        this.slopeContext.strokeStyle = this.utilities.zyanteDarkBlue;
        this.slopeContext.setLineDash([ 4 ]);

        // Slope run
        this.slopeContext.moveTo(halfGridWidth, yInterceptHeight);
        this.slopeContext.lineTo(halfGridWidth + canvasCellSpacing, yInterceptHeight);

        // Slope rise
        var secondPlotPoint = halfGridWidth - ((m + b) * canvasCellSpacing) + canvasPaddingWithLine;
        this.slopeContext.moveTo(halfGridWidth + canvasCellSpacing, yInterceptHeight);
        this.slopeContext.lineTo(halfGridWidth + canvasCellSpacing, secondPlotPoint);
        this.slopeContext.stroke();

        // Reset line dash for future strokes
        this.slopeContext.setLineDash([ 0 ]);

        // Draws a dot at the y-intercept
        this.slopeContext.beginPath();
        this.slopeContext.strokeStyle = this.utilities.zyanteOrange;
        this.slopeContext.arc(halfGridWidth, yInterceptHeight, 3, 0, 2 * Math.PI);
        this.slopeContext.fillStyle = this.utilities.zyanteOrange;
        this.slopeContext.fill();
        this.slopeContext.stroke();
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

// This object must contain one function, "create", that returns a new object
// representing this tool.
var linearGrapherExport = {
    create: function() {
        return new linearGrapher();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = linearGrapherExport;
