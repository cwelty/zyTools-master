{
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
            explanation: 'The string literal is put to output.',
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
            explanation: 'The newline character \\n creates a newline.',
        },
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
            inputs: [ '15', '40' ],
            explanation: '{{variableName}}\'s value is put to output. Note that there are no quotes around the variable\'s name.',
        },
        {
            parameters: {
                name: [
                    { plain: 'cars', variable: 'numCars' },
                    { plain: 'cups', variable: 'numCups' },
                    { plain: 'cats', variable: 'numCats' },
                    { plain: 'dogs', variable: 'numDogs' },
                    { plain: 'pens', variable: 'numPens' },
                    { plain: 'mugs', variable: 'numMugs' },
                ]
            },
            prompt: `Write code that outputs variable {{name.variable}} as:
&lt;pre&gt;There are 10 {{name.plain}}.&lt;/pre&gt;
when {{name.variable}} is assigned with 10.`,
            code: {
                pre: `integer {{name.variable}}

// Program will be tested with inputs: 2 and 5
{{name.variable}} = Get next input
`
            },
            solution: `Put "There are " to output
Put {{name.variable}} to output
Put " {{name.plain}}." to output`,
            inputs: [ '2', '5' ],
            explanation: 'Putting both string literal and variable to output can be achieved with multiple Put statements.',
        },
        {
            parameters: {
                separator: [
                    { name: ' slash', symbol: '/' },
                    { name: ' dash', symbol: '-' },
                    { name: 'n underscore', symbol: '_' },
                ],
                variables: [
                    { month: 'birthMonth', year: 'birthYear' },
                    { month: 'monthBorn', year: 'yearBorn' },
                    { month: 'firstMonth', year: 'firstYear' },
                ]
            },
            prompt: `Write two statements to get input values into {{variables.month}} and {{variables.year}}. Then write code to output the month, a{{separator.name}}, and the year.
The program will be tested with inputs 1 2000, and then with inputs 5 1950. Ex: If the input is &lt;pre&gt;1 2000&lt;/pre&gt;, the output is:
&lt;pre&gt;1{{separator.symbol}}2000&lt;/pre&gt;`,
            code: {
                pre: `integer {{variables.month}}
integer {{variables.year}}
`,
                post: `
Put {{variables.year}} to output`
            },
            solution: `{{variables.month}} = Get next input
{{variables.year}} = Get next input

Put {{variables.month}} to output
Put "{{separator.symbol}}" to output`,
            inputs: [ '1 2000', '5 1950' ],
            explanation: 'First, assign {{variables.month}} with the next input, then assign {{variables.year}} with the next input. Then, put the value of {{variables.month}} to output, then "{{separator.symbol}}", then the value of {{variables.year}}.',
        },
    ],
}