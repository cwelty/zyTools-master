/* global buildLevelFactory, testPropertiesArePresent */
'use strict';

$(document).ready(() => {
    const javaLevelFactory = buildLevelFactory();
    const javaLevel = javaLevelFactory.make(0);
    const properties = [ 'prompt', 'explanation', 'solutionCode', 'language', 'testCodeTemplate', 'levelParameters', 'testParameters',
                         'testBoilerplate', 'files', 'serverRequestPromise', 'utilities', 'cantReachServer', 'questionFiles',
                         'runParameters', 'compilationParameters', 'accessible', 'rejectPreviousRequest', 'stopServerRequest',
                         'isServerRequestRejected', 'runLevel', '_makeProgram', '_makeTestProgram', '_compileAndRun', 'userCode',
                         'testCode', 'getTestResults' ];

    javaLevel.runLevel('   System.out.println("testing...");');

    // Test all the LevelTemplate properties are present
    QUnit.test('Level properties.', assert => {
        testPropertiesArePresent(javaLevel, properties, assert);
    });

    // The results are returned by the server with this format.
    const runResults1 = `SYSTEM_MESSAGE_BEGINPASSTesting with origList = [30, 40, 50] and offsetAmount = [3, 4, 5]
Expected output:\nSPANBEGIN33 44 55 \nSPANENDSYSTEM_MESSAGE_END\n
SYSTEM_MESSAGE_BEGINPASSTesting with origList = [50, 60, 70, 80, 90] and offsetAmount = [5, 6, 7, 8, 9]
Expected output:\nSPANBEGIN55 66 77 88 99 \nSPANENDSYSTEM_MESSAGE_END\n\nSYSTEM_MESSAGE_BEGINENDSYSTEM_MESSAGE_END\n`;
    const programResults1 = [
        {
            expectedOutput: '33 44 55 \n',
            whatWasTested: 'Testing with origList = [30, 40, 50] and offsetAmount = [3, 4, 5]',
            userOutput: '33 44 55 \n',
            passed: true,
        },
        {
            expectedOutput: '55 66 77 88 99 \n',
            whatWasTested: 'Testing with origList = [50, 60, 70, 80, 90] and offsetAmount = [5, 6, 7, 8, 9]',
            userOutput: '55 66 77 88 99 \n',
            passed: true,
        },
    ];

    // The results are returned by the server with this format.
    const runResults2 = `SYSTEM_MESSAGE_BEGINFAILTesting with 10 Houses
Expected output:\nSPANBEGINThere are 10 Houses.\nSPANEND\nYour output:\nSPANBEGINThere are 40 Houses.\nSPANENDSYSTEM_MESSAGE_END
SYSTEM_MESSAGE_BEGINFAILTesting with 30 Houses\nExpected output:\nSPANBEGINThere are 30 Houses.\nSPANEND\nYour output:
SPANBEGINThere are 40 Houses.\nSPANENDSYSTEM_MESSAGE_END\nSYSTEM_MESSAGE_BEGINPASSTesting with 40 Houses\nExpected output:
SPANBEGINThere are 40 Houses.\nSPANENDSYSTEM_MESSAGE_END\nSYSTEM_MESSAGE_BEGINENDSYSTEM_MESSAGE_END\n`;
    const programResults2 = [
        {
            expectedOutput: 'There are 10 Houses.\n',
            whatWasTested: 'Testing with 10 Houses',
            userOutput: 'There are 40 Houses.\n',
            passed: false,
        },
        {
            expectedOutput: 'There are 30 Houses.\n',
            whatWasTested: 'Testing with 30 Houses',
            userOutput: 'There are 40 Houses.\n',
            passed: false,
        },
        {
            expectedOutput: 'There are 40 Houses.\n',
            whatWasTested: 'Testing with 40 Houses',
            userOutput: 'There are 40 Houses.\n',
            passed: true,
        },
    ];

    QUnit.test('Results are interpreted correctly', assert => {
        assert.deepEqual(javaLevel.getTestResults(runResults1), programResults1);
        assert.deepEqual(javaLevel.getTestResults(runResults2), programResults2);
    });

    const userCode = `import java.util.Scanner;\n\npublic class HelloWorld {\n   public static void main (String [] args) {
      System.out.println("Hello world!");\n   System.out.println("testing...");\n\n      System.out.println("Hello to you too");\n
      return;\n   }\n}\n`;
    const testCode = `import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.nio.charset.Charset;
import java.util.Scanner;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Random;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Scanner;



public class main {
    public static final String SYSTEM_MESSAGE_BEGIN = "SYSTEM_MESSAGE_BEGIN";
    public static final String SYSTEM_MESSAGE_END = "SYSTEM_MESSAGE_END";

    public static void zyInitialize() {
        PrintStreamOverride pso = new main().new PrintStreamOverride(System.out);
        System.setOut(pso);
    }

    public static void zyTerminate() {
        out(SYSTEM_MESSAGE_BEGIN + "END" + SYSTEM_MESSAGE_END + "\\n");
    }

    public static String zyGetOutput() {
        // Retrieve the output collected thus far.
        PrintStreamOverride pso = (PrintStreamOverride)System.out;
        String output = pso.stored_output;

        pso.stored_output = "";

        return output;
    }

    public static void zyAssertOutput(String asserted_output,
                                      String hint,
                                      boolean stripspace,
                                      boolean case_insensitive,
                                      boolean exit_on_fail,
                                      boolean suppress) {
        PrintStreamOverride pso = (PrintStreamOverride)System.out;
        String output = zyGetOutput();

        // Strip spaces if necessary.
        if (stripspace) {
            output = output.replaceAll("\\\\s","");
            asserted_output = asserted_output.replaceAll("\\\\s","");
        }

        // Lowercase strings if necessary.
        if (case_insensitive) {
            output = output.toLowerCase();
            asserted_output = asserted_output.toLowerCase();
        }

        // Swap out empty output for "(none)".
        String _asserted_output = asserted_output.length() == 0 ? "(none)" : asserted_output;

        // Check the output for correctness.
        if (!output.equals(asserted_output)) {
            out(SYSTEM_MESSAGE_BEGIN + "FAIL" + hint +
                "\\nExpected output:\\nSPANBEGIN" + _asserted_output +
                "SPANEND\\nYour output:\\nSPANBEGIN" + output +
                "SPANEND" + SYSTEM_MESSAGE_END + "\\n");

            if (exit_on_fail) {
                out(SYSTEM_MESSAGE_BEGIN + "EXIT" + SYSTEM_MESSAGE_END);
                System.exit(1);
            }
        } else {
            out(SYSTEM_MESSAGE_BEGIN + "PASS" + hint +
                "\\nExpected output:\\nSPANBEGIN" + _asserted_output +
                "SPANEND" + SYSTEM_MESSAGE_END + "\\n\\n");
        }

        pso.stored_output = "";
    }

    public static void zyAssertIntValue(int asserted_value,
                                        int actual_value,
                                        String hint,
                                        boolean exit_on_fail,
                                        boolean suppress) {
        if (asserted_value != actual_value) {
            if (!suppress) {
                out(SYSTEM_MESSAGE_BEGIN + "FAIL" + hint +
                    "\\nExpected value:\\nSPANBEGIN" + asserted_value +
                    "SPANEND\\nYour value:\\nSPANBEGIN" + actual_value +
                    "SPANEND" + SYSTEM_MESSAGE_END + "\\n");
            } else {
                out(SYSTEM_MESSAGE_BEGIN + "FAIL" +
                    hint + "\\nYour value:\\nSPANBEGIN" + actual_value +
                    "SPANEND" + SYSTEM_MESSAGE_END + "\\n");
            }

            if (exit_on_fail) {
                out(SYSTEM_MESSAGE_BEGIN + "EXIT" + SYSTEM_MESSAGE_END);
                System.exit(1);
            }
        } else {
            out(SYSTEM_MESSAGE_BEGIN + "PASS" + hint +
                "\\nExpected value:\\nSPANBEGIN" + asserted_value +
                "SPANEND" + SYSTEM_MESSAGE_END + "\\n");
        }
    }

    public static void zyAssertDoubleValue(double asserted_value,
                                           double actual_value,
                                           double epsilon,
                                           String hint,
                                           boolean exit_on_fail,
                                           boolean suppress) {
        if (Math.abs(asserted_value - actual_value) > epsilon) {
            if (!suppress) {
                out(SYSTEM_MESSAGE_BEGIN + "FAIL" + hint +
                    "\\nExpected value: SPANBEGIN" + asserted_value +
                    "SPANEND\\nYour value:     SPANBEGIN" + actual_value +
                    "SPANEND" + SYSTEM_MESSAGE_END);
            } else {
                out(SYSTEM_MESSAGE_BEGIN + "FAIL" + hint +
                    "\\nYour value: SPANBEGIN" + actual_value +
                    "SPANEND" + SYSTEM_MESSAGE_END);
            }

            if (exit_on_fail) {
                out(SYSTEM_MESSAGE_BEGIN + "EXIT" + SYSTEM_MESSAGE_END);
                System.exit(1);
            }
        } else {
            out(SYSTEM_MESSAGE_BEGIN + "PASS" + hint +
                "\\nExpected value: SPANBEGIN" + asserted_value +
                "SPANEND" + SYSTEM_MESSAGE_END + "\\n");
        }
    }

    public static void out(String output) {
        PrintStreamOverride pso = (PrintStreamOverride)System.out;
        pso.output(output);
    }

    public class PrintStreamOverride extends java.io.PrintStream {
        public String stored_output = "";

        public PrintStreamOverride(OutputStream output) {
            super(output);
        }

        public void output(String s) {
            super.print(s);
        }

        public void println() {
            stored_output += "\\n";
        }

        public void println(String s) {
            stored_output += s + "\\n";
        }

        public void print(String s) {
            stored_output += s;
        }

        public void println(int i) {
            stored_output += i + "\\n";
        }

        public void print(int i) {
            stored_output += i;
        }

        public void println(boolean b) {
            stored_output += b + "\\n";
        }

        public void print(boolean b) {
            stored_output += b;
        }

        public void println(char c) {
            stored_output += c + "\\n";
        }

        public void print(char c) {
            stored_output += c;
        }

        public void println(char[] c) {
            for (int i = 0; i < c.length; ++i) {
                stored_output += c[i];
            }
            stored_output += "\\n";
        }

        public void print(char[] c) {
            for (int i = 0; i < c.length; ++i) {
                stored_output += c[i];
            }
        }

        public void println(double d) {
            stored_output += d + "\\n";
        }

        public void print(double d) {
            stored_output += d;
        }

        public void println(float f) {
            stored_output += f + "\\n";
        }

        public void print(float f) {
            stored_output += f;
        }

        public void println(long l) {
            stored_output += l + "\\n";
        }

        public void print(long l) {
            stored_output += l;
        }

        public void println(Object o) {
            stored_output += String.valueOf(o) + "\\n";
        }

        public void print(Object o) {
            stored_output += String.valueOf(o);
        }
    }

    public static void testStudentCode(String zyInput) {

        InputStream inStream = new ByteArrayInputStream(zyInput.getBytes(Charset.forName(\"UTF-8\")));
        System.setIn(inStream);

          System.out.println("Hello testing!");
   System.out.println("testing...");

      System.out.println("Hello to you too");
    }

    public static void testSolutionCode(String zyInput) {

        InputStream inStream = new ByteArrayInputStream(zyInput.getBytes(Charset.forName(\"UTF-8\")));
        System.setIn(inStream);

          System.out.println("Hello testing!");
      Scanner scnr = new Scanner(System.in);
      int userNum = scnr.nextInt();
      System.out.println("Awesome!" + userNum);

      System.out.println("Hello to you too");
    }

   public static void main (String [] args) {

    \n      zyInitialize();
      testSolutionCode("5 5");
      String solution = zyGetOutput();

      testStudentCode("5 5");

      zyAssertOutput(solution, "Testing ProgrammingProgression", false, false, false, false);
      zyTerminate();
    \n
      return;
   }
}

`;

    QUnit.test('Level.userCode and Level.testCode are correctly generated.', assert => {
        assert.strictEqual(javaLevel.userCode, userCode);
        assert.strictEqual(javaLevel.testCode, testCode);
    });

    const expectedResult = [ { expectedOutput: 'Hello testing!\nAwesome!5\nHello to you too\n',
                               passed: false,
                               userOutput: 'Hello testing!\ntesting...\nHello to you too\n',
                               whatWasTested: 'Testing ProgrammingProgression',
                            } ];

    QUnit.asyncTest('Run level to test solution.', assert => {
        javaLevel.serverRequestPromise.then(programResult => {
            assert.deepEqual(programResult, expectedResult, 'Running level produced the correct result');
            QUnit.start();
        });
    });

    const javaLevel2 = javaLevelFactory.make(0);
    const javaCodeRuntimeError = `      final int NUM_VALS = 4;
      int[] origList = new int[NUM_VALS];
      int i = 0;

      for (i = 0; i > -2; i--) {
         System.out.print(origList[i]);
     }`;

    javaLevel2.runLevel(javaCodeRuntimeError);

    let result = 'Runtime error (commonly due to an invalid array/vector access, divide by 0, etc.).\nProgram returned: \n\n';

    result += `Hello world!
0Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException: -1
\tat HelloWorld.main(HelloWorld.java:11)\n`;
    const expectedResult2 = [ { error: true, result, when: 'run', isUserEnteredCode: true } ];

    QUnit.asyncTest('Run level to test runtime error.', assert => {
        javaLevel2.serverRequestPromise.then(programResult => {
            assert.deepEqual(programResult, expectedResult2, 'Error raised as expected');
            QUnit.start();
        });
    });
});
