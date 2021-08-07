{
    language: 'cpp',
    levels: [
        {
            prompt: 'Find and fix the error in the if-else statement.',
            solution: {
                code: `
   if (userNum {{{operator.conditionSymbol}}} 2) {
      cout << "Num is {{operator.printIfTrue}} two" << endl;
   }
   else {
      cout << "Num is {{operator.printIfFalse}} two" << endl;
  }
`,
                show: false,
            },
            parameters: {
                operator: [
                    {
                        conditionSymbol: '<=',
                        printIfTrue: 'less or equal to',
                        printIfFalse: 'greater than',
                        programInput: ' 1 1 2 2 3 3 4 4',
                        testVector: '1, 2, 3, 4',
                    },
                    {
                        conditionSymbol: '==',
                        printIfTrue: 'equal to',
                        printIfFalse: 'not',
                        programInput: ' 0 0 1 1 2 2 3 3',
                        testVector: '0, 1, 2, 3',
                    },
                    {
                        conditionSymbol: '>=',
                        printIfTrue: 'greater or equal to',
                        printIfFalse: 'less than',
                        programInput: ' 0 0 1 1 2 2 3 3',
                        testVector: '0, 1, 2, 3',
                    },
                    {
                        conditionSymbol: '!=',
                        printIfTrue: 'not',
                        printIfFalse: 'equal to',
                        programInput: ' 1 1 2 2 3 3 4 4',
                        testVector: '1, 2, 3, 4',
                    }
                ],
                userNum: ['2'],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int userNum = 0;\n\n   cin >> userNum;   // Program will be tested with values of {{operator.testVector}}\n',
                        student: '   if (userNum = 2) {\n      cout << "Num is {{operator.printIfTrue}} two" << endl;\n   }\n   else {\n      cout << "Num is {{operator.printIfFalse}} two" << endl;\n   }',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   int testUserNum[4] = { {{operator.testVector}} };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 4; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing with user input " << testUserNum[i];

      testSolutionCode();
      string solution = zyGetOutput();

      testStudentCode();

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();
`,
            },
        },
    ]
}
