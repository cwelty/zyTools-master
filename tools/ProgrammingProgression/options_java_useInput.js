{
    language: 'java',
    levels: [
        {
            prompt: `Print userNum.`,
            explanation: 'This options file is to test program input for java.',
            solution: {
                code: `      System.out.println(userNum);`,
                show: true,
            },
            parameters: {
            },
            files: [
                {
                    filename: 'Main.java',
                    program: {
                        headers: 'import java.util.Scanner;\n\n',
                        classDefinition: 'public class Main {\n',
                        main: '   public static void main (String [] args) {',
                        prefix: `
      Scanner scnr = new Scanner(System.in);
      int userNum = scnr.nextInt();\n      `,
                        returnStatement: '\n      return;\n   }\n}\n',
                    },
                }
            ],
            test: {
                 parameters: {
                    programInput: ['54', '6', '7 8 9'],
                },
                main: `
      zyInitialize();
      String whatIsTested = "";
      String solution = "";
      {{#each programInput}}
      whatIsTested = "Testing with input = {{this}}";

      testSolutionCode("{{this}}");
      solution = zyGetOutput();

      testStudentCode("{{this}}");

      zyAssertOutput(solution, whatIsTested, false, false, false, false);
      {{/each}}
      zyTerminate();`,
            },
        },
    ]
}
