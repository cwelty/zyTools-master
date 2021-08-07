{
    language: 'java',
    levels: [
        {
            prompt: `{{operator.operationName}} each element in origList with the corresponding value in offsetAmount. Print each {{operator.operating}} followed by a space. Use two print statements.
                     Ex: If origList = {4, 5, 10, 12} and offsetAmount = {2, 4, 7, 3}, print:\n
                     <pre>{{operator.example}}</pre>`,
            explanation: 'A for loop can be used to iterate through the arrays adding the corresponding values.',
            solution: {
                code: `
      for (i = 0; i < NUM_VALS; ++i) {
         System.out.print(origList[i] {{operator.symbol}} offsetAmount[i]);
         System.out.print(" ");
      }
`,
                show: true,
            },
            parameters: {
                operator: [ { operationName: [ 'Add' ], operating: [ 'addition' ], symbol: [ '+' ], example: [ '6 9 17 15 ' ] },
                            { operationName: [ 'Subtract' ], operating: [ 'subtraction' ], symbol: [ '-' ], example: [ '2 1 3 9 ' ] },
                            { operationName: [ 'Multiply' ], operating: [ 'multiplication' ], symbol: [ '*' ], example: [ '8 20 70 36 ' ] } ],
                NUM_VALS: [ 4 ],
                origListInit: [ 'origList[0] = 20;\n      origList[1] = 30;\n      origList[2] = 40;\n      origList[3] = 50;' ],
                offsetAmountInit: [ 'offsetAmount[0] = 5;\n      offsetAmount[1] = 7;\n      offsetAmount[2] = 3; \n      offsetAmount[3] = 4;' ],
            },
            files: [
                {
                    filename: 'SumVectorElements.java',
                    program: {
                        headers: 'import java.util.Scanner;\n\n',
                        classDefinition: 'public class SumVectorElements {\n',
                        main: '   public static void main (String [] args) {',
                        prefix: `
      final int NUM_VALS = {{NUM_VALS}};
      int[] origList = new int[NUM_VALS];
      int[] offsetAmount = new int[NUM_VALS];
      int i = 0;

      {{origListInit}}

      {{offsetAmountInit}}
      `,
                        student: '<STUDENT_CODE>',
                        postfix: '\n\n      System.out.println("");',
                        returnStatement: '\n\n      return;\n   }\n}\n',
                    },
                }
            ],
            test: {
                 parameters: {
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zyNUM_VALS, int[] zyOrigList, int[] zyOffsetAmount',
                    NUM_VALS: 'zyNUM_VALS',
                    origListInit: 'origList = zyOrigList;',
                    offsetAmountInit: 'offsetAmount = zyOffsetAmount;',
                },
                main: `
      zyInitialize();

      int[] testOrigList;
      int[] testOffsetAmount;

      for (int i = 3; i <= 5; i++) {
         testOrigList = new int[i];
         testOffsetAmount = new int[i];
         for (int j = 0; j < i; j++) {
            testOrigList[j] = i * 10 + j * 10;
            testOffsetAmount[j] = i + j;
         }

         String whatIsTested = "Testing with origList = " + Arrays.toString(testOrigList) + " and offsetAmount = " + Arrays.toString(testOffsetAmount);

         testSolutionCode(i, testOrigList, testOffsetAmount);
         String solution = zyGetOutput();

         testStudentCode(i, testOrigList, testOffsetAmount);

         zyAssertOutput(solution, whatIsTested, false, false, false, false);
      }
      zyTerminate();`,
            },
        },
        {
            prompt: `For any element in keysList with a value {{conditional.condition}} than {{value}}, print the corresponding value in itemsList, followed by a space.
                     Ex: If keysList = {32, 105, 101, 35} and itemsList = {10, 20, 30, 40}, print:\n
                     <pre>{{conditional.example}}</pre>`,
            explanation: 'A for loop can be used to iterate through the arrays checking the condition on each element and printing the values.',
            solution: {
                code: `
      for (i = 0; i < SIZE_LIST; ++i) {
         if (keysList[i] {{{conditional.operator}}} {{value}}) {
            System.out.print(itemsList[i] + " ");
         }
      }
`,
                show: true,
            },
            parameters: {
                conditional: [ { condition: [ 'greater' ], operator: [ '>' ], example: [ '20 30 ' ] },
                               { condition: [ 'smaller' ], operator: [ '<' ], example: [ '10 40 ' ] } ],
                value: [ 40, 50, 60 ],
                SIZE_LIST: [ 4 ],
                keysListInit: [ 'keysList[0] = 13;\n      keysList[1] = 47;\n      keysList[2] = 71;\n      keysList[3] = 59;' ],
                itemsListInit: [ 'itemsList[0] = 12;\n      itemsList[1] = 36;\n      itemsList[2] = 72; \n      itemsList[3] = 54;' ],
            },
            files: [
                {
                    filename: 'ArraysKeyValue.java',
                    program: {
                        headers: 'import java.util.Scanner;\n\n',
                        classDefinition: 'public class ArraysKeyValue {\n',
                        main: '   public static void main (String [] args) {\n',
                        prefix: `      final int SIZE_LIST = {{SIZE_LIST}};
      int[] keysList = new int[SIZE_LIST];
      int[] itemsList = new int[SIZE_LIST];
      int i = 0;

      {{keysListInit}}\n
      {{itemsListInit}}\n      `,
                        student: '<STUDENT_CODE>',
                        postfix: '\n\n      System.out.println("");',
                        returnStatement: '\n\n      return;\n   }\n}\n',
                    }
                }
            ],
            test: {
                main: `
      zyInitialize();

      int sizeList = 4;
      int[] testKeysList = new int[sizeList];
      int[] testItemsList = new int[sizeList];

      for (int i = 0 ; i < 3; i ++) {
         switch(i) {
            case 0:
               sizeList = 4;
               testKeysList = new int[] {23, 85, 40, 50};
               testItemsList = new int[] {10, 20, 30, 40};
               break;
            case 1:
               sizeList = 2;
               testKeysList = new int[] {23, 12};
               testItemsList = new int[] {14, -11};
               break;
            case 2:
               sizeList = 10;
               testKeysList = new int[] {41, 82, 68, 51, 60, 32, 12, 61, 88, 123};
               testItemsList = new int[] {1, 2, 17, 98, 75, 96, 3, 492, -14, -11};
               break;
         }

         String whatIsTested = "Testing with keysList = " + Arrays.toString(testKeysList) + " and itemsList = " + Arrays.toString(testItemsList);

         testSolutionCode(sizeList, testKeysList, testItemsList);
         String solution = zyGetOutput();

         testStudentCode(sizeList, testKeysList, testItemsList);
         zyAssertOutput(solution, whatIsTested, false, false, false, false);
      }
      zyTerminate();`,
                parameters: {
                    testFunctionReturns: 'void',
                    testFunctionParameters: 'int zySIZE_LIST, int[] zyKeysList, int[] zyItemsList',
                    SIZE_LIST: 'zySIZE_LIST',
                    keysListInit: 'keysList = zyKeysList;',
                    itemsListInit: 'itemsList = zyItemsList;',
                },
            },
        },
    ]
}
