{
    language: 'cpp',
    levels: [
        {
            prompt: 'Write a statement that prints the following on a single output line (without a newline):\n<pre>{{prompt}}</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'Use cout to print text.',
            solution: {
                code: '\n   cout << "{{prompt}}";\n',
                show: true,
            },
            parameters: {
                prompt: ['3 2 1 Go!', 'Ready, Set, Go!', 'Hello world! How are you?', 'This is awesome!', 'I love this job', 'I like how you think', 'To be or not to be', 'So be it', 'My name is Bob', 'My name is May', 'I feel great today' ],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   testSolutionCode();
   string solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing for correct output", false, false, false, false);
   zyTerminate();`,
            },
        },
        {
            prompt: 'Write code that prints the following. End each output line with a newline, using endl items.\n<pre>{{letter1}}{{number1}}\n{{letter2}}{{number2}}\n</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'You can use multiple cout statements, endl starts a new output line.',
            solution: {
                code: '\n   cout << "{{letter1}}{{number1}}" << endl;\n   cout << "{{letter2}}{{number2}}" << endl;\n',
                show: true,
            },
            parameters: {
                letter1: [ 'A', 'B', 'C', 'D' ],
                letter2: [ 'E', 'F', 'G', 'H' ],
                number1: [ '1', '2', '3', '4' ],
                number2: [ '5', '6', '7', '8' ],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   testSolutionCode();
   string solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing for correct output", false, false, false, false);
   zyTerminate();`,
            },
        },
        {
            prompt: 'Write a statement that outputs variable num{{object}} as follows. End with a newline.\n<pre>There are 10 {{object}}.\n</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output',
            explanation: 'Printing the value of a variable is achieved via: cout << variableName;',
            solution: {
                code: '\n   cout << "There are " << num{{object}} << " {{object}}." << endl;\n',
                show: true,
            },
            parameters: {
                object: [ 'Cars', 'Houses', 'Computers', 'Pens', 'Notebooks', 'Mugs' ],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int num{{object}} = 0;\n\n   cin >> num{{object}};   // Program will be tested with values of 10 and 33.\n   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   string solution = "";

   {{#each numbers}}
   testSolutionCode();
   solution = zyGetOutput();
   testStudentCode();
   zyAssertOutput(solution, "Testing with user input {{this}}", false, false, false, false);
   {{/each}}

   zyTerminate();`,

                parameters: {
                    numbers: [ '10', '33' ],
                    programInput: ' 10 10 33 33',
                },
            },
        }
    ]
}
