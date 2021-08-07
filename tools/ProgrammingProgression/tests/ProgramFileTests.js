/* global ProgramFile, getJavaProgramFile, getCProgramFile, getCppProgramFile, testPropertiesArePresent */
'use strict';

$(document).ready(() => {
    const javaProgramFile = getJavaProgramFile();
    const cProgramFile = getCProgramFile();
    const cppProgramFile = getCppProgramFile();
    const emptyProgramFile = new ProgramFile('empty.c', {}, {});
    const programFiles = [ javaProgramFile, cProgramFile, cppProgramFile, emptyProgramFile ];

    // Test that all ProgramFile objects have all the expected properties.
    const properties = [ 'filename', 'programParts', 'codeParts', 'codeTemplate',
                         'handlebarsCode', 'program', 'prefixPostfixPlaceholder' ];

    QUnit.test('ProgramFile creation', assert => {
        programFiles.forEach(programFile => {
            testPropertiesArePresent(programFile, properties, assert);
            assert.strictEqual(typeof programFile.handlebarsCode, 'function', 'handlebarsCode is of function type');
        });
    });

    // Test that all the programParts property contain all the elements
    const programParts = [ 'headers', 'classDefinition', 'preProgramDefinitions', 'returnType', 'functionName', 'solutionFunctionName',
                           'parameters', 'functionPrefix', 'functionPostfix', 'main', 'prefix', 'student', 'postfix', 'returnStatement' ];

    QUnit.test('ProgramFile programParts property composition', assert => {
        programFiles.forEach(programFile => {
            testPropertiesArePresent(programFile.programParts, programParts, assert);
        });
    });

    // Test that the parameters are substituted in codeParts
    const javaFinalPrefixPart = '      System.out.println("Hello world!");\n';
    const cppFinalPrefixPart = '   cout << "Hello world!";\n';
    const cFinalPostfixPart = '\n\n   printf("Hello to you too ");';

    QUnit.test('Parameter substitution in code parts', assert => {
        assert.strictEqual(javaProgramFile.codeParts.prefix, javaFinalPrefixPart, 'Java prefix substitutes correctly');
        assert.strictEqual(cppProgramFile.codeParts.prefix, cppFinalPrefixPart, 'C++ prefix substitutes correctly');
        assert.strictEqual(cProgramFile.codeParts.postfix, cFinalPostfixPart, 'C postfix substitutes correctly');
    });

    const javaCodePartsJoined = `import java.util.Scanner;\n\npublic class HelloWorld {\n   public static void main (String [] args) {
      System.out.println("Hello {{word}}!");\n<STUDENT_CODE>\n\n      System.out.println("Hello to you too");\n
      return;\n   }\n}\n`;
    const cCodePartsJoined = `#include <stdio.h>\n\nint main(void) {\n<STUDENT_CODE>\n\n   printf("Hello to you too {{word}}");\n
   return 0;\n}\n`;
    const cppCodePartsJoined = `#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "Hello {{word}}!";
<STUDENT_CODE>\n\n   return 0;\n}\n`;

    // Test that codeTemplate is codeParts joined together
    QUnit.test('Test that the codeTemplate property is a string of all programParts joined.', assert => {
        assert.strictEqual(programFiles[0].codeTemplate, javaCodePartsJoined);
        assert.strictEqual(programFiles[1].codeTemplate, cCodePartsJoined);
        assert.strictEqual(programFiles[2].codeTemplate, cppCodePartsJoined);
    });

    // Test that the |program| property is the final program that is shown to the student
    const javaProgram = `import java.util.Scanner;

public class HelloWorld {
   public static void main (String [] args) {
      System.out.println("Hello world!");
<STUDENT_CODE>

      System.out.println("Hello to you too");

      return;
   }
}\n`;
    const cProgram = `#include <stdio.h>

int main(void) {
<STUDENT_CODE>

   printf("Hello to you too {{word}}");

   return 0;
}\n`;
    const cppProgram = `#include <iostream>
using namespace std;

int main() {
   cout << "Hello world!";
<STUDENT_CODE>

   return 0;
}\n`;

    QUnit.test('Test that the program property is the string of the final program', assert => {
        assert.strictEqual(javaProgramFile.program, javaProgram, 'Java final program is correctly created');
        assert.strictEqual(cProgramFile.program, cProgram, 'C final program is correctly created');
        assert.strictEqual(cppProgramFile.program, cppProgram, 'C++ final program is correctly created');
    });

    const javaPrefix = `import java.util.Scanner;\n\npublic class HelloWorld {\n   public static void main (String [] args) {
      System.out.println("Hello world!");\n`;
    const javaPostfix = '\n\n      System.out.println("Hello to you too");\n\n      return;\n   }\n}\n';
    const cPrefix = '#include <stdio.h>\n\nint main(void) {\n';
    const cPostfix = '\n\n   printf("Hello to you too ");\n\n   return 0;\n}\n';
    const cppPrefix = '#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "Hello world!";\n';
    const cppPostfix = '\n\n   return 0;\n}\n';
    const placeholder = '<STUDENT_CODE>';

    QUnit.test('Test that the prefixPostfixPlaceholder property is correctly built', assert => {
        assert.strictEqual(javaProgramFile.prefixPostfixPlaceholder.prefix, javaPrefix);
        assert.strictEqual(javaProgramFile.prefixPostfixPlaceholder.postfix, javaPostfix);
        assert.strictEqual(javaProgramFile.prefixPostfixPlaceholder.placeholder, placeholder);

        assert.strictEqual(cProgramFile.prefixPostfixPlaceholder.prefix, cPrefix);
        assert.strictEqual(cProgramFile.prefixPostfixPlaceholder.postfix, cPostfix);
        assert.strictEqual(cProgramFile.prefixPostfixPlaceholder.placeholder, placeholder);

        assert.strictEqual(cppProgramFile.prefixPostfixPlaceholder.prefix, cppPrefix);
        assert.strictEqual(cppProgramFile.prefixPostfixPlaceholder.postfix, cppPostfix);
        assert.strictEqual(cppProgramFile.prefixPostfixPlaceholder.placeholder, placeholder);
    });
});
