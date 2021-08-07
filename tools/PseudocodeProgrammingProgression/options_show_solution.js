{
    showSolution: true,
    levels: [
        {
            parameters: {
                string: [
                    '3 2 1 Go!', 'Ready, Set, Go!', 'Hello world! How are you?', 'This is awesome!', 'I love this job',
                    'I like how you think', 'To be or not to be', 'So be it', 'My name is Bob', 'My name is May', 'I feel great today',
                ],
            },
            prompt: `Write a statement that outputs:
&lt;pre&gt;{{string}}&lt;/pre&gt;`,
            solution: 'Put "{{string}}" to output',
        },
        {
            parameters: {
                letter1: [ 'A', 'B', 'C', 'D' ],
                letter2: [ 'E', 'F', 'G', 'H' ],
                number1: [ 1, 2, 3, 4 ],
                number2: [ 5, 6, 7, 8 ],
            },
            prompt: `Write a statement that outputs:
&lt;pre&gt;{{letter1}}{{number1}}
{{letter2}}{{number2}}&lt;/pre&gt;`,
            solution: 'Put "{{letter1}}{{number1}}\\n{{letter2}}{{number2}}" to output',
        },
    ],
}
