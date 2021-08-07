'use strict';

/* exported FlowchartController */
/* global Raphael, StraightVerticalEdgeController, SelfLoopEdgeController,
          NodeBackToLoopEdgeController, FirstChildOfIfElseFalseBranchEdgeController, RenderingIndicatorFactory,
          PointController, RenderingIndicatorAndControllerPair, StraightHorizontalEdgeController,
          MergeTrueToMergeFalseEdgeController, PointToNodeEdgeController, PointToPointEdgeController,
          MergeFalseToMergeFalseEdgeController, LoopNodeToPointEdgeController, BackToLoopToMergeFalseEdgeController,
          PointBackToLoopNodeEdgeController, NodeControllerFactory, globalConstants, FunctionCodeController */

/**
    Render and control a flowchart.
    @class FlowchartController
    @extends FunctionCodeController
*/
class FlowchartController extends FunctionCodeController {

    /**
        @constructor
        @param {Flowchart} flowchart The flowchart to render and control.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor(flowchart, $containerDOM) {
        super($containerDOM);

        /**
            The flowchart to render and control.
            @property flowchart
            @type {Flowchart}
        */
        this.flowchart = flowchart;

        /**
            List of node and point controllers in this flowchart paired with the respective indicator.
            @property renderingIndicatorAndControllerPairs
            @type {Array} of {RenderingIndicatorAndControllerPair}
            @default []
        */
        this.renderingIndicatorAndControllerPairs = [];

        /**
            List of edge controllers in this flowchart.
            @property edgeControllers
            @type {Array} of {FlowchartEdgeController}
            @default []
        */
        this.edgeControllers = [];

