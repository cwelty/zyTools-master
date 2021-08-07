'use strict';

/* exported TextualCodeParser */
/* global Program, ProgramFunction, Flowchart, IntegerVariable, FloatVariable, IntegerArray, FloatArray, Variables, StartNode, EndNode,
          TokensOfLine, Token, isValidIdentifier, InputNode, OutputNode, AssignmentNode, LoopNode, IfNode, FunctionCallNode,
          Tokenizer, builtInFunctions, ExpressionParser, CompilerError, conditionalOperatorExpression, ElseIfNode, RenderingIndicatorFactory,
          makeSuggestionForInvalidDataType, combineWordsIntoSuggestion, builtInFunctionNames, arithmeticOperatorExpression */

/**
    A parser for converting textual code into a program.
    @class TextualCodeParser
*/
class TextualCodeParser {

    /**
        @constructor
    */
    constructor() {

        /**
            A message to indicate that the parser injected the main function.
            @property parserInjectedMainMessage
            @type {String}
            @default 'Parser injected Main function'
        */
        this.parserInjectedMainMessage = 'Parser injected Main function';

        /**
            An instance of the expression parser.
            @property expressionParser
            @type {ExpressionParser}
        */
        this.expressionParser = new ExpressionParser();

        /**
            The indents divisor. That is, indents are done at a 3-space standard.
            @property indentDivisor
            @type {Integer}
            @default 3
        */
        this.indentDivisor = 3;
    }

    /**
        Convert textual code into a program.
        @method parse
        @param {String} code The textual code to parse.
        @return {Program} The program converted from the textual code.
    */
    parse(code) {
        const tokenizer = new Tokenizer();
        const lines = tokenizer.tokenize(code);

        // Throw out blank lines, including lines with only indentation.
        const blankLineBatch = [];
        const linesToUse = lines.filter(line => {
            const lineHasTokens = Boolean(line.tokens.length);
            const lineIsOnlyIndentation = (line.tokens.length === 1) && (line.tokens[0].name === 'indent');
            const lineIsBlank = !lineHasTokens || lineIsOnlyIndentation;

            // Cache blank lines for the next non-blank line.
            if (lineIsBlank) {
                blankLineBatch.push(line);
            }

            // Non-blank line found. There are cache blank lines to store on the non-blank line.
            else if (blankLineBatch.length) {
                line.pushBlankLines(blankLineBatch);
                blankLineBatch.length = 0;
            }

            return !lineIsBlank;
        });

        // Remove spaces b/c spaces can be anywhere.
        linesToUse.forEach(line => line.removeSpaces());

        // Check for indents that are not a multiple of |this.indentDivisor|.
        linesToUse.filter(line => line.tokens[0].name === 'indent')
                  .filter(line => !Number.isInteger(line.tokens[0].value.length / this.indentDivisor))
                  .forEach(line => this.throwError(
                    `Indentation has ${line.tokens[0].value.length} spaces, but Coral uses ${this.indentDivisor}-space indents`,
                    line
                ));

        // Batch the lines into functions.
        const returnVariableOfEachFunction = [];
        const parameterVariablesOfEachFunction = [];
        const functionNames = builtInFunctionNames.slice();
        const processedFunctionDeclarations = this.batchIntoFunctions(linesToUse).map(functionBatch => {
            const functionDeclarationLine = functionBatch[0];
            const functionLines = functionBatch.slice(1, functionBatch.length);
            const globalScope = { functionNames, parameterVariablesOfEachFunction, returnVariableOfEachFunction };
            const {
                returnVariable, functionName, parameterVariables,
            } = this.parseFunctionDeclaration(functionDeclarationLine, globalScope);

            functionNames.push(functionName);
            returnVariableOfEachFunction.push(returnVariable);
            parameterVariablesOfEachFunction.push(parameterVariables);

            return {
                functionDeclarationLine,
                functionName,
                functionLines,
                parameterVariables,
                returnVariable,
            };
        });

        // Process each function.
        const functionsAndFlowchartLines = processedFunctionDeclarations.map(processedFunctionDeclaration => {
            const {
                functionDeclarationLine,
                functionName,
                functionLines,
                parameterVariables,
                returnVariable,
            } = processedFunctionDeclaration;

            // Scan function for unindented code.
            const wasMainFunctionInjected = functionDeclarationLine.line === this.parserInjectedMainMessage;

            if (!wasMainFunctionInjected) {
                const unindentedLines = functionLines.filter(line => line.tokens[0].name !== 'indent');

                if (unindentedLines.length) {
                    this.throwError('Code inside a function must be indented', unindentedLines[0]);
                }
            }

            // Split |functionLines| into local variables and flowchart nodes, ignoring comments above variable declarations.
            const dataTypes = functionLines.filter(line => {
                const dataTypeIndex = wasMainFunctionInjected ? 0 : 1;

                return line.tokens[dataTypeIndex].name === 'dataType';
            });
            const indexAfterLastDataType = functionLines.indexOf(dataTypes[dataTypes.length - 1]) + 1;
            const localVariableLines = functionLines.slice(0, indexAfterLastDataType).filter(line => {
                const dataTypeIndex = wasMainFunctionInjected ? 0 : 1;

                return line.tokens[dataTypeIndex].name !== 'comment';
            });
            const codeAboveDataTypes = localVariableLines.find(line => {
                const dataTypeIndex = wasMainFunctionInjected ? 0 : 1;

                return line.tokens[dataTypeIndex].name !== 'dataType';
            });
            const flowchartLines = functionLines.slice(indexAfterLastDataType);

            if (codeAboveDataTypes) {
                const indexOfCodeAboveDataTypes = localVariableLines.indexOf(codeAboveDataTypes);

                this.throwError(
                    'Variable declaration must be at top of function. Something above this line may not be a variable declaration',
                    localVariableLines[indexOfCodeAboveDataTypes + 1]
                );
            }

            // Build the local variables.
            const functionScope = {
                functionNames,
                parameterVariables,
                returnVariable,
            };
            const isFunctionMain = functionName === 'Main';
            const localVariablesName = isFunctionMain ? 'Variables' : 'Local variables';
            const localVariables = this.buildLocalVariablesFromLines(
                localVariableLines, localVariablesName, wasMainFunctionInjected, isFunctionMain, functionScope
            );

            return {
                programFunction: new ProgramFunction(functionName, localVariables, parameterVariables, returnVariable),
                flowchartLines,
                wasMainFunctionInjected,
                functionDeclarationLine,
            };
        });

        const functions = functionsAndFlowchartLines.map(functionsAndFlowchartLine => functionsAndFlowchartLine.programFunction);

        // Build the flowcharts.
        functionsAndFlowchartLines.forEach(functionsAndFlowchartLine => {
            const programFunction = functionsAndFlowchartLine.programFunction;
            const flowchartLines = functionsAndFlowchartLine.flowchartLines;
            const wasMainFunctionInjected = functionsAndFlowchartLine.wasMainFunctionInjected;
            const availableFunctions = functions.concat(builtInFunctions);

            programFunction.flowchart = this.buildFlowchartFromLines(
                flowchartLines,
                [ programFunction.parameters, programFunction.locals, programFunction.return ],
                wasMainFunctionInjected, availableFunctions
            );
            programFunction.setWasFunctionInjected(wasMainFunctionInjected);

            // Verify that function has at least 1 sub-statement.
            const secondNodeName = programFunction.flowchart.startNode.getChildNode().getName();

            // StartNode -> EndNode means there is no sub-statement. Not a problem, though, if main was injected.
            if (secondNodeName === 'EndNode' && !wasMainFunctionInjected) {
                this.throwSubStatementError('A function', functionsAndFlowchartLine.functionDeclarationLine);
            }
        });

        const mainFunction = functions.find(programFunction => programFunction.name === 'Main');

        // Move the function named Main to the front of the functions list.
        if (mainFunction) {
            const mainFunctionIndex = functions.indexOf(mainFunction);

            functions.splice(mainFunctionIndex, 1);
            functions.reverse();
            functions.unshift(mainFunction);

            // Find the line corresponding to Main for use in errors.
            const mainLine = functionsAndFlowchartLines.find(
                functionsAndFlowchartLine => functionsAndFlowchartLine.programFunction === mainFunction
            ).functionDeclarationLine;

            // Error if Main has parameter variables.
            if (mainFunction.parameters.length) {
                this.throwError('Main cannot have any parameter variables', mainLine);
            }

            // Error if Main has a return variable.
            if (mainFunction.return.length) {
                this.throwError('Main cannot have a return variable', mainLine);
            }
        }

        // Program must have a function named Main.
        else {
            throw new Error('Expected a Main function but didn\'t find one');
        }

        return new Program(functions);
    }

