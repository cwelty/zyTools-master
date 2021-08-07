/* exported getParameters, getJavaProgramFile, getCProgramFile, getCppProgramFile, buildLevelTemplate, buildLevelFactory,
   testPropertiesArePresent */
/* global ProgramFile, LevelTemplate, LevelFactory, addEditableWhitespace */
'use strict';

/**
    Returns a parameter for testing.
    @method getParameters
    @return {Object} The parameters. In this case a parameter named word with a single possible value 'world'.
*/
function getParameters() {
    return {
        word: [ 'world' ],
        coolSuperheroes: [ 'Iron Man', 'Batman', 'Flash', 'Superman' ],
    };
}

/**
    Builds and returns a Java ProgramFile object.
    @method getJavaProgramFile
    @return {ProgramFile} A Java ProgramFile object.
*/
function getJavaProgramFile() {
    const javaProgramParts = {
        headers: 'import java.util.Scanner;\n\n',
        classDefinition: 'public class HelloWorld {\n',
        main: '   public static void main (String [] args) {\n',
        prefix: '      System.out.println("Hello {{word}}!");\n',
        student: '<STUDENT_CODE>',
        postfix: '\n\n      System.out.println("Hello to you too");',
        returnStatement: '\n\n      return;\n   }\n}\n',
    };

    return new ProgramFile('HelloWorld.java', javaProgramParts, getParameters());
}

/**
    Builds and returns a C ProgramFile object.
    @method getCProgramFile
    @return {ProgramFile} A C ProgramFile object.
*/
function getCProgramFile() {
    const cProgramParts = {
        headers: '#include <stdio.h>\n\n',
        main: 'int main(void) {\n',
        student: '<STUDENT_CODE>',
        postfix: '\n\n   printf("Hello to you too {{word}}");',
        returnStatement: '\n\n   return 0;\n}\n',
    };

    return new ProgramFile('HelloWorld.c', cProgramParts, {});
}

/**
    Builds and returns a C++ ProgramFile object.
    @method getCppProgramFile
    @return {ProgramFile} A C++ ProgramFile object.
*/
function getCppProgramFile() {
    const cppProgramParts = {
        headers: '#include <iostream>\nusing namespace std;\n\n',
        main: 'int main() {\n',
        prefix: '   cout << "Hello {{word}}!";\n',
        student: '<STUDENT_CODE>',
        returnStatement: '\n\n   return 0;\n}\n',
    };

    return new ProgramFile('HelloWorld.cpp', cppProgramParts, getParameters());
}

/**
    Build a sample {LevelTemplate} object.
    @method buildLevelTemplate
    @return {LevelTemplate}
*/
function buildLevelTemplate() { // eslint-disable-line max-params
    const javaProgramFile = getJavaProgramFile();
    const javaProgramParts = javaProgramFile.programParts;
    const javaFiles = [ { filename: 'HelloWorld.java', program: javaProgramParts } ];
    const parameters = getParameters();

    const language = 'java';
    const prompt = 'Level prompt:\n<pre>I am prompting</pre>';
    const explanation = 'That was awesome!';
    const solutionCode = `      Scanner scnr = new Scanner(System.in);
      int userNum = scnr.nextInt();
      System.out.println("Awesome!" + userNum);`;

    const testProgram = `
      zyInitialize();
      testSolutionCode("{{programInput}}");
      String solution = zyGetOutput();

      testStudentCode("{{programInput}}");

      zyAssertOutput(solution, "Testing ProgrammingProgression", false, false, false, false);
      zyTerminate();`;
    const test = {
        parameters: {
            word: 'testing',
            programInput: '5 5',
        },
        main: testProgram,
    };

    return new LevelTemplate(language, prompt, explanation, solutionCode, parameters, javaFiles, test);
}

/**
    Build a sample {LevelFactory} object.
    @method buildLevelFactory
    @return {LevelFactory}
*/
function buildLevelFactory() {
    const levelTemplate = buildLevelTemplate();

    return new LevelFactory([ levelTemplate ]);
}

/**
    Test that all the expected properties are present.
    @method testPropertiesArePresent
    @param {Object} object The object that should contain the properties.
    @param {Array} properties The names of each property.
    @param {QUnit.assert} assert The assert object.
    @return {void}
*/
function testPropertiesArePresent(object, properties, assert) {
    properties.forEach(property => assert.ok(property in object));
}


$(document).ready(() => {
    QUnit.test('Test addEditableWhitespace', assert => {
        const prefix = 'Pre\nfix\n\n   ';
        const postfix = '   \n   \n\n   Post\nfix\n   \n';
        const placeholder = '   /* Placeholder */   \n';
        const prefixPostfixPlaceholder = addEditableWhitespace(prefix, postfix, placeholder);

        assert.strictEqual(prefixPostfixPlaceholder.prefix, 'Pre\nfix\n');
        assert.strictEqual(prefixPostfixPlaceholder.postfix, '\n   Post\nfix\n\n');
        assert.strictEqual(prefixPostfixPlaceholder.placeholder, '\n      /* Placeholder */\n\n');
    });

    QUnit.test('Test addEditableWhitespace', assert => {
        const prefix = '\n   for(   ';
        const postfix = '   ) {\n   return 0;\n';
        const placeholder = '/* Placeholder */   ';
        const prefixPostfixPlaceholder = addEditableWhitespace(prefix, postfix, placeholder);

        assert.strictEqual(prefixPostfixPlaceholder.prefix, '\n   for(');
        assert.strictEqual(prefixPostfixPlaceholder.postfix, '   ) {\n   return 0;\n');
        assert.strictEqual(prefixPostfixPlaceholder.placeholder, '   /* Placeholder */   ');
    });

    QUnit.test('Test addEditableWhitespace', assert => {
        const prefix = 'if( a > b) {\n';
        const postfix = '\n}\n return 0;';
        const placeholder = '/* Placeholder */';
        const prefixPostfixPlaceholder = addEditableWhitespace(prefix, postfix, placeholder);

        assert.strictEqual(prefixPostfixPlaceholder.prefix, 'if( a > b) {\n');
        assert.strictEqual(prefixPostfixPlaceholder.postfix, '\n}\n return 0;');
        assert.strictEqual(prefixPostfixPlaceholder.placeholder, '\n/* Placeholder */\n');
    });
});
