/* global Question, ProgramFile, Ember */
'use strict';

/**
    Creates the parameters needed for a C++ {Question} with input.
    @method buildCppInputQuestion
    @return {Question} The question generated.
*/
function buildCppInputQuestion() {
    const code = `#include <iostream>
        using namespace std;

        int main() {
           int currValue;
           int valuesSum;
           int numValues;

           valuesSum = 0;
           numValues = 0;
           cin >> currValue;

           while (currValue > 0) {
              valuesSum = valuesSum + currValue;
              numValues = numValues + 1;
              cin >> currValue;
           }

           cout << "Average: " << (valuesSum / numValues) << endl;

           return 0;
        }`;

    const explanation = 'Testing explanation';
    const language = 'cpp';
    const input = '10 1 6 3 0';
    const files = [ new ProgramFile('main.cpp', true, code) ];

    return new Question(code, explanation, language, input, files);
}

/**
    Creates the parameters needed for a java {Question} with multiple files.
    @method buildMultipleFileJavaQuestion
    @return {Question} The question generated.
*/
function buildMultipleFileJavaQuestion() {
    const code = `public class CallPerson {
    public static void main(String [] args) {
      String userName = "Sam";
      Person person1 = new Person();

      person1.setFirstName(userName);
      System.out.print("I am " + person1.getFirstName());

      return;
    }
    }`;
    const explanation = 'SetFirstName assigns the value in userName to person1\'s firstName member variable.' +
                        ' GetFirstName returns the value of person1\'s firstName.';
    const language = 'java';
    const files = [
        {
            filename: 'Person.java',
            main: null,
            program: `public class Person {
    private String firstName;
    public void setFirstName(String firstNameToSet) {
        firstName = firstNameToSet;
        return;
    }

    public String getFirstName() {
        return firstName;
    }
    }`,
        },
        {
            filename: 'CallPerson.java',
            main: true,
            program: `public class CallPerson {
                public static void main(String [] args) {
                    String userName = "Sam";
                    Person person1 = new Person();
                    person1.setFirstName(userName);
                    System.out.print("I am " + person1.getFirstName());
                    return;
                }
            }`,
        } ];
    const input = '';

    return new Question(code, explanation, language, input, files);
}

/**
    Creates the parameters needed for a C++ {Question} with a single file.
    @method buildSingleFileCppQuestion
    @return {Question} The question generated.
*/
function buildSingleFileCppQuestion() {
    const code = `#include <iostream>
        using namespace std;

        int main() {
            cout << "Ann is great.";
            return 0;
        }`;
    const explanation = 'Testing explanation';
    const language = 'cpp';
    const input = '';
    const files = [ new ProgramFile('main.cpp', true, code) ];

    return new Question(code, explanation, language, input, files);
}

/**
    Creates the parameters needed for a Python {Question}.
    @method buildPythonQuestion
    @param {Number} version What version of Python we're testing. Can be 2 or 3.
    @return {Question}
*/
function buildPythonQuestion(version) {
    const code = 'user_ages = [ 9, 2, 1, 5, 7 ]\nprint (len(user_ages))';

    const explanation = 'len() returns the number of elements in a list. user_ages has 5 elements: 9, 2, 1, 5, 7';
    const language = version === 3 ? `python${version}` : 'python'; // eslint-disable-line no-magic-numbers
    const input = '';
    const files = [ new ProgramFile('main.py', true, code) ];

    return new Question(code, explanation, language, input, files);
}

$(document).ready(() => {

    // Create a progression tool instance.
    const multipleFileJavaQuestion = buildMultipleFileJavaQuestion();
    const singleFileCppQuestion = buildSingleFileCppQuestion();
    const cppInputQuestion = buildCppInputQuestion();
    const python2Question = buildPythonQuestion(2); // eslint-disable-line no-magic-numbers
    const python3Question = buildPythonQuestion(3); // eslint-disable-line no-magic-numbers
    const questions = [ multipleFileJavaQuestion, singleFileCppQuestion, cppInputQuestion, python2Question, python3Question ];
    const parentResource = require('zyWebParentResource').create(3, 'codeOutput'); // eslint-disable-line no-magic-numbers

    questions.forEach(question => question.setExpectedAnswer(parentResource));
    const promises = questions.map(question => question.serverRequestPromise);

    // Test if tool properties exist.
    const properties = [
        'code',
        'explanation',
        'language',
        'expectedAnswer',
    ];

    QUnit.test('Question Tool Creation', assert => {
        questions.forEach(question => {
            properties.forEach(testProperty => assert.ok((testProperty in question), `Question has property ${testProperty}`));
        });
    });

    const numberOfAsyncTests = 5;
    const expectedAnswers = [ 'I am Sam', 'Ann is great.', 'Average: 5\n', '5\n', '5\n' ];

    QUnit.asyncTest('Expected answers are correct (tests that the program compiles and runs as expected)', assert => {
        expect(numberOfAsyncTests);
        QUnit.stop();
        QUnit.stop();
        QUnit.stop();
        QUnit.stop();

        Ember.RSVP.all(promises).then(() => {
            questions.forEach((question, index) => {
                assert.equal(question.expectedAnswer, expectedAnswers[index]);
                QUnit.start();
            });
        });
    });
});
