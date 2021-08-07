'use strict';

/* exported FlowchartNodeController */
/* global FlowchartElementController */

/**
    Abstract controller for a node.
    @class FlowchartNodeController
    @extends FlowchartElementController
*/
class FlowchartNodeController extends FlowchartElementController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(canvas);

        /**
            The node to control.
            @property node
            @type {FlowchartNode}
        */
        this.node = node;

        /**
            The code to print on the node.
            @property nodeCode
            @type {String}
            @default ''
        */
        this.nodeCode = node.userExpression;

        /**
            The node's comment as a single string.
            @property nodeComment
            @type {String}
        */
        this.nodeComment = node.getCommentsAsString();

        /**
            The amount of padding around the text.
            @property textPadding
            @type {Integer}
            @default 12
        */
        this.textPadding = 12;
    }

    /**
        Render the start node.
        @method render
        @return {void}
    */
    render() {
        const comment = this.canvas.text(0, 0, this.nodeComment);
        const code = this.canvas.text(0, 0, this.nodeCode);
        const fontOptions = {
            'font-family': '\'Roboto\', sans-serif',
            'font-size': '12px',
        };

        comment.attr(fontOptions).attr('fill', '#999');
        code.attr(fontOptions).attr('fill', require('utilities').zyanteGray);

        const heightOfCommentAndText = comment.getBBox().height + code.getBBox().height;
        const widthOfCommentAndText = Math.max(comment.getBBox().width, code.getBBox().width);
        const heightWithPadding = heightOfCommentAndText + this.textPadding;
        const widthWithPadding = widthOfCommentAndText + this.textPadding;
        const shape = this.makeNodeShape(widthWithPadding, heightWithPadding);
        const zyAnimatorOrange = 'rgb(217, 133, 80)';
        const zyAnimatorLightOrange = 'rgb(249, 216, 188)';
        const zyAnimatorBlue = 'rgb(94, 129, 213)';
        const fill = this.node.isNextToExecute ? zyAnimatorLightOrange : 'white';
        const stroke = this.node.isNextToExecute ? zyAnimatorOrange : zyAnimatorBlue;
        const strokeWidth = 2;

        shape.toBack();
        shape.attr({
            fill,
            stroke,
            'stroke-width': strokeWidth,
        });

        // Find the center of the shape.
        const shapeCenterX = shape.getBBox().width / 2; // eslint-disable-line no-magic-numbers
        const shapeCenterY = shape.getBBox().height / 2; // eslint-disable-line no-magic-numbers

        /*
            The shape contains the comment and code, with the comment directly above the code.
            The x and y coordinates that are being set are to the center of the comment.
            We want the comment and code to be horizontally centered within the box, so their y is the shape's horizontal center.
            We want the comment to be directly above the code, so from the vertical center, subtract the code's height / 2.

            Node shape has height 30.
            _____________________
            |___________________| Comment has 10 height
            |                   |
            |___________________| Code has 20 height

            Node's vertical center is 15.
            Comment's vertical center is 5, computed by: node's vertical center - code's height / 2 = 15 - (20 / 2) = 5
            Code's vertical center is 20, computed by: node's vertical center + comment's height / 2 = 15 + (10 / 2) = 20
        */
        comment.attr({
            x: shapeCenterX, // eslint-disable-line id-length
            y: shapeCenterY - (code.getBBox().height / 2), // eslint-disable-line
        });

        code.attr({
            x: shapeCenterX, // eslint-disable-line id-length
            y: shapeCenterY + (comment.getBBox().height / 2), // eslint-disable-line
        });

        this.drawing.push(shape, code, comment);

        const nodeContentBackground = this.makeNodeContentBackground(
            comment, code, shape, widthOfCommentAndText, heightOfCommentAndText
        );

        if (nodeContentBackground) {
            comment.toFront();
            code.toFront();
            this.drawing.push(nodeContentBackground);
        }
    }

    /**
        Make a background for the node content. Most nodes don't have one. Decision nodes do.
        @method makeNodeContentBackground
        @param {Object} comment Reference to the Raphael shape for the comment.
        @param {Object} code Reference to the Raphael shape for the code.
        @param {Object} shape Reference to the Raphael shape for the node.
        @param {Number} widthOfCommentAndText The width of the comment and text in the node.
        @param {Number} heightOfCommentAndText The height of the comment and text in the node.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeContentBackground(comment, code, shape, widthOfCommentAndText, heightOfCommentAndText) { // eslint-disable-line no-unused-vars
        return null;
    }

    /**
        Return a reference to a Raphael shape. Inheriting controllers must override.
        @method makeNodeShape
        @param {Number} textWidth The width of the text.
        @param {Number} textHeight The height of the text.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeShape(textWidth, textHeight) { // eslint-disable-line no-unused-vars
        throw new Error('FlowchartNodeController\'s makeNodeShape function should be overridden');
    }
}
