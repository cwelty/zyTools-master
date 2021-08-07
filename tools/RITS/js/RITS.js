function RITS() {
    /*
        Symbol class, this will make up an entry into the map of signals to be drawn
        |name| - string - user facing name
    */
    function Symbol(name) {
        this.name = name;
        // Ordered list of TimeEntrys
        this.entries = [];
    }

    // TimeEntry class, symbols have an ordered list of these. Each one contains a timestamp and the value at that timestamp
    function TimeEntry(timestamp, value) {
        // time in milliseconds
        this.timestamp = timestamp;
        // integer value at this timestamp, 0 or 1
        this.value = value;
    }
    this.init = function(containerID, options, finishedCallback) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = containerID;

        this.utilities = require('utilities');

        this.width = (options && options.width) ? options.width : 800;
        this.height = (options && options.height) ? options.height : 580;
        var vcdFile = (options && options.vcdFile) ? options.vcdFile : '';
        var closeDisabled = (options && options.closeDisabled) ? options.closeDisabled : false;
        this.neededSignals = (options && options.neededSignals) ? options.neededSignals : {};

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['RITS']({
            id: containerID,
            width: this.width,
            height: this.height
        });
        $('#' + this.id).addClass('RITS').addClass('unselectable').html(css + html);

        // Cache of commonly accessed DOM elements.
        this.$plusButton = $('#' + this.id + ' .zoom-plus');
        this.$minusButton = $('#' + this.id + ' .zoom-minus');
        this.$timingDiagramContainer = $('#' + this.id + ' .timing-canvas-container');
        this.$canvas = $('#' + this.id + ' .timing-canvas');
        this.$downloadButton = $('#' + this.id + ' .download');
        this.$closeButton = $('#' + this.id + ' .close');
        this.$signalCheckbox = $('#' + this.id + ' .signal-checkbox');

        var self = this;
        this.$closeButton.click(function() {
            $('#' + self.id).hide();
            if (finishedCallback) {
                finishedCallback();
            }
        });

        if (closeDisabled) {
            this.$closeButton.hide();
        }

        this.$downloadButton.click(function() {
            $(this)[0].href = self.canvas.toDataURL('image/png');
        });

        this.$timingDiagramContainer.height(this.height);
        this.$timingDiagramContainer.width(this.width);
        this.$timingDiagramContainer.dblclick(function(e) {
            self.zoom(e.offsetX, true);
        });

        this.$plusButton.click(function(e) {
            self.zoom(0, true);
        });

        this.$minusButton.click(function(e) {
            self.zoom(0, false);
        });

        this.$signalCheckbox.change(function(e) {
            if ($(this).is(':checked')) {
                self.symbols = self.allSymbols;
            }
            else {
                self.symbols = self.neededSymbols;
            }
            self.numberOfSymbols = Object.keys(self.symbols).length;
            self.calculateSpacing();
            self.adjustScrollBars(0);
            self.drawTimingDiagram();
            self.updateZoomButtons();
        });

        // Removed until all browsers decide to follow standards
        this.$downloadButton.hide();

        // Constant definition
        this.SYMBOL_HEIGHT = 20;
        this.SYMBOL_Y_OFFSET = 30;
        this.SYMBOL_X_OFFSET = 10;
        this.SYMBOL_NAME_X_OFFSET = 50;
        this.SYMBOL_X_SPACING = 5;
        this.TRUE_VALUE_HEIGHT = -(this.SYMBOL_Y_OFFSET / 2) + 3;
        this.FALSE_VALUE_HEIGHT = (this.SYMBOL_Y_OFFSET / 2) - 3;
        this.BACKGROUND_PADDING = -3;
        this.TICK_INTERVAL = 500;
        this.Y_OFFSET = -15;
        this.TICK_Y_OFFSET = 20;
        this.MAX_ZOOM = 8;
        this.MIN_ZOOM = 1;
        this.X_AXIS_LABEL_FONT_SIZE = 14;

        this.canvas = this.$canvas[0];
        this.context = this.canvas.getContext('2d');
        if (this.loadFile(vcdFile)) {
            this.adjustScrollBars(0);
            this.drawTimingDiagram();
            this.updateZoomButtons();
        }
        else {
            this.context.fillStyle = 'white';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = 'black';
            this.context.fillText('Failed to load VCD file.', (this.canvas.width / 2), (this.canvas.height / 2));
        }
    };

    // Helper to draw a single line from point (|x1|, |y1|) to point (|x2|, |y2|) with the |color| specified.
    this.drawLine = function(x1, y1, x2, y2, color) {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.strokeStyle = color;
        this.context.stroke();
        this.context.restore();
    };

    // Go from timestamp value to x value where the entry should be drawn on the canvas.
    this.timeToX = function(timestamp) {
        return this.SYMBOL_NAME_X_OFFSET + this.SYMBOL_X_OFFSET + (timestamp * this.SYMBOL_X_SPACING);
    };

    // Draws the timing diagram at the current zoom level, assumes vcd file has already been read
    this.drawTimingDiagram = function() {
        this.GRID_LINE_COLOR = this.utilities.zyanteTableGray;
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = this.utilities.zyanteDarkBlue;
        this.context.fillStyle = this.GRID_LINE_COLOR;
        this.context.font = '16px Courier';
        var symbolNumber = this.numberOfSymbols;

        // Draw background colors
        for (var symbolName in this.symbols) {
            var backgroundColor;
            if ((symbolNumber % 2) === 0) {
                backgroundColor = this.utilities.zyanteLighterBlue;
            }
            else {
                backgroundColor = 'white';
            }
            this.context.fillStyle = backgroundColor;
            this.context.fillRect(this.SYMBOL_NAME_X_OFFSET + this.SYMBOL_X_OFFSET, (this.SYMBOL_Y_OFFSET * symbolNumber) + this.Y_OFFSET + this.TRUE_VALUE_HEIGHT + this.BACKGROUND_PADDING, this.canvas.width, this.SYMBOL_Y_OFFSET);
            symbolNumber--;
        }
        var symbolBottom = (this.SYMBOL_Y_OFFSET * this.numberOfSymbols) - this.TRUE_VALUE_HEIGHT + this.Y_OFFSET;

        // Draw vertical grid lines
        // Want 10 labels
        var modInterval = Math.floor((this.drawingWidth / (this.SYMBOL_X_SPACING * this.TICK_INTERVAL)) / 10) + 1;
        for (var i = 0; i <= (this.numberOfIntervals + 1); i++) {
            this.drawLine(this.timeToX(i * this.TICK_INTERVAL), 0, this.timeToX(i * this.TICK_INTERVAL), symbolBottom, this.GRID_LINE_COLOR);
            this.context.fillStyle = 'black';
            this.context.font = this.X_AXIS_LABEL_FONT_SIZE + 'px Courier';
            var tickLabel = (i * this.TICK_INTERVAL);
            var labelAdjustment = this.context.measureText(tickLabel).width / 2;
            var labelX = this.timeToX(i * this.TICK_INTERVAL);

            if (i <= this.numberOfIntervals && ((i % modInterval) === 0)) {
                this.drawLine(labelX, symbolBottom + 3, labelX, symbolBottom + this.TICK_Y_OFFSET - 5 - (this.X_AXIS_LABEL_FONT_SIZE / 2), 'black');
                this.context.fillText(tickLabel, labelX - labelAdjustment, symbolBottom + this.TICK_Y_OFFSET);
            }
        }
        var xUnitLabel = 'Time (' + this.scaleText + ')';
        this.context.fillText(xUnitLabel, this.SYMBOL_NAME_X_OFFSET + this.SYMBOL_X_OFFSET + (this.drawingWidth / 2) - (this.context.measureText(xUnitLabel).width / 2), symbolBottom + (this.TICK_Y_OFFSET * 2));
        symbolNumber = this.numberOfSymbols;

        for (var symbolName in this.symbols) {
            var self = this;
            var oldValue = 0;
            this.context.fillStyle = 'black';
            this.context.textBaseline = 'middle';
            this.context.font = '16px Courier';
            this.context.fillText(this.symbols[symbolName].name, this.SYMBOL_X_OFFSET + this.SYMBOL_NAME_X_OFFSET - this.context.measureText(this.symbols[symbolName].name).width - 10, (this.SYMBOL_Y_OFFSET * symbolNumber) + this.Y_OFFSET);

            // Draw horizontal grid lines
            this.drawLine(0, (self.SYMBOL_Y_OFFSET * symbolNumber) + self.TRUE_VALUE_HEIGHT + this.Y_OFFSET, this.SYMBOL_X_OFFSET + this.SYMBOL_NAME_X_OFFSET, (self.SYMBOL_Y_OFFSET * symbolNumber) + self.TRUE_VALUE_HEIGHT + this.Y_OFFSET, this.GRID_LINE_COLOR);
            if (symbolNumber === this.numberOfSymbols) {
                this.context.moveTo(0, (self.SYMBOL_Y_OFFSET * symbolNumber) - self.TRUE_VALUE_HEIGHT + this.Y_OFFSET);
                this.context.lineTo(this.canvas.width, symbolBottom);
                this.context.strokeStyle = this.GRID_LINE_COLOR;
                this.context.stroke();
            }

            // Draw signal
            this.context.beginPath();
            this.context.strokeStyle = 'black';
            this.symbols[symbolName].entries.forEach(function(value, index) {
                if (index === 0) {
                    var valueHeight = value.value ? self.TRUE_VALUE_HEIGHT : self.FALSE_VALUE_HEIGHT;
                    self.context.moveTo(self.timeToX(value.timestamp), (self.SYMBOL_Y_OFFSET * symbolNumber) + valueHeight + self.Y_OFFSET);
                    oldValue = value.value;
                }
                else {
                    var valueHeight = value.value ? self.TRUE_VALUE_HEIGHT : self.FALSE_VALUE_HEIGHT;
                    var oldValueHeight = oldValue ? self.TRUE_VALUE_HEIGHT : self.FALSE_VALUE_HEIGHT;
                    self.context.lineTo(self.timeToX(value.timestamp), (self.SYMBOL_Y_OFFSET * symbolNumber) + oldValueHeight + self.Y_OFFSET);
                    self.context.lineTo(self.timeToX(value.timestamp), (self.SYMBOL_Y_OFFSET * symbolNumber) + valueHeight + self.Y_OFFSET);
                    oldValue = value.value;
                }
            });
            var valueHeight = oldValue ? this.TRUE_VALUE_HEIGHT : this.FALSE_VALUE_HEIGHT;
            this.context.lineTo(this.canvas.width, (this.SYMBOL_Y_OFFSET * symbolNumber) + valueHeight + this.Y_OFFSET);
            this.context.stroke();
            symbolNumber--;
        }
    };

    // Updates what buttons should be enabled
    this.updateZoomButtons = function() {
        if (this.currentZoomLevel >= this.MAX_ZOOM) {
            this.utilities.disableButton(this.$plusButton);
        }
        else {
            this.utilities.enableButton(this.$plusButton);
        }
        if (this.currentZoomLevel <= this.MIN_ZOOM) {
            this.utilities.disableButton(this.$minusButton);
        }
        else {
            this.utilities.enableButton(this.$minusButton);
        }
    };

    /*
        zoom in/out around a specific x coordinate
        |x| - float - x coordinate to zoom in, assumed to be coming offset in timingDiagramContainer
        |zoomIn| - boolean - true zooms in, false zooms out
    */
    this.zoom = function(x, zoomIn) {
        if (zoomIn && (this.currentZoomLevel < this.MAX_ZOOM)) {
            this.currentZoomLevel *= 2;
        }
        else if (!zoomIn && (this.currentZoomLevel > this.MIN_ZOOM)) {
            this.currentZoomLevel /= 2;
        }
        var timestamp = (x - this.SYMBOL_X_OFFSET - this.SYMBOL_NAME_X_OFFSET) / this.SYMBOL_X_SPACING;
        this.SYMBOL_X_SPACING = this.ORIGINAL_SYMBOL_X_SPACING * this.currentZoomLevel;
        var zoomCenter = 0;
        if (x !== 0) {
            // This x uses the new spacing
            zoomCenter = this.timeToX(timestamp);
        }
        this.adjustScrollBars(zoomCenter);
        this.updateZoomButtons();
        this.drawTimingDiagram();
    };

    /*
        Split helper, removes all empty strings
        |str| - string - string to split
        |delimiter| - string - delimiter string
    */
    this.breakDownString = function(str, delimiter) {
        return str.split(delimiter).filter(function(line) {
            return line.length !== 0;
        });
    };

    // Removes all duplicate entries for each symbol
    this.cleanUpSymbols = function() {
        // Remove duplicates
        for (var symbolName in this.symbols) {
            var value = this.symbols[symbolName];
            var entryRemoved = true;
            while (entryRemoved) {
                entryRemoved = false;
                for (var i = 0; i < value.entries.length; i++) {
                    for (var j = i + 1; j < value.entries.length; j++) {
                        if (value.entries[i].timestamp === value.entries[j].timestamp) {
                            value.entries.splice(i, 1);
                            entryRemoved = true;
                            break;
                        }
                    }
                    if (entryRemoved) {
                        break;
                    }
                }
            }
        }
        // Create object containing all signals
        this.allSymbols = {};
        for (var symbolName in this.symbols) {
            this.allSymbols[symbolName] = {};
            this.allSymbols[symbolName].name = this.symbols[symbolName].name;
            this.allSymbols[symbolName].entries = [];
            var value = this.symbols[symbolName];
            for (var i = 0; i < value.entries.length; i++) {
                this.allSymbols[symbolName].entries.push(new TimeEntry(value.entries[i].timestamp, value.entries[i].value));
            }

        }
        // Remove TIMER_ISR, if all values are 0
        var allZero = true;
        this.symbols['*TMR'].entries.forEach(function(entry) {
            if (entry.value !== 0) {
                allZero = false;
            }
        });
        if (allZero) {
            delete this.symbols['*TMR'];
            this.numberOfSymbols--;
        }

        // Remove signals with no changes
        var symbolsToRemove = [];
        for (var symbolName in this.symbols) {
            var value = this.symbols[symbolName];
            var entryValue = -1;
            var shouldBeRemoved = true;
            value.entries.forEach(function(entry) {
                if (entryValue === -1) {
                    entryValue = entry.value;
                }
                else if ((entryValue === 1) && (entry.value === 0)) {
                    shouldBeRemoved = false;
                }
                else if ((entryValue === 0) && (entry.value === 1)) {
                    shouldBeRemoved = false;
                }
            });
            if (shouldBeRemoved && !(symbolName in this.neededSignals)) {
                symbolsToRemove.push(symbolName);
            }
        }
        var self = this;
        symbolsToRemove.forEach(function(symbolName) {
            delete self.symbols[symbolName];
            self.numberOfSymbols--;
        });
        this.neededSymbols = this.symbols;

    };

    // Enables/disables scrollbars depending on height/width requrirements
    this.adjustScrollBars = function(zoomCenter) {
        // Adjust height
        var requiredHeight = (this.SYMBOL_Y_OFFSET * (this.numberOfSymbols)) + this.TICK_Y_OFFSET + (this.X_AXIS_LABEL_FONT_SIZE / 2);
        if (this.height < requiredHeight) {
            this.canvas.height = requiredHeight;
            this.$timingDiagramContainer.css('overflow-y', 'scroll');
        }
        else {
            this.$timingDiagramContainer.css('overflow-y', 'hidden');
        }

        // Adjust width
        var requiredWidth = this.SYMBOL_NAME_X_OFFSET + this.SYMBOL_X_OFFSET + (((this.numberOfIntervals + 1) * this.TICK_INTERVAL) * this.SYMBOL_X_SPACING) + 1;
        if (this.width < requiredWidth) {
            this.canvas.width = requiredWidth;
            this.$timingDiagramContainer.css('overflow-x', 'scroll');
            var scrollLeftAmount = zoomCenter - (this.drawingWidth / 2);
            if (scrollLeftAmount > 0) {
                this.$timingDiagramContainer.scrollLeft(scrollLeftAmount);
            }
            else {
                this.$timingDiagramContainer.scrollLeft(0);
            }
        }
        else {
            this.$timingDiagramContainer.css('overflow-x', 'hidden');
            this.$timingDiagramContainer.scrollLeft(0);
        }
    };

    // Caclulates a few different values needed to fit everything
    this.calculateSpacing = function() {
        this.height = ((this.SYMBOL_Y_OFFSET * (this.numberOfSymbols + 1)) + this.Y_OFFSET + this.TRUE_VALUE_HEIGHT + this.BACKGROUND_PADDING) + 60;
        this.canvas.height = this.height;
        this.$timingDiagramContainer.height(this.height);

        // Adjust name x offset based on length of longest symbol name
        var maxSymbolLength = 0;
        for (var symbolName in this.symbols) {
            var textLength = this.context.measureText(this.symbols[symbolName].name).width;
            if (textLength > maxSymbolLength) {
                maxSymbolLength = textLength;
            }
        }
        if (maxSymbolLength > this.SYMBOL_X_OFFSET) {
            this.SYMBOL_X_OFFSET = maxSymbolLength;
        }

        // Amount of space that is used by the timing diagram itself
        this.drawingWidth = this.width - this.SYMBOL_X_OFFSET - this.SYMBOL_NAME_X_OFFSET - 1;

        // Get nearest interval integer
        this.numberOfIntervals = (this.maxX / this.TICK_INTERVAL) | 0;
        if ((this.maxX % this.TICK_INTERVAL) !== 0) {
            this.numberOfIntervals++;
        }

        // Fit the points to the region available
        this.SYMBOL_X_SPACING = this.drawingWidth / (((this.numberOfIntervals + 1) * this.TICK_INTERVAL) - this.minX);
        this.ORIGINAL_SYMBOL_X_SPACING = this.SYMBOL_X_SPACING;
    };

    /*
        Builds the symbols object from the |vcdFile|, once this has been done the timingDiagram can be drawn
        |vcdFile| - string - contents of a .vcd file
    */
    this.loadFile = function(vcdFile) {
        this.symbols = {};
        this.maxX = 0;
        this.mixX = 0;
        this.numberOfSymbols = 0;
        this.currentZoomLevel = 1;
        var lines = vcdFile.split('\n');
        // forEach doesn't work here due to i being incremented in the loop
        for (var i = 0; i < lines.length; i++) {
            var value = lines[i];
            var parts = this.breakDownString(value, ' ');
            if (parts.length > 0) {
                // If parts is a variable declaration create new list in timetable
                if (parts[0] === '$var') {
                    this.symbols[parts[3]] = new Symbol(parts[4]);
                    this.numberOfSymbols++;
                }
                else if (parts[0] === '$timescale') {
                    i++;
                    var parts2 = this.breakDownString(lines[i], ' ');
                    if (parts2.Length < 2) {
                        this.errorMessage = 'Invalid timescale found in VCD file. Loading cancelled?';
                        this.symbols = {};
                        return false;
                    }
                    // No error -- we'll select the second element of the array to use as the units
                    timescale = parts2[0];
                    this.scaleText = parts2[1];
                }
                // If parts is a timestamp entry parse the entry
                else if (parts[0][0] === '#') {
                    var tempTime = parseFloat(parts[0].substr(1));
                    if (tempTime > this.maxX) {
                        this.maxX = tempTime;
                    }
                    if (tempTime < this.minX) {
                        this.minX = tempTime;
                    }
                    i++;
                    var parts2 = this.breakDownString(lines[i], ' ');
                    // Variable dump section
                    if (parts2[0] === '$dumpvars') {
                        this.maxX = tempTime;
                        this.minX = tempTime;
                        i++;
                        var parts3 = this.breakDownString(lines[i], ' ');
                        while (lines[i] !== '$end') {
                            var parts3 = this.breakDownString(lines[i], ' ');
                            // Check timestamp value entry
                            var entryValue;
                            if (parts3[0] === 'b0') {
                                entryValue = 0;
                            }
                            else if (parts3[0] === 'b1') {
                                entryValue = 1;
                            }
                            var name = parts3[1];
                            if (this.symbols[name]) {
                                this.symbols[name].entries.push(new TimeEntry(tempTime, entryValue));
                            }
                            i++;
                        }
                    }
                    // NOT variable dump section
                    else {
                        // Check timestamp value entry
                        var entryValue;
                        if (parts2[0] === 'b0') {
                            entryValue = 0;
                        }
                        else if (parts2[0] === 'b1') {
                            entryValue = 1;
                        }
                        var name = parts2[1];
                        if (this.symbols[name]) {
                            var previousValue = this.symbols[name].entries[this.symbols[name].entries.length - 1].value;
                            if (((previousValue === 0) && (entryValue === 1)) || ((previousValue === 1) && (entryValue === 0))) {
                                this.symbols[name].entries.push(new TimeEntry(tempTime, entryValue));
                            }
                        }
                    }
                }
            }
        }

        // Extend value to the end
        for (var symbolName in this.symbols) {
            this.symbols[symbolName].entries.push(new TimeEntry(this.maxX, this.symbols[symbolName].entries[this.symbols[symbolName].entries.length - 1].value));
        }

        this.cleanUpSymbols();
        this.calculateSpacing();

        return true;
    }
    <%= grunt.file.read(hbs_output) %>
}

var RITSExport = {
    create: function() {
        return new RITS();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
}
module.exports = RITSExport;
