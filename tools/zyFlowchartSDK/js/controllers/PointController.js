'use strict';

/* exported PointController */
/* global FlowchartElementController */

/**
    Control a rendering point, which is used to draw edges.
    @class PointController
    @extends FlowchartElementController
*/
class PointController extends FlowchartElementController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {MergeTrueRenderingIndicator} point A point to render on the canvas.
    */
    constructor(canvas, point) {
        super(canvas);

        /**
            A point to render on the canvas.
            @property point
            @type {MergeTrueRenderingIndicator}
        */
        this.point = point;
    }

    /**
        Render the point.
        @method render
        @return {void}
    */
    render() {
        const point = this.canvas.circle(0, 0, 0);

        point.attr('stroke', '#888');

        this.drawing.push(point);
    }
}
