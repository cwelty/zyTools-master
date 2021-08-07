{
    doNotShowWebpage: true,
    levels: [
        {
            parameters: {},
            prompt: 'Write a setInterval() function that increases the count by 1 and displays the new count in counterElement every 100 milliseconds. Call clearInterval() to cancel the interval when the count displays 3.',
            files: [
                {
                    language: 'html',
                    filename: 'HTML',
                    code: {
                        prefix: `Progress:
&lt;p id="counter"&gt;&lt;/p&gt;`
                    },
                },
                {
                    language: 'js',
                    filename: 'JS',
                    code: {
                        prefix: `var count = 0;
var counterElement = document.getElementById("counter");
counterElement.innerHTML = count;
`,
                        placeholder: `
&lt;STUDENT_CODE&gt;
`
                    },
                }
            ],
            solution: `var timerId = setInterval(updateCount, 100);

function updateCount() {
   count++;
   counterElement.innerHTML = count;

   if (count == 3) {
      clearInterval(timerId);
   }
}`,
            unitTests: `zyAsync(3);
var counterElement = document.getElementById("counter");

setTimeout(function() {
    zyTest(counterElement.innerHTML, 'Checking counterElement.innerHTML when interval is halfway complete.');
}, 3 / 2 * 100);

setTimeout(function() {
   zyTest(counterElement.innerHTML, 'Checking counterElement.innerHTML when interval is cancelled.');
}, 3 * 100 + 20);

setTimeout(function() {
   zyTest(counterElement.innerHTML, 'Checking counterElement.innerHTML shortly after interval is cancelled.');
}, 3 * 100 + 100 + 20);`,
        },
    ],
}