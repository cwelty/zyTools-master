{
    language: 'cpp',
    levels: [
        {
            prompt: `Write a statement that calls a function named {{function}}, passing the variables {{object.variable}} and {{parameter}}. Assign {{object.variable}} with the value returned by {{function}}.`,
            explanation: 'The {{function}} function returns the struct ProductInfo, which contains multiple related items.',
            solution: {
                code: `{{object.variable}} = {{function}}({{object.variable}}, {{parameter}});`,
                show: false,
            },
            parameters: {
                function: [ 'IncreaseItemQty', 'AddToStock' ],
                parameter: [ 'addQty', 'addStock' ],
                object: [
                    {
                        name: 'Mug',
                        variable: 'mugInfo',
                        programInput: 'Mug 7 Mug 7 Mug 14 Mug 14'
                    },
                    {
                        name: 'Notebook',
                        variable: 'notebookInfo',
                        programInput: 'Notebook 7 Notebook 7 Notebook 14 Notebook 14'
                    },
                    {
                        name: [ 'Computer' ],
                        variable: 'computerInfo',
                        programInput: 'Computer 7 Computer 7 Computer 14 Computer 14'
                    }
                ]
            },
            levelType: 'default',
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\n#include <string>\nusing namespace std;\n\n',
                        preProgramDefinitions: `struct ProductInfo {
   string itemName;
   int itemQty;
};

ProductInfo {{function}} (ProductInfo productToStock, int increaseValue) {
   productToStock.itemQty = productToStock.itemQty + increaseValue;

   return productToStock;
}\n\n`,
                        main: 'int main() {\n',
                        prefix: `   ProductInfo {{object.variable}};
   int {{parameter}} = 10;

   cin >> {{object.variable}}.itemName >> {{object.variable}}.itemQty;
   `,
                        student: '<STUDENT_CODE>',
                        postfix: '\n   cout << "Name: " << {{object.variable}}.itemName << ", stock: " << {{object.variable}}.itemQty << endl;',
                        returnStatement: '\n\n   return 0;\n}\n',
                    },
                }
            ],
            test: {
                main: `
    stringstream whatIsTested;

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{object.name}} 7" << endl;

    testSolutionCode();
    string solution = zyGetOutput();

    testStudentCode();
    zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{object.name}} 14" << endl;

    testSolutionCode();
    solution = zyGetOutput();

    testStudentCode();
    zyAssertOutput(solution, whatIsTested.str(), false, false, false, false);

    zyTerminate();
`,
            },
        },

        {
            prompt: 'Complete the function {{conversion.function}} to convert {{conversion.total}} to {{conversion.conversion}} returning the {{conversion.conversion}} using the {{conversion.struct}} struct. Ex: {{conversion.example}}.',
            explanation: 'Each data member in {{conversion.struct}} is accessed with the dot operator. The return statement will return all data members associated with tempVal.',
            solution: {
                code: `   tempVal.{{conversion.attr1}} = {{conversion.total}} / {{conversion.operator}};
   tempVal.{{conversion.attr2}} = {{conversion.total}} % {{conversion.operator}};

   return tempVal;`,
                show: false,
            },
            parameters: {
                conversion: [
                    {
                        function: 'ConvertToFeetAndInches',
                        total: 'totalInches',
                        conversion: 'feet and inches',
                        struct: 'HeightFtIn',
                        attr1: 'feet',
                        attr2: 'inches',
                        operator: '12',
                        variable: 'studentHeight',
                        example: '14 inches are 2 feet and 2 inches',
                        programInput: '14 14 33 33',
                        test1: '14',
                        test2: '33'
                    },
                    {
                        function: 'ConvertToWeeksAndDays',
                        total: 'totalDays',
                        conversion: 'weeks and days',
                        struct: 'TimeWeekDay',
                        attr1: 'weeks',
                        attr2: 'days',
                        operator: '7',
                        variable: 'elapsedDays',
                        example: '16 days are 2 weeks and 2 days',
                        programInput: '16 16 95 95',
                        test1: '16',
                        test2: '95'
                    },
                    {
                        function: 'ConvertToDecadesAndYears',
                        total: 'totalYears',
                        conversion: 'decades and years',
                        struct: 'TimeDecadesYears',
                        attr1: 'decades',
                        attr2: 'years',
                        operator: '10',
                        variable: 'elapsedYears',
                        example: '24 years are 2 decade and 4 years',
                        programInput: '24 24 136 136',
                        test1: '24',
                        test2: '136'
                    }
                ]
            },
            levelType: 'function',
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        preProgramDefinitions: `struct {{conversion.struct}} {
   int {{conversion.attr1}};
   int {{conversion.attr2}};
};\n\n`,
                        returnType: '{{conversion.struct}} ',
                        functionName: '{{conversion.function}} ',
                        solutionFunctionName: '{{conversion.function}}ZySolution ',
                        parameters: '(int {{conversion.total}}) {',
                        functionPrefix: '\n   {{conversion.struct}} tempVal;\n   ',
                        student: '<STUDENT_CODE>',
                        functionPostfix: '\n}\n\n',
                        main: `int main() {
   {{conversion.struct}} {{conversion.variable}};
   int {{conversion.total}};

   cin >> {{conversion.total}};
   {{conversion.variable}} = {{conversion.function}}({{conversion.total}});
   cout << {{conversion.variable}}.{{conversion.attr1}} << " {{conversion.attr1}} and " << {{conversion.variable}}.{{conversion.attr2}} << " {{conversion.attr2}}" << endl;

   return 0;
}`,
                    },
                }
            ],
            test: {
                main: `
void testStudentCode(){
    {{conversion.struct}} {{conversion.variable}};
    int {{conversion.total}};

    cin >> {{conversion.total}};
    {{conversion.variable}} = {{conversion.function}}({{conversion.total}});
    cout << {{conversion.variable}}.{{conversion.attr1}} << " {{conversion.attr1}} and " << {{conversion.variable}}.{{conversion.attr2}} << " {{conversion.attr2}}" << endl;
}

void testSolutionCode() {
    {{conversion.struct}} {{conversion.variable}};
    int {{conversion.total}};

    cin >> {{conversion.total}};
    {{conversion.variable}} = {{conversion.function}}ZySolution({{conversion.total}});
    cout << {{conversion.variable}}.{{conversion.attr1}} << " {{conversion.attr1}} and " << {{conversion.variable}}.{{conversion.attr2}} << " {{conversion.attr2}}" << endl;
}

void test(string whatIsTested) {
    testSolutionCode();
    string solution = zyGetOutput();
    testStudentCode();
    zyAssertOutput(solution, whatIsTested, false, false, false, false);
}

int main() {
    stringstream whatIsTested;

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{conversion.test1}}" << endl;
    test(whatIsTested.str());

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{conversion.test2}}" << endl;
    test(whatIsTested.str());

    zyTerminate();
    return 0;
}
`,
            },
        },

        {
            prompt: 'Define a function {{kind.function}}, with int parameters {{kind.param1}} and {{kind.param2}}, that returns a struct of type {{kind.struct}}. The function should assign {{kind.struct}}\'s data member {{kind.attr1}} with {{kind.param1}} and {{kind.attr2}} with {{kind.param2}}.',
            explanation: 'Struct variables are treated as any other variable in the function declaration. {{kind.function}} is a function with two integer parameters and returns a {{kind.struct}}.',
            solution: {
                code: `{{kind.struct}} {{kind.function}}ZySolution(int {{kind.attr1}}, int {{kind.attr2}}) {
   {{kind.struct}} tempVal;

   tempVal.{{kind.attr1}} = {{kind.attr1}};
   tempVal.{{kind.attr2}} = {{kind.attr2}};

   return tempVal;
}`,
                show: false,
            },
            parameters: {
                kind: [
                    {
                        function: 'SetHeight',
                        param1: 'feetVal',
                        param2: 'inchesVal',
                        struct: 'HeightFtIn',
                        attr1: 'feet',
                        attr2: 'inches',
                        variable: 'studentHeight',
                        output: '"The student is " << studentHeight.feet << " feet and " << studentHeight.inches << " inches tall."',
                        programInput: '5 7 5 7 4 10 4 10',
                        test1: '5 7',
                        test2: '4 10'
                    },
                    {
                        function: 'SetTime',
                        param1: 'hoursVal',
                        param2: 'minutesVal',
                        struct: 'TimeHrMin',
                        attr1: 'hours',
                        attr2: 'minutes',
                        variable: 'studentLateness',
                        output: '"The student is " << studentLateness.hours << " hours and " << studentLateness.minutes << "minutes late."',
                        programInput: '2 15 2 15 0 27 0 27',
                        test1: '2 15',
                        test2: '0 27'
                    },
                    {
                        function: 'SetBirth',
                        param1: 'monthVal',
                        param2: 'dayVal',
                        struct: 'BirthMonthDay',
                        attr1: 'month',
                        attr2: 'day',
                        variable: 'studentBirthday',
                        output: '"The student was born on " << studentBirthday.month << "/" << studentBirthday.day << "."',
                        programInput: '6 8 6 8 12 24 12 24',
                        test1: '6 8',
                        test2: '12 24'
                    }
                ]
            },
            levelType: 'function',
            files: [
                {
                    filename: 'main.cpp',
                    program: {
                        headers: '#include <iostream>\nusing namespace std;\n\n',
                        preProgramDefinitions: `struct {{kind.struct}} {
   int {{kind.attr1}};
   int {{kind.attr2}};
};\n\n`,
                        student: '<STUDENT_CODE>',
                        main: `\n\nint main() {
   {{kind.struct}} {{kind.variable}};
   int {{kind.attr1}};
   int {{kind.attr2}};

   cin >> {{kind.attr1}} >> {{kind.attr2}};
   {{kind.variable}} = {{kind.function}}({{kind.attr1}}, {{kind.attr2}});
   cout << {{{kind.output}}} << endl;
   return 0;
}
`,
                    },
                }
            ],
            test: {
                main: `
void testStudentCode() {
    {{kind.struct}} {{kind.variable}};
    int {{kind.attr1}};
    int {{kind.attr2}};

    cin >> {{kind.attr1}} >> {{kind.attr2}};
    {{kind.variable}} = {{kind.function}}({{kind.attr1}}, {{kind.attr2}});
    cout << {{{kind.output}}} << endl;
}

void testSolutionCode() {
    {{kind.struct}} {{kind.variable}};
    int {{kind.attr1}};
    int {{kind.attr2}};

    cin >> {{kind.attr1}} >> {{kind.attr2}};
    {{kind.variable}} = {{kind.function}}ZySolution({{kind.attr1}}, {{kind.attr2}});
    cout << {{{kind.output}}} << endl;
}

void test(string whatIsTested) {
    testSolutionCode();
    string solution = zyGetOutput();

    testStudentCode();
    zyAssertOutput(solution, whatIsTested, false, false, false, false);
}

int main() {
    stringstream whatIsTested;

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{kind.test1}}" << endl;
    test(whatIsTested.str());

    whatIsTested.str(string());
    whatIsTested << "Testing with input = {{kind.test2}}" << endl;
    test(whatIsTested.str());

    zyTerminate();
    return 0;
}`,
            },
        },
    ]
}
