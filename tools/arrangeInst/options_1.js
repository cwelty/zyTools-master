{
    variables: ['wage', 'hours', 'pay'],
    instructions: [
        {
            code:     'wage = 10',
            sortable: false
        },
        {
            code:     'hours = 40',
            sortable: false
        },
        {
            code:     'pay = wage * hours',
            sortable: false
        },
        {
            code:     'print pay',
            sortable: true
        },
        {
            code:     'hours = 35',
            sortable: true
        },
        {
            code:     'pay = wage * hours',
            sortable: true
        }
    ]
}