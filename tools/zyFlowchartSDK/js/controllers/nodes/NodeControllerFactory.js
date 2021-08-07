'use strict';

/* exported NodeControllerFactory */
/* global OutputNodeController, StartNodeController, AssignmentNodeController, DecisionNodeController, EndNodeController,
          IfNodeController, InputNodeController, LoopNodeController, FunctionCallNodeController, ElseIfNodeController */

/**
    A factory to make node controllers.
    @class NodeControllerFactory
*/
class NodeControllerFactory {

    /**
        Return a controller for the given node.
        @method make
        @param {FlowchartNode} node The node for which to make a controller.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @return {FlowchartNodeController} A controller for the given node.
    */
    make(node, canvas) {
        switch (node.getName()) {
            case 'AssignmentNode':
                return new AssignmentNodeController(node, canvas);
            case 'DecisionNode':
                return new DecisionNodeController(node, canvas);
            case 'ElseIfNode':
                return new ElseIfNodeController(node, canvas);
            case 'EndNode':
                return new EndNodeController(node, canvas);
            case 'FunctionCallNode':
                return new FunctionCallNodeController(node, canvas);
            case 'IfNode':
                return new IfNodeController(node, canvas);
            case 'InputNode':
                return new InputNodeController(node, canvas);
            case 'LoopNode':
                return new LoopNodeController(node, canvas);
            case 'OutputNode':
                return new OutputNodeController(node, canvas);
            case 'StartNode':
                return new StartNodeController(node, canvas);
            default:
                throw new Error('NodeControllerFactory\'s make given unrecognized node name');
        }
    }
}
