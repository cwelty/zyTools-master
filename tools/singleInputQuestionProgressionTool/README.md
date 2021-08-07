## Single input question progression tool template

The template contains defined behavior for a progression tool, including the behavior after each button is clicked.

The other tool must specify 2 options:
* css - the other tool's specific CSS
* questionFactory - the other tool's specific QuestionFactory object. See below for how to create a QuestionFactory object.

Ex: from inside the other tool's init function:
```javascript
require('singleInputQuestionProgressionTool').create().init(this.id, this.parentResource, {
    css:       css,
    questionFactory: this.questionFactory
});
```

The other tool must have 1 `input` DOM element, used to get the user input.

The other tool can create a new QuestionFactory object:
`require('singleInputQuestionProgressionTool').getNewQuestionFactory()`

The other tool can create a new Question object:
`require('singleInputQuestionProgressionTool').getNewQuestion()`