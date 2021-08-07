{
    language: 'python3',
    levels: [
        {
            prompt: 'Write a statement that prints the following on a single output line:\n<code>{{prompt}}</code>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'Use print() to print text.',
            solution: "print('{{prompt}}')",
            parameters: {
                prompt: ['3 2 1 Go!', 'Ready, Set, Go!', 'Hello world! How are you?', 'This is awesome!', 'I love this job', 'I like how you think', 'To be or not to be', 'So be it', 'My name is Bob', 'My name is May', 'I feel great today' ],
            },
        },

        {
            prompt: 'Write code that prints the following:\n<pre>{{letter1}}{{number1}}\n{{letter2}}{{number2}}\n</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'You can use multiple print() statements.',
            solution: "print('{{letter1}}{{number1}}')\nprint('{{letter2}}{{number2}}')",
            parameters: {
                letter1: [ 'A', 'B', 'C', 'D' ],
                letter2: [ 'E', 'F', 'G', 'H' ],
                number1: [ '1', '2', '3', '4' ],
                number2: [ '5', '6', '7', '8' ],
            },
        }
    ]
}
