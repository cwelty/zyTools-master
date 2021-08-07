{
    language: 'c',
    levels: [
        {
            prompt: 'Write a statement that prints the following on a single output line (without a newline):\n<code>{{prompt}}</code>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'Use printf() to print text.',
            solution: 'printf("{{prompt}}");',
            parameters: {
                prompt: ['3 2 1 Go!', 'Ready, Set, Go!', 'Hello world! How are you?', 'This is awesome!', 'I love this job', 'I like how you think', 'To be or not to be', 'So be it', 'My name is Bob', 'My name is May', 'I feel great today' ],
            },
            program: {
                prefix: `#include <stdio.h>

int main(void) {
   `,
                postfix: `
   return 0;
}`
            },
        },

        {
            prompt: 'Write code that prints the following. End each output line with a newline, using endl items.\n<pre>{{letter1}}{{number1}}\n{{letter2}}{{number2}}\n</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'You can use multiple cout statements, endl starts a new output line.',
            solution: 'printf("{{letter1}}{{number1}}\n{{letter2}}{{number2}}\n");',
            parameters: {
                letter1: [ 'A', 'B', 'C', 'D' ],
                letter2: [ 'E', 'F', 'G', 'H' ],
                number1: [ '1', '2', '3', '4' ],
                number2: [ '5', '6', '7', '8' ],
            },
            program: {
                prefix: `#include <stdio.h>

int main(void) {
   `,
                postfix: `
   return 0;
}`
            }
        }
    ]
}
