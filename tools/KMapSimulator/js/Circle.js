'use strict';

/* eslint-disable no-magic-numbers */
/* global CircleCSS */
/* exported Circle */

/**
    A class that defines a circle.
    @class Circle
*/
class Circle {

    /**
        @constructor
        @param {Array<Number>} cellIndices The indices of the cells included in the circle.
        @param {String} color A string indicating the color of the circle.
        @param {Number} numRows The number of rows that the k-map has in total.
        @param {Number} numCols The number of columns that the k-map has in total.
        @param {Object} $container jQuery object indicating where to draw the circle.
        @param {String} minterm The minterm this circle represents.
    */
    constructor(cellIndices, color, numRows, numCols, $container, minterm) { // eslint-disable-line max-params

        /**
            The indices of the cells included in the circle.
            @property cellIndices
            @type {Array<Number>}
        */
        this.cellIndices = cellIndices;

        /**
            Indicates the color of the circle.
            @property color
            @type {String}
        */
        this.color = color;

        /**
            The number of rows that the k-map has.
            @property numRows
            @type {Number}
        */
        this.numRows = numRows;

        /**
            The number of columns that the k-map has.
            @property numCols
            @type {Number}
        */
        this.numCols = numCols;

        /**
            The total number of cells of the k-map.
            @property totalCells
            @type {Number}
        */
        this.totalCells = numRows * numCols;

        /**
            jQuery object indicating where to draw the circle.
            @property $container
            @type {Object}
        */
        this.$container = $container;

        /**
            The minterm this circle represents.
            @property minterm
            @type {String}
        */
        this.minterm = minterm;
    }

    /**
        Draws the circle.
        @method drawCircle
        @return {void}
    */
    drawCircle() { // eslint-disable-line complexity
        const $newCircle = $('<div>');
        const firstCell = Math.min(...this.cellIndices);
        const lastCell = Math.max(...this.cellIndices);
        const topMargin = 15;
        const leftMargin = -13;
        const cellHeight = 63;
        const heightMargin = -31;
        const cellWidth = 103;
        const widthMargin = -71;

        const circleCSS = new CircleCSS(cellHeight, leftMargin, topMargin, cellWidth);
        let circleBaseClass = 'circle-base-properties';

        switch (this.cellIndices.length) {

            // All cells circled. Zero variable minterm = 1.
            case this.totalCells: {
                circleCSS.setHeight(cellHeight * this.numRows + heightMargin)
                         .setWidth(cellWidth * this.numCols + widthMargin);
                break;
            }

            // Circle of 8 cells (for 4 variables k-map).
            case 8: {

                // Variable is in Y axis.
                if ((lastCell - firstCell) === ((this.numCols * 2) - 1)) {
                    circleCSS.setHeight(cellHeight * (this.numRows / 2) + heightMargin)
                             .setTop(cellHeight * (firstCell / this.numCols) + topMargin)
                             .setWidth(cellWidth * this.numCols + widthMargin);
                }

                // Variable is in Y axis, loops through k-map.
                else if (lastCell - firstCell === (this.totalCells - 1)) {

                    // Loops vertically.
                    if (this.cellIndices[1] === 1) {
                        circleBaseClass = 'half-circle-top';
                        circleCSS.setTop(-topMargin)
                                 .setWidth(cellWidth * this.numCols + widthMargin);

                        // The only thing that changes is the top attribute.
                        this.addAuxCircle('half-circle-bottom', circleCSS.clone().setTop(cellHeight * (this.numRows - 1) + topMargin));
                    }

                    // Loops horizontally.
                    else {
                        circleBaseClass = 'half-circle-left';
                        circleCSS.setHeight(cellHeight * this.numRows + heightMargin)
                                 .setLeft(-60);

                        // The only thing that changes is the left attribute.
                        this.addAuxCircle('half-circle-right', circleCSS.clone().setLeft(cellWidth * (this.numCols - 1) - 30));
                    }
                }

                // Variable is in X axis.
                else {
                    circleCSS.setHeight(cellHeight * this.numRows + heightMargin)
                             .setLeft(cellWidth * firstCell + leftMargin)
                             .setWidth(cellWidth * (this.numCols / 2) + widthMargin);
                }
                break;
            }

            // Circle of 4 cells.
            case 4: {

                // Variables are in Y axis. Circle an entire row.
                if ((lastCell - firstCell) === (this.numCols - 1)) {
                    circleCSS.setHeight(cellHeight + heightMargin)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin)
                             .setWidth(cellWidth * this.numCols + widthMargin);
                }

                // One variable in Y axis, one in X axis.
                else if ((lastCell - firstCell) === (this.numCols + 1)) {
                    circleCSS.setHeight(cellHeight * 2 + heightMargin)
                             .setLeft(cellWidth * (firstCell % this.numCols) + leftMargin)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin)
                             .setWidth(cellWidth * 2 + widthMargin);
                }

                // Variables are in X axis. Circle an entire column.
                else if ((lastCell - firstCell) === (this.totalCells - this.numCols)) {
                    circleCSS.setHeight(cellHeight * this.numRows + heightMargin)
                             .setLeft(cellWidth * (firstCell % this.numCols) + leftMargin)
                             .setWidth(cellWidth + widthMargin);
                }

                // Variables are the four corners on a 4-variables k-map.
                else if ((lastCell - firstCell) === 15) {
                    circleBaseClass = 'quarter-circle-top-left';
                    circleCSS.setLeft(-60)
                             .setTop(-topMargin);

                    this.addAuxCircle('quarter-circle-top-right', circleCSS.clone().setLeft(cellWidth * (this.numCols - 1) - 30));
                    this.addAuxCircle('quarter-circle-bottom-left', circleCSS.clone().setTop(cellHeight * (this.numRows - 1) + topMargin));
                    this.addAuxCircle('quarter-circle-bottom-right', circleCSS.clone().setLeft(cellWidth * (this.numCols - 1) - 30)
                                                                                      .setTop(cellHeight * (this.numRows - 1) + topMargin));
                }

                // Horizontal loop.
                else if ((lastCell - firstCell) === 7) {
                    circleBaseClass = 'half-circle-left';
                    circleCSS.setHeight(cellHeight * 2 + heightMargin)
                             .setLeft(-60)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin);

                    // The only thing that changes is the left attribute.
                    this.addAuxCircle('half-circle-right', circleCSS.clone().setLeft(cellWidth * (this.numCols - 1) - 30));
                }

