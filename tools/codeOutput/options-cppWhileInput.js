{
    language:  'cpp',
    levels: [
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   int currValue;\n   int valuesSum;\n   int numValues;\n\n   valuesSum = 0;\n   numValues = 0;\n   cin >> currValue;\n\n   while (currValue > 0) {\n      valuesSum = valuesSum + currValue;\n      numValues = numValues + 1;\n      cin >> currValue;\n   }\n\n   cout << "Average: " << (valuesSum / numValues) << endl;\n\n   return 0;\n}',
            parameters: {
                number: [ 10, 5, 15 ],
            },
            explanation: 'This uses author defined input. The input can contain a parameter (the fifth number is a parameter).',
            input: '10 1 6 3 {{number}} 0'
        },
    ]
}
