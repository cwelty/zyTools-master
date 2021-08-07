{
    language:  'python',
    levels: [
        {
            template:   'user_ages = [ {{list.elements}} ]\nprint (len(user_ages))',
            parameters: {
                list: [
                    { size: 3, elements: '4, 6, 2' },
                    { size: 4, elements: '5, 2, 7, 8' },
                    { size: 5, elements: '9, 2, 1, 5, 7' },
                    { size: 6, elements: '1, 2, 4, 5, 7, 8' },
                    { size: 7, elements: '4, 2, 6, 5, 8, 9, 4' }
                ],
            },
            explanation: 'len() returns the number of elements in a list. user_ages has {{list.size}} elements: {{list.elements}}',
        },
    ]
}
