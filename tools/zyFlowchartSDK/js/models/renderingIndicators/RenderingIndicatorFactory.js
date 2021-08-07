'use strict';

/* exported RenderingIndicatorFactory */
/* global MergeNodePair, DistanceAndNode, MergeFalseRenderingIndicator, MergeTrueRenderingIndicator, NodeRenderingIndicator,
          BackToLoopRenderingIndicator, CountAndNode */

/**
    Abstract model of an indicator used for rendering.
    @class RenderingIndicatorFactory
*/
class RenderingIndicatorFactory {

    /**
        Make a list of {RenderingIndicator}s for the given flowchart.
        @method make
        @param {Flowchart} flowchart The flowchart from which to make a list of {RenderingIndicator}s.
        @return {Array} of {RenderingIndicator}. A list of {RenderingIndicator}s for the given flowchart.
    */
    make(flowchart) {
        const list = [];
        const mergeNodePairs = this.findIfElseMergeNodePairs(flowchart.startNode);

        this.createRenderListRunner(flowchart.startNode, 0, 0, mergeNodePairs, [], list);
        this.moveMergeTrueIndicatorColumnsIntoPosition(list);
        return list;
    }

    /**
        In a flowchart, find the nodes that are a merge node for an if-else node's branches.
        That is, at the end of both if-else branches, there is a common node (the merge node). Find those merge nodes.
        @method findIfElseMergeNodePairs
        @param {StartNode} startNode The first node in the flowchart.
        @return {Array} of {MergeNodePair} The merge nodes.
    */
    findIfElseMergeNodePairs(startNode) {
        const mergeNodePairs = [];

        this.findIfElseMergeNodePairsRunner(startNode, mergeNodePairs, [], []);

        return mergeNodePairs;
    }

    /**
        Traverse a flowchart to find the merge node for each if-else node.
        A merge node for an if-else branch is the node at the end of both the true and false branches of an if-else node.

        @method findIfElseMergeNodePairsRunner
        @param {FlowchartNode} node The current node.
        @param {Array} mergeNodePairs Array of {MergeNodePair}. The running list of if-else nodes associated with their merge nodes.
        @param {Array} visitedNodes Array of {CountAndNode}. The nodes already visited on the way to this node.
        @return {Array} of {DistanceAndNode}. The list of descendant nodes and distance from this node.
    */
    findIfElseMergeNodePairsRunner(node, mergeNodePairs, visitedNodes) {
        const descendants = [];

        if (node) {
            const visitedNode = visitedNodes.find(element => element.node === node);
            let shouldAddNodeToDescendants = false;

            // Base case: Node has already been visited.
            if (visitedNode) {

                // If a loop node has been visited only once, then include the loop node in the descendants list b/c loop nodes have 2 entry points.
                if (visitedNode.node.getName() === 'LoopNode') {
                    if (visitedNode.count === 1) {
                        shouldAddNodeToDescendants = true;
                        visitedNode.count++;
                    }
                }
            }
            else {
                shouldAddNodeToDescendants = true;
                visitedNodes.push(new CountAndNode(node));

                // Recursive case: Get the descendants of this node's children.
                const childrenDescendants = node.children.map(
                    child => this.findIfElseMergeNodePairsRunner(child, mergeNodePairs, visitedNodes.map(element => element.clone()))
                );

                if (childrenDescendants.length === 1) {
                    descendants.push(...childrenDescendants[0]);
                }
                else if (childrenDescendants.length === 2) { // eslint-disable-line no-magic-numbers
                    const mergeNode = this.searchForMergeNodeInDescendants(childrenDescendants);

                    if (mergeNode) {
                        mergeNodePairs.push(new MergeNodePair(node, mergeNode));
                    }
                    descendants.push(...this.combineDescendants(childrenDescendants));
                }
            }

            if (shouldAddNodeToDescendants) {
                descendants.unshift(new DistanceAndNode(node));
                descendants.forEach(descendant => descendant.distance++);
            }
        }

        return descendants;
    }

    /**
        Combine the descendants. Remove duplicates, keeping the node with the smallest distance.
        @method combineDescendants
        @param {Array} childrenDescendants Array of {Array} of {DistanceAndNode}. The descendants of each branch, which are to be combined.
        @return {Array} of {DistanceAndNode}. The combined list of descendants.
    */
    combineDescendants(childrenDescendants) {
        const filteredDescendant1 = this.keepDescendantsWithSmallestDistance(childrenDescendants[0], childrenDescendants[1]);
        const filteredDescendant2 = this.keepDescendantsWithSmallestDistance(childrenDescendants[1], childrenDescendants[0], true);

        return filteredDescendant1.concat(filteredDescendant2);
    }

