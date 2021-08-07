'use strict';

/* exported Flowchart */
/* global RenderingIndicatorFactory, convertCommentLineToString */

/**
    Model of the flowchart, which stores the start node of the flowchart.
    @class Flowchart
*/
class Flowchart {

    /**
        @constructor
        @param {StartNode} startNode The start node of the flowchart.
    */
    constructor(startNode) {

        /**
            The start node of the flowchart.
            @property startNode
            @type {StartNode}
        */
        this.startNode = startNode;

        const prefixOrder = [];

        this.prefixNodeOrdering(startNode, prefixOrder);

        /**
            A list of the current nodes in pre-fix order, which means the start node will be the first element.
            @property prefixOrder
            @type {Array} of {FlowchartNode}
        */
        this.prefixOrder = prefixOrder;
    }

    /**
        Return a clone of this flowchart.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up memory cells.
        @return {Flowchart} A clone of this flowchart.
    */
    clone(arrayOfVariables) {

        // Clone each node.
        const clonedPrefixOrder = this.prefixOrder.map(node => node.clone(arrayOfVariables));

        // Set the children of the cloned nodes.
        this.prefixOrder.forEach((currentNode, nodeIndex) => {
            const clonedNode = clonedPrefixOrder[nodeIndex];

            currentNode.children.forEach((child, childIndex) => {
                const indexOfChildInOrder = this.prefixOrder.indexOf(child);

                clonedNode.children[childIndex] = clonedPrefixOrder[indexOfChildInOrder];
            });
        });

        return new Flowchart(clonedPrefixOrder[0]);
    }

    /**
        Build the prefix node ordering of the flowchart.
        @method prefixNodeOrdering
        @param {FlowchartNode} node The current node to traverse.
        @param {Array} prefixOrder Array of {FlowchartNode}. The pre-fix order of the flowchart.
        @return {void}
    */
    prefixNodeOrdering(node, prefixOrder) {

        /*
            Base case: Node already been traversed. Do nothing.
            Recursive case: Store the node then traverse the node's children.
        */
        if (prefixOrder.indexOf(node) < 0) {
            prefixOrder.push(node);
            node.children.forEach(child => {
                this.prefixNodeOrdering(child, prefixOrder);
            });
        }
    }

    /**
        Add the closing brace to the code.
        @method addClosingBrace
        @param {PortedCode} portedCode The ported code.
        @param {String} indentation One indentation worth of spaces.
        @param {Integer} baseIndentAmount The base number of indents.
        @param {Integer} indentationAmount The number of indents with the line that has the opening brace.
        @return {void}
    */
    addClosingBrace(portedCode, indentation, baseIndentAmount, indentationAmount) {
        const indentAmount = baseIndentAmount + indentationAmount;
        const indent = indentation.repeat(indentAmount);

        portedCode.add(`\n${indent}}`);
    }

    /**
        Convert the given comment lines to a string.
        @method convertCommentLinesToString
        @param {Array} commentLines Array of{TokensOfLine}. The comment lines to convert to a string.
        @param {String} indent The indentation to use.
        @return {String} The comments as a string.
    */
    convertCommentLinesToString(commentLines, indent) {
        return commentLines.map(commentLine => {
            const blankLines = '\n'.repeat(commentLine.blankLinesAbove.length + 1);
            const comment = convertCommentLineToString(commentLine);

            return `${blankLines}${indent}${comment}`;
        }).join('');
    }

