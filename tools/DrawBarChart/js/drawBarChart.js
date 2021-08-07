'use strict';

/* global TickMark */

// Constants used by module.
const numberOfBars = 3;
const barStepSize = 50;
const maxLabelValue = 5;
const minBarHeight = 0;
const minBarTop = 152;
const labelOffset = 20;

/**
    Progression activity wherein the user draws a chart for the given data.
    @module DrawBarChart
*/
class DrawBarChart {

    /**
        @constructor
    */
    constructor() {

        <%= grunt.file.read(hbs_output) %>

        /**
            Array of expected answers, which are bar indices. Written to in |_generateQuestion| and read in |isCorrect|.
            Each element is the expected answer for the bars from left-to-right.
            Ex: [2, 4, 1] means 2 is the expected answer for the left-most bar, and 1 for the right-most.
            @property _expectedBarIndices
            @private
            @type Array
            @default []
        */
        this._expectedBarIndices = [];

        /**
            Array of names for the bars. Written to in |_generateQuestion| and read in |isCorrect|.
            Each element is a string.
            Ex: ['Apple', 'Banana', 'Carrot']
            @property _barNames
            @private
            @type Array
            @default []
        */
        this._barNames = [];

        /**
            Dictionary storing the handlebars templates.
            @property _templates
            @private
            @type Object
        */
        this._templates = this['<%= grunt.option("tool") %>'];
    }

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @return {void}
    */
    init(id, parentResource, options) {
        this._useRelativeFrequency = (options && options.useRelativeFrequency);
        this._useDots = (options && options.useDots);
        this._progressionTool = require('progressionTool').create();
        this._utilities = require('utilities');

        let yAxisTickLabels = [];

        // Assign y-axis labels if not using dots.
        if (!this._useDots) {
            const numberOfSteps = maxLabelValue + 1;

            yAxisTickLabels = this._utilities.createArrayOfSizeN(numberOfSteps).map(
                (value, index) => new TickMark(index, this._convertYAxisIndexToYAxisLabel(index))
            );
        }

        const html = this._templates.drawBarChart({
            numberOfBars,
            useDots: this._useDots,
            yAxisTickLabels,
        });

        this._progressionTool.init(id, parentResource, {
            html,
            css: '<style><%= grunt.file.read(css_filename) %></style>',
            numToWin: 3,
            useMultipleParts: true,
            start: () => this._enableInputs(),
            reset: () => {
                this._generateQuestion(0);
                this._disableInputs();
            },
            next: currentQuestion => {
                this._generateQuestion(currentQuestion);
                this._enableInputs(true);
            },
            isCorrect: currentQuestion => {
                this._disableInputs();

                let isCorrect = true;
                const userAnswer = [];

                this.$bars.each((index, bars) => {
                    const barHeight = $(bars).height();

                    userAnswer.push(this._computeYAxisIndexByBarHeight(barHeight));

                    if (userAnswer[index] === this._expectedBarIndices[index]) {
                        this.$expectedBars.eq(index).addClass('correct');
                        this.$expectedBarLabels.eq(index).addClass('correct');
                        this.$barLabels.eq(index).hide();
                    }
                    else {
                        isCorrect = false;
                        this.$expectedBars.eq(index).addClass('wrong');
                        this.$expectedBarLabels.eq(index).addClass('wrong');
                    }
                });

                // Overlay the expected bars.
                this.$bars.addClass('gray-out');
                this.$expectedBars.show();
                this.$expectedBarLabels.show();

                // Give an explanation.
                let explanation = 'Correct.';

                if (!isCorrect) {
                    explanation = 'Above, gray is your answer, green/red is expected answer.';

                    // The harder questions have additional explanation.
                    if (currentQuestion >= 1) {
                        if (this._useRelativeFrequency) {
                            explanation += ` Compute each class\' relative frequency.${this._utilities.getNewline()}` +
                                           `Total items = 10${this._utilities.getNewline()}`;

                            this._barNames.forEach((barName, index) => {
                                const itemCount = this._expectedBarIndices[index];
                                const yAxisLabel = this._convertYAxisIndexToYAxisLabel(itemCount);

                                explanation += `${barName} frequency = ${itemCount} / 10 = ${yAxisLabel}`;
                                if (index < (this._barNames.length - 1)) {
                                    explanation += this._utilities.getNewline();
                                }
                            });
                        }
                        else {
                            explanation += ' Count the number of each item.';
                        }
                    }
                }

                return {
                    explanationMessage: explanation,
                    expectedAnswer: JSON.stringify(this._expectedBarIndices),
                    isCorrect,
                    userAnswer: JSON.stringify(userAnswer),
                };
            },
        });

        // Cache regularly used DOM objects
        const $thisTool = $(`#${id}`);

        this.$bars = $thisTool.find('.bar');
        this.$barGrippers = $thisTool.find('.bar-gripper');
        this.$barLabels = $thisTool.find('.bar-label');
        this.$customInstructions = $thisTool.find('.custom-instructions');
        this.$expectedBars = $thisTool.find('.expected-bar');
        this.$expectedBarLabels = $thisTool.find('.expected-bar-label');
        this.$labels = $.merge(this.$barLabels.clone(), this.$expectedBarLabels);
        this.$xAxisLabels = $thisTool.find('.x-axis-label');

        // Initialize listeners to bar grippers.
        this.$barGrippers.on('mousedown touchstart', event => {
            const $barGripper = $(event.currentTarget);
            const barIndex = this.$barGrippers.index($barGripper);
            const $bar = this.$bars.eq(barIndex);
            const initialY = event.pageY || event.originalEvent.touches[0].pageY;
            const initialBarHeight = $bar.height();
            const self = this;

            /**
                Handle when the gripper moves.
                @method gripperMove
                @param {Object} moveEvent The event generated by the gripper being moved.
                @return {void}
            */
            function gripperMove(moveEvent) {
                const currentY = moveEvent.pageY || moveEvent.originalEvent.touches[0].pageY;
                const offsetY = initialY - currentY;
                const newHeight = initialBarHeight + offsetY;
                let yAxisIndex = self._computeYAxisIndexByBarHeight(newHeight);

                yAxisIndex = Math.max(0, Math.min(maxLabelValue, yAxisIndex));
                self._updateBarGripperAndLabelTop(barIndex, yAxisIndex);

                moveEvent.preventDefault();
            }

            /**
                Remove gripper events.
                @method removeGripperMoveAndEnd
                @return {void}
            */
            function removeGripperMoveAndEnd() {
                $('body').off('mousemove touchmove', gripperMove);
                $('body').off('mouseup touchend touchcancel', removeGripperMoveAndEnd);
            }

            $('body').on('mousemove touchmove', gripperMove);
            $('body').on('mouseup touchend touchcancel', removeGripperMoveAndEnd);
        });

        // Initialize question
        this._generateQuestion(0);
        this._disableInputs();
    }

