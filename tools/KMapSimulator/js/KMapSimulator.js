'use strict';

/* global Variable, NotVariable, Circle */

/**
    Participation activity wherein the user clicks on a k-map to show 1s and 0s and adding circles.
    @module KMapSimulator
    @return {void}
*/
class KMapSimulator {

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
            @type {Object}
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
            A list of possible colors for circles.
            @property listOfColors
            @type {Array<String>}
        */
        this.listOfColors = [ 'red', 'blue', 'yellow', 'green', 'brown', 'purple', 'gray', 'black' ];

        /**
            Reference to the utility module. Needed to register the 'range' handlebars helper.
            @property utilities
            @type {Utilities}
        */
        this.utilities = require('utilities');

        /**
            The number of rows of the k-map.
            @property numRows
            @type {Number}
            @default 2
        */
        this.numRows = 2;

        /**
            The number of columns of the k-map.
            @property numCols
            @type {Number}
            @default 4
        */
        this.numCols = 4;

        /**
            The number of variables of the k-map.
            @property numberOfVariables
            @type {Number}
            @default 3
        */
        this.numberOfVariables = 3;

        /**
            An array with one boolean element for each cell indicating if the cell is set to 1 or 0.
            @property activeCells
            @type {Array<Boolean>}
            @default []
        */
        this.activeCells = [];

        /**
            An array that contains each of the variables in the k-map.
            @property variables
            @type {Array<Variable>}
            @default null
        */
        this.variables = null;

        /**
            An array containing all the circles in the k-map.
            @property circles
            @type {Array<Circle>}
            @default []
        */
        this.circles = [];

        /**
            Array storing all cells that are already in a circle.
            @property cellsInCircles
            @type {Array<Number>}
            @default []
        */
        this.cellsInCircles = [];

        /**
            jQuery reference to the div element that contains the circles.
            @property $circleContainer
            @type {Object}
            @default null
        */
        this.$circleContainer = null;

