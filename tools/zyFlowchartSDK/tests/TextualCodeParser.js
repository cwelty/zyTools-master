'use strict';

/* eslint-disable no-magic-numbers */

/* exported runTextualCodeParserTests, testNodeOrdering, testArrayVariable */
/* global TextualCodeParser, QUnit, reservedWordsErrorMessages */

/**
    Test the given array variable for the correct number of elements and values.
    @method testArrayVariable
    @param {Object} assert Dictionary of QUnit functions.
    @param {Variables} variables The variables from which to get the array.
    @param {String} name The name of the array.
    @param {String} dataType The data type of the array.
    @param {Integer} expectedNumberOfElements The expected number of elements in the array.
    @return {void}
*/
function testArrayVariable(assert, variables, name, dataType, expectedNumberOfElements) {
    const variable = variables.getVariable(name);
    const numberOfElementsToTestWith = expectedNumberOfElements === '?' ? 0 : expectedNumberOfElements;

    assert.equal(variable.sizeCell.name, `${name}.size`);
    assert.equal(variable.sizeCell.value, expectedNumberOfElements);
    assert.equal(variable.arrayCells.length, numberOfElementsToTestWith);
    require('utilities').createArrayOfSizeN(numberOfElementsToTestWith).forEach((value, index) => {
        const cell = variable.getMemoryCellByName(`${name}[${index}]`);

        assert.equal(cell.getValue(), 0);
        assert.equal(cell.type, dataType);
    });
}

/**
    Test the given code generate the correct error message.
    @method testCodeLine
    @param {Object} assert Dictionary of QUnit functions.
    @param {String} code The code line being tested.
    @param {String} lineNumber The line number on which the error is generated.
    @param{String} expectedError the expected error message.
    @return {void}
*/
function testCodeLine(assert, code, lineNumber, expectedError) {
    const parser = new TextualCodeParser();
    let errorMessage = '';

    try {
        parser.parse(code);
    }
    catch (error) {
        errorMessage = error.message;
    }

    assert.equal(errorMessage, `Line ${lineNumber}: ${expectedError}`);
}

/**
    Test the given code generate the correct error message.
    @method testCodeLineReservedWord
    @param {Object} assert Disctionary of QUnit functions.
    @param {String} code The code line being tested.
    @param {String} lineNumber The line on which the error is generated.
    @param {String} errorWord The reserved word that is being tested.
    @return {void}
*/
function testCodeLineReservedWord(assert, { code, lineNumber, errorWord }) {
    testCodeLine(assert, code, lineNumber, reservedWordsErrorMessages[errorWord]);
}

/**
    Test the node ordering.
    @method testNodeOrdering
    @param {Object} assert Dictionary of QUnit functions.
    @param {Array} expectedNodeOrder Array of {String}. The expected order by node names.
    @param {Array} nodesList Array of {FlowchartNode}. The nodes in the actual order of the flowchart.
    @return {void}
*/
function testNodeOrdering(assert, expectedNodeOrder, nodesList) {
    assert.equal(nodesList.length, expectedNodeOrder.length);

    expectedNodeOrder.forEach((nodeName, index) => {
        assert.equal(nodesList[index].getName(), nodeName);
    });
}

/**
    Test the flowchart structure from the given start node, and return the structure flattened into an array.
    Only use for flowcharts that don't have decisions.
    @method testFlowchartStructureAndReturnAsFlattenedArray
    @param {Object} assert Dictionary of QUnit functions.
    @param {StartNode} startNode The node from which to start building the list of nodes.
    @param {Array} expectedNodeOrder Array of {String}. The expected order by node names.
    @return {Array} of {FlowchartNode} The flowchart structure flattened into an array.
*/
function testFlowchartStructureAndReturnAsFlattenedArray(assert, startNode, expectedNodeOrder) {
    const nodesList = [ startNode ];

    while (nodesList[nodesList.length - 1].children.length) {
        nodesList.push(nodesList[nodesList.length - 1].getChildNode());
    }

    testNodeOrdering(assert, expectedNodeOrder, nodesList);

    return nodesList;
}

/**
    Return whether the given code yields an error.
    @method didErrorOccur
    @param {String} code The code to test.
    @return {Boolean} Whether the given code yields an error.
*/
function didErrorOccur(code) {
    const parser = new TextualCodeParser();
    let wasError = false;

    try {
        parser.parse(code);
    }
    catch (error) {
        wasError = true;
    }

    return wasError;
}

