{
    language:  'cpp',
    globalCode: `personName = pick_from(['Ann', 'Sam', 'Bob', 'Joe', 'Ron'])
personStatus = pick_from(['good', 'great', 'nice', 'happy'])`,
    levels: [
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "${personName} is ${personStatus}.";\n\n   return 0;\n}',
            explanation: '&lt;This is a very long example explanation that needs to be broken automatically to avoid making the tool even wider just because of this explanation.&gt;'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "{{personName}}";\n   cout << " is ";\n   cout << "{{personStatus}}.";\n\n   return 0;\n}',
            parameters: {
                personName:   [ 'Ann', 'Sam', 'Bob', 'Joe', 'Ron' ],
                personStatus: [ 'good', 'great', 'nice', 'happy' ]
            },
            explanation: '1\n2\n\n3\n\n\n4'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "${personName}" << endl;\n   cout << "is" << endl;\n   cout << "${personStatus}.";\n\n   return 0;\n}',
            explanation: 'Adding \'endl\' to the output adds a newline.'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   int personAge = ${personAge};\n   \n   cout << "${personName} is ";\n   cout << personAge;\n   cout << ".";\n\n   return 0;\n}',
            parameters: `personAge = pick_from_range(16, 65)`,
            explanation: '\'cout << personAge\' prints the value of the variable: ${personAge}.'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   int personAge = ${personAge};\n\n   cout << "${personName} is " << personAge << "years.";\n\n   return 0;\n}',
            parameters: `personAge = pick_from_range(16, 65)`,
            explanation: '\'personAge\' is substituted by it\'s value: ${personAge}.\nNotice there\'s no space after the variable value.'
        }
    ]
}
