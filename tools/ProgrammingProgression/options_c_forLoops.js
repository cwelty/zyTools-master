{
    language: 'c',
    levels: [
        {
            prompt: `Write a for loop that prints: 1 2 .. {{variableName}}. Ex: {{variableName}} = 4 prints:\n\n<pre>1 2 3 4 </pre>`,
            explanation: 'Initialize the loop variable to 1, and count upwards until {{variableName}}.',
            solution: {
                code: `i = 1; i <= {{variableName}}; ++i`,
                show: true,
            },
            parameters: {
                userNumValue: [ 5 ],
                variableName: [ 'userNum', 'countNum', 'numVal', 'lastNumber' ],
            },
            files: [
                {
                    filename: 'main.c',
                    program: {
                        headers: '#include <stdio.h>\n\n',
                        main: 'int main(void) {\n',
                        prefix: `   int {{variableName}} = 0;
   int i = 0;

   scanf("%d", &{{variableName}});   // Program will be tested with values of 4, 1, 12, 0 and -8.

   for(`,
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      printf("%d ", i);
   }`,
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                parameters: {
                    userNumValueToTest: [ 4, 1, 12, 0, -8 ],
                    programInput: ' 4 4 1 1 12 12 0 0 -8 -8',
                },
                main: `
   char* solution;

   {{#each userNumValueToTest}}
   testSolutionCode();
   solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing with user input {{this}}", false, false, false, false);
   {{/each}}

   zyTerminate();
`,
            },
        },
        {
            prompt: 'Write code that prints: {{variableName}} ... 2 1. Your code should contain a for loop. Print a newline after each number. Ex: {{variableName}} = 3 outputs:\n<pre>3\n2\n1\n</pre>',
            explanation: 'Initialize the loop variable to {{variableName}}, and count downwards until 1.',
            solution: {
                code: `i = {{variableName}}; i > 0; --i`,
                show: true,
            },
            parameters: {
                userNumValue: [ 4 ],
                variableName: [ 'userNum', 'countNum', 'numVal', 'firstNumber' ],
            },
            files: [
                {
                    filename: 'main.c',
                    program: {
                        headers: '#include <stdio.h>\n\n',
                        main: 'int main(void) {\n',
                        prefix: `   int {{variableName}} = 0;
   int i = 0;

   scanf("%d", &{{variableName}});   // Program will be tested with values of 3, 1, 0 and -2.

   for(`,
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      printf("%d\\n", i);
   }`,
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                parameters: {
                    userNumValueToTest: [ 3, 1, 0, -2 ],
                    programInput: ' 3 3 1 1 0 0 -2 -2'
                },
                main: `
   char* solution;

   {{#each userNumValueToTest}}
   testSolutionCode();
   solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing with user input {{this}}", false, false, false, false);
   {{/each}}

   zyTerminate();
`,
            },
        },
        {
            explanation: 'First print "Ready!", then count from {{variableName}} to 1, then print {{word}}. Each print statement ends with a newline.',
            prompt: 'Write code that prints: Ready! {{variableName}} ... 2 1 {{word}} Your code should contain a for loop. Print a newline after each print statement. Ex: {{variableName}} = 3 outputs:\n<pre>Ready!\n3\n2\n1\n{{word}}</pre>',
            solution: {
                code: `\n   printf("Ready!\\n");

   for (i = {{variableName}}; i > 0; i = i - 1) {
      printf("%d\\n", i);
   }

   printf("{{word}}\\n");\n`,
                show: true,
            },
            parameters: {
                userNumValue: [ 4 ],
                word: [ 'Go!', 'Blastoff!', 'Run!', 'Start!' ],
                variableName: [ 'userNum', 'countNum', 'numVal', 'firstNumber' ],
            },
            files: [
                {
                    filename: 'main.c',
                    program: {
                        headers: '#include <stdio.h>\n\n',
                        main: 'int main(void) {\n',
                        prefix: `   int {{variableName}} = 0;
   int i = 0;

   scanf("%d", &{{variableName}});   // Program will be tested with values of 5, 1, 0 and -2.
   `,
                        student: '<STUDENT_CODE>',
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                parameters: {
                    programInput: ' 5 5 1 1 0 0 -2 -2',
                    userNumValueToTest: [ 5, 1, 0, -2 ],
                },
                main: `
   char* solution;

   {{#each userNumValueToTest}}
   testSolutionCode();
   solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing with user input {{this}}", false, false, false, false);
   {{/each}}

   zyTerminate();
`,
            },
        },
        {
            explanation: 'Initialize the loop variable to {{variableName}}, and count upwards until 0.',
            prompt: `Write a for loop that prints the numbers from {{variableName}} to 0. Ex: {{variableName}} = -3 outputs: <pre>-3 -2 -1 0 </pre>`,
            solution: {
                code: `i = {{variableName}}; i <= 0; ++i`,
                show: true,
            },
            parameters: {
                negativeNumber: [ -6 ],
                variableName: [ 'userNum', 'countNum', 'numVal', 'firstNumber' ],
            },
            files: [
                {
                    filename: 'main.c',
                    program: {
                        headers: '#include <stdio.h>\n\n',
                        main: 'int main(void) {\n',
                        prefix: `   int {{variableName}} = 0;
   int i = 0;
   scanf("%d", &{{variableName}});   // Program will be tested with values of -8, -2, 0 and 3.

   for(`,
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      printf("%d ", i);
   }`,
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                parameters: {
                    programInput: ' -8 -8 -2 -2 0 0 3 3',
                    negativeNumberToTest: [ -8, -2, 0, 3 ],
                },
                main: `
   char* solution;

   {{#each negativeNumberToTest}}
   testSolutionCode();
   solution = zyGetOutput();

   testStudentCode();
   zyAssertOutput(solution, "Testing with user input {{this}}", false, false, false, false);
   {{/each}}

   zyTerminate();
`,
            },
        },
        {
            explanation: 'Initialize to {{startName}}, count upwards to {{endName}} by two. Ex: {{startName}} = -3 and {{endName}} = 4 outputs:<pre>-3 -1 1 3</pre>',
            prompt: 'Write a for loop that prints from {{startName}} to {{endName}} by twos.',
            solution: {
                code: `i = {{startName}}; i <= {{endName}}; i = i + 2`,
                show: true,
            },
            parameters: {
                startNumber: [ -5 ],
                startName: [ 'startNumber', 'initialNumber', 'firstNumber' ],
                endNumber: [ 6 ],
                endName: [ 'endNumber', 'finalNumber', 'lastNumber' ],
            },
            files: [
                {
                    filename: 'main.c',
                    program: {
                        headers: '#include <stdio.h>\n\n',
                        main: 'int main(void) {\n',
                        prefix: `   int {{startName}} = 0;
   int {{endName}} = 0;
   int i = 0;

   scanf("%d", &{{startName}});   // Program will be tested with values of -4, -8, 6 and -7
   scanf("%d", &{{endName}});   // Program will be tested with values of 5, 4, 2 and -3.

   for(`,
                        student: '<STUDENT_CODE>',
                        postfix: ') {\n      printf("%d ", i);\n   }',
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                parameters: {
                    programInput: ' -4 5 -4 5 -8 4 -8 4 6 2 6 2 -7 -3 -7 -3',
                },
                main: `
   char* solution;

   testSolutionCode(-4, 5);
   solution = zyGetOutput();
   testStudentCode(-4, 5);
   zyAssertOutput(solution, "Testing with user input -4 and 5", false, false, false, false);

   testSolutionCode(-8, 4);
   solution = zyGetOutput();
   testStudentCode(-8, 4);
   zyAssertOutput(solution, "Testing with user input -8 and 4", false, false, false, false);

   testSolutionCode(6, 2);
   solution = zyGetOutput();
   testStudentCode(6, 2);
   zyAssertOutput(solution, "Testing with user input 6 and 2", false, false, false, false);

   testSolutionCode(-7, -3);
   solution = zyGetOutput();
   testStudentCode(-7, -3);
   zyAssertOutput(solution, "Testing with user input -7 and -3", false, false, false, false);

   zyTerminate();
`,
            },
        },
    ]
}
