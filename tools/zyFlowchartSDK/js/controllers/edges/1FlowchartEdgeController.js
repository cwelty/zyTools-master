'use strict';

/* exported FlowchartEdgeController */
/* global FlowchartElementController */

/**
    Abstract control of a flowchart edge.
    @class FlowchartEdgeController
    @extends FlowchartElementController
*/
class FlowchartEdgeController extends FlowchartElementController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {String} [labelText=''] The label's text for the edge.
    */
    constructor(canvas, labelText = '') {
        super(canvas);

        /**
            The label's text for the edge.
            @property labelText
            @type {String}
            @default ''
        */
        this.labelText = labelText;
    }

    /**
        Render the edge.
        @method render
        @return {void}
    */
    render() {
        const edge = this.makeEdge();
        const gray = '#999';

        edge.attr({
            'arrow-end': 'classic-wide-long',
            stroke: gray,
            'stroke-width': 2,
        });
        this.drawing.push(edge);

        if (this.labelText) {
            const label = this.canvas.text(0, 0, this.labelText);

            label.attr({
                fill: gray,
                'font-family': '\'Roboto\', sans-serif',
                'font-size': '11px',
            });
            label.node.setAttribute('class', 'edge-label');
            this.moveLabelIntoPosition(label);
            this.drawing.push(label);
        }
    }

    /**
        Make the edge. Inheriting controllers must override.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        throw new Error('FlowchartEdgeController\'s makeEdge function should be overridden');
    }

    /**
        Move the label into position. Inheriting controllers must override.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) { // eslint-disable-line no-unused-vars
        throw new Error('FlowchartEdgeController\'s moveLabelIntoPosition function should be overridden');
    }
}