    /**
        Build a flowchart from lines of tokens.
        @method buildFlowchartFromLines
        @param {Array} lines Array of {TokensOfLine} The lines of tokens from which to build the flowchart.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Boolean} wasMainFunctionInjected Whether the main function was injected.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {Flowchart} The flowchart built from the lines of tokens.
    */
    buildFlowchartFromLines(lines, arrayOfVariables, wasMainFunctionInjected, availableFunctions) {
        this.transpileForLoopStructureToWhileLoopStructure(lines, arrayOfVariables, availableFunctions);

        const startNode = new StartNode();
        const baseIndent = wasMainFunctionInjected ? 0 : 1;
        const secondNode = this.buildFlowchartFromLinesRunner(
            lines, baseIndent, baseIndent, arrayOfVariables, availableFunctions
        );
        const startNodeLine = new TokensOfLine('', secondNode.line ? secondNode.line.lineNumber : null);
        const endNodeToUse = new EndNode(null, null, new TokensOfLine('', null));

        startNode.setChildNode(secondNode);
        startNode.line = startNodeLine;
        this.updateEndNodesToBeTheSameInstance(startNode, endNodeToUse);

        return new Flowchart(startNode);
    }

    /**
        Transpile for-loop structures into a while-loop structure.
        @method transpileForLoopStructureToWhileLoopStructure
        @param {Array} lines Array of {TokensOfLine} The lines of tokens from which to transpile for-loop into while-loop.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {Array} of {TokensOfLine} The transpiled lines.
    */
    transpileForLoopStructureToWhileLoopStructure(lines, arrayOfVariables, availableFunctions) {
        let forLoop = null;

        // Starting from the top-most for-loop, convert for-loops into while-loops until there are no more for-loops.
        do {

            // Find a for loop which is either the first token, or second token if the first token is an indent.
            forLoop = lines.find(line => {
                const firstTokenIsFor = line.tokens.length && (line.tokens[0].value === 'for');
                const secondTokenIsFor = (line.tokens.length > 1) && (line.tokens[0].name === 'indent') && (line.tokens[1].value === 'for');

                return firstTokenIsFor || secondTokenIsFor;
            });

            /*
                Convert for loop into two assignments and one loop node.
                Ex: Convert:
                // ...a...
                for i = 0; i < 3; i = i + 1
                    // ...b...
                // ...c...

                Into:
                // ...a...
                i = 0
                while i < 3
                    // ...b...
                    i = i + 1
                // ...c...
            */
            if (forLoop) {
                const { first, second, third } = this.convertForLoopLineToThreeLines(forLoop, arrayOfVariables, availableFunctions);
                const firstIndex = lines.indexOf(forLoop);
                const secondIndex = firstIndex + 1;

                // Replace |forLoop| with |first| in |lines|.
                lines[firstIndex] = first;

                // Insert |second| after |first| in |lines|.
                lines.splice(secondIndex, 0, second);

                // Find the first line after the loop body by looking for the next line with less indentation than needed to be in the loop body.
                const linesAfterSecond = lines.filter((line, index) => index > secondIndex);
                const neededIndentation = this.computeIndentationLength(first) + this.indentDivisor;
                const lineAfterLoopBody = linesAfterSecond.find(line => this.computeIndentationLength(line) < neededIndentation);

                // Found the first line after loop body, so add |third| just before that.
                if (lineAfterLoopBody) {
                    const thirdIndex = lines.indexOf(lineAfterLoopBody);

                    lines.splice(thirdIndex, 0, third);
                }

                // No line after loop body exists, so |third| becomes the last line.
                else {
                    lines.push(third);
                }
            }
        } while (forLoop);
    }

    /**
        Fill some tokens with spaces based all tokens in the line.
        @method fillWithSpaces
        @param {Array} someTokens Array of {Tokens}. Some of the tokens are from the list, but not all. Need to add back spaces where possible.
        @param {Array} allTokens Array of {Tokens}. All the tokens from the line.
        @return {Array} of {Tokens} The some tokens with spaces filled in.
    */
    fillWithSpaces(someTokens, allTokens) {
        const startToken = someTokens.find(token => allTokens.includes(token));
        const endToken = someTokens[someTokens.length - 1];
        const firstPart = someTokens.slice(0, someTokens.indexOf(startToken));
        const secondPart = allTokens.slice(allTokens.indexOf(startToken), allTokens.indexOf(endToken) + 1);

        return firstPart.concat(secondPart);
    }

    /**
        Convert the for loop line into three lines based, one for each part of the for-loop.
        @method convertForLoopLineToThreeLines
        @param {TokensOfLine} forLoop The for loop line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {Object} The three lines from which the for loop was created.
    */
    convertForLoopLineToThreeLines(forLoop, arrayOfVariables, availableFunctions) {
        const tokens = forLoop.tokens;
        const indentToken = (tokens[0] && tokens[0].name === 'indent') ? tokens.shift() : null;

        // Remove "for" token.
        tokens.shift();

        /*
            Split the for-loop's tokens into 3 groups, one for each part of the for-loop.
            Ex: for i = 0; i < 3; i = i + 1 has parts: (i = 0), (i < 3), (i = i + 1)
        */
        const firstTokens = [];
        const secondTokens = [];
        const thirdTokens = [];
        const tokenGroups = [ firstTokens, secondTokens, thirdTokens ];
        let currentGroupIndex = 0;

        tokens.forEach(token => {

            // Found a semicolon. Start on the next group of tokens.
            if (token.value === ';') {
                currentGroupIndex++;

                // Verify number of parts is as expected.
                if (currentGroupIndex >= tokenGroups.length) {
                    this.throwError('Too many semicolons (expected two semicolons)', forLoop);
                }
            }
            else {
                tokenGroups[currentGroupIndex].push(token);
            }
        });

        // Do some error checking on the resulting |tokenGroups|.
        if (currentGroupIndex !== (tokenGroups.length - 1)) {
            this.throwError('Too few semicolons (expected two semicolons)', forLoop);
        }

        if (!tokenGroups[0].some(token => token.name === 'assignment')) {
            this.throwError('First part must be an assignment', forLoop);
        }

        const secondPartErrorMessage = 'Second part must be a decision expression';

        if (!tokenGroups[1].some(token => conditionalOperatorExpression.test(token.value))) {
            this.throwError(secondPartErrorMessage, forLoop);
        }

        if (!tokenGroups[2].some(token => token.name === 'assignment')) {
            this.throwError('Third part must be an assignment', forLoop);
        }

        const secondWithoutIndentingOrWhile = secondTokens.slice();

        // Add "while" token to |second|.
        secondTokens.unshift(new Token('word', 'while'));

        // Add indentation to |first| and |second| if there was an |indentToken|.
        let firstIndenting = '';

        if (indentToken) {
            firstIndenting = indentToken.value;
            firstTokens.unshift(new Token('indent', firstIndenting));
            secondTokens.unshift(new Token('indent', firstIndenting));
        }

        // Add indentation to |third| that is 1 more indented than |first|'s indentation.
        const thirdIndenting = firstIndenting + ' '.repeat(this.indentDivisor);

        thirdTokens.unshift(new Token('indent', thirdIndenting));

        /*
            Find the start and end indices from |forLoop.line| for each part.
            Ex: for i = 0; i < 3; i = i + 1
            First part: Start index is 4 and end index is 8.
            Second part: Start index is 11 and end index is 15.
            Third part: Start index is 18 and end index is 26.
        */
        const lineParts = forLoop.line.split(';');

        // Find the indices for the first part in the string. Ex: "for i = 0"
        const firstPartString = lineParts[0].match(/^\s*for\s+(.*)\s*$/)[1];
        const firstStartIndex = lineParts[0].indexOf(firstPartString);
        const firstEndIndex = firstStartIndex + firstPartString.length - 1;

        // Find the indices for the second part in the string. Ex: " i < 3"
        const secondPartString = lineParts[1].trim();
        const lengthTillFirstSemicolon = lineParts[0].length + 1;
        const secondStartIndex = lineParts[1].indexOf(secondPartString) + lengthTillFirstSemicolon;
        const secondEndIndex = secondStartIndex + secondPartString.length - 1;

        // Find the indices for the third part in the string. Ex: " i = i + 1"
        const thirdPartString = lineParts[2].trim();
        const lengthTillSecondSemicolon = lengthTillFirstSemicolon + lineParts[1].length + 1;
        const thirdStartIndex = lineParts[2].indexOf(thirdPartString) + lengthTillSecondSemicolon;
        const thirdEndIndex = thirdStartIndex + thirdPartString.length - 1;

        // Build a line for each part.
        const first = new TokensOfLine(firstPartString, forLoop.lineNumber, firstStartIndex, firstEndIndex);
        const second = new TokensOfLine(`while ${secondPartString}`, forLoop.lineNumber, secondStartIndex, secondEndIndex);
        const third = new TokensOfLine(thirdPartString, forLoop.lineNumber, thirdStartIndex, thirdEndIndex);

        first.pushBlankLines(forLoop.blankLinesAbove);
        first.push(...this.fillWithSpaces(firstTokens, forLoop.allTokens));
        second.push(...this.fillWithSpaces(secondTokens, forLoop.allTokens));
        third.push(...this.fillWithSpaces(thirdTokens, forLoop.allTokens));

        first.removeSpaces();
        second.removeSpaces();
        third.removeSpaces();

        first.isFromForLoop = true;
        second.isFromForLoop = true;
        third.isFromForLoop = true;

        // Test that the second part is a decision expression.
        let expressionResult = null;

        try {
            expressionResult = this.runExpressionParserOnLine(secondWithoutIndentingOrWhile, second, arrayOfVariables, availableFunctions);
        }
        catch (error) {
            const offsetFromColonToError = 2;
            const messageWithoutLineIndex = error.message.indexOf(':') + offsetFromColonToError;
            let messageWithoutLine = error.message.substring(messageWithoutLineIndex);
            const firstOrSecondIndex = (messageWithoutLine.length === 1) ? 0 : 1;

            messageWithoutLine = messageWithoutLine[0].toLowerCase() + messageWithoutLine.substr(firstOrSecondIndex);
            this.throwError(`In loop expression, ${messageWithoutLine}`, forLoop);
        }

        // Check that the expression resolves to a boolean.
        if (expressionResult.rootDataType && (expressionResult.rootDataType.getClassName() !== 'BooleanVariable')) {
            this.throwError(secondPartErrorMessage, second);
        }

        return { first, second, third };
    }

