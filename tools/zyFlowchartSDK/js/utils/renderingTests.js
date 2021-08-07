'use strict';

/* exported renderSuiteOfVariablesForTesting, renderSuiteOfFlowchartsForTesting */
/* global FlowchartController, VariablesController, IntegerArray, IntegerVariable, FloatVariable, Variables, FloatArray,
          TextualCodeParser */

/**
    Render a suite of variables for testing.
    @method renderSuiteOfVariablesForTesting
    @param {String} id The unique identifier given to this module.
    @return {void}
*/
function renderSuiteOfVariablesForTesting(id) {
    const variablesToRender = [];

    // Integer, integer, float
    {
        const variables = new Variables('Variables');

        variables.push(
            new IntegerVariable('x'),
            new IntegerVariable('y'),
            new FloatVariable('average')
        );
        variablesToRender.push(variables);
    }

    // Integer array, integer, integer, float
    {
        const variables = new Variables('Variables');

        variables.push(
            new IntegerArray('userWeights', 3), // eslint-disable-line no-magic-numbers
            new IntegerVariable('x'),
            new IntegerVariable('y'),
            new FloatVariable('average')
        );
        variablesToRender.push(variables);
    }

    // Integer array with 0 elements and float array with unknown elements
    {
        const variables = new Variables('Variables');

        variables.push(
            new IntegerArray('userWeights', 0),
            new FloatArray('userPercents', '?')
        );
        variablesToRender.push(variables);
    }

    variablesToRender.forEach(variables => {
        $(`#${id}`).append('<div></div>');

        const variablesController = new VariablesController(variables, $(`#${id} div:last`));

        variablesController.render();
    });
}

/**
    Render a suite of flowcharts.
    @method renderSuiteOfFlowchartsForTesting
    @param {String} id The unique identifier given to this module.
    @return {void}
*/
function renderSuiteOfFlowchartsForTesting(id) {
    const parser = new TextualCodeParser();
    const codes = [
        `if 1==1
   Put "a" to output
else
   while 2==2
      Put "b" to output
      while 3==3
         Put "c" to output
         Put "d" to output`,
        `if 1==1
   Put "a" to output
else
   while 2==2
      Put "b" to output
      Put "c" to output`,
        `if 1==1
   Put "a" to output
else
   while 2==2
      Put "b" to output
      if 3==3
         Put "c" to output`,
        `while 1<1
   if 2<2
      Put "a" to output
Put "b" to output`,

        `while 1 < 1
   if 2 < 2
      if 3 < 3
         Put "a" to output`,

        `integer x
integer y
if x < 1
   x = 0
elseif x > 1
   x = 2
   y = 3
else
   while y > 3
      x = 1`,

        `if 1==1
   Put "a" to output
else
   if 2==2
      Put "b" to output
   Put "c" to output`,

        `integer x
if x < 1
   Put "a" to output
elseif x > 1
   Put "b" to output`,

        `if 1==1
   Put "a" to output
if 2==2
   Put "b" to output`,

        `integer x
integer y
while x > 1
   if y > 4
      x = x + 1
   else
      x = x + 2`,

        `integer x
if x > 1
   while x > 2
      x = x + 1
else
   while x > 3
      x = x + 1`,

        `integer x
if x > 1
   if x > 2
      Put "a" to output
   else
      Put "b" to output
else
   if x < 3
      Put "c" to output
   else
      Put "d" to output`,

        `if 1 > 1
   if 2 > 2
      Put "a" to output
   else
      while 3 > 3
         Put "b" to output`,

        `integer x
integer y
if x > 5
   y = 1
else
   y = 2`,

        `integer x
if x > 5
   Put "a" to output
else
   Put "b" to output`,

        `integer x
integer y
while x < 5
   while y < 4
      Put "a" to output`,

        `integer x
while x < 5
   x = x + 1`,

        `integer x
Put "a" to output
x = Get next input
Put x to output`,

        `integer x
integer a
integer y
integer z
x = 5
a = 4 + (y * y) + (x * x) + (z * z)`,
        'Put 5 to output with 3 decimal places',
    ];

    codes.forEach(code => {
        $(`#${id}`).append('<div></div>');

        const program = parser.parse(code);
        const flowchartController = new FlowchartController(program.functions[0].flowchart, $(`#${id} div:last`));

        flowchartController.render();
    });
}