        /**
            The canvas on which the flowchart is drawn.
            @property canvas
            @type {Raphael}
            @default null
        */
        this.canvas = null;
    }

    /**
        Render the flowchart.
        @method render
        @return {void}
    */
    render() {

        // Build the flowchart canvas.
        this.$containerDOM.html(globalConstants.templates.flowchart());

        const container = this.$containerDOM.children('.flowchart-canvas').get(0);

        this.canvas = Raphael(container, 0, 0); // eslint-disable-line new-cap

        // Build the rendering indicator list.
        const renderingIndicatorFactory = new RenderingIndicatorFactory();
        const renderingIndicators = renderingIndicatorFactory.make(this.flowchart);

        // Create the node and point controllers.
        renderingIndicators.forEach(indicator => {
            let controller = null;

            switch (indicator.getName()) {
                case 'NodeRenderingIndicator': {
                    const nodeControllerFactory = new NodeControllerFactory();

                    controller = nodeControllerFactory.make(indicator.node, this.canvas);
                    break;
                }

                // From a MergeTrue, use the point indicator.
                case 'MergeTrueRenderingIndicator':
                    controller = new PointController(this.canvas, indicator);
                    break;

                // Do nothing for MergeFalse and BackToLoop.
                case 'MergeFalseRenderingIndicator':
                case 'BackToLoopRenderingIndicator':
                    break;

                default:
                    throw new Error('FlowchartController\'s render function has unrecognized rendering indicator');
            }

            if (controller) {
                this.renderingIndicatorAndControllerPairs.push(new RenderingIndicatorAndControllerPair(indicator, controller));
            }
        });

        // Render each node and point.
        this.renderingIndicatorAndControllerPairs.forEach(pair => {
            pair.controller.render();
        });

        // Move each node and point into x position by column.
        const maxColumnIndex = Math.max(...this.renderingIndicatorAndControllerPairs.map(pair => pair.indicator.column));
        const columnIndices = require('utilities').createArrayOfSizeN(maxColumnIndex + 1).map((value, index) => index);
        let columnStartX = 0;

        columnIndices.forEach(columnIndex => {

            // Find the largest width of the controllers for this column.
            const controllersThisColumn = this.renderingIndicatorAndControllerPairs.filter(pair => pair.indicator.column === columnIndex)
                                                                                   .map(pair => pair.controller);
            const widestWidth = Math.max(...controllersThisColumn.map(controller => controller.getWidth()));

            // Move drawings into place.
            controllersThisColumn.forEach(controller => {
                const xCoordinate = Math.max((widestWidth - controller.getWidth()) / 2, 1); // eslint-disable-line no-magic-numbers

                controller.drawing.translate(columnStartX + xCoordinate, 0);
            });

            // Calculate the start x of the next column.
            columnStartX = columnStartX + widestWidth + globalConstants.spaceBetweenColumns;
        });

        // Move each node and point into y position by row.
        const maxRowIndex = Math.max(...this.renderingIndicatorAndControllerPairs.map(pair => pair.indicator.row));
        const rowIndices = require('utilities').createArrayOfSizeN(maxRowIndex + 1).map((value, index) => index);
        let rowStartY = 0;

        rowIndices.forEach(rowIndex => {

            // Find the largest height of the controllers for this row.
            const controllersThisRow = this.renderingIndicatorAndControllerPairs.filter(pair => pair.indicator.row === rowIndex)
                                                                                   .map(pair => pair.controller);
            const largestHeight = Math.max(...controllersThisRow.map(controller => controller.getHeight()), 0);

            // Move drawings into place.
            controllersThisRow.forEach(controller => {
                const yCoordinate = Math.max((largestHeight - controller.getHeight()) / 2, 1); // eslint-disable-line no-magic-numbers

                controller.drawing.translate(0, rowStartY + yCoordinate);
            });

            // Calculate the start y of the next row.
            rowStartY = rowStartY + largestHeight + globalConstants.spaceBetweenRows;
        });

        // Add edges between nodes.
        renderingIndicators.forEach((indicator, index) => {
            const previousIndicator = renderingIndicators[index - 1];

            if (previousIndicator) {
                const indicatorTypeToMakeFunction = {
                    NodeRenderingIndicator: this.makeEdgeControllerForNodeRenderingIndicator,
                    BackToLoopRenderingIndicator: this.makeEdgeControllerForBackToLoopIndicator,
                    MergeTrueRenderingIndicator: this.makeEdgeControllerForMergeTrueIndicator,
                    MergeFalseRenderingIndicator: this.makeEdgeControllerForMergeFalseIndicator,
                };
                const previousIndicatorType = previousIndicator.getName();
                const edgeController = indicatorTypeToMakeFunction[previousIndicatorType].call(
                    this, previousIndicator, indicator, this.canvas, renderingIndicators
                );

                if (edgeController) {
                    edgeController.render();
                    this.edgeControllers.push(edgeController);
                }
            }
        });

        // Find right-position of the controller that goes right-most.
        const maxEdgeRight = this.edgeControllers.map(edgeController => edgeController.getRight());
        const maxIndicatorRight = this.renderingIndicatorAndControllerPairs.map(pair => pair.controller.getRight());
        const width = Math.max(...maxEdgeRight, ...maxIndicatorRight) + 1;

        // Find bottom-position of the controller that goes bottom-most.
        const maxEdgeBottom = this.edgeControllers.map(edgeController => edgeController.getBottom());
        const maxIndicatorBottom = this.renderingIndicatorAndControllerPairs.map(pair => pair.controller.getBottom());
        const height = Math.max(...maxEdgeBottom, ...maxIndicatorBottom) + 1;

        // Update flowchart canvas with actual height and width.
        this.canvas.setSize(width, height);
    }

    /**
        Ensure the showing of the node that is next to execute.
        @method showNextToExecuteNode
        @param {FlowchartNode} nextNodeToExecute The next node to execute.
        @return {void}
    */
    showNextToExecuteNode(nextNodeToExecute) {
        const nodePairs = this.renderingIndicatorAndControllerPairs.filter(pair => pair.controller.node);
        const nextNodePair = nodePairs.find(pair => pair.controller.node === nextNodeToExecute);

        if (nextNodePair) {
            const nextNodeRow = nextNodePair.indicator.row;
            const nextNodeColumn = nextNodePair.indicator.column;
            const maxNodeRow = Math.max(...nodePairs.map(pair => pair.indicator.row));
            const maxNodeColumn = Math.max(...nodePairs.map(pair => pair.indicator.column));
            const $container = this.$containerDOM.children('.flowchart-canvas');
            const offset = 5;
            let scrollLeft = $container.scrollLeft();
            let scrollTop = $container.scrollTop();

            // If the node is in the first column, then scroll all the way left.
            if (nextNodeColumn === 0) {
                scrollLeft = 0;
            }

            // If the node is in the last column, then scroll all the way right.
            else if (nextNodeColumn === maxNodeColumn) {
                scrollLeft = $container.width();
            }

            // Otherwise, scroll the least amount to ensure the node is fully visible horizontally.
            else {

                // Find nodes in same column.
                const controllersInSameColumn = this.renderingIndicatorAndControllerPairs.filter(
                    pair => pair.indicator.column === nextNodeColumn
                ).map(pair => pair.controller);

                const nodeLeft = Math.min(...controllersInSameColumn.map(controller => controller.getLeft())) - offset;
                const nodeRight = Math.max(...controllersInSameColumn.map(controller => controller.getRight())) + offset;
                const containerLeft = $container.scrollLeft();
                const containerRight = containerLeft + $container.width();

                // Determine the amount needed to scroll left, so that the node is shown.
                if (nodeLeft < containerLeft) {
                    scrollLeft = nodeLeft;
                }

                // Determine the amount needed to scroll right, so that the node is shown.
                else if (nodeRight > containerRight) {
                    scrollLeft = containerLeft + (nodeRight - containerRight);
                }
            }

            // If the node is in the first row, then scroll all the way up.
            if (nextNodeRow === 0) {
                scrollTop = 0;
            }

            // If the node is in the last row, then scroll all the way down.
            else if (nextNodeRow === maxNodeRow) {
                scrollTop = $container.height();
            }

            // Otherwise, scroll the least amount to ensure the node is fully visible vertically.
            else {

                // Find nodes in same row.
                const controllersInSameRow = this.renderingIndicatorAndControllerPairs.filter(
                    pair => pair.indicator.row === nextNodeRow
                ).map(pair => pair.controller);

                // Compute the node and container top and bottom properties.
                const nodeTop = Math.min(...controllersInSameRow.map(controller => controller.getTop())) - offset;
                const nodeBottom = Math.max(...controllersInSameRow.map(controller => controller.getBottom())) + offset;
                const containerTop = $container.scrollTop();
                const containerBottom = containerTop + $container.height();

                // Determine the amount needed to scroll up, so that the node is shown.
                if (nodeTop < containerTop) {
                    scrollTop = nodeTop;
                }

                // Determine the amount needed to scroll down, so that the node is shown.
                else if (nodeBottom > containerBottom) {
                    scrollTop = containerTop + (nodeBottom - containerBottom);
                }
            }

            // Animate scrolling.
            $container.stop().animate({ scrollTop, scrollLeft });
        }
    }

    /**
        Return the amount of horizontal scroll of the flowchart in the function container.
        @method getHorizontalScroll
        @return {Number} The amount of horizontal scroll of the flowchart in the function container.
    */
    getHorizontalScroll() {
        return this.$containerDOM.children('.flowchart-canvas').scrollLeft();
    }

    /**
        Return the amount of vertical scroll of the flowchart in the function container.
        @method getVerticalScroll
        @return {Number} The amount of vertical scroll of the flowchart in the function container.
    */
    getVerticalScroll() {
        return this.$containerDOM.children('.flowchart-canvas').scrollTop();
    }

    /**
        Set the amount of horizontal scroll of the flowchart.
        @method setHorizontalScroll
        @param {Number} amount The amount to set.
        @return {void}
    */
    setHorizontalScroll(amount) {
        this.$containerDOM.children('.flowchart-canvas').scrollLeft(amount);
    }

    /**
        Set the amount of vertical scroll of the flowchart.
        @method setVerticalScroll
        @param {Number} amount The amount to set.
        @return {void}
    */
    setVerticalScroll(amount) {
        this.$containerDOM.children('.flowchart-canvas').scrollTop(amount);
    }

    /**
        Get the height of this function's code.
        @method getHeight
        @return {Number} The height of the function's code.
    */
    getHeight() {
        return this.canvas.canvas.getBoundingClientRect().height;
    }

    /**
        Get the width of this function's code.
        @method getWidth
        @return {Number} The width of the function's code.
    */
    getWidth() {
        return this.canvas.canvas.getBoundingClientRect().width;
    }

    /**
        Make an edge controller based on the previous indicator being a node indicator.
        @param {BackToLoopRenderingIndicator} previousIndicator The indicator saying to create an edge to a node.
        @param {RenderingIndicator} indicator The indicator after |previousIndicator|.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @return {void}
    */
    makeEdgeControllerForNodeRenderingIndicator(previousIndicator, indicator, canvas) {
        const previousNodeController = this.findNodeControllerFromNode(previousIndicator.node);
        let edgeController = null;

        /*
            Each edge is documented in the table in: zyFlowchartSDK/FlowchartRenderingEngine_README.md
            Each "Between #" below is associated with the respective "Between #" in the table.
        */
        switch (indicator.getName()) {
            case 'NodeRenderingIndicator': {
                const indicatorNodeController = this.findNodeControllerFromNode(indicator.node);

                // Between #1.
                if ([ 'LoopNode', 'IfNode', 'ElseIfNode' ].indexOf(previousIndicator.node.getName()) >= 0) {
                    edgeController = new StraightHorizontalEdgeController(canvas, previousNodeController, indicatorNodeController, 'true');
                }

                // Between #2.
                else {
                    edgeController = new StraightVerticalEdgeController(canvas, previousNodeController, indicatorNodeController);
                }
                break;
            }

            case 'BackToLoopRenderingIndicator': {

                // Between #3.
                if (previousIndicator.node.getName() === 'LoopNode') {
                    edgeController = new SelfLoopEdgeController(canvas, previousNodeController);
                }

                // Between #4.
                else {
                    const loopNodeController = this.findNodeControllerFromNode(indicator.loopNode);

                    edgeController = new NodeBackToLoopEdgeController(canvas, previousNodeController, loopNodeController);
                }
                break;
            }

            // Between #5-7.
            case 'MergeTrueRenderingIndicator':
            case 'MergeFalseRenderingIndicator': {
                const isIndicatorMergeTrue = indicator.getName() === 'MergeTrueRenderingIndicator';
                const isPreviousIfElseIf = [ 'IfNode', 'ElseIfNode' ].indexOf(previousIndicator.node.getName()) !== -1;
                const edgeText = (isIndicatorMergeTrue && isPreviousIfElseIf) ? 'true' : '';
                const pointController = this.findPointControllerFromIndicator(indicator);

                edgeController = new StraightHorizontalEdgeController(canvas, previousNodeController, pointController, edgeText);
                break;
            }

            default:
                throw new Error('Undefined indicator when trying to create edge controller in makeEdgeControllerForNodeRenderingIndicator');
        }

        return edgeController;
    }

    /**
        Create an edge controller for a back to loop indicator.
        @method makeEdgeControllerForBackToLoopIndicator
        @param {BackToLoopRenderingIndicator} previousIndicator The indicator saying to create an edge back to a loop node.
        @param {RenderingIndicator} indicator The indicator after |previousIndicator|.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {Array} renderingIndicators Array of {RenderingIndicator}. The list of rendering indicators.
        @return {void}
    */
    makeEdgeControllerForBackToLoopIndicator(previousIndicator, indicator, canvas, renderingIndicators) {
        const previousLoopNodeController = this.findNodeControllerFromNode(previousIndicator.loopNode);
        let edgeController = null;

        /*
            Each edge is documented in the table in: zyFlowchartSDK/FlowchartRenderingEngine_README.md
            Each "Between #" below is associated with the respective "Between #" in the table.
        */
        switch (indicator.getName()) {

            // Between #8.
            case 'NodeRenderingIndicator': {
                const indicatorNodeController = this.findNodeControllerFromNode(indicator.node);

                edgeController = new StraightVerticalEdgeController(canvas, previousLoopNodeController, indicatorNodeController, 'false');
                break;
            }

            // Between #9.
            case 'BackToLoopRenderingIndicator': {
                const loopNodeController = this.findNodeControllerFromNode(indicator.loopNode);

                edgeController = new NodeBackToLoopEdgeController(canvas, previousLoopNodeController, loopNodeController, 'false');
                break;
            }

            // Between #10.
            case 'MergeTrueRenderingIndicator': {
                const pointerController = this.findPointControllerFromIndicator(indicator);

                edgeController = new LoopNodeToPointEdgeController(canvas, previousLoopNodeController, pointerController);
                break;
            }

            // Between #11.
            case 'MergeFalseRenderingIndicator': {
                const pointController = this.findPointControllerFromIndicator(indicator);

                // Get the largest bottom of existing edges, so this edge goes downward enough.
                const largestBottomYOfPreviousEdges = Math.max(...this.edgeControllers.map(controller => controller.getBottom()));
                const pointY = this.computeNextPointY(indicator, renderingIndicators);

                edgeController = new BackToLoopToMergeFalseEdgeController(
                    canvas, previousLoopNodeController, pointController, largestBottomYOfPreviousEdges, pointY
                );
                break;
            }

            default:
                throw new Error('Undefined indicator when trying to create edge controller in makeEdgeControllerForBackToLoopIndicator');
        }

        return edgeController;
    }

    /**
        Create an edge controller for a merge true rendering indicator.
        @method makeEdgeControllerForMergeTrueIndicator
        @param {BackToLoopRenderingIndicator} previousIndicator The indicator saying a merge true just happened.
        @param {RenderingIndicator} indicator The indicator after |previousIndicator|.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {Array} renderingIndicators Array of {RenderingIndicator}. The list of rendering indicators.
        @return {void}
    */
    makeEdgeControllerForMergeTrueIndicator(previousIndicator, indicator, canvas, renderingIndicators) {
        let edgeController = null;

        /*
            Each edge is documented in the table in: zyFlowchartSDK/FlowchartRenderingEngine_README.md
            Each "Between #" below is associated with the respective "Between #" in the table.
        */
        switch (indicator.getName()) {
            case 'NodeRenderingIndicator': {
                const ifElseController = this.findNodeControllerFromNode(previousIndicator.ifElseIfNode);
                const indicatorNodeController = this.findNodeControllerFromNode(indicator.node);

                // Between #12.
                if (indicator.node.getName() === 'ElseIfNode') {
                    edgeController = new StraightVerticalEdgeController(canvas, ifElseController, indicatorNodeController, 'false');
                }

                // Between #13.
                else {
                    edgeController = new FirstChildOfIfElseFalseBranchEdgeController(canvas, ifElseController, indicatorNodeController);
                }
                break;
            }

            // Between #14. Since this ordering is not possible, throw an error.
            case 'BackToLoopRenderingIndicator':
                throw new Error('Invalid indicator ordering: MergeTrue -> BackToLoop');

            // Between #15. Since this ordering is not possible, throw an error.
            case 'MergeTrueRenderingIndicator':
                throw new Error('Invalid indicator ordering: MergeTrue -> MergeTrue');

            // Between #16.
            case 'MergeFalseRenderingIndicator': {
                const ifElseController = this.findNodeControllerFromNode(previousIndicator.ifElseIfNode);
                const pointController = this.findPointControllerFromIndicator(indicator);
                const allControllersWithSameRowIndex = this.renderingIndicatorAndControllerPairs.filter(
                    pair => pair.indicator.row === previousIndicator.row
                ).map(pair => pair.controller);
                const largestBottomOfRow = Math.max(...allControllersWithSameRowIndex.map(controller => controller.getBottom()));
                const pointY = this.computeNextPointY(indicator, renderingIndicators);

                edgeController = new MergeTrueToMergeFalseEdgeController(
                    canvas, ifElseController, pointController, largestBottomOfRow, pointY
                );
                break;
            }

            default:
                throw new Error('Undefined indicator when trying to create edge controller in makeEdgeControllerForMergeTrueIndicator');
        }

        return edgeController;
    }

    /**
        Create an edge controller for a merge false rendering indicator.
        @method makeEdgeControllerForMergeFalseIndicator
        @param {BackToLoopRenderingIndicator} previousIndicator The indicator saying a merge false just happened.
        @param {RenderingIndicator} indicator The indicator after |previousIndicator|.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @return {void}
    */
    makeEdgeControllerForMergeFalseIndicator(previousIndicator, indicator, canvas) {
        let edgeController = null;

        /*
            Each edge is documented in the table in: zyFlowchartSDK/FlowchartRenderingEngine_README.md
            Each "Between #" below is associated with the respective "Between #" in the table.
        */
        switch (indicator.getName()) {
            case 'NodeRenderingIndicator': {

                // Between #17.
                if (previousIndicator.ifElseIfNode.getName() === 'IfNode') {
                    const pointController = this.findPointControllerFromIndicator(previousIndicator);
                    const nodeController = this.findNodeControllerFromNode(indicator.node);

                    edgeController = new PointToNodeEdgeController(canvas, pointController, nodeController);
                }

                // Between #18.
                else {

                    // Do nothing.
                }
                break;
            }

            case 'BackToLoopRenderingIndicator': {

                // Between #19.
                if (previousIndicator.ifElseIfNode.getName() === 'IfNode') {
                    const pointController = this.findPointControllerFromIndicator(previousIndicator);
                    const loopNodeController = this.findNodeControllerFromNode(indicator.loopNode);
                    const nodeBeforeLoopController = this.findNodeControllerFromNode(indicator.nodeBeforeLoopNode);
                    const previousEdgeController = this.edgeControllers[this.edgeControllers.length - 1];

                    edgeController = new PointBackToLoopNodeEdgeController(
                        canvas, pointController, loopNodeController, nodeBeforeLoopController, previousEdgeController
                    );
                }

                // Between #20.
                else {

                    // Do nothing.
                }
                break;
            }

            case 'MergeTrueRenderingIndicator': {

                // Between #21. Since this ordering is not possible, throw an error.
                if (previousIndicator.ifElseIfNode === indicator.ifElseIfNode) {
                    throw new Error('Invalid indicator ordering: MergeFalse -> MergeTrue for the same node');
                }

                // Between #22.
                else if (previousIndicator.ifElseIfNode.getName() === 'IfNode') {
                    const startPointerController = this.findPointControllerFromIndicator(previousIndicator);
                    const endPointController = this.findPointControllerFromIndicator(indicator);

                    edgeController = new PointToPointEdgeController(canvas, startPointerController, endPointController);
                }

                // Between #23. Since this ordering is not possible, throw an error.
                else {
                    throw new Error('Invalid indicator ordering: MergeFalse (elseif) -> MergeTrue');
                }
                break;
            }

            case 'MergeFalseRenderingIndicator': {

                // Between #24.
                if (previousIndicator.ifElseIfNode.getName() === 'IfNode') {
                    const startPointerController = this.findPointControllerFromIndicator(previousIndicator);
                    const endPointController = this.findPointControllerFromIndicator(indicator);

                    // Get the bottom of the previous edge, so this edge goes downward enough.
                    const previousEdgeController = this.edgeControllers[this.edgeControllers.length - 1];
                    const bottomYOfPreviousEdge = previousEdgeController.getBottom();

                    edgeController = new MergeFalseToMergeFalseEdgeController(
                        canvas, startPointerController, endPointController, bottomYOfPreviousEdge
                    );
                }

                // Between #25.
                else {

                    // Do nothing.
                }
                break;
            }

            default:
                throw new Error('Undefined indicator when trying to create edge controller in makeEdgeControllerForMergeFalseIndicator');
        }

        return edgeController;
    }

    /**
        Get the y-axis location of the next point, if it exists. Else, return null.
        @method computeNextPointY
        @param {RenderingIndicator} indicator The indicator after |previousIndicator|.
        @param {Array} renderingIndicators Array of {RenderingIndicator}. The list of rendering indicators.
        @return {Number} The y-axis location of the next point, if it exists.
    */
    computeNextPointY(indicator, renderingIndicators) {
        const indexAfterMergeFalse = renderingIndicators.indexOf(indicator) + 1;
        const indicatorAfterMergeFalse = renderingIndicators[indexAfterMergeFalse];
        const isNextIndicatorMergeTrue = indicatorAfterMergeFalse && (indicatorAfterMergeFalse.getName() === 'MergeTrueRenderingIndicator');

        return isNextIndicatorMergeTrue ? this.findPointControllerFromIndicator(indicatorAfterMergeFalse).getVerticalCenter() : null;
    }

    /**
        Return the node controller for the given node.
        @method findNodeControllerFromNode
        @param {FlowchartNode} node The node's controller to find.
        @return {FlowchartNodeController} The node controller for the given node.
    */
    findNodeControllerFromNode(node) {
        return this.renderingIndicatorAndControllerPairs.find(pair => pair.controller.node === node).controller;
    }

    /**
        Return the point controller for the given merge indicator.
        Point controller are associated with a MergeTrue indicator.
        The given |mergeIndicator| may be a MergeFalse, so match on |ifElseIfNode| to find the associated MergeTrue.
        @method findPointControllerFromIndicator
        @param {MergeRenderingIndicator} mergeIndicator The indicator's controller to find.
        @return {PointController} The point controller for the given merge indicator.
    */
    findPointControllerFromIndicator(mergeIndicator) {
        return this.renderingIndicatorAndControllerPairs.find(
            pair => pair.indicator.ifElseIfNode === mergeIndicator.ifElseIfNode
        ).controller;
    }
}
