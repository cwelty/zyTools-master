{
    exam: true,
    levels: [
        {
            parameters: {
                variableName: [ 'userAge', 'userNum', 'numTickets', 'numItems', 'numObjects' ]
            },
            prompt: 'Write a statement that outputs variable {{variableName}}.',
            code: {
                pre: `integer {{variableName}}

// Program will be tested with inputs: 15 and 40
{{variableName}} = Get next input
`,
            },
            solution: 'Put {{variableName}} to output',
            inputs: [
                { input: '15', points: 1 },
                { input: '40', points: 2 },
            ],
        }
    ],
}