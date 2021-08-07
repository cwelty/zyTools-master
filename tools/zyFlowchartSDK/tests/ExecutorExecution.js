'use strict';

/* eslint-disable no-magic-numbers */

/* exported runExecutorTests */
/* global QUnit, Executor */

/**
    Test that there is an error on the next execution.
    @method testForErrorOnNextExecute
    @param {Object} assert Dictionary of assert functions.
    @param {Executor} executor The instance from which to execute.
    @return {void}
*/
function testForErrorOnNextExecute(assert, executor) {
    let hadError = false;

    try {
        executor.execute();
    }
    catch (error) {
        hadError = true;
    }

    assert.ok(hadError);
}


/**
    Run the given executor until program completes.
    @method runExecutorToCompletion
    @param {Executor} executor The executor instance to run.
    @return {void}
*/
function runExecutorToCompletion(executor) {
    executor.enterExecution();

    // Execute program.
    while (!executor.isExecutionDone()) {
        executor.execute();
    }
}

/**
    Run the expression parser tests.
    @method runExpressionParserTests
    @return {void}
*/
function runExecutorTests() {
    QUnit.test('Executor execution', assert => {

        // Test enter execution.
        {
            const code = `Function Main() returns nothing
   Put "1" to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            const realMain = executor.program.functions[0];
            const stackOnMain = executor.stack[0].function;

            // Other than the function name, the function on stack have different properties.
            assert.notEqual(realMain, stackOnMain);
            assert.equal(realMain.name, stackOnMain.name);
            assert.notEqual(realMain.flowchart, stackOnMain.flowchart);
            assert.notEqual(realMain.flowchart.startNode, stackOnMain.flowchart.startNode);
            assert.notEqual(realMain.flowchart.startNode.children[0], stackOnMain.flowchart.startNode.children[0]);

            // Variables should be different, but have the same number of variables.
            assert.notEqual(realMain.locals, stackOnMain.locals);
            assert.equal(realMain.locals.length, stackOnMain.locals.length);
            assert.notEqual(realMain.parameters, stackOnMain.parameters);
            assert.equal(realMain.parameters.length, stackOnMain.parameters.length);
            assert.notEqual(realMain.return, stackOnMain.return);
            assert.equal(realMain.return.length, stackOnMain.return.length);
        }

        // Test arithmetic operations.
        {
            const code = `integer v
integer w
integer x
integer y
integer z
x = 5
y = x + 6
z = (((x - 4) * y) % 4) / 3
v = ++10
w = ---10`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 0);

            // Execute "x = 5"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 5);

            // Execute "y = x + 6"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('y').getValue(), 11);

            // Execute "z = (((x - 4) * y) % 4) / 3"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('z').getValue(), 1);

            // Execute "v = ++10"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('v').getValue(), 10);

            // Execute "w = ---10"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('w').getValue(), -10);
        }

        // Test arithmetic operation order.
        {
            const code = 'Put 1 - 2 + 3 to output';
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute Put statement.
            executor.execute();
            assert.equal(executor.output.output, '2');
        }

        // Test conditional operators.
        {
            const code = `integer x
integer y
integer z
x = 5
if x > 6
   x = 1
else
   x = 2
y = 10
z = 15
while not(y >= 10) and (z <= 3) or (x < 1) or (x == 4) or (x != 4)
   x = 1
x = 2`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node and "x = 5"
            executor.execute();
            executor.execute();

            // Execute "if x > 6". Expect next node to be "x = 2".
            executor.execute();
            assert.equal(executor.stack[0].node.userExpression, '2');

            // Execute "x = 2", "y = 10", and "z = 15".
            executor.execute();
            executor.execute();
            executor.execute();

            // Execute "while not(y >= 10) and (z <= 3) or (x < 1) or (x == 4) or (x != 4)". Expect next node to be "x = 1".
            executor.execute();
            assert.equal(executor.stack[0].node.userExpression, '1');
        }

        // Test built-in function call.
        {
            const code = `integer x
x = RaiseToPower(2, 4)
x = SquareRoot(9.0)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = RaiseToPower(2, 4)".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 16);

            // Execute "x = SquareRoot(9.0)".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 3);
        }

        // Test input and output.
        {
            const code = `integer x
x = Get next input
Put x to output
Put "\\n" to output
x = Get next input
Put x to output`;
            const executor = new Executor(code, '5 10', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = Get next input".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 5);

            // Execute "Put x to output".
            executor.execute();
            assert.equal(executor.output.output, '5');

            // Execute "Put "\\n" to output".
            executor.execute();
            assert.equal(executor.output.output, '5\n');

            // Execute "x = Get next input" again.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 10);

            // Execute "Put x to output".
            executor.execute();
            assert.equal(executor.output.output, '5\n10');
        }

        // Test calling user-defined function w/o and w/ parameter/return.
        {
            const code = `Function Main() returns nothing
   integer x
   x = GetInput()
   Print(x)
Function GetInput() returns integer num
   num = 5
Function Print(integer x) returns nothing
   Put x to output
`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Jump to GetInput's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'GetInput');

            // Execute start node then "num = 5".
            executor.execute();
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('num').getValue(), 5);

            // Execute end node of GetInput.
            executor.execute();

            // Set x with 5.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 5);

            // Jump to Print's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'Print');

            // Execute start node of Print, then output.
            executor.execute();
            executor.execute();
            assert.equal(executor.output.output, '5');

            // Execute end node of Print.
            executor.execute();

            // Execute "Print(x)" then end node of Main.
            executor.execute();
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Test local array with size ?.
        {
            const code = `integer array(?) array1
integer array(5) array2
integer i
for i = 0; i < array2.size; i = i + 1
   array2[i] = i
array1 = array2
Put array1.size to output
for i = 0; i < array1.size; i = i + 1
   Put array1[i] to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '501234');
        }

        // Test returning user-defined array from function.
        {
            const code = `Function ReadIntegerArray() returns integer array(?) items
   integer i
   items.size = Get next input
   for i = 0; i < items.size; i = i + 1
      items[i] = Get next input
Function Main() returns nothing
   integer array(?) a
   integer i
   a = ReadIntegerArray()
   for i = 0; i < a.size; i = i + 1
      Put a[i] to output`;
            const executor = new Executor(code, '5 5 4 3 2 1', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '54321');
        }

        // Test swap done on parameter then assigned to return array.
        {
            const code = `Function swap(integer array(?) a, integer idx1, integer idx2) returns integer array(?) b
   integer t
   t = a[idx1]
   a[idx1] = a[idx2]
   a[idx2] = t
   b = a

Function Main() returns nothing
   integer array(2) a
   a[0] = 0
   a[1] = 1
   a = swap(a, 0, 1)
   Put a[0] to output
   Put a[1] to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '10');
        }

        // Test swap done on return array.
        {
            const code = `Function swap(integer array(?) a, integer idx1, integer idx2) returns integer array(?) b
   integer t
   b = a
   t = b[idx1]
   b[idx1] = b[idx2]
   b[idx2] = t

Function Main() returns nothing
   integer array(2) a
   a[0] = 0
   a[1] = 1
   a = swap(a, 0, 1)
   Put a[0] to output
   Put a[1] to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '10');
        }

        // Test call with array parameter and return.
        {
            const code = `Function Main() returns nothing
   integer array(5) x
   x[0] = 1
   x[1] = 2
   x[2] = 3
   x[3] = 4
   x[4] = 5
   PassArray(x)
Function PassArray(integer array(5) nums) returns nothing
   Put nums[0] to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute the 5 assignments.
            const numberOfAssignments = 5;

            require('utilities').createArrayOfSizeN(numberOfAssignments).forEach((value, index) => {
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell(`x[${index}]`).getValue(), index + 1);
            });

            // Jump to PassArray's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'PassArray');

            // Execute start node of PassArray, then output.
            executor.execute();
            executor.execute();
            assert.equal(executor.output.output, '1');

            // Execute PassArray's end node, "PassArray(x)", then Main's end node.
            executor.execute();
            executor.execute();
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Test call with '?' array parameter and return.
        {
            const code = `Function Main() returns nothing
   integer array(5) x
   integer array(4) y
   x[0] = 1
   x[1] = 2
   x[2] = 3
   x[3] = 4
   x[4] = 5
   y = RemoveLastElement(x)
Function RemoveLastElement(integer array(?) nums) returns integer array(?) numsMinusOne
   numsMinusOne.size = nums.size - 1
   numsMinusOne[0] = nums[0]
   numsMinusOne[1] = nums[1]
   numsMinusOne[2] = nums[2]
   numsMinusOne[3] = nums[3]`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute the 5 assignments.
            const numberOfAssignments = 5;

            require('utilities').createArrayOfSizeN(numberOfAssignments).forEach((value, index) => {
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell(`x[${index}]`).getValue(), index + 1);
            });

            // Jump to RemoveLastElement's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'RemoveLastElement');

            // Execute start node of PassArray, then "numsMinusOne.size = nums.size - 1".
            executor.execute();
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('numsMinusOne.size').getValue(), 4);

            // Execute the assignments in numsMinusOne.
            require('utilities').createArrayOfSizeN(numberOfAssignments - 1).forEach((value, index) => {
                executor.execute();
                assert.equal(executor.stack[1].function.return.getMemoryCell(`numsMinusOne[${index}]`).getValue(), index + 1);
            });

            // Execute the end node of RemoveLastElement.
            executor.execute();
            assert.equal(executor.stack.length, 1);

            // Execute "y = RemoveLastElement(x)".
            executor.execute();
            require('utilities').createArrayOfSizeN(numberOfAssignments - 1).forEach((value, index) => {
                assert.equal(executor.stack[0].function.locals.getMemoryCell(`y[${index}]`).getValue(), index + 1);
            });

            // Execute the exit node of Main.
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Test expression inside brackets like y = x[2 + 2], and nums[index + 1] = 1.
        {
            const code = `integer array(4) x
integer array(4) y
integer counter

counter = 0

while counter < x.size
   x[counter] = Get next input
   counter = counter + 1

counter = 0

while counter < (y.size - 1)
   y[counter + 1] = x[counter] * 2
   counter = counter + 1`;
            const inputs = [ 2, 4, 6, 8 ];
            const executor = new Executor(code, inputs.map(input => String(input)).join(' '), true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "counter = 0".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('counter').getValue(), 0);

            // Execute 4 loop iterations.
            const numberOfIterations = 4;

            require('utilities').createArrayOfSizeN(numberOfIterations).forEach((value, index) => {

                // Execute decision.
                executor.execute();

                // Execute "x[counter] = Get next input"
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell(`x[${index}]`).getValue(), inputs[index]);

                // Execute "counter = counter + 1"
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell('counter').getValue(), index + 1);
            });

            // Execute decision that resolves to false.
            executor.execute();

            // Execute "counter = 0".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('counter').getValue(), 0);

            // Execute 3 loop iterations.
            require('utilities').createArrayOfSizeN(numberOfIterations - 1).forEach((value, index) => {

                // Execute decision.
                executor.execute();

                // Execute "y[counter + 1] = x[counter] * 2"
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell(`y[${index + 1}]`).getValue(), inputs[index] * 2);

                // Execute "counter = counter + 1"
                executor.execute();
                assert.equal(executor.stack[0].function.locals.getMemoryCell('counter').getValue(), index + 1);
            });

            // Execute decision that resolves to false.
            executor.execute();

            // Execute the exit node of Main.
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Test integer array element subtracted by an integer.
        {
            const code = `integer array(1) arr
Put arr[0] - 0 to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute Put statement.
            executor.execute();
            assert.equal(executor.output.output, '0');
        }

        // Test with multiple parameters of various types.
        {
            const code = `Function Main() returns nothing
   integer array(2) myInts
   float array(3) myFloats

   myInts[0] = 1
   myInts[1] = 2
   myFloats[0] = 2.5
   myFloats[1] = 3.6
   myFloats[2] = 5.5
   testCall(4, myInts, 2.5 + 3.1, myFloats)
Function testCall(integer x, integer array(2) ints, float y, float array(3) flts) returns nothing
   Put "1" to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute two myInts assignments.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('myInts[0]').getValue(), 1);
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('myInts[1]').getValue(), 2);

            // Execute three myFloats assignments.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('myFloats[0]').getValue(), 2.5);
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('myFloats[1]').getValue(), 3.6);
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('myFloats[2]').getValue(), 5.5);

            // Jump to testCall's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'testCall');
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('x').getValue(), 4);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('ints[0]').getValue(), 1);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('ints[1]').getValue(), 2);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('y').getValue(), 5.6);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('flts[0]').getValue(), 2.5);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('flts[1]').getValue(), 3.6);
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('flts[2]').getValue(), 5.5);

            // Execute testCall's StartNode.
            executor.execute();

            // Execute testCall's OutputNode.
            executor.execute();
            assert.equal(executor.output.output, '1');

            // Execute testCall's EndNode.
            executor.execute();
            assert.equal(executor.stack.length, 1);

            // Execute "testCall(4, myInts, 2.5 + 3.1, myFloats)".
            executor.execute();

            // Execute the exit node of Main.
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Test a little recursion.
        {
            const code = `Function Main() returns nothing
   Put makeFactorial(3) to output
Function makeFactorial(integer x) returns integer result
   if x == 1
      result = x
   else
      result = x * makeFactorial(x - 1)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Jump to first makeFactorial's start node.
            executor.execute();
            assert.equal(executor.stack[1].node.getName(), 'StartNode');
            assert.equal(executor.stack[1].function.name, 'makeFactorial');
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('x').getValue(), 3);

            // Execute start node then decision of first makeFactorial.
            executor.execute();
            executor.execute();

            // Jump to second makeFactorial's start node.
            executor.execute();
            assert.equal(executor.stack[2].node.getName(), 'StartNode');
            assert.equal(executor.stack[2].function.name, 'makeFactorial');
            assert.equal(executor.stack[2].function.parameters.getMemoryCell('x').getValue(), 2);

            // Execute start node then decision of second makeFactorial.
            executor.execute();
            executor.execute();

            // Jump to third makeFactorial's start node.
            executor.execute();
            assert.equal(executor.stack[3].node.getName(), 'StartNode');
            assert.equal(executor.stack[3].function.name, 'makeFactorial');
            assert.equal(executor.stack[3].function.parameters.getMemoryCell('x').getValue(), 1);

            // Execute start node then decision of third makeFactorial.
            executor.execute();
            executor.execute();

            // Execute "result = x".
            executor.execute();
            assert.equal(executor.stack[3].function.return.getMemoryCell('result').getValue(), 1);

            // Execute exit node of third makeFactorial.
            executor.execute();
            assert.equal(executor.stack.length, 3);

            // Execute "result = x * makeFactorial(x - 1)" of second makeFactorial.
            executor.execute();
            assert.equal(executor.stack[2].function.return.getMemoryCell('result').getValue(), 2);

            // Execute exit node of second makeFactorial.
            executor.execute();
            assert.equal(executor.stack.length, 2);

            // Execute "result = x * makeFactorial(x - 1)" of first makeFactorial.
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('result').getValue(), 6);

            // Execute exit node of first makeFactorial.
            executor.execute();
            assert.equal(executor.stack.length, 1);

            // Execute "Put makeFactorial(3) to output".
            executor.execute();
            assert.equal(executor.output.output, '6');

            // Execute the exit node of Main.
            executor.execute();
            assert.equal(executor.stack.length, 0);
        }

        // Make sure integer division differs from float division.
        {
            const code = `float y
y = 6 / 4
y = 6.0 / 4.0
y = 6 / 4.0
y = 6.0 / 4`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute integer division "x = 4 / 3"
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('y').getValue(), 1);

            // Execute float divisions.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('y').getValue(), 1.5);
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('y').getValue(), 1.5);
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('y').getValue(), 1.5);
        }

        // Test built-in randomizing functions.
        {
            const code = `SeedRandomNumbers(1)
Put RandomNumber(3, 5) to output
SeedRandomNumbers(2)
Put RandomNumber(3, 5) to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "SeedRandomNumbers(1)".
            executor.execute();
            assert.ok(executor.randomizer.alea);

            // Execute "Put RandomNumber(3, 5) to output".
            executor.execute();
            assert.equal(executor.output.output, '3');

            // Execute "SeedRandomNumbers(2)".
            executor.execute();

            // Execute "Put RandomNumber(3, 5) to output".
            executor.execute();
            assert.equal(executor.output.output, '35');
        }

        // Test that divide by 0 of integers is an error.
        {
            const code = `integer x
x = 4 / 0`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = 4 / 0".
            let hadError = false;

            try {
                executor.execute();
            }
            catch (error) {
                hadError = true;
            }

            assert.ok(hadError);
        }

        // Second test that divide by 0 of integers is an error.
        {
            const code = `integer x
integer y
integer z
x = 2
y = 0
z = x / y`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = 2" and "y = 0".
            executor.execute();
            executor.execute();

            // Execute "z = x / y".
            let hadError = false;

            try {
                executor.execute();
            }
            catch (error) {
                hadError = true;
            }

            assert.ok(hadError);
        }

        // Allow read before write.
        {
            const code = `integer x
Put x to output`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "Put x to output".
            executor.execute();
            assert.equal(executor.output.output, '0');
        }

        // Test built-in calculation functions: RaiseToPower, SquareRoot, and AbsoluteValue.
        {
            const code = `integer x
x = RaiseToPower(2, 3)
x = SquareRoot(16)
x = AbsoluteValue(-3)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = RaiseToPower(2, 3)".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 8);

            // Execute "x = SquareRoot(16)".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 4);

            // Execute "x = AbsoluteValue(-3)".
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('x').getValue(), 3);
        }

        // Detect overflow of 32-bit integer.
        {
            const code = `integer x
x = 2147483647
x = 2147483648 - 1
x = 2147483648`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = 2147483647" and "x = 2147483648 - 1".
            executor.execute();
            executor.execute();

            // Execute "x = 2147483648".
            testForErrorOnNextExecute(assert, executor);
        }

        // Detect underflow of 32-bit integer.
        {
            const code = `integer x
x = -2147483648
x = -2147483649 + 1
x = -2147483649`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x = -2147483648" and "x = -2147483649 + 1".
            executor.execute();
            executor.execute();

            // Execute "x = -2147483649".
            testForErrorOnNextExecute(assert, executor);
        }

        // Detect out-of-bounds error on array for too large an index.
        {
            const code = `integer array(3) x
x[3] = 1`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x[3] = 1".
            testForErrorOnNextExecute(assert, executor);
        }

        // Detect out-of-bounds error on array for too small an index.
        {
            const code = `integer array(3) x
x[-2] = 1`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "x[-2] = 1".
            testForErrorOnNextExecute(assert, executor);
        }

        // Test short circuit evaluation.
        {
            const code = `integer array(3) myNums
integer index
integer max
max = 5
index = 0
myNums[0] = 0
myNums[1] = 1
myNums[2] = 2
while ((index < myNums.size) and (myNums[index] < max)) or (myNums[5 - index] > 6)
   Put myNums[index] to output
   index = index + 1`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute program until short circuit.
            for (let counter = 0; counter < 15; counter++) {
                executor.execute();
            }

            // Short circuit happens here.
            executor.execute();

            // Finish program execution.
            while (!executor.isExecutionDone()) {
                executor.execute();
            }

            assert.equal(executor.output.output, '012');
        }

        // Test nested function call with function node.
        {
            const code = `Function inc() returns integer b
   b = 1

Function twice(integer a) returns nothing
   a = a + 1

Function Main() returns nothing
   twice(inc())`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute function call to inc().
            executor.execute();

            // Execute inc's start node.
            executor.execute();

            // Execute inc's assignment.
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('b').getValue(), 1);

            // Execute inc's end node.
            executor.execute();

            // Execute function call to twice().
            executor.execute();

            // Execute twice's start node.
            executor.execute();

            // Execute twice's assignment.
            executor.execute();
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('a').getValue(), 2);

            // Execute twice's end node.
            executor.execute();

            // Execute function call node.
            executor.execute();

            // Execute main's end node.
            executor.execute();
        }

        // Test nested function call with assignment node.
        {
            const code = `Function inc(integer a) returns integer x
   x = a + 1
Function Main() returns nothing
   integer b
   b = inc(inc(1))`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute function call to inc(1).
            executor.execute();

            // Execute inc's start node.
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('a').getValue(), 1);
            executor.execute();

            // Execute inc's assignment.
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('x').getValue(), 2);

            // Execute inc's end node.
            executor.execute();

            // Execute function call to inc(2).
            executor.execute();

            // Execute inc's start node.
            assert.equal(executor.stack[1].function.parameters.getMemoryCell('a').getValue(), 2);
            executor.execute();

            // Execute inc's assignment.
            executor.execute();
            assert.equal(executor.stack[1].function.return.getMemoryCell('x').getValue(), 3);

            // Execute inc's end node.
            executor.execute();

            // Execute assignment to b.
            executor.execute();
            assert.equal(executor.stack[0].function.locals.getMemoryCell('b').getValue(), 3);

            // Execute end node of Main.
            executor.execute();
        }

        // Test looped function call.
        {
            const code = `Function GetInput() returns integer n
   n = Get next input

Function Main() returns nothing
   integer i
   integer n

   while i < 2
      n = GetInput()
      Put n to output
      i = i + 1`;
            const executor = new Executor(code, '1 2', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '12');
        }

        // Test unary operator on array element.
        {
            const code = `integer array(3) a
a[0] = -a[0]`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '');
        }

        // Test carriage return instead of newline character.
        {
            const code = 'Put "a" to output\rPut "b" to output';
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, 'ab');
        }

        // Test carriage return + newline character.
        {
            const code = 'Put "a" to output\r\nPut "b" to output';
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, 'ab');
        }

        // Test single comment above variable declaration.
        {
            const code = `// Comment above variable
integer a
a = 0
Put a to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '0');
        }

        // Test multiple comments above variable declarations.
        {
            const code = `// Comment 1
// Comment 2
integer a
integer b
// Comment 3
integer c
a = 0
Put a to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '0');
        }

        // Test error thrown when array of size ? assigned with another array of size ?.
        {
            const code = `float array(?) a
float array(?) b
a = b`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute a = b.
            testForErrorOnNextExecute(assert, executor);
        }

        // Test error thrown when function argment's array of size ? assigned with array of size ?.
        {
            const code = `Function T(integer array(?) b) returns nothing
   Put b.size to output
Function Main() returns nothing
   integer array(?) a
   T(a)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute T(a).
            testForErrorOnNextExecute(assert, executor);
        }

        // Test error thrown when array of size 5 assigned with another array of size ?.
        {
            const code = `float array(5) a
float array(?) b
a = b`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute a = b.
            testForErrorOnNextExecute(assert, executor);
        }

        // Test error thrown when function argument's array of size 5 assigned with array of size ?.
        {
            const code = `Function T(integer array(5) b) returns nothing
   Put b.size to output
Function Main() returns nothing
   integer array(?) a
   T(a)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute T(a).
            testForErrorOnNextExecute(assert, executor);
        }

        // Test error thrown when array of size 5 assigned with another array of size 6.
        {
            const code = `float array(5) a
float array(6) b
a = b`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute a = b.
            testForErrorOnNextExecute(assert, executor);
        }

        // Test error thrown when function argument's array of size 5 assigned with another array of size 6.
        {
            const code = `Function T(integer array(5) b) returns nothing
   Put b.size to output
Function Main() returns nothing
   integer array(6) a
   T(a)`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute T(a).
            testForErrorOnNextExecute(assert, executor);
        }

        // Test decimal output with integer literal.
        {
            const code = `Put (1.0 / 3.0) to output with 5 decimal places
Put " " to output
Put 0.04 to output with 3 decimal places
Put " " to output
Put 5 to output with 3 decimal places`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '0.33333 0.040 5.000');
        }

        // Test decimal output with integer variable.
        {
            const code = `integer x
x = 5
Put (1.0 / 3.0) to output with x decimal places
Put " " to output
Put (1.0 / 3.0) to output with x - 2 decimal places`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '0.33333 0.333');
        }

        // Test execution of function call with array element parameter.
        {
            const code = `Function test(integer b) returns integer e
   e = b
Function Main() returns nothing
   integer array(3) nums
   Put test(nums[0]) to output`;
            const executor = new Executor(code, '', true);

            runExecutorToCompletion(executor);
            assert.equal(executor.output.output, '0');
        }

        // Test not able to assign question mark to variable.
        {
            const code = `integer array(?) test
integer i
i = test.size`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "i = test.size".
            testForErrorOnNextExecute(assert, executor);
        }

        // Test not able to assign question mark to array element.
        {
            const code = `integer array(?) a
integer array(3) b
b[0] = a.size`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            // Execute start node.
            executor.execute();

            // Execute "b[0] = a.size".
            testForErrorOnNextExecute(assert, executor);
        }

        // Test getting input with no initial input.
        const unexpectedInputExpectedMessage = 'Program is trying to get next input, but no input values exist in the input box.';

        {
            const code = `integer a
a = Get next input`;
            const executor = new Executor(code, '', true);

            try {
                runExecutorToCompletion(executor);
            }
            catch (error) {
                assert.equal(error.message, unexpectedInputExpectedMessage);
            }
        }

        // Test multiple get inputs with no initial input.
        {
            const code = `integer a
a = Get next input
a = Get next input`;
            const executor = new Executor(code, '', true);

            try {
                runExecutorToCompletion(executor);
            }
            catch (error) {
                assert.equal(error.message, unexpectedInputExpectedMessage);
            }
        }

        // Test getting more input than amount of initial input given.
        {
            const code = `integer a
a = Get next input
a = Get next input`;
            const executor = new Executor(code, '5', true);

            try {
                runExecutorToCompletion(executor);
            }
            catch (error) {
                assert.equal(error.message, 'Program is trying to get next input, but all input values have already been gotten.');
            }
        }

        // Test assigning to elements of array with undefined size.
        const undefinedArrayExpectedMessage = 'Set the array\'s size before accessing an element.';

        {
            const code = `integer array(?) name
name[0] = 5`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            try {
                runExecutorToCompletion(executor);
            }
            catch (error) {
                assert.equal(error.message, undefinedArrayExpectedMessage);
            }
        }

        // Test accessing elements of array with undefined size.
        {
            const code = `integer x
integer array(?) name
x = name[0]`;
            const executor = new Executor(code, '', true);

            executor.enterExecution();

            try {
                runExecutorToCompletion(executor);
            }
            catch (error) {
                assert.equal(error.message, undefinedArrayExpectedMessage);
            }
        }

        // Test invalid code and compileOnInit = true throws error.
        {
            const code = 'Invalid code';

            try {
                const executor = new Executor(code, '', true, true); // eslint-disable-line no-unused-vars
            }
            catch (error) {
                assert.equal(error.message, 'Line 1: Unknown word \'Invalid\'', 'Invalid code and compileOnInit=true throws error');
            }
        }

        // Test invalid code and compileOnInit = false doesn't throw error.
        {
            const code = 'Invalid code';

            const executor = new Executor(code, '', true, false); // eslint-disable-line no-unused-vars

            assert.ok(executor, 'Invalid code and compileOnInit=false is ok');
        }

        // Test compileOnInit defaults to true, and so throws error with invalid code.
        {
            const code = 'Invalid code';

            try {
                const executor = new Executor(code, '', true); // eslint-disable-line no-unused-vars
            }
            catch (error) {
                assert.equal(error.message, 'Line 1: Unknown word \'Invalid\'', 'compileOnInit defaults to true and so invalid code throws error.'); // eslint-disable-line max-len
            }
        }
    });
}
