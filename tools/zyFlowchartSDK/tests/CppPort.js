'use strict';

/* eslint-disable no-magic-numbers */

/* exported runCppPortTests */
/* global TextualCodeParser, QUnit */

/**
    Test correctness of porting to C++.
    @method runCppPortrserTests
    @return {void}
*/
function runCppPortTests() {
    const parser = new TextualCodeParser();

    /**
        Return whether the parsing threw an error.
        @method hadErrorOnPort
        @param {String} code The code to parse.
        @return {Boolean} Whether the parsing threw an error.
    */
    function hadErrorOnPort(code) {
        const program = parser.parse(code);
        let hadError = false;

        try {
            program.getPortedCode('C++');
        }
        catch (error) {
            hadError = true;
        }

        return hadError;
    }

    QUnit.test('C++ port', assert => {

        // Test single integer.
        {
            const code = 'integer x';
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int x;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const endNode = startNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(endNode.portedLine.lineNumber, 7);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test 4 local variables, one of each type.
        {
            const code = `integer numCats
float toeLength
integer array(5) myList
float array(?) toeLengths`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <vector>
using namespace std;

int main() {
   int numCats;
   double toeLength;
   vector<int> myList(5);
   vector<double> toeLengths;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const endNode = startNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 11);
            assert.equal(endNode.portedLine.lineNumber, 11);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test output of string literal.
        {
            const code = 'Put "Test" to output';
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   cout << "Test";

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode = startNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 5);
            assert.equal(outputNode.portedLine.lineNumber, 5);
            assert.equal(endNode.portedLine.lineNumber, 7);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test output of integer.
        {
            const code = `integer numCats

Put numCats to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cout << numCats;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode = startNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(outputNode.portedLine.lineNumber, 7);
            assert.equal(endNode.portedLine.lineNumber, 9);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 18);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test input to integer.
        {
            const code = `integer numCats

numCats = Get next input`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cin >> numCats;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const endNode = inputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(inputNode.portedLine.lineNumber, 7);
            assert.equal(endNode.portedLine.lineNumber, 9);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test input and output.
        {
            const code = `integer numCats

numCats = Get next input
Put numCats to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cin >> numCats;
   cout << numCats;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const outputNode = inputNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(inputNode.portedLine.lineNumber, 7);
            assert.equal(outputNode.portedLine.lineNumber, 8);
            assert.equal(endNode.portedLine.lineNumber, 10);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 18);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Test comments and space between lines of code.
        {
            const code = `
// First comment

// Second comment
integer numCats


// Third comment
// Fourth comment
numCats = Get next input

// Fifth comment

// Sixth comment


Put numCats to output
// Seventh comment`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;


   // Third comment
   // Fourth comment
   cin >> numCats;

   // Fifth comment

   // Sixth comment


   cout << numCats;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const outputNode = inputNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 10);
            assert.equal(inputNode.portedLine.lineNumber, 10);
            assert.equal(outputNode.portedLine.lineNumber, 17);
            assert.equal(endNode.portedLine.lineNumber, 19);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 18);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Input, assignments, and output.
        {
            const code = `integer numCats
integer numDogs
integer numPets

numCats = Get next input
numDogs = Get next input
numPets = numCats + numDogs
Put numPets to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;
   int numDogs;
   int numPets;

   cin >> numCats;
   cin >> numDogs;
   numPets = numCats + numDogs;
   cout << numPets;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode1 = startNode.getChildNode();
            const inputNode2 = inputNode1.getChildNode();
            const processNode = inputNode2.getChildNode();
            const outputNode = processNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 9);
            assert.equal(inputNode1.portedLine.lineNumber, 9);
            assert.equal(inputNode2.portedLine.lineNumber, 10);
            assert.equal(processNode.portedLine.lineNumber, 11);
            assert.equal(outputNode.portedLine.lineNumber, 12);
            assert.equal(endNode.portedLine.lineNumber, 14);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode1.portedLine.endIndexOfSegment, 17);
            assert.equal(inputNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode2.portedLine.endIndexOfSegment, 17);
            assert.equal(processNode.portedLine.startIndexOfSegment, 0);
            assert.equal(processNode.portedLine.endIndexOfSegment, 30);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 18);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // If, else if, else statements.
        {
            const code = `integer numCats

numCats = Get next input
if numCats > 5
   Put "Too many" to output
elseif numCats < 1
   Put "Not enough" to output
else
   Put "Fine" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cin >> numCats;
   if (numCats > 5) {
      cout << "Too many";
   }
   else if (numCats < 1) {
      cout << "Not enough";
   }
   else {
      cout << "Fine";
   }

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const ifNode = inputNode.getChildNode();
            const outputNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const outputNode2 = elseIfNode.getChildNodeForTrue();
            const outputNode3 = elseIfNode.getChildNodeForFalse();
            const endNode = outputNode1.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(inputNode.portedLine.lineNumber, 7);
            assert.equal(ifNode.portedLine.lineNumber, 8);
            assert.equal(outputNode1.portedLine.lineNumber, 9);
            assert.equal(elseIfNode.portedLine.lineNumber, 11);
            assert.equal(outputNode2.portedLine.lineNumber, 12);
            assert.equal(outputNode3.portedLine.lineNumber, 15);
            assert.equal(endNode.portedLine.lineNumber, 18);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(ifNode.portedLine.startIndexOfSegment, 0);
            assert.equal(ifNode.portedLine.endIndexOfSegment, 20);
            assert.equal(outputNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode1.portedLine.endIndexOfSegment, 24);
            assert.equal(elseIfNode.portedLine.startIndexOfSegment, 0);
            assert.equal(elseIfNode.portedLine.endIndexOfSegment, 25);
            assert.equal(outputNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode2.portedLine.endIndexOfSegment, 26);
            assert.equal(outputNode3.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode3.portedLine.endIndexOfSegment, 20);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Nested if, elseif, else.
        {
            const code = `integer numCats

numCats = Get next input
if numCats > 5
   Put "Too many" to output
   if numCats > 10
      Put ", weirdo" to output
      if numCats > 20
         Put "!!!" to output
      else
         Put "." to output
elseif numCats == 1
   Put "Borderline" to output
elseif numCats < 1
   Put "Not enough" to output
else
   Put "Fine" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cin >> numCats;
   if (numCats > 5) {
      cout << "Too many";
      if (numCats > 10) {
         cout << ", weirdo";
         if (numCats > 20) {
            cout << "!!!";
         }
         else {
            cout << ".";
         }
      }
   }
   else if (numCats == 1) {
      cout << "Borderline";
   }
   else if (numCats < 1) {
      cout << "Not enough";
   }
   else {
      cout << "Fine";
   }

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode = startNode.getChildNode();
            const ifNode1 = inputNode.getChildNode();
            const outputNode1 = ifNode1.getChildNodeForTrue();
            const ifNode2 = outputNode1.getChildNode();
            const outputNode2 = ifNode2.getChildNodeForTrue();
            const ifNode3 = outputNode2.getChildNode();
            const outputNode3 = ifNode3.getChildNodeForTrue();
            const outputNode4 = ifNode3.getChildNodeForFalse();
            const elseIfNode1 = ifNode1.getChildNodeForFalse();
            const outputNode5 = elseIfNode1.getChildNodeForTrue();
            const elseIfNode2 = elseIfNode1.getChildNodeForFalse();
            const outputNode6 = elseIfNode2.getChildNodeForTrue();
            const outputNode7 = elseIfNode2.getChildNodeForFalse();
            const endNode = outputNode7.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(inputNode.portedLine.lineNumber, 7);
            assert.equal(ifNode1.portedLine.lineNumber, 8);
            assert.equal(outputNode1.portedLine.lineNumber, 9);
            assert.equal(ifNode2.portedLine.lineNumber, 10);
            assert.equal(outputNode2.portedLine.lineNumber, 11);
            assert.equal(ifNode3.portedLine.lineNumber, 12);
            assert.equal(outputNode3.portedLine.lineNumber, 13);
            assert.equal(outputNode4.portedLine.lineNumber, 16);
            assert.equal(elseIfNode1.portedLine.lineNumber, 20);
            assert.equal(outputNode5.portedLine.lineNumber, 21);
            assert.equal(elseIfNode2.portedLine.lineNumber, 23);
            assert.equal(outputNode6.portedLine.lineNumber, 24);
            assert.equal(outputNode7.portedLine.lineNumber, 27);
            assert.equal(endNode.portedLine.lineNumber, 30);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode.portedLine.endIndexOfSegment, 17);
            assert.equal(ifNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(ifNode1.portedLine.endIndexOfSegment, 20);
            assert.equal(outputNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode1.portedLine.endIndexOfSegment, 24);
            assert.equal(ifNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(ifNode2.portedLine.endIndexOfSegment, 24);
            assert.equal(outputNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode2.portedLine.endIndexOfSegment, 27);
            assert.equal(ifNode3.portedLine.startIndexOfSegment, 0);
            assert.equal(ifNode3.portedLine.endIndexOfSegment, 27);
            assert.equal(outputNode3.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode3.portedLine.endIndexOfSegment, 25);
            assert.equal(outputNode4.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode4.portedLine.endIndexOfSegment, 23);
            assert.equal(elseIfNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(elseIfNode1.portedLine.endIndexOfSegment, 26);
            assert.equal(outputNode5.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode5.portedLine.endIndexOfSegment, 26);
            assert.equal(elseIfNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(elseIfNode2.portedLine.endIndexOfSegment, 25);
            assert.equal(outputNode6.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode6.portedLine.endIndexOfSegment, 26);
            assert.equal(outputNode7.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode7.portedLine.endIndexOfSegment, 20);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // While loop nested in else
        {
            const code = `if 1 > 1
   Put "a" to output
else
   while 1 > 1
      Put "b" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   if (1 > 1) {
      cout << "a";
   }
   else {
      while (1 > 1) {
         cout << "b";
      }
   }

   return 0;
}`);
        }

        // Just if and elseif
        {
            const code = `if 1 > 1
   Put "a" to output
elseif 1 > 1
   Put "b" to output
if 1 > 1
   Put "c" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   if (1 > 1) {
      cout << "a";
   }
   else if (1 > 1) {
      cout << "b";
   }
   if (1 > 1) {
      cout << "c";
   }

   return 0;
}`);
        }

        // While loop.
        {
            const code = `integer numCats

numCats = Get next input
while numCats < 0
   numCats = Get next input
Put numCats to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;

   cin >> numCats;
   while (numCats < 0) {
      cin >> numCats;
   }
   cout << numCats;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const inputNode1 = startNode.getChildNode();
            const loopNode = inputNode1.getChildNode();
            const inputNode2 = loopNode.getChildNodeForTrue();
            const outputNode = loopNode.getChildNodeForFalse();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(inputNode1.portedLine.lineNumber, 7);
            assert.equal(loopNode.portedLine.lineNumber, 8);
            assert.equal(inputNode2.portedLine.lineNumber, 9);
            assert.equal(outputNode.portedLine.lineNumber, 11);
            assert.equal(endNode.portedLine.lineNumber, 13);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(inputNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode1.portedLine.endIndexOfSegment, 17);
            assert.equal(loopNode.portedLine.startIndexOfSegment, 0);
            assert.equal(loopNode.portedLine.endIndexOfSegment, 23);
            assert.equal(inputNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(inputNode2.portedLine.endIndexOfSegment, 20);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 18);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // For loop.
        {
            const code = `integer i

for i = 0; i < 3; i = i + 1
   Put i to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int i;

   for (i = 0; i < 3; i = i + 1) {
      cout << i;
   }

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const processNode1 = startNode.getChildNode();
            const loopNode = processNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const processNode2 = outputNode.getChildNode();
            const endNode = loopNode.getChildNodeForFalse();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 7);
            assert.equal(processNode1.portedLine.lineNumber, 7);
            assert.equal(loopNode.portedLine.lineNumber, 7);
            assert.equal(outputNode.portedLine.lineNumber, 8);
            assert.equal(processNode2.portedLine.lineNumber, 7);
            assert.equal(endNode.portedLine.lineNumber, 11);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(processNode1.portedLine.startIndexOfSegment, 8);
            assert.equal(processNode1.portedLine.endIndexOfSegment, 12);
            assert.equal(loopNode.portedLine.startIndexOfSegment, 15);
            assert.equal(loopNode.portedLine.endIndexOfSegment, 19);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 15);
            assert.equal(processNode2.portedLine.startIndexOfSegment, 22);
            assert.equal(processNode2.portedLine.endIndexOfSegment, 30);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Port Coral arrays to C++ vectors.
        {
            const code = `integer array(5) numCats

numCats[0] = 5
Put numCats[0] to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <vector>
using namespace std;

int main() {
   vector<int> numCats(5);

   numCats.at(0) = 5;
   cout << numCats.at(0);

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const processNode = startNode.getChildNode();
            const outputNode = processNode.getChildNode();
            const endNode = outputNode.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 8);
            assert.equal(processNode.portedLine.lineNumber, 8);
            assert.equal(outputNode.portedLine.lineNumber, 9);
            assert.equal(endNode.portedLine.lineNumber, 11);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(processNode.portedLine.startIndexOfSegment, 0);
            assert.equal(processNode.portedLine.endIndexOfSegment, 20);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 24);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Built-in math functions: SquareRoot, RaiseToPower, AbsoluteValue
        {
            const code = `Put SquareRoot(4) to output
Put RaiseToPower(4, 2) to output
Put AbsoluteValue(-4) to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
using namespace std;

int main() {
   cout << sqrt(4);
   cout << pow(4, 2);
   cout << fabs(-4);

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode1 = startNode.getChildNode();
            const outputNode2 = outputNode1.getChildNode();
            const outputNode3 = outputNode2.getChildNode();
            const endNode = outputNode3.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode.portedLine.lineNumber, 6);
            assert.equal(outputNode1.portedLine.lineNumber, 6);
            assert.equal(outputNode2.portedLine.lineNumber, 7);
            assert.equal(outputNode3.portedLine.lineNumber, 8);
            assert.equal(endNode.portedLine.lineNumber, 10);

            // Add tests for the start and end indices.
            assert.equal(startNode.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode.portedLine.endIndexOfSegment, 0);
            assert.equal(outputNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode1.portedLine.endIndexOfSegment, 18);
            assert.equal(outputNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode2.portedLine.endIndexOfSegment, 20);
            assert.equal(outputNode3.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode3.portedLine.endIndexOfSegment, 19);
            assert.equal(endNode.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode.portedLine.endIndexOfSegment, 11);
        }

        // Nested function call.
        {
            const code = 'Put SquareRoot(SquareRoot(16)) to output';
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
using namespace std;

int main() {
   cout << sqrt(sqrt(16));

   return 0;
}`);
        }

        // User-defined functions
        {
            const code = `Function FtInchToCm(float numFt, float numInch) returns float numCm
   numCm = ((numFt * 12) + numInch) * 2.54

Function Main() returns nothing
   float resultCm

   resultCm = FtInchToCm(5, 6)
   Put resultCm to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

double FtInchToCm(double numFt, double numInch) {
   double numCm;
   numCm = ((numFt * 12) + numInch) * 2.54;

   return numCm;
}

int main() {
   double resultCm;

   resultCm = FtInchToCm(5, 6);
   cout << resultCm;

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode1 = firstFunction.flowchart.startNode;
            const processNode1 = startNode1.getChildNode();
            const outputNode = processNode1.getChildNode();
            const endNode1 = outputNode.getChildNode();
            const secondFunction = program.functions[1];
            const startNode2 = secondFunction.flowchart.startNode;
            const processNode2 = startNode2.getChildNode();
            const endNode2 = processNode2.getChildNode();

            // Test each node's associated line of code.
            assert.equal(startNode1.portedLine.lineNumber, 14);
            assert.equal(processNode1.portedLine.lineNumber, 14);
            assert.equal(outputNode.portedLine.lineNumber, 15);
            assert.equal(endNode1.portedLine.lineNumber, 17);
            assert.equal(startNode2.portedLine.lineNumber, 6);
            assert.equal(processNode2.portedLine.lineNumber, 6);
            assert.equal(endNode2.portedLine.lineNumber, 8);

            // Add tests for the start and end indices.
            assert.equal(startNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode1.portedLine.endIndexOfSegment, 0);
            assert.equal(processNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(processNode1.portedLine.endIndexOfSegment, 30);
            assert.equal(outputNode.portedLine.startIndexOfSegment, 0);
            assert.equal(outputNode.portedLine.endIndexOfSegment, 19);
            assert.equal(endNode1.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode1.portedLine.endIndexOfSegment, 11);
            assert.equal(startNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(startNode2.portedLine.endIndexOfSegment, 0);
            assert.equal(processNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(processNode2.portedLine.endIndexOfSegment, 42);
            assert.equal(endNode2.portedLine.startIndexOfSegment, 0);
            assert.equal(endNode2.portedLine.endIndexOfSegment, 15);
        }

        // Function call highlighting needs to adjust when function names changed.
        {
            const code = `Function t() returns float e
   e = 1
Function Main() returns nothing
   Put AbsoluteValue(t()) to output
   Put AbsoluteValue(t() + t()) to output
   Put 1 + AbsoluteValue(t()) to output
   Put AbsoluteValue(t()) + AbsoluteValue(t()) to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
using namespace std;

double t() {
   double e;
   e = 1;

   return e;
}

int main() {
   cout << fabs(t());
   cout << fabs(t() + t());
   cout << 1 + fabs(t());
   cout << fabs(t()) + fabs(t());

   return 0;
}`);

            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode1 = startNode.getChildNode();
            const outputNode2 = outputNode1.getChildNode();
            const outputNode3 = outputNode2.getChildNode();
            const outputNode4 = outputNode3.getChildNode();
            const functionCallSymbol1 = outputNode1.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = outputNode2.nonBuiltInFunctionCalls[0];
            const functionCallSymbol3 = outputNode2.nonBuiltInFunctionCalls[1];
            const functionCallSymbol4 = outputNode3.nonBuiltInFunctionCalls[0];
            const functionCallSymbol5 = outputNode4.nonBuiltInFunctionCalls[0];
            const functionCallSymbol6 = outputNode4.nonBuiltInFunctionCalls[1];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 16);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 18);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 16);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 18);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 22);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 24);
            assert.equal(functionCallSymbol4.portedStartIndexToHighlight, 20);
            assert.equal(functionCallSymbol4.portedEndIndexToHighlight, 22);
            assert.equal(functionCallSymbol5.portedStartIndexToHighlight, 16);
            assert.equal(functionCallSymbol5.portedEndIndexToHighlight, 18);
            assert.equal(functionCallSymbol6.portedStartIndexToHighlight, 28);
            assert.equal(functionCallSymbol6.portedEndIndexToHighlight, 30);
        }

        // Function highlighting needs to change to account for arrays and parameters.
        {
            const code = `Function test(integer b) returns integer e
   e = b
Function Main() returns nothing
   integer array(3) nums

   Put test(AbsoluteValue(5)) to output
   Put test(AbsoluteValue(nums[0])) to output
   Put test(AbsoluteValue(5) + nums[0]) to output
   Put test(nums[0] + AbsoluteValue(5)) to output
   Put nums[0] + test(AbsoluteValue(5)) to output
   Put test(AbsoluteValue(5)) + nums[0] to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
#include <vector>
using namespace std;

int test(int b) {
   int e;
   e = b;

   return e;
}

int main() {
   vector<int> nums(3);

   cout << test(fabs(5));
   cout << test(fabs(nums.at(0)));
   cout << test(fabs(5) + nums.at(0));
   cout << test(nums.at(0) + fabs(5));
   cout << nums.at(0) + test(fabs(5));
   cout << test(fabs(5)) + nums.at(0);

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode1 = startNode.getChildNode();
            const outputNode2 = outputNode1.getChildNode();
            const outputNode3 = outputNode2.getChildNode();
            const outputNode4 = outputNode3.getChildNode();
            const outputNode5 = outputNode4.getChildNode();
            const outputNode6 = outputNode5.getChildNode();
            const functionCallSymbol1 = outputNode1.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = outputNode2.nonBuiltInFunctionCalls[0];
            const functionCallSymbol3 = outputNode3.nonBuiltInFunctionCalls[0];
            const functionCallSymbol4 = outputNode4.nonBuiltInFunctionCalls[0];
            const functionCallSymbol5 = outputNode5.nonBuiltInFunctionCalls[0];
            const functionCallSymbol6 = outputNode6.nonBuiltInFunctionCalls[0];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 23);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 32);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 36);
            assert.equal(functionCallSymbol4.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol4.portedEndIndexToHighlight, 36);
            assert.equal(functionCallSymbol5.portedStartIndexToHighlight, 24);
            assert.equal(functionCallSymbol5.portedEndIndexToHighlight, 36);
            assert.equal(functionCallSymbol6.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol6.portedEndIndexToHighlight, 23);
        }

        // Ported highlighting needs to update on else if, if, function call, and loop nodes.
        {
            const code = `Function test(integer b) returns integer e
   e = b
Function test2(integer b) returns nothing
   Put b to output
Function Main() returns nothing
   if test(AbsoluteValue(5)) > 5
      test2(AbsoluteValue(5))
   elseif test(AbsoluteValue(5)) > 5
      test2(AbsoluteValue(5))
   else
      test2(AbsoluteValue(5))
   while test(AbsoluteValue(5)) > 5
      test2(AbsoluteValue(5))`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
using namespace std;

int test(int b) {
   int e;
   e = b;

   return e;
}

void test2(int b) {
   cout << b;

   return;
}

int main() {
   if (test(fabs(5)) > 5) {
      test2(fabs(5));
   }
   else if (test(fabs(5)) > 5) {
      test2(fabs(5));
   }
   else {
      test2(fabs(5));
   }
   while (test(fabs(5)) > 5) {
      test2(fabs(5));
   }

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const ifNode = startNode.getChildNode();
            const functionNode1 = ifNode.getChildNodeForTrue();
            const elseIfNode = ifNode.getChildNodeForFalse();
            const functionNode2 = elseIfNode.getChildNodeForFalse();
            const loopNode = functionNode2.getChildNode();
            const functionNode3 = loopNode.getChildNodeForTrue();
            const functionCallSymbol1 = ifNode.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = functionNode1.nonBuiltInFunctionCalls[0];
            const functionCallSymbol3 = elseIfNode.nonBuiltInFunctionCalls[0];
            const functionCallSymbol4 = functionNode2.nonBuiltInFunctionCalls[0];
            const functionCallSymbol5 = loopNode.nonBuiltInFunctionCalls[0];
            const functionCallSymbol6 = functionNode3.nonBuiltInFunctionCalls[0];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 7);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 19);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 6);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 19);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 12);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 24);
            assert.equal(functionCallSymbol4.portedStartIndexToHighlight, 6);
            assert.equal(functionCallSymbol4.portedEndIndexToHighlight, 19);
            assert.equal(functionCallSymbol5.portedStartIndexToHighlight, 10);
            assert.equal(functionCallSymbol5.portedEndIndexToHighlight, 22);
            assert.equal(functionCallSymbol6.portedStartIndexToHighlight, 6);
            assert.equal(functionCallSymbol6.portedEndIndexToHighlight, 19);
        }

        // Ported highlighting when user-defined function is in array access.
        {
            const code = `Function Max(integer x, integer y) returns integer max
   max = x
   if y > x
      max = y

Function Main() returns nothing
   integer array(5) nums

   Put Max(nums[Max(0, 1)], nums[Max(1, 2)]) to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <vector>
using namespace std;

int Max(int x, int y) {
   int max;
   max = x;
   if (y > x) {
      max = y;
   }

   return max;
}

int main() {
   vector<int> nums(5);

   cout << Max(nums.at(Max(0, 1)), nums.at(Max(1, 2)));

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const outputNode = startNode.getChildNode();
            const functionCallSymbol1 = outputNode.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = outputNode.nonBuiltInFunctionCalls[1];
            const functionCallSymbol3 = outputNode.nonBuiltInFunctionCalls[2];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 23);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 31);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 43);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 51);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 53);
        }

        // Ported highlighting needs to update both sides of the assignment node.
        {
            const code = `Function test(integer a) returns integer b
   b = a
Function Main() returns nothing
   float c
   integer array(3) nums

   c = test(AbsoluteValue(-5) + 2)
   nums[test(0)] = nums[test(1)] + nums[test(2)]`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
#include <vector>
using namespace std;

int test(int a) {
   int b;
   b = a;

   return b;
}

int main() {
   double c;
   vector<int> nums(3);

   c = test(fabs(-5) + 2);
   nums.at(test(0)) = nums.at(test(1)) + nums.at(test(2));

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const assignmentNode2 = assignmentNode1.getChildNode();
            const functionCallSymbol1 = assignmentNode1.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = assignmentNode2.nonBuiltInFunctionCalls[0];
            const functionCallSymbol3 = assignmentNode2.nonBuiltInFunctionCalls[1];
            const functionCallSymbol4 = assignmentNode2.nonBuiltInFunctionCalls[2];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 7);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 24);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 30);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 36);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 49);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 55);
            assert.equal(functionCallSymbol4.portedStartIndexToHighlight, 11);
            assert.equal(functionCallSymbol4.portedEndIndexToHighlight, 17);
        }

        // Ported highlighting needs to update each part of a for loop.
        {
            const code = `Function test(integer a) returns integer b
   b = a
Function Main() returns nothing
   integer i
   integer array(3) nums

   for i = test(0); test(i) < test(nums.size); i = test(i + 1)
      Put i to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <vector>
using namespace std;

int test(int a) {
   int b;
   b = a;

   return b;
}

int main() {
   int i;
   vector<int> nums(3);

   for (i = test(0); test(i) < test(nums.size()); i = test(i + 1)) {
      cout << i;
   }

   return 0;
}`);
            const firstFunction = program.functions[0];
            const startNode = firstFunction.flowchart.startNode;
            const assignmentNode1 = startNode.getChildNode();
            const loopNode = assignmentNode1.getChildNode();
            const outputNode = loopNode.getChildNodeForTrue();
            const assignmentNode2 = outputNode.getChildNode();
            const functionCallSymbol1 = assignmentNode1.nonBuiltInFunctionCalls[0];
            const functionCallSymbol2 = loopNode.nonBuiltInFunctionCalls[0];
            const functionCallSymbol3 = loopNode.nonBuiltInFunctionCalls[1];
            const functionCallSymbol4 = assignmentNode2.nonBuiltInFunctionCalls[0];

            assert.equal(functionCallSymbol1.portedStartIndexToHighlight, 12);
            assert.equal(functionCallSymbol1.portedEndIndexToHighlight, 18);
            assert.equal(functionCallSymbol2.portedStartIndexToHighlight, 21);
            assert.equal(functionCallSymbol2.portedEndIndexToHighlight, 27);
            assert.equal(functionCallSymbol3.portedStartIndexToHighlight, 31);
            assert.equal(functionCallSymbol3.portedEndIndexToHighlight, 47);
            assert.equal(functionCallSymbol4.portedStartIndexToHighlight, 54);
            assert.equal(functionCallSymbol4.portedEndIndexToHighlight, 64);
        }

        // Convert conditional operators: and -> &&, not -> !, or -> ||
        {
            const code = `if not(1 > 3) and (1 > 3) or (1 > 3)and(1<3)ornot(1<3)
   Put "a" to output
if AbsoluteValue(-5)>3andAbsoluteValue(-5)<3
   Put "b" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <cmath>
using namespace std;

int main() {
   if (!(1 > 3) && (1 > 3) || (1 > 3)&&(1<3)||!(1<3)) {
      cout << "a";
   }
   if (fabs(-5)>3&&fabs(-5)<3) {
      cout << "b";
   }

   return 0;
}`);
        }

        // Port array's .size to vector's size(). Ex: nums.size -> nums.size()
        {
            const code = `integer array(5) nums

Put nums.size to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
#include <vector>
using namespace std;

int main() {
   vector<int> nums(5);

   cout << nums.size();

   return 0;
}`);
        }

        // Error when variable name is reserved C++ word.
        {
            const code = 'integer sizeof';

            assert.ok(hadErrorOnPort(code));
        }

        // Error when function name is reserved C++ word.
        {
            const code = `Function bitand() returns nothing
   Put "a" to output
Function Main() returns nothing
   bitand()`;

            assert.ok(hadErrorOnPort(code));
        }

        /*
            Throw error for built-in random functions.
            #include <ctime>
            ...
            srand(time(0)); // Default is time seed.
            SeedRandomNumbers(11) -> srand(11)
            RandomNumber(5, 10) -> (rand() % (10 - 5 + 1)) + 5 // Big challenge: First parameter appears twice.
        */
        {
            const code = `SeedRandomNumbers(11)
Put RandomNumber(5, 10) to output`;

            assert.ok(hadErrorOnPort(code));
        }

        /*
            Throw error for precision output because the C++ code is overly complicated.

            Coral code:
            Put 5 to output with 3 decimal places

            C++ code:
            #include <ios>
            #include <iomanip>
            ...
            streamsize ss = cout.precision();
            cout << fixed << setprecision(3) << 5 << resetiosflags(ios::fixed) << setprecision(ss);
        */
        {
            const code = 'Put 5 to output with 3 decimal places';

            assert.ok(hadErrorOnPort(code));
        }

        // Preserve blank lines above comments and nodes.
        {
            const code = `integer x


x = Get next input

// Print.
Put x to output


// Print.


Put x to output

// Print.


// Print.

Put x to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int x;


   cin >> x;

   // Print.
   cout << x;


   // Print.


   cout << x;

   // Print.


   // Print.

   cout << x;

   return 0;
}`);
        }

        // Preserve comment above else statement.
        {
            const code = `integer numCats
numCats = Get next input

// Numcats > 5
if numCats > 5
   Put "Too many" to output

// Other cases
else
   Put "Fine" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;
   cin >> numCats;

   // Numcats > 5
   if (numCats > 5) {
      cout << "Too many";
   }

   // Other cases
   else {
      cout << "Fine";
   }

   return 0;
}`);
        }

        // Preserve comment above elseif statement.
        {
            const code = `integer numCats
numCats = Get next input

// Numcats > 5
if numCats > 5
   Put "Too many" to output

// Numcats < 1
elseif numCats < 1
   Put "Not enough" to output

// Other cases
else
   Put "Fine" to output`;
            const program = parser.parse(code);
            const portedCode = program.getPortedCode('C++');

            assert.equal(portedCode, `#include <iostream>
using namespace std;

int main() {
   int numCats;
   cin >> numCats;

   // Numcats > 5
   if (numCats > 5) {
      cout << "Too many";
   }

   // Numcats < 1
   else if (numCats < 1) {
      cout << "Not enough";
   }

   // Other cases
   else {
      cout << "Fine";
   }

   return 0;
}`);
        }
    });
}
