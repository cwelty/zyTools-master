{
    levels: [
        {
            parameters: {
                max: [ '9', '10', '11', '12' ],
                multiplier: [ '2', '3' ],
            },
            prompt: `&lt;p&gt;Write code that iterates while userNum is less than {{max}}. Each iteration: Put userNum to output. Then, put "_" to output. Then, assign userNum with userNum multiplied by {{multiplier}}.&lt;/p&gt;
&lt;p&gt;Ex: If input is 1, then output is:&lt;/p&gt;
&lt;pre&gt;{{executeSolutionWithInput '1'}}&lt;/pre&gt;`,
            code: {
                pre: `integer userNum

// Program will be tested with 1, 3, 5, and {{max}}
userNum = Get next input
`
            },
            solution: `while userNum &lt; {{max}}
   Put userNum to output
   Put "_" to output
   userNum = userNum * {{multiplier}}`,
            inputs: [ '1', '3', '5', '{{max}}' ],
            explanation: '',
        },
        {
            parameters: {
                sentinel: [ '0', '1', '2' ],
                separator: [ '_', '/', ',' ]
            },
            prompt: `&lt;p&gt;Write code that iterates while userNum is greater than {{sentinel}}. Each iteration: Put userNum to output. Then, put "{{separator}}" to output. Then, assign userNum with the next input.&lt;/p&gt;
&lt;p&gt;Ex: If input is 5 7 -1, then output is:&lt;/p&gt;
&lt;pre&gt;{{executeSolutionWithInput '5 7 -1'}}&lt;/pre&gt;`,
            code: {
                pre: `integer userNum

userNum = Get next input
`
            },
            solution: `while userNum &gt; {{sentinel}}
   Put userNum to output
   Put "{{separator}}" to output
   userNum = Get next input`,
            inputs: [ '5 7 -1', '1 8 3 5 -2', '4 0' ],
            explanation: '',
        },
    ],
}