    /**
        Iterate through the lines of code to build a flowchart.
        @method buildFlowchartFromLinesRunner
        @param {Array} lines Array of {TokensOfLine} The lines of tokens from which to build the flowchart.
        @param {Integer} baseIndent The smallest allowed indent in the function.
        @param {Integer} expectedIndent The expected amount of indentation for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @param {Array} [commentLines=[]] Arrary of {TokensOfLine}. The list of comments waiting to be pair with a node.
        @param {Boolean} [isFirstChildOfFalseBranchOfIfOrElseIf=false] Whether the next node is going to be the first child of the false branch of an if or elseif node.
        @return {FlowchartNode} The top of the current sub-tree.
    */
    buildFlowchartFromLinesRunner( // eslint-disable-line
        lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines = [],
        isFirstChildOfFalseBranchOfIfOrElseIf = false
    ) {
        let node = null;
        const line = lines.shift();

        if (line) {

            // Compute the indentation length.
            const currentIndent = this.computeIndentationLength(line) / this.indentDivisor;
            let indentation = null;

            if (line.tokens[0].name === 'indent') {
                indentation = line.tokens.shift();
            }

            // Recursive case: Line is a comment. Store the comment then recurse.
            if (line.tokens[0] && line.tokens[0].name === 'comment') {
                commentLines.push(line);
                node = this.buildFlowchartFromLinesRunner(
                    lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines,
                    isFirstChildOfFalseBranchOfIfOrElseIf
                );
            }

            // Base case: This line belongs to a higher nesting, so we must be at the end of a branch. Put the line back and return null.
            else if (currentIndent < expectedIndent) {
                if (indentation) {
                    line.tokens.unshift(indentation);
                }
                lines.unshift(line);
            }

            // Recursive case: Line's indentation matches the current nesting. Create a node from the line then try to do so for the next line.
            else if (currentIndent === expectedIndent) {

                // 'elseif' must be the first child of the false branch of an if (or elseif) node.
                if ((line.tokens[0].value === 'elseif') && !isFirstChildOfFalseBranchOfIfOrElseIf) {
                    this.throwError('Should have if/elseif above, but does not', line);
                }

                node = this.handleRecursiveBuildFlowchart(
                    line, lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines
                );

                node.addIndentationAmount(expectedIndent);
            }

            // Error case: Too much indenting.
            else if (currentIndent > expectedIndent) {
                let message = 'Expected no indent';

                if (expectedIndent > 0) {
                    const expectedIndentWord = `indent${expectedIndent === 1 ? '' : 's'}`;
                    const currentIndentWord = `indent${currentIndent === 1 ? '' : 's'}`;
                    const expectedMessage = `Expected at most ${expectedIndent} ${expectedIndentWord}`;
                    const foundMessage = `, but found ${currentIndent} ${currentIndentWord}`;

                    message = expectedMessage + foundMessage;
                }

                this.throwError(`${message}. An indent is 3 spaces`, line);
            }
        }

        // Base case: No more lines, but indents are expected, so do nothing.
        else if (expectedIndent > baseIndent) {

            // Do nothing.
        }

        // Base case: No more lines. We've found the end of the flowchart.
        else {
            node = new EndNode();
        }

        return node;
    }

    /**
        Computate the indentation of the given line.
        @method computeIndentationLength
        @param {TokensOfLine} line The line from which to compute the indentation length.
        @return {Integer} The indentation length of the given line.
    */
    computeIndentationLength(line) {
        return (line.tokens.length && line.tokens[0].name === 'indent') ? line.tokens[0].value.length : 0;
    }

    /**
        Create a node from the line then try to do so for the next line.
        @method handleRecursiveBuildFlowchart
        @param {TokensOfLine} line The line of tokens from which to make a node.
        @param {Array} lines Array of {TokensOfLine} The lines of tokens from which to build the flowchart.
        @param {Integer} baseIndent The smallest allowed indent in the function.
        @param {Integer} expectedIndent The expected amount of indentation for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @param {Array} commentLines Array of {TokensOfLine}. The list of comments waiting to be pair with a node.
        @return {FlowchartNode} The top of the current sub-tree.
    */
    handleRecursiveBuildFlowchart(line, lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines) { // eslint-disable-line
        const node = this.makeNodeFromLine(line, arrayOfVariables, availableFunctions);

        // Push comments onto the node.
        node.addCommentLines(commentLines);
        commentLines.length = 0;

        switch (node.getName()) {
            case 'InputNode':
            case 'OutputNode':
            case 'AssignmentNode':
            case 'FunctionCallNode':
                node.setChildNode(this.buildFlowchartFromLinesRunner(
                    lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines
                ));
                break;

            // Build true branch then false branch.
            case 'LoopNode': {
                const trueBranchChild = this.buildFlowchartFromLinesRunner(
                    lines, baseIndent, expectedIndent + 1, arrayOfVariables, availableFunctions, commentLines
                );

                // Verify the loop has at least one sub-statement.
                if (!trueBranchChild) {
                    this.throwSubStatementError('A loop', line);
                }

                /*
                    Verify a for-loop's true branch doesn't point to the for-loop's 3rd part.
                    Ex: for i = 0; i < 3; i = i + 1 has 3 parts:
                    1. i = 0
                    2. i < 3
                    3. i = i + 1

                    This loop node is the 2nd part. If the loop node points to the 3rd part,
                    then there were no sub-statements in the for-loop.
                */
                else if (node.line.isFromForLoop && trueBranchChild.line.isFromForLoop &&
                        (node.line.lineNumber === trueBranchChild.line.lineNumber)) {
                    this.throwSubStatementError('A loop', line);
                }

                const falseBranchChild = this.buildFlowchartFromLinesRunner(
                    lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines
                );

                this.assignLeavesChildrenToGivenNode(trueBranchChild, node);
                node.setChildNodeForTrue(trueBranchChild || node);
                node.setChildNodeForFalse(falseBranchChild);
                break;
            }

            // Build true branch, false branch, then after the if-else branches.
            case 'IfNode':
            case 'ElseIfNode': {
                const trueBranchChild = this.buildFlowchartFromLinesRunner(
                    lines, baseIndent, expectedIndent + 1, arrayOfVariables, availableFunctions, commentLines
                );

                // Verify the true branch has at least one statement.
                if (!trueBranchChild) {
                    this.throwSubStatementError('A branch', line);
                }

                // If the next line is 'elseif', then don't take from |comments|.
                const valueOfFirstNonIndentToken = this.getValueOfFirstNonIndentToken(lines);

                if (valueOfFirstNonIndentToken !== 'elseif') {

                    // Special situation where there were comments above the "else" and there were comments from above the "if" or "elseif".
                    if (commentLines.length && node.commentLines.length) {
                        node.addElseCommentLines(commentLines);
                        commentLines.length = 0;
                    }
                }

                let falseBranchChild = null;

                // If the next line is an else or elseif with the expected indentation, then traverse the false branch.
                if (this.nextLineIsElseOrElseIfWithExpectedIndentation(lines, expectedIndent)) {
                    const isElseLine = valueOfFirstNonIndentToken === 'else';
                    const indentOffset = isElseLine ? 1 : 0;
                    const nextLine = lines[0];

                    // Remove the else line.
                    if (isElseLine) {
                        this.verifyElseLineHasNoErrors(lines.shift());
                    }

                    falseBranchChild = this.buildFlowchartFromLinesRunner(
                        lines, baseIndent, expectedIndent + indentOffset, arrayOfVariables, availableFunctions, commentLines, true
                    );

                    if (isElseLine && !falseBranchChild) {
                        this.throwSubStatementError('An else statement', nextLine);
                    }
                }

                // If next line is else or elseif, then there is an error.
                if (this.nextLineIsElseOrElseIfWithExpectedIndentation(lines, expectedIndent)) {
                    this.throwError('Should have if/elseif above, but does not', lines[0]);
                }

                let nodeAfterIfElse = null;

                /*
                    If the false branch was an elseif, then get that elseif's merge node. Ex:
                    if 1==1
                        Put "a" to output
                    elseif 2==2
                        Put "b" to output
                    else
                        Put "c" to output
                    Put "d" to output

                    Put "d" to output is the merge node of the elseif, which is what comes after the if-else structure.
                */
                if (falseBranchChild && (falseBranchChild.getName() === 'ElseIfNode')) {
                    nodeAfterIfElse = this.findMergeNode(falseBranchChild);
                }
                else {
                    nodeAfterIfElse = this.buildFlowchartFromLinesRunner(
                        lines, baseIndent, expectedIndent, arrayOfVariables, availableFunctions, commentLines
                    );
                }

                this.assignLeavesChildrenToGivenNode(trueBranchChild, nodeAfterIfElse);
                this.assignLeavesChildrenToGivenNode(falseBranchChild, nodeAfterIfElse);
                node.setChildNodeForTrue(trueBranchChild || nodeAfterIfElse);
                node.setChildNodeForFalse(falseBranchChild || nodeAfterIfElse);
                break;
            }
            default:
                this.throwError('Unsupported node type', line);
        }

        return node;
    }

