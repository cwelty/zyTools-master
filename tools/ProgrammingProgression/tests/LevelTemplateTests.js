/* global buildLevelTemplate, testPropertiesArePresent */
'use strict';

$(document).ready(() => {
    const javaLevelTemplate = buildLevelTemplate();
    const properties = [ 'language', 'prompt', 'solutionCode', 'parameters', 'test', 'testTemplate', 'utilities', 'explanation', 'files' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('LevelTemplate properties.', assert => {
        testPropertiesArePresent(javaLevelTemplate, properties, assert);
        assert.strictEqual(typeof javaLevelTemplate.prompt, 'function');
        assert.strictEqual(typeof javaLevelTemplate.solutionCode, 'function');
        assert.strictEqual(typeof javaLevelTemplate.testTemplate, 'function');
        assert.strictEqual(typeof javaLevelTemplate.explanation, 'function');
    });

    const javaEmptyBoilerplateTemplate = `import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.nio.charset.Charset;
import java.util.Scanner;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Random;
import java.io.PrintWriter;
import java.io.StringWriter;


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

    public static  testStudentCode() {\n\n    \n    }

    public static  testSolutionCode() {\n\n    \n    }\n\n\n    \n    \n`;

    QUnit.test('LevelTemplate handlebars functions.', assert => {
        assert.strictEqual(javaLevelTemplate.prompt({}), 'Level prompt:\n<pre>I am prompting</pre>');
        const expectedSolutionCode = `      Scanner scnr = new Scanner(System.in);
      int userNum = scnr.nextInt();
      System.out.println("Awesome!" + userNum);`;

        assert.strictEqual(javaLevelTemplate.solutionCode({}), expectedSolutionCode);
        assert.strictEqual(javaLevelTemplate.testTemplate({}), javaEmptyBoilerplateTemplate);
        assert.strictEqual(javaLevelTemplate.explanation({}), 'That was awesome!');
    });
});
