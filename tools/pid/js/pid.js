function PID() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var imageUrl = parentResource.getResourceURL('pidModel.jpg', this.name);
        var html = this[this.name]['template']({
            id: this.id,
            modelSrc: imageUrl
        });

        $('#' + this.id).html(css + html);
        this.initPID(this.id);

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'PID clicked'
                    }
                };
                parentResource.postEvent(event);
            }

            self.beenClicked = true;
        });
    };

    this.initPID = function(zyID) {
        // PID variables
        var desired = 0;
        var oldDesired = -1;
        var actual = 0;
        var error;
        var derivative;
        var integral = 0;
        var actualPrevious = 0;
        var actuator = 0;
        var actuatorMax = 10;
        var integralMax = 1000;
        var integralMin = -1000;
        var p;
        var i;
        var d;
        // Timer variables
        var timerHandle = -1;
        var timerPeriod = 1;
        var timeCount = 0;
        // How much faster than reality is the simulation
        var simulationScale = timerPeriod * 50;
        var dt = simulationScale / 1000;
        // System simulation variables
        var sampleRate = 20;
        // Used in physics equation
        // F=MA
        var fan = {
            f: 0,
            m: 0.5,
            a: 0
        };
        // a = (force of fan)/(mass of ball) - gravity
        // v = v + a*dt
        // position = position + v*dt
        var g = 9.8;
        var ball = {
            position: 0,
            v: 0,
            a: 0,
            m: 0.027
        };
        var actuatorPrevious = 0;
        var ballMin = 0;
        var ballMax;
        var maxSpeed;
        var baseSpeed = 0.2;
        var actuatorMin = 0;
        var MODE_OPTIONS = {
            PID_CONTROLLER: 0,
            MANUAL_CONTROLLER: 1
        };
        var mode = MODE_OPTIONS.PID_CONTROLLER;
        var Y_LABEL = 'Ball height';
        var X_LABEL = 'Time (s)';
        var INTERVAL_TICKS = 10;
        /* Chosen so that the user only has to press up once to see something happen
           without this the user would have to press up 70 times before anything changed.
        */
        var MANUAL_BASE_ACTUATOR_VALUE = 0.5225;
        // Plot variables
        var maxNumPoints = 500;
        var maxVisiblePoints = 100;
        // Pre allocate array
        var plots = new Array(maxNumPoints);
        var yMin;
        var yMax;
        var xMin;
        var xMax;
        // Current index into point array plots
        var currentPointIndex = 0;
        var adjustWindow = false;
        var plot = null;
        // Animation variables
        var pidAnim = new PIDAnim($('#modelAnimation_' + zyID)[0], timerPeriod);
        var pidExist = false;
        function init() {
            if (pidExist) {
                return;
            }
            pidExist = true;
            // Jquery ui init for menu, used to switch between modes
            $('#mode_' + zyID).menu({
                select: function(event, ui) {
                    mode = $(ui.item[0]).index();
                    changeMode();
                }
            });
            // Jquery ui init for a slider, used to adjust ball weight
            $('#ballWeight_' + zyID).slider({
                min: 0.02,
                max: 0.04,
                step: 0.01,
                value: 0.03,
                change: function(event, ui) {
                    ball.m = parseFloat(ui.value);
                    $('#ballWeightText_' + zyID).text(ui.value + ' grams');
                }
            });
            // Jquery ui init for a slider, used to adjust fan power
            $('#fanPower_' + zyID).slider({
                min: 0.1,
                max: 1.0,
                step: 0.1,
                value: 0.5,
                change: function(event, ui) {
                    fan.m = parseFloat(ui.value);
                    $('#fanPowerText_' + zyID).text(ui.value);
                }
            });
            // Hide manual controls
            $('#up_' + zyID).hide();
            $('#down_' + zyID).hide();
            // Up increases the actuator power under manual mode
            $('#up_' + zyID).click(function() {
                actuator += 0.0075;
                $('#actuatorValue_' + zyID).text('Actuator: ' + actuator.toFixed(6));
                pidAnim.adjustFan(actuator, maxSpeed);
                return false;
            });
            // Down decreases the actuator power under manual mode
            $('#down_' + zyID).click(function() {
                if (actuator > 0) {
                    actuator -= 0.0075;
                    $('#actuatorValue_' + zyID).text('Actuator: ' + actuator.toFixed(6));
                    pidAnim.adjustFan(actuator, maxSpeed);
                }
                return false;
            });
            $('#playButton_' + zyID).click(startSimulation);
            $('#pauseButton_' + zyID).click(stopSimulation);
            $('#resetButton_' + zyID).click(reset);
            for (var i = 0; i < maxNumPoints; i++) {
                plots[i] = [ 0, 0 ];
            }
            disableButton($('#resetButton_' + zyID));
            disableButton($('#pauseButton_' + zyID));
            enableButton($('#playButton_' + zyID));
            xMin = 0;
            xMax = maxVisiblePoints * sampleRate * dt;
            yMin = 0;
            desired = parseFloat($('#desired_' + zyID).val());
            yMax = desired * 2;
            createChart();
            pidAnim.init($('#modelAnimation_' + zyID)[0], desired);
            reset();
        }

        // Switch between manual use and pid controlled
        function changeMode() {
            if (mode == MODE_OPTIONS.PID_CONTROLLER) {
                $('#p_' + zyID).show();
                $('#i_' + zyID).show();
                $('#d_' + zyID).show();
                $('#pLabel_' + zyID).show();
                $('#iLabel_' + zyID).show();
                $('#dLabel_' + zyID).show();
                $('#up_' + zyID).hide();
                $('#down_' + zyID).hide();
            } else {
                actuator = MANUAL_BASE_ACTUATOR_VALUE;
                $('#actuatorValue_' + zyID).text('Actuator: ' + actuator.toFixed(6));
                $('#p_' + zyID).hide();
                $('#i_' + zyID).hide();
                $('#d_' + zyID).hide();
                $('#pLabel_' + zyID).hide();
                $('#iLabel_' + zyID).hide();
                $('#dLabel_' + zyID).hide();
                $('#up_' + zyID).show();
                $('#down_' + zyID).show();
            }
            reset();
        }

        function disableButton($object) {
            $object.attr('disabled', true);
            $object.addClass('disabled');
        }

        function enableButton($object) {
            $object.removeAttr('disabled');
            $object.removeClass('disabled');
        }

        // Calculates PID equations, updates the actuator value and the fan speed
        function updateController() {
            error = desired - actual;
            derivative = actual - actualPrevious;
            integral += error;
            if (integral > integralMax) {
                integral = integralMax;
            }
            if (integral < integralMin) {
                integral = integralMin;
            }
            actuator = p * error + i * integral - d * derivative;
            if (actuator < actuatorMin) {
                actuator = actuatorMin;
            }
            if (actuator > actuatorMax) {
                actuator = actuatorMax;
            }

            actuator += baseSpeed;
            $('#actuatorValue_' + zyID).text('Actuator: ' + actuator.toFixed(6));
            pidAnim.adjustFan(actuator, maxSpeed);

        }

        // Stops the simulation and the animation
        function stopSimulation() {
            clearInterval(timerHandle);
            $('#p_' + zyID).removeAttr('disabled');
            $('#i_' + zyID).removeAttr('disabled');
            $('#d_' + zyID).removeAttr('disabled');
            $('#desired_' + zyID).removeAttr('disabled');
            enableButton($('#resetButton_' + zyID));
            disableButton($('#pauseButton_' + zyID));
            enableButton($('#playButton_' + zyID));
            $('#mode_' + zyID).menu('option', 'disabled', false);
            clearInterval(pidAnim.timerHandle);
        }

        // Resets all variables to intial values
        function reset() {
            pidAnim.reset();
            resetForm();
            temp = 0;
            actual = 0;
            integral = 0;
            actualPrevious = 0;
            actuatorPrevious = 0;
            if (mode == MODE_OPTIONS.PID_CONTROLLER) {
                actuator = 0;
            }
            else {
                actuator = MANUAL_BASE_ACTUATOR_VALUE;
            }
            timerHandle = -1;
            actual = 0;
            timeCount = 0;
            for (var i = 0; i < maxNumPoints; i++) {
                plots[i] = [ 0, 0 ];
            }
            plot.series[0].data = plots;
            plot.axes.xaxis.min = xMin;
            plot.axes.xaxis.max = xMax;
            plot.replot();
            fan.f = 0;
            fan.a = 0;
            ball.position = 0;
            ball.v = 0;
            ball.a = 0;
            pidAnim.handle = 0;
            currentPointIndex = 0;
            adjustWindow = false;
            disableButton($('#resetButton_' + zyID));
            disableButton($('#pauseButton_' + zyID));
            enableButton($('#playButton_' + zyID));
        }

        // Regex for a number, border will be changed to red if the input is not a number
        function validateInput(input) {
            var value = $(input).val();
            var re = new RegExp(/(^([0-9]+)$)|(^([0-9]+.[0-9]+)$)/);
            if (!value.trim().match(re)) {
                $(input).css('border-color', 'red');
                return false;
            } else {
                $(input).css('border-color', '');
            }
            return true;
        }

        // Validate all of the user inputs
        function validateForm() {
            // display errors for all
            var valid = validateInput('#p_' + zyID);
            valid &= validateInput('#i_' + zyID);
            valid &= validateInput('#d_' + zyID);
            valid &= validateInput('#desired_' + zyID);
            return valid;
        }

        // Grabs the inputs from the forms, intializes the jqplot and animation, and then starts the simulation
        function startSimulation() {
            if (validateForm()) {
                stopSimulation();
                p = parseFloat($('#p_' + zyID).val());
                i = parseFloat($('#i_' + zyID).val());
                d = parseFloat($('#d_' + zyID).val());
                desired = parseFloat($('#desired_' + zyID).val());
                actual = 0;
                $('#p_' + zyID).attr('disabled', true);
                $('#i_' + zyID).attr('disabled', true);
                $('#d_' + zyID).attr('disabled', true);
                $('#desired_' + zyID).attr('disabled', true);
                disableButton($('#resetButton_' + zyID));
                enableButton($('#pauseButton_' + zyID));
                disableButton($('#playButton_' + zyID));
                $('#mode_' + zyID).menu('option', 'disabled', true);
                yMin = 0;
                // Need some maximum value for display reasons, twice as much as the desired value seems reasonable
                yMax = (desired * 2);
                ballMax = (desired * 2);
                xMin = 0;
                xMax = maxVisiblePoints * sampleRate * dt;
                maxSpeed = (p * desired + i * integralMax) > actuatorMax ? actuatorMax : (p * desired + i * integralMax) + 1;
                if ((desired !== oldDesired) || (plot === null)) {
                    createChart();
                }
                oldDesired = desired;
                pidAnim.init($('#modelAnimation_' + zyID)[0], desired);
                timerHandle = setInterval(simulate, timerPeriod);
            }
        }

        function createChart() {
            plot = $.jqplot('chartdiv_' + zyID, [ plots ], {
                canvasOverlay: {
                    show: true,
                    objects: [ {
                        horizontalLine: {
                            name: 'desired',
                            y: desired,
                            color: TAN,
                            XOffset: 0
                        }
                    } ]
                },
                series: [ {
                    showMarker: false
                } ],
                axes: {
                    xaxis: {
                        label: X_LABEL,
                        min: xMin,
                        max: xMax
                    },
                    yaxis: {
                        label: Y_LABEL,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        min: yMin,
                        max: yMax,
                        tickInterval: yMax / INTERVAL_TICKS
                    }
                }
            });
            applyChartText(plot, 'desired', desired);
        }

        // Calculates F=MA, updates the new actual value, and adjusts the ball in the animation
        function updateSystem() {
            fan.a = actuator;
            fan.f = fan.m * fan.a;
            ball.a = (fan.f / ball.m) - g;
            timeCount += 1;
            ball.v = ball.v + (ball.a * dt);
            ball.position = ball.position + (ball.v * dt);
            if (ball.position < ballMin) {
                ball.v = 0;
                ball.position = ballMin;
            }
            if (ball.position > ballMax) {
                ball.v = 0;
                ball.position = ballMax;
            }

            actuatorPrevious = actuator;
            actualPrevious = actual;
            actual = ball.position;
            $('#actualValue_' + zyID).text('Actual: ' + actual.toFixed(2));
            if ((timeCount % sampleRate) == 0) {
                plots[currentPointIndex][0] = dt * timeCount;
                plots[currentPointIndex][1] = actual;
                currentPointIndex = (currentPointIndex + 1) % maxNumPoints;
                pidAnim.adjustBall(actual);
            }


        }

        // Reset form inputs to default
        function resetForm() {
            if (!($('#resetButton_' + zyID).is('[disabled]'))) {
                $('#pidInputForm_' + zyID)[0].reset();
            }
            validateForm();
            $('#desired_' + zyID).val(100);
        }

        // Simulation function that will be called at a regular interval, every time step updates the controller, the system, and the drawings
        function simulate() {
            if (mode == MODE_OPTIONS.PID_CONTROLLER) {
                updateController();
            }
            updateSystem();
            if ((timeCount % sampleRate) == 0) {
                if (currentPointIndex >= (maxVisiblePoints - 10) || adjustWindow) {
                    xMin += dt * sampleRate;
                    xMax += dt * sampleRate;
                    adjustWindow = true;
                }

                plot.series[0].data = plots;
                plot.axes.xaxis.min = xMin;
                plot.axes.xaxis.max = xMax;

                // When user leaves page, the plot doesn't exist, so an error gets thrown.
                try {
                    plot.replot();
                }
                catch (error) {
                    console.log(error);
                }

                applyChartText(plot, 'desired', desired);
            }
        }

        // Used to apply text to a jqplot
        function applyChartText(plot, text, lineValue) {
            var maxVal = yMax;
            var minVal = yMin;
            // Account for negative values
            var range = maxVal + Math.abs(minVal);
            var titleHeight = plot.title.getHeight();
            if ((plot.title.text != undefined) && (plot.title.text.indexOf('<br') > -1)) {
                // Account for line breaks in the title
                titleHeight = titleHeight * 0.5; // half it
            }
            // Now need to calculate how many pixels make up each point in your y-axis
            var pixelsPerPoint = (plot._height - titleHeight - plot.axes.xaxis.getHeight()) / range;
            // Dont print when not visible
            if (maxVal - lineValue < 0) {
                return;
            }
            var valueHeight = ((maxVal - lineValue) * pixelsPerPoint) + 10;
            // Insert the label div as a child of the jqPlot parent
            var title_selector = $(plot.target.selector).children('.jqplot-overlayCanvas-canvas');
            $('<div class="jqplot-point-label " style="position:absolute;  text-align:right;width:95%;top:' + valueHeight + 'px;">' + text + '</div>').insertAfter(title_selector);
        }

        init();
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>

}

var PIDExport = {
    create: function() {
        return new PID();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = PIDExport;