    /**
        Update the bar, bar's gripper, and bar's label at |barIndex|, given |yAxisIndex|.
        @method _updateBarGripperAndLabelTop
        @private
        @param {Number} barIndex The bar index to update.
        @param {Number} yAxisIndex The chosen y-axis.
        @return {void}
    */
    _updateBarGripperAndLabelTop(barIndex, yAxisIndex) {

        // Get bar properties.
        const newBarHeight = this._getBarHeight(yAxisIndex);
        const newBarTop = this._getBarTop(yAxisIndex);
        const $bar = this.$bars.eq(barIndex);
        const $barGripper = this.$barGrippers.eq(barIndex);
        const $barLabel = this.$barLabels.eq(barIndex);

        // Update bar's height and top values.
        $bar.css('height', newBarHeight);
        $bar.css('top', newBarTop);

        // Update dots if using dots.
        if (this._useDots) {
            this._addNDotsToBar($bar, yAxisIndex);
        }

        // Update gripper's top value.
        const gripperTopOffsetFromBar = -25;
        const newGripperTop = newBarTop + gripperTopOffsetFromBar;

        $barGripper.css('top', newGripperTop);

        // Update label's top and text values.
        const newLabelTop = this._getBarLabelTop(newBarTop);
        const newYAxisIndex = this._computeYAxisIndexByBarHeight(newBarHeight);
        const newLabelText = this._convertYAxisIndexToYAxisLabel(newYAxisIndex);

        $barLabel.css('top', newLabelTop);
        $barLabel.text(newLabelText);
    }

    /**
        Add dots to the given bar.
        @method _addNDotsToBar
        @param {Object} $bar jQuery reference to the bar in which to add dots.
        @param {Number} numberOfDots The number of dots to add.
        @return {void}
    */
    _addNDotsToBar($bar, numberOfDots) {
        $bar.empty();
        this._utilities.createArrayOfSizeN(numberOfDots).forEach(() => $bar.append(this._templates.dot()));
    }

