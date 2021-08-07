{
    language: 'cpp',
    levels: [
        {
            prompt: 'Write a statement that prints the following on a single output line (without a newline):\n<code>{{prompt}}</code>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'Use cout to print text.',
            solution: 'cout << "{{prompt}}";',
            parameters: {
                prompt: ['3 2 1 Go!', 'Ready, Set, Go!', 'Hello world! How are you?', 'This is awesome!', 'I love this job', 'I like how you think', 'To be or not to be', 'So be it', 'My name is Bob', 'My name is May', 'I feel great today' ],
            },
            program: {
                prefix: `#include <iostream>
using namespace std;

int main() {
   `,
                postfix: `
   return 0;
}`
            },
        },

        {
            prompt: 'Write code that prints the following. End each output line with a newline, using endl items.\n<pre>${letter1}${number1}\n${letter2}${number2}\n</pre>\nNote: Whitespace (blank spaces / blank lines) matters; make sure your whitespace exactly matches the expected output.',
            explanation: 'You can use multiple cout statements, endl starts a new output line.',
            solution: 'cout << "${letter1}${number1}" << endl;\ncout << "${letter2}${number2}" << endl;',
            parameters: `letters = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' ]
letter1 = pick_from(letters)
letter2 = pick_from(letters, [ letter1 ])
number1 = pick_from_range(1, 8)
number2 = pick_from_range(1, 8, [ number1 ])`,
            program: {
                prefix: `#include <iostream>
using namespace std;

int main() {
   `,
                postfix: `
   return 0;
}`
            }
        }
    ]
}