/**
    Run the tokenizer tests.
    @method runTextualCodeParserTests
    @return {void}
*/
function runTextualCodeParserTests() {
    const parser = new TextualCodeParser();

    QUnit.test('Textual code parsing', assert => {

        // Test valid and invalid identifiers.
        {
            const validIdentifiers = [
                'ham',
                'ham_',
                'ham2',
            ];

            validIdentifiers.forEach(identifier => {
                assert.notOk(didErrorOccur(`integer ${identifier}
${identifier} = Get next input`));
            });

            const invalidIdentifiers = [
                '_ham',
                '2ham',
                'ham!',
            ];

            invalidIdentifiers.forEach(identifier => {
                assert.ok(didErrorOccur(`integer ${identifier}
${identifier} = Get next input`));
            });
        }

        // Test implicit Main function, no return value, empty parameter list, and integer declaration.
        {
            const code = `integer x
x = Get next input`;
            const program = parser.parse(code);
            const firstFunction = program.functions[0];

            assert.equal(program.functions.length, 1);
            assert.equal(firstFunction.name, 'Main');

            // Flowchart structure: start -> end
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const endNode = inputNode.getChildNode();

            assert.equal(startNode.getName(), 'StartNode');
            assert.equal(inputNode.getName(), 'InputNode');
            assert.equal(endNode.getName(), 'EndNode');

            // Test the local variables, parameter variables, and return variable.
            assert.equal(firstFunction.locals.name, 'Variables');
            assert.equal(firstFunction.parameters.name, 'Parameter variables');
            assert.equal(firstFunction.return.name, 'Return variable');
            assert.equal(firstFunction.locals.length, 1);
            assert.equal(firstFunction.parameters.length, 0);
            assert.equal(firstFunction.return.length, 0);
            assert.equal(firstFunction.locals.getMemoryCell('x').getValue(), 0);
            assert.equal(firstFunction.locals.getMemoryCell('x').type, 'integer');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(inputNode.line.lineNumber, 2);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(inputNode.line.startIndexOfSegment, 0);
            assert.equal(inputNode.line.endIndexOfSegment, 17);
            assert.equal(endNode.line.startIndexOfSegment, 0);
            assert.equal(endNode.line.endIndexOfSegment, 0);
        }

        // Test float declaration.
        {
            const code = `float myFloat
Put "1" to output`;
            const program = parser.parse(code);
            const localVariables = program.functions[0].locals;

            assert.equal(localVariables.length, 1);
            assert.equal(localVariables.getMemoryCell('myFloat').getValue(), 0);
            assert.equal(localVariables.getMemoryCell('myFloat').type, 'float');

            // Test each node's associated line of code.
            const startNode = program.functions[0].flowchart.startNode;
            const outputNode = startNode.getChildNode();

            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 2);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 16);
        }

        // Test integer and float array declaration.
        {
            const code = `integer array(3) x
float  array ( 7  )  y
Put "1" to output`;
            const program = parser.parse(code);
            const localVariables = program.functions[0].locals;

            assert.equal(localVariables.length, 2);
            testArrayVariable(assert, localVariables, 'x', 'integer', 3);
            testArrayVariable(assert, localVariables, 'y', 'float', 7);

            // Test each node's associated line of code.
            const startNode = program.functions[0].flowchart.startNode;
            const outputNode = startNode.getChildNode();

            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(outputNode.line.lineNumber, 3);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 16);
        }

        // Non-main function declarations with and without return variables and parameters.
        {
            const code = `Function Main() returns nothing
   Put "1" to output
Function DogAgeToHumanYears(integer dogYears) returns integer humanYears
   Put "2" to output
Function PutInArray(integer first, integer second, integer third) returns integer array(4) myInts
   Put "3" to output
Function    ReturnFloats( float array (?)   first,   integer array  (2)  second )  returns    float      array ( ?   )     someFloats
   Put "4" to output`;
            const program = parser.parse(code);

            assert.equal(program.functions.length, 4);

            [ 'Main', 'ReturnFloats', 'PutInArray', 'DogAgeToHumanYears' ].forEach((functionName, index) => {
                assert.equal(program.functions[index].name, functionName);
            });

            // Flowchart structure: start -> outputNode -> end
            program.functions.forEach(programFunction => {
                const startNode = programFunction.flowchart.startNode;
                const outputNode = startNode.getChildNode();
                const endNode = outputNode.getChildNode();

                assert.equal(startNode.getName(), 'StartNode');
                assert.equal(outputNode.getName(), 'OutputNode');
                assert.equal(endNode.getName(), 'EndNode');
            });

            // Test the name of the local variables.
            [ 'Variables', 'Local variables', 'Local variables', 'Local variables' ].forEach((name, index) => {
                assert.equal(program.functions[index].locals.name, name);
            });

            // Test the return variable.
            [ 0, 1, 1, 1 ].forEach((number, index) => {
                assert.equal(program.functions[index].return.length, number);
            });

            const fourthFunctionReturnVariable = program.functions[3].return.getMemoryCell('humanYears');

            assert.equal(fourthFunctionReturnVariable.getValue(), 0);
            assert.equal(fourthFunctionReturnVariable.type, 'integer');
            testArrayVariable(assert, program.functions[1].return, 'someFloats', 'float', '?');
            testArrayVariable(assert, program.functions[2].return, 'myInts', 'integer', 4);

            // Test the parameter variables.
            [ 0, 2, 3, 1 ].forEach((number, index) => {
                assert.equal(program.functions[index].parameters.length, number);
            });

            // Second function has a float array with 6 elements and an integer array with 2 elements.
            testArrayVariable(assert, program.functions[1].parameters, 'first', 'float', '?');
            testArrayVariable(assert, program.functions[1].parameters, 'second', 'integer', 2);

            const expectedLineNumbers = [ 2, 8, 6, 4 ];

            program.functions.forEach((programFunction, index) => {
                const startNode = programFunction.flowchart.startNode;

                // Test each node's associated line of code.
                assert.equal(startNode.line.lineNumber, expectedLineNumbers[index]);

                // Add tests for the start and end indices.
                assert.equal(startNode.line.startIndexOfSegment, 0);
                assert.equal(startNode.line.endIndexOfSegment, 0);
            });

            // Third function has 3 integer parameters.
            [ 'first', 'second', 'third' ].forEach(variableName => {
                const variable = program.functions[2].parameters.getMemoryCell(variableName);

                assert.equal(variable.getValue(), 0);
                assert.equal(variable.type, 'integer');
            });

            // Fourth function has one integer parameter.
            const fourthFunctionParameterVariable = program.functions[3].parameters.getMemoryCell('dogYears');

            assert.equal(fourthFunctionParameterVariable.getValue(), 0);
            assert.equal(fourthFunctionParameterVariable.type, 'integer');
        }

        // Test variable assignment from input, variable output, and string output.
        {
            const code = `Function Main() returns nothing
   integer x
   x = Get next input
   Put x to output
   Put "Test\\n\\"this\\"" to output`;
            const program = parser.parse(code);

            // Test flowchart structure: Start -> Input -> Output -> Output -> End
            const expectedNodeOrder = [ 'StartNode', 'InputNode', 'OutputNode', 'OutputNode', 'EndNode' ];
            const nodesList = testFlowchartStructureAndReturnAsFlattenedArray(
                assert, program.functions[0].flowchart.startNode, expectedNodeOrder
            );

            // Test node contents.
            assert.equal(nodesList[1].userExpression, 'x');
            assert.equal(nodesList[2].userExpression, 'x');
            assert.equal(nodesList[3].userExpression, '"Test\\n\\"this\\""');

            // Test each node's associated line of code.
            assert.equal(nodesList[0].line.lineNumber, 3);
            assert.equal(nodesList[1].line.lineNumber, 3);
            assert.equal(nodesList[2].line.lineNumber, 4);
            assert.equal(nodesList[3].line.lineNumber, 5);

            // Add tests for the start and end indices.
            assert.equal(nodesList[0].line.startIndexOfSegment, 0);
            assert.equal(nodesList[0].line.endIndexOfSegment, 0);
            assert.equal(nodesList[1].line.startIndexOfSegment, 0);
            assert.equal(nodesList[1].line.endIndexOfSegment, 20);
            assert.equal(nodesList[2].line.startIndexOfSegment, 0);
            assert.equal(nodesList[2].line.endIndexOfSegment, 17);
            assert.equal(nodesList[3].line.startIndexOfSegment, 0);
            assert.equal(nodesList[3].line.endIndexOfSegment, 32);
        }

        {
            const code = `integer a
integer b
float c
float d
a   =    4
b = -100
c = 5.574
d = -1002.41`;
            const program = parser.parse(code);

            // Test flowchart structure: Start -> Assignment -> Assignment -> Assignment -> Assignment -> End
            const expectedNodeOrder = [ 'StartNode', 'AssignmentNode', 'AssignmentNode', 'AssignmentNode', 'AssignmentNode', 'EndNode' ];
            const nodesList = testFlowchartStructureAndReturnAsFlattenedArray(
                assert, program.functions[0].flowchart.startNode, expectedNodeOrder
            );

            // Test node contents.
            assert.equal(nodesList[1].userAssignedExpression, 'a');
            assert.equal(nodesList[1].userExpression, '4');
            assert.equal(nodesList[2].userAssignedExpression, 'b');
            assert.equal(nodesList[2].userExpression, '-100');
            assert.equal(nodesList[3].userAssignedExpression, 'c');
            assert.equal(nodesList[3].userExpression, '5.574');
            assert.equal(nodesList[4].userAssignedExpression, 'd');
            assert.equal(nodesList[4].userExpression, '-1002.41');

            // Test each node's associated line of code.
            assert.equal(nodesList[0].line.lineNumber, 5);
            assert.equal(nodesList[1].line.lineNumber, 5);
            assert.equal(nodesList[2].line.lineNumber, 6);
            assert.equal(nodesList[3].line.lineNumber, 7);
            assert.equal(nodesList[4].line.lineNumber, 8);
        }

        {
            const code = `integer x
integer y
x = x + y
x = 4 * 3
x = y / 4
x = y--5.2
x = (y / 2) + x`;
            const program = parser.parse(code);

            // Test flowchart structure: Start -> Assignment -> Assignment -> Assignment -> Assignment -> End
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'AssignmentNode', 'AssignmentNode', 'AssignmentNode', 'AssignmentNode', 'EndNode',
            ];
            const nodesList = testFlowchartStructureAndReturnAsFlattenedArray(
                assert, program.functions[0].flowchart.startNode, expectedNodeOrder
            );

            // Test node contents.
            assert.equal(nodesList[1].userAssignedExpression, 'x');
            assert.equal(nodesList[1].userExpression, 'x + y');
            assert.equal(nodesList[2].userAssignedExpression, 'x');
            assert.equal(nodesList[2].userExpression, '4 * 3');
            assert.equal(nodesList[3].userAssignedExpression, 'x');
            assert.equal(nodesList[3].userExpression, 'y / 4');
            assert.equal(nodesList[4].userAssignedExpression, 'x');
            assert.equal(nodesList[4].userExpression, 'y--5.2');
            assert.equal(nodesList[5].userAssignedExpression, 'x');
            assert.equal(nodesList[5].userExpression, '(y / 2) + x');

            // Test each node's associated line of code.
            assert.equal(nodesList[0].line.lineNumber, 3);
            assert.equal(nodesList[1].line.lineNumber, 3);
            assert.equal(nodesList[2].line.lineNumber, 4);
            assert.equal(nodesList[3].line.lineNumber, 5);
            assert.equal(nodesList[4].line.lineNumber, 6);
            assert.equal(nodesList[5].line.lineNumber, 7);
        }

        // Test output expressions.
        {
            const code = `integer x
Put 4 to output
Put (5-4) to output
Put (x) to output`;

            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const outputNode1 = startNode.getChildNode();
            const outputNode2 = outputNode1.getChildNode();
            const outputNode3 = outputNode2.getChildNode();
            const endNode = outputNode3.getChildNode();

            const expectedNodeOrder = [ 'StartNode', 'OutputNode', 'OutputNode', 'OutputNode', 'EndNode' ];
            const nodeList = [ startNode, outputNode1, outputNode2, outputNode3, endNode ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(outputNode1.userExpression, '4');
            assert.equal(outputNode2.userExpression, '(5-4)');
            assert.equal(outputNode3.userExpression, '(x)');

            // Test each node's associated line of code.
            assert.equal(outputNode1.line.lineNumber, 2);
            assert.equal(outputNode2.line.lineNumber, 3);
            assert.equal(outputNode3.line.lineNumber, 4);
        }

        // Test if-else statement.
        {
            const code = `integer x
integer y
if x > 5
   y = 3
else
   Put x to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const assignmentNode = ifNode.getChildNodeForTrue();
            const outputNode = ifNode.getChildNodeForFalse();
            const endNode1 = assignmentNode.getChildNode();
            const endNode2 = outputNode.getChildNode();
            const expectedNodeOrder = [ 'StartNode', 'IfNode', 'AssignmentNode', 'OutputNode', 'EndNode', 'EndNode' ];
            const nodeList = [ startNode, ifNode, assignmentNode, outputNode, endNode1, endNode2 ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(ifNode.userExpression, 'x > 5');
            assert.equal(assignmentNode.userAssignedExpression, 'y');
            assert.equal(assignmentNode.userExpression, '3');
            assert.equal(outputNode.userExpression, 'x');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(ifNode.line.lineNumber, 3);
            assert.equal(assignmentNode.line.lineNumber, 4);
            assert.equal(outputNode.line.lineNumber, 6);
        }

        // Test if nested in if statement.
        {
            const code = `if 1==1
   if 2==2
      Put "b" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode1 = startNode.getChildNode();
            const ifNode2 = ifNode1.getChildNodeForTrue();
            const outputNode = ifNode2.getChildNodeForTrue();
            const endNode = ifNode1.getChildNodeForFalse();
            const expectedNodeOrder = [ 'StartNode', 'IfNode', 'IfNode', 'OutputNode', 'EndNode' ];
            const nodeList = [ startNode, ifNode1, ifNode2, outputNode, endNode ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test ifNode2's false branch.
            assert.equal(ifNode2.getChildNodeForFalse().getName(), 'EndNode');

            // Test node contents.
            assert.equal(ifNode1.userExpression, '1==1');
            assert.equal(ifNode2.userExpression, '2==2');
            assert.equal(outputNode.userExpression, '"b"');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 1);
            assert.equal(ifNode1.line.lineNumber, 1);
            assert.equal(ifNode2.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
        }

        // Test while statement.
        {
            const code = `integer z
while z < 5
   z = z+1`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const whileNode = startNode.getChildNode();
            const assignmentNode = whileNode.getChildNodeForTrue();
            const endNode = whileNode.getChildNodeForFalse();
            const expectedNodeOrder = [ 'StartNode', 'LoopNode', 'AssignmentNode', 'EndNode' ];
            const nodeList = [ startNode, whileNode, assignmentNode, endNode ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(whileNode.userExpression, 'z < 5');
            assert.equal(assignmentNode.userAssignedExpression, 'z');
            assert.equal(assignmentNode.userExpression, 'z+1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(whileNode.line.lineNumber, 2);
            assert.equal(assignmentNode.line.lineNumber, 3);
        }

        // Nested if-else
        {
            const code = `integer x
integer y
if x > 5
   if y > 4
      y = 4
   else
      y = 5
else
   y = 10`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode1 = startNode.getChildNode();
            const ifNode2 = ifNode1.getChildNodeForTrue();
            const assignmentNode3 = ifNode1.getChildNodeForFalse();
            const assignmentNode1 = ifNode2.getChildNodeForTrue();
            const assignmentNode2 = ifNode2.getChildNodeForFalse();
            const endNode1 = assignmentNode1.getChildNode();
            const endNode2 = assignmentNode2.getChildNode();
            const endNode3 = assignmentNode3.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'IfNode', 'AssignmentNode',
                'AssignmentNode', 'AssignmentNode', 'EndNode', 'EndNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode1, ifNode2, assignmentNode3, assignmentNode1, assignmentNode2, endNode1, endNode2, endNode3,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(ifNode1.userExpression, 'x > 5');
            assert.equal(ifNode2.userExpression, 'y > 4');
            assert.equal(assignmentNode1.userAssignedExpression, 'y');
            assert.equal(assignmentNode1.userExpression, '4');
            assert.equal(assignmentNode2.userAssignedExpression, 'y');
            assert.equal(assignmentNode2.userExpression, '5');
            assert.equal(assignmentNode3.userAssignedExpression, 'y');
            assert.equal(assignmentNode3.userExpression, '10');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(ifNode1.line.lineNumber, 3);
            assert.equal(ifNode2.line.lineNumber, 4);
            assert.equal(assignmentNode1.line.lineNumber, 5);
            assert.equal(assignmentNode2.line.lineNumber, 7);
            assert.equal(assignmentNode3.line.lineNumber, 9);

        }

        // Nested while statements.
        {
            const code = `integer x
integer y
while x > 5
   x = x - 1
   while y < 4
      y = y + 1`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const loopNode1 = startNode.getChildNode();
            const assignmentNode1 = loopNode1.getChildNodeForTrue();
            const endNode1 = loopNode1.getChildNodeForFalse();
            const loopNode2 = assignmentNode1.getChildNode();
            const assignmentNode2 = loopNode2.getChildNodeForTrue();
            const loopNode1Again = loopNode2.getChildNodeForFalse();
            const loopNode2Again = assignmentNode2.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'LoopNode', 'AssignmentNode', 'EndNode', 'LoopNode', 'AssignmentNode', 'LoopNode', 'LoopNode',
            ];
            const nodeList = [
                startNode, loopNode1, assignmentNode1, endNode1, loopNode2, assignmentNode2, loopNode1Again, loopNode2Again,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode1.userExpression, 'x > 5');
            assert.equal(assignmentNode1.userAssignedExpression, 'x');
            assert.equal(assignmentNode1.userExpression, 'x - 1');
            assert.equal(loopNode2.userExpression, 'y < 4');
            assert.equal(assignmentNode2.userAssignedExpression, 'y');
            assert.equal(assignmentNode2.userExpression, 'y + 1');
            assert.equal(loopNode1Again.userExpression, 'x > 5');
            assert.equal(loopNode2Again.userExpression, 'y < 4');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(loopNode1.line.lineNumber, 3);
            assert.equal(assignmentNode1.line.lineNumber, 4);
            assert.equal(loopNode2.line.lineNumber, 5);
            assert.equal(assignmentNode2.line.lineNumber, 6);
        }

        // Nested if-else and while
        {
            const code = `integer x
integer y
if x > 5
   while y < 4
      if y == 2
         y = y + 1
      else
         y = y + 2
else
   y = 1`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode1 = startNode.getChildNode();
            const loopNode = ifNode1.getChildNodeForTrue();
            const assignmentNode3 = ifNode1.getChildNodeForFalse();
            const ifNode2 = loopNode.getChildNodeForTrue();
            const endNode1 = loopNode.getChildNodeForFalse();
            const endNode2 = assignmentNode3.getChildNode();
            const assignmentNode1 = ifNode2.getChildNodeForTrue();
            const assignmentNode2 = ifNode2.getChildNodeForFalse();
            const loopNodeAgain1 = assignmentNode1.getChildNode();
            const loopNodeAgain2 = assignmentNode2.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'LoopNode', 'AssignmentNode', 'IfNode', 'EndNode',
                'EndNode', 'AssignmentNode', 'AssignmentNode', 'LoopNode', 'LoopNode',
            ];
            const nodeList = [
                startNode, ifNode1, loopNode, assignmentNode3, ifNode2, endNode1,
                endNode2, assignmentNode1, assignmentNode2, loopNodeAgain1, loopNodeAgain2,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(ifNode1.userExpression, 'x > 5');
            assert.equal(loopNode.userExpression, 'y < 4');
            assert.equal(loopNodeAgain1.userExpression, 'y < 4');
            assert.equal(loopNodeAgain2.userExpression, 'y < 4');
            assert.equal(ifNode2.userExpression, 'y == 2');
            assert.equal(assignmentNode1.userAssignedExpression, 'y');
            assert.equal(assignmentNode1.userExpression, 'y + 1');
            assert.equal(assignmentNode2.userAssignedExpression, 'y');
            assert.equal(assignmentNode2.userExpression, 'y + 2');
            assert.equal(assignmentNode3.userAssignedExpression, 'y');
            assert.equal(assignmentNode3.userExpression, '1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(ifNode1.line.lineNumber, 3);
            assert.equal(loopNode.line.lineNumber, 4);
            assert.equal(ifNode2.line.lineNumber, 5);
            assert.equal(assignmentNode1.line.lineNumber, 6);
            assert.equal(assignmentNode2.line.lineNumber, 8);
            assert.equal(assignmentNode3.line.lineNumber, 10);
        }

        // If-else missing else
        {
            const code = `integer x
if x < 3
   x = x + 1
if x > 5
   if x > 10
      x = 10
else
   x = 5`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode1 = startNode.getChildNode();
            const assignmentNode1 = ifNode1.getChildNodeForTrue();
            const ifNode2 = ifNode1.getChildNodeForFalse();
            const ifNode2Again = assignmentNode1.getChildNode();
            const ifNode3 = ifNode2.getChildNodeForTrue();
            const assignmentNode3 = ifNode2.getChildNodeForFalse();
            const assignmentNode2 = ifNode3.getChildNodeForTrue();
            const endNode2 = ifNode3.getChildNodeForFalse();
            const endNode3 = assignmentNode3.getChildNode();
            const endNode4 = assignmentNode2.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'AssignmentNode', 'IfNode', 'IfNode', 'IfNode',
                'AssignmentNode', 'AssignmentNode', 'EndNode', 'EndNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode1, assignmentNode1, ifNode2, ifNode2Again, ifNode3,
                assignmentNode3, assignmentNode2, endNode2, endNode3, endNode4,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(ifNode1.userExpression, 'x < 3');
            assert.equal(ifNode2.userExpression, 'x > 5');
            assert.equal(ifNode3.userExpression, 'x > 10');
            assert.equal(assignmentNode1.userAssignedExpression, 'x');
            assert.equal(assignmentNode1.userExpression, 'x + 1');
            assert.equal(assignmentNode2.userAssignedExpression, 'x');
            assert.equal(assignmentNode2.userExpression, '10');
            assert.equal(assignmentNode3.userAssignedExpression, 'x');
            assert.equal(assignmentNode3.userExpression, '5');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(ifNode1.line.lineNumber, 2);
            assert.equal(assignmentNode1.line.lineNumber, 3);
            assert.equal(ifNode2.line.lineNumber, 4);
            assert.equal(ifNode3.line.lineNumber, 5);
            assert.equal(assignmentNode2.line.lineNumber, 6);
            assert.equal(assignmentNode3.line.lineNumber, 8);
        }

        // Test comments.
        {
            const code = `integer x
// Initialize x
x = 4

// True branch comment
if x > 4
   x = 2
// False branch comment
else
   x = 5`;

            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const ifNode = assignmentNode1.getChildNode();
            const assignmentNode2 = ifNode.getChildNodeForTrue();
            const assignmentNode3 = ifNode.getChildNodeForFalse();
            const endNode1 = assignmentNode2.getChildNode();
            const endNode2 = assignmentNode3.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'IfNode', 'AssignmentNode', 'AssignmentNode', 'EndNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, ifNode, assignmentNode2, assignmentNode3, endNode1, endNode2,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(assignmentNode1.userAssignedExpression, 'x');
            assert.equal(assignmentNode1.userExpression, '4');
            assert.equal(assignmentNode1.getCommentsAsString(), '// Initialize x');
            assert.equal(ifNode.userExpression, 'x > 4');
            assert.equal(ifNode.getCommentsAsString(), `// True: True branch comment\n// False: False branch comment`);
            assert.equal(assignmentNode2.userAssignedExpression, 'x');
            assert.equal(assignmentNode2.userExpression, '2');
            assert.equal(assignmentNode3.userAssignedExpression, 'x');
            assert.equal(assignmentNode3.userExpression, '5');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(assignmentNode1.line.lineNumber, 3);
            assert.equal(ifNode.line.lineNumber, 6);
            assert.equal(assignmentNode2.line.lineNumber, 7);
            assert.equal(assignmentNode3.line.lineNumber, 10);
        }

        // Test function calls.
        {
            const code = `Function Main() returns nothing
   integer x
   x = GetValue()
   PrintValue(x)
Function GetValue() returns integer y
   Put "1" to output
Function PrintValue(integer x) returns nothing
   Put "2" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode = startNode.getChildNode();
            const functionCallNode = assignmentNode.getChildNode();
            const endNode = functionCallNode.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'FunctionCallNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode, functionCallNode, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(assignmentNode.userAssignedExpression, 'x');
            assert.equal(assignmentNode.userExpression, 'GetValue()');
            assert.equal(functionCallNode.userExpression, 'PrintValue(x)');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(assignmentNode.line.lineNumber, 3);
            assert.equal(functionCallNode.line.lineNumber, 4);
        }

        // Test for-loop with code in loop body.
        {

            /*
                Gets transpiled into:
                integer i
                i = 0
                while i < 3
                   Put i to output
                   i = i + 1
            */
            const code = `integer i
for i = 0; i < 3; i = i + 1
   Put i to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const endNode = loopNode.getChildNodeForFalse();
            const assignmentNode2 = outputNode.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'OutputNode', 'AssignmentNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode, outputNode, assignmentNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode.userExpression, 'i < 3');
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(outputNode.userExpression, 'i');
            assert.equal(assignmentNode2.userAssignedExpression, 'i');
            assert.equal(assignmentNode2.userExpression, 'i + 1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(loopNode.line.lineNumber, 2);
            assert.equal(assignmentNode1.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
            assert.equal(assignmentNode2.line.lineNumber, 2);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(loopNode.line.startIndexOfSegment, 11);
            assert.equal(loopNode.line.endIndexOfSegment, 15);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 4);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 8);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 17);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 18);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 26);
        }

        // Test for-loop without code in loop body.
        {

            /*
                Gets transpiled into:
                integer i
                i = 0
                while i < 3
                   i = i + 1
            */
            const code = `integer i
for i = 0; i < 3; i = i + 1
   Put "1" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const assignmentNode2 = outputNode.getChildNode();
            const endNode = loopNode.getChildNodeForFalse();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'OutputNode', 'AssignmentNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode, outputNode, assignmentNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode.userExpression, 'i < 3');
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(outputNode.userExpression, '"1"');
            assert.equal(assignmentNode2.userAssignedExpression, 'i');
            assert.equal(assignmentNode2.userExpression, 'i + 1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(loopNode.line.lineNumber, 2);
            assert.equal(assignmentNode1.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
            assert.equal(assignmentNode2.line.lineNumber, 2);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(loopNode.line.startIndexOfSegment, 11);
            assert.equal(loopNode.line.endIndexOfSegment, 15);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 4);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 8);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 19);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 18);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 26);
        }

        // Test for-loop without code in loop body and a following function.
        {

            /*
                Gets transpiled into:
                Function Main() returns nothing
                   integer i
                   i = 0
                   while i < 3
                      Put "1" to output
                      i = i + 1
                Function Test() returns nothing
                   Put "2" to output
            */
            const code = `Function Main() returns nothing
   integer i
   for i = 0; i < 3; i = i + 1
      Put "1" to output
Function Test() returns nothing
   Put "2" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const endNode = loopNode.getChildNodeForFalse();
            const assignmentNode2 = outputNode.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'OutputNode', 'AssignmentNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode, outputNode, assignmentNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode.userExpression, 'i < 3');
            assert.equal(outputNode.userExpression, '"1"');
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(assignmentNode2.userAssignedExpression, 'i');
            assert.equal(assignmentNode2.userExpression, 'i + 1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(loopNode.line.lineNumber, 3);
            assert.equal(outputNode.line.lineNumber, 4);
            assert.equal(assignmentNode1.line.lineNumber, 3);
            assert.equal(assignmentNode2.line.lineNumber, 3);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(loopNode.line.startIndexOfSegment, 14);
            assert.equal(loopNode.line.endIndexOfSegment, 18);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 22);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 7);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 11);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 21);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 29);
        }

        // Test for-loop with code in loop body and a following function.
        {

            /*
                Gets transpiled into:
                Function Main() returns nothing
                   integer i
                   i = 0
                   while i < 3
                      Put i to output
                      i = i + 1
                Function Test() returns nothing
                   Put "1" to output
            */
            const code = `Function Main() returns nothing
   integer i
   for i = 0; i < 3; i = i + 1
      Put i to output
Function Test() returns nothing
   Put "1" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const endNode = loopNode.getChildNodeForFalse();
            const assignmentNode2 = outputNode.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'OutputNode', 'AssignmentNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode, outputNode, assignmentNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode.userExpression, 'i < 3');
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(outputNode.userExpression, 'i');
            assert.equal(assignmentNode2.userAssignedExpression, 'i');
            assert.equal(assignmentNode2.userExpression, 'i + 1');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(loopNode.line.lineNumber, 3);
            assert.equal(assignmentNode1.line.lineNumber, 3);
            assert.equal(outputNode.line.lineNumber, 4);
            assert.equal(assignmentNode2.line.lineNumber, 3);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(loopNode.line.startIndexOfSegment, 14);
            assert.equal(loopNode.line.endIndexOfSegment, 18);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 7);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 11);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 20);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 21);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 29);
        }

        // Test code following the loop body but outside the loop body.
        {

            /*
                Gets transpiled into:
                integer i
                i = 0
                while i < 3
                   Put i to output
                   i = i + 1
                Put i to output
            */
            const code = `integer i
for i = 0; i < 3; i = i + 1
   Put i to output
Put i to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode1 = loopNode.getChildNodeForTrue();
            const outputNode2 = loopNode.getChildNodeForFalse();
            const assignmentNode2 = outputNode1.getChildNode();
            const endNode = outputNode2.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'OutputNode', 'AssignmentNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode, outputNode1, assignmentNode2, outputNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(loopNode.userExpression, 'i < 3');
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(outputNode1.userExpression, 'i');
            assert.equal(assignmentNode2.userAssignedExpression, 'i');
            assert.equal(assignmentNode2.userExpression, 'i + 1');
            assert.equal(outputNode2.userExpression, 'i');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 2);
            assert.equal(loopNode.line.lineNumber, 2);
            assert.equal(assignmentNode1.line.lineNumber, 2);
            assert.equal(outputNode1.line.lineNumber, 3);
            assert.equal(assignmentNode2.line.lineNumber, 2);
            assert.equal(outputNode2.line.lineNumber, 4);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(loopNode.line.startIndexOfSegment, 11);
            assert.equal(loopNode.line.endIndexOfSegment, 15);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 4);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 8);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 17);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 18);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 26);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 14);
        }

        // Test nested for-loop.
        {

            /*
                Gets transpiled into:
                integer i
                integer j
                i = 0
                while i < 3
                   j = 0
                   while j < 6
                      Put " " to output
                      j = j + 2
                   Put "*\\n" to output
                   i = i + 1
                Put "Done" to output
            */
            const code = `integer i
integer j
for i = 0; i < 3; i = i + 1
   for j = 0; j < 6; j = j + 2
      Put " " to output
   Put "*\\n" to output
Put "Done" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode1 = assignmentNode1.getChildNode();
            const assignmentNode2 = loopNode1.getChildNodeForTrue();
            const outputNode3 = loopNode1.getChildNodeForFalse();
            const loopNode2 = assignmentNode2.getChildNode();
            const outputNode1 = loopNode2.getChildNodeForTrue();
            const outputNode2 = loopNode2.getChildNodeForFalse();
            const assignmentNode3 = outputNode1.getChildNode();
            const assignmentNode4 = outputNode2.getChildNode();
            const endNode = outputNode3.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'AssignmentNode', 'LoopNode', 'AssignmentNode', 'LoopNode',
                'OutputNode', 'AssignmentNode', 'OutputNode', 'AssignmentNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, assignmentNode1, loopNode1, assignmentNode2, loopNode2, outputNode1,
                assignmentNode3, outputNode2, assignmentNode4, outputNode3, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(assignmentNode1.userAssignedExpression, 'i');
            assert.equal(assignmentNode1.userExpression, '0');
            assert.equal(loopNode1.userExpression, 'i < 3');
            assert.equal(assignmentNode2.userAssignedExpression, 'j');
            assert.equal(assignmentNode2.userExpression, '0');
            assert.equal(loopNode2.userExpression, 'j < 6');
            assert.equal(outputNode1.userExpression, '" "');
            assert.equal(assignmentNode3.userAssignedExpression, 'j');
            assert.equal(assignmentNode3.userExpression, 'j + 2');
            assert.equal(outputNode2.userExpression, '"*\\n"');
            assert.equal(assignmentNode4.userAssignedExpression, 'i');
            assert.equal(assignmentNode4.userExpression, 'i + 1');
            assert.equal(outputNode3.userExpression, '"Done"');

            // Test each node's associated line of code.
            assert.equal(startNode.line.lineNumber, 3);
            assert.equal(assignmentNode1.line.lineNumber, 3);
            assert.equal(loopNode1.line.lineNumber, 3);
            assert.equal(assignmentNode2.line.lineNumber, 4);
            assert.equal(loopNode2.line.lineNumber, 4);
            assert.equal(outputNode1.line.lineNumber, 5);
            assert.equal(assignmentNode3.line.lineNumber, 4);
            assert.equal(outputNode2.line.lineNumber, 6);
            assert.equal(assignmentNode4.line.lineNumber, 3);
            assert.equal(outputNode3.line.lineNumber, 7);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(assignmentNode1.line.startIndexOfSegment, 4);
            assert.equal(assignmentNode1.line.endIndexOfSegment, 8);
            assert.equal(loopNode1.line.startIndexOfSegment, 11);
            assert.equal(loopNode1.line.endIndexOfSegment, 15);
            assert.equal(assignmentNode2.line.startIndexOfSegment, 7);
            assert.equal(assignmentNode2.line.endIndexOfSegment, 11);
            assert.equal(loopNode2.line.startIndexOfSegment, 14);
            assert.equal(loopNode2.line.endIndexOfSegment, 18);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 22);
            assert.equal(assignmentNode3.line.startIndexOfSegment, 21);
            assert.equal(assignmentNode3.line.endIndexOfSegment, 29);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 21);
            assert.equal(assignmentNode4.line.startIndexOfSegment, 18);
            assert.equal(assignmentNode4.line.endIndexOfSegment, 26);
            assert.equal(outputNode3.line.startIndexOfSegment, 0);
            assert.equal(outputNode3.line.endIndexOfSegment, 19);
        }

        // Test for-loop without first part being an assignment.
        {
            const code = `integer i
for Put i to output; i < 3; i = i + 1
   Put "a" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test for-loop without third part being an assignment.
        {
            const code = `integer i
for i = 0; i < 3; Put i to output
   Put "a" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test for-loop without third part being an assignment.
        {
            const code = `integer i
for i = 0; Put i to output; i = i + 1
   Put "a" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test if and elseif statements.
        {
            const code = `if 1 > 1
   Put "a" to output
elseif 2 > 2
   Put "b" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const endNode = elseIfNode.getChildNodeForFalse();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode1, elseIfNode, outputNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test all end nodes are the same node.
            assert.equal(outputNode1.getChildNode(), endNode);
            assert.equal(elseIfNode.getChildNodeForFalse(), endNode);
            assert.equal(outputNode1.getChildNode(), elseIfNode.getChildNodeForFalse());

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(elseIfNode.userExpression, '2 > 2');
            assert.equal(outputNode1.userExpression, '"a"');
            assert.equal(outputNode2.userExpression, '"b"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(outputNode1.line.lineNumber, 2);
            assert.equal(elseIfNode.line.lineNumber, 3);
            assert.equal(outputNode2.line.lineNumber, 4);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
        }

        // Test if and elseif statements with true branch statements.
        {
            const code = `if 1 > 1
   Put "1" to output
elseif 2 > 2
   Put "2" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const endNode = outputNode1.getChildNode();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode1, elseIfNode, outputNode2, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test elseif's false branch.
            assert.equal(elseIfNode.getChildNodeForFalse().getName(), 'EndNode');

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(outputNode1.userExpression, '"1"');
            assert.equal(elseIfNode.userExpression, '2 > 2');
            assert.equal(outputNode2.userExpression, '"2"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(outputNode1.line.lineNumber, 2);
            assert.equal(elseIfNode.line.lineNumber, 3);
            assert.equal(outputNode2.line.lineNumber, 4);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
        }

        // Test if, elseif, and else.
        {
            const code = `if 1 > 1
   Put "1" to output
elseif 2 > 2
   Put "2" to output
else
   Put "3" to output
Put "4" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const outputNode4 = outputNode1.getChildNode();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const outputNode3 = elseIfNode.getChildNodeForFalse();
            const endNode = outputNode4.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'OutputNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode1, elseIfNode, outputNode2, outputNode3, outputNode4, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test child of outputs.
            assert.equal(outputNode2.getChildNode().getName(), 'OutputNode');
            assert.equal(outputNode3.getChildNode().getName(), 'OutputNode');

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(outputNode1.userExpression, '"1"');
            assert.equal(elseIfNode.userExpression, '2 > 2');
            assert.equal(outputNode2.userExpression, '"2"');
            assert.equal(outputNode3.userExpression, '"3"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(outputNode1.line.lineNumber, 2);
            assert.equal(elseIfNode.line.lineNumber, 3);
            assert.equal(outputNode2.line.lineNumber, 4);
            assert.equal(outputNode3.line.lineNumber, 6);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
            assert.equal(outputNode3.line.startIndexOfSegment, 0);
            assert.equal(outputNode3.line.endIndexOfSegment, 19);
        }

        // Test multiple-elseif statements.
        {
            const code = `if 1 > 1
   Put "1" to output
elseif 2 > 2
   Put "2" to output
elseif 3 > 3
   Put "3" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode1 = ifNode.getChildNodeForFalse();
            const endNode = outputNode1.getChildNode();
            const outputNode2 = elseIfNode1.getChildNodeForTrue();
            const elseIfNode2 = elseIfNode1.getChildNodeForFalse();
            const outputNode3 = elseIfNode2.getChildNodeForTrue();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode1, elseIfNode1, outputNode2, elseIfNode2, outputNode3, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Testing elseif branch that isn't defined above.
            assert.equal(elseIfNode2.getChildNodeForFalse().getName(), 'EndNode');

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(outputNode1.userExpression, '"1"');
            assert.equal(elseIfNode1.userExpression, '2 > 2');
            assert.equal(outputNode2.userExpression, '"2"');
            assert.equal(elseIfNode2.userExpression, '3 > 3');
            assert.equal(outputNode3.userExpression, '"3"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(outputNode1.line.lineNumber, 2);
            assert.equal(elseIfNode1.line.lineNumber, 3);
            assert.equal(outputNode2.line.lineNumber, 4);
            assert.equal(elseIfNode2.line.lineNumber, 5);
            assert.equal(outputNode3.line.lineNumber, 6);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode1.line.startIndexOfSegment, 0);
            assert.equal(outputNode1.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode1.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode1.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode2.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode2.line.endIndexOfSegment, 11);
            assert.equal(outputNode3.line.startIndexOfSegment, 0);
            assert.equal(outputNode3.line.endIndexOfSegment, 19);
        }

        // Test code after elseif statement.
        {
            const code = `if 1 > 1
   Put "1" to output
elseif 2 > 2
   Put "2" to output
Put "3" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode = ifNode.getChildNodeForTrue();
            const outputNode3 = outputNode.getChildNode();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const endNode = outputNode3.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode, elseIfNode, outputNode2, outputNode3, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Testing elseif's false branch.
            assert.equal(elseIfNode.getChildNodeForFalse(), outputNode3);

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(outputNode.userExpression, '"1"');
            assert.equal(elseIfNode.userExpression, '2 > 2');
            assert.equal(outputNode2.userExpression, '"2"');
            assert.equal(outputNode3.userExpression, '"3"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(outputNode.line.lineNumber, 2);
            assert.equal(elseIfNode.line.lineNumber, 3);
            assert.equal(outputNode2.line.lineNumber, 4);
            assert.equal(outputNode3.line.lineNumber, 5);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
            assert.equal(outputNode3.line.startIndexOfSegment, 0);
            assert.equal(outputNode3.line.endIndexOfSegment, 16);
        }

        // Test comments of if, elseif, and else.
        {
            const code = `// Comment 1
if 1 > 1
   Put "1" to output
// Comment 2
elseif 2 > 2
   Put "2" to output
// Comment 3
else
   Put "3" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const outputNode = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const endNode = outputNode.getChildNode();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const outputNode3 = elseIfNode.getChildNodeForFalse();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'OutputNode', 'ElseIfNode', 'OutputNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, outputNode, elseIfNode, outputNode2, outputNode3, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test node contents.
            assert.equal(ifNode.userExpression, '1 > 1');
            assert.equal(elseIfNode.userExpression, '2 > 2');
            assert.equal(outputNode.userExpression, '"1"');
            assert.equal(outputNode2.userExpression, '"2"');
            assert.equal(outputNode3.userExpression, '"3"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
            assert.equal(elseIfNode.line.lineNumber, 5);
            assert.equal(outputNode2.line.lineNumber, 6);
            assert.equal(outputNode3.line.lineNumber, 9);

            // Add tests for the start and end indices.
            assert.equal(startNode.line.startIndexOfSegment, 0);
            assert.equal(startNode.line.endIndexOfSegment, 0);
            assert.equal(ifNode.line.startIndexOfSegment, 0);
            assert.equal(ifNode.line.endIndexOfSegment, 7);
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 19);
            assert.equal(elseIfNode.line.startIndexOfSegment, 0);
            assert.equal(elseIfNode.line.endIndexOfSegment, 11);
            assert.equal(outputNode2.line.startIndexOfSegment, 0);
            assert.equal(outputNode2.line.endIndexOfSegment, 19);
            assert.equal(outputNode3.line.startIndexOfSegment, 0);
            assert.equal(outputNode3.line.endIndexOfSegment, 19);

            // Test comments
            assert.equal(ifNode.getCommentsAsString(), '// Comment 1');
            assert.equal(elseIfNode.getCommentsAsString(), `// True: Comment 2\n// False: Comment 3`);
        }

        // Test error: elseif without if
        {
            const code = `elseif 1 > 1
   Put "1" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: else without if or elseif
        {
            const code = `else
   Put "1" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: else with content after it
        {
            const code = `if 1 > 1
   Put "1" to output
else 1 == 1
    Put "2" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: else after if-else.
        {
            const code = `if 1==1
   Put "1" to output
else
   if 2==2
else
   Put "1" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: Incomplete input statements
        {
            const code1 = `integer x
x = Get`;

            assert.ok(didErrorOccur(code1));

            const code2 = `integer x
x = Get next`;

            assert.ok(didErrorOccur(code2));
        }

        // Test error: {if, elseif, else, loop, for, and Function} must have sub-statement
        {
            const needsSubstatements = [
                'if 1==1',
                `if 1==1
   Put "1" to output
elseif 2==2`,
                `if 1==1
   Put "1" to output
else`,
                'while 1>1',
                `integer i
for i = 0; i < 3; i = i + 1`,
                'Function Main() returns nothing',
                `Function Test() returns nothing
Function Main() returns nothing
   Put "1" to output`,
            ];

            needsSubstatements.forEach(needsSubstatement => assert.ok(didErrorOccur(needsSubstatement)));
        }

        // Test error: Main cannot be called in code.
        {
            const code = `Function Main() returns nothing
   Main()`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: Main must be declared without parameter variables.
        {
            const code = `Function Main(integer x) returns nothing
   Put "test" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error: Main must be declared without a return variable.
        {
            const code = `Function Main() returns integer x
   Put "test" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test error message of nested functions when passing nothing but expected integer.
        {
            const code = `Function test(integer a) returns nothing
   a = a * 2

Function Main() returns nothing
   test(test(1))`;
            let errorMessage = '';

            try {
                parser.parse(code);
            }
            catch (error) {
                errorMessage = error.message;
            }

            assert.equal(
                errorMessage,
                'Line 5: Function call returns nothing. Cannot pass nothing to next function call'
            );
        }

        // Test error message of performing an operation on result of function call that returns nothing.
        {
            const code = `Function test() returns nothing
   Put "Test" to output

Function Main() returns nothing
   integer x
   x = test() * 2`;
            let errorMessage = '';

            try {
                parser.parse(code);
            }
            catch (error) {
                errorMessage = error.message;
            }

            assert.equal(
                errorMessage,
                'Line 6: Function call returns nothing. Cannot perform operation on nothing'
            );
        }

        // Testing flowchart from unusual code.
        {
            const code = `if 1<1
   if 2<2
      Put "a" to output
   elseif 3<3
      Put "b" to output
   Put "c" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const ifNode2 = ifNode.getChildNodeForTrue();
            const endNode = ifNode.getChildNodeForFalse();
            const outputNode = ifNode2.getChildNodeForTrue();
            const elseIfNode = ifNode2.getChildNodeForFalse();
            const outputNode3 = outputNode.getChildNode();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'IfNode', 'ElseIfNode', 'OutputNode', 'OutputNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, ifNode2, elseIfNode, outputNode, outputNode2, outputNode3, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test connections not covered above.
            assert.equal(outputNode.getChildNode(), outputNode3);
            assert.equal(outputNode2.getChildNode(), outputNode3);
            assert.equal(outputNode3.getChildNode(), endNode);

            // Test node contents.
            assert.equal(ifNode.userExpression, '1<1');
            assert.equal(ifNode2.userExpression, '2<2');
            assert.equal(elseIfNode.userExpression, '3<3');
            assert.equal(outputNode.userExpression, '"a"');
            assert.equal(outputNode2.userExpression, '"b"');
            assert.equal(outputNode3.userExpression, '"c"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(ifNode2.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
            assert.equal(elseIfNode.line.lineNumber, 4);
            assert.equal(outputNode2.line.lineNumber, 5);
            assert.equal(outputNode3.line.lineNumber, 6);
        }

        // Testing flowchart from unusual code #2.
        {
            const code = `if 1<1
   if 2<2
      Put "a" to output
   elseif 3<3
      Put "b" to output
   Put "c" to output
   Put "d" to output`;
            const program = parser.parse(code);
            const startNode = program.functions[0].flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const ifNode2 = ifNode.getChildNodeForTrue();
            const endNode = ifNode.getChildNodeForFalse();
            const outputNode = ifNode2.getChildNodeForTrue();
            const elseIfNode = ifNode2.getChildNodeForFalse();
            const outputNode3 = outputNode.getChildNode();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const outputNode4 = outputNode3.getChildNode();
            const expectedNodeOrder = [
                'StartNode', 'IfNode', 'IfNode', 'ElseIfNode', 'OutputNode', 'OutputNode', 'OutputNode', 'OutputNode', 'EndNode',
            ];
            const nodeList = [
                startNode, ifNode, ifNode2, elseIfNode, outputNode, outputNode2, outputNode3, outputNode4, endNode,
            ];

            testNodeOrdering(assert, expectedNodeOrder, nodeList);

            // Test connections not covered above.
            assert.equal(outputNode.getChildNode(), outputNode3);
            assert.equal(outputNode2.getChildNode(), outputNode3);
            assert.equal(outputNode4.getChildNode(), endNode);

            // Test node contents.
            assert.equal(ifNode.userExpression, '1<1');
            assert.equal(ifNode2.userExpression, '2<2');
            assert.equal(elseIfNode.userExpression, '3<3');
            assert.equal(outputNode.userExpression, '"a"');
            assert.equal(outputNode2.userExpression, '"b"');
            assert.equal(outputNode3.userExpression, '"c"');
            assert.equal(outputNode4.userExpression, '"d"');

            // Test each node's associated line of code.
            assert.equal(ifNode.line.lineNumber, 1);
            assert.equal(ifNode2.line.lineNumber, 2);
            assert.equal(outputNode.line.lineNumber, 3);
            assert.equal(elseIfNode.line.lineNumber, 4);
            assert.equal(outputNode2.line.lineNumber, 5);
            assert.equal(outputNode3.line.lineNumber, 6);
            assert.equal(outputNode4.line.lineNumber, 7);
        }

        // Test variable name cannot be reserved word.
        {
            const code = 'integer for';

            assert.ok(didErrorOccur(code));
        }

        // Test function name cannot be reserved word.
        {
            const code = `Function for() returns nothing
   Put "1" to output
Function Main() returns nothing
   for()`;

            assert.ok(didErrorOccur(code));
        }

        // Test duplicate variables names.
        {
            const code = `integer x
integer x`;

            assert.ok(didErrorOccur(code));
        }

        // Test variable name cannot be an implicit function name.
        {
            const code = 'integer Main';

            assert.ok(didErrorOccur(code));
        }

        // Test variable name cannot be a defined function name.
        {
            const code = `Function Print() returns nothing
   integer Print
   Put Print to output
Function Main() returns nothing
   Print()`;

            assert.ok(didErrorOccur(code));
        }

        // Test variable name cannot be a defined function name when order is reversed.
        {
            const code = `Function Main() returns nothing
   Print()
Function Print() returns nothing
   integer Print
   Put Print to output
`;

            assert.ok(didErrorOccur(code));
        }

        // Test variable name cannot be a built-in function.
        {
            const code = 'integer SquareRoot';

            assert.ok(didErrorOccur(code));
        }

        // Test parameter variable that is also a function name.
        {
            const code = `Function Main() returns nothing
   Put "t" to output
Function a(integer b) returns nothing
   Put "t" to output
Function b() returns nothing
   Put "t" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test return variable that is also a function name.
        {
            const code = `Function Main() returns nothing
   Put "t" to output
Function a() returns integer b
   Put "t" to output
Function b() returns nothing
   Put "t" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test local and parameter variable with same name.
        {
            const code = `Function Main() returns nothing
   Put "t" to output
Function a(integer b) returns nothing
   integer b
   Put "t" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test local and return variable with same name.
        {
            const code = `Function Main() returns nothing
   Put "t" to output
Function a() returns integer b
   integer b
   Put "t" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test parameter and return variable with same name.
        {
            const code = `Function Main() returns nothing
   Put "t" to output
Function a(integer b) returns integer b
   Put "t" to output`;

            assert.ok(didErrorOccur(code));
        }

        // Test that assigning a conditional expression crashes.
        {
            const code = `integer fakebool
fakebool = 5 > 3`;

            assert.ok(didErrorOccur(code));
        }

        // Test precision output.
        {
            const code = `float x
x = 1.0 / 3.0
Put x to output with 5 decimal places`;
            const program = parser.parse(code);
            const firstFunction = program.functions[0];

            assert.equal(program.functions.length, 1);
            assert.equal(firstFunction.name, 'Main');

            // Flowchart structure: start -> end
            const startNode = firstFunction.flowchart.startNode;
            const assignmentNode = startNode.getChildNode();
            const outputNode = assignmentNode.getChildNode();

            assert.equal(outputNode.getName(), 'OutputNode');

            // Test each node's associated line of code.
            assert.equal(outputNode.line.lineNumber, 3);

            // Add tests for the start and end indices.
            assert.equal(outputNode.line.startIndexOfSegment, 0);
            assert.equal(outputNode.line.endIndexOfSegment, 36);
        }

        // Test error thrown when output is a string.
        {
            const code = 'Put "test" to output with 5 decimal places';

            assert.ok(didErrorOccur(code));
        }

        // Test error thrown when output is an integer array.
        {
            const code = `integer array(5) x
Put x to output with 5 decimal places`;

            assert.ok(didErrorOccur(code));
        }

        // Test error thrown when number of decimal places is a float.
        {
            const code = 'Put 0.0400 to output with 5.0 decimal places';

            assert.ok(didErrorOccur(code));
        }

        // Test error thrown when number of decimal places is a string.
        {
            const code = 'Put 0.0400 to output with "ham" decimal places';

            assert.ok(didErrorOccur(code));
        }

        {
            const code = `integer withto
withto = 5
Put withto to output with withto decimal places`;

            const program = parser.parse(code);
            const firstFunction = program.functions[0];

            assert.equal(program.functions.length, 1);
            assert.equal(firstFunction.name, 'Main');

            // Flowchart structure: start -> end
            const startNode = firstFunction.flowchart.startNode;
            const assignmentNode = startNode.getChildNode();
            const outputNode = assignmentNode.getChildNode();

            assert.equal(outputNode.getName(), 'OutputNode');

            // Test user code is copied correctly.
            assert.equal(outputNode.userExpression, 'withto');
            assert.equal(outputNode.precisionExpression, 'withto');
        }

        // Verify indentation error message is as expected.
        {
            const code = `if 1 > 2
    Put "a" to output`;
            const lineNumber = 2;
            const expectedError = 'Indentation has 4 spaces, but Coral uses 3-space indents';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test error message with undefined variable in second part of for loop
        {
            const code = `integer i
for i = 0; i < x; i = i + 1
   Put "a" to output`;
            const lineNumber = 2;
            const expectedError = 'In loop expression, unknown word \'x\'';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test error message with incompatible types in second part of for loop
        {
            const code = `integer i
for i = 0; 5 and i; i = i + 1
   Put "a" to output`;
            const lineNumber = 2;
            const expectedError = 'In loop expression, and must be connected to a conditional operator';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test reserved words generate correct error messages.
        {
            const codeLineReservedWords = [
                { code: 'Get next input\nPut a to output', lineNumber: 1, errorWord: 'Get' },
                { code: 'integer a\na = next input', lineNumber: 2, errorWord: 'next' },
                { code: 'integer a\na = input', lineNumber: 2, errorWord: 'input' },
                { code: 'Put Put to output', lineNumber: 1, errorWord: 'Put' },
                { code: 'integer a\ninteger b\na to b', lineNumber: 3, errorWord: 'to' },
                { code: 'integer a\na = output', lineNumber: 2, errorWord: 'output' },
                { code: 'integer a\nwith a = Get next input', lineNumber: 2, errorWord: 'with' },
                { code: 'float a\na = 1.111 decimal', lineNumber: 2, errorWord: 'decimal' },
                { code: 'float a\na = 1.111\nPut a to output with 1 places', lineNumber: 3, errorWord: 'places' },
                { code: 'integer a\na = returns 3', lineNumber: 2, errorWord: 'returns' },
                { code: 'Put Function to output', lineNumber: 1, errorWord: 'Function' },
                { code: 'integer a\na = 3 while True', lineNumber: 2, errorWord: 'while' },
                { code: 'integer a\na = 3 if 1 < 2', lineNumber: 2, errorWord: 'if' },
                { code: 'else\nPut "b" to output', lineNumber: 1, errorWord: 'else' },
                { code: 'integer x\nx for', lineNumber: 2, errorWord: 'for' },
                { code: 'integer a\na = 3 elseif 1 < 2', lineNumber: 2, errorWord: 'elseif' },
                { code: 'integer a\na float', lineNumber: 2, errorWord: 'float' },
                { code: 'float a\na integer', lineNumber: 2, errorWord: 'integer' },
                { code: 'array(2) float a', lineNumber: 1, errorWord: 'array' },
            ];

            codeLineReservedWords.forEach(item => testCodeLineReservedWord(assert, item));
        }

        // Test mis-use of assignment (=) and equivalence (==) operators generate correct error messages.
        {
            const code = `integer x
x == Get next input`;
            const lineNumber = 2;
            const expectedError = 'Get is used to construct an input statement. Get must assign to a variable. Ex: variable = Get next input'; // eslint-disable-line max-len

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        {
            const code = `integer x
if (x = 1)
   Put "a" to output`;
            const lineNumber = 2;
            const expectedError = `Unexpected token = in expression
Did you mean == instead?`;

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test suggestion 'Did you mean = instead?' not output when line begins with non-word.
        {
            const code = `integer x
x = 3
3 == x`;
            const lineNumber = 3;
            const expectedError = `Expected word, found integerNumber
Conditional operator == used outside of branch statement`;

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test error precedence given to parsing the line over finding loose conditional operator.
        {
            const code = `integer x
x = 1 == 3`;
            const lineNumber = 2;
            const expectedError = 'Right-hand side of assignment does not evaluate to integer or float';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test suggestion 'Did you mean = ?' not output when token to left of == not assignable.
        {
            const code = 'RandomNumber(3,4) == 4';
            const lineNumber = 1;
            const expectedError = 'Conditional operator == used outside of branch statement';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test empty expressions return correct error.
        {
            const code = `if
   Put "a" to output
elseif 1 == 1
   Put "b" to output`;
            const lineNumber = 1;
            const expectedError = 'Expected expression after if';

            testCodeLine(assert, code, lineNumber, expectedError);
        }

        // Test empty expressions return correct error, and handle indents correctly.
        {
            const code = `Function Main() returns nothing
   if 1 == 2
      Put "a" to output
   elseif
      Put "b" to output`;
            const lineNumber = 4;
            const expectedError = 'Expected expression after elseif';

            testCodeLine(assert, code, lineNumber, expectedError);
        }
    });

}