    /**
        Verify that the given else line has no errors.
        @method verifyElseLineHasNoErrors
        @param {TokensOfLine} elseLine Verify there are no errors in this line.
        @return {void}
    */
    verifyElseLineHasNoErrors(elseLine) {

        // Remove indent token, if it exists.
        if (elseLine.tokens[0].name === 'indent') {
            elseLine.tokens.shift();
        }

        // Remove else token.
        elseLine.tokens.shift();

        // Check if there are tokens after 'else'. If so, throw error b/c there shouldn't be.
        if (elseLine.tokens.length) {
            const suggestion = elseLine.tokens[0].value === 'if' ? combineWordsIntoSuggestion([ 'elseif' ]) : null;

            this.throwError('\'else\' should be the only item on the line', elseLine, suggestion);
        }
    }

    /**
        Return whether the next line is an else or elseif with the expected indentation.
        @method nextLineIsElseOrElseIfWithExpectedIndentation
        @param {Array} lines Array of {TokensOfLine}. The lines of tokens being parsed.
        @param {Integer} expectedIndent The expected amount of indentation.
        @return {Boolean} Whether the next line is an else or elseif with the expected indentation.
    */
    nextLineIsElseOrElseIfWithExpectedIndentation(lines, expectedIndent) {
        let nextLineIsElseOrElseIfWithExpectedIndentation = false;

        if (lines.length) {
            const nextLineIndenting = this.computeIndentationLength(lines[0]) / this.indentDivisor;
            const valueOfFirstNonIndentToken = this.getValueOfFirstNonIndentToken(lines);
            const isNextLineElseOrElseIf = [ 'else', 'elseif' ].indexOf(valueOfFirstNonIndentToken) !== -1;

            nextLineIsElseOrElseIfWithExpectedIndentation = (expectedIndent === nextLineIndenting) && isNextLineElseOrElseIf;
        }

        return nextLineIsElseOrElseIfWithExpectedIndentation;
    }

    /**
        Make a node from the given line of tokens.
        @method makeNodeFromLine
        @param {TokensOfLine} line The line of tokens from which to make the node.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {FlowchartNode} The node made from the line.
    */
    makeNodeFromLine(line, arrayOfVariables, availableFunctions) {
        let node = null;
        const tokens = line.tokens;
        const firstToken = tokens.shift();

        if (firstToken.name === 'word') {
            if (firstToken.value === 'Put') {
                node = this.buildOutputNodeGivenPutToken(line, arrayOfVariables, availableFunctions);
            }
            else if (firstToken.value === 'if') {
                node = this.buildIfNodeGivenIfToken(line, arrayOfVariables, availableFunctions);
            }
            else if (firstToken.value === 'while') {
                node = this.buildLoopNodeGivenWhileToken(line, arrayOfVariables, availableFunctions);
            }
            else if (firstToken.value === 'elseif') {
                node = this.buildElseIfNodeGivenElseIfToken(line, arrayOfVariables, availableFunctions);
            }

            // Assignment indicates this is an input or assignment node.
            else if (tokens.find(token => token.name === 'assignment')) {

                // Build list of tokens before the assignment.
                let foundFirstAssignment = false;
                const tokensBeforeAssignment = [ firstToken ];

                while (!foundFirstAssignment && tokens.length) {
                    if (tokens[0].name === 'assignment') {
                        foundFirstAssignment = true;
                    }
                    else {
                        tokensBeforeAssignment.push(tokens.shift());
                    }
                }

                // Build the abstract syntax tree for the assigned value.
                const expressionParseResult = this.runExpressionParserOnLine(
                    tokensBeforeAssignment, line, arrayOfVariables, availableFunctions
                );

                // Remove the assignment.
                tokens.shift();

                if (tokens.length) {

                    // Build an input node.
                    if (tokens[0].value === 'Get') {
                        node = this.buildInputNodeGivenAssignedTree(expressionParseResult, tokensBeforeAssignment, line);
                    }

                    // Build an assignment node.
                    else {
                        node = this.buildAssignmentNodeGivenAssignedTree(
                            expressionParseResult, tokensBeforeAssignment, line, arrayOfVariables, availableFunctions
                        );
                    }
                }
                else {
                    this.throwError('Expected an expression after the assignment operator', line);
                }
            }

            // Build a function call node.
            else {

                // Add the function name token back.
                tokens.unshift(firstToken);
                node = this.buildFunctionCallNode(line, arrayOfVariables, availableFunctions);
            }
        }
        else {
            let error = `Expected word, found ${firstToken.name}`;

            // If line begins with non-word token and contains a conditional operator, then conditional operator is outside a branch statement.
            const firstConditionalOperator = this.getValueOfFirstConditionalOperator(tokens);

            error = this.appendGenericLooseConditionalErrorIfConditionalInLine(firstConditionalOperator, error);

            this.throwError(error, line);
        }

        return node;
    }

    /**
        Append genericLooseConditionalError to error if conditionalOperator is defined.
        @method appendGenericLooseConditionalErrorIfConditionalInLine
        @param {String} conditionalOperator Value (>, >=, <, <=, ==) of the conditional operator outside a branch statement.
        @param {String} error The error message to append the genericLooseConditionalError to.
        @return {String} updatedError The error message with the genericLooseConditionalError possibly appended.
    */
    appendGenericLooseConditionalErrorIfConditionalInLine(conditionalOperator, error) {

        // conditionalOperator is firstConditionalOperator found in a line being processed by makeNodeFromLine()
        let updatedError = error;

        if (conditionalOperator) {
            updatedError += `\n${this.genericLooseConditionalError(conditionalOperator)}`;
        }
        return updatedError;
    }