    /**
        Return the y-axis label for the given index of a y-axis tick mark.
        @method _convertYAxisIndexToYAxisLabel
        @private
        @param {Number} yAxisIndex Index of a y-axis tick mark.
        @return {String} The y-axis label.
    */
    _convertYAxisIndexToYAxisLabel(yAxisIndex) {

        /*
            If |useRelativeFrequency| is true, then return the relative frequency y-axis label. Ex: 30.0%.
            Otherwise, return the frequency label. Ex: 3.
        */
        return (this._useRelativeFrequency ? (`${yAxisIndex * 10}%`) : yAxisIndex); // eslint-disable-line no-magic-numbers
    }

    /**
        Return the y-axis index based on |barHeight|. Assuming y-axis is labeled 0, 1, 2, 3, 4, etc.
        @method _computeYAxisIndexByBarHeight
        @private
        @param {Number} barHeight The height of the bar.
        @return {Number} Y-axis tick mark index for given |barHeight|.
    */
    _computeYAxisIndexByBarHeight(barHeight) {
        return Math.round(barHeight / barStepSize);
    }

    /**
        Enable the bar grippers.
        @method _enableInputs
        @param {Boolean} labelsAlreadyEnabled Whether the labels are already set to enabled.
        @return {void}
    */
    _enableInputs(labelsAlreadyEnabled) {
        this.$barGrippers.show();

        if (!labelsAlreadyEnabled) {
            this.$barLabels.each((index, barLabel) => {
                const baseTen = 10;
                const topValue = parseInt($(barLabel).css('top'), baseTen);

                $(barLabel).css('top', topValue - labelOffset);
            });
        }
    }

    /**
        Disable the bar grippers.
        @method _disableInputs
        @private
        @return {void}
    */
    _disableInputs() {
        this.$barGrippers.hide();

        this.$barLabels.each((index, barLabel) => {
            const baseTen = 10;
            const topValue = parseInt($(barLabel).css('top'), baseTen);

            $(barLabel).css('top', topValue + labelOffset);
        });
    }

    /**
        Reset the chart to default values.
        @method _resetBarChart
        @private
        @return {void}
    */
    _resetBarChart() {

        // Clear additional classes.
        this.$bars.removeClass('gray-out');
        this.$barLabels.show();
        this.$expectedBars.removeClass('wrong').removeClass('correct');
        this.$expectedBarLabels.removeClass('wrong').removeClass('correct');

        // Remove the expected answers.
        this.$expectedBars.hide();
        this.$expectedBarLabels.hide();

        // Set the bar label text to default.
        this.$barLabels.text('1');

        // Set the bar's, gripper's, and label's to default.
        this.$bars.each(index => this._updateBarGripperAndLabelTop(index, 1));
    }

    /**
        Get the bar height given |numberOfBarSteps|.
        @method _getBarHeight
        @private
        @param {Number} numberOfBarSteps The number of bar steps.
        @return {Number} Bar height for the given number of bar steps.
    */
    _getBarHeight(numberOfBarSteps) {
        return (minBarHeight + (numberOfBarSteps * barStepSize));
    }

    /**
        Get the bar top given |numberOfBarSteps|.
        @method _getBarTop
        @private
        @param {Number} numberOfBarSteps The number of bar steps.
        @return {Number} Top-value for the bar, given the number of bar steps.
    */
    _getBarTop(numberOfBarSteps) {
        return (minBarTop + ((maxLabelValue - numberOfBarSteps) * barStepSize));
    }

    /**
        Get the bar label top's value given |barTop|.
        @method _getBarLabelTop
        @private
        @param {Number} barTop The value of the bar's top.
        @return {Number} The top-value for the bar's label.
    */
    _getBarLabelTop(barTop) {
        const labelTopOffsetFromBar = -42;

        return (barTop + labelTopOffsetFromBar);
    }

    /**
        Use |this._expectedBarIndices| to build the expected bar graphs.
        @method _setExpectedBars
        @private
        @return {void}
    */
    _setExpectedBars() {
        this.$expectedBars.each((index, expectedBar) => {
            const $expectedBar = $(expectedBar);
            const $expectedBarLabel = this.$expectedBarLabels.eq(index);
            const expectedIndex = this._expectedBarIndices[index];
            const expectedHeight = this._getBarHeight(expectedIndex);
            const expectedTop = this._getBarTop(expectedIndex);

            // Set bar height and top values.
            $expectedBar.css('height', expectedHeight);
            $expectedBar.css('top', expectedTop);

            // Set dots if using dots.
            if (this._useDots) {
                this._addNDotsToBar($expectedBar, expectedIndex);
            }

            // Set label top and label values.
            const newLabelTop = this._getBarLabelTop(expectedTop);
            const newBarLabel = this._convertYAxisIndexToYAxisLabel(expectedIndex);

            $expectedBarLabel.css('top', newLabelTop + labelOffset);
            $expectedBarLabel.text(newBarLabel);
        });
    }

