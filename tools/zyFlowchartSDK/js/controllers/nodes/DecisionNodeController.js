'use strict';

/* exported DecisionNodeController */
/* global FlowchartNodeController */

/**
    Controller for rendering and controlling a decision node.
    @class DecisionNodeController
    @extends FlowchartNodeController
*/
class DecisionNodeController extends FlowchartNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);

        /**
            The padding around the node content background.
            @property nodeContentBackgroundPadding
            @type {Number}
            @default 4
        */
        this.nodeContentBackgroundPadding = 4;

        // The text padding needs to account for the node content background padding.
        this.textPadding += this.nodeContentBackgroundPadding;
    }

    /**
        Return a reference to a Raphael shape.
        @method makeNodeShape
        @param {Number} textWidth The width of the text.
        @param {Number} textHeight The height of the text.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeShape(textWidth, textHeight) {
        const minHeight = 55;
        const minWidth = 120;
        const height = Math.max(textHeight, minHeight);
        const width = Math.max(textWidth, minWidth);
        const halfHeight = height / 2; // eslint-disable-line no-magic-numbers
        const halfWidth = width / 2; // eslint-disable-line no-magic-numbers
        const leftCorner = `0, ${halfHeight}`;
        const topCorner = `${halfWidth}, 0`;
        const rightCorner = `${width}, ${halfHeight}`;
        const bottomCorner = `${halfWidth}, ${height}`;

        // Notation meanings: (M)ove to. (L)ine to. Z means close path.
        return this.canvas.path(`M ${leftCorner} L ${topCorner} L ${rightCorner} L ${bottomCorner} Z`);
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
    makeNodeContentBackground(comment, code, shape, widthOfCommentAndText, heightOfCommentAndText) {
        let nodeContentBackground = null;

        /*
            Don't draw background if node content fits inside the node. To determine:
            1. Note that node content is centered in the node, so only need to check if one corner of the node content is outside the node.
            2. Determine the line of the top-left edge of the node, which has coordinates: (0, height / 2) and (width / 2, 0)
                See makeNodeShape function for the left-corner and top-corner.
                So, given those coordinates, solve for y = mx + b.
                b is the y-intercept, which is: height / 2
                m is the slope, which is: (0 - (height / 2)) / ((width / 2) - 0) = -(height / 2) / (width / 2) = -height / width
            3. Determine whether the top-left corner of the node content it outside that node. That is:
                if top-most < ((m * left-most) + b), then the content is outside the node.
                Note that top-most and left-most are the values nearest the coordinate origin (0, 0).
        */
        const leftMostContent = this.nodeComment ? Math.min(comment.getBBox().x, code.getBBox().x) : code.getBBox().x;
        const topMostContent = this.nodeComment ? comment.getBBox().y : code.getBBox().y;
        const yIntercept = shape.getBBox().height / 2; // eslint-disable-line no-magic-numbers
        const slope = (-1 * shape.getBBox().height) / shape.getBBox().width;
        const yValueOfLeftMost = (slope * leftMostContent) + yIntercept;

        if (topMostContent < yValueOfLeftMost) {
            const halfPadding = this.nodeContentBackgroundPadding / 2; // eslint-disable-line no-magic-numbers

            nodeContentBackground = this.canvas.rect(
                leftMostContent - halfPadding,
                topMostContent - halfPadding,
                widthOfCommentAndText + this.nodeContentBackgroundPadding,
                heightOfCommentAndText + this.nodeContentBackgroundPadding
            );

            nodeContentBackground.attr({
                fill: 'white',
                stroke: '#ddd',
                'stroke-width': 1,
            });
        }

        return nodeContentBackground;
    }

    /**
        Return the vertical-halfway point between the right and bottom corners.
        @method getVerticalHalfwayBetweenRightAndBottomCorners
        @return {String} The vertical-halfway point between the right and bottom corners.
    */
    getVerticalHalfwayBetweenRightAndBottomCorners() {

        /*
            Want halfway point between center y (centerY) and bottom-most y (bottomY).
            That is, we want to go (bottomY - centerY) / 2 beyond centerY, which is:
            centerY + ((bottomY - centerY) / 2)
            (centerY - (centerY / 2)) + (bottomY / 2)
            (centerY / 2) + (bottomY / 2)
            (centerY + bottomY) / 2
        */
        return (this.getVerticalCenter() + this.getBottom()) / 2; // eslint-disable-line no-magic-numbers
    }

    /**
        Return the vertical-halfway point between the right and bottom corners.
        @method getHorizontalHalfwayBetweenRightAndBottomCorners
        @return {String} The vertical-halfway point between the right and bottom corners.
    */
    getHorizontalHalfwayBetweenRightAndBottomCorners() {

        /*
            Want halfway point between center x (centerX) and right-most x (rightX).
            That is, we want to go (rightX - centerX) / 2 beyond centerX, which is:
            centerX + ((rightX - centerX) / 2)
            (centerX - (centerX / 2)) + (rightX / 2)
            (centerX / 2) + (rightX / 2)
            (centerX + rightX) / 2
        */
        return (this.getHorizontalCenter() + this.getRight()) / 2; // eslint-disable-line no-magic-numbers
    }
}