    /**
        Throw a conditional operator error for conditionalOperator known to be outside of a branch statement.
        @method throwConditionalOperatorError
        @param {String} conditionalOperator Value (>, >=, <, <=, ==) of the conditional operator outside a branch statement.
        @param {TokensOfLine} line The line of tokens from which conditionalOperator comes from.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @return {Void}
    */
    throwConditionalOperatorError(conditionalOperator, line, arrayOfVariables) {

        // conditionalOperator is firstConditionalOperator found in a line being processed by buildFunctionCallNode()

        // Get string containing parameter, local, and return variable names.
        const availableVariableNames = arrayOfVariables.map(variables => variables.getVariableNames()).join(',');

        // Get the index of conditionalOperator's token in the line.
        const indexOfConditionalInTokens = line.tokens.findIndex(token => token.value === conditionalOperator);

        // Get the value of the token one place to the left of conditionalOperator's token.
        const valueOfTokenToLeftOfConditional = line.tokens[indexOfConditionalInTokens - 1].value;

        // If token to left of conditionalOperator is an available variable name or a ']', then that token can be assigned to.
        // ']' indicates a subscript of an array variable took place.
        const tokenToLeftOfConditionalIsAssignable = (availableVariableNames.includes(valueOfTokenToLeftOfConditional) ||
                                                     valueOfTokenToLeftOfConditional === ']');

        let conditionalOperatorErrorMessage = this.genericLooseConditionalError(conditionalOperator);

        if (conditionalOperator === '==' && tokenToLeftOfConditionalIsAssignable) {
            conditionalOperatorErrorMessage += '\nDid you mean = instead?';
        }

        this.throwError(conditionalOperatorErrorMessage, line);
    }

    /**
        Return the value of the first 'conditionalOperator' token in a line.
        @method getValueOfFirstConditionalOperator
        @param {Array} tokens Array of {TokensOfLine} The tokens from which to get the value.
        @return {String} The value of the first 'conditionalOperator' token of the line.
    */
    getValueOfFirstConditionalOperator(tokens) {
        const firstConditionalToken = tokens.find(token => token.name === 'conditionalOperator');

        return firstConditionalToken && firstConditionalToken.value;
    }

    /**
        Return generic error for a conditional operator used outside a branch statement.
        @method genericLooseConditionalError
        @param {String} operator Value (>, >=, <, <=, ==) of the conditional operator outside a branch statement.
        @return {String} The generic conditional error incorporating operator.
    */
    genericLooseConditionalError(operator) {
        return `Conditional operator ${operator} used outside of branch statement`;
    }

    /**
        Return the value of the first non-indent token of the next line.
        @method getValueOfFirstNonIndentToken
        @param {Array} lines Array of {TokensOfLine} The lines of tokens from which to get the value.
        @return {String} The value of the first non-indent token of the next line.
    */
    getValueOfFirstNonIndentToken(lines) {
        let valueOfFirstNonIndentToken = '';

        if (lines.length && lines[0].tokens.length) {
            const nextLineTokens = lines[0].tokens;

            if (nextLineTokens[0].name === 'indent') {
                valueOfFirstNonIndentToken = nextLineTokens[1] ? nextLineTokens[1].value : '';
            }
            else {
                valueOfFirstNonIndentToken = nextLineTokens[0].value;
            }
        }

        return valueOfFirstNonIndentToken;
    }

