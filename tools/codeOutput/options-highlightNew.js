{
    language:  'cpp',
    highlightNew: true,
    levels: [
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   cout << "{{personName}}";\n   cout << " is ";\n   cout << "{{personStatus}}.";\n\n   return 0;\n}',
            parameters: {
                personName:   ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personStatus: ['good', 'great', 'nice', 'happy']
            },
            explanation: 'Level 1 explanation'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   // New: Not actually new! (should highlight)\n   cout << "{{personName}}" << endl;\n   cout << "is" << endl;\n   cout << "{{personStatus}}.";\n\n   return 0;\n}',
            parameters: {
                personName:   ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personStatus: ['good', 'great', 'nice', 'happy']
            },
            explanation: 'Level 2 explanation'
        },
        {
            template:   '#include <iostream>\nusing namespace std;\n\nint main() {\n   // New: Added variable.\n   int personAge = {{personAge}};\n   \n   cout << "{{personName}} is ";\n   // New: Output variable.\n   cout << personAge;\n   cout << ".";\n\n   return 0;\n}',
            parameters: {
                personName: ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personAge:  [18, 19, 20, 21, 22, 23, 24]
            },
            explanation: 'Level 3 explanation'
        },
        {
            template:   '// Should have no highlighting\n#include <iostream>\nusing namespace std;\n\nint main() {\n   int personAge = {{personAge}};\n   \n   cout << "{{personName}} is ";\n   cout << personAge;\n   cout << ".";\n\n   return 0;\n}',
            parameters: {
                personName: ['Ann', 'Sam', 'Bob', 'Joe', 'Ron'],
                personAge:  [18, 19, 20, 21, 22, 23, 24]
            },
            explanation: 'Level 4 explanation'
        }
    ]
}
