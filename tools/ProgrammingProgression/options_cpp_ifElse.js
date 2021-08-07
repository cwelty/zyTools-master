{
    language: 'cpp',
    levels: [
        {
            prompt: 'Write an expression that will cause the following code to print "{{operator.printIfTrue}}" if the value of userAge is {{operator.printIfTrue}}.',
            explanation: 'Use {{{operator.conditionSymbol}}} to check if userAge is {{operator.printIfTrue}}.',
            solution: {
                code: `userAge {{{operator.conditionSymbol}}} 18`,
                show: true,
            },
            parameters: {
                operator: [
                    { conditionSymbol: '<', printIfTrue: 'less than 18', printIfFalse: '18 or more', test: '16, 17, 18, 19', programInput: '16 16 17 17 18 18 19 19', },
                    { conditionSymbol: '==', printIfTrue: 'equal to 18', printIfFalse: 'not 18', test: '17, 18, 19, 20', programInput: '17 17 18 18 19 19 20 20', },
                    { conditionSymbol: '>', printIfTrue: 'more than 18', printIfFalse: '18 or less', test: '17, 18, 19, 20', programInput: '17 17 18 18 19 19 20 20', },
                ],
                userAge: '17',
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int userAge = 0;\n\n   cin >> userAge;    // Program will be tested with values: {{operator.test}}.\n   if(',
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      cout << "{{operator.printIfTrue}}" << endl;
   }
   else {
      cout << "{{operator.printIfFalse}}" << endl;
   }`,
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                main: `
   int testUserAge[4] = { {{operator.test}} };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 4; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing with input = " << testUserAge[i];

      testSolutionCode(testUserAge[i]);
      string solution = zyGetOutput();

      testStudentCode(testUserAge[i]);

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,
                parameters: {
                   testFunctionReturns: 'void',
                   testFunctionParameters: 'int zyUserAge',
                   userAge: 'zyUserAge',
               },
            },
        },

        {
            prompt: 'Write an expression that will cause the following code to print "{{operator.printIfTrue}}" if the value of userNum is {{operator.printIfTrue}}.',
            explanation: 'Use {{{operator.conditionSymbol}}} to check if userNum is {{operator.printIfTrue}}.',
            solution: {
                code: `userNum {{{operator.conditionSymbol}}} -10`,
                show: true,
            },
            parameters: {
                operator: [
                    { conditionSymbol: '<', printIfTrue: 'less than -10', printIfFalse: '-10 or more', test: '-8, -9, -10, -11', programInput: '-8 -8 -9 -9 -10 -10 -11 -11 -12 -12' },
                    { conditionSymbol: '==', printIfTrue: 'equal to -10', printIfFalse: 'not -10', test: '-9, -10, -11, -12', programInput: '-9 -9 -10 -10 -11 -11 -12 -12' },
                    { conditionSymbol: '>', printIfTrue: 'more than -10', printIfFalse: '-10 or less', test: '-9, -10, -11, -12', programInput: '-9 -9 -10 -10 -11 -11 -12 -12' },
                ],
                userNum: '-9',
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int userNum = 0;\n\n   cin >> userNum;    // Program will be tested with values: {{operator.test}}.\n   if(',
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      cout << "{{operator.printIfTrue}}" << endl;
   }
   else {
      cout << "{{operator.printIfFalse}}" << endl;
   }`,
                        returnStatement: '\n\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   int testUserNum[4] = { {{operator.test}} };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 4; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing with input = " << testUserNum[i];

      testSolutionCode(testUserNum[i]);
      string solution = zyGetOutput();

      testStudentCode(testUserNum[i]);

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,
                parameters: {
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zyUserNum',
                    userNum: 'zyUserNum',
                },
            },
        },

        {
            prompt: `Write an expression that will cause the following code to print "{{operator.printIfFalse}}" if the value of userAge is {{operator.promptWord}} than {{operator.number}}.`,
            explanation: 'The expression should check if userAge is {{operator.conditionWord}} than {{operator.conditionNumber}}. If userAge is not, then the code will print "I am a teenager".',
            solution: {
                code: `userAge {{{operator.conditionSymbol}}} {{operator.conditionNumber}}`,
                show: true,
            },
            parameters: {
                operator: [
                    { conditionNumber: '19', conditionSymbol: '>', conditionWord: 'more', promptWord: 'less', number: '20', printIfTrue: 'I am an adult', printIfFalse: 'I am a teenager', },
                    { conditionNumber: '20', conditionSymbol: '<', conditionWord: 'less', promptWord: 'more', number: '19', printIfTrue: 'I am a teenager', printIfFalse: 'I am an adult', },
                ],
                userAge: ['19'],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int userAge = 0;\n\n   cin >> userAge;    // Program will be tested with values: 18, 19, 20, 21.\n   if (',
                        student: '<STUDENT_CODE>',
                        postfix: `) {
      cout << "{{operator.printIfTrue}}" << endl;
   }
   else {
      cout << "{{operator.printIfFalse}}" << endl;
   }`,
                        returnStatement: '\n\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   int testUserAge[4] = { 18, 19, 20, 21 };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 4; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing with input " << testUserAge[i];

      testSolutionCode(testUserAge[i]);
      string solution = zyGetOutput();

      testStudentCode(testUserAge[i]);

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,
                parameters: {
                    programInput: '18 18 19 19 20 20 21 21',
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zyUserAge',
                    userAge: 'zyUserAge',
                }
            },
        }
    ]
}
