'use strict';

/* exported SelfLoopEdgeController */
/* global TrueBranchEdgeController */

/**
    Control a self-loop edge for a loop node.
    @class SelfLoopEdgeController
    @extends TrueBranchEdgeController
*/
class SelfLoopEdgeController extends TrueBranchEdgeController {

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const rightOfDiamond = this.loopNodeController.getRightAtVerticalCenter();
        const verticalCenterOfDiamond = this.loopNodeController.getVerticalCenter();
        const bottomOfText = this.loopNodeController.getVerticalHalfwayBetweenRightAndBottomCorners();
        const rightOfText = this.loopNodeController.getHorizontalHalfwayBetweenRightAndBottomCorners();
        const startPosition = `${rightOfDiamond}, ${verticalCenterOfDiamond}`;
        const horizontalLineLength = 30;
        const horizontalEdge = rightOfDiamond + horizontalLineLength;
        const verticalEdge = this.loopNodeController.getBottom();
        const endPosition = `${rightOfText}, ${bottomOfText}`;

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to. (V)ertical line to. (L)ine to.
        return this.canvas.path(`M${startPosition} H${horizontalEdge} V${verticalEdge} H${rightOfDiamond} L${endPosition}`);
    }
}