    /**
        Return the subset of |descendants1| that does not contain items from |descendants2|.
        If there is a duplicate, then only return from |descendants1| if |descendants1|'s item has a smaller distance than |descendants2|'s item.
        @method keepDescendantsWithSmallestDistance
        @param {Array} descendants1 Array of {DistanceAndNode}. Return a subset of these that are unique from |descendants2|
        @param {Array} descendants2 Array of {DistanceAndNode}. Used to filter out items from |descendants1|.
        @param {Boolean} enforceSmallest Whether to enforce that the smallest must be found, not just smallest or equal to the smallest.
        @return {Array} of {DistanceAndNode}. The unique descendants from |descendants1|.
    */
    keepDescendantsWithSmallestDistance(descendants1, descendants2, enforceSmallest = false) {
        return descendants1.filter(descendant1 => {
            const descendant2Duplicate = descendants2.find(descendant2 => descendant1.node === descendant2.node);
            let keepDescendant = true;

            if (descendant2Duplicate) {
                keepDescendant = enforceSmallest ?
                                 descendant1.distance < descendant2Duplicate.distance :
                                 descendant1.distance <= descendant2Duplicate.distance;
            }

            return keepDescendant;
        });
    }

    /**
        Return the mode node in the descendants of each branch, if there is one.
        @method searchForMergeNodeInDescendants
        @param {Array} childrenDescendants Array of {Array} of {DistanceAndNode}. The descendants of each branch.
        @return {FlowchartNode} The merge node, if there is one.
    */
    searchForMergeNodeInDescendants(childrenDescendants) {

        // Sort the descendants of each branch by the distance from this node, with closest first.
        childrenDescendants.forEach(childDescendants => childDescendants.sort((first, second) => first.distance - second.distance));

        /*
            The merge node is the node in both branches with the smallest distance from this node.
            That is, there may be multiple nodes that are in both branches, but we want only the merge node with the smallest distance.
        */
        let smallestDistance = Infinity;
        let smallestDistanceNode = null;

        childrenDescendants[0].forEach(descendant1 => {
            childrenDescendants[1].forEach(descendant2 => {

                // Found a potential merge node. Check if it has the smallest distance from this node.
                if (descendant1.node === descendant2.node) {
                    const distance = Math.min(descendant1.distance, descendant2.distance);

                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        smallestDistanceNode = descendant1.node;
                    }
                }
            });
        });

