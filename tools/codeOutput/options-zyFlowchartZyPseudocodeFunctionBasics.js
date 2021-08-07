{
    language:  'zyFlowchartZyPseudocode',
    levels: [
        {
            template:   'Function Main() returns nothing\n   integer ageToPrint\n   ageToPrint = {{ageToPrint}}\n   printAge(ageToPrint)\nFunction printAge(integer userAge) returns nothing\n   Put "{{personName}} is " to output\n   Put userAge to output',
            parameters: {
                personName: ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                ageToPrint: ['20', '21', '22', '23', '24']
            },
            explanation: 'ageToPrint is passed to printAge. userAge is assigned the value of ageToPrint.'
        }
    ]
}