    /**
        @method handleForLoopPart
        @param {String} currentPart Whether the node corresponds to the initial for loop part, condition, or update.
        @param {FlowchartNode} firstForLoopPart The node corresponding to the first part of the for loop.
        @param {String} indent The amount of indentation to use.
        @param {FlowchartNode} node The node corresponding to the current part.
        @param {PortedCode} portedCode The ported code being built.
        @return {void}
    */
    handleForLoopPart(currentPart, firstForLoopPart, indent, node, portedCode) {
        switch (currentPart) {
            case 'initial': {
                const prefix = `${indent}for (`;

                node.addToPortIndices(prefix.length);
                portedCode.add(`${prefix}${node.portedLine.line}`);
                node.portedLine.lineNumber = portedCode.numberOfLines();
                node.portedLine.startIndexOfSegment = prefix.length;
                node.portedLine.endIndexOfSegment = portedCode.lengthOfLastLine() - 1;
                portedCode.add('; ');
                break;
            }
            case 'condition': {
                const prefixLength = portedCode.lengthOfLastLine();

                node.addToPortIndices(prefixLength);
                node.portedLine.lineNumber = firstForLoopPart.portedLine.lineNumber;
                node.portedLine.startIndexOfSegment = prefixLength;
                portedCode.add(node.portedLine.line);
                node.portedLine.endIndexOfSegment = portedCode.lengthOfLastLine() - 1;
                portedCode.add('; ');
                break;
            }
            case 'update': {

                /*
                    A Coral for-loop is converted to a flowchart with update after the loop-body. Ex:
                    [initial]
                    while [condition]
                       ... // These lines are added to |portedCode| before the update is added
                       [update]

                    So, update needs to go on the same for-loop line as initial and condition.
                */
                const lineNumber = firstForLoopPart.portedLine.lineNumber;
                const prefixLength = portedCode.lengthOfLineNumber(lineNumber);

                node.addToPortIndices(prefixLength);
                node.portedLine.lineNumber = lineNumber;
                node.portedLine.startIndexOfSegment = prefixLength;
                portedCode.addToLine(`${node.portedLine.line}`, lineNumber);
                node.portedLine.endIndexOfSegment = portedCode.lengthOfLineNumber(lineNumber) - 1;
                portedCode.addToLine(') {', lineNumber);
                break;
            }
            default:
                break;
        }
    }

    /**
        Handle the porting of a node.
        @method handleNodePort
        @param {Object} params The parameters for this node's port.
        @param {String} params.language The language to port to.
        @param {FlowchartNode} params.node The node to port.
        @param {Integer} params.baseIndentAmount The base indent amount. Usually 0 or 1.
        @param {String} params.indentation One indentation as a string.
        @param {Object} params.lineNumberToForLoopParts A map from line number to the associated for loop parts.
        @param {RenderingIndicator} params.previousIndicator The previous rendering indicator.
        @param {PortedCode} params.portedCode The code ported so far.
        @return {void}
    */
    handleNodePort(params) {
        const language = params.language;
        const node = params.node;
        const baseIndentAmount = params.baseIndentAmount;
        const indentation = params.indentation;
        const lineNumberToForLoopParts = params.lineNumberToForLoopParts;
        const previousIndicator = params.previousIndicator;
        const portedCode = params.portedCode;
        const nodeName = node.getName();
        const isStartOrEndNode = [ 'StartNode', 'EndNode' ].includes(nodeName);

        if (!isStartOrEndNode) {
            node.makePortedLine(language);

            const indentAmount = baseIndentAmount + node.indentationAmount;
            const indent = indentation.repeat(indentAmount);

            /*
                This node is one of 4 cases:
                * Not part of for loop: !node.line.isFromForLoop
                * For loop's first part: node.line.isFromForLoop && !lineNumberToForLoopParts[node.line.lineNumber]
                * For loop's second part: Code below.
                * For loop's third part: Code below.
            */
            const notSecondOrThirdPartOfForLoop = !node.line.isFromForLoop || !lineNumberToForLoopParts[node.line.lineNumber];

            if (notSecondOrThirdPartOfForLoop) {

                // MergeTrue indicates the end of an if-statement or elseif-statement.
                // Don't put an else when the next statement is an elseif b/c we'll put an elseif instead.
                if ((previousIndicator.getName() === 'MergeTrueRenderingIndicator') && (nodeName !== 'ElseIfNode')) {
                    const indentForElse = indentation.repeat(indentAmount - 1);
                    const comments = this.convertCommentLinesToString(previousIndicator.ifElseIfNode.elseCommentLines, indentForElse);

                    portedCode.add(`${comments}\n${indentForElse}else {`);
                }

                const comments = this.convertCommentLinesToString(node.commentLines, indent);
                const blankLinesAboveNode = '\n'.repeat(node.line.blankLinesAbove.length + 1);

                portedCode.add(comments + blankLinesAboveNode);
            }

            if (node.line.isFromForLoop) {

                // A for-loop has 3 parts. Keep track to see which part we're at because the initial and update assignments look the same.
                if (!lineNumberToForLoopParts[node.line.lineNumber]) {
                    lineNumberToForLoopParts[node.line.lineNumber] = [];
                }
                const forLoopParts = lineNumberToForLoopParts[node.line.lineNumber];

                forLoopParts.push(node);

                const forLoopPartsToName = {
                    1: 'initial',
                    2: 'condition',
                    3: 'update',
                };
                const currentPart = forLoopPartsToName[forLoopParts.length];

                this.handleForLoopPart(currentPart, forLoopParts[0], indent, node, portedCode);
            }
            else {
                portedCode.add(`${indent}${node.portedLine.line}`);
                node.portedLine.lineNumber = portedCode.numberOfLines();
                node.portedLine.startIndexOfSegment = 0;
                node.portedLine.endIndexOfSegment = portedCode.lengthOfLastLine() - 1;
                node.addToPortIndices(indent.length);
            }
        }
    }

