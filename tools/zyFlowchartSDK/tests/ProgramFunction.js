'use strict';

/* eslint-disable no-magic-numbers */

/* exported runProgramFunctionTests */
/* global QUnit, TextualCodeParser, testNodeOrdering, testArrayVariable */

/**
    Run the flowchart tests.
    @method runProgramFunctionTests
    @return {void}
*/
function runProgramFunctionTests() {
    QUnit.test('ProgramFunction cloning', assert => {

        // Test a flowchart with every node type.
        const parser = new TextualCodeParser();
        const code = `Function Main() returns nothing
   integer x
   float array(4) y
   while x > 3
      if x > 2
         x = 5
      else
         Put x to output
      x = Get next input
   FunctionCallTest()
Function FunctionCallTest() returns nothing
   Put "1" to output`;
        const program = parser.parse(code);
        const clonedFunction = program.functions[0].clone();

        // Test the variables.
        assert.equal(clonedFunction.locals.name, 'Variables');
        assert.equal(clonedFunction.parameters.name, 'Parameter variables');
        assert.equal(clonedFunction.return.name, 'Return variable');
        assert.equal(clonedFunction.locals.length, 2);
        assert.equal(clonedFunction.parameters.length, 0);
        assert.equal(clonedFunction.return.length, 0);
        assert.equal(clonedFunction.locals.getMemoryCell('x').getValue(), 0);
        assert.equal(clonedFunction.locals.getMemoryCell('x').type, 'integer');
        testArrayVariable(assert, clonedFunction.locals, 'y', 'float', 4);

        // Test the flowchart.
        const startNode = clonedFunction.flowchart.startNode;
        const loopNode = startNode.getChildNode();
        const ifNode = loopNode.getChildNodeForTrue();
        const functionCallNode = loopNode.getChildNodeForFalse();
        const assignmentNode = ifNode.getChildNodeForTrue();
        const outputNode = ifNode.getChildNodeForFalse();
        const inputNode = outputNode.getChildNode();
        const expectedNodeOrder = [
            'StartNode', 'LoopNode', 'IfNode', 'FunctionCallNode', 'AssignmentNode', 'OutputNode', 'InputNode',
        ];
        const nodeList = [ startNode, loopNode, ifNode, functionCallNode, assignmentNode, outputNode, inputNode ];

        testNodeOrdering(assert, expectedNodeOrder, nodeList);
    });
}
