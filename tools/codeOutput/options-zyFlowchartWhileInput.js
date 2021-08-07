{
    language:  'zyFlowchart',
    levels: [
        {
            template:   'integer currValue\ninteger valuesSum\n\nvaluesSum = 0\ncurrValue = Get next input\n\nwhile currValue > 0\n   valuesSum = valuesSum + currValue\n   currValue = Get next input\n\nPut "Sum: " to output\nPut valuesSum to output',
            parameters: {
                number: [ 10, 5, 15 ],
            },
            explanation: 'This uses author defined input. The input can contain a parameter (the fifth number is a parameter).',
            input: '10 1 6 3 {{number}} 0'
        },
    ]
}
