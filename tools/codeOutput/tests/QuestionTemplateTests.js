/* global Level */
'use strict';

/**
    Creates the parameters needed for a java {Level} with multiple files.
    @method buildMultipleFileJavaLevel
    @return {Level}
*/
function buildMultipleFileJavaLevel() {
    const template = [
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
        String userName = "{{userName}}";
        Person person1 = new Person();
        person1.setFirstName(userName);
        System.out.print("{{subject}} " + person1.getFirstName());
        return;
    }
}`,
        },
    ];
    const parameters = {
        userName: [ 'Max', 'Sam', 'Bob', 'Joe', 'Ron' ],
        subject: [ 'I am', 'You are', 'He is' ],
    };
    const explanation = 'Explanation';
    const input = '';

    return new Level(template, parameters, 'java', explanation, input);
}

/**
    Creates the parameters needed for a C++ {Level} with a single file.
    @method buildSingleFileCppLevel
    @return {Level}
*/
function buildSingleFileCppLevel() {
    const template = `#include <iostream>
using namespace std;
int main() {
    cout << "{{personName}} is {{personStatus}}.";
    return 0;
}`;
    const parameters = {
        personName: [ 'Ann', 'Sam', 'Bob', 'Joe', 'Ron' ],
        personStatus: [ 'good', 'great', 'nice', 'happy' ],
    };
    const explanation = 'Testing explanation';
    const input = '';

    return new Level(template, parameters, 'cpp', explanation, input);
}

$(document).ready(() => {

    // Create a progression tool instance.
    const multipleFileJavaQuestion = buildMultipleFileJavaLevel();
    const singleFileCppQuestion = buildSingleFileCppLevel();
    const questions = [ multipleFileJavaQuestion, singleFileCppQuestion ];

    // Test if tool properties exist.
    const properties = [
        'explanation',
        'files',
        'language',
        'parameters',
    ];

    QUnit.test('Question Tool Creation', assert => {
        questions.forEach(question => {
            properties.forEach(testProperty => assert.ok((testProperty in question), `Level has property ${testProperty}`));
        });
    });

    QUnit.test('files has one element on single files, and more in multiple files', assert => {
        assert.equal(multipleFileJavaQuestion.files.length, 2, 'Check that template is correctly transformed into files array');    // eslint-disable-line no-magic-numbers
        assert.equal(singleFileCppQuestion.files.length, 1, 'Check that template is correctly transformed into files array');
    });

    QUnit.test('files array correctly forms into ProgramFile objects', assert => {

        // Java multiple file
        assert.equal(typeof multipleFileJavaQuestion.files[0].filename, 'function');
        assert.equal(multipleFileJavaQuestion.files[0].main, true);
        assert.equal(typeof multipleFileJavaQuestion.files[0].program, 'function');
        assert.equal(typeof multipleFileJavaQuestion.files[1].filename, 'function');
        assert.equal(multipleFileJavaQuestion.files[1].main, false);
        assert.equal(typeof multipleFileJavaQuestion.files[1].program, 'function');

        // C++ single file
        assert.equal(typeof singleFileCppQuestion.files[0].filename, 'function');
        assert.equal(singleFileCppQuestion.files[0].main, true);
        assert.equal(typeof singleFileCppQuestion.files[0].program, 'function');
    });
});
