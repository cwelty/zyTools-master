{
    language:  'zyPseudocode',
    levels: [
        {
            template:   'Put "{{personName}} is {{personStatus}}." to output',
            parameters: {
                personName:   ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personStatus: ['good', 'great', 'nice', 'happy']
            },
            explanation: 'The string literal "{{personName}} is {{personStatus}}." is put to output.'
        },
        {
            template:   'Put "{{personName}}" to output\nPut " is " to output\nPut "{{personStatus}}." to output',
            parameters: {
                personName:   ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personStatus: ['good', 'great', 'nice', 'happy']
            },
            explanation: 'First, "{{personName}}" is put to output. Then, " is " is put. Then, "{{personStatus}}." is put.'
        },
        {
            template:   'Put "{{personName}}\\n" to output\nPut "is\\n" to output\nPut "{{personStatus}}." to output',
            parameters: {
                personName:   ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personStatus: ['good', 'great', 'nice', 'happy']
            },
            explanation: 'Using \\n starts a new output line.'
        },
        {
            template:   'integer personAge\npersonAge = {{personAge}}\nPut "{{personName}} is " to output\nPut personAge to output\nPut "." to output',
            parameters: {
                personName: ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personAge:  [18, 19, 20, 21, 22, 23, 24]
            },
            explanation: 'The value of the personAge variable is put to output.'
        }
    ]
}
