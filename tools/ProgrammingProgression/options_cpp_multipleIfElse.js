{
    language: 'cpp',
    levels: [
        {
            prompt: 'Write multiple if statements. If carYear is {{fewFeatures}} or earlier, print "Probably has few safety features." (whithout quotes). If {{seventies}} or higher, print "Probably has {{seventiesFeature}}.". If {{nineties}} or higher, print "Probably has {{ninetiesFeature}}.". If {{twoThousands}} or higher, print "Probably has {{twoThousandsFeature}}.". End each phrase with period and newline.\nEx: carYear = 1995 prints:\n<pre>Probably has {{seventiesFeature}}.\nProbably has {{ninetiesFeature}}.\n</pre>',
            explanation: 'One possible solution includes four if statements, one for each possible year.',
            solution: {
                code: `
   if (carYear <= {{fewFeatures}}) {
      cout << "Probably has few safety features." << endl;
   }
   if (carYear >= {{seventies}}) {
      cout << "Probably has {{seventiesFeature}}." << endl;
   }
   if (carYear >= {{nineties}}) {
      cout << "Probably has {{ninetiesFeature}}." << endl;
   }
   if (carYear >= {{twoThousands}}) {
      cout << "Probably has {{twoThousandsFeature}}." << endl;
   }
`,
                show: true,
            },
            parameters: {
                carYearParam: [1965, 1968, 1970, 1991, 2001, 2006],
                fewFeatures: [1967, 1968],
                seventies: [1969, 1970, 1971],
                seventiesFeature: ['seat belts', 'head rests'],
                nineties: [1990, 1991, 1992],
                ninetiesFeature: ['anti-lock brakes', 'electronic stability control'],
                twoThousands: [2000, 2001, 2002],
                twoThousandsFeature: ['air bags', 'tire-preassure monitor'],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int carYear = {{carYearParam}};\n\n   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                main: `
   int testCarYears[7] = { {{fewFeatures}}, {{seventies}}, {{seventies}} + 1, {{nineties}},
                           {{nineties}} + 1, {{twoThousands}}, {{twoThousands}} + 1 };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 7; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing for correct output for " << testCarYears[i];

      testSolutionCode(testCarYears[i]);
      string solution = zyGetOutput();

      testStudentCode(testCarYears[i]);

      zyAssertOutput(solution,  whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,
                parameters: {
                   testFunctionReturns: 'void',
                   testFunctionParameters: 'int zyCarYear',
                   carYearParam: 'zyCarYear',
               },
            },
        },
        {
            prompt: 'Write an if-else statement with multiple branches. If givenPrice is {{veryExpensivePrice}} or greater, print "{{veryExpensiveString}}". Else, if givenPrice is {{expensivePrice}} or greater ({{expensivePrice}}-{{veryExpensivePrice}}), print "{{expensiveString}}". Else, if givenPrice is {{goodPrice}} or greater ({{goodPrice}}-{{expensivePrice}}), print "{{goodPriceString}}". Else ({{goodPrice}} less), print "{{cheapString}}". Do NOT end with newline.',
            explanation: 'You can use multiple cout statements, endl starts a new output line.',
            solution: {
                code: `
   if (givenPrice >= {{veryExpensivePrice}}) {
      cout << "{{{veryExpensiveString}}}";
   }
   else if (givenPrice >= {{expensivePrice}}) {
      cout << "{{expensiveString}}";
   }
   else if (givenPrice >= {{goodPrice}}) {
      cout << "{{{goodPriceString}}}";
   }
   else {
      cout << "{{{cheapString}}}";
   }
`,
                show: true,
            },
            parameters: {
                veryExpensivePrice: [ 90, 95, 100, 105, 110 ],
                veryExpensiveString: [ 'Let\'s look somewhere else', 'Forget about it' ],
                expensivePrice: [ 50, 55, 60, 65, 70 ],
                expensiveString: [ 'It is a bit expensive', 'We can find it cheaper' ],
                goodPrice: [ 20, 25, 30, 35, 40 ],
                goodPriceString: [ 'This is it', 'Let\'s get it' ],
                cheapString: [ 'This is a good deal', 'I\'ll get two' ],
                givenPriceParam: [ 15, 45, 80, 130 ],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int givenPrice = {{givenPriceParam}};\n\n   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '',
                        returnStatement: '\n   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   int testNumbers[8] = { 120, {{veryExpensivePrice}}, {{veryExpensivePrice}} - 1, {{expensivePrice}},
                          {{expensivePrice}} - 1, {{goodPrice}}, {{goodPrice}} - 1, 3 };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 8; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing for correct output for " << testNumbers[i];
      testSolutionCode(testNumbers[i]);
      string solution = zyGetOutput();

      testStudentCode(testNumbers[i]);

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,
                parameters: {
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zyPrice',
                    givenPriceParam: 'zyPrice',
                },
            },
        },
        {
            prompt: `Print "userNum1 is negative." if userNum1 is less than 0. End with newline.\n
Assign 0 to userNum2 if userNum2 is greater than {{number}}. Otherwise, print "userNum2 is less or equal {{number}}.". End with newline.`,
            explanation: 'A possible solution uses an if statement for userNum1, and an if-else statement for userNum2.',
            solution: {
                code: `
   if (userNum1 < 0) {
      cout << "userNum1 is negative." << endl;
   }

   if (userNum2 > {{number}}) {
      userNum2 = 0;
   }
   else {
      cout << "userNum2 is less or equal {{number}}." << endl;
   }
`,
                show: false,
            },
            parameters: {
                number: [ 8, 9, 10, 11, 12 ],
                userNum1: [ -1, 0, 1 ],
                userNum2: [ 6, 7, 13, 14 ],
            },
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        main: 'int main() {\n',
                        prefix: '   int userNum1 = {{userNum1}};\n   int userNum2 = {{userNum2}};\n\n   ',
                        student: '   <STUDENT_CODE>',
                        postfix: '\n   cout << "userNum2 is " << userNum2 << endl;\n\n',
                        returnStatement: '   return 0;\n}\n'
                    }
                }
            ],
            test: {
                main: `
   int userNum1[3] = { 0, -1, 1 };
   int userNum2[3] = { {{number}} + 1, {{number}}, -2 };

   stringstream whatIsTested;
   for (unsigned int i = 0; i < 3; i++) {
      whatIsTested.str(string());
      whatIsTested << "Testing for correct output for userNum1 = " << userNum1[i] << " and userNum2 = " << userNum2[i];
      testSolutionCode(userNum1[i], userNum2[i]);
      string solution = zyGetOutput();

      testStudentCode(userNum1[i], userNum2[i]);

      zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);
   }

   zyTerminate();`,

                parameters: {
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zyNumber1, int zyNumber2',
                    userNum1: 'zyNumber1',
                    userNum2: 'zyNumber2',
                }
            },
        }
    ]
}
