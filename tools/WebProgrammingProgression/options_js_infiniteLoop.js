{
    doNotShowWebpage: true,
    levels: [
        {
            parameters: {},
            prompt: 'Fix the infinite loop... if you can!',
            files: [
                {
                    language: 'js',
                    filename: 'JS',
                    code: {
                        placeholder: `
while(1){}
console.log('Done');
`,
                    },
                },
            ],
            solution: `console.log('Done');`,
            unitTests: [
                `{{{code}}}
                zyTestConsoleLog('Did you fix it?');`,
                `while(1){}
                zyTestConsoleLog("Can't fix this");`,
                `while(1){}
                zyTestConsoleLog("Can't fix this");`,
                `while(1){}
                zyTestConsoleLog("Can't fix this");`,
            ],
        },
    ],
}