        /**
            jQuery reference to the 'Deselect All' button.
            @property $deselectButton
            @type {Object}
            @default null
        */
        this.$deselectButton = null;
    }

    /**
        Initializes the k-map simulator tool.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.parentResource = parentResource;

        const minNumberOfVariables = 3;
        const maxNumberOfVariables = 4;

        this.numberOfVariables = options && options.numberOfVariables ? parseInt(options.numberOfVariables, 10) : this.numberOfVariables;
        if (this.numberOfVariables < minNumberOfVariables) {
            throw new Error(`The minimum number of variables supported in k-map simulator is ${minNumberOfVariables}.`);
        }
        if (this.numberOfVariables > maxNumberOfVariables) {
            throw new Error(`The maximum number of variables supported in k-map simulator is ${maxNumberOfVariables}.`);
        }
        const variableNames = [ 'a', 'b', 'c', 'd' ];

        // Remove unneeded variables, and reverse order.
        variableNames.splice(this.numberOfVariables);

        const variablesInXAxis = [];
        const variablesInYAxis = [];
        const two = 2;

        /*
            If the number of variables is even, then k-map is a square. Else, it's wider than tall.
            First variables in alphabetical order go in Y axis. Last in X axis.
        */
        for (let varIndex = 0; varIndex < this.numberOfVariables; varIndex++) {
            if (varIndex < Math.floor(this.numberOfVariables / two)) {
                variablesInYAxis.push(variableNames[varIndex]);
            }
            else {
                variablesInXAxis.push(variableNames[varIndex]);
            }
        }

        const firstAndSecondVar = [ '00', '01', '11', '10' ];

        this.numCols = Math.pow(two, variablesInXAxis.length);
        this.numRows = Math.pow(two, variablesInYAxis.length);
        this.activeCells = this.utilities.createArrayOfSizeN(this.numCols * this.numRows).map(() => false);

        this.variables = variableNames.map((varName, index) => {
            const variable = new Variable(varName);

            variable.initializeCells(index, this.numberOfVariables);
            return variable;
        });

        const html = this.templates.kMapSimulator({
            xAxisVariablesString: variablesInXAxis.map(variable => variable).join(''),
            yAxisVariablesString: variablesInYAxis.map(variable => variable).join(''),
            numRows: this.numRows,
            numCols: this.numCols,
            firstRow: this.numCols === two ? [ 0, 1 ] : firstAndSecondVar,
            firstColumn: this.numRows === two ? [ 0, 1 ] : firstAndSecondVar,
        });

        this.$tool = $(`#${this.id}`);
        this.$tool.html(this.css + html);
        this.$circleContainer = this.$tool.find('.circle-drawing-container');

        let variableCellValues = [];

        if (this.numberOfVariables === 3) { // eslint-disable-line no-magic-numbers
            variableCellValues = [
                'a\'b\'c\'', 'a\'b\'c', 'a\'bc', 'a\'bc\'',
                'ab\'c\'', 'ab\'c', 'abc', 'abc\'',
            ];
        }
        else {
            variableCellValues = [
                'a\'b\'c\'d\'', 'a\'b\'c\'d', 'a\'b\'cd', 'a\'b\'cd\'',
                'a\'bc\'d\'', 'a\'bc\'d', 'a\'bcd', 'a\'bcd\'',
                'abc\'d\'', 'abc\'d', 'abcd', 'abcd\'',
                'ab\'c\'d\'', 'ab\'c\'d', 'ab\'cd', 'ab\'cd\'',
            ];
        }

        // Add event listeners for clicks in cells or content of cells.
        this.$tool.find('.kmap-cell').click(event => this.cellClicked($(event.target)));
        this.$tool.find('.kmap-cell').find('>').click(event => this.cellClicked($(event.target).parent()));
        this.$tool.find('.kmap-cell').find('>>').click(event => this.cellClicked($(event.target).parent().parent()));

        // Set minterm values for each cell.
        this.$tool.find('span.variables').each((index, element) => $(element).text(variableCellValues[index]));

        this.$tool.find('button.show-minterms').click(event => {
            const $element = $(event.target);
            const text = $element.text() === 'Show minterms' ? 'Hide minterms' : 'Show minterms';

            $element.text(text);
            this.$tool.find('div.minterm-data').css('visibility', (index, visibility) => { // eslint-disable-line arrow-body-style
                return (visibility === 'visible') ? 'hidden' : 'visible';
            });
        });

        this.$deselectButton = this.$tool.find('.deselect');
        this.$deselectButton.click(() => {
            this.$tool.find('.kmap-cell-contents').text('1').trigger('click');
        });
    }

    /**
        A cell has been clicked. Handle drawing of circles and changing cell value.
        @method cellClicked
        @param {Object} $cell A jQuery reference to the cell clicked.
        @return {void}
    */
    cellClicked($cell) {
        const $cellContent = $cell.find('.kmap-cell-contents');
        let cellValue = $cellContent.text();

        cellValue = parseInt(cellValue, 10) ? 0 : 1;
        $cellContent.text(cellValue);

        this.$tool.find('.kmap-cell').each((index, cell) => {
            this.activeCells[index] = parseInt($(cell).text(), 10) === 1;
        });
        this.updateCirclesDrawn();

        const $mintermContainer = this.$tool.find('.minterm-container');
        const mintermsSpan = this.circles.map(circle =>
            $('<span>').addClass(`color-${circle.color}`).text(circle.minterm)
        );

        // Rebuild minterm formula.
        $mintermContainer.html('');
        mintermsSpan.forEach((span, index) => {
            if (index === 0) {
                $mintermContainer.append('y = ', span);
            }
            else {
                $mintermContainer.append(' + ', span);
            }
        });

        this.parentResource.postEvent({
            answer: '',
            complete: true,
            part: 0,
            metadata: {
                activeCells: this.activeCells,
                mintermFormula: $mintermContainer.text(),
            },
        });
    }

    /**
        Removes and redraws all the circles.
        @method updateCirclesDrawn
        @return {void}
    */
    updateCirclesDrawn() {
        const oldCircles = this.circles.slice();

        this.circles = [];
        this.cellsInCircles = [];
        this.$circleContainer.html('');
        this.$deselectButton.prop('disabled', false);

        // Nothing to draw.
        if (this.activeCells.every(isActive => !isActive)) {
            this.circles.push(new Circle([], 'black', this.numRows, this.numCols, this.$circleContainer, '0'));
            this.$deselectButton.prop('disabled', true);
            return;
        }

        // Draw only one big circle.
        else if (this.activeCells.every(isActive => isActive)) {
            const cells = this.activeCells.map((cell, index) => index);
            const circle = new Circle(cells, this.listOfColors[0], this.numRows, this.numCols, this.$circleContainer, '1');

            circle.drawCircle();
            this.circles.push(circle);
        }
        else {
            const varsAndNotVars = [];

            // Create the negation of each variable.
            this.variables.forEach(variable => {
                varsAndNotVars.push(variable);
                varsAndNotVars.push(new NotVariable(variable));
            });

            // First check for each variable. Both positive and negated versions.
            varsAndNotVars.forEach(var1 => this.checkVariableCombination([ var1 ], oldCircles));

            // Then check each combination of 2 variables.
            varsAndNotVars.forEach((var1, index1) => {
                const secondVariableIndex = index1 % 2 === 0 ? index1 + 2 : index1 + 1; // eslint-disable-line no-magic-numbers

                // Removes the negated version of |var1| and already tested variables so we never test aa' or ba (we test ab).
                const twoVariables = varsAndNotVars.slice(secondVariableIndex);

                twoVariables.forEach(var2 => this.checkVariableCombination([ var1, var2 ], oldCircles));
            });

            // Then check each combination of 3 variables. Same variable positive and negated can't be combined.
            varsAndNotVars.forEach((var1, index1) => {
                const secondVariableIndex = index1 % 2 === 0 ? index1 + 2 : index1 + 1; // eslint-disable-line no-magic-numbers
                const twoVariables = varsAndNotVars.slice(secondVariableIndex);

                twoVariables.forEach((var2, index2) => {
                    const thirdVariableIndex = index2 % 2 === 0 ? index2 + 2 : index2 + 1; // eslint-disable-line no-magic-numbers
                    const threeVariables = twoVariables.slice(thirdVariableIndex);

                    threeVariables.forEach(var3 => this.checkVariableCombination([ var1, var2, var3 ], oldCircles));
                });
            });

            // Then check each combination of 4 variables. Same variable positive and negated can't be combined.
            varsAndNotVars.forEach((var1, index1) => {
                const secondVariableIndex = index1 % 2 === 0 ? index1 + 2 : index1 + 1; // eslint-disable-line no-magic-numbers
                const twoVariables = varsAndNotVars.slice(secondVariableIndex);

                twoVariables.forEach((var2, index2) => {
                    const thirdVariableIndex = index2 % 2 === 0 ? index2 + 2 : index2 + 1; // eslint-disable-line no-magic-numbers
                    const threeVariables = twoVariables.slice(thirdVariableIndex);

                    threeVariables.forEach((var3, index3) => {
                        const fourVariableIndex = index3 % 2 === 0 ? index3 + 2 : index3 + 1; // eslint-disable-line no-magic-numbers
                        const fourVariables = threeVariables.slice(fourVariableIndex);

                        fourVariables.forEach(var4 => this.checkVariableCombination([ var1, var2, var3, var4 ], oldCircles));
                    });
                });
            });
        }

        const usedColors = this.circles.map(circle => circle.color);
        const circlesToRemove = [];

        // Set colors and remove circles which cells are already circled.
        this.circles.forEach((circle, index) => {

            // If the circle has no color, then find an unused color.
            if (!circle.color) {
                circle.color = this.listOfColors.find(colorOfList => !usedColors.includes(colorOfList));
                usedColors.push(circle.color);
            }

            // Check if the cells contained in this circle are already contained in different circles.
            const isUnneededCircle = circle.cellIndices.every(cell =>
                this.circles.some((circle2, index2) => {

                    // If both are the same circle or if the second circle is one we decided to remove, pass to the next one.
                    if (index === index2) {
                        return false;
                    }
                    else if (circlesToRemove.includes(index2)) {
                        return false;
                    }

                    return circle2.cellIndices.some(cell2 => cell === cell2);
                })
            );

            if (isUnneededCircle) {
                circlesToRemove.push(index);
            }
        });

        circlesToRemove.reverse().forEach(indexToRemove => {
            this.circles.splice(indexToRemove, 1);
        });
        this.circles.forEach(circle => circle.drawCircle());
    }

    /**
        Checks if the cells in |cellsToCheck| are activated.
        @method areGivenCellsActive
        @param {Array<Number>} cellsToCheck The cells to check.
        @return {Boolean} Whether the cells are active.
    */
    areGivenCellsActive(cellsToCheck) {
        return cellsToCheck.every(cellIndex => this.activeCells[cellIndex]);
    }

    /**
        Checks a variable combination.
        @method checkVariableCombinations
        @param {Array<Variable>} variables An array of variables to combine.
        @param {Array<Circle>} oldCircles The list of circles used previously.
        @return {void}
    */
    checkVariableCombination(variables, oldCircles) {
        const intersection = variables[0].trueCellsIntersection(variables.slice(1));
        const minterm = variables.map(variable => variable.variable).join('');

        if (this.areGivenCellsActive(intersection)) {
            if (intersection.some(cell => !this.cellsInCircles.includes(cell))) {
                const circleUsingCell = oldCircles.find(circle => {
                    const containsAllCells = intersection.every(cell => circle.cellIndices.includes(cell));
                    const isBiggerCircle = intersection.length >= circle.cellIndices.length;

                    return containsAllCells && isBiggerCircle;
                });

                const color = circleUsingCell ? circleUsingCell.color : null;
                const circle = new Circle(intersection, color, this.numRows, this.numCols, this.$circleContainer, minterm);

                this.cellsInCircles.push(...intersection);
                this.circles.push(circle);
            }
        }
    }
}

module.exports = {
    create: () => new KMapSimulator(),
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {
        <%= grunt.file.read(tests) %>
    },
};
