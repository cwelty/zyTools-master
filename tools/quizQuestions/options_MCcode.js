{
    questions: [
        {
            isMultipleChoice: true,
            question: [
                'What is the output of the following program?',
                {
                    type:    'code',
                    content: '#include &lt;iostream>\nusing namespace std;\n\nint main() {\n   int g = 0;\n\n   while (g &lt;= 3) {\n      cout &lt;&lt; g;\n      g = g + 1;\n   }\n\n   return 0;\n}'
                }
            ],
            choices: ['012', '0123', '01234'],
            answers: ['0123']
        },
        {
            isMultipleChoice: true,
            question:         '2 + 5 = ?',
            choices:          ['7', '5', '3'],
            answers:          ['7']
        },
        {
            isMultipleChoice: true,
            question:         'Which outputs a newline?',
            choices:          [
                {
                    isCode: true,
                    content: '\\n',
                },
                {
                    isCode: true,
                    content: '\\t',
                },
                {
                    isCode: true,
                    content: 'Put "This is my answer" to output',
                },
            ],
            answers: ['\\n'],
        }
    ]
}