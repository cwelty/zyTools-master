## Quiz questions

This tool supports short-answer and multiple-choice question types.

The tool options are an array of questions. Each question contains 4 properties:
* isMultipleChoice - required boolean. If true, then question is multiple choice. Otherwise, question is short answer.
* question - required string that is the question posed to the user.
    The question may also be an array in which each element is either a string or dictionary.
    Each dictionary element is an attributed string containing two required string properties:
        * type - specifies what the content is. Ex: code or html.
        * content - the content of the attributed string.
* answers - required array of strings, which are the accepted answers.
* choices - array of strings. Required when isMultipleChoice is true. The strings are displayed as choices to the user.

For example, here is 1 short answer followed by 1 multiple choice question:
```
{
    questions: [
        {
            isMultipleChoice: false,
            question:         '2 + 5 = ?',
            answers:          ['7']
        },
        {
            isMultipleChoice: true,
            question:         '2 + 5 = ?',
            choices:          ['7', '5', '3'],
            answers:          ['7']
        }
    ]
}
```

The XML format for the above example is:
```xml
<zyTool name="quizQuestions" id="replaceWithGUID" caption="Pre-chapter quiz">
    <zyOptions>
        <questions type="list">
            <item type="dict">
                <isMultipleChoice type="boolean">false</isMultipleChoice>
                <question>2 + 5 = ?</question>
                <answers type="list">
                    <item>7</item>
                </answers>
            </item>
            <item type="dict">
                <isMultipleChoice type="boolean">true</isMultipleChoice>
                <question>2 + 5 = ?</question>
                <choices type="list">
                    <item>7</item>
                    <item>5</item>
                    <item>3</item>
                </choices>
                <answers type="list">
                    <item>7</item>
                </answers>
            </item>
        </questions>
    </zyOptions>
</zyTool>
```