    /**
        Generate a question based on the |questionLevelIndex|.
        @method _generateQuestion
        @private
        @param {Number} questionLevelIndex For which level index to create a question.
        @return {void}
    */
    _generateQuestion(questionLevelIndex) {
        this._resetBarChart();

        this._barNames = [ 'Apple', 'Banana', 'Carrot' ];

        let instructions = '';

        // Randomly choose 3 numbers for |_expectedBarIndices| between 0 and 5 that add up to 10
        if (this._useRelativeFrequency) {

            /* eslint-disable no-magic-numbers */

            // There are 5 combinations of numbers that add up to 10 but are between 0 and 5.
            const possibleCombinations = [
                [ 0, 5, 5 ],
                [ 1, 4, 5 ],
                [ 2, 3, 5 ],
                [ 2, 4, 4 ],
                [ 3, 3, 4 ],
            ];

            /* eslint-enable no-magic-numbers */

            // Randomly pick one of the 5 number combinations.
            const chosenCombination = this._utilities.pickElementFromArray(possibleCombinations);

            // Shuffle the order of the chosen combination.
            this._utilities.shuffleArray(chosenCombination);

            const firstNumber = chosenCombination[0];
            const secondNumber = chosenCombination[1];
            const thirdNumber = chosenCombination[2];

            this._expectedBarIndices = [ firstNumber, secondNumber, thirdNumber ];
        }

        // Randomly choose 3 numbers between 0 and |maxLabelValue| without repeats.
        else {
            const firstNumber = this._utilities.pickNumberInRange(0, maxLabelValue);
            const secondNumber = this._utilities.pickNumberInRange(0, maxLabelValue, [ firstNumber ]);
            const thirdNumber = this._utilities.pickNumberInRange(0, maxLabelValue, [ firstNumber, secondNumber ]);

            this._expectedBarIndices = [ firstNumber, secondNumber, thirdNumber ];
        }

        let labelInstructions = [];

        if (questionLevelIndex < 1) {
            if (this._useRelativeFrequency) {
                labelInstructions = this._expectedBarIndices.map((expectedBarIndex, index) => {
                    const yAxisLabel = this._convertYAxisIndexToYAxisLabel(expectedBarIndex);

                    return `${yAxisLabel} ${this._barNames[index].toLowerCase()}s`;
                });
            }

            // Ex: 3 apples, 2 bananas, and 1 carrot.
            else {
                labelInstructions = this._expectedBarIndices.map((expectedBarIndex, index) => {
                    const ending = (expectedBarIndex === 1 ? '' : 's');

                    return `${expectedBarIndex} ${this._barNames[index].toLowerCase()}${ending}`;
                });
            }

            instructions = `${labelInstructions[0]}, ${labelInstructions[1]}, and ${labelInstructions[2]}.`;
        }

        // Ex: Apple, Apple, Apple, Banana, Banana, Carrot
        else {
            let barNamesList = [];

            barNamesList = barNamesList.concat(new Array(this._expectedBarIndices[0]).fill(this._barNames[0]));
            barNamesList = barNamesList.concat(new Array(this._expectedBarIndices[1]).fill(this._barNames[1]));
            barNamesList = barNamesList.concat(new Array(this._expectedBarIndices[2]).fill(this._barNames[2]));

            if (questionLevelIndex === 2) { // eslint-disable-line no-magic-numbers

                // Ex: Apple, Banana, Apple, Carrot, Apple, Banana
                this._utilities.shuffleArray(barNamesList);
            }

            instructions = '';
            barNamesList.forEach((barName, index) => {
                instructions += barName;
                if (index < (barNamesList.length - 1)) {
                    instructions += ', ';
                }
            });
        }

        this.$customInstructions.text(instructions);
        this._setExpectedBars();
        this.$xAxisLabels.each((index, xAxisLabel) => $(xAxisLabel).text(this._barNames[index]));
    }

    reset() {
        this._progressionTool.reset();
    }
}

const drawBarChartExport = {
    create: function() {
        return new DrawBarChart();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};

module.exports = drawBarChartExport;
