'use strict';

/* exported moveLabelInFalseBranchIntoPosition, moveLabelInTrueBranchIntoPosition */

/**
    Move the given label to be just below the given node, and slightly off-center to the left.
    @method moveLabelInFalseBranchIntoPosition
    @param {Object} label Reference to the label.
    @param {FlowchartNodeController} nodeController Controller of the node from which to position the label.
    @param {Integer} [horizontalOffset=3] The horizontal offset for the text location.
    @param {Integer} [verticalOffset=1] The vertical offset for the text location.
    @return {void}
*/
function moveLabelInFalseBranchIntoPosition(label, nodeController, horizontalOffset = 3, verticalOffset = 1) { // eslint-disable-line no-magic-numbers
    const horizontalCenter = nodeController.getHorizontalCenter();
    const bottom = nodeController.getBottom();
    const labelBBox = label.getBBox();

    label.attr({
        x: horizontalCenter + (labelBBox.width / 2) + horizontalOffset, // eslint-disable-line
        y: bottom + (labelBBox.height / 2) + verticalOffset, // eslint-disable-line
    });
}

/**
    Move the given label to be right of the given node, and slightly off-center to the top.
    @method moveLabelInTrueBranchIntoPosition
    @param {Object} label Reference to the label.
    @param {FlowchartNodeController} nodeController Controller of the node from which to position the label.
    @param {Integer} [verticalOffset=8] The vertical offset for the text location.
    @return {void}
*/
function moveLabelInTrueBranchIntoPosition(label, nodeController, verticalOffset = 8) { // eslint-disable-line no-magic-numbers
    const verticalCenterOfDiamond = nodeController.getVerticalCenter();
    const labelBBox = label.getBBox();
    const rightOfDiamond = nodeController.getRight();
    const horizontalOffset = 2;

    label.attr({
        x: rightOfDiamond + (labelBBox.width / 2) - horizontalOffset, // eslint-disable-line
        y: verticalCenterOfDiamond - verticalOffset, // eslint-disable-line id-length
    });
}
