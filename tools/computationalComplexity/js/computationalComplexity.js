function ComputationalComplexity() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['computationalComplexity']({ id: this.id });
        $('#' + this.id).html(css + html);

        this.$helperText = $('#' + this.id + ' .helper-text');
        this.$helperText.hide();

        this.graphOptions = {
            title: 'Number of computations vs number of elements',
            series: [
                {
                    label: '1',
                    showMarker: false,
                },
                {
                    label: 'log n',
                    showMarker: false,
                },
                {
                    label: 'n',
                    showMarker: false,
                },
                {
                    label: 'n * log n',
                    showMarker: false,
                },
                {
                    label: 'n^2',
                    showMarker: false,
                },
                {
                    label: '2^n',
                    showMarker: false,
                },
                {
                    label: 'n!',
                    showMarker: false,
                },
            ],
            axes: {
                yaxis: {
                    min: 0,
                    max: 12,
                    label: 'Number of computations',
                },
                xaxis: {
                    min: 1,
                    max: 10,
                    label: 'Number of elements (n)',
                    tickInterval: 1,
                },
            },
            seriesDefaults: {
                rendererOptions: {
                    smooth: true
                }
            },
            legend: {
                    show: true,
                    location: 'e'
                }
        }; // end of graphOptions

        this.plotsToGraph = [];

        this.initializePlotPointsAndGraph();

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.clickedAlready) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'ComputationalComplexity',
                    metadata: {
                        event: 'ComputationalComplexity tool clicked'
                    }
                };

                self.parentResource.postEvent(event);

                self.clickedAlready = true;
            }
        });

        $('#' + this.id + ' .complexityCheckbox').change(function() {
            self.checkBoxChanged();
        });
    };

    this.initializePlotPointsAndGraph = function() {
        var Oof1 = [];
        var OofLogN = [];
        var OofN = [];
        var OofNLogN = [];
        var OofNSqrd = [];
        var Oof2ToTheN = [];
        var OofNFctrl = [];

        var factrlMem = 1;
        for (var i = 0; i <= 10; i++) { // Generating points for each plot
            Oof1.push([ i, 1 ]);

            var logCalc = Math.log(i);
            if (i === 0) { // log (0) is NaN
                logCalc = 0;
            }

            OofLogN.push([ i, logCalc ]);
            OofN.push([ i, i ]);
            OofNLogN.push([ i, i * logCalc ]);
            OofNSqrd.push([ i, i * i ]);
            Oof2ToTheN.push([ i, Math.pow(2, i) ]);

            if (i > 0) {
                factrlMem = factrlMem * i;
                OofNFctrl.push([ i, factrlMem ]);
            }
        }

        this.plotsToGraph = [ Oof1, OofLogN, OofN, OofNLogN, OofNSqrd, Oof2ToTheN, OofNFctrl ];

        for (var i = 2; i < this.plotsToGraph.length; i++) { // show only O(1) and O(log N)
            this.graphOptions.series[i].show = false;
        }

        // Draw graph
        $.jqplot('complexityCheckboxGraph_' + this.id, this.plotsToGraph, this.graphOptions);
    };

    this.checkBoxChanged = function() {
        var $objs = $('#' + this.id + ' .complexityCheckbox');
        var largestComplexityChecked = 'none';
        var self = this;
        $objs.each(function(i) {
            var $this = $(this);
            if ($this.prop('checked')) {
                largestComplexityChecked = $this.val();
                self.graphOptions.series[i].show = true;
            } else {
                self.graphOptions.series[i].show = false;
            }
        });

        if ((largestComplexityChecked === 'none') || (largestComplexityChecked === 'Oof1') || (largestComplexityChecked === 'OofLogN')) {
            this.graphOptions.axes.yaxis.max = 12; // explicitly give max y-axis value, otherwise 11.5 is auto-selected, which looks weird
        } else {
            this.graphOptions.axes.yaxis.max = null;
        }

        // If at least 1 function is selected, then redraw the graph.
        if (largestComplexityChecked !== 'none') {
            $('#complexityCheckboxGraph_' + this.id).css('visibility', 'visible');
            $('#complexityCheckboxGraph_' + this.id).empty();
            $.jqplot('complexityCheckboxGraph_' + this.id, this.plotsToGraph, this.graphOptions);
            this.$helperText.hide();
        }
        // No functions to graph.
        else {
            $('#complexityCheckboxGraph_' + this.id).css('visibility', 'hidden');
            this.$helperText.show();
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var computationalComplexityExport = {
    create: function() {
        return new ComputationalComplexity();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = computationalComplexityExport;