                // Vertical loop.
                else if ((lastCell - firstCell) === (this.totalCells - this.numCols + 1)) {
                    circleBaseClass = 'half-circle-top';
                    circleCSS.setLeft(cellWidth * firstCell + leftMargin)
                             .setTop(-topMargin)
                             .setWidth(cellWidth * 2 + widthMargin);

                    // The only thing that changes is the top attribute.
                    this.addAuxCircle('half-circle-bottom', circleCSS.clone().setTop(cellHeight * (this.numRows - 1) + topMargin));
                }

                break;
            }

            // Circle of 2 cells.
            case 2: {

                // Vertically consecutive cells.
                if ((lastCell - firstCell) === this.numCols) {
                    circleCSS.setHeight(cellHeight * 2 + heightMargin)
                             .setLeft(cellWidth * (firstCell % this.numCols) + leftMargin)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin)
                             .setWidth(cellWidth + widthMargin);
                }

                // Loop vertically.
                else if ((lastCell - firstCell) === (this.totalCells - this.numCols)) {
                    circleBaseClass = 'half-circle-top';
                    circleCSS.setLeft(cellWidth * firstCell + leftMargin)
                             .setTop(-topMargin)
                             .setWidth(cellWidth + widthMargin);

                    // The only thing that changes is the top attribute.
                    this.addAuxCircle('half-circle-bottom', circleCSS.clone().setTop(cellHeight * (this.numRows - 1) + topMargin));
                }

                // Loop horizontally.
                else if (((firstCell % this.numCols) === 0) && (lastCell % this.numCols) === 3) {
                    circleBaseClass = 'half-circle-left';
                    circleCSS.setHeight(cellHeight + heightMargin)
                             .setLeft(-60)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin);

                    // The only thing that changes is the left attribute.
                    this.addAuxCircle('half-circle-right', circleCSS.clone().setLeft(cellWidth * (this.numCols - 1) - 30));
                }

                // Horizontally consecutive cells
                else {
                    circleCSS.setHeight(cellHeight + heightMargin)
                             .setLeft(cellWidth * Math.floor(firstCell % 4) + leftMargin)
                             .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin)
                             .setWidth(cellWidth * 2 + widthMargin);
                }
                break;
            }

            // One cell circle.
            default: {
                circleCSS.setHeight(cellHeight + heightMargin)
                         .setLeft(cellWidth * Math.floor(firstCell % 4) + leftMargin)
                         .setTop(cellHeight * Math.floor(firstCell / this.numCols) + topMargin)
                         .setWidth(cellWidth + widthMargin);
                break;
            }
        }

        $newCircle.addClass(`${circleBaseClass} color-${this.color}`).css(circleCSS.getObject());
        this.$container.append($newCircle);
    }

    /**
        Adds an auxiliary circle. This is used when we need to draw looping circles.
        @method addAuxCircle
        @param {String} className The CSS class of this auxiliary circle.
        @param {CircleCSS} circleCSS The CircleCSS object for this auxiliary circle.
        @return {void}
    */
    addAuxCircle(className, circleCSS) {
        const $auxCircle = $('<div>');

        $auxCircle.addClass(`${className} color-${this.color}`).css(circleCSS.getObject());
        this.$container.append($auxCircle);
    }
}