    /**
        Build the Coral flowchart ported in the given language.
        @method buildPortedCode
        @param {PortedCode} portedCode The ported code.
        @param {String} language The language to port to.
        @param {String} indentation One indentation worth of spaces.
        @param {Boolean} shouldAddExtraIndent Whether to add an extra indent.
        @return {Object} Containing the EndNode and second node in the prefix order.
    */
    buildPortedCode(portedCode, language, indentation, shouldAddExtraIndent) {
        const baseIndentAmount = shouldAddExtraIndent ? 1 : 0;
        const renderingIndicatorFactory = new RenderingIndicatorFactory();
        const renderingIndicators = renderingIndicatorFactory.make(this);
        let previousIndicator = null;
        const lineNumberToForLoopParts = {};

        renderingIndicators.forEach(indicator => {
            switch (indicator.getName()) {
                case 'NodeRenderingIndicator': {
                    this.handleNodePort({
                        language,
                        node: indicator.node,
                        baseIndentAmount,
                        indentation,
                        lineNumberToForLoopParts,
                        previousIndicator,
                        portedCode,
                    });
                    break;
                }

                case 'BackToLoopRenderingIndicator':
                    this.addClosingBrace(portedCode, indentation, baseIndentAmount, indicator.loopNode.indentationAmount);
                    break;
                case 'MergeTrueRenderingIndicator':
                    this.addClosingBrace(portedCode, indentation, baseIndentAmount, indicator.ifElseIfNode.indentationAmount);
                    break;

                // Add closing brace after 'else' statement if there was one.
                case 'MergeFalseRenderingIndicator': {

                    // An 'else' happens when the previous indicator is more indented than the current (i.e., higher column) b/c the indicators walk down the flowchart.
                    const previousColumn = previousIndicator.getColumn(renderingIndicators);
                    const currentColumn = indicator.getColumn(renderingIndicators);
                    const isElseStatement = previousColumn > currentColumn;

                    if (isElseStatement) {
                        this.addClosingBrace(portedCode, indentation, baseIndentAmount, indicator.ifElseIfNode.indentationAmount);
                    }
                    break;
                }
                default:
                    break;
            }

            previousIndicator = indicator;
        });

        /*
            Start porting the start and end nodes.
            Finish porting in ProgramFunction because start node may need to point to endNode, and
            endNode needs to point to return statement, which hasn't been made yet.
        */
        const endNode = renderingIndicators[renderingIndicators.length - 1].node;

        this.startNode.makePortedLine();
        endNode.makePortedLine();

        return { endNode, secondNode: renderingIndicators[1].node };
    }
}
