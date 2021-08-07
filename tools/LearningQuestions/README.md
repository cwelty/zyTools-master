## Learning questions

This tool supports multiple-choice question types.

The tool's only option is questions - an array of questions. Each question contains 3 properties:
    * question - required string that is the question posed to the user.
    * choices - required array of objects, each including properties:
        * name - required string. The name of the choice.
        * explanation - required string. The associated explanation of this choice.
    * answers - required array of strings, which are the accepted answers.

Ex:
```
{
    questions: [
        {
            question: 'A touchscreen is a touch-sensitive device layered on top of a display.',
            choices: [
                {
                    name: 'True',
                    explanation: 'Allowing a user to point directly to a graphical object is more intuitive to the user than using a separate mouse or touchpad, and eliminates the need for an external input device also.',
                },
                {
                    name: 'False',
                    explanation: 'Allowing a user to point directly to a graphical object is more intuitive to the user than using a separate mouse or touchpad, and eliminates the need for an external input device also.',
                }
            ],
            answers: [ 'True' ],
        },
    ],
}
```