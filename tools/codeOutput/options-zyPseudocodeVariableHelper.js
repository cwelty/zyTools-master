{
    language:  'zyPseudocode',
    levels: [
        {
            template: `integer x
integer array(3) y
x = 1
y[0] = 2
y[1] = 3
y[2] = 4`,
            parameters: {},
            explanation: `x = {{executeForFinalValueOf 'x'}}
y[0] = {{executeForFinalValueOf 'y[0]'}}
y[1] = {{executeForFinalValueOf 'y[1]'}}
y[2] = {{executeForFinalValueOf 'y[2]'}}
y = {{executeForFinalValueOf 'y'}} // Print undefined`
        },
    ]
}