    /**
        Assign the leaves in the given tree of nodes with |node|.
        @method assignLeavesChildrenToGivenNode
        @param {FlowchartNode} tree The top of the tree.
        @param {FlowchartNode} node The node with which to assign to the leaves' children.
        @param {Array} [traversedNodes=[]] Array of {FlowchartNode}. The list of nodes that have already been traversed.
        @return {void}
    */
    assignLeavesChildrenToGivenNode(tree, node, traversedNodes = []) { // eslint-disable-line complexity

        // If |tree| exists and hasn't been traversed, then traverse it.
        if (tree && traversedNodes.indexOf(tree) === -1) {
            traversedNodes.push(tree);

            // Base case: Found self. Do not pursue this tree.
            if (tree === node) {
                return;
            }

            switch (tree.getName()) {

                // Base case: End node has no children.
                case 'EndNode':
                    break;

                case 'InputNode':
                case 'OutputNode':
                case 'AssignmentNode':
                case 'FunctionCallNode':

                    // Recursive case: Child node exists, so traverse that node.
                    if (tree.getChildNode()) {
                        this.assignLeavesChildrenToGivenNode(tree.getChildNode(), node, traversedNodes);
                    }

                    // Base case: Child node doesn't exist, so assign |node|.
                    else {
                        tree.setChildNode(node);
                    }
                    break;
                case 'LoopNode':
                case 'IfNode':
                case 'ElseIfNode': {

                    // Recursive case: True branch child exists, so traverse that node.
                    if (tree.getChildNodeForTrue()) {
                        this.assignLeavesChildrenToGivenNode(tree.getChildNodeForTrue(), node, traversedNodes);
                    }

                    // Base case: True branch child doesn't exist, so assign |node|.
                    else {
                        tree.setChildNodeForTrue(node);
                    }

                    // Recursive case: False branch child exists, so traverse that node.
                    if (tree.getChildNodeForFalse()) {
                        this.assignLeavesChildrenToGivenNode(tree.getChildNodeForFalse(), node, traversedNodes);
                    }

                    // Base case: False branch child doesn't exist, so assign |node|.
                    else {
                        tree.setChildNodeForFalse(node);
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown node type ${tree.getName()} encountered in assignLeavesChildrenToGivenNode`);
            }
        }
    }

    /**
        Build an if-else node from the given line.
        @method buildIfNodeGivenIfToken
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {IfNode} The if-else node build from the given line of tokens.
    */
    buildIfNodeGivenIfToken(line, arrayOfVariables, availableFunctions) {
        const expressionResult = this.runExpressionParserOnBranchLine(line.tokens, line, arrayOfVariables, availableFunctions);

        // Check that the expression resolves to a boolean.
        if (expressionResult.rootDataType && (expressionResult.rootDataType.getClassName() !== 'BooleanVariable')) {
            this.throwError('Expression does not evaluate to a boolean value', line);
        }

        return new IfNode(expressionResult.tree, line.tokens.slice(), line);
    }

    /**
        Build a loop node from the given line.
        @method buildLoopNodeGivenWhileToken
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {LoopNode} The loop node build from the given line of tokens.
    */
    buildLoopNodeGivenWhileToken(line, arrayOfVariables, availableFunctions) {
        const expressionResult = this.runExpressionParserOnBranchLine(line.tokens, line, arrayOfVariables, availableFunctions);

        // Check that the expression resolves to a boolean.
        if (expressionResult.rootDataType && (expressionResult.rootDataType.getClassName() !== 'BooleanVariable')) {
            this.throwError('Expression does not evaluate to a boolean value', line);
        }

        return new LoopNode(expressionResult.tree, line.tokens.slice(), line);
    }

    /**
        Build an elseif node from the given line.
        @method buildElseIfNodeGivenElseIfToken
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {LoopNode} The loop node build from the given line of tokens.
    */
    buildElseIfNodeGivenElseIfToken(line, arrayOfVariables, availableFunctions) {
        const expressionResult = this.runExpressionParserOnBranchLine(line.tokens, line, arrayOfVariables, availableFunctions);

        // Check that the expression resolves to a boolean.
        if (expressionResult.rootDataType && (expressionResult.rootDataType.getClassName() !== 'BooleanVariable')) {
            this.throwError('Expression does not evaluate to a boolean value', line);
        }

        return new ElseIfNode(expressionResult.tree, line.tokens.slice(), line);
    }

    /**
        Build an assignment node from the given line.
        @method buildAssignmentNodeGivenAssignedTree
        @param {ExpressionParserResult} assignedResult The expression result of the assignment variable.
        @param {Array} tokensBeforeAssignment Array of {Token}. The tokens that make up the assigned result.
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {AssignmentNode} Built by parsing the remaining tokens.
    */
    buildAssignmentNodeGivenAssignedTree(assignedResult, tokensBeforeAssignment, line, arrayOfVariables, availableFunctions) {

        // Throw special error if ending in semicolon.
        if (line.tokens[line.tokens.length - 1].value === ';') {
            this.throwErrorEndsWithSemicolon(line);
        }

        const assigneeResult = this.runExpressionParserOnLine(line.tokens, line, arrayOfVariables, availableFunctions);

        // Either both trees evaluated to being arrays variables, or both evaluated to being non-array, number variables.
        if (assignedResult.rootDataType && assigneeResult.rootDataType) {
            const isAssignedAnArray = assignedResult.rootDataType.isArray();
            const isAssigneeAnArray = assigneeResult.rootDataType.isArray();

            // Both can be an array.
            if (isAssignedAnArray && isAssigneeAnArray) {

                // Do nothing.
            }

            // Cannot have one array and one not an array.
            else if (isAssignedAnArray && !isAssigneeAnArray) {
                this.throwError('Cannot assign non-array variable to an array variable', line);
            }
            else if (!isAssignedAnArray && isAssigneeAnArray) {
                this.throwError('Cannot assign array variable to a non-array variable', line);
            }

            // If assigned is not an array, then it must evaluate to a non-array variable.
            else if (!this.doesEvaluateToNonArrayVariable(assignedResult)) {
                this.throwError('Must assign to a variable', line);
            }

            // If assignee is not an array, then it must evaluate to an integer or float variable.
            else if (!this.doesEvaluateToNumericVariable(assigneeResult)) {
                this.throwError('Right-hand side of assignment does not evaluate to integer or float', line);
            }
        }
        else {
            this.throwError('Both sides of the assignment must have something', line);
        }

        return new AssignmentNode(
            assignedResult.tree, assigneeResult.tree, tokensBeforeAssignment, line.tokens.slice(), line
        );
    }

    /**
        Build a function call node from the line of tokens.
        @method buildFunctionCallNode
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {FunctionCallNode} Built with the line of code.
    */
    buildFunctionCallNode(line, arrayOfVariables, availableFunctions) {

        // Throw special error if ending in semicolon.
        if (line.tokens[line.tokens.length - 1].value === ';') {
            this.throwErrorEndsWithSemicolon(line);
        }

        const expressionResult = this.runExpressionParserOnLine(line.tokens, line, arrayOfVariables, availableFunctions);

        // Conditional operator outside of branch statement indicates conditional operator mis-use.
        const firstConditionalOperator = this.getValueOfFirstConditionalOperator(line.tokens);

        if (firstConditionalOperator) {
            this.throwConditionalOperatorError(firstConditionalOperator, line, arrayOfVariables);
        }

        // Check that there is no return value from the called function.
        if (expressionResult.rootDataType) {
            this.throwError('Function\'s return value not used', line);
        }

        return new FunctionCallNode(expressionResult.tree, line.tokens.slice(), line);
    }

    /**
        Parse the remaining tokens to build an input node.
        @method buildInputNodeGivenAssignedTree
        @param {ExpressionParserResult} assignedResult The expression result of the assignment variable.
        @param {Array} tokensBeforeAssignment Array of {Token}. The tokens that make up the assigned result.
        @param {TokensOfLine} line The tokens for this line.
        @return {InputNode} Built by parsing the remaining tokens.
    */
    buildInputNodeGivenAssignedTree(assignedResult, tokensBeforeAssignment, line) {
        const tokens = line.tokens;

        // Expecting 3 tokens: 'Get', 'next', 'input'.
        if ((tokens.length !== 3) || (tokens[1].value !== 'next') || (tokens[2].value !== 'input')) { // eslint-disable-line no-magic-numbers

            // Throw special error semicolon after 'input'.
            if ((tokens.length === 4) && (tokens[3].value === ';')) { // eslint-disable-line no-magic-numbers
                this.throwErrorEndsWithSemicolon(line);
            }
            else {
                this.throwError('Expected input format: <variable> = Get next input', line);
            }
        }

        if (!this.doesEvaluateToNonArrayVariable(assignedResult)) {
            this.throwError('Expected assignment to be to a non-array variable', line);
        }

        return new InputNode(assignedResult.tree, tokensBeforeAssignment, line);
    }

    /**
        Parse the remaining tokens to build an output node.
        @method buildOutputNodeGivenPutToken
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {OutputNode} Built by parsing the remaining tokens.
    */
    buildOutputNodeGivenPutToken(line, arrayOfVariables, availableFunctions) { // eslint-disable-line complexity

        // 'Put' has already been removed.
        const tokens = line.tokens;
        const thingToOutputToken = tokens.shift();
        const tokensToOutput = [ thingToOutputToken ];
        const errorMessage = 'Expected output format: Put <string or variable> to output';

        if (!thingToOutputToken) {
            this.throwError(errorMessage, line);
        }

        const isString = thingToOutputToken.name === 'string';
        let expressionTree = null;
        let userExpressionResult = null;
        let precisionTree = null;

        // Build an abstract syntax tree for the thing to output.
        if (!isString) {

            // Move all output tokens to |tokensToOutput| for abstract syntax tree building.
            while (tokens.length && tokens[0].value !== 'to') {
                tokensToOutput.push(tokens.shift());
            }

            userExpressionResult = this.runExpressionParserOnLine(tokensToOutput, line, arrayOfVariables, availableFunctions);
            const doesExpressionEvaluateToANonArrayNumericalValue = (userExpressionResult.rootDataType &&
                                                                    (userExpressionResult.rootDataType.getClassName() !== 'BooleanVariable') && // eslint-disable-line max-len
                                                                    (!userExpressionResult.rootDataType.isArray()));

            // Ensure the expression evaluates to a non-array, numerical value.
            if (!doesExpressionEvaluateToANonArrayNumericalValue) {
                this.throwError('Expected output of a numerical value', line);
            }

            expressionTree = userExpressionResult.tree;
        }

        // Ends with either "to output" or "to output with <integer> decimal places".
        if (tokens.length < 2) { // eslint-disable-line no-magic-numbers
            this.throwError(errorMessage, line);
        }

        const toToken = tokens.shift();
        const outputToken = tokens.shift();

        if ((toToken.value !== 'to') || (outputToken.value !== 'output')) {
            this.throwError(errorMessage, line);
        }

        const tokensForPrecision = [];

        // After "Put <string or variable> to output", we'd expect "with <integer> decimal places".
        if (tokens.length) {
            let errorMessageToUse = errorMessage;

            if (tokens[0].value === 'with') {
                const precisionErrorMessage = 'Expected output format: Put <number or variable> to output with <integer> decimal places';

                // Remove "with".
                tokens.shift();

                // There should be more tokens. The item to output must be a number.
                if (!tokens.length ||
                    !userExpressionResult ||
                    ![ 'FloatVariable', 'IntegerVariable' ].includes(userExpressionResult.rootDataType.getClassName())) {
                    this.throwError(precisionErrorMessage, line);
                }

                tokensForPrecision.push(tokens.shift());

                while (tokens.length && tokens[0].value !== 'decimal') {
                    tokensForPrecision.push(tokens.shift());
                }

                const expressionResult = this.runExpressionParserOnLine(tokensForPrecision, line, arrayOfVariables, availableFunctions);
                const doesExpressionEvaluateToIntegerValue = (expressionResult.rootDataType &&
                                                             (expressionResult.rootDataType.getClassName() === 'IntegerVariable'));

                // Ensure the expression evaluates to an integer.
                if (!doesExpressionEvaluateToIntegerValue) {
                    this.throwError('Expected number of decimals places to be an integer', line);
                }

                precisionTree = expressionResult.tree;

                if (tokens.length < 2) { // eslint-disable-line no-magic-numbers
                    this.throwError(precisionErrorMessage, line);
                }

                const decimalToken = tokens.shift();
                const placesToken = tokens.shift();

                if ((decimalToken.value !== 'decimal') || (placesToken.value !== 'places')) {
                    this.throwError(precisionErrorMessage, line);
                }

                errorMessageToUse = precisionErrorMessage;
            }

            // If any left, then throw errors.
            if (tokens.length) {

                // Special error for ending with semicolon.
                if ((tokens.length === 1) && (tokens[0].value === ';')) {
                    this.throwErrorEndsWithSemicolon(line);
                }
                else {
                    this.throwError(errorMessageToUse, line);
                }
            }
        }

        // Catch potential parsing errors with the string.
        let node = null;

        try {
            node = new OutputNode(
                expressionTree, tokensToOutput, line, precisionTree, tokensForPrecision
            );
        }
        catch (error) {
            this.throwError(error.message, line);
        }

        return node;
    }

    /**
        Parse the given line and return the result.
        @method runExpressionParserOnLine
        @param {Array} tokens Array of {Token}. The tokens to parse.
        @param {TokensOfLine} line The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {ExpressionParserResult} The result of the token parsing.
    */
    runExpressionParserOnLine(tokens, line, arrayOfVariables, availableFunctions) {
        let result = null;

        try {
            result = this.expressionParser.parse(tokens, arrayOfVariables, availableFunctions);
        }
        catch (error) {
            if (error.error === 'Expected expression') {
                const firstNonIndentToken = line.allTokens.find(token => token.name !== 'indent');

                error.error += ` after ${firstNonIndentToken.value}`;
            }

            this.throwError(error.error, line, error.suggestion);
        }

        return result;
    }

    /**
        Return whether the parser result evaluates to a non-array, numeric variable.
        @method doesEvaluateToNumericVariable
        @param {ExpressionParserResult} result The result to evaluate.
        @return {Boolean} Whether the parser result evaluates to a non-array, numeric variable.
    */
    doesEvaluateToNumericVariable(result) {
        return !result.tree.root.operator ||
               arithmeticOperatorExpression.test(result.tree.root.operator) ||
               (result.tree.root.getClassName() === 'SubscriptOperatorSymbol');
    }

    /**
        Return whether the parser result evaluates to a non-array variable.
        @method doesEvaluateToNonArrayVariable
        @param {ExpressionParserResult} result The result to evaluate.
        @return {Boolean} Whether the parser result evaluates to a non-array variable.
    */
    doesEvaluateToNonArrayVariable(result) {
        let doesEvaluateToNonArrayVariable = false;

        // Resolve to a non-array variable.
        if (result.tree.root) {
            const rootClass = result.tree.root.getClassName();

            // Subscript and memory cell resolve to a non-array variable.
            if ([ 'SubscriptOperatorSymbol', 'MemoryCellSymbol' ].indexOf(rootClass) >= 0) {
                doesEvaluateToNonArrayVariable = true;
            }

            // Variable that is non-array is non-array.
            else if ((rootClass === 'VariableSymbol') && !result.tree.root.variable.isArray()) {
                doesEvaluateToNonArrayVariable = true;
            }
        }

        return doesEvaluateToNonArrayVariable;
    }

    /**
        Build the local variables from lines of tokens.
        @method buildLocalVariablesFromLines
        @param {Array} lines Array of {TokensOfLine}. The lines from which to build the local variables.
        @param {String} name The name of the local variables.
        @param {Boolean} wasMainFunctionInjected Whether the main function was injected.
        @param {Boolean} isFunctionMain Whether the local variables are in the Main function.
        @param {Object} functionScope Stores the existing function names, parameter variables, and return variable.
        @return {Variables} The local variables.
    */
    buildLocalVariablesFromLines(lines, name, wasMainFunctionInjected, isFunctionMain, functionScope) {
        const localVariables = new Variables(name);

        // Look through lines to verify indentation is of smallest indent size then remove indentation.
        if (!wasMainFunctionInjected) {
            lines.forEach(line => {
                const indentToken = line.tokens.shift();
                const indentationSize = indentToken.value.length;

                if (indentationSize !== this.indentDivisor) {
                    this.throwError('Indentation is ${indentationSize} but expected ${this.indentDivisor}', line);
                }
            });
        }

        lines.forEach(line => {
            const variable = this.makeVariable(line);

            // Check if variable name (i.e., identifier) already exists as a local/parameter/return variable name or an implicit/built-in/user-defined function name.
            if (localVariables.getVariable(variable.name)) {
                const variableType = isFunctionMain ? '' : 'local ';

                this.throwDuplicateIdentifierError(variable.name, `${variableType}variable`, line);
            }
            else if (functionScope.parameterVariables.getVariable(variable.name)) {
                this.throwDuplicateIdentifierError(variable.name, 'parameter variable', line);
            }
            else if (functionScope.returnVariable.getVariable(variable.name)) {
                this.throwDuplicateIdentifierError(variable.name, 'return variable', line);
            }
            else if (functionScope.functionNames.includes(variable.name)) {
                this.throwDuplicateFunctionError(variable.name, line);
            }

            localVariables.push(variable);

            // No tokens should remain.
            if (line.tokens.length) {
                this.throwContentAfterDeclarationError(localVariables[localVariables.length - 1], line);
            }
        });

        return localVariables;
    }

    /**
        Batch the lines into functions.
        @method batchIntoFunctions
        @param {Array} lines Array of {TokensOfLine}. The lines to batch into functions.
        @return {Array} of {Array} of {TokensOfLines}. The lines batched into functions.
    */
    batchIntoFunctions(lines) {
        const hasExplicitFunction = lines.some(line => line.tokens[0].value === 'Function');
        const batchesOfLines = [];

        if (hasExplicitFunction) {
            let currentFunction = null;

            lines.forEach(line => {
                if (line.tokens[0].value === 'Function') {
                    currentFunction = [ line ];
                    batchesOfLines.push(currentFunction);
                }
                else if (currentFunction) {
                    currentFunction.push(line);
                }
                else {
                    this.throwError('Cannot have code outside function', line);
                }
            });
        }
        else {

            // If no functions, then make one for: Function nothing Main()
            const defaultMain = new TokensOfLine(this.parserInjectedMainMessage, 0);

            defaultMain.push(
                new Token('word', 'Function'),
                new Token('word', 'Main'),
                new Token('openingParens', '('),
                new Token('closingParens', ')'),
                new Token('word', 'returns'),
                new Token('dataType', 'nothing')
            );

            batchesOfLines.push([ defaultMain, ...lines ]);
        }

        return batchesOfLines;
    }

    /**
        Parse the function declaration line to build the return variable, function name, and parameter variables.
        @method parseFunctionDeclaration
        @param {TokensOfLine} line The line to parse.
        @param {Object} globalScope Program's global scope used for checking the identifiers in the function declaration.
        @return {Object} The return variable, function name, and parameter variables.
    */
    parseFunctionDeclaration(line, globalScope) { // eslint-disable-line complexity
        const lineTokens = line.tokens;

        // Remove the initial "Function" token.
        lineTokens.shift();

        // Get the function name.
        const functionToken = lineTokens.shift();

        if (!functionToken) {
            this.throwError('Missing function name', line);
        }
        else if ((functionToken.name !== 'word') || !isValidIdentifier(functionToken.value)) {
            this.throwError('Invalid function name', line);
        }

        const functionName = functionToken.value;
        const allFunctionNamesSoFar = globalScope.functionNames.slice().concat([ functionName ]);

        // Check if function name (i.e., identifier) already exists as a parameter/return variable or built-in/user-defined function name.
        if (globalScope.functionNames.includes(functionName)) {
            this.throwDuplicateFunctionError(functionName, line);
        }
        else if (globalScope.parameterVariablesOfEachFunction.some(variables => variables.getVariable(functionName))) {
            this.throwDuplicateIdentifierError(functionName, 'parameter variable in a different function', line);
        }
        else if (globalScope.returnVariableOfEachFunction.some(variables => variables.getVariable(functionName))) {
            this.throwDuplicateIdentifierError(functionName, 'return variable in a different function', line);
        }

        // Remove opening parens.
        const openingParensToken = lineTokens.shift();

        if (!openingParensToken || (openingParensToken.name !== 'openingParens')) {
            this.throwError('Missing opening parens before parameters', line);
        }

        // Build the parameter variables.
        const parameterVariables = new Variables('Parameter variables');

        while (lineTokens.length && (lineTokens[0].name !== 'closingParens')) {
            const variable = this.makeVariable(line, true);

            this.checkVariableAgainstParametersAndFunctions(variable.name, parameterVariables, allFunctionNamesSoFar, line);

            parameterVariables.push(variable);

            if (lineTokens.length) {

                // If a token remains, ensure it's a comma then remove it.
                if (lineTokens[0].name === 'comma') {
                    lineTokens.shift();
                }
                else if (lineTokens[0].name === 'closingParens') {

                    // Do nothing.
                }
                else {
                    this.throwContentAfterDeclarationError(parameterVariables[parameterVariables.length - 1], line);
                }
            }
        }

        // Remove closing parens.
        const closingParensToken = lineTokens.shift();

        if (!closingParensToken || (closingParensToken.name !== 'closingParens')) {
            this.throwError('Missing closing parens after parameters', line);
        }

        // Check for "returns" keyword.
        const returnToken = lineTokens.shift();

        if (!returnToken || (returnToken.value !== 'returns')) {
            this.throwError('Missing \'returns\' keyword after closing parens', line);
        }

        // Build the return variable.
        const returnVariable = new Variables('Return variable');

        if (!lineTokens.length) {
            this.throwError('Missing return type after \'returns\'', line);
        }
        else if (lineTokens[0].name === 'dataType') {
            if (lineTokens[0].value === 'nothing') {

                // Remove the "nothing" token.
                lineTokens.shift();
            }
            else {
                const variable = this.makeVariable(line, true);

                this.checkVariableAgainstParametersAndFunctions(variable.name, parameterVariables, allFunctionNamesSoFar, line);

                returnVariable.push(variable);
            }
        }
        else {
            this.throwError(`Invalid return type '${lineTokens[0].value}'`, line, makeSuggestionForInvalidDataType(lineTokens[0].value));
        }

        return { returnVariable, functionName, parameterVariables };
    }

    /**
        Check if variable name (i.e., identifier) already exists as a parameter variable or an implicit/built-in/user-defined function name.
        @method checkVariableAgainstParametersAndFunctions
        @param {String} variableName The variable name to check against parameters and function names.
        @param {Variables} parameterVariables The parameter variables of the function.
        @param {Array} functionNames The function names.
        @param {TokensOfLine} line The line of the variable declaration.
        @return {void}
    */
    checkVariableAgainstParametersAndFunctions(variableName, parameterVariables, functionNames, line) {
        if (parameterVariables.getVariable(variableName)) {
            this.throwDuplicateIdentifierError(variableName, 'parameter variable', line);
        }
        else if (functionNames.includes(variableName)) {
            this.throwDuplicateFunctionError(variableName, line);
        }
    }

    /**
        Make a variable from the given line. Examples of variables:
        integer numCats
        float percentChance
        integer array(5) myNums
        float array(7) myPercents
        @method makeVariable
        @param {TokensOfLine} line The original line of tokens before any pre-processing.
        @return {Variable} The variable made from the given line.
    */
    makeVariable(line) { // eslint-disable-line
        const lineTokens = line.tokens;

        // Too few tokens this line.
        if (lineTokens.length < 2) { // eslint-disable-line no-magic-numbers
            this.throwError('Missing variable name', line);
        }

        // Remove spacing from token type to account for array types having arbitrary whitespace between words. Ex: integer   array
        const dataType = lineTokens.shift().value;
        const dataTypeNoWhitespace = require('utilities').removeWhitespace(dataType);

        // If an array, then get the number of elements.
        let numberOfElements = null;

        if ([ 'integerarray', 'floatarray' ].indexOf(dataTypeNoWhitespace) >= 0) {
            if (lineTokens.length < 4) { // eslint-disable-line no-magic-numbers
                this.throwError('For array declaration, expected data type, number of elements, then variable name', line);
            }

            const parens1 = lineTokens.shift();

            numberOfElements = lineTokens.shift().value;

            const parens2 = lineTokens.shift();

            if (parens1.name !== 'openingParens') {
                this.throwError('Expected opening parens after the data type', line);
            }
            else if (parens2.name !== 'closingParens') {
                this.throwError('Expected closing parens after the number of elements', line);
            }
        }

        // Get the variable name.
        const variableName = lineTokens.shift().value;
        let unknownDataType = false;

        try {
            switch (dataTypeNoWhitespace) {
                case 'integer':
                    return new IntegerVariable(variableName);
                case 'float':
                    return new FloatVariable(variableName);
                case 'integerarray':
                    return new IntegerArray(variableName, numberOfElements);
                case 'floatarray':
                    return new FloatArray(variableName, numberOfElements);
                default:
                    unknownDataType = true;
                    break;
            }
        }
        catch (error) {
            this.throwError(error.message, line);
        }

        if (unknownDataType) {
            this.throwError(`Unrecognized data type '${dataType}'`, line, makeSuggestionForInvalidDataType(dataType));
        }
    }

    /**
        Return the code without the initial text and trimmed.
        @method removeInitialTextAndTrim
        @param {String} code The code from which to remove the text and trim.
        @param {String} text The text to remove from the beginning of the code.
        @return {String} The code without the initial text and trimmed.
    */
    removeInitialTextAndTrim(code, text) {
        return code.trim().slice(text.length).trim();
    }

    /**
        Throw an error caused by not having a sub-statement.
        @method throwSubStatementError
        @param {String} name The name of the constructor that doesn't have a sub-statement.
        @param {TokensOfLine} line The line with the error.
        @return {void}
    */
    throwSubStatementError(name, line) {
        this.throwError(`${name} must have at least one sub-statement, indented by 3 spaces`, line);
    }

    /**
        Throw an error message.
        @method throwError
        @param {String} message The message explaining the error.
        @param {TokensOfLine} line The line with the error.
        @param {String} [suggestion=''] A suggestion on how to address the error.
        @return {void}
    */
    throwError(message, line, suggestion = '') {
        throw new CompilerError(message, line, suggestion);
    }

    /**
        Throw an error message caused while parsing a branch statement.
        @method throwBranchError
        @param {String} messageWithLineNumber The message explaining the error, already begins with 'Line: xx'.
        @param {TokensOfLine} line The line with the error.
        @return {void}
    */
    throwBranchError(messageWithLineNumber, line) {
        let messageWithoutLineNumber = this.removeInitialTextAndTrim(messageWithLineNumber, `Line ${line.lineNumber}: `);

        if (messageWithoutLineNumber.includes(' = ')) {
            messageWithoutLineNumber += '\nDid you mean == instead?';
        }

        throw new CompilerError(messageWithoutLineNumber, line);
    }

    /**
        Throw an error message about not needing a semicolon.
        @method throwErrorEndsWithSemicolon
        @param {TokensOfLine} line The line with the error.
        @return {void}
    */
    throwErrorEndsWithSemicolon(line) {
        this.throwError('Semicolon not needed', line);
    }

    /**
        Throw an error that there is content after a variable declaration.
        @method throwContentAfterDeclarationError
        @param {Variable} variable The variable that has content after it.
        @param {TokensOfLine} line The line on which the variable was declared.
        @return {void}
    */
    throwContentAfterDeclarationError(variable, line) {
        const classNameToDataType = {
            IntegerVariable: 'integer',
            FloatVariable: 'float',
            IntegerArray: 'integer array',
            FloatArray: 'float array',
        };
        const dataType = classNameToDataType[variable.getClassName()];
        let messageMiddle = '';
        let suggestion = null;

        if (variable.isArray()) {
            messageMiddle = `, number of elements '(${variable.sizeCell.getValue()})',`;
        }
        else if (variable.name === 'vector') {
            suggestion = combineWordsIntoSuggestion([ `${dataType} array` ]);
        }

        this.throwError(
            `Found content after data type '${dataType}'${messageMiddle} and variable name '${variable.name}'`, line, suggestion
        );
    }

    /**
        Throw an error indicating there is a duplicate identifier.
        @method throwDuplicateIdentifierError
        @param {String} identifierName The name of the duplicate identifier.
        @param {String} type The other type of identifier, which is a duplicate.
        @param {TokensOfLine} line The line on which the identifier was declared.
        @return {void}
    */
    throwDuplicateIdentifierError(identifierName, type, line) {
        this.throwError(`'${identifierName}' is also declared as a ${type}`, line);
    }

    /**
        Throw an error for a duplicate function name.
        @method throwDuplicateFunctionError
        @param {String} functionName The name of the duplicate function.
        @param {TokensOfLine} line The line on which the identifier was declared.
        @return {void}
    */
    throwDuplicateFunctionError(functionName, line) {
        const functionType = builtInFunctionNames.includes(functionName) ? 'built-in ' : '';

        this.throwDuplicateIdentifierError(functionName, `${functionType}function`, line);
    }

    /**
        Update the end nodes to all be the same instance of EndNode.
        @method updateEndNodesToBeTheSameInstance
        @param {FlowchartNode} currentNode The current node being traversed.
        @param {EndNode} endNodeToUse The end node instance to use.
        @param {Array} traversedNodes Array of {FlowchartNode}. Nodes that have been traversed.
        @return {void}
    */
    updateEndNodesToBeTheSameInstance(currentNode, endNodeToUse, traversedNodes = []) {
        currentNode.children.forEach((child, index) => {

            // Base case: Found an end node to replace.
            if (child.getName() === 'EndNode') {
                currentNode.children[index] = endNodeToUse;
            }

            // Recursive case: Found a node that hasn't been traversed.
            else if (traversedNodes.indexOf(child) === -1) {
                traversedNodes.push(child);
                this.updateEndNodesToBeTheSameInstance(child, endNodeToUse, traversedNodes);
            }
        });
    }

    /**
        Find the merge node for the elseif node. The merge node is the node at the end of both the true and false branch of the elseif.
        @method findMergeNode
        @param {ElseIftNode} elseIfNode The current node being traversed.
        @return {FlowchartNode} The merge node.
    */
    findMergeNode(elseIfNode) {
        const renderingFactory = new RenderingIndicatorFactory();
        const mergeNodePairs = renderingFactory.findIfElseMergeNodePairs(elseIfNode);
        const mergePair = mergeNodePairs.find(pair => pair.ifElseIfNode === elseIfNode);

        return mergePair ? mergePair.mergeNode : null;
    }

    /**
        Call runExpressionParserOnLine on a line known to be a branch statement.
        @method runExpressionParserOnBranchLine
        @param {Array} tokens Array of {Token}. The tokens to parse.
        @param {TokensOfLine} branchLine The tokens for this line.
        @param {Array} arrayOfVariables Array of {Variables} List of the parameter, local, and return variables.
        @param {Array} availableFunctions Array of {ProgramFunction}. The available functions in this program.
        @return {ExpressionParserResult} The result of the token parsing.
    */
    runExpressionParserOnBranchLine(tokens, branchLine, arrayOfVariables, availableFunctions) {
        let expressionResult = null;

        try {
            expressionResult = this.runExpressionParserOnLine(tokens, branchLine, arrayOfVariables, availableFunctions);
        }
        catch (error) {
            this.throwBranchError(error.message, branchLine);
        }

        return expressionResult;
    }
}