        return smallestDistanceNode;
    }

    /**
        Build a list of rendering indicators by recursively traversing the flowchart.
        @method createRenderListRunner
        @param {FlowchartNode} node The current node being traversed.
        @param {Integer} row The node's row during rendering.
        @param {Integer} column The node's column during rendering.
        @param {Array} mergeNodePairs Array of {MergeNodePair}. List of nodes that are merged at after an if-else node's branches.
        @param {Array} decisionStack Array of {DecisionNode}. Stack of if-else and loop nodes used to track association of merge nodes with if-else nodes.
        @param {Array} list {Array} of {RenderingIndicator}. The list of indicators for rendering.
        @return {Integer} The largest row to date.
    */
    createRenderListRunner(node, row, column, mergeNodePairs, decisionStack, list) { // eslint-disable-line max-params
        let rowToUse = row;
        const topOfStack = decisionStack[decisionStack.length - 1];

        // Base case: Node is a merge pair node of the top of the stack.
        if (mergeNodePairs.some(pair => (pair.mergeNode === node) && (pair.ifElseIfNode === topOfStack))) {
            rowToUse -= 1;
        }

        // Base case: Reached end of loop node's true branch.
        else if (node === topOfStack) {
            rowToUse -= 1;
        }

        // Traverse the node.
        else {
            rowToUse = this.handleRenderListNode(
                node, rowToUse, column, mergeNodePairs, decisionStack, list
            );
        }

        return rowToUse;
    }

    /**
        Handle the node creation and child recursion.
        @method handleRenderListNode
        @param {FlowchartNode} node The current node being traversed.
        @param {Integer} row The node's row during rendering.
        @param {Integer} column The node's column during rendering.
        @param {Array} mergeNodePairs Array of {MergeNodePair}. List of nodes that are merged at after an if-else node's branches.
        @param {Array} decisionStack Array of {DecisionNode}. Stack of if-else and loop nodes used to track association of merge nodes with if-else nodes.
        @param {Array} list {Array} of {RenderingIndicator}. The list of indicators for rendering.
        @return {Integer} The largest row to date.
    */
    handleRenderListNode(node, row, column, mergeNodePairs, decisionStack, list) { // eslint-disable-line
        let rowToUse = row;

        list.push(new NodeRenderingIndicator(rowToUse, column, node));

        switch (node.getName()) {

            // Recursive case: Node has 1 child.
            case 'AssignmentNode':
            case 'FunctionCallNode':
            case 'InputNode':
            case 'OutputNode':
            case 'StartNode':
                rowToUse = this.createRenderListRunner(
                    node.getChildNode(), (rowToUse + 1), column, mergeNodePairs, decisionStack, list
                );
                break;

            // Recursive case: Node is a loop node.
            case 'LoopNode': {
                decisionStack.push(node);

                // Run the true branch.
                rowToUse = this.createRenderListRunner(
                    node.getChildNodeForTrue(), rowToUse, (column + 1), mergeNodePairs, decisionStack, list
                );

                decisionStack.pop();

                // When true branch has no nodes, |rowToUse| is too small.
                rowToUse = Math.max(rowToUse, row);

                // If last on list is MergeFalse, then give an extra row of space.
                if (list[list.length - 1].getName() === 'MergeFalseRenderingIndicator') {
                    rowToUse += 1;
                }

                // Associate the back to loop with the last added node indicator.
                const nodeIndicators = list.filter(indicator => indicator.getName() === 'NodeRenderingIndicator');
                const lastNodeIndicatorAdded = nodeIndicators[nodeIndicators.length - 1];

                list.push(new BackToLoopRenderingIndicator(node, lastNodeIndicatorAdded.node));

                // Run the false branch.
                rowToUse = this.createRenderListRunner(
                    node.getChildNodeForFalse(), (rowToUse + 1), column, mergeNodePairs, decisionStack, list
                );
                break;
            }

            // Recursive case: Node is an if-else node.
            case 'IfNode':
            case 'ElseIfNode': {
                decisionStack.push(node);

                // Run the true branch.
                rowToUse = this.createRenderListRunner(
                    node.getChildNodeForTrue(), rowToUse, (column + 1), mergeNodePairs, decisionStack, list
                );

                // When true branch has no nodes, |rowToUse| is too small.
                rowToUse = Math.max(rowToUse, row);

                // Add more space if needed.
                if (this.isPreviousIndicatorBackToLoopOrMergeFalseWithPreviousofNode(list)) {
                    rowToUse += 1;
                }

                // Note: The column value is set later via |moveMergeTrueIndicatorColumnsIntoPosition|.
                list.push(new MergeTrueRenderingIndicator(rowToUse, column, node));

                // Run the false branch. Only increment column if false branch isn't elseif-node.
                const falseBranchNode = node.getChildNodeForFalse();
                const isFalseBranchElseIfNode = falseBranchNode.getName() === 'ElseIfNode';
                const columnIncrementer = isFalseBranchElseIfNode ? 0 : 1;

                rowToUse = this.createRenderListRunner(
                    falseBranchNode, (rowToUse + 1), (column + columnIncrementer), mergeNodePairs, decisionStack, list
                );

                // If last on list is BackToLoop, then give an extra row of space.
                const wasBackToLoopBeforeMergeFalse = list[list.length - 1].getName() === 'BackToLoopRenderingIndicator';
                const wasMergeFalseBeforeBackToLoopBeforeMergeFalse = wasBackToLoopBeforeMergeFalse &&
                                                                      list[list.length - 2].getName() === 'MergeFalseRenderingIndicator'; // eslint-disable-line no-magic-numbers

                list.push(new MergeFalseRenderingIndicator(node));

                decisionStack.pop();

                /*
                    Recurse on this node's MergeNode if:
                    * The MergeNode isn't already in |list|
                    * The MergeNode isn't a merge node of a node in the decision stack
                */
                const mergeNode = mergeNodePairs.find(mergeNodePair => mergeNodePair.ifElseIfNode === node).mergeNode;
                const isMergeNodeInList = list.some(indicator => indicator.node === mergeNode);
                const isMergeNodeAMergeNodeInDecisionStack = decisionStack.some(decisionNode =>
                    mergeNodePairs.some(mergeNodePair =>
                        (mergeNodePair.ifElseIfNode === decisionNode) && (mergeNodePair.mergeNode === mergeNode)
                    )
                );

                if (!isMergeNodeInList && !isMergeNodeAMergeNodeInDecisionStack) {

                    // Be two rows down from the largest row so far.
                    const indicatorRows = list.filter(indicator => indicator.row).map(indicator => indicator.row);
                    let largestRow = Math.max(...indicatorRows);

                    if (wasBackToLoopBeforeMergeFalse) {
                        largestRow += 1;

                        if (wasMergeFalseBeforeBackToLoopBeforeMergeFalse) {
                            largestRow += 1;
                        }
                    }

                    rowToUse = this.handleRenderListNode(
                        mergeNode, (largestRow + 2), column, mergeNodePairs, decisionStack, list // eslint-disable-line no-magic-numbers
                    );
                }

                // Add more space if needed.
                else if (this.isPreviousIndicatorBackToLoopOrMergeFalseWithPreviousofNode(list)) {
                    rowToUse += 1;
                }
                break;
            }

            // Base case: Node has no children.
            default:
                break;
        }

        return rowToUse;
    }

    /**
        Return whether last on list is a BackToLoop OR (MergeFalse AND indicator before that is not a node).
        @method isPreviousIndicatorBackToLoopOrMergeFalseWithPreviousofNode
        @param {Array} list {Array} of {RenderingIndicator}. The list of indicators for rendering.
        @return {Boolean} Whether last on list is a BackToLoop OR (MergeFalse AND indicator before that is not a node).
    */
    isPreviousIndicatorBackToLoopOrMergeFalseWithPreviousofNode(list) {
        const previousIndicator = list[list.length - 1].getName();
        const previousIsBackToLoop = previousIndicator === 'BackToLoopRenderingIndicator';
        const previousIsMergeFalse = previousIndicator === 'MergeFalseRenderingIndicator';
        const previousPreviousIndicator = list[list.length - 2].getName(); // eslint-disable-line no-magic-numbers
        const previousPreviousIsNode = previousPreviousIndicator === 'NodeRenderingIndicator';

        return previousIsBackToLoop || (previousIsMergeFalse && !previousPreviousIsNode);
    }

    /**
        Each MergeTrue indicator's column should be 1 more than any child of the associated if node.
        MergeTrue indicators are created before the false branch has been explored.
        The false branch may have had more column use than the true branch.
        So, this function makes sure that MergeTrue's column is 1 more than the false branch.
        Further, the function makes a second pass through the flowchart to propagate an if node's MergeTrue indicator's column to nested elseif node's MergeTrue indicator.
        @method moveMergeTrueIndicatorColumnsIntoPosition
        @param {Array} list {Array} of {RenderingIndicator}. The list of indicators for rendering.
        @return {void}
    */
    moveMergeTrueIndicatorColumnsIntoPosition(list) {

        // Maintain a stack of max columns; one for each if and elseif node. Each if and elseif node will push a new max column to the stack.
        const maxColumnsSoFar = [];

        list.forEach(indicator => {
            let maxColumnThisLoop = 0;

            switch (indicator.getName()) {

                // If the node is an if or elseif, then push another max column to the stack.
                case 'NodeRenderingIndicator': {
                    if (this.isNodeIfOrElseIf(indicator.node)) {
                        maxColumnsSoFar.push(0);
                    }

                    maxColumnThisLoop = indicator.column;
                    break;
                }

                // MergeFalse indicates an if or elseif has finished. Update the respective MergeTrue's column.
                case 'MergeFalseRenderingIndicator': {
                    const mergeTrue = list.filter(indicator2 => indicator2.getName() === 'MergeTrueRenderingIndicator')
                                          .find(indicator2 => indicator2.ifElseIfNode === indicator.ifElseIfNode);

                    let newMaxColumn = maxColumnsSoFar.pop();

                    // If node increases the column by 1, b/c the if branch must be larger than any other column, but elseif does not.
                    if (mergeTrue.ifElseIfNode.getName() === 'IfNode') {
                        newMaxColumn++;
                    }
                    maxColumnThisLoop = mergeTrue.column = newMaxColumn;
                    break;
                }
                default:
                    break;
            }

            // Update max columns per if node.
            maxColumnsSoFar.forEach((max, index) => {
                maxColumnsSoFar[index] = Math.max(max, maxColumnThisLoop);
            });
        });

        /*
            Maintain a stack of if node columns. Push to stack when at the MergeTrue of an if node; pop when finished in if node.
            Assign the last element on the stack to the MergeTrue for an elseif node.
        */
        const ifNodeColumnStack = [];

        list.forEach(indicator => {
            switch (indicator.getName()) {

                case 'MergeTrueRenderingIndicator': {

                    // The node is an if node, so push the node's column to the stack.
                    if (indicator.ifElseIfNode.getName() === 'IfNode') {
                        ifNodeColumnStack.push(indicator.column);
                    }

                    // MergeTrue on elseif is when to set the indicator's column with the last on the stack.
                    else if (indicator.ifElseIfNode.getName() === 'ElseIfNode') {
                        indicator.column = ifNodeColumnStack[ifNodeColumnStack.length - 1];
                    }
                    break;
                }

                // MergeFalse indicates an if has finished, so pop.
                case 'MergeFalseRenderingIndicator': {
                    if (indicator.ifElseIfNode.getName() === 'IfNode') {
                        ifNodeColumnStack.pop();
                    }
                    break;
                }
                default:
                    break;
            }
        });
    }

    /**
        Return whether the node is either an if or elseif node.
        @method isNodeIfOrElseIf
        @param {FlowchartNode} node The node to check.
        @return {Boolean} Whether the node is either an if or elseif node.
    */
    isNodeIfOrElseIf(node) {
        return [ 'IfNode', 'ElseIfNode' ].indexOf(node.getName()) !== -1;
    }
}
