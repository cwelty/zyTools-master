{
    doNotShowWebpage: true,
    levels: [
        {
            parameters: {},
            prompt: 'Use setTimeout to call function timerOver after waitTime variable number of milliseconds',
            files: [
                {
                    language: 'js',
                    filename: 'JS',
                    code: {
                        prefix: `function timerOver() {
    console.log("Done");
}
var waitTime = 500; // Testing will vary this value.

setTimeout(
`,
                        placeholder: `
   &lt;STUDENT_CODE&gt;
`,
                        postfix: `
);
`
                    },
                },
            ],
            solution: `function() {
   timerOver();
}, waitTime`,
            unitTests: `zyAsync(3);

zyTestConsoleLog('Testing log as setTimeout starts.');

setTimeout(function(){
    zyTestConsoleLog('Testing log just before setTimeout should finish.');
}, waitTime - 3);

setTimeout(function(){
    zyTestConsoleLog('Testing log when setTimeout should finish.');
}, waitTime);`,
        },
    ],